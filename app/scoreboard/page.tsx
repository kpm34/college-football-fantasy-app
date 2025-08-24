'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@lib/hooks/useAuth'
import { POWER4_CONFERENCES, POWER4_TEAM_SET, type Power4Conference } from '@lib/power4';
import { ScheduleNavigation } from '@components/features/leagues/ScheduleNavigation';

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
  const [games, setGames] = useState<Game[]>([]);
  const [conference, setConference] = useState<'All' | Power4Conference>('All');
  const [team, setTeam] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(2); // Default to week 2 for now

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ week: String(currentWeek) });
        if (conference !== 'All') params.set('conference', conference);
        if (team !== 'All') params.set('team', team);
        const res = await fetch(`/api/games/cached?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        const power4Filtered = (data.games || []).filter((g: any) =>
          POWER4_TEAM_SET.has(g.homeTeam) || POWER4_TEAM_SET.has(g.awayTeam)
        );
        setGames(power4Filtered.map((g: any) => ({
          id: g.$id || g.id,
          awayTeam: g.awayTeam || 'TBD',
          homeTeam: g.homeTeam || 'TBD',
          awayScore: g.awayScore || 0,
          homeScore: g.homeScore || 0,
          status: g.status || 'Scheduled',
          startTime: g.startTime || g.date,
        })));
      } catch (e) {
        console.error('Failed to load games', e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentWeek, conference, team]);

  const teamsForSelectedConference = useMemo(() => {
    if (conference === 'All') return ['All', ...Array.from(POWER4_TEAM_SET).sort()];
    return ['All', ...POWER4_CONFERENCES[conference].slice().sort()];
  }, [conference]);

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
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={conference}
                onChange={(e) => setConference(e.target.value as any)}
                className="rounded-md bg-white/10 text-white px-2 py-1 border border-white/10"
              >
                <option value="All">All Conferences</option>
                <option value="SEC">SEC</option>
                <option value="ACC">ACC</option>
                <option value="Big 12">Big 12</option>
                <option value="Big Ten">Big Ten</option>
              </select>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="rounded-md bg-white/10 text-white px-2 py-1 border border-white/10"
              >
                {teamsForSelectedConference.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* College Schedule (Primary) */}
      <div className="container mx-auto px-4 py-8 relative">
        <ScheduleNavigation />
      </div>

      {/* Live Scoreboard (Secondary) - Only show if there are games */}
      {games.length > 0 && (
        <div className="container mx-auto px-4 pb-12 relative">
          <h2 className="text-xl font-bold text-white mb-6">Live Scores</h2>
          {loading ? (
            <div className="text-center text-white/60 py-12">Loading games...</div>
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
      )}
    </div>
  );
}