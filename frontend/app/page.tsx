'use client';

import { HeroSection } from '@/components/layouts/HeroSection';
import { FeaturesSection } from '@/components/layouts/FeaturesSection';
import { GamesSection } from '@/components/layouts/GamesSection';
import { ConferenceShowcase } from '@/components/layouts/ConferenceShowcase';

export default function Home() {
  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white min-h-screen overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-slate-600/5 to-slate-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section with 3D Scene */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Games Section */}
      <GamesSection />

      {/* Conference Showcase */}
      <ConferenceShowcase />
    </main>
  );
}