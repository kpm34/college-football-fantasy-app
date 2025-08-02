# Service Worker Implementation Guide

## Overview

This guide covers the complete service worker implementation for the College Football Fantasy App, providing offline functionality, caching strategies, and PWA features.

## 🏗️ Architecture

### File Structure
```
frontend/
├── public/
│   ├── service-worker.js          # Main service worker
│   ├── manifest.json              # PWA manifest
│   └── icons/                     # App icons (to be created)
├── lib/
│   └── service-worker.js          # Registration utility
└── app/
    └── layout.tsx                 # Next.js layout with SW registration
```

## 🔧 Service Worker Features

### 1. **Caching Strategies**

#### **Static Files (CacheFirst)**
- HTML, CSS, JS, images, fonts
- Immediate cache on install
- Fast loading for repeat visits

#### **API Requests (NetworkFirst)**
- `/api/games`, `/api/rankings`, `/api/teams`
- `/api/eligibility/*` endpoints
- Falls back to cache when offline

#### **HTML Pages (NetworkFirst)**
- League pages, draft pages
- Always try network first
- Cache successful responses

### 2. **Offline Functionality**

#### **Offline Page**
- Custom offline page with chrome design
- Retry connection button
- Consistent with app theme

#### **Offline Data**
- Cached roster data from Appwrite
- IndexedDB for persistent storage
- localStorage for quick access

### 3. **Background Sync**
- Pending actions queue
- Automatic sync when online
- Draft picks, league joins, etc.

## 📱 PWA Features

### **Manifest.json**
```json
{
  "name": "College Football Fantasy",
  "short_name": "CF Fantasy",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#0f172a"
}
```

### **App Shortcuts**
- Create League: `/league/create`
- Join League: `/league/join`
- Mock Draft: `/draft/mock`

### **Installation**
- Add to home screen
- Standalone app experience
- Native-like interface

## 🚀 Implementation

### **1. Service Worker Registration**

#### **Vanilla JS (Current)**
```html
<script src="/lib/service-worker.js"></script>
```

#### **Next.js App Router**
```tsx
// In layout.tsx
<ServiceWorkerRegistration />
```

### **2. Cache Management**

#### **Cache Roster Data**
```javascript
// Cache user's roster for offline access
swManager.cacheRosterData(rosterData);
```

#### **Clear Cache**
```javascript
// Clear all cached data
swManager.clearCache();
```

### **3. Update Handling**

#### **Skip Waiting**
```javascript
// Immediately activate new service worker
swManager.skipWaiting();
```

#### **Update Notifications**
- Automatic update detection
- User-friendly notification
- One-click update button

## 🔄 Caching Strategies

### **Install Event**
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});
```

### **Fetch Event**
```javascript
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
  } else if (isHtmlRequest(url.pathname)) {
    event.respondWith(handleHtmlRequest(request));
  }
});
```

### **API Request Handling**
```javascript
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Return offline fallback
    return getOfflineEligibilityData();
  }
}
```

## 💾 Storage Management

### **IndexedDB Schema**
```javascript
// Database: CFFantasyDB
// Version: 1
// Stores:
// - rosters: { id, data, timestamp }
// - leagues: { id, data, timestamp }
// - drafts: { id, data, timestamp }
```

### **localStorage Keys**
```javascript
// cf-fantasy-roster-cache: { roster, timestamp }
// cf-fantasy-pending-actions: [actions]
```

## 🔧 Configuration

### **Cache Names**
```javascript
const CACHE_NAME = 'cf-fantasy-v1.0.0';
const STATIC_CACHE = 'cf-fantasy-static-v1.0.0';
const API_CACHE = 'cf-fantasy-api-v1.0.0';
const OFFLINE_CACHE = 'cf-fantasy-offline-v1.0.0';
```

### **Static Files to Cache**
```javascript
const STATIC_FILES = [
  '/',
  '/index.html',
  '/league/create',
  '/league/join',
  '/draft/mock',
  // ... more files
];
```

### **API Endpoints to Cache**
```javascript
const API_ENDPOINTS = [
  '/api/games',
  '/api/rankings',
  '/api/teams',
  '/api/eligibility/',
  '/api/games/week/',
  '/api/games/eligible'
];
```

## 🧪 Testing

### **Development Testing**
1. Open Chrome DevTools
2. Go to Application tab
3. Check Service Workers section
4. Test offline functionality

### **Production Testing**
1. Deploy to HTTPS
2. Test PWA installation
3. Verify offline functionality
4. Check cache performance

## 📊 Performance Benefits

### **Loading Speed**
- Static files cached instantly
- API responses cached for offline
- Reduced network requests

### **Offline Experience**
- Full app functionality offline
- Cached roster data available
- Graceful degradation

### **User Experience**
- App-like installation
- Native notifications
- Background sync

## 🔒 Security Considerations

### **HTTPS Required**
- Service workers only work over HTTPS
- Local development uses localhost exception

### **Cache Validation**
- Timestamp-based cache invalidation
- 1-hour cache lifetime for roster data
- Automatic cleanup of old caches

### **Data Privacy**
- Local storage only
- No sensitive data in cache
- User consent for PWA features

## 🚀 Deployment

### **Python Server (Current)**
```python
# Already configured in simple_server.py
def serve_service_worker(self):
    file_path = os.path.join(FRONTEND_DIR, 'public', 'service-worker.js')
    # Serves with proper headers
```

### **Next.js (Future)**
```javascript
// Place service-worker.js in public/ directory
// Next.js automatically serves static files
```

### **Production Considerations**
- HTTPS required
- Cache versioning
- Update notifications
- Performance monitoring

## 📈 Monitoring

### **Service Worker Status**
```javascript
// Check if service worker is active
if (swManager.isActive()) {
  console.log('Service worker is active');
}
```

### **Cache Status**
```javascript
// Check cache storage
caches.keys().then(names => {
  console.log('Available caches:', names);
});
```

### **Offline Status**
```javascript
// Check online/offline status
if (swManager.isOnline()) {
  console.log('App is online');
} else {
  console.log('App is offline');
}
```

## 🔄 Updates and Maintenance

### **Version Management**
- Increment cache version on updates
- Automatic cleanup of old caches
- Graceful update handling

### **Cache Invalidation**
- Time-based invalidation
- Manual cache clearing
- Selective cache updates

### **Performance Optimization**
- Lazy loading of non-critical resources
- Compression of cached data
- Efficient cache strategies

This service worker implementation provides a robust foundation for offline functionality, caching, and PWA features while maintaining excellent performance and user experience. 