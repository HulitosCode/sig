import { cache } from 'react'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Sessão actual (memoizada por request).
export const getSession = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session ?? null
  } catch {
    return null
  }
})

// Usuário autenticado ou redirect para /entrar.
export async function requireUser(next?: string) {
  await connection() // força renderização a pedido (auth nunca é estática)
  const session = await getSession()
  if (!session?.user) {
    redirect(next ? `/entrar?next=${encodeURIComponent(next)}` : '/entrar')
  }
  return session.user
}

// Apenas admin — lança redirect para a home se não for admin.
export async function requireAdmin() {
  await connection()
  const user = await requireUser('/admin')
  if (user.role !== 'admin') {
    redirect('/')
  }
  return user
}

// Verificação barata para server actions (devolve booleano).
export async function isAdminUser(): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === 'admin'
}

// Motorista do utilizador actual com perfil completo (ou null).
export async function getMotoristaPerfil(userId: string) {
  return prisma.motorista.findUnique({
    where: { userId },
    include: {
      pagamentos: { orderBy: { criadoEm: 'desc' } },
    },
  })
}
