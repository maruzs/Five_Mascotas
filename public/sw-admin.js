/**
 * FIVE MASCOTAS — SERVICE WORKER PWA & WEB PUSH (BACKOFFICE)
 * Caches admin shell, enables offline fallback, handles Web Push alerts
 */

const CACHE_NAME = 'five-admin-cache-v1';
const PRECACHE_ASSETS = [
  '/admin',
  '/admin/pedidos',
  '/admin/pim',
  '/admin/cms',
  '/admin-manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/five-mascotas/logo.png',
];

// 1. INSTALL EVENT — Precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW-Admin] Precache warning:', err);
      })
  );
});

// 2. ACTIVATE EVENT — Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name.startsWith('five-admin-'))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT — Intelligent Caching Strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and internal schemes
  if (req.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Never cache API routes (always live zero-trust data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(
          JSON.stringify({ ok: false, error: 'Sin conexión a internet. Modo offline activo.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // HTML Page Navigation Strategy: Network-First with Offline Fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('/admin');
          if (fallback) return fallback;
          return new Response(
            '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sin conexión — FIVE Admin</title><style>body{font-family:sans-serif;padding:32px;text-align:center;background:#f8f9fa;color:#212529}h1{color:#7025a8}.btn{display:inline-block;margin-top:16px;padding:10px 20px;background:#7025a8;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold}</style></head><body><h1>FIVE Admin Offline</h1><p>No se puede conectar con el servidor central. Revisa tu conexión de datos móviles o WiFi.</p><a href="/admin" class="btn">Reintentar conexión</a></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Static Assets Strategy (CSS, JS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. PUSH EVENT — Web Push Notification Trigger
self.addEventListener('push', (event) => {
  let payload = {
    title: 'FIVE Mascotas Backoffice',
    body: 'Alerta operativa recibida.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/admin/pedidos' },
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag || 'five-admin-push',
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || { url: '/admin/pedidos' },
    actions: [
      { action: 'open_order', title: 'Ver en Panel' },
      { action: 'dismiss', title: 'Entendido' },
    ],
  };

  event.waitUntil(self.registration.showNotification(payload.title, notificationOptions));
});

// 5. NOTIFICATION CLICK EVENT — Focus or Open Admin URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/admin/pedidos';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname.startsWith('/admin') && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
