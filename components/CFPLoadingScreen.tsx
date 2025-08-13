"use client";

import { useEffect, useState } from "react";

interface CFPLoadingScreenProps {
  isLoading: boolean;
  minDuration?: number; // Minimum duration to show loading screen
}

export default function CFPLoadingScreen({ isLoading, minDuration = 1500 }: CFPLoadingScreenProps) {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setFadeOut(false);
    } else if (show) {
      // Start fade out after minimum duration
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setShow(false), 500); // Wait for fade animation
      }, minDuration);
      return () => clearTimeout(timer);
    }
  }, [isLoading, show, minDuration]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #1a0f1f 0%, #0a0510 100%)",
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,.05) 35px,
              rgba(255,255,255,.05) 70px
            )`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Trophy/Football Container */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFD700] animate-spin" />
          
          {/* Inner rotating ring */}
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#C9B037] animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "2s" }}
          />
          
          {/* Realistic football in center */}
          <div className="absolute inset-6 flex items-center justify-center">
            <div
              className="w-28 h-20 relative animate-pulse"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateX(15deg) rotateY(-10deg)",
              }}
            >
              {/* Main football body */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(145deg, #8B4513 0%, #A0522D 15%, #654321 30%, #8B4513 45%, #654321 60%, #8B4513 75%, #654321 90%, #8B4513 100%)",
                  clipPath: "ellipse(50% 42% at 50% 50%)",
                  boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.15), 0 8px 20px rgba(0,0,0,0.3)",
                }}
              >
                {/* Leather texture */}
                <div 
                  className="absolute inset-0 opacity-25"
                  style={{
                    background: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
                    clipPath: "inherit",
                  }}
                />
                
                {/* Top highlight */}
                <div 
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-6"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, transparent 70%)",
                    filter: "blur(3px)",
                  }}
                />
              </div>
              
              {/* Laces */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {/* Center seam */}
                <div className="w-0.5 h-14 bg-white/90 shadow-md relative">
                  {/* Lace stitches */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                    {/* Top stitch */}
                    <div className="flex items-center gap-0.5 mt-1.5">
                      <div className="w-0.5 h-2.5 bg-white rounded-sm -rotate-[15deg] shadow-sm"></div>
                      <div className="w-2.5 h-0.5 bg-white rounded-full shadow-sm"></div>
                      <div className="w-0.5 h-2.5 bg-white rounded-sm rotate-[15deg] shadow-sm"></div>
                    </div>
                    
                    {/* Middle stitches */}
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-3 bg-white rounded-sm -rotate-[8deg] shadow-sm"></div>
                      <div className="w-3 h-0.5 bg-white rounded-full shadow-sm"></div>
                      <div className="w-0.5 h-3 bg-white rounded-sm rotate-[8deg] shadow-sm"></div>
                    </div>
                    
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-3 bg-white rounded-sm -rotate-[8deg] shadow-sm"></div>
                      <div className="w-3.5 h-0.5 bg-white rounded-full shadow-sm"></div>
                      <div className="w-0.5 h-3 bg-white rounded-sm rotate-[8deg] shadow-sm"></div>
                    </div>
                    
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-3 bg-white rounded-sm -rotate-[8deg] shadow-sm"></div>
                      <div className="w-3 h-0.5 bg-white rounded-full shadow-sm"></div>
                      <div className="w-0.5 h-3 bg-white rounded-sm rotate-[8deg] shadow-sm"></div>
                    </div>
                    
                    {/* Bottom stitch */}
                    <div className="flex items-center gap-0.5">
                      <div className="w-0.5 h-2.5 bg-white rounded-sm -rotate-[15deg] shadow-sm"></div>
                      <div className="w-2.5 h-0.5 bg-white rounded-full shadow-sm"></div>
                      <div className="w-0.5 h-2.5 bg-white rounded-sm rotate-[15deg] shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full animate-pulse">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2 font-bebas tracking-wider">
            COLLEGE FOOTBALL FANTASY
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
            <span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#FFD700]/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#C9B037]/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}
