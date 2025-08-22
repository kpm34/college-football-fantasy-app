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
        {/* CFP Logo Container */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FFD700] animate-spin" style={{ animationDuration: "3s" }} />
          {/* Inner rotating ring */}
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#C9B037] animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "4s" }}
          />
          {/* Stylized CFP logo (inline SVG) */}
          <div className="absolute inset-6 flex items-center justify-center">
            <svg
              className="w-28 h-28 animate-pulse"
              viewBox="0 0 120 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#C9B037" />
                </linearGradient>
                <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Two gold leaf strokes (left and right) */}
              <path d="M60 20 A 42 70 0 0 0 60 160" stroke="url(#goldGrad)" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#goldGlow)" />
              <path d="M60 20 A 42 70 0 0 1 60 160" stroke="url(#goldGrad)" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#goldGlow)" />
              {/* Inner dark fill */}
              <ellipse cx="60" cy="90" rx="34" ry="62" fill="#0b0b0f" />
              {/* Center seam */}
              <rect x="58" y="38" width="4" height="104" rx="2" fill="#FFFFFF" />
              {/* Laces (8 subtle dashes) */}
              <rect x="52" y="56" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="64" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="72" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="80" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="88" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="96" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="104" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
              <rect x="52" y="112" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
            </svg>
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
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#FFD700]/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#C9B037]/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}
