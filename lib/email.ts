import nodemailer from 'nodemailer'

const baseURL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const port = parseInt(process.env.SMTP_PORT || '465', 10)

// SMTP não configurado: sendEmail/verifySMTP viram no-ops seguros em vez de
// lançar no carregamento do módulo (evita crash em dev sem variáveis).
const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD
)

function createTransporter(securePort: boolean) {
  const p = securePort ? 465 : 587
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: p,
    secure: p === 465,
    requireTLS: p === 587,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    logger: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
  })
}

const transporter = smtpConfigured ? createTransporter(port === 465) : null

export async function verifySMTP() {
  if (!transporter) {
    console.warn('[Email] SMTP não configurado (SMTP_HOST/SMTP_EMAIL/SMTP_PASSWORD ausentes)')
    return { success: false, error: 'SMTP not configured' }
  }
  try {
    await transporter.verify()
    console.log('[Email] Conexão SMTP verificada com sucesso')
    return { success: true }
  } catch (error) {
    console.error('[Email] Falha na verificação SMTP na porta', port, ':', error)
    return { success: false, error }
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!transporter) {
    console.warn('[Email] SMTP não configurado; envio ignorado (destino:', to, ')')
    return { success: false, error: 'SMTP not configured' }
  }
  try {
    console.log(`[Email] Enviando email para ${to} (porta ${port})...`)
    const info = await transporter.sendMail({
      from: `FRETA <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log(`[Email] Email enviado com sucesso: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (primaryError) {
    console.error(`[Email] Falha na porta ${port}:`, primaryError)

    const fallbackPort = port === 465 ? 587 : 465
    const fallbackSecure = fallbackPort === 465
    console.log(`[Email] Tentando porta alternativa ${fallbackPort}...`)

    try {
      const fallbackTransporter = createTransporter(fallbackSecure)
      const info = await fallbackTransporter.sendMail({
        from: `FRETA <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
      })
      console.log(`[Email] Email enviado com sucesso via porta ${fallbackPort}: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (fallbackError) {
      console.error(`[Email] Falha na porta alternativa ${fallbackPort}:`, fallbackError)
      return { success: false, error: primaryError }
    }
  }
}

function layout(title: string, body: string, ctaUrl?: string, ctaLabel?: string) {
  return `
    <div style="font-family: sans-serif; line-height: 1.5; background-color: #f4f4f4; padding: 40px 0;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
        <div style="margin-bottom: 20px;">
          <div style="display: inline-block; width: 50px; height: 50px; background-color: #ea580c; border-radius: 12px; line-height: 50px;">
            <span style="color: white; font-weight: bold; font-size: 20px;">F</span>
          </div>
        </div>
        <h2 style="margin-bottom: 20px; color: #333;">${title}</h2>
        ${body}
        ${
          ctaUrl && ctaLabel
            ? `<a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">${ctaLabel}</a>`
            : ''
        }
        <p style="font-size: 0.85em; color: #999; margin-top: 30px;">FRETA — A tua carga. O motorista certo.</p>
      </div>
    </div>
  `
}

export async function sendResetPasswordEmail(to: string, url: string) {
  return sendEmail({
    to,
    subject: 'Redefinir a sua palavra-passe — FRETA',
    html: layout(
      'Redefinir palavra-passe',
      `
        <p style="margin-bottom: 20px; color: #555;">Recebemos um pedido para redefinir a palavra-passe da sua conta FRETA.</p>
        <p style="margin-bottom: 20px; color: #555;">Se não foi você, pode ignorar este email com segurança.</p>
      `,
      url,
      'Redefinir palavra-passe'
    ),
  })
}

export async function sendWelcomeEmail(to: string, userName: string) {
  return sendEmail({
    to,
    subject: 'Bem-vindo à FRETA',
    html: layout(
      'Bem-vindo à FRETA',
      `
        <p style="margin-bottom: 20px; color: #555;">Olá <strong>${escapeHtml(userName)}</strong>,</p>
        <p style="margin-bottom: 20px; color: #555;">A sua conta foi criada. Complete o seu perfil de motorista para começar a receber pedidos de frete na sua zona.</p>
      `,
      `${baseURL}/motorista`,
      'Abrir o meu painel'
    ),
  })
}
