'use client';

import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';
import { useRef, useState, Suspense } from 'react';

interface SplineSceneEnhancedProps {
  sceneUrl: string;
  className?: string;
  onLoad?: (spline: Application) => void;
  fallbackImage?: string;
  showLoadingProgress?: boolean;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-zinc-900/50 backdrop-blur-sm">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-zinc-700 rounded-full animate-spin border-t-yellow-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-zinc-400 font-mono">Loading 3D</span>
        </div>
      </div>
    </div>
  );
}

function ErrorFallback({ error, fallbackImage }: { error: Error; fallbackImage?: string }) {
  return (
    <div className="flex items-center justify-center w-full h-full bg-zinc-900/80 backdrop-blur-sm">
      <div className="text-center space-y-4 p-8">
        <div className="text-red-500 text-5xl">⚠️</div>
        <p className="text-zinc-300 text-sm">Failed to load 3D scene</p>
        <p className="text-zinc-500 text-xs font-mono">{error.message}</p>
        {fallbackImage && (
          <img 
            src={fallbackImage} 
            alt="Fallback" 
            className="mt-4 rounded-lg opacity-50 max-w-full h-auto"
          />
        )}
      </div>
    </div>
  );
}

export default function SplineSceneEnhanced({ 
  sceneUrl, 
  className = '', 
  onLoad,
  fallbackImage,
  showLoadingProgress = true 
}: SplineSceneEnhancedProps) {
  const splineRef = useRef<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  function handleLoad(splineApp: Application) {
    try {
      splineRef.current = splineApp;
      setIsLoading(false);
      setLoadProgress(100);
      
      if (onLoad) {
        onLoad(splineApp);
      }
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }

  function handleError(err: Error) {
    console.error('Spline scene error:', err);
    setError(err);
    setIsLoading(false);
  }

  // Simulate progress for better UX
  useState(() => {
    if (showLoadingProgress && isLoading) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  });

  if (error) {
    return <ErrorFallback error={error} fallbackImage={fallbackImage} />;
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <LoadingSpinner />
          {showLoadingProgress && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-48">
              <div className="bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="text-center text-xs text-zinc-500 mt-2">{loadProgress}%</p>
            </div>
          )}
        </div>
      )}
      
      <Suspense fallback={<LoadingSpinner />}>
        <Spline
          scene={sceneUrl}
          onLoad={handleLoad}
          onError={handleError}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        />
      </Suspense>
    </div>
  );
}

export { SplineSceneEnhanced };