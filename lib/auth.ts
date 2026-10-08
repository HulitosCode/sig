import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/lib/db'
import { sendResetPasswordEmail, sendWelcomeEmail } from '@/lib/email'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // renova diariamente
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Envio do email de recuperação de senha — dispara sem esperar (fire-and-forget)
    // para o pedido não ficar bloqueado à espera da ligação SMTP.
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail(user.email, url).catch((err) => {
        console.error('[Email] Falha ao enviar redefinição:', err)
      })
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'motorista',
        input: false, // nunca definido pelo cliente
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Devolve a promise de imediato; o email segue em background —
        // um await aqui (SMTP real) deixa o registo "a rodar" 15-30s.
        after: async (user) => {
          void sendWelcomeEmail(user.email, user.name).catch((err) => {
            console.error('[Email] Falha ao enviar boas-vindas:', err)
          })
        },
      },
    },
  },
  plugins: [nextCookies()], // tem de ser o último plugin
})

export type Session = typeof auth.$Infer.Session
