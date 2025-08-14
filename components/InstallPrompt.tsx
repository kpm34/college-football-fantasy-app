'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Handle install prompt for non-iOS devices
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS instructions if on iOS and not installed
    if (isIOSDevice && !window.navigator.standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('cfb-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  // iOS-specific instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 z-50 animate-slide-up">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#8C1818] rounded-lg p-2">
              <ArrowDownTrayIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Install CFB Fantasy</h3>
              <p className="text-sm text-gray-600">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700">
          <p className="flex items-center gap-2">
            <span>1.</span>
            <span>Tap the share button <span className="inline-block w-4 h-4 text-blue-500">⎘</span></span>
          </p>
          <p className="flex items-center gap-2">
            <span>2.</span>
            <span>Scroll down and tap "Add to Home Screen"</span>
          </p>
          <p className="flex items-center gap-2">
            <span>3.</span>
            <span>Tap "Add" to install</span>
          </p>
        </div>
      </div>
    );
  }

  // Standard install prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 z-50 animate-slide-up">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#8C1818] rounded-lg p-2">
            <ArrowDownTrayIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Install CFB Fantasy</h3>
            <p className="text-sm text-gray-600">Quick access from your home screen</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-[#8C1818] hover:bg-[#6C1414] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Install App
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
