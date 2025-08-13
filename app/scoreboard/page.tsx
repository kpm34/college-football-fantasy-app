'use client';

import { useState, useEffect } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface Game {
  id: string;
  homeTeam: {
    name: string;
    score: number;
    record: string;
    conference: string;
  };
  awayTeam: {
    name: string;
    score: number;
    record: string;
    conference: string;
  };
  status: 'scheduled' | 'live' | 'final' | 'postponed';
  time: string;
  quarter?: string;
  timeRemaining?: string;
  network?: string;
  venue?: string;
}

interface UserPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  points: number;
  isPlaying: boolean;
  gameId?: string;
}

export default function ScoreboardPage() {
  const [currentWeek, setCurrentWeek] = useState<string>('1');
  const [games, setGames] = useState<Game[]>([]);
  const [userPlayers, setUserPlayers] = useState<UserPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonStatus, setSeasonStatus] = useState<'offseason' | 'preseason' | 'regular' | 'postseason'>('offseason');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadScoreboardData();
  }, [currentWeek]);

  const loadScoreboardData = async () => {
    setLoading(true);
    
    // Simulate API call to get real game data
    setTimeout(() => {
      // For now, show offseason state since season hasn't started
      setSeasonStatus('offseason');
      setGames([]);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-red-600 font-bold';
      case 'final': return 'text-gray-600';
      case 'scheduled': return 'text-blue-600';
      case 'postponed': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return '🔴';
      case 'final': return '🏁';
      case 'scheduled': return '⏰';
      case 'postponed': return '⚠️';
      default: return '⏰';
    }
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
              <h2 className="text-2xl font-bold text-gray-900">College Football Scoreboard</h2>
              <p className="text-gray-600">
                {seasonStatus === 'offseason' ? 'Offseason - No Games Scheduled' : 
                 seasonStatus === 'preseason' ? 'Preseason' :
                 `Week ${currentWeek} - Regular Season`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentWeek(prev => Math.max(1, parseInt(prev) - 1).toString())}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={seasonStatus === 'offseason'}
                >
                  ‹
                </button>
                <span className="font-medium">Week {currentWeek}</span>
                <button 
                  onClick={() => setCurrentWeek(prev => Math.min(15, parseInt(prev) + 1).toString())}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={seasonStatus === 'offseason'}
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
        {seasonStatus === 'offseason' ? (
          // Offseason State
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm border p-12">
              <div className="text-6xl mb-6">🏈</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">College Football Season</h3>
              <p className="text-gray-600 mb-6">
                The 2024 college football season will begin in late August.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">August</div>
                  <div className="text-sm text-gray-600">Season Start</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">September</div>
                  <div className="text-sm text-gray-600">Conference Play</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">December</div>
                  <div className="text-sm text-gray-600">Bowl Season</div>
                </div>
              </div>
              <div className="mt-8">
                <button 
                  onClick={() => setSeasonStatus('regular')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Sample Games
                </button>
              </div>
            </div>
          </div>
        ) : games.length === 0 ? (
          // No Games State
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm border p-12">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Games Scheduled</h3>
              <p className="text-gray-600">Check back later for live games and scores.</p>
            </div>
          </div>
        ) : (
          // Games Display
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  {/* Away Team */}
                  <div className="flex-1 flex items-center justify-end space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">{game.awayTeam.name}</div>
                      <div className="text-sm text-gray-600">{game.awayTeam.record} • {game.awayTeam.conference}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {game.awayTeam.score}
                    </div>
                  </div>

                  {/* Game Status */}
                  <div className="mx-8 text-center">
                    <div className={`text-sm mb-1 ${getStatusColor(game.status)}`}>
                      {getStatusIcon(game.status)} {game.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">{game.time}</div>
                    {game.quarter && (
                      <div className="text-xs text-gray-500">{game.quarter}</div>
                    )}
                    {game.network && (
                      <div className="text-xs text-blue-600">{game.network}</div>
                    )}
                  </div>

                  {/* Home Team */}
                  <div className="flex-1 flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {game.homeTeam.score}
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold">{game.homeTeam.name}</div>
                      <div className="text-sm text-gray-600">{game.homeTeam.record} • {game.homeTeam.conference}</div>
                    </div>
                  </div>
                </div>

                {/* Winner indicator for final games */}
                {game.status === 'final' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        game.awayTeam.score > game.homeTeam.score 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {game.awayTeam.score > game.homeTeam.score ? game.awayTeam.name : game.homeTeam.name} Wins
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* League Summary - Only show if there are fantasy games */}
        {seasonStatus !== 'offseason' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Fantasy League Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Active Games</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Fantasy Matchups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Live Updates</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 