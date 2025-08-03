'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LeaguePortalProps {
  leagueId: string;
  leagueName: string;
}

interface Team {
  $id: string;
  name: string;
  owner: string;
  record: string;
  pointsFor: number;
  pointsAgainst: number;
  wins: number;
  losses: number;
  ties: number;
}

interface ConferenceTeam {
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  color: string;
  altColor: string;
}

interface Player {
  name: string;
  position: string;
  team: string;
  rating: number;
  conference: string;
}

export default function LeaguePortal({ leagueId, leagueName }: LeaguePortalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'conferences' | 'draft' | 'standings'>('overview');
  const [teams, setTeams] = useState<Team[]>([]);
  const [conferenceTeams, setConferenceTeams] = useState<ConferenceTeam[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState<any>(null);

  useEffect(() => {
    loadLeagueData();
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      
      // Fetch league data from Appwrite
      const leagueResponse = await fetch(`/api/leagues/${leagueId}`);
      if (leagueResponse.ok) {
        const leagueResult = await leagueResponse.json();
        if (leagueResult.success) {
          setLeagueData(leagueResult.league);
        }
      }
      
      // Load conference teams from both APIs
      const bigTenResponse = await fetch('/api/bigten?type=teams');
      const big12Response = await fetch('/api/big12?type=teams');
      
      let allTeams: ConferenceTeam[] = [];
      
      if (bigTenResponse.ok) {
        const bigTenData = await bigTenResponse.json();
        allTeams = [...(bigTenData.teams || [])];
      }
      
      if (big12Response.ok) {
        const big12Data = await big12Response.json();
        allTeams = [...allTeams, ...(big12Data.teams || [])];
      }
      
      setConferenceTeams(allTeams);

      // Load top players from both conferences
      const bigTenPlayersResponse = await fetch('/api/bigten?type=players');
      const big12PlayersResponse = await fetch('/api/big12?type=players');
      
      let allPlayers: Player[] = [];
      
      if (bigTenPlayersResponse.ok) {
        const bigTenPlayersData = await bigTenPlayersResponse.json();
        allPlayers = [...(bigTenPlayersData.players || [])];
      }
      
      if (big12PlayersResponse.ok) {
        const big12PlayersData = await big12PlayersResponse.json();
        allPlayers = [...allPlayers, ...(big12PlayersData.players || [])];
      }
      
      // Sort by rating and take top 10
      allPlayers.sort((a, b) => b.rating - a.rating);
      setTopPlayers(allPlayers.slice(0, 10));

            // Mock team data for now
      setTeams([
        { $id: '1', name: 'Maheshwari\'s Maulers', owner: 'Kashyap', record: '3-1', pointsFor: 450, pointsAgainst: 380, wins: 3, losses: 1, ties: 0 },
        { $id: '2', name: 'Gridiron Giants', owner: 'Alex', record: '2-2', pointsFor: 420, pointsAgainst: 410, wins: 2, losses: 2, ties: 0 },
        { $id: '3', name: 'Touchdown Titans', owner: 'Sarah', record: '4-0', pointsFor: 520, pointsAgainst: 350, wins: 4, losses: 0, ties: 0 },
      ]);

    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }


  const getConferenceColor = (conference: string) => {
    switch (conference) {
      case 'Big Ten': return 'from-blue-600 to-blue-800';
      case 'Big 12': return 'from-red-600 to-red-800';
      case 'SEC': return 'from-yellow-600 to-yellow-800';
      case 'ACC': return 'from-green-600 to-green-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your league portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                🏈 {leagueData ? leagueData.name : leagueName}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded-full border ${
                  leagueData?.mode === 'CONFERENCE' 
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' 
                    : 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                }`}>
                  {leagueData?.mode === 'CONFERENCE' ? 'Conference Mode' : 'Power-4 Mode'}
                </span>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-500/30">
                  {leagueData ? `${leagueData.currentTeams}/${leagueData.maxTeams} Teams` : 'Power 4 Conferences'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-gray-300 hover:text-white transition-colors">My Team</button>
              <button className="text-gray-300 hover:text-white transition-colors">Scoreboard</button>
              <button className="text-gray-300 hover:text-white transition-colors">Standings</button>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '🏠' },
              { id: 'conferences', label: 'Conferences', icon: '🏆' },
              { id: 'draft', label: 'Draft', icon: '📋' },
              { id: 'standings', label: 'Standings', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* League Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-blue-400">{teams.length}</div>
                  <div className="text-gray-400">Teams</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-green-400">12</div>
                  <div className="text-gray-400">Week Season</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-bold text-purple-400">4</div>
                  <div className="text-gray-400">Conferences</div>
                </div>
              </div>

              {/* Top Teams */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">🏆 League Leaders</h3>
                <div className="space-y-3">
                  {teams.slice(0, 3).map((team, index) => (
                    <div key={team.$id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{team.name}</div>
                          <div className="text-sm text-gray-400">{team.owner}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{team.record}</div>
                        <div className="text-sm text-gray-400">{team.pointsFor} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">📈 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">League created successfully</span>
                    <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">Draft scheduled for Week 1</span>
                    <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg transition-colors">
                    📋 Start Draft
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 py-3 px-4 rounded-lg transition-colors">
                    👥 Invite Friends
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-4 rounded-lg transition-colors">
                    📊 View Standings
                  </button>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 py-3 px-4 rounded-lg transition-colors">
                    🏈 My Team
                  </button>
                </div>
              </div>

              {/* Top Players */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">⭐ Top Players</h3>
                <div className="space-y-3">
                  {topPlayers.slice(0, 5).map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div>
                        <div className="font-semibold text-sm">{player.name}</div>
                        <div className="text-xs text-gray-400">{player.position} • {player.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-yellow-400">{player.rating}</div>
                        <div className="text-xs text-gray-400">{player.conference}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conferences' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">🏆 Power 4 Conferences</h2>
            
            {/* Big Ten */}
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-8 border border-blue-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-blue-400">Big Ten Conference</h3>
                <span className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-full text-sm">
                  18 Teams
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {conferenceTeams.filter(team => team.conference === 'Big Ten').slice(0, 12).map((team, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">{team.abbreviation}</span>
                    </div>
                    <div className="text-sm font-semibold">{team.school}</div>
                    <div className="text-xs text-gray-400">{team.mascot}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Big 12 */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-xl p-8 border border-red-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-red-400">Big 12 Conference</h3>
                <span className="px-4 py-2 bg-red-600/30 text-red-300 rounded-full text-sm">
                  16 Teams
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {conferenceTeams.filter(team => team.conference === 'Big 12').slice(0, 12).map((team, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">{team.abbreviation}</span>
                    </div>
                    <div className="text-sm font-semibold">{team.school}</div>
                    <div className="text-xs text-gray-400">{team.mascot}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'draft' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-3xl font-bold mb-4">Draft Coming Soon!</h2>
            <p className="text-gray-400 mb-8">Get ready to draft your Power 4 conference players</p>
            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Schedule Draft
            </button>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">📊 League Standings</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Team</th>
                      <th className="text-left py-3 px-4">Owner</th>
                      <th className="text-center py-3 px-4">Record</th>
                      <th className="text-center py-3 px-4">PF</th>
                      <th className="text-center py-3 px-4">PA</th>
                      <th className="text-center py-3 px-4">W</th>
                      <th className="text-center py-3 px-4">L</th>
                      <th className="text-center py-3 px-4">T</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr key={team.$id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">{team.name}</td>
                        <td className="py-3 px-4 text-gray-400">{team.owner}</td>
                        <td className="py-3 px-4 text-center">{team.record}</td>
                        <td className="py-3 px-4 text-center">{team.pointsFor}</td>
                        <td className="py-3 px-4 text-center">{team.pointsAgainst}</td>
                        <td className="py-3 px-4 text-center">{team.wins}</td>
                        <td className="py-3 px-4 text-center">{team.losses}</td>
                        <td className="py-3 px-4 text-center">{team.ties}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 