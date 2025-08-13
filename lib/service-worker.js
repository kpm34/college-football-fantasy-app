// Service Worker Registration Utility
// Handles registration, updates, and communication with the service worker

class ServiceWorkerManager {
  constructor() {
    this.swRegistration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.updateAvailable = false;
  }

  // Register the service worker
  async register() {
    if (!this.isSupported) {
      console.log('[SW] Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('[SW] Service Worker registered successfully:', this.swRegistration);

      // Listen for updates
      this.setupUpdateListeners();

      // Listen for messages from service worker
      this.setupMessageListeners();

      return true;
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
      return false;
    }
  }

  // Setup listeners for service worker updates
  setupUpdateListeners() {
    if (!this.swRegistration) return;

    // Check for updates
    this.swRegistration.addEventListener('updatefound', () => {
      console.log('[SW] Update found');
      const newWorker = this.swRegistration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] New service worker installed');
          this.updateAvailable = true;
          this.showUpdateNotification();
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed');
      this.updateAvailable = false;
      this.hideUpdateNotification();
    });
  }

  // Setup listeners for messages from service worker
  setupMessageListeners() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'CACHE_UPDATED':
          console.log('[SW] Cache updated:', data);
          break;
          
        case 'OFFLINE_MODE':
          console.log('[SW] Offline mode activated');
          this.showOfflineNotification();
          break;
          
        case 'ONLINE_MODE':
          console.log('[SW] Online mode activated');
          this.hideOfflineNotification();
          break;
          
        default:
          console.log('[SW] Unknown message type:', type);
      }
    });
  }

  // Skip waiting and activate new service worker
  skipWaiting() {
    if (this.swRegistration && this.swRegistration.waiting) {
      console.log('[SW] Skipping waiting...');
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Cache roster data
  async cacheRosterData(rosterData) {
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'CACHE_ROSTER_DATA',
        data: rosterData
      });
    }
  }

  // Clear cache
  async clearCache() {
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'CLEAR_CACHE'
      });
    }
  }

  // Show update notification
  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'sw-update-notification';
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span>🔄</span>
        <span>New version available</span>
        <button onclick="swManager.skipWaiting()" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Update
        </button>
        <button onclick="swManager.hideUpdateNotification()" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  // Hide update notification
  hideUpdateNotification() {
    const notification = document.getElementById('sw-update-notification');
    if (notification) {
      notification.remove();
    }
  }

  // Show offline notification
  showOfflineNotification() {
    const notification = document.createElement('div');
    notification.id = 'sw-offline-notification';
    notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span>📡</span>
        <span>You're offline</span>
        <button onclick="swManager.hideOfflineNotification()" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  // Hide offline notification
  hideOfflineNotification() {
    const notification = document.getElementById('sw-offline-notification');
    if (notification) {
      notification.remove();
    }
  }

  // Check if app is online
  isOnline() {
    return navigator.onLine;
  }

  // Setup online/offline listeners
  setupOnlineListeners() {
    window.addEventListener('online', () => {
      console.log('[SW] App is online');
      if (this.swRegistration && this.swRegistration.active) {
        this.swRegistration.active.postMessage({ type: 'ONLINE_MODE' });
      }
    });

    window.addEventListener('offline', () => {
      console.log('[SW] App is offline');
      if (this.swRegistration && this.swRegistration.active) {
        this.swRegistration.active.postMessage({ type: 'OFFLINE_MODE' });
      }
    });
  }

  // Get service worker registration
  getRegistration() {
    return this.swRegistration;
  }

  // Check if service worker is active
  isActive() {
    return this.swRegistration && this.swRegistration.active;
  }
}

// Create global instance
const swManager = new ServiceWorkerManager();

// Auto-register on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    await swManager.register();
    swManager.setupOnlineListeners();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceWorkerManager;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ServiceWorkerManager = ServiceWorkerManager;
  window.swManager = swManager;
} 