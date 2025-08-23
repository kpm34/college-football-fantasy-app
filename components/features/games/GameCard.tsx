import { Game } from '@lib/types/game';
import { Badge } from '@components/ui/Badge';
import { formatGameTime } from '@lib/utils/formatters';

interface GameCardProps {
  game: Game;
  isEligible?: boolean;
  className?: string;
}

export function GameCard({ game, isEligible = false, className = '' }: GameCardProps) {
  const isLive = game.status === 'in_progress';
  const isConferenceGame = game.homeConference && 
                          game.awayConference && 
                          game.homeConference === game.awayConference;

  const getStatusBadge = () => {
    switch (game.status) {
      case 'scheduled':
        return <Badge variant="default">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="live">LIVE</Badge>;
      case 'final':
        return <Badge variant="success">Final</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        relative bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-750
        ${isEligible ? 'border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' : 'border border-gray-700'}
        ${isLive ? 'ring-2 ring-green-500/30' : ''}
        ${className}
      `}
    >
      {/* Eligible Game Indicator */}
      {isEligible && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="warning" size="md">ELIGIBLE</Badge>
        </div>
      )}

      {/* Game Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="text-xs text-gray-400">
          Week {game.week} • {game.seasonType}
          {isConferenceGame && <span className="ml-2 text-blue-400">Conference</span>}
        </div>
        {getStatusBadge()}
      </div>

      {/* Teams and Scores */}
      <div className="space-y-3">
        <TeamScore
          team={game.homeTeam}
          conference={game.homeConference}
          score={game.homePoints}
          isLive={isLive}
        />
        
        <div className="text-center text-gray-500 text-sm font-medium">VS</div>
        
        <TeamScore
          team={game.awayTeam}
          conference={game.awayConference}
          score={game.awayPoints}
          isLive={isLive}
        />
      </div>

      {/* Game Time or Live Info */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        {isLive && game.period && game.clock ? (
          <div className="text-sm text-green-400 font-medium">
            Q{game.period} • {game.clock}
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            {formatGameTime(game.startDate)}
          </div>
        )}
      </div>
    </div>
  );
}

interface TeamScoreProps {
  team: string;
  conference?: string;
  score?: number;
  isLive: boolean;
}

function TeamScore({ team, conference, score, isLive }: TeamScoreProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <div className="font-semibold text-white">{team}</div>
        {conference && (
          <div className="text-xs text-gray-400">{conference}</div>
        )}
      </div>
      <div className={`
        text-lg font-bold ml-2
        ${isLive ? 'text-green-400' : 'text-white'}
      `}>
        {score !== undefined ? score : '-'}
      </div>
    </div>
  );
}