'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { PRACAS, SERVICOS } from '@/lib/freta'
import { deleteUploadedImage } from '@/lib/uploadthing'
import { sendVerificationSubmittedEmail } from '@/lib/email'

type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// Disponibilidade
// ---------------------------------------------------------------------------

// Alterna o estado de disponibilidade do motorista.
export async function setDisponibilidadeAction(
  disponibilidade: 'disponivel' | 'ocupado' | 'indisponivel'
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.user) {
    return { success: false, message: 'Sessão expirada.' }
  }

  try {
    await prisma.motorista.update({
      where: { userId: session.user.id },
      data: { disponibilidade },
    })
    revalidatePath('/motorista')
    return { success: true }
  } catch {
    return { success: false, message: 'Perfil de motorista não encontrado.' }
  }
}

// ---------------------------------------------------------------------------
// Verificação: perfil + documentos (modal do painel)
// ---------------------------------------------------------------------------

const servicoValues = SERVICOS.map((s) => s.value) as [string, ...string[]]

const urlOuVazio = z
  .string()
  .url('Link inválido.')
  .max(400)
  .optional()
  .or(z.literal(''))

const verificacaoSchema = z
  .object({
    nome: z.string().min(3, 'Indique o seu nome completo.').max(80),
    telefone: z
      .string()
      .min(9, 'Indique um telefone válido (ex.: 84 123 4567).')
      .max(20),
    whatsapp: z.string().max(20).optional().or(z.literal('')),
    praca: z.enum(PRACAS, { message: 'Escolha a praça.' }),
    tipoViatura: z.string().min(2, 'Indique o tipo de carro.').max(80),
    modelo: z.string().max(80).optional().or(z.literal('')),
    ano: z.string().max(4).optional().or(z.literal('')),
    matricula: z.string().min(2, 'Indique a matrícula.').max(20),
    cargaMax: z.string().min(1, 'Indique a capacidade de carga.').max(40),
    servicos: z
      .array(z.string())
      .min(1, 'Escolha pelo menos um serviço.')
      .refine((vals) => vals.every((v) => servicoValues.includes(v)), {
        message: 'Serviço inválido.',
      }),
    precoKm: z.string().max(40).optional().or(z.literal('')),
    observacoes: z.string().max(500).optional().or(z.literal('')),
    fotoUrl: urlOuVazio,
    // Documentos (BI + fotos do carro)
    biFrenteUrl: urlOuVazio,
    biVersoUrl: urlOuVazio,
    fotoFrenteUrl: urlOuVazio,
    fotoEsquerdaUrl: urlOuVazio,
    fotoDireitaUrl: urlOuVazio,
    fotoTraseiraUrl: urlOuVazio,
  })
  .superRefine((data, ctx) => {
    if (data.ano) {
      const max = new Date().getFullYear() + 1
      const n = Number(data.ano)
      if (!/^\d{4}$/.test(data.ano) || n < 1900 || n > max) {
        ctx.addIssue({
          code: 'custom',
          path: ['ano'],
          message: `Ano inválido (1900–${max}).`,
        })
      }
    }
  })

const DOC_FIELDS = [
  'biFrenteUrl',
  'biVersoUrl',
  'fotoFrenteUrl',
  'fotoEsquerdaUrl',
  'fotoDireitaUrl',
  'fotoTraseiraUrl',
] as const

// Todos os campos de imagem do motorista (docs + fotografia de perfil).
// Qualquer imagem removida/substituída tem de sair também do UploadThing.
const CAMPOS_IMAGEM = [
  'fotoUrl',
  'biFrenteUrl',
  'biVersoUrl',
  'fotoFrenteUrl',
  'fotoEsquerdaUrl',
  'fotoDireitaUrl',
  'fotoTraseiraUrl',
] as const

/**
 * Guarda o perfil completo do motorista + documentos.
 * Se ainda não está verificado (status ≠ "ativo"), exige todas as imagens,
 * marca `documentosEnviadosEm` e notifica o admin por email.
 */
export async function submeterVerificacaoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.user) {
    return { success: false, message: 'Sessão expirada. Entre novamente.' }
  }
  const userId = session.user.id
  const userEmail = session.user.email

  const str = (name: string) => ((formData.get(name) as string) ?? '').trim()

  const raw = {
    nome: str('nome'),
    telefone: str('telefone'),
    whatsapp: str('whatsapp'),
    praca: formData.get('praca') as string,
    tipoViatura: str('tipoViatura'),
    modelo: str('modelo'),
    ano: str('ano'),
    matricula: str('matricula'),
    cargaMax: str('cargaMax'),
    servicos: formData.getAll('servicos').map(String),
    precoKm: str('precoKm'),
    observacoes: str('observacoes'),
    fotoUrl: str('fotoUrl'),
    biFrenteUrl: str('biFrenteUrl'),
    biVersoUrl: str('biVersoUrl'),
    fotoFrenteUrl: str('fotoFrenteUrl'),
    fotoEsquerdaUrl: str('fotoEsquerdaUrl'),
    fotoDireitaUrl: str('fotoDireitaUrl'),
    fotoTraseiraUrl: str('fotoTraseiraUrl'),
  }

  const validated = verificacaoSchema.safeParse(raw)
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(
      validated.error.flatten().fieldErrors
    )) {
      if (value) fieldErrors[key] = value
    }
    return {
      success: false,
      message: 'Verifique os erros do formulário.',
      errors: fieldErrors,
    }
  }

  try {
    const existente = await prisma.motorista.findUnique({ where: { userId } })
    // Quem ainda não está "ativo" precisa enviar BI + fotos do carro.
    const exigirDocs = !existente || existente.status !== 'ativo'

    if (exigirDocs) {
      const faltas: Record<string, string[]> = {}
      for (const campo of DOC_FIELDS) {
        if (!validated.data[campo]) {
          faltas[campo] = ['Obrigatório — envie a imagem.']
        }
      }
      if (Object.keys(faltas).length > 0) {
        return {
          success: false,
          message: 'Falta enviar o BI e as fotos do veículo.',
          errors: faltas,
        }
      }
    }

    const { nome, ...perfil } = validated.data

    const docs = Object.fromEntries(
      DOC_FIELDS.map((campo) => [
        campo,
        // Envia o novo valor; vazio mantém o que já existia.
        (perfil[campo] as string) || (existente?.[campo] as string | null) || null,
      ])
    ) as Record<(typeof DOC_FIELDS)[number], string | null>

    const dados = {
      telefone: perfil.telefone,
      whatsapp: perfil.whatsapp || null,
      praca: perfil.praca,
      tipoViatura: perfil.tipoViatura,
      modelo: perfil.modelo || null,
      ano: perfil.ano ? Number(perfil.ano) : null,
      matricula: perfil.matricula,
      cargaMax: perfil.cargaMax,
      servicos: perfil.servicos,
      precoKm: perfil.precoKm || null,
      observacoes: perfil.observacoes || null,
      fotoUrl: perfil.fotoUrl || null,
      ...docs,
      ...(exigirDocs
        ? { documentosEnviadosEm: new Date(), rejeicaoMotivo: null }
        : {}),
    }

    // Notifica o admin no primeiro envio ou após uma rejeição (não spamma).
    const deveNotificar =
      exigirDocs &&
      Boolean(!existente?.documentosEnviadosEm || existente.rejeicaoMotivo)

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { name: nome } }),
      prisma.motorista.upsert({
        where: { userId },
        update: dados,
        create: { userId, ...dados },
      }),
    ])

    // Imagens substituídas ou removidas nesta submissão saem do UploadThing
    // (rede de segurança para o cliente não deixar ficheiros órfãos).
    const imagensSubstituidas = CAMPOS_IMAGEM.flatMap((campo) => {
      const antigo = existente?.[campo] ?? null
      const actual = dados[campo] ?? null
      return antigo && antigo !== actual ? [antigo] : []
    })
    if (imagensSubstituidas.length > 0) {
      after(() =>
        Promise.all(imagensSubstituidas.map(deleteUploadedImage))
      )
    }

    if (deveNotificar) {
      const destino = process.env.ADMIN_NOTIF_EMAIL || process.env.ADMIN_EMAIL
      if (destino) {
        after(() =>
          sendVerificationSubmittedEmail(destino, nome, userEmail).catch(
            (err) => console.error('[Email] Notificação de verificação:', err)
          )
        )
      }
    }

    revalidatePath('/motorista')
    revalidatePath('/motorista/perfil')
    revalidatePath('/admin/motoristas')

    return {
      success: true,
      message: exigirDocs
        ? 'Documentos enviados! Aguarda a validação do admin.'
        : 'Perfil actualizado.',
    }
  } catch (error) {
    console.error('[Motorista] Falha na submissão de verificação:', error)
    return {
      success: false,
      message: 'Não foi possível guardar. Tente novamente.',
    }
  }
}

// Remove uma imagem de um slot de upload (fotos do próprio perfil ou uploads
// ainda não submetidos). Qualquer remoção apaga o ficheiro no UploadThing.
export async function removerImagemAction(url: string): Promise<void> {
  try {
    const session = await getSession()
    if (!session?.user || !url) return

    const motorista = await prisma.motorista.findUnique({
      where: { userId: session.user.id },
    })

    const minha = motorista
      ? CAMPOS_IMAGEM.some((campo) => motorista[campo] === url)
      : false

    // Nunca apagar imagens referenciadas noutro perfil.
    const emUsoNoutro = await prisma.motorista.findFirst({
      where: {
        ...(motorista ? { NOT: { id: motorista.id } } : {}),
        OR: CAMPOS_IMAGEM.map((campo) => ({ [campo]: url })),
      },
      select: { id: true },
    })
    if (emUsoNoutro) return

    // Ficheiro próprio ou não referenciado por ninguém (upload recém-feito
    // que o utilizador substituiu/removeu antes de submeter) — sai do UT.
    await deleteUploadedImage(url)

    if (minha && motorista) {
      await prisma.motorista.update({
        where: { userId: session.user.id },
        data: Object.fromEntries(
          CAMPOS_IMAGEM.map((campo) => [
            campo,
            motorista[campo] === url ? null : motorista[campo],
          ])
        ),
      })
      revalidatePath('/motorista')
      revalidatePath('/motorista/perfil')
    }
  } catch (error) {
    console.error('[Motorista] removerImagemAction:', error)
  }
}
