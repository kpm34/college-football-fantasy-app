'use client';

import { useState, useEffect } from 'react';
// Game interface
interface Game {
  id: string;
  week: number;
  home_team: string;
  away_team: string;
  date: string;
  completed: boolean;
  eligible: boolean;
}

interface GamesListProps {
  week?: number;
  showEligibleOnly?: boolean;
}

export default function GamesList({ week, showEligibleOnly = false }: GamesListProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let endpoint: string;
        if (showEligibleOnly) {
          endpoint = '/api/games/eligible';
        } else if (week) {
          endpoint = `/api/games/week/${week}`;
        } else {
          endpoint = '/api/games';
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch games');
        
        const gamesData = await response.json();
        setGames(gamesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [week, showEligibleOnly]);

  const isEligibleGame = (game: Game): boolean => {
    // Game is eligible if either team is in AP Top 25 or it's a conference game
    // This is a simplified check - you might want to enhance this logic
    const isConferenceGame = game.homeConference && game.awayConference && 
                           game.homeConference === game.awayConference;
    return !!isConferenceGame;
  };

  const isLiveGame = (game: Game): boolean => {
    return game.status === 'in_progress';
  };

  const formatGameTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusBadge = (game: Game) => {
    switch (game.status) {
      case 'scheduled':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-full">
            Scheduled
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full animate-pulse">
            LIVE
          </span>
        );
      case 'final':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
            Final
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="text-red-400 text-lg font-semibold mb-2">
            🏈 Error Loading Games
          </div>
          <div className="text-gray-400 mb-4">
            {error.includes('Failed to fetch') 
              ? 'Backend server may not be running. Please start the backend with: npm run server'
              : error
            }
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-lg font-semibold mb-2">
            🏈 No Games Found
          </div>
          <div className="text-gray-500">
            {showEligibleOnly 
              ? 'No eligible games for this week.' 
              : 'No games scheduled for this time period.'
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className={`
              relative bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-750
              ${isEligibleGame(game) 
                ? 'border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                : 'border border-gray-700'
              }
              ${isLiveGame(game) ? 'ring-2 ring-green-500/30' : ''}
            `}
          >
            {/* Eligible Game Indicator */}
            {isEligibleGame(game) && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  ELIGIBLE
                </div>
              </div>
            )}

            {/* Game Status Badge */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-xs text-gray-400">
                Week {game.week} • {game.seasonType}
              </div>
              {getStatusBadge(game)}
            </div>

            {/* Teams and Scores */}
            <div className="space-y-3">
              {/* Home Team */}
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-white">{game.homeTeam}</div>
                  {game.homeConference && (
                    <div className="text-xs text-gray-400">{game.homeConference}</div>
                  )}
                </div>
                <div className={`
                  text-lg font-bold ml-2
                  ${isLiveGame(game) ? 'text-green-400' : 'text-white'}
                `}>
                  {game.homePoints !== undefined ? game.homePoints : '-'}
                </div>
              </div>

              {/* VS */}
              <div className="text-center text-gray-500 text-sm font-medium">VS</div>

              {/* Away Team */}
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-white">{game.awayTeam}</div>
                  {game.awayConference && (
                    <div className="text-xs text-gray-400">{game.awayConference}</div>
                  )}
                </div>
                <div className={`
                  text-lg font-bold ml-2
                  ${isLiveGame(game) ? 'text-green-400' : 'text-white'}
                `}>
                  {game.awayPoints !== undefined ? game.awayPoints : '-'}
                </div>
              </div>
            </div>

            {/* Game Time */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {formatGameTime(game.startDate)}
              </div>
            </div>

            {/* Live Game Info */}
            {isLiveGame(game) && (
              <div className="mt-2 text-sm text-green-400 font-medium">
                Q{game.period} • {game.clock}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 