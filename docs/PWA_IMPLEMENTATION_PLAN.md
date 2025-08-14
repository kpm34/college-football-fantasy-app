# PWA Implementation Plan - College Football Fantasy App

## Overview
Transform the web app into a Progressive Web App for native-like mobile experience.

## Phase 1: Basic PWA Setup (2-3 hours)

### 1.1 Web App Manifest
```json
{
  "name": "College Football Fantasy - Power 4 Conferences",
  "short_name": "CFB Fantasy",
  "description": "Fantasy football for SEC, ACC, Big 12, and Big Ten",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#8C1818",
  "background_color": "#000000",
  "categories": ["sports", "games"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1080x1920",
      "type": "image/png"
    },
    {
      "src": "/screenshots/draft.png",
      "sizes": "1080x1920",
      "type": "image/png"
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

### 1.2 Service Worker Registration
```typescript
// app/components/ServiceWorkerRegistration.tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

### 1.3 Basic Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'cfb-fantasy-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 1.4 Add to Layout
```typescript
// app/layout.tsx
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

// Add before closing </body>
<ServiceWorkerRegistration />
```

## Phase 2: Offline Support (3-4 hours)

### 2.1 Offline Page
```typescript
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-8">
          Check your connection and try again
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

### 2.2 Advanced Caching Strategy
```javascript
// Network first, cache fallback for API calls
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### 2.3 Cache Key Data
- Player lists
- Team rosters
- League standings
- User profile
- Recent scores

## Phase 3: Push Notifications (4-5 hours)

### 3.1 Request Permission
```typescript
// hooks/usePushNotifications.ts
export function usePushNotifications() {
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push
        subscribeUser();
      }
    }
  };

  const subscribeUser = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
    
    // Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' }
    });
  };
}
```

### 3.2 Notification Types
1. **Draft Notifications**
   - "You're on the clock!"
   - "Draft starting in 10 minutes"
   - "Player X was drafted"

2. **Game Day**
   - "Your player scored a TD!"
   - "Games starting soon"
   - "Final scores available"

3. **League Activity**
   - "New trade offer"
   - "Waiver claim processed"
   - "Commissioner message"

### 3.3 Push Handler
```javascript
// In service worker
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

## Phase 4: Background Sync (2-3 hours)

### 4.1 Queue Offline Actions
```javascript
// Queue failed API calls
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-rosters') {
    event.waitUntil(syncRosters());
  }
});

async function syncRosters() {
  const cache = await caches.open('offline-queue');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      // Will retry next sync
    }
  }
}
```

### 4.2 Periodic Background Sync
```javascript
// Update scores every 15 minutes during games
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-scores') {
    event.waitUntil(updateScores());
  }
});
```

## Phase 5: App Install Prompt (1-2 hours)

### 5.1 Install Banner
```typescript
// components/InstallPrompt.tsx
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstall = async () => {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      console.log('User accepted install');
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="install-banner">
      <p>Install CFB Fantasy for quick access!</p>
      <button onClick={handleInstall}>Install</button>
      <button onClick={() => setShowPrompt(false)}>Later</button>
    </div>
  );
}
```

## Testing Checklist

### Desktop (Chrome/Edge)
- [ ] Install prompt appears
- [ ] App installs to desktop
- [ ] Opens in standalone window
- [ ] Offline page works
- [ ] Push notifications work

### Android
- [ ] Add to home screen works
- [ ] Splash screen shows
- [ ] Status bar matches theme
- [ ] Offline functionality
- [ ] Background sync works

### iOS (Safari)
- [ ] Add to home screen hint
- [ ] Proper icon/splash screen
- [ ] Status bar styling
- [ ] Offline support
- [ ] No push (iOS limitation)

## Performance Metrics

### Before PWA
- First Load: ~3s
- Repeat Visit: ~1.5s
- Offline: ❌

### After PWA
- First Load: ~3s
- Repeat Visit: ~0.5s
- Offline: ✅
- From Home Screen: ~0.3s

## Next Steps

1. Create proper app icons (not placeholders)
2. Add screenshots for app stores
3. Implement workbox for better caching
4. Add offline indicator component
5. Create push notification preferences UI

## Resources
- [web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)
