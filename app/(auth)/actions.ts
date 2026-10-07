'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { rateLimit, extractClientIp } from '@/lib/rate-limit'

type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

// Limitação de taxa para fluxos de recuperação de senha (5 tentativas/10min por IP).
async function checkResetRateLimit(): Promise<boolean> {
  const h = await headers()
  const ip = extractClientIp(h.get('x-forwarded-for'), h.get('x-real-ip'))
  return rateLimit(`reset:${ip}`, 10 * 60 * 1000, 5)
}

export async function requestPasswordResetAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await checkResetRateLimit())) {
    return { success: false, message: 'Demasiadas tentativas. Tente novamente dentro de 10 minutos.' }
  }

  const validated = z
    .object({ email: z.string().email('Email inválido.') })
    .safeParse({ email: (formData.get('email') as string) ?? '' })

  if (!validated.success) {
    return {
      success: false,
      message: 'Email inválido.',
      errors: { email: ['Email inválido.'] },
    }
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: validated.data.email,
        redirectTo: '/redefinir-senha',
      },
    })
    return {
      success: true,
      message:
        'Se existir uma conta com esse email, enviámos as instruções de recuperação.',
    }
  } catch (error) {
    const message =
      (error as { body?: { message?: string } })?.body?.message ||
      'Não foi possível processar o pedido. Tente novamente.'
    return { success: false, message }
  }
}

export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await checkResetRateLimit())) {
    return { success: false, message: 'Demasiadas tentativas. Tente novamente dentro de 10 minutos.' }
  }

  const validated = z
    .object({
      newPassword: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
      confirmPassword: z.string(),
      token: z.string().min(1, 'Token em falta.'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'As palavras-passe não coincidem.',
      path: ['confirmPassword'],
    })
    .safeParse({
      newPassword: (formData.get('newPassword') as string) ?? '',
      confirmPassword: (formData.get('confirmPassword') as string) ?? '',
      token: (formData.get('token') as string) ?? '',
    })

  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(
      validated.error.flatten().fieldErrors
    )) {
      if (value) fieldErrors[key] = value
    }
    return { success: false, message: 'Verifique os erros do formulário.', errors: fieldErrors }
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: validated.data.newPassword,
        token: validated.data.token,
      },
    })
    return { success: true, message: 'Palavra-passe redefinida com sucesso. Já pode entrar.' }
  } catch (error) {
    const message =
      (error as { body?: { message?: string } })?.body?.message ||
      'Não foi possível redefinir a palavra-passe. O link pode ter expirado.'
    return { success: false, message }
  }
}
