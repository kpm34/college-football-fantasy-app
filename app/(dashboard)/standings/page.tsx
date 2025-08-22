'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth'

interface TeamStanding {
  rank: number;
  team: string;
  conference: string;
  overall: string;
  conferenceRecord: string;
  apRank?: number;
  streak?: string;
}

export default function StandingsPage() {
  const { user } = useAuth();
  const [conference, setConference] = useState('ALL');
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  const conferences = ['ALL', 'SEC', 'Big Ten', 'ACC', 'Big 12'];

  useEffect(() => {
    // TODO: Fetch standings data
    setLoading(false);
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
              <h1 className="text-2xl font-bold text-white">Power 4 Standings</h1>
            </div>
            
            <div className="flex gap-2">
              {conferences.map((conf) => (
                <button
                  key={conf}
                  onClick={() => setConference(conf)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    conference === conf
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {loading ? (
          <div className="text-center text-white/60 py-12">Loading standings...</div>
        ) : standings.length === 0 ? (
          <div className="surface-card rounded-xl p-12 text-center">
            <p className="text-xl text-white/60">No standings data available</p>
          </div>
        ) : (
          <div className="surface-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/60">RANK</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/60">TEAM</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/60">CONF</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-white/60">OVERALL</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-white/60">CONF</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-white/60">AP</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-white/60">STREAK</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team) => (
                  <tr key={team.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{team.rank}</td>
                    <td className="py-4 px-6 font-medium text-white">{team.team}</td>
                    <td className="py-4 px-6 text-white/60">{team.conference}</td>
                    <td className="py-4 px-6 text-center text-white">{team.overall}</td>
                    <td className="py-4 px-6 text-center text-white/60">{team.conferenceRecord}</td>
                    <td className="py-4 px-6 text-center">
                      {team.apRank ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold">
                          {team.apRank}
                        </span>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {team.streak && (
                        <span className={`text-sm font-medium ${
                          team.streak.startsWith('W') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {team.streak}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}