'use client';

import { useEffect, useRef } from 'react';

interface SimpleSplineEmbedProps {
  url: string;
  className?: string;
}

export default function SimpleSplineEmbed({ url, className = '' }: SimpleSplineEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear the container
    containerRef.current.innerHTML = '';

    // Create the script element
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';
    script.onload = () => {
      // Create the spline-viewer element
      const splineViewer = document.createElement('spline-viewer');
      splineViewer.setAttribute('url', url);
      splineViewer.style.width = '100%';
      splineViewer.style.height = '100%';
      
      // Add it to the container
      containerRef.current?.appendChild(splineViewer);
    };

    // Add script to head
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      const existingScript = document.querySelector('script[src*="spline-viewer.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [url]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Fallback content while loading */}
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🏟️</div>
          <div className="text-zinc-300 text-lg font-semibold">Loading 3D Scene...</div>
          <div className="text-zinc-500 text-sm mt-2">Powered by Spline</div>
        </div>
      </div>
    </div>
  );
} 