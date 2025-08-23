'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { leagueColors } from '@/lib/theme/colors';
import { useLeagueMembersRealtime } from '@hooks/useLeagueMembersRealtime';

interface PageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default function LeagueStandingsPage({ params }: PageProps) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Use realtime members hook
  const membersRealtime = useLeagueMembersRealtime(leagueId);

  // Load league data
  useEffect(() => {
    if (!leagueId) return;

    const loadLeague = async () => {
      try {
        const response = await fetch(`/api/leagues/${leagueId}`);
        if (response.ok) {
          const data = await response.json();
          setLeague(data.league);
        }
      } catch (error) {
        console.error('Error loading league:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeague();
  }, [leagueId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: leagueColors.text.primary }}>League Not Found</h1>
          <Link href="/dashboard" className="hover:underline" style={{ color: leagueColors.primary.highlight }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Sort teams by wins, then by points
  const sortedTeams = [...(membersRealtime.teams || [])].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return (b.pointsFor || 0) - (a.pointsFor || 0);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
      {/* Header */}
      <div style={{ backgroundColor: leagueColors.background.secondary, borderBottom: `1px solid ${leagueColors.border.medium}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/league/${leagueId}`)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Back to league"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">{league.name} - Standings</h1>
                <p className="mt-1" style={{ color: leagueColors.text.muted }}>
                  Season {league.season || new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6">Rank</th>
                <th className="text-left py-4 px-6">Team</th>
                <th className="text-left py-4 px-6">Manager</th>
                <th className="text-center py-4 px-6">W-L</th>
                <th className="text-center py-4 px-6">Points For</th>
                <th className="text-center py-4 px-6">Points Against</th>
                <th className="text-center py-4 px-6">Streak</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr key={team.$id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-bold">
                    {index + 1}
                    {index === 0 && ' 🏆'}
                    {index === 1 && ' 🥈'}
                    {index === 2 && ' 🥉'}
                  </td>
                  <td className="py-4 px-6">
                    <Link 
                      href={`/league/${leagueId}/locker-room?fantasy_team_id=${team.$id}`} 
                      className="font-semibold hover:underline"
                      style={{ color: leagueColors.primary.highlight }}
                    >
                      {team.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6">{team.userName || 'Unknown'}</td>
                  <td className="text-center py-4 px-6 font-medium">
                    {team.wins}-{team.losses}
                  </td>
                  <td className="text-center py-4 px-6">{(team.pointsFor || 0).toFixed(2)}</td>
                  <td className="text-center py-4 px-6">{(team.pointsAgainst || 0).toFixed(2)}</td>
                  <td className="text-center py-4 px-6">
                    <span className="text-sm">-</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedTeams.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: leagueColors.text.muted }}>No teams in this league yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
