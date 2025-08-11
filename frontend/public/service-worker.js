// Service Worker for CFB Fantasy App
// Version 2.0.0 - Simplified version without request interception
const VERSION = 'v2.0.0';
const CACHE_NAME = `cfb-fantasy-${VERSION}`;

// Only cache essential static assets
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing version:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating version:', VERSION);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('cfb-fantasy-') && cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Only cache static assets, no API interception
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  
  // Only cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
        .catch(() => undefined)
    );
  }
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});