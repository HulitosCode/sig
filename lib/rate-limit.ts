// Limitação de taxa em memória. Adequada para uma única instância;
// para escala horizontal, trocar por Redis/Upstash (mesma interface).
const buckets = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 10_000

export function rateLimit(key: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now()

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k)
    }
  }

  const record = buckets.get(key)
  if (!record || now > record.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  record.count++
  return record.count <= maxRequests
}

// Extrai o IP real da cadeia x-forwarded-for usando a ÚLTIMA origem
// (a adicionada pelo proxy mais próximo do servidor). Isso evita que um
// cliente burle o rate-limit forjando o cabeçalho.
export function extractClientIp(
  forwardedFor: string | null,
  realIp: string | null
): string {
  const candidates = forwardedFor?.split(',') ?? []
  const raw = candidates[candidates.length - 1]?.trim() || realIp || ''
  return isPlausibleIp(raw) ? raw : 'unknown'
}

function isPlausibleIp(ip: string): boolean {
  if (!ip) return false
  if (ip.includes(':')) return /^[0-9a-fA-F:]+$/.test(ip)
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255)
}
