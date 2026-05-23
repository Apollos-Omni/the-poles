Deno.serve((req) => {
  // Helper functions (inlined)
  const ok = (body, headers = {}) => new Response(body, { status: 200, headers });
  const err = (msg, code = 400) => new Response(msg, { status: code });

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: { 'Allow': 'GET, HEAD' } 
    });
  }

  const SW_SOURCE = `/* sw.js - Divine Hinge Service Worker */
const VERSION = '${Date.now()}';
console.log('[SW] Loading version:', VERSION);

// Install immediately, no waiting
self.addEventListener('install', (e) => {
  console.log('[SW] Installing version:', VERSION);
  self.skipWaiting();
});

// Take control immediately
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating version:', VERSION);
  e.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (e) => {
  let data = {};
  try {
    data = e.data?.json() ?? {};
  } catch (err) {
    console.warn('[SW] Invalid push data:', err);
  }

  const title = data.title || 'DivineHinge';
  const body = data.body || 'You have a notification';
  const url = data.data?.url || '/';
  const icon = data.icon || '/icons/icon-192x192.png';
  const badge = data.badge || '/icons/badge-72x72.png';

  const options = {
    body,
    icon,
    badge,
    data: { url, ...data.data },
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };

  if (data.actions) {
    options.actions = data.actions;
  }

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (e) => {
  console.log('[SW] Notification click:', e.notification.tag);
  e.notification.close();

  const url = e.notification?.data?.url || '/';
  
  e.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(windowClients => {
      // Try to focus existing window
      const existingWindow = windowClients.find(client => {
        return new URL(client.url).origin === self.location.origin;
      });

      if (existingWindow) {
        return existingWindow.focus().then(() => {
          return existingWindow.navigate ? existingWindow.navigate(url) : null;
        });
      } else {
        // Open new window
        return clients.openWindow(url);
      }
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Background sync (future enhancement)
self.addEventListener('sync', (e) => {
  if (e.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    // Handle background sync tasks
  }
});

console.log('[SW] Service Worker registered successfully');`;

  const headers = {
    "content-type": "application/javascript; charset=utf-8",
    "service-worker-allowed": "/",
    "cache-control": "no-store, max-age=0",
  };

  return ok(req.method === "HEAD" ? "" : SW_SOURCE, headers);
});