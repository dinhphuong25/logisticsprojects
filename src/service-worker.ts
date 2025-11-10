/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const CACHE_VERSION = 'v2.0.0'
const CACHE_NAME = `coldchain-wms-${CACHE_VERSION}`
const API_CACHE_NAME = `coldchain-api-${CACHE_VERSION}`
const IMAGE_CACHE_NAME = `coldchain-images-${CACHE_VERSION}`
const DYNAMIC_CACHE_NAME = `coldchain-dynamic-${CACHE_VERSION}`

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  API: 5 * 60 * 1000, // 5 minutes
  IMAGES: 24 * 60 * 60 * 1000, // 24 hours
  DYNAMIC: 60 * 60 * 1000, // 1 hour
}

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // Fallback offline page
]

// URLs that should always be fetched from network
const NETWORK_ONLY_URLS = [
  '/api/auth',
  '/api/logout',
  '/api/realtime',
]

// Background Sync tag
const SYNC_TAG = 'coldchain-sync'

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('[Service Worker] Failed to cache assets:', error)
      })
    })
  )
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              !cacheName.includes(CACHE_VERSION) &&
              (cacheName.startsWith('coldchain-wms-') ||
                cacheName.startsWith('coldchain-api-') ||
                cacheName.startsWith('coldchain-images-') ||
                cacheName.startsWith('coldchain-dynamic-'))
            ) {
              console.log('[Service Worker] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients
      self.clients.claim(),
    ])
  )
})

/**
 * Check if cache entry is expired
 */
function isCacheExpired(cachedResponse: Response, maxAge: number): boolean {
  const cachedDate = cachedResponse.headers.get('sw-cache-date')
  if (!cachedDate) return true
  
  const cacheTime = parseInt(cachedDate, 10)
  const now = Date.now()
  return now - cacheTime > maxAge
}

/**
 * Add cache timestamp to response
 */
function addCacheTimestamp(response: Response): Response {
  const clonedResponse = response.clone()
  const headers = new Headers(clonedResponse.headers)
  headers.set('sw-cache-date', Date.now().toString())
  
  return new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers,
  })
}

/**
 * Network first strategy with cache fallback
 */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(cacheName)
      const responseWithTimestamp = addCacheTimestamp(response)
      await cache.put(request, responseWithTimestamp.clone())
      return response
    }
    
    return response
  } catch {
    console.log('[Service Worker] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html')
      if (offlinePage) return offlinePage
    }
    
    return new Response('Offline - Unable to fetch data', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

/**
 * Cache first strategy with network fallback and expiration
 */
async function cacheFirst(
  request: Request,
  cacheName: string,
  maxAge: number
): Promise<Response> {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    console.log('[Service Worker] Serving from cache:', request.url)
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(cacheName)
      const responseWithTimestamp = addCacheTimestamp(response)
      await cache.put(request, responseWithTimestamp.clone())
    }
    
    return response
  } catch (error) {
    if (cachedResponse) {
      console.log('[Service Worker] Network failed, serving stale cache:', request.url)
      return cachedResponse
    }
    
    throw error
  }
}

/**
 * Fetch event - intelligent caching strategy
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Network only for auth and realtime endpoints
  if (NETWORK_ONLY_URLS.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(fetch(request))
    return
  }
  
  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE_NAME))
    return
  }
  
  // Images - cache first with expiration
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE_NAME, CACHE_EXPIRATION.IMAGES))
    return
  }
  
  // Fonts and styles - cache first
  if (
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME, 7 * 24 * 60 * 60 * 1000)) // 7 days
    return
  }
  
  // All other requests - network first with dynamic cache
  event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME))
})

/**
 * Background Sync event
 */
self.addEventListener('sync', ((event: ExtendableEvent & { tag: string }) => {
  console.log('[Service Worker] Background sync:', event.tag)
  
  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      // Perform background sync operations
      syncData().catch((error) => {
        console.error('[Service Worker] Sync failed:', error)
      })
    )
  }
}) as EventListener)

/**
 * Sync data when connection is restored
 */
async function syncData(): Promise<void> {
  console.log('[Service Worker] Syncing data...')
  
  // Get all pending requests from IndexedDB or cache
  // and retry them
  
  const cache = await caches.open(API_CACHE_NAME)
  const requests = await cache.keys()
  
  for (const request of requests) {
    if (request.method !== 'GET') {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch {
        console.error('[Service Worker] Failed to sync request:', request.url)
      }
    }
  }
}

/**
 * Listen for messages from the app
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[Service Worker] Received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      })
    )
  }
})

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received')
  
  const data = event.data?.json() ?? {}
  const title = data.title || 'Cold Chain WMS'
  const options = {
    body: data.body || 'Bạn có thông báo mới',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'view',
        title: 'Xem',
        icon: '/icons/view.png',
      },
      {
        action: 'dismiss',
        title: 'Đóng',
        icon: '/icons/close.png',
      },
    ],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data?.url || '/'

        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus()
          }
        }

        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})

/**
 * Handle notification close event
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag)
  
  // Track notification dismissal analytics
  // You can send this data to your analytics service
})