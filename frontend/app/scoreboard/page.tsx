'use client';

import { useState, useEffect } from 'react';

export default function ScoreboardPage() {
  const [currentWeek, setCurrentWeek] = useState<string>('1');
  const [matchups, setMatchups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load scoreboard data
    loadScoreboardData();
  }, [currentWeek]);

  const loadScoreboardData = async () => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setMatchups([
        {
          id: 1,
          team1: { name: "Team Alpha", score: 125.4, record: "1-0" },
          team2: { name: "Team Beta", score: 118.7, record: "0-1" },
          status: "Final",
          time: "Final"
        },
        {
          id: 2,
          team1: { name: "Team Gamma", score: 142.1, record: "1-0" },
          team2: { name: "Team Delta", score: 98.3, record: "0-1" },
          status: "Final",
          time: "Final"
        },
        {
          id: 3,
          team1: { name: "Team Epsilon", score: 89.2, record: "0-1" },
          team2: { name: "Team Zeta", score: 156.8, record: "1-0" },
          status: "Final",
          time: "Final"
        },
        {
          id: 4,
          team1: { name: "Team Eta", score: 134.5, record: "1-0" },
          team2: { name: "Team Theta", score: 127.9, record: "0-1" },
          status: "Final",
          time: "Final"
        },
        {
          id: 5,
          team1: { name: "Team Iota", score: 112.3, record: "0-1" },
          team2: { name: "Team Kappa", score: 145.6, record: "1-0" },
          status: "Final",
          time: "Final"
        },
        {
          id: 6,
          team1: { name: "Team Lambda", score: 167.2, record: "1-0" },
          team2: { name: "Team Mu", score: 89.4, record: "0-1" },
          status: "Final",
          time: "Final"
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading scoreboard...</div>
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
              <a href="/scoreboard" className="text-blue-600 font-medium">Scoreboard</a>
              <a href="/standings" className="text-gray-600 hover:text-gray-900">Standings</a>
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
              <h2 className="text-2xl font-bold text-gray-900">Scoreboard</h2>
              <p className="text-gray-600">Week {currentWeek} Results</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentWeek(prev => Math.max(1, parseInt(prev) - 1).toString())}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ‹
                </button>
                <span className="font-medium">Week {currentWeek}</span>
                <button 
                  onClick={() => setCurrentWeek(prev => Math.min(12, parseInt(prev) + 1).toString())}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoreboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6">
          {matchups.map((matchup) => (
            <div key={matchup.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                {/* Team 1 */}
                <div className="flex-1 flex items-center justify-end space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{matchup.team1.name}</div>
                    <div className="text-sm text-gray-600">{matchup.team1.record}</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {matchup.team1.score}
                  </div>
                </div>

                {/* VS / Status */}
                <div className="mx-8 text-center">
                  <div className="text-sm text-gray-500 mb-1">{matchup.status}</div>
                  <div className="text-xs text-gray-400">{matchup.time}</div>
                </div>

                {/* Team 2 */}
                <div className="flex-1 flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {matchup.team2.score}
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold">{matchup.team2.name}</div>
                    <div className="text-sm text-gray-600">{matchup.team2.record}</div>
                  </div>
                </div>
              </div>

              {/* Winner indicator */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    matchup.team1.score > matchup.team2.score 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {matchup.team1.score > matchup.team2.score ? matchup.team1.name : matchup.team2.name} Wins
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* League Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Week {currentWeek} Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {matchups.reduce((acc, m) => acc + Math.max(m.team1.score, m.team2.score), 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(matchups.reduce((acc, m) => acc + m.team1.score + m.team2.score, 0) / matchups.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {matchups.length}
              </div>
              <div className="text-sm text-gray-600">Matchups</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 