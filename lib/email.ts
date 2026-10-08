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

// Cria um transporter para a porta indicada (465 = SSL, 587 = STARTTLS).
function createTransporter(p: number) {
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

// Porta principal: a configurada em SMTP_PORT; a lista garante fallback
// caso a porta configurada não responda (a tentativa falha rápido e passa à seguinte).
const primaryPort = port
const transporter = smtpConfigured ? createTransporter(primaryPort) : null

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
    console.error(`[Email] Falha na porta ${primaryPort}:`, primaryError)

    const fallbackPort = primaryPort === 465 ? 587 : 465
    console.log(`[Email] Tentando porta alternativa ${fallbackPort}...`)

    try {
      const fallbackTransporter = createTransporter(fallbackPort)
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
          <div style="display: inline-block; width: 50px; height: 50px; background-color: #00ff55; border-radius: 12px; line-height: 50px;">
            <span style="color: #040404; font-weight: bold; font-size: 20px;">F</span>
          </div>
        </div>
        <h2 style="margin-bottom: 20px; color: #333;">${title}</h2>
        ${body}
        ${
          ctaUrl && ctaLabel
            ? `<a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #00ff55; color: #040404; text-decoration: none; border-radius: 6px; font-weight: bold;">${ctaLabel}</a>`
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

// Notificação ao admin quando um motorista submete os documentos de verificação.
export async function sendVerificationSubmittedEmail(
  adminEmail: string,
  motoristaNome: string,
  motoristaEmail: string
) {
  return sendEmail({
    to: adminEmail,
    subject: `Verificação pendente: ${motoristaNome} — FRETA`,
    html: layout(
      'Documentos para validar',
      `
        <p style="margin-bottom: 20px; color: #555;">O motorista <strong>${escapeHtml(motoristaNome)}</strong> (${escapeHtml(motoristaEmail)}) submeteu os documentos de verificação (BI e fotos do veículo).</p>
        <p style="margin-bottom: 20px; color: #555;">Revise e aprove ou rejeite no painel de administração.</p>
      `,
      `${baseURL}/admin/motoristas`,
      'Rever documentos'
    ),
  })
}

// Resultado da verificação para o motorista.
export async function sendMotoristaVerificadoEmail(to: string, userName: string) {
  return sendEmail({
    to,
    subject: 'Perfil verificado — FRETA',
    html: layout(
      'Perfil verificado!',
      `
        <p style="margin-bottom: 20px; color: #555;">Olá <strong>${escapeHtml(userName)}</strong>,</p>
        <p style="margin-bottom: 20px; color: #555;">As suas informações foram validadas. O seu perfil está <strong>verificado</strong> e visível para os clientes na FRETA.</p>
      `,
      `${baseURL}/motorista`,
      'Abrir o meu painel'
    ),
  })
}

export async function sendMotoristaRejeitadoEmail(
  to: string,
  userName: string,
  motivo: string
) {
  return sendEmail({
    to,
    subject: 'Documentos não aprovados — FRETA',
    html: layout(
      'Documentos não aprovados',
      `
        <p style="margin-bottom: 20px; color: #555;">Olá <strong>${escapeHtml(userName)}</strong>,</p>
        <p style="margin-bottom: 20px; color: #555;">Os seus documentos não foram aprovados. Motivo:</p>
        <p style="margin-bottom: 20px; color: #333; background: #f7f7f7; padding: 12px; border-radius: 6px; text-align: left;">${escapeHtml(motivo)}</p>
        <p style="margin-bottom: 20px; color: #555;">Corrija e submeta novamente no seu painel.</p>
      `,
      `${baseURL}/motorista/perfil`,
      'Corrigir documentos'
    ),
  })
}
