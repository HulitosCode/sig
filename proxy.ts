import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { auth } from '@/lib/auth'

// Protecção de rotas autenticadas (Next.js 16: middleware → proxy).
//
// A validação é feita AQUI, antes do render, para garantir um redirect
// HTTP real (307). Se fosse feita apenas nos layouts/páginas, o shell do
// HTML já teria sido transmitido com status 200 e o redirect sairia só
// via client-router (com vazamento do conteúdo no HTML inicial).
// As verificações em requireUser/requireAdmin mantêm-se como defesa em
// profundidade (ex.: server actions).

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isMotorista = pathname.startsWith('/motorista')
  const isAdmin = pathname.startsWith('/admin')
  const isCliente = pathname.startsWith('/cliente')

  if (!isMotorista && !isAdmin && !isCliente) {
    return NextResponse.next()
  }

  // Sem cookie → nem tocar na base de dados.
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    const redirect = new URL('/entrar', request.url)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  // Com cookie → validar a sessão mesmo (pode estar expirada/revogada).
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null
  try {
    session = await auth.api.getSession({ headers: request.headers })
  } catch {
    session = null
  }

  if (!session?.user) {
    const redirect = new URL('/entrar', request.url)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  // Área admin: exigir papel admin.
  if (isAdmin && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const role = session.user.role ?? 'motorista'

  // Área do cliente: só clientes (e admin); um motorista vai ao seu painel.
  if (isCliente && role !== 'cliente' && role !== 'admin') {
    return NextResponse.redirect(new URL('/motorista', request.url))
  }

  // O painel do motorista não é para clientes — levam-no ao seu painel.
  if (isMotorista && role === 'cliente') {
    return NextResponse.redirect(new URL('/cliente', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/motorista/:path*', '/admin/:path*'],
}
