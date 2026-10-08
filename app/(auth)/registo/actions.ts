'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export type ContaResult = { success: boolean; message?: string }

/**
 * Pós-registo (após authClient.signUp.email + sessão criada).
 * - Cliente: passa o papel para "cliente".
 * - Motorista: cria o registo de motorista com telefone/whatsapp
 *   (resto do perfil + documentos entram no modal de verificação do painel).
 */
export async function posRegistoAction(input: {
  tipo: 'motorista' | 'cliente'
  telefone?: string
  whatsapp?: string
}): Promise<ContaResult> {
  const session = await getSession()
  if (!session?.user) {
    return { success: false, message: 'Sessão expirada. Entre novamente.' }
  }

  const userId = session.user.id
  const telefone = (input.telefone ?? '').trim()
  const whatsapp = (input.whatsapp ?? '').trim()

  try {
    if (input.tipo === 'cliente') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'cliente' },
      })
    } else if (telefone.length >= 9) {
      // Cria a linha do motorista já com contacto; os campos vazios são
      // preenchidos no modal de verificação antes de ficar visível.
      await prisma.motorista.upsert({
        where: { userId },
        update: {}, // nunca sobrescreve um perfil já existente
        create: {
          userId,
          telefone,
          whatsapp: whatsapp || null,
          praca: '',
          tipoViatura: '',
          matricula: '',
          cargaMax: '',
          servicos: [],
        },
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('[Registo] posRegistoAction:', error)
    return {
      success: false,
      message: 'Conta criada, mas falhou a configuração inicial. Contacte o suporte.',
    }
  }
}
