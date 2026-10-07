'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { PRACAS, SERVICOS } from '@/lib/freta'

type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

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
// Edição do próprio perfil (página /motorista/perfil)
// ---------------------------------------------------------------------------

const servicoValues = SERVICOS.map((s) => s.value) as [string, ...string[]]

const meuPerfilSchema = z.object({
  nome: z.string().min(3, 'Indique o seu nome completo.').max(80),
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
  fotoUrl: z
    .string()
    .url('Link inválido.')
    .max(300)
    .optional()
    .or(z.literal('')),
})

// Actualiza o perfil e o nome da conta do utilizador da sessão.
export async function atualizarMeuPerfilAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.user) {
    return { success: false, message: 'Sessão expirada. Entre novamente.' }
  }

  const raw = {
    nome: ((formData.get('nome') as string) ?? '').trim(),
    telefone: ((formData.get('telefone') as string) ?? '').trim(),
    whatsapp: ((formData.get('whatsapp') as string) ?? '').trim(),
    praca: formData.get('praca') as string,
    tipoViatura: ((formData.get('tipoViatura') as string) ?? '').trim(),
    matricula: ((formData.get('matricula') as string) ?? '').trim(),
    cargaMax: ((formData.get('cargaMax') as string) ?? '').trim(),
    servicos: formData.getAll('servicos').map(String),
    precoKm: ((formData.get('precoKm') as string) ?? '').trim(),
    observacoes: ((formData.get('observacoes') as string) ?? '').trim(),
    fotoUrl: ((formData.get('fotoUrl') as string) ?? '').trim(),
  }

  const validated = meuPerfilSchema.safeParse(raw)
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

  const { nome, ...perfil } = validated.data
  const dados = {
    telefone: perfil.telefone,
    whatsapp: perfil.whatsapp || null,
    praca: perfil.praca,
    tipoViatura: perfil.tipoViatura,
    matricula: perfil.matricula,
    cargaMax: perfil.cargaMax,
    servicos: perfil.servicos,
    precoKm: perfil.precoKm || null,
    observacoes: perfil.observacoes || null,
    fotoUrl: perfil.fotoUrl || null,
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { name: nome },
      }),
      prisma.motorista.upsert({
        where: { userId: session.user.id },
        update: dados,
        create: { userId: session.user.id, ...dados },
      }),
    ])

    revalidatePath('/motorista')
    revalidatePath('/motorista/perfil')
    return { success: true, message: 'Perfil actualizado.' }
  } catch (error) {
    console.error('[Motorista] Falha ao actualizar perfil:', error)
    return {
      success: false,
      message: 'Não foi possível guardar o perfil. Tente novamente.',
    }
  }
}
