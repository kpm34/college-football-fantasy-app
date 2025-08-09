'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

interface LeagueHomePageProps {
  params: Promise<{ leagueId: string }>;
}

interface League {
  $id: string;
  name: string;
  season_year: number;
  commissioner_user_id: string;
  scoring_settings: Record<string, number>;
  roster_settings: Record<string, number>;
  draft_settings: {
    type: string;
    rounds: number;
    start_time: string;
    time_per_pick: number;
  };
  waiver_settings: {
    type: string;
    reset_weekly: boolean;
    budget: number;
  };
  trade_deadline_week: number;
  game_mode: string;
  selected_conference: string;
  max_teams: number;
  season_start_week: number;
  status: 'draft' | 'active' | 'completed';
  standings_cache: any[];
  created_at: string;
  updated_at: string;
}

interface Team {
  $id: string;
  league_id: string;
  user_id: string;
  name: string;
  logo_url: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  points_for: number;
  points_against: number;
  waiver_priority: number;
  faab_budget_remaining: number;
  created_at: string;
  updated_at: string;
}

export default function LeagueHomePage({ params }: LeagueHomePageProps) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'standings' | 'settings'>('overview');

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Load league data
  useEffect(() => {
    if (leagueId) {
      loadLeagueData();
    }
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      
      // Load league from Appwrite
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      setLeague(leagueResponse as unknown as League);

      // Load all teams in this league
      const teamsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('league_id', leagueId)]
      );
      const leagueTeams = teamsResponse.documents as unknown as Team[];
      setTeams(leagueTeams);

      // For now, set the first team as user's team (in real app, get from auth)
      if (leagueTeams.length > 0) {
        setUserTeam(leagueTeams[0]);
      }

    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteManagers = () => {
    // Open invite modal or redirect to invite page
    router.push(`/league/${leagueId}/invite`);
  };

  const handleScheduleDraft = () => {
    // Redirect to draft scheduling page
    router.push(`/league/${leagueId}/draft/schedule`);
  };

  const handleViewLockerRoom = () => {
    // Redirect to user's locker room (roster management)
    router.push(`/league/${leagueId}/locker-room`);
  };

  const handleViewStandings = () => {
    setActiveTab('standings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading league...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">League Not Found</h1>
            <p className="text-slate-300 mb-4">The league you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/league/create')}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Create a League
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-locker-slateDark via-locker-slate to-black text-white">
      {/* Header */}
      <div className="bg-locker-primary/20 backdrop-blur-sm border-b border-locker-primary/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-bebas tracking-wide">{league.name}</h1>
              <p className="text-locker-ice/80">
                {league.game_mode === 'CONFERENCE' ? `${league.selected_conference} Conference` : 'Power 4'} • 
                {teams.length}/{league.max_teams} Teams • 
                Status: <span className="capitalize">{league.status}</span>
              </p>
            </div>
            <div className="flex space-x-3">
              {userTeam && (
                <button
                  onClick={handleViewLockerRoom}
                  className="bg-locker-primary hover:bg-locker-primaryDark px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  🏈 My Locker Room
                </button>
              )}
              {userTeam && (
                <button
                  onClick={async () => {
                    const newName = prompt('Enter new team name', userTeam.name);
                    if (!newName || newName === userTeam.name) return;
                    await fetch(`/api/leagues/${leagueId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ teamId: userTeam.$id, name: newName })
                    });
                    setTeams(prev => prev.map(t => t.$id === userTeam.$id ? { ...t, name: newName } : t));
                  }}
                  className="bg-locker-brown hover:bg-locker-primary px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  ✏️ Rename Team
                </button>
              )}
              <button
                onClick={handleInviteManagers}
                className="bg-locker-coral hover:bg-locker-primary px-5 py-2 rounded-lg font-semibold text-black transition-colors shadow-sm"
              >
                Invite Managers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-locker-slate/60 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '🏠' },
            { id: 'members', label: 'Members', icon: '👥' },
            { id: 'standings', label: 'Standings', icon: '📊' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-locker-primary text-white shadow'
                  : 'text-locker-ice/80 hover:text-white hover:bg-locker-slateDark'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* League Info */}
            <div className="bg-locker-slate/50 rounded-xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-4">League Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400">Game Mode:</span>
                  <span className="ml-2 font-semibold">
                    {league.game_mode === 'CONFERENCE' ? `${league.selected_conference} Conference` : 'Power 4'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Scoring:</span>
                  <span className="ml-2 font-semibold">
                    {league.scoring_settings.rec > 0 ? 'PPR' : 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Draft Type:</span>
                  <span className="ml-2 font-semibold capitalize">{league.draft_settings.type}</span>
                </div>
                <div>
                  <span className="text-slate-400">Season Start:</span>
                  <span className="ml-2 font-semibold">Week {league.season_start_week}</span>
                </div>
                <div>
                  <span className="text-slate-400">Trade Deadline:</span>
                  <span className="ml-2 font-semibold">Week {league.trade_deadline_week}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-locker-slate/50 rounded-xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {league.status === 'draft' && (
                  <button
                    onClick={handleScheduleDraft}
                    className="w-full bg-locker-coral hover:bg-locker-primary py-3 px-4 rounded-lg font-semibold transition-colors text-black"
                  >
                    📅 Schedule Draft
                  </button>
                )}
                {userTeam && (
                  <button
                    onClick={handleViewLockerRoom}
                    className="w-full bg-locker-primary hover:bg-locker-primaryDark py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    🏈 Manage Roster
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('members')}
                  className="w-full bg-locker-brown hover:bg-locker-primary py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  👥 View Members
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">League Members</h2>
              <span className="text-slate-400">{teams.length}/{league.max_teams} Teams</span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, index) => (
                <div key={team.$id} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{team.name}</h3>
                    {team.user_id === league.commissioner_user_id && (
                      <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">Commissioner</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    <div>Record: {team.record.wins}-{team.record.losses}-{team.record.ties}</div>
                    <div>Points: {team.points_for.toFixed(1)}</div>
                    <div>Waiver Priority: #{team.waiver_priority}</div>
                  </div>
                </div>
              ))}
            </div>

            {teams.length < league.max_teams && (
              <div className="mt-6 text-center">
                <p className="text-slate-400 mb-4">
                  {league.max_teams - teams.length} spots remaining
                </p>
                <button
                  onClick={handleInviteManagers}
                  className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Invite More Managers
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">League Standings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Team</th>
                    <th className="text-center py-3 px-4">Record</th>
                    <th className="text-center py-3 px-4">Points For</th>
                    <th className="text-center py-3 px-4">Points Against</th>
                    <th className="text-center py-3 px-4">Waiver Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {teams
                    .sort((a, b) => b.points_for - a.points_for)
                    .map((team, index) => (
                      <tr key={team.$id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 font-semibold">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-semibold">{team.name}</span>
                            {team.user_id === league.commissioner_user_id && (
                              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">C</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {team.record.wins}-{team.record.losses}-{team.record.ties}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">{team.points_for.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center">{team.points_against.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center">#{team.waiver_priority}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">League Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Scoring Settings</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(league.scoring_settings).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Roster Settings</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(league.roster_settings).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 