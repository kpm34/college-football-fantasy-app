'use client';

import { useState, useRef, Suspense, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Application } from '@splinetool/runtime';
import { SPLINE_SCENES, CONFERENCES, ANIMATION_CONFIG } from '@/lib/spline-constants';

// Simple dynamic import for Spline
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <SplineLoadingSpinner />
});

interface SplineSceneProps {
  sceneUrl: string;
  className?: string;
  onLoad?: (spline: Application) => void;
  fallback?: React.ReactNode;
  showLoadingSpinner?: boolean;
}

export default function SplineScene({ 
  sceneUrl, 
  className = '', 
  onLoad, 
  fallback,
  showLoadingSpinner = true 
}: SplineSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const splineRef = useRef<Application | null>(null);

  function handleLoad(splineApp: Application) {
    splineRef.current = splineApp;
    setIsLoading(false);
    setHasError(false);
    
    if (onLoad) {
      onLoad(splineApp);
    }
  }

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-lg ${className}`}>
        {fallback || (
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🏈</div>
            <div className="text-zinc-400 text-sm">3D Scene Unavailable</div>
            <div className="text-zinc-500 text-xs mt-1">Please try refreshing the page</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded-lg z-10">
          <SplineLoadingSpinner />
        </div>
      )}
      
      <Suspense fallback={<SplineLoadingSpinner />}>
        <Spline
          scene={sceneUrl}
          onLoad={handleLoad}
        />
      </Suspense>
    </div>
  );
}

// Loading spinner component
function SplineLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-yellow-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
      </div>
      <div className="mt-4 text-zinc-400 text-sm font-medium">Loading 3D Scene...</div>
    </div>
  );
}

// Use constants for scene URLs
export const SplineScenes = SPLINE_SCENES;

// Specialized components for common use cases
export function StadiumScene({ className }: { className?: string }) {
  return (
    <SplineScene
      sceneUrl={SPLINE_SCENES.STADIUM}
      className={className}
      fallback={
        <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏟️</div>
            <div className="text-zinc-300 text-lg font-semibold">College Football Stadium</div>
          </div>
        </div>
      }
    />
  );
}

interface ConferenceLogosSceneProps {
  className?: string;
  onConferenceClick?: (conference: string) => void;
  selectedConference?: string;
}

export function ConferenceLogosScene({ 
  className, 
  onConferenceClick,
  selectedConference 
}: ConferenceLogosSceneProps) {
  const animationRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const splineRef = useRef<Application | null>(null);

  const handleLoad = useCallback((spline: Application) => {
    splineRef.current = spline;
    
    // Clear any existing animations
    Object.values(animationRefs.current).forEach(clearInterval);
    animationRefs.current = {};

    // Setup rotation animations for each conference logo
    Object.values(CONFERENCES).forEach(conf => {
      const logo = spline.findObjectByName(conf.objectName);
      if (logo) {
        // Add continuous rotation animation
        const interval = setInterval(() => {
          if (logo && splineRef.current) {
            logo.rotation.y += ANIMATION_CONFIG.ROTATION_SPEED;
          }
        }, ANIMATION_CONFIG.ANIMATION_INTERVAL);
        
        animationRefs.current[conf.objectName] = interval;
      }
    });

    // Setup click handlers for conference logos
    const handleLogoClick = (e: any) => {
      const clickedObject = e.target;
      const conferenceKey = Object.keys(CONFERENCES).find(
        key => CONFERENCES[key as keyof typeof CONFERENCES].objectName === clickedObject.name
      );
      
      if (conferenceKey && onConferenceClick) {
        // Visual feedback - scale up briefly
        clickedObject.scale.x = ANIMATION_CONFIG.CLICK_SCALE;
        clickedObject.scale.y = ANIMATION_CONFIG.CLICK_SCALE;
        clickedObject.scale.z = ANIMATION_CONFIG.CLICK_SCALE;
        
        // Reset scale after animation
        setTimeout(() => {
          clickedObject.scale.x = 1;
          clickedObject.scale.y = 1;
          clickedObject.scale.z = 1;
        }, 200);
        
        onConferenceClick(CONFERENCES[conferenceKey as keyof typeof CONFERENCES].name);
      }
    };

    spline.addEventListener('mouseDown', handleLogoClick);
  }, [onConferenceClick]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      Object.values(animationRefs.current).forEach(clearInterval);
    };
  }, []);

  // Highlight selected conference
  useEffect(() => {
    if (splineRef.current && selectedConference) {
      Object.values(CONFERENCES).forEach(conf => {
        const logo = splineRef.current?.findObjectByName(conf.objectName);
        if (logo) {
          if (conf.name === selectedConference) {
            // Highlight selected conference
            logo.scale.x = ANIMATION_CONFIG.HOVER_SCALE;
            logo.scale.y = ANIMATION_CONFIG.HOVER_SCALE;
            logo.scale.z = ANIMATION_CONFIG.HOVER_SCALE;
          } else {
            // Reset other conferences
            logo.scale.x = 1;
            logo.scale.y = 1;
            logo.scale.z = 1;
          }
        }
      });
    }
  }, [selectedConference]);

  return (
    <SplineScene
      sceneUrl={SPLINE_SCENES.CONFERENCE_LOGOS}
      className={className}
      onLoad={handleLoad}
      fallback={
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-4">
            {Object.values(CONFERENCES).map((conf) => (
              <div 
                key={conf.name} 
                className={`text-center p-4 bg-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-600 transition-colors ${
                  selectedConference === conf.name ? 'ring-2 ring-yellow-500' : ''
                }`}
                onClick={() => onConferenceClick?.(conf.name)}
              >
                <div className="text-2xl mb-2">🏈</div>
                <div className="text-zinc-300 text-sm font-medium">{conf.name}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}