'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const splineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Spline viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js';
    script.onload = () => {
      // Create spline-viewer element after script loads
      if (splineContainerRef.current) {
        const splineViewer = document.createElement('spline-viewer');
        splineViewer.setAttribute('url', 'https://prod.spline.design/JlsVpBPjLj-iOBRj/scene.splinecode');
        splineViewer.style.width = '100%';
        splineViewer.style.height = '100%';
        splineContainerRef.current.appendChild(splineViewer);
        setTimeout(() => setSplineLoaded(true), 1000);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black"></div>
      
      {/* Spline 3D Scene Background */}
      <div 
        ref={splineContainerRef}
        className="absolute inset-0 opacity-70" 
        style={{ zIndex: 1 }}
      />
      
      {/* Loading Overlay */}
      {!splineLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-50" style={{ zIndex: 1 }}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4 p-8 glass-card rounded-xl">
              <h3 className="text-xl font-bold chrome-text">🏈 Loading 3D Scene</h3>
              <div className="w-16 h-16 border-4 border-slate-700 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
              <p className="text-slate-400 text-sm">Preparing immersive experience...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4" style={{ zIndex: 20 }}>
        <div className="text-center max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                <span className="chrome-text block">COLLEGE FOOTBALL</span>
                <span className="metallic-text block mt-2">FANTASY</span>
              </h1>
              
              {/* Chrome Shine Effect */}
              <div className="h-1 w-96 mx-auto chrome-shine rounded-full"></div>
            </div>
            
            {/* Description */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl max-w-3xl mx-auto">
                <p className="text-xl md:text-2xl text-slate-300 mb-4">
                  Play fantasy football with the Power 4 conferences.
                </p>
                <p className="text-lg md:text-xl chrome-text font-semibold">
                  Only elite matchups count - AP Top 25 & conference games!
                </p>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button variant="primary" size="lg">
                Start a League
              </Button>
              <Button variant="secondary" size="lg">
                Join League
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}