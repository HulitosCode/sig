'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { SERVICOS, PRACAS } from '@/lib/freta'

type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

const servicoValues = SERVICOS.map((s) => s.value) as [string, ...string[]]

export const motoristaProfileSchema = z.object({
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

// Cria (ou actualiza) o perfil de motorista do utilizador da sessão.
export async function saveMotoristaProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.user) {
    return { success: false, message: 'Sessão expirada. Entre novamente.' }
  }

  const raw = {
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

  const validated = motoristaProfileSchema.safeParse(raw)
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(
      validated.error.flatten().fieldErrors
    )) {
      if (value) fieldErrors[key] = value
    }
    return { success: false, message: 'Verifique os erros do formulário.', errors: fieldErrors }
  }

  const data = {
    telefone: validated.data.telefone,
    whatsapp: validated.data.whatsapp || null,
    praca: validated.data.praca,
    tipoViatura: validated.data.tipoViatura,
    matricula: validated.data.matricula,
    cargaMax: validated.data.cargaMax,
    servicos: validated.data.servicos,
    precoKm: validated.data.precoKm || null,
    observacoes: validated.data.observacoes || null,
    fotoUrl: validated.data.fotoUrl || null,
  }

  try {
    const existente = await prisma.motorista.findUnique({
      where: { userId: session.user.id },
    })

    if (existente) {
      await prisma.motorista.update({
        where: { userId: session.user.id },
        data,
      })
    } else {
      await prisma.motorista.create({
        data: { userId: session.user.id, ...data },
      })
    }

    revalidatePath('/motorista')
    return { success: true, message: 'Perfil guardado. Aguarda verificação do admin.' }
  } catch (error) {
    console.error('[Registo] Falha ao guardar perfil:', error)
    return { success: false, message: 'Não foi possível guardar o perfil. Tente novamente.' }
  }
}
