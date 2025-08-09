"use client";

import { useState } from "react";

interface FootballHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function FootballHamburger({ isOpen, onClick }: FootballHamburgerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="relative w-12 h-12 flex items-center justify-center group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Open menu"
    >
      {/* Football outline shape - appears on hover */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isHovered || isOpen
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-90 rotate-12"
        }`}
      >
        {/* Realistic football shape with better proportions */}
        <div
          className="relative w-10 h-7"
          style={{
            background: "linear-gradient(145deg, #8B4513 0%, #A0522D 25%, #654321 50%, #8B4513 75%, #654321 100%)",
            borderRadius: "50% / 40%",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
            transform: `rotate(${isHovered || isOpen ? "0deg" : "15deg"})`,
          }}
        >
          {/* Football texture pattern */}
          <div 
            className="absolute inset-0"
            style={{
              background: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
              borderRadius: "inherit",
            }}
          />
          
          {/* Highlight on top */}
          <div 
            className="absolute top-1 left-1/2 -translate-x-1/2 w-4/5 h-1/3"
            style={{
              background: "ellipse at center, rgba(255,255,255,0.2) 0%, transparent 60%",
              filter: "blur(2px)",
            }}
          />
        </div>
      </div>

      {/* Hamburger lines that transform into football laces */}
      <div className="relative z-10 w-6 h-5 flex flex-col justify-between">
        {/* Top line - becomes top stitch */}
        <span
          className={`block bg-white transition-all duration-500 ${
            isHovered || isOpen
              ? "w-[2px] h-[8px] rotate-[20deg] translate-x-[3px] -translate-y-[1px] bg-white shadow-sm"
              : "w-full h-[2px]"
          }`}
          style={{
            transformOrigin: "center",
          }}
        />
        
        {/* Middle line - becomes center lace */}
        <span
          className={`block bg-white transition-all duration-500 ${
            isHovered || isOpen
              ? "w-[2px] h-[10px] rotate-0 bg-white shadow-sm"
              : "w-full h-[2px]"
          }`}
          style={{
            transformOrigin: "center",
          }}
        />
        
        {/* Bottom line - becomes bottom stitch */}
        <span
          className={`block bg-white transition-all duration-500 ${
            isHovered || isOpen
              ? "w-[2px] h-[8px] rotate-[-20deg] translate-x-[3px] translate-y-[1px] bg-white shadow-sm"
              : "w-full h-[2px]"
          }`}
          style={{
            transformOrigin: "center",
          }}
        />

        {/* Cross laces (horizontal stitches) - appear on hover */}
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center gap-[3px] transition-opacity duration-300 ${
            isHovered || isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="block w-[10px] h-[1.5px] bg-white shadow-sm" />
          <span className="block w-[12px] h-[1.5px] bg-white shadow-sm" />
          <span className="block w-[10px] h-[1.5px] bg-white shadow-sm" />
        </div>
      </div>

      {/* Subtle glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(circle, rgba(165,42,42,0.2) 0%, transparent 60%)",
          filter: "blur(10px)",
        }}
      />
    </button>
  );
}
