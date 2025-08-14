'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ServiceWorkerRegistration() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered:', reg);
          setRegistration(reg);

          // Check for updates every hour
          setInterval(() => {
            reg.update();
          }, 60 * 60 * 1000);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  toast.info('New version available! Click to refresh.', {
                    duration: 0,
                    action: {
                      label: 'Refresh',
                      onClick: () => window.location.reload()
                    }
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle controller change (update activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  return null;
}
