'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

type ActionState = { success?: boolean; message?: string }

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
