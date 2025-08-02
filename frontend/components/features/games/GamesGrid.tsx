'use client';

import { Game } from '@/types/game';
import { GameCard } from './GameCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/Card';

interface GamesGridProps {
  games: Game[];
  loading?: boolean;
  error?: string | null;
  showEligibleOnly?: boolean;
}

export function GamesGrid({ games, loading, error, showEligibleOnly }: GamesGridProps) {
  if (loading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Card className="max-w-md">
          <CardContent>
            <LoadingSpinner message="Loading games..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <Card className="max-w-md mx-auto bg-red-900/20 border-red-700">
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <Card className="max-w-md mx-auto">
          <CardContent>
            <div className="text-gray-400 text-lg font-semibold mb-2">
              🏈 No Games Found
            </div>
            <div className="text-gray-500">
              {showEligibleOnly 
                ? 'No eligible games for this week.' 
                : 'No games scheduled for this time period.'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isGameEligible = (game: Game): boolean => {
    // This is a simplified check - should be enhanced with actual eligibility logic
    const isConferenceGame = game.homeConference && 
                            game.awayConference && 
                            game.homeConference === game.awayConference;
    return isConferenceGame;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isEligible={isGameEligible(game)}
        />
      ))}
    </div>
  );
}