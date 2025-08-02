import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'College Football Fantasy App',
  description: 'Fantasy football for Power 4 conferences with elite matchups only',
  manifest: '/manifest.json',
  themeColor: '#667eea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CF Fantasy',
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CF Fantasy" />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

// Service Worker Registration Component
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Service Worker Registration
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
              try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                  scope: '/'
                });
                
                console.log('[SW] Service Worker registered successfully:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                  console.log('[SW] Update found');
                  const newWorker = registration.installing;
                  
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      console.log('[SW] New service worker installed');
                      showUpdateNotification();
                    }
                  });
                });
                
                // Handle controller change
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  console.log('[SW] Controller changed');
                  hideUpdateNotification();
                });
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                  const { type, data } = event.data;
                  
                  switch (type) {
                    case 'CACHE_UPDATED':
                      console.log('[SW] Cache updated:', data);
                      break;
                      
                    case 'OFFLINE_MODE':
                      console.log('[SW] Offline mode activated');
                      showOfflineNotification();
                      break;
                      
                    case 'ONLINE_MODE':
                      console.log('[SW] Online mode activated');
                      hideOfflineNotification();
                      break;
                      
                    default:
                      console.log('[SW] Unknown message type:', type);
                  }
                });
                
              } catch (error) {
                console.error('[SW] Service Worker registration failed:', error);
              }
            });
            
            // Online/Offline listeners
            window.addEventListener('online', () => {
              console.log('[SW] App is online');
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'ONLINE_MODE' });
              }
            });
            
            window.addEventListener('offline', () => {
              console.log('[SW] App is offline');
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'OFFLINE_MODE' });
              }
            });
            
            // Helper functions
            function showUpdateNotification() {
              const notification = document.createElement('div');
              notification.id = 'sw-update-notification';
              notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              notification.innerHTML = \`
                <div class="flex items-center space-x-3">
                  <span>🔄</span>
                  <span>New version available</span>
                  <button onclick="skipWaiting()" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
                    Update
                  </button>
                  <button onclick="hideUpdateNotification()" class="text-white/80 hover:text-white">
                    ✕
                  </button>
                </div>
              \`;
              
              document.body.appendChild(notification);
            }
            
            function hideUpdateNotification() {
              const notification = document.getElementById('sw-update-notification');
              if (notification) {
                notification.remove();
              }
            }
            
            function showOfflineNotification() {
              const notification = document.createElement('div');
              notification.id = 'sw-offline-notification';
              notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              notification.innerHTML = \`
                <div class="flex items-center space-x-3">
                  <span>📡</span>
                  <span>You're offline</span>
                  <button onclick="hideOfflineNotification()" class="text-white/80 hover:text-white">
                    ✕
                  </button>
                </div>
              \`;
              
              document.body.appendChild(notification);
            }
            
            function hideOfflineNotification() {
              const notification = document.getElementById('sw-offline-notification');
              if (notification) {
                notification.remove();
              }
            }
            
            function skipWaiting() {
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
              }
            }
            
            // Cache roster data
            window.cacheRosterData = async function(rosterData) {
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: 'CACHE_ROSTER_DATA',
                  data: rosterData
                });
              }
            };
            
            // Clear cache
            window.clearCache = async function() {
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: 'CLEAR_CACHE'
                });
              }
            };
          }
        `,
      }}
    />
  )
}
