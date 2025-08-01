'use client';

import { useEffect } from 'react';

interface SplineViewerProps {
  url: string;
  className?: string;
  background?: string;
  eventsTarget?: 'global' | 'local';
}

export default function SplineViewer({ 
  url, 
  className = '', 
  background,
  eventsTarget = 'global'
}: SplineViewerProps) {
  useEffect(() => {
    // Load the Spline viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className={className}>
      <spline-viewer 
        url={url}
        background={background}
        events-target={eventsTarget}
      />
    </div>
  );
} 