"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserGroupIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@lib/hooks/useAuth';
import { useUserLeaguesRealtime } from '@lib/hooks/useUserLeaguesRealtime';

type League = {
  $id: string;
  name: string;
  status: string;
  maxTeams: number;
  currentTeams?: number;
  commissioner: string;
  draftDate?: string;
};

type Team = {
  $id: string;
  leagueId: string;
  name: string;
  wins: number;
  losses: number;
  pointsFor: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [deletedMessage, setDeletedMessage] = useState(false);
  
  // Use real-time hook for leagues
  const userLeaguesRealtime = useUserLeaguesRealtime();
  const leagues = userLeaguesRealtime.leagues;
  const palette = {
    background: '#FFF4EC',       // off-white
    primary: '#5E2B8A',          // deep purple
    secondary: '#8A5EAA',        // soft purple
    accent: '#FF0080',           // pink accent
    brown: '#8A6B4D',            // warm brown
    card: 'rgba(255,255,255,0.9)',
    border: 'rgba(94,43,138,0.18)',
    muted: 'rgba(94,43,138,0.55)'
  } as const;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchUserLeagues();
    
    // Check for deletion message from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('deleted') === 'true') {
      setDeletedMessage(true);
      setTimeout(() => setDeletedMessage(false), 5000);
      // Remove param from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user, authLoading, router]);

  // Update loading state based on real-time hook
  useEffect(() => {
    setLoading(userLeaguesRealtime.loading);
  }, [userLeaguesRealtime.loading]);

  const fetchUserLeagues = async () => {
    try {
      // Teams are still fetched separately since they're not part of the real-time hook yet
      const response = await fetch('/api/leagues/my-leagues');
      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }
      
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      if (!userLeaguesRealtime.loading) {
        setLoading(false);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: palette.background }}>
        <div className="text-sm" style={{ color: palette.primary }}>Loading your leagues...</div>
      </main>
    );
  }

  const getTeamForLeague = (leagueId: string) => {
    return teams.find(team => team.leagueId === leagueId);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: palette.background }}>
      <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-bebas uppercase tracking-wide !text-3xl md:!text-4xl leading-tight mb-2" style={{ color: palette.primary }}>Dashboard</h1>
            <p style={{ color: palette.brown }}>Welcome back, {user?.name || user?.email}!</p>
          </div>
          <Link
            href="/account/settings"
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{ backgroundColor: palette.accent, color: '#fff' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Account Settings
          </Link>
        </div>

        {/* League Deletion Message */}
        {deletedMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-red-500">⚠️</div>
              <div>
                <h4 className="text-red-800 font-semibold">League Deleted</h4>
                <p className="text-red-600 text-sm">The league you were viewing has been deleted.</p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Connection Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${userLeaguesRealtime.connected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-sm" style={{ color: palette.muted }}>
              {userLeaguesRealtime.connected ? 'Live updates connected' : 'Connecting...'}
            </span>
          </div>
          <p className="text-sm" style={{ color: palette.muted }}>
            {leagues.length} league{leagues.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/draft/mock"
            className="rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: palette.card, border: `1px solid ${palette.border}` }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-8 h-8" style={{ color: palette.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: palette.primary }}>Mock Draft</h3>
                <p className="text-sm" style={{ color: palette.brown }}>Practice your draft strategy</p>
              </div>
            </div>
          </Link>

          <Link
            href="/league/create"
            className="rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: palette.card, border: `1px solid ${palette.border}` }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-8 h-8" style={{ color: palette.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: palette.primary }}>Create League</h3>
                <p className="text-sm" style={{ color: palette.brown }}>Start your own league</p>
              </div>
            </div>
          </Link>

          <Link
            href="/league/join"
            className="rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: palette.card, border: `1px solid ${palette.border}` }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-8 h-8" style={{ color: palette.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: palette.primary }}>Join League</h3>
                <p className="text-sm" style={{ color: palette.brown }}>Find a league to join</p>
              </div>
            </div>
          </Link>
        </div>

        {leagues.length === 0 && teams.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: palette.card, border: `1px solid ${palette.border}` }}>
            <UserGroupIcon className="h-16 w-16 mx-auto mb-4" style={{ color: palette.secondary }} />
            <h2 className="text-3xl font-semibold mb-2" style={{ color: palette.primary }}>No Leagues Yet</h2>
            <p style={{ color: palette.brown }} className="mb-6">Join or create a league to get started!</p>
          </div>
        ) : leagues.length === 0 && teams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.$id}
                className="rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ background: palette.card, border: `1px solid ${palette.border}` }}
              >
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <p className="text-sm text-white/80 mb-1">{team.name}</p>
                  <div className="flex gap-4 text-sm text-white/60">
                    <span>{team.wins}-{team.losses}</span>
                    <span>{Number(team.pointsFor || 0).toFixed(1)} PF</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/league/${team.leagueId}`}
                    className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors text-white bg-gradient-to-r from-[#DAA520] to-[#B8860B] hover:opacity-90"
                  >
                    League Home
                  </Link>
                  <Link
                    href={`/league/${team.leagueId}/locker-room`}
                    className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: '#8091BB' }}
                  >
                    Locker Room
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => {
              const team = getTeamForLeague(league.$id);
              return (
                <div
                  key={league.$id}
                  className="rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm"
                  style={{ background: 'rgba(30, 144, 255, 0.15)', border: '1px solid rgba(30, 144, 255, 0.25)' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold" style={{ color: palette.primary }}>{league.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      league.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      league.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {league.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {team && (
                    <div className="mb-4 p-3 rounded-lg" style={{ background: '#F5F0E6', border: `1px solid ${palette.border}` }}>
                      <p className="text-sm mb-1" style={{ color: palette.primary }}>{team.name}</p>
                      <div className="flex gap-4 text-sm" style={{ color: palette.brown }}>
                        <span>{team.wins}-{team.losses}</span>
                        <span>{team.pointsFor.toFixed(1)} PF</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: palette.brown }}>
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{(league as any).teams ?? league.currentTeams ?? 0}/{league.maxTeams} teams</span>
                    </div>
                    {league.draftDate && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: palette.brown }}>
                        <CalendarIcon className="h-4 w-4" />
                        <span>Draft: {new Date(league.draftDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/league/${league.$id}`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: palette.accent, color: '#fff' }}
                    >
                      League Home
                    </Link>
                    <Link
                      href={`/league/${league.$id}/locker-room`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: palette.secondary, color: '#fff' }}
                    >
                      Locker Room
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}