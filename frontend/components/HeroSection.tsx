'use client';

import ChromeHelmetScene from './ChromeHelmetScene';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Chrome Helmet Background */}
      <div className="absolute inset-0 z-0">
        <ChromeHelmetScene />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
          College Football Fantasy
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 drop-shadow-lg">
          Power 4 Conferences Only • AP Top-25 Matchups • Conference Games
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105">
            Start League
          </button>
          <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105">
            Join League
          </button>
        </div>
      </div>
    </section>
  );
}