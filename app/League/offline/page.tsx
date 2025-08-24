'use client';

import { useEffect, useState } from 'react';
import { WifiIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check if we're back online
    const checkOnline = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        // Redirect to dashboard when back online
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    };

    // Check initially
    checkOnline();

    // Listen for online/offline events
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8C1818] via-[#F24607] to-[#8091BB] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <WifiIcon className={`h-12 w-12 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          {isOnline ? 'Back Online!' : "You're Offline"}
        </h1>
        
        <p className="text-white/80 mb-8">
          {isOnline 
            ? 'Reconnecting to CFB Fantasy...' 
            : 'Check your internet connection to access your fantasy teams.'}
        </p>

        {!isOnline && (
          <>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 mb-6"
            >
              Try Again
            </button>

            <div className="text-left space-y-3 text-white/70 text-sm">
              <h2 className="text-white font-semibold mb-2">While offline, you can:</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>View cached team rosters and standings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check previously loaded scores</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Browse league information</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {isOnline && (
          <div className="animate-pulse">
            <div className="w-16 h-1 bg-white/40 rounded-full mx-auto mb-1"></div>
            <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mb-1"></div>
            <div className="w-8 h-1 bg-white/40 rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
