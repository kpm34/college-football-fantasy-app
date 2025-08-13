'use client';

import { useState, useEffect } from 'react';

export default function StandingsPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStandingsData();
  }, []);

  const loadStandingsData = async () => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setStandings([
        {
          rank: 1,
          team: "Team Lambda",
          owner: "John Smith",
          wins: 1,
          losses: 0,
          ties: 0,
          winPct: 1.000,
          pointsFor: 167.2,
          pointsAgainst: 89.4,
          streak: "W1"
        },
        {
          rank: 2,
          team: "Team Zeta",
          owner: "Sarah Johnson",
          wins: 1,
          losses: 0,
          ties: 0,
          winPct: 1.000,
          pointsFor: 156.8,
          pointsAgainst: 89.2,
          streak: "W1"
        },
        {
          rank: 3,
          team: "Team Kappa",
          owner: "Mike Davis",
          wins: 1,
          losses: 0,
          ties: 0,
          winPct: 1.000,
          pointsFor: 145.6,
          pointsAgainst: 112.3,
          streak: "W1"
        },
        {
          rank: 4,
          team: "Team Gamma",
          owner: "Emily Wilson",
          wins: 1,
          losses: 0,
          ties: 0,
          winPct: 1.000,
          pointsFor: 142.1,
          pointsAgainst: 98.3,
          streak: "W1"
        },
        {
          rank: 5,
          team: "Team Eta",
          owner: "David Brown",
          wins: 1,
          losses: 0,
          ties: 0,
          winPct: 1.000,
          pointsFor: 134.5,
          pointsAgainst: 127.9,
          streak: "W1"
        },
        {
          rank: 6,
          team: "Team Alpha",
          owner: "Lisa Garcia",
          wins: 1,
          losses: 0,
          ties: 0,
          winPct: 1.000,
          pointsFor: 125.4,
          pointsAgainst: 118.7,
          streak: "W1"
        },
        {
          rank: 7,
          team: "Team Theta",
          owner: "Robert Miller",
          wins: 0,
          losses: 1,
          ties: 0,
          winPct: 0.000,
          pointsFor: 127.9,
          pointsAgainst: 134.5,
          streak: "L1"
        },
        {
          rank: 8,
          team: "Team Beta",
          owner: "Jennifer Lee",
          wins: 0,
          losses: 1,
          ties: 0,
          winPct: 0.000,
          pointsFor: 118.7,
          pointsAgainst: 125.4,
          streak: "L1"
        },
        {
          rank: 9,
          team: "Team Delta",
          owner: "Thomas Anderson",
          wins: 0,
          losses: 1,
          ties: 0,
          winPct: 0.000,
          pointsFor: 98.3,
          pointsAgainst: 142.1,
          streak: "L1"
        },
        {
          rank: 10,
          team: "Team Iota",
          owner: "Amanda Taylor",
          wins: 0,
          losses: 1,
          ties: 0,
          winPct: 0.000,
          pointsFor: 112.3,
          pointsAgainst: 145.6,
          streak: "L1"
        },
        {
          rank: 11,
          team: "Team Epsilon",
          owner: "Christopher White",
          wins: 0,
          losses: 1,
          ties: 0,
          winPct: 0.000,
          pointsFor: 89.2,
          pointsAgainst: 156.8,
          streak: "L1"
        },
        {
          rank: 12,
          team: "Team Mu",
          owner: "Jessica Martinez",
          wins: 0,
          losses: 1,
          ties: 0,
          winPct: 0.000,
          pointsFor: 89.4,
          pointsAgainst: 167.2,
          streak: "L1"
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading standings...</div>
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
              <a href="/team/[teamId]" className="text-gray-600 hover:text-gray-900">My Team</a>
              <a href="/league/[leagueId]" className="text-gray-600 hover:text-gray-900">League</a>
              <a href="/players" className="text-gray-600 hover:text-gray-900">Players</a>
              <a href="/scoreboard" className="text-gray-600 hover:text-gray-900">Scoreboard</a>
              <a href="/standings" className="text-blue-600 font-medium">Standings</a>
              <a href="/opponents" className="text-gray-600 hover:text-gray-900">Opposing Teams</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Standings</h2>
              <p className="text-gray-600">League Rankings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    T
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PCT
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PF
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Streak
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((team, index) => (
                  <tr key={team.rank} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          team.rank <= 6 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {team.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.team}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.owner}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{team.wins}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{team.losses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{team.ties}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {team.winPct.toFixed(3)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{team.pointsFor.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{team.pointsAgainst.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm font-medium ${
                        team.streak.startsWith('W') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {team.streak}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Playoff Picture */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Playoff Picture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">In Playoffs (Top 6)</h4>
              <div className="space-y-1">
                {standings.slice(0, 6).map((team) => (
                  <div key={team.rank} className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{team.team}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Outside Looking In</h4>
              <div className="space-y-1">
                {standings.slice(6).map((team) => (
                  <div key={team.rank} className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">{team.team}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 