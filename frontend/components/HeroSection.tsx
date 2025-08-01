'use client';

import { SplineSceneEnhanced } from './SplineSceneEnhanced';
import { useState, useEffect } from 'react';
import { api, Game } from '@/lib/api';
import Link from 'next/link';

export default function HeroSection() {
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  useEffect(() => {
    fetchLiveGames();
    const interval = setInterval(fetchLiveGames, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchLiveGames() {
    try {
      const games = await api.games.getCurrent();
      const live = games.filter((game: Game) => game.status === 'in_progress');
      setLiveGames(live.slice(0, 3)); // Show max 3 live games
    } catch (error) {
      console.error('Failed to fetch live games:', error);
    } finally {
      setIsLoadingGames(false);
    }
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-zinc-950">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 opacity-50">
        <SplineSceneEnhanced
          sceneUrl="https://prod.spline.design/YOUR-STADIUM-SCENE/scene.splinecode"
          className="w-full h-full"
          fallbackImage="/stadium-fallback.jpg"
          showLoadingProgress={true}
          onLoad={(spline) => {
            // Add continuous animation to stadium
            const stadium = spline.findObjectByName('Stadium');
            if (stadium) {
              setInterval(() => {
                stadium.rotation.y += 0.001;
              }, 16);
            }
          }}
        />
      </div>

      {/* Live Games Ticker */}
      {liveGames.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500/90 backdrop-blur-sm z-20">
          <div className="flex items-center gap-6 px-4 py-2 overflow-x-auto">
            <span className="text-zinc-900 font-bold text-sm whitespace-nowrap">LIVE NOW</span>
            {liveGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="flex items-center gap-2 text-zinc-900 text-sm hover:text-zinc-700 transition-colors whitespace-nowrap"
              >
                <span className="animate-pulse">🔴</span>
                <span>{game.awayTeam} @ {game.homeTeam}</span>
                <span className="font-mono font-bold">
                  {game.awayPoints}-{game.homePoints}
                </span>
                <span className="text-xs opacity-75">Q{game.period}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Title with gradient */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              COLLEGE FOOTBALL
            </span>
            <br />
            <span className="text-white">FANTASY</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto">
            Draft Power 4 players. Start them only against Top 25 teams or in conference games.
            <span className="block mt-2 text-yellow-500 font-semibold">
              Strategy meets tradition.
            </span>
          </p>

          {/* Conference badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {['SEC', 'ACC', 'Big 12', 'Big Ten'].map((conf) => (
              <div
                key={conf}
                className="px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg text-zinc-300 font-mono text-sm hover:border-yellow-500 transition-colors"
              >
                {conf}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-zinc-900 font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all shadow-lg shadow-yellow-500/25"
            >
              Start Your League
            </Link>
            <Link
              href="/join"
              className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all"
            >
              Join a League
            </Link>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">12</div>
              <div className="text-sm text-zinc-500">Week Season</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">64</div>
              <div className="text-sm text-zinc-500">Power 4 Teams</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">25</div>
              <div className="text-sm text-zinc-500">Top Ranked</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-zinc-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>
    </section>
  );
}