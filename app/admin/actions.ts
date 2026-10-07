'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { VALOR_MENSALIDADE_MT } from '@/lib/freta'

type ActionState = { success?: boolean; message?: string }

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'admin') {
    return null
  }
  return session.user
}

// Confirma o perfil do motorista (verificação presencial na praça).
export async function aprovarMotoristaAction(motoristaId: number): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    await prisma.motorista.update({
      where: { id: motoristaId },
      data: { status: 'ativo' },
    })
    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true, message: 'Perfil aprovado. Já aparece nas pesquisas.' }
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
      data: { status: 'pendente' },
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

// Remove o motorista (e os seus dados dependentes).
export async function removerMotoristaAction(motoristaId: number): Promise<ActionState> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, message: 'Sem permissões de admin.' }

  try {
    await prisma.motorista.delete({ where: { id: motoristaId } })
    revalidatePath('/admin')
    revalidatePath('/admin/motoristas')
    return { success: true, message: 'Motorista removido.' }
  } catch {
    return { success: false, message: 'Motorista não encontrado.' }
  }
}

const pagamentoSchema = z.object({
  motoristaId: z.coerce.number().int().positive(),
  meses: z.coerce.number().int().min(1).max(12),
})

// Regista a confirmação de pagamento da mensalidade (120 MT/mês).
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
