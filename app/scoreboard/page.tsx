'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface Game {
  id: string;
  awayTeam: string;
  homeTeam: string;
  awayScore: number;
  homeScore: number;
  status: string;
  startTime: string;
  quarter?: string;
  timeRemaining?: string;
}

export default function ScoreboardPage() {
  const { user } = useAuth();
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch current week games
    setLoading(false);
  }, [week]);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      <div className="aurora-bg" />
      
      {/* Header */}
      <div className="surface-card border-b border-white/10 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">College Football Scoreboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setWeek(Math.max(1, week - 1))}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Previous
              </button>
              <span className="text-white font-medium">Week {week}</span>
              <button
                onClick={() => setWeek(Math.min(12, week + 1))}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {loading ? (
          <div className="text-center text-white/60 py-12">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="surface-card rounded-xl p-12 text-center">
            <p className="text-xl text-white/60">No games scheduled for Week {week}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <div key={game.id} className="surface-card rounded-xl p-6">
                <div className="text-sm text-white/60 mb-2">{game.status}</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{game.awayTeam}</span>
                    <span className="text-2xl font-bold text-white">{game.awayScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{game.homeTeam}</span>
                    <span className="text-2xl font-bold text-white">{game.homeScore}</span>
                  </div>
                </div>
                {game.quarter && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60 text-center">
                    {game.quarter} - {game.timeRemaining}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}