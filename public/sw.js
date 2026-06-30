const CACHE_NAME = 'turingshop-v2'

const PRECACHE_URLS = [
  '/goods-shop-project/',
  '/goods-shop-project/index.html',
  '/goods-shop-project/auth.html',
  '/goods-shop-project/orders.html',
  '/goods-shop-project/admin.html',
  '/goods-shop-project/css/style.css',
  '/goods-shop-project/js/config.js',
  '/goods-shop-project/js/products.js',
  '/goods-shop-project/js/payment.js',
  '/goods-shop-project/js/auth.js',
  '/goods-shop-project/js/orders.js',
  '/goods-shop-project/js/pwa-install.js',
  '/goods-shop-project/manifest.json',
  '/goods-shop-project/icons/icon-192.png',
  '/goods-shop-project/icons/icon-512.png',
]

// 항상 네트워크 전용 (캐시 금지)
const NETWORK_ONLY = [
  /supabase\.co\/rest\//,
  /supabase\.co\/auth\//,
  /supabase\.co\/functions\//,
  /js\.tosspayments\.com/,
]

// 네트워크 우선 → 실패 시 캐시
const NETWORK_FIRST = [
  /cdn\.jsdelivr\.net/,
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => c.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = e.request.url

  if (NETWORK_ONLY.some((p) => p.test(url))) {
    e.respondWith(fetch(e.request))
    return
  }

  if (NETWORK_FIRST.some((p) => p.test(url))) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(e.request, res.clone()))
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  // Cache First + 백그라운드 갱신
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        if (res.ok) caches.open(CACHE_NAME).then((c) => c.put(e.request, res.clone()))
        return res
      })
      return cached || fetched
    })
  )
})
