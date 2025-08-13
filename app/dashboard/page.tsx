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
      <main className="min-h-screen bg-gradient-to-br from-[#0B0E13] via-[#1c1117] to-[#0B0E13] flex items-center justify-center">
        <div className="text-white/60">Loading your leagues...</div>
      </main>
    );
  }

  const getTeamForLeague = (leagueId: string) => {
    return teams.find(team => team.leagueId === leagueId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B0E13] via-[#1c1117] to-[#0B0E13]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back, {user?.name || user?.email}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/draft/mock"
            className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur rounded-xl p-6 border border-blue-600/20 hover:border-blue-600/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Mock Draft</h3>
                <p className="text-white/60 text-sm">Practice your draft strategy</p>
              </div>
            </div>
          </Link>

          <Link
            href="/league/create"
            className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur rounded-xl p-6 border border-green-600/20 hover:border-green-600/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Create League</h3>
                <p className="text-white/60 text-sm">Start your own league</p>
              </div>
            </div>
          </Link>

          <Link
            href="/league/join"
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur rounded-xl p-6 border border-purple-600/20 hover:border-purple-600/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Join League</h3>
                <p className="text-white/60 text-sm">Find a league to join</p>
              </div>
            </div>
          </Link>
        </div>

        {leagues.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <UserGroupIcon className="h-16 w-16 mx-auto text-white/40 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No Leagues Yet</h2>
            <p className="text-white/60 mb-6">Join or create a league to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => {
              const team = getTeamForLeague(league.$id);
              return (
                <div
                  key={league.$id}
                  className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">{league.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      league.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      league.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {league.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {team && (
                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-white/80 mb-1">{team.name}</p>
                      <div className="flex gap-4 text-sm text-white/60">
                        <span>{team.wins}-{team.losses}</span>
                        <span>{team.pointsFor.toFixed(1)} PF</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{league.teams}/{league.maxTeams} teams</span>
                    </div>
                    {league.draftDate && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Draft: {new Date(league.draftDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/league/${league.$id}`}
                      className="flex-1 text-center py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      League Home
                    </Link>
                    <Link
                      href={`/league/${league.$id}/locker-room`}
                      className="flex-1 text-center py-2 bg-[#5C1F30] hover:bg-[#4A1626] rounded-lg text-white text-sm font-medium transition-colors"
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