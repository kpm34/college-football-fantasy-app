'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import GamesList from '@/components/GamesList';
import { SPLINE_SCENES } from '@/lib/spline-constants';
import { SplineErrorBoundary } from '@/components/ErrorBoundary';
import { SimpleStadiumScene, SimpleConferenceLogosScene } from '@/components/SimpleSplineScene';

// Dynamically import SplineScene components to avoid SSR issues
const SplineScene = dynamic(() => import('@/components/SplineScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-zinc-700 rounded-full animate-spin border-t-yellow-500 mx-auto"></div>
        <div className="text-2xl font-bold text-yellow-500 animate-pulse">Loading Stadium...</div>
      </div>
    </div>
  ),
});

const ConferenceLogosScene = dynamic(() => import('@/components/SplineScene').then(mod => ({ default: mod.ConferenceLogosScene })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
      <div className="text-center">
        <div className="text-2xl mb-2">🏈</div>
        <div className="text-zinc-300 text-sm">Loading 3D Logos...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedConference, setSelectedConference] = useState<string | undefined>();

  const handleConferenceClick = (conference: string) => {
    setSelectedConference(conference);
    // TODO: Filter games by conference
    console.log(`Selected conference: ${conference}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      {/* Hero Section with Spline 3D */}
      <section className="relative h-screen overflow-hidden">
        {/* 3D Background with proper z-index */}
        <div className="absolute inset-0 z-0">
          <SplineErrorBoundary>
            <Suspense fallback={
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <div className="text-center space-y-4 p-8 bg-zinc-800/50 rounded-xl">
                  <h3 className="text-xl font-bold text-yellow-500">🏈 Loading Stadium Scene</h3>
                  <div className="w-16 h-16 border-4 border-zinc-700 rounded-full animate-spin border-t-yellow-500 mx-auto"></div>
                  <p className="text-zinc-400 text-sm">Preparing 3D experience...</p>
                </div>
              </div>
            }>
              <div className="w-full h-full opacity-60">
                <SimpleStadiumScene className="w-full h-full" />
              </div>
            </Suspense>
          </SplineErrorBoundary>
        </div>
        
        {/* Hero Content with proper z-index layering */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                COLLEGE FOOTBALL
              </span>
              <span className="block text-5xl md:text-7xl text-white mt-2">FANTASY</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto">
              Play fantasy football with the Power 4 conferences.
              <span className="block mt-2 text-yellow-400 font-semibold">
                Only elite matchups count - AP Top 25 & conference games!
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all shadow-lg shadow-yellow-500/25">
                Start a League
              </button>
              <button className="bg-zinc-900/80 backdrop-blur border-2 border-zinc-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all">
                Join League
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Why Play With Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Power 4 Only"
              description="SEC, ACC, Big 12, and Big Ten - only the best conferences"
              icon="🏈"
            />
            <FeatureCard 
              title="Elite Matchups"
              description="Start players only in AP Top-25 or conference games"
              icon="🏆"
            />
            <FeatureCard 
              title="Live Scoring"
              description="Real-time updates powered by ESPN data"
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">This Week's Games</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            Games with golden borders are eligible for fantasy scoring - AP Top 25 matchups or conference games only!
          </p>
          
          <div className="mb-8">
            <GamesList />
          </div>
          
          <div className="text-center">
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition">
              View All Games
            </button>
          </div>
        </div>
      </section>

      {/* Conference Showcase */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Featured Conferences</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <ConferenceCard 
              name="SEC" 
              color="bg-red-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
            <ConferenceCard 
              name="Big Ten" 
              color="bg-blue-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
            <ConferenceCard 
              name="ACC" 
              color="bg-orange-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
            <ConferenceCard 
              name="Big 12" 
              color="bg-purple-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl hover:border-yellow-500/50 hover:bg-zinc-700 transition-all group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function ConferenceCard({ 
  name, 
  color, 
  onConferenceClick, 
  selectedConference 
}: { 
  name: string; 
  color: string; 
  onConferenceClick?: (conference: string) => void;
  selectedConference?: string;
}) {
  return (
    <div className={`${color} p-8 rounded-xl hover:scale-105 transition-all transform relative overflow-hidden group h-48`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <h3 className="text-2xl font-bold text-center text-white relative z-10 mb-4">{name}</h3>
      
      {/* 3D Conference Logo */}
      <div className="relative z-10 h-32 w-full">
        <SplineErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🏈</div>
                <div className="text-white text-sm font-medium">{name}</div>
              </div>
            </div>
          }>
            <SimpleConferenceLogosScene 
              className="w-full h-full"
              onConferenceClick={onConferenceClick}
              selectedConference={selectedConference}
            />
          </Suspense>
        </SplineErrorBoundary>
      </div>
    </div>
  );
}