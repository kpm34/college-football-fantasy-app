"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserGroupIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";

type League = {
  $id: string;
  name: string;
  status: string;
  maxTeams: number;
  teams: number;
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
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const palette = {
    maroon: '#3A1220',
    orange: '#E89A5C',
    periwinkle: '#8091BB',
    tan: '#D9BBA4',
    gold: '#DAA520',
    bronze: '#B8860B',
  } as const;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchUserLeagues();
  }, [user, authLoading, router]);

  const fetchUserLeagues = async () => {
    try {
      const response = await fetch('/api/leagues/my-leagues');
      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }
      
      const data = await response.json();
      setLeagues(data.leagues || []);
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
        <div className="aurora-bg" />
        <div className="text-[var(--color-text)]">Loading your leagues...</div>
      </main>
    );
  }

  const getTeamForLeague = (leagueId: string) => {
    return teams.find(team => team.leagueId === leagueId);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="aurora-bg" />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
            <p className="text-muted">Welcome back, {user?.name || user?.email}!</p>
          </div>
          <Link
            href="/account/settings"
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Account Settings
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/draft/mock"
            className="surface-card rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--color-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Mock Draft</h3>
                <p className="text-sm text-muted">Practice your draft strategy</p>
              </div>
            </div>
          </Link>

          <Link
            href="/league/create"
            className="surface-card rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Create League</h3>
                <p className="text-sm text-muted">Start your own league</p>
              </div>
            </div>
          </Link>

          <Link
            href="/league/join"
            className="surface-card rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Join League</h3>
                <p className="text-sm text-muted">Find a league to join</p>
              </div>
            </div>
          </Link>
        </div>

        {leagues.length === 0 ? (
          <div className="rounded-2xl p-8 text-center surface-card">
            <UserGroupIcon className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
            <h2 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No Leagues Yet</h2>
            <p className="text-muted mb-6">Join or create a league to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => {
              const team = getTeamForLeague(league.$id);
              return (
                <div
                  key={league.$id}
                  className="rounded-2xl p-6 transition-all surface-card hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{league.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      league.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      league.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {league.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {team && (
                    <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-sm text-muted mb-1">{team.name}</p>
                      <div className="flex gap-4 text-sm text-muted">
                        <span>{team.wins}-{team.losses}</span>
                        <span>{team.pointsFor.toFixed(1)} PF</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{league.teams}/{league.maxTeams} teams</span>
                    </div>
                    {league.draftDate && (
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Draft: {new Date(league.draftDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/league/${league.$id}`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors btn-primary"
                    >
                      League Home
                    </Link>
                    <Link
                      href={`/league/${league.$id}/locker-room`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: 'var(--color-secondary)', color: '#fff' }}
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