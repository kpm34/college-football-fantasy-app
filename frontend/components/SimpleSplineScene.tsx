'use client';

import React from 'react';
import { SPLINE_SCENES, CONFERENCES } from '@/lib/spline-constants';

interface SimpleSplineSceneProps {
  sceneUrl: string;
  className?: string;
  onLoad?: (spline: any) => void;
  fallback?: React.ReactNode;
  showLoadingSpinner?: boolean;
}

export default function SimpleSplineScene({ 
  sceneUrl, 
  className = '', 
  onLoad, 
  fallback,
  showLoadingSpinner = true 
}: SimpleSplineSceneProps) {
  // Simulate loading
  React.useEffect(() => {
    if (onLoad) {
      // Simulate a simple spline object
      const mockSpline = {
        findObjectByName: (name: string) => null,
        addEventListener: () => {},
      };
      setTimeout(() => onLoad(mockSpline), 1000);
    }
  }, [onLoad]);

  return (
    <div className={`w-full h-full ${className}`}>
      {fallback || (
        <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏟️</div>
            <div className="text-zinc-300 text-lg font-semibold">3D Scene Placeholder</div>
            <div className="text-zinc-500 text-sm mt-2">Add your Spline scene URL to see 3D content</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SimpleStadiumScene({ className }: { className?: string }) {
  return (
    <SimpleSplineScene
      sceneUrl={SPLINE_SCENES.STADIUM}
      className={className}
      fallback={
        <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏟️</div>
            <div className="text-zinc-300 text-lg font-semibold">College Football Stadium</div>
            <div className="text-zinc-500 text-sm mt-2">Create a stadium scene in Spline</div>
          </div>
        </div>
      }
    />
  );
}

interface SimpleConferenceLogosSceneProps {
  className?: string;
  onConferenceClick?: (conference: string) => void;
  selectedConference?: string;
}

export function SimpleConferenceLogosScene({ 
  className, 
  onConferenceClick,
  selectedConference 
}: SimpleConferenceLogosSceneProps) {
  return (
    <div className={`w-full h-full bg-zinc-800 flex items-center justify-center ${className}`}>
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
  );
} 