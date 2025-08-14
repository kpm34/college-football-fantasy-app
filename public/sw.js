const CACHE_NAME = 'cfb-fantasy-v1';
const DYNAMIC_CACHE = 'cfb-fantasy-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Try cache on network failure
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Update cache in background
        fetch(request).then(response => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response);
            });
          }
        });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-roster-changes') {
    event.waitUntil(syncRosterChanges());
  }
});

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/badge-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: new Date().toISOString()
    },
    actions: data.actions || [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    tag: data.tag || 'cfb-fantasy-notification',
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if app is already open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper function for background sync
async function syncRosterChanges() {
  const cache = await caches.open('offline-queue');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Sync failed for:', request.url);
      // Will retry on next sync
    }
  }
}
