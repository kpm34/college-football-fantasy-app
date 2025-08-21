'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { POWER4_CONFERENCES, POWER4_TEAM_SET, type Power4Conference } from '@/lib/power4';
import { ScheduleNavigation } from '@/components/schedule/ScheduleNavigation';

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
  const [conference, setConference] = useState<'All' | Power4Conference>('All');
  const [team, setTeam] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ week: String(week) });
        if (conference !== 'All') params.set('conference', conference);
        if (team !== 'All') params.set('team', team);
        const res = await fetch(`/api/games/cached?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        const power4Filtered = (data.games || []).filter((g: any) =>
          POWER4_TEAM_SET.has(g.homeTeam) || POWER4_TEAM_SET.has(g.awayTeam)
        );
        setGames(power4Filtered.map((g: any) => ({
          id: g.$id,
          awayTeam: g.awayTeam,
          homeTeam: g.homeTeam,
          awayScore: g.awayScore,
          homeScore: g.homeScore,
          status: g.status,
          startTime: g.startTime,
        })));
      } catch (e) {
        console.error('Failed to load games', e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [week, conference, team]);

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
            
            <div className="flex items-center gap-4 flex-wrap">
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

              {/* Filters */}
              <div className="ml-2 flex items-center gap-2">
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
      </div>

      {/* College Schedule (Primary) */}
      <div className="container mx-auto px-4 py-8 relative">
        <ScheduleNavigation />
      </div>

      {/* Live Scoreboard (Secondary) */}
      <div className="container mx-auto px-4 pb-12 relative">
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