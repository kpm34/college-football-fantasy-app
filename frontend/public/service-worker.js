// College Football Fantasy App - Service Worker
// Version: 1.0.0
// Caches: HTML, JS, CSS, API responses, and offline data

const CACHE_NAME = 'cf-fantasy-v1.0.0';
const STATIC_CACHE = 'cf-fantasy-static-v1.0.0';
const API_CACHE = 'cf-fantasy-api-v1.0.0';
const OFFLINE_CACHE = 'cf-fantasy-offline-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/league/create',
  '/league/join',
  '/draft/mock',
  '/draft/snake',
  '/draft/auction',
  '/league/start-league.html',
  '/league/join-league.html',
  '/league/mock-draft.html',
  '/api/games',
  '/api/rankings',
  '/api/teams',
  '/api/health'
];

// API endpoints to cache with NetworkFirst strategy
const API_ENDPOINTS = [
  '/api/games',
  '/api/rankings',
  '/api/teams',
  '/api/eligibility/',
  '/api/games/week/',
  '/api/games/eligible'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== OFFLINE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle different types of requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests with NetworkFirst strategy
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static files with CacheFirst strategy
  if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle HTML pages with NetworkFirst strategy
  if (isHtmlRequest(url.pathname)) {
    event.respondWith(handleHtmlRequest(request));
    return;
  }
  
  // Default: try network, fallback to cache
  event.respondWith(handleDefaultRequest(request));
});

// Check if request is for API endpoint
function isApiRequest(pathname) {
  return API_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

// Check if request is for static file
function isStaticFile(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Check if request is for HTML page
function isHtmlRequest(pathname) {
  return pathname.endsWith('.html') || 
         pathname === '/' || 
         pathname.startsWith('/league/') || 
         pathname.startsWith('/draft/');
}

// Handle API requests with NetworkFirst strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the successful response
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline fallback for eligibility data
    if (request.url.includes('/api/eligibility/')) {
      return getOfflineEligibilityData();
    }
    
    // Return generic offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No internet connection. Please check your connection and try again.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static files with CacheFirst strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error fetching static file:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle HTML requests with NetworkFirst strategy
async function handleHtmlRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for HTML request, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return getOfflinePage();
  }
}

// Handle default requests
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Get offline eligibility data from Appwrite cache
async function getOfflineEligibilityData() {
  try {
    // Try to get cached roster data from IndexedDB or localStorage
    const cachedData = await getCachedRosterData();
    
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[SW] Error getting cached roster data:', error);
  }
  
  // Return empty eligibility data
  return new Response(JSON.stringify({
    eligible: false,
    message: 'Offline mode - eligibility data not available'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get cached roster data from storage
async function getCachedRosterData() {
  // Try localStorage first
  try {
    const cached = localStorage.getItem('cf-fantasy-roster-cache');
    if (cached) {
      const data = JSON.parse(cached);
      const cacheTime = data.timestamp || 0;
      const now = Date.now();
      
      // Cache is valid for 1 hour
      if (now - cacheTime < 3600000) {
        return data.roster;
      }
    }
  } catch (error) {
    console.error('[SW] Error reading from localStorage:', error);
  }
  
  // Try IndexedDB if available
  try {
    const db = await openIndexedDB();
    const roster = await getFromIndexedDB(db, 'rosters', 'cached-roster');
    return roster;
  } catch (error) {
    console.error('[SW] Error reading from IndexedDB:', error);
  }
  
  return null;
}

// Open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CFFantasyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('rosters')) {
        db.createObjectStore('rosters', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('leagues')) {
        db.createObjectStore('leagues', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    };
  });
}

// Get data from IndexedDB
function getFromIndexedDB(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Get offline page
async function getOfflinePage() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - College Football Fantasy</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .chrome-text {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white min-h-screen flex items-center justify-center">
        <div class="text-center">
            <div class="text-8xl mb-6">📡</div>
            <h1 class="text-4xl font-bold chrome-text mb-4">You're Offline</h1>
            <p class="text-xl text-slate-300 mb-8">Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium">
                Retry Connection
            </button>
        </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Received SKIP_WAITING message');
      self.skipWaiting();
      break;
      
    case 'CACHE_ROSTER_DATA':
      console.log('[SW] Caching roster data');
      cacheRosterData(data);
      break;
      
    case 'CLEAR_CACHE':
      console.log('[SW] Clearing cache');
      clearCache();
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Cache roster data
async function cacheRosterData(rosterData) {
  try {
    // Cache in localStorage
    localStorage.setItem('cf-fantasy-roster-cache', JSON.stringify({
      roster: rosterData,
      timestamp: Date.now()
    }));
    
    // Cache in IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['rosters'], 'readwrite');
    const store = transaction.objectStore('rosters');
    
    await store.put({
      id: 'cached-roster',
      data: rosterData,
      timestamp: Date.now()
    });
    
    console.log('[SW] Roster data cached successfully');
  } catch (error) {
    console.error('[SW] Error caching roster data:', error);
  }
}

// Clear cache
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    // Clear localStorage
    localStorage.removeItem('cf-fantasy-roster-cache');
    
    console.log('[SW] Cache cleared successfully');
  } catch (error) {
    console.error('[SW] Error clearing cache:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Perform background sync
async function doBackgroundSync() {
  try {
    console.log('[SW] Performing background sync');
    
    // Sync any pending offline actions
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      await syncAction(action);
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Get pending actions from storage
async function getPendingActions() {
  try {
    const pending = localStorage.getItem('cf-fantasy-pending-actions');
    return pending ? JSON.parse(pending) : [];
  } catch (error) {
    console.error('[SW] Error getting pending actions:', error);
    return [];
  }
}

// Sync a single action
async function syncAction(action) {
  try {
    const response = await fetch(action.url, {
      method: action.method,
      headers: action.headers,
      body: action.body
    });
    
    if (response.ok) {
      // Remove from pending actions
      await removePendingAction(action.id);
      console.log('[SW] Action synced successfully:', action.id);
    }
  } catch (error) {
    console.error('[SW] Error syncing action:', error);
  }
}

// Remove pending action
async function removePendingAction(actionId) {
  try {
    const pending = await getPendingActions();
    const filtered = pending.filter(action => action.id !== actionId);
    localStorage.setItem('cf-fantasy-pending-actions', JSON.stringify(filtered));
  } catch (error) {
    console.error('[SW] Error removing pending action:', error);
  }
}

console.log('[SW] Service worker loaded successfully'); 