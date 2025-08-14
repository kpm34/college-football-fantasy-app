'use client';

import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { TeamPlayer, TeamRoster } from '@/types/team';

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ week?: string }>;
}

export default function TeamPage({ params, searchParams }: TeamPageProps) {
  const [teamId, setTeamId] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'schedule' | 'news' | 'projections' | 'ranks'>('overview');
  const [roster, setRoster] = useState<TeamRoster | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve params and searchParams
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      setTeamId(resolvedParams.teamId);
      setCurrentWeek(resolvedSearchParams.week || '1');
    };
    resolveParams();
  }, [params, searchParams]);

  // Load team data
  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      // Load team roster from Appwrite
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        teamId
      );
      setRoster(response as unknown as TeamRoster);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovePlayer = async (playerId: string, newPosition: string) => {
    // Implement player movement logic
    console.log(`Moving player ${playerId} to ${newPosition}`);
  };

  const handleAddPlayer = () => {
    // Implement add player logic
    console.log('Add player clicked');
  };

  const handleDropPlayer = (playerId: string) => {
    // Implement drop player logic
    console.log(`Dropping player ${playerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading team roster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🏈 College Football Fantasy</h1>
            </div>
            <div className="flex items-center space-x-8">
              <a href="/team/[teamId]" className="text-blue-600 font-medium">My Team</a>
              <a href="/league/[leagueId]" className="text-gray-600 hover:text-gray-900">League</a>
              <a href="/players" className="text-gray-600 hover:text-gray-900">Players</a>
              <a href="/scoreboard" className="text-gray-600 hover:text-gray-900">Scoreboard</a>
              <a href="/standings" className="text-gray-600 hover:text-gray-900">Standings</a>
              <a href="/opponents" className="text-gray-600 hover:text-gray-900">Opposing Teams</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Team Information Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Name</h2>
                <p className="text-gray-600">Manager: Kashyap Maheshwari</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Team Settings
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Leave League
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Lineup Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold">Set Lineup:</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">‹</button>
                    <span className="font-medium">Week {currentWeek}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">›</button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Trade & Acquisition Limits
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Manage IR
                  </button>
                  <button 
                    onClick={handleAddPlayer}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    + Add Player
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                    - Drop Players
                  </button>
                </div>
              </div>

              {/* Data Tabs */}
              <div className="flex space-x-1 mb-4">
                {['overview', 'stats', 'schedule', 'news', 'projections', 'ranks'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
                      activeTab === tab
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Projections Selector */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600">Show Stats:</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>2025 Projections</option>
                  <option>2024 Stats</option>
                  <option>Last 4 Weeks</option>
                </select>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">SLOT</th>
                      <th className="text-left py-2 font-medium">PLAYER</th>
                      <th className="text-left py-2 font-medium">ACTION</th>
                      <th className="text-left py-2 font-medium">OPP</th>
                      <th className="text-left py-2 font-medium">STATUS</th>
                      <th className="text-left py-2 font-medium">PROJ</th>
                      <th className="text-left py-2 font-medium">SCORE</th>
                      <th className="text-left py-2 font-medium">OPRK</th>
                      <th className="text-left py-2 font-medium">%ST</th>
                      <th className="text-left py-2 font-medium">%ROST</th>
                      <th className="text-left py-2 font-medium">+/-</th>
                      <th className="text-left py-2 font-medium">FPTS</th>
                      <th className="text-left py-2 font-medium">AVG</th>
                      <th className="text-left py-2 font-medium">LAST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample roster data */}
                    {[
                      { slot: 'QB', player: 'Caleb Williams', team: 'Chi', position: 'QB', proj: 17.1, rostered: 78.0, fpts: 275.2, avg: 16.2 },
                      { slot: 'RB', player: 'Jahmyr Gibbs', team: 'Det', position: 'RB', proj: 16.8, rostered: 99.9, fpts: 268.5, avg: 15.8 },
                      { slot: 'RB', player: 'Isiah Pacheco', team: 'KC', position: 'RB', proj: 11.6, rostered: 88.6, fpts: 185.4, avg: 10.9 },
                      { slot: 'WR', player: 'Tyreek Hill', team: 'Mia', position: 'WR', proj: 12.4, rostered: 98.9, fpts: 198.7, avg: 11.7 },
                      { slot: 'WR', player: 'Tee Higgins', team: 'Cin', position: 'WR', proj: 12.7, rostered: 99.3, fpts: 203.2, avg: 12.0 },
                      { slot: 'TE', player: 'Hunter Henry', team: 'NE', position: 'TE', proj: 7.1, rostered: 19.2, fpts: 113.6, avg: 6.7 },
                      { slot: 'FLEX', player: 'Romeo Doubs', team: 'GB', position: 'WR', proj: 6.8, rostered: 4.0, fpts: 108.8, avg: 6.4 },
                      { slot: 'D/ST', player: 'Dolphins', team: 'Mia', position: 'D/ST', proj: 5.6, rostered: 12.0, fpts: 89.6, avg: 5.3 },
                    ].map((player, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{player.slot}</td>
                        <td className="py-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">{player.player.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium">{player.player}</div>
                              <div className="text-gray-500 text-xs">{player.team} {player.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <button 
                            onClick={() => handleMovePlayer(player.player, player.slot)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            MOVE
                          </button>
                        </td>
                        <td className="py-2 text-gray-600">@Opp</td>
                        <td className="py-2 text-gray-600">Sun 1:00 PM</td>
                        <td className="py-2 font-medium">{player.proj}</td>
                        <td className="py-2">-</td>
                        <td className="py-2">-</td>
                        <td className="py-2 text-gray-600">85%</td>
                        <td className="py-2 text-gray-600">{player.rostered}%</td>
                        <td className="py-2 text-gray-600">+0.1</td>
                        <td className="py-2 font-medium">{player.fpts}</td>
                        <td className="py-2 text-gray-600">{player.avg}</td>
                        <td className="py-2">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Waiver Wire */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Waiver Wire</h3>
              <div className="space-y-3">
                {[
                  { name: 'Player 1', team: 'Team A', position: 'QB', addRate: '+15.2%' },
                  { name: 'Player 2', team: 'Team B', position: 'RB', addRate: '+8.7%' },
                  { name: 'Player 3', team: 'Team C', position: 'WR', addRate: '+12.1%' },
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-gray-500 text-xs">{player.team} {player.position}</div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">{player.addRate}</div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View All Available Players
              </button>
            </div>

            {/* League Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">League Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">League Name:</span>
                  <span className="font-medium">Power 4 Fantasy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teams:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Week:</span>
                  <span className="font-medium">{currentWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Record:</span>
                  <span className="font-medium">0-0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 