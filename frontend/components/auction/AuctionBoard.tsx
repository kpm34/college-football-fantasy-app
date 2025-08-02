'use client';

import { AuctionPlayer, AuctionSession } from '@/types/auction';

interface AuctionBoardProps {
  currentPlayer: AuctionPlayer | null;
  session: AuctionSession;
  availablePlayers: AuctionPlayer[];
}

const POSITION_COLORS = {
  QB: 'bg-blue-500',
  RB: 'bg-green-500',
  WR: 'bg-purple-500',
  TE: 'bg-orange-500',
  K: 'bg-yellow-500',
  DEF: 'bg-red-500'
};

export default function AuctionBoard({ currentPlayer, session, availablePlayers }: AuctionBoardProps) {
  const getPositionCount = (position: string) => {
    return availablePlayers.filter(player => player.position === position).length;
  };

  const getAuctionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'sold': return 'text-blue-400';
      case 'passed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Player Auction */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold chrome-text mb-6">Current Auction</h3>
        
        {currentPlayer ? (
          <div className="text-center">
            {/* Player Info */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <h2 className="text-3xl font-bold text-white">{currentPlayer.name}</h2>
                <span className={`px-4 py-2 rounded-full text-lg font-medium text-white ${POSITION_COLORS[currentPlayer.position as keyof typeof POSITION_COLORS]}`}>
                  {currentPlayer.position}
                </span>
              </div>
              <p className="text-xl text-slate-400">{currentPlayer.team} • {currentPlayer.conference}</p>
            </div>

            {/* Current Bid */}
            <div className="mb-6">
              <div className="text-5xl font-bold text-chrome mb-2">
                ${currentPlayer.currentBid.toLocaleString()}
              </div>
              <div className="text-slate-400">
                {currentPlayer.currentBidder ? `Leading: ${currentPlayer.currentBidder}` : 'No bids yet'}
              </div>
            </div>

            {/* Player Stats */}
            {currentPlayer.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {currentPlayer.stats.passingYards && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{currentPlayer.stats.passingYards.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Pass Yds</div>
                  </div>
                )}
                {currentPlayer.stats.rushingYards && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{currentPlayer.stats.rushingYards.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Rush Yds</div>
                  </div>
                )}
                {currentPlayer.stats.receivingYards && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{currentPlayer.stats.receivingYards.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Rec Yds</div>
                  </div>
                )}
                {currentPlayer.stats.touchdowns && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{currentPlayer.stats.touchdowns}</div>
                    <div className="text-sm text-slate-400">Touchdowns</div>
                  </div>
                )}
              </div>
            )}

            {/* Auction Status */}
            <div className={`text-lg font-semibold ${getAuctionStatusColor(currentPlayer.auctionStatus)}`}>
              {currentPlayer.auctionStatus === 'active' && '🔥 Auction Active'}
              {currentPlayer.auctionStatus === 'pending' && '⏳ Waiting to Start'}
              {currentPlayer.auctionStatus === 'sold' && '✅ Sold'}
              {currentPlayer.auctionStatus === 'passed' && '❌ Passed'}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏈</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Player Currently Up</h3>
            <p className="text-slate-400">Waiting for next player to be nominated...</p>
          </div>
        )}
      </div>

      {/* Available Players */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold chrome-text mb-6">Available Players</h3>
        
        {/* Position Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {Object.entries(POSITION_COLORS).map(([position, color]) => (
            <div key={position} className="text-center p-3 bg-slate-700/30 rounded-lg">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${color}`} />
              <div className="text-lg font-bold text-white">{getPositionCount(position)}</div>
              <div className="text-xs text-slate-400">{position}</div>
            </div>
          ))}
        </div>

        {/* Player List */}
        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePlayers.slice(0, 10).map((player) => (
              <div
                key={player.$id}
                className="p-3 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{player.name}</div>
                    <div className="text-sm text-slate-400">{player.team}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${POSITION_COLORS[player.position as keyof typeof POSITION_COLORS]}`}>
                      {player.position}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-chrome">
                        ${player.startingBid.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">Starting</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {availablePlayers.length > 10 && (
            <div className="text-center mt-4 text-slate-400">
              +{availablePlayers.length - 10} more players available
            </div>
          )}
        </div>
      </div>

      {/* Auction Session Info */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold chrome-text mb-6">Auction Info</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {session.status === 'active' ? '🔥' : session.status === 'pending' ? '⏳' : '✅'}
            </div>
            <div className="text-sm text-slate-400 capitalize">{session.status}</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${session.totalBudget.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Budget</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${session.minBidIncrement}
            </div>
            <div className="text-sm text-slate-400">Min Increment</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {availablePlayers.length}
            </div>
            <div className="text-sm text-slate-400">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
} 