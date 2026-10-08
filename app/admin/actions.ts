'use server'

import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { VALOR_MENSALIDADE_MT, PRACAS, SERVICOS } from '@/lib/freta'
import {
  sendMotoristaVerificadoEmail,
  sendMotoristaRejeitadoEmail,
} from '@/lib/email'

type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'admin') {
    return null
  }
  return session.user
}

// Aprova a verificação do perfil (grava selo, data e admin responsável).
export async function aprovarMotoristaAction(motoristaId: number): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    const motorista = await prisma.motorista.update({
      where: { id: motoristaId },
      data: {
        status: 'ativo',
        verificadoEm: new Date(),
        verificadoPor: admin.id,
        rejeicaoMotivo: null,
      },
      include: { user: { select: { name: true, email: true } } },
    })

    // Notifica o motorista (fire-and-forget — não atrasa a resposta).
    after(() =>
      sendMotoristaVerificadoEmail(motorista.user.email, motorista.user.name).catch(
        (err) => console.error('[Email] Verificado:', err)
      )
    )

    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    revalidatePath('/motorista')
    revalidatePath('/motorista/perfil')
    return { success: true, message: 'Perfil verificado. Já aparece nas pesquisas.' }
  } catch {
    return { success: false, message: 'Motorista não encontrado.' }
  }
}

// Rejeita os documentos enviados, com motivo (o motorista é notificado).
export async function rejeitarVerificacaoAction(
  motoristaId: number,
  motivo: string
): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  const texto = motivo.trim()
  if (texto.length < 5) {
    return { success: false, message: 'Indique o motivo da rejeição (mín. 5 caracteres).' }
  }

  try {
    const motorista = await prisma.motorista.update({
      where: { id: motoristaId },
      data: {
        status: 'pendente',
        rejeicaoMotivo: texto,
        verificadoEm: null,
        verificadoPor: null,
      },
      include: { user: { select: { name: true, email: true } } },
    })

    after(() =>
      sendMotoristaRejeitadoEmail(
        motorista.user.email,
        motorista.user.name,
        texto
      ).catch((err) => console.error('[Email] Rejeição:', err))
    )

    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    revalidatePath('/motorista')
    revalidatePath('/motorista/perfil')
    return { success: true, message: 'Documentos rejeitados. O motorista foi notificado.' }
  } catch {
    return { success: false, message: 'Motorista não encontrado.' }
  }
}

// Rejeita/devolve o perfil para correção.
export async function rejeitarMotoristaAction(motoristaId: number): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    await prisma.motorista.update({
      where: { id: motoristaId },
      data: { status: 'pendente', verificadoEm: null, verificadoPor: null },
    })
    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true, message: 'Perfil devolvido para pendente.' }
  } catch {
    return { success: false, message: 'Motorista não encontrado.' }
  }
}

// Bloqueia/desbloqueia o motorista.
export async function bloquearMotoristaAction(
  motoristaId: number,
  bloquear: boolean
): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    await prisma.motorista.update({
      where: { id: motoristaId },
      data: { status: bloquear ? 'bloqueado' : 'ativo' },
    })
    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true }
  } catch {
    return { success: false, message: 'Motorista não encontrado.' }
  }
}

// Remove o motorista (a conta utilizadora sai em cascata — sessões,
// credenciais, pagamentos e avaliações; os pedidos ficam sem motorista).
export async function removerMotoristaAction(motoristaId: number): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    const motorista = await prisma.motorista.findUnique({
      where: { id: motoristaId },
      select: { userId: true },
    })
    if (!motorista) return { success: false, message: 'Motorista não encontrado.' }

    // Apagar o utilizador remove o perfil em cascata (onDelete: Cascade).
    await prisma.user.delete({ where: { id: motorista.userId } })
    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true, message: 'Motorista e conta removidos.' }
  } catch {
    return { success: false, message: 'Não foi possível remover o motorista.' }
  }
}

const pagamentoSchema = z.object({
  motoristaId: z.coerce.number().int().positive(),
  meses: z.coerce.number().int().min(1).max(12),
})

// Regista a confirmação de pagamento da mensalidade (VALOR_MENSALIDADE_MT).
export async function confirmarPagamentoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  const validated = pagamentoSchema.safeParse({
    motoristaId: formData.get('motoristaId'),
    meses: formData.get('meses') ?? 1,
  })
  if (!validated.success) {
    return { success: false, message: 'Dados de pagamento inválidos.' }
  }

  const { motoristaId, meses } = validated.data

  try {
    const motorista = await prisma.motorista.findUnique({
      where: { id: motoristaId },
      select: { id: true, status: true, pagamentos: { orderBy: { criadoEm: 'desc' }, take: 1 } },
    })
    if (!motorista) {
      return { success: false, message: 'Motorista não encontrado.' }
    }

    const agora = new Date()
    // Continua do fim do período pago actual (se ainda válido).
    const ultimo = motorista.pagamentos[0]
    const base =
      ultimo?.status === 'confirmado' && ultimo.validoAte && ultimo.validoAte > agora
        ? ultimo.validoAte
        : agora
    const validoAte = new Date(base)
    validoAte.setMonth(validoAte.getMonth() + meses)

    await prisma.$transaction([
      prisma.pagamento.create({
        data: {
          motoristaId,
          valor: VALOR_MENSALIDADE_MT * meses,
          status: 'confirmado',
          pagoEm: agora,
          confirmadoPor: admin.id,
          validoAte,
        },
      }),
      // Pagamento confirmado → activa o perfil se ainda estiver pendente.
      prisma.motorista.update({
        where: { id: motoristaId },
        data: motorista.status === 'pendente' ? { status: 'ativo' } : {},
      }),
    ])

    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return {
      success: true,
      message: `Pagamento confirmado. Válido até ${validoAte.toLocaleDateString('pt-PT')}.`,
    }
  } catch (error) {
    console.error('[Admin] Falha ao confirmar pagamento:', error)
    return { success: false, message: 'Não foi possível registar o pagamento.' }
  }
}

// ---------------------------------------------------------------------------
// CRUD de motoristas (formulários com modais)
// ---------------------------------------------------------------------------

const servicoValues = SERVICOS.map((s) => s.value) as [string, ...string[]]

const perfilMotoristaFields = {
  telefone: z
    .string()
    .min(9, 'Indique um telefone válido (ex.: 84 123 4567).')
    .max(20),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  praca: z.enum(PRACAS, { message: 'Escolha a praça.' }),
  tipoViatura: z.string().min(2, 'Indique o tipo de viatura.').max(80),
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
}

const criarMotoristaSchema = z.object({
  nome: z.string().min(3, 'Indique o nome completo.').max(80),
  email: z.string().email('Email inválido.').max(120),
  password: z
    .string()
    .min(8, 'A palavra-passe precisa de pelo menos 8 caracteres.')
    .max(100),
  ...perfilMotoristaFields,
})

const editarMotoristaSchema = z.object({
  motoristaId: z.coerce.number().int().positive(),
  nome: z.string().min(3, 'Indique o nome completo.').max(80),
  ...perfilMotoristaFields,
})

function lerPerfil(formData: FormData) {
  return {
    telefone: ((formData.get('telefone') as string) ?? '').trim(),
    whatsapp: ((formData.get('whatsapp') as string) ?? '').trim(),
    praca: formData.get('praca') as string,
    tipoViatura: ((formData.get('tipoViatura') as string) ?? '').trim(),
    matricula: ((formData.get('matricula') as string) ?? '').trim(),
    cargaMax: ((formData.get('cargaMax') as string) ?? '').trim(),
    servicos: formData.getAll('servicos').map(String),
    precoKm: ((formData.get('precoKm') as string) ?? '').trim(),
    observacoes: ((formData.get('observacoes') as string) ?? '').trim(),
  }
}

function errosDeCampo(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  // zod v4 tipa flatten() de forma genérica em ZodError sem parâmetro.
  const porCampo = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >
  for (const [key, value] of Object.entries(porCampo)) {
    if (value) fieldErrors[key] = value
  }
  return fieldErrors
}

// Cria um motorista completo: conta com palavra-passe + perfil (pendente).
export async function criarMotoristaAction(
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  const validated = criarMotoristaSchema.safeParse({
    nome: ((formData.get('nome') as string) ?? '').trim(),
    email: ((formData.get('email') as string) ?? '').trim().toLowerCase(),
    password: (formData.get('password') as string) ?? '',
    ...lerPerfil(formData),
  })
  if (!validated.success) {
    return {
      success: false,
      message: 'Verifique os erros do formulário.',
      errors: errosDeCampo(validated.error),
    }
  }

  const { nome, email, password, ...perfil } = validated.data

  try {
    const existente = await prisma.user.findUnique({ where: { email } })
    if (existente) {
      return {
        success: false,
        message: 'Este email já está registado.',
        errors: { email: ['Este email já está registado.'] },
      }
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: randomUUID(),
          name: nome,
          email,
          emailVerified: true,
          role: 'motorista',
        },
      })
      await tx.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: await hashPassword(password),
        },
      })
      await tx.motorista.create({
        data: {
          userId: user.id,
          telefone: perfil.telefone,
          whatsapp: perfil.whatsapp || null,
          praca: perfil.praca,
          tipoViatura: perfil.tipoViatura,
          matricula: perfil.matricula,
          cargaMax: perfil.cargaMax,
          servicos: perfil.servicos,
          precoKm: perfil.precoKm || null,
          observacoes: perfil.observacoes || null,
        },
      })
    })

    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true, message: `Motorista ${nome} criado (perfil pendente).` }
  } catch (error) {
    console.error('[Admin] Falha ao criar motorista:', error)
    return { success: false, message: 'Não foi possível criar o motorista.' }
  }
}

// Edita dados do motorista e o nome na conta.
export async function atualizarMotoristaAction(
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  const validated = editarMotoristaSchema.safeParse({
    motoristaId: formData.get('motoristaId'),
    nome: ((formData.get('nome') as string) ?? '').trim(),
    ...lerPerfil(formData),
  })
  if (!validated.success) {
    return {
      success: false,
      message: 'Verifique os erros do formulário.',
      errors: errosDeCampo(validated.error),
    }
  }

  const { motoristaId, nome, ...perfil } = validated.data

  try {
    const motorista = await prisma.motorista.findUnique({
      where: { id: motoristaId },
      select: { userId: true },
    })
    if (!motorista) return { success: false, message: 'Motorista não encontrado.' }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: motorista.userId },
        data: { name: nome },
      }),
      prisma.motorista.update({
        where: { id: motoristaId },
        data: {
          telefone: perfil.telefone,
          whatsapp: perfil.whatsapp || null,
          praca: perfil.praca,
          tipoViatura: perfil.tipoViatura,
          matricula: perfil.matricula,
          cargaMax: perfil.cargaMax,
          servicos: perfil.servicos,
          precoKm: perfil.precoKm || null,
          observacoes: perfil.observacoes || null,
        },
      }),
    ])

    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true, message: 'Dados actualizados.' }
  } catch (error) {
    console.error('[Admin] Falha ao actualizar motorista:', error)
    return { success: false, message: 'Não foi possível guardar as alterações.' }
  }
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

// Remove um pedido (cancelamento/dados obsoletos).
export async function removerPedidoAction(pedidoId: number): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    await prisma.pedido.delete({ where: { id: pedidoId } })
    revalidatePath('/admin')
    revalidatePath('/admin/pedidos')
    return { success: true, message: 'Pedido removido.' }
  } catch {
    return { success: false, message: 'Pedido não encontrado.' }
  }
}
