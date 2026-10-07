/* Service Worker do FRETA — cache conservadora, apenas de assets públicos. */

const CACHE_VERSION = 'freta-cache-v2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const OFFLINE_URL = '/offline'

// Cache permitido: apenas GETs públicos e seguros.
// NUNCA: POST/Server Actions, /api/*, /admin/*, /motorista/*, cookies/tokens.
const PRECACHE_URLS = ['/', OFFLINE_URL, '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      // addAll falha inteiramente se um URL falhar — adicionamos um a um.
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => undefined)
        )
      )
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches de versões anteriores.
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith('freta-cache-') && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

/**
 * Decide se um request pode ser cacheado.
 * Regras: apenas GET, apenas mesma origem, apenas rotas públicas seguras.
 */
function isCacheable(request) {
  if (request.method !== 'GET') return false
  if (request.headers.has('authorization') || request.headers.has('cookie')) return false

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return false

  const path = url.pathname
  if (
    path.startsWith('/api/') ||
    path.startsWith('/admin') ||
    path.startsWith('/motorista') ||
    path.startsWith('/entrar') ||
    path.startsWith('/registo') ||
    path.startsWith('/redefinir-senha')
  ) {
    return false
  }

  // Navegações (HTML) nunca são cacheadas — sempre rede, com fallback offline.
  if (request.mode === 'navigate') return false

  // Assets estáticos (/_next/static, ícones, imagens, fontes).
  return (
    path.startsWith('/_next/static/') ||
    path.startsWith('/icons/') ||
    path.startsWith('/images/') ||
    path.startsWith('/fonts/') ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|css|js)$/.test(path)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Navegações: rede primeiro, fallback para página offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          return response
        } catch {
          const cache = await caches.open(STATIC_CACHE)
          const offline = (await cache.match(OFFLINE_URL)) || (await cache.match('/'))
          return offline || new Response('Sem ligação à internet', { status: 503 })
        }
      })()
    )
    return
  }

  if (!isCacheable(request)) return

  // Cache-first para assets estáticos (com actualização em rede em paralelo).
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      const cached = await cache.match(request)
      if (cached) {
        // Atualiza a cache em segundo plano (stale-while-revalidate).
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response && response.ok) {
                return cache.put(request, response.clone())
              }
            })
            .catch(() => undefined)
        )
        return cached
      }

      try {
        const response = await fetch(request)
        if (response && response.ok) {
          cache.put(request, response.clone())
        }
        return response
      } catch {
        // Recursos essenciais podem falhar silenciosamente.
        return new Response('', { status: 408 })
      }
    })()
  )
})
