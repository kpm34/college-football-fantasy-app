'use client';

import { AuctionBid, AuctionPlayer } from '@/types/auction';

interface BidHistoryProps {
  bids: AuctionBid[];
  currentPlayer: AuctionPlayer | null;
}

export default function BidHistory({ bids, currentPlayer }: BidHistoryProps) {
  const currentPlayerBids = currentPlayer 
    ? bids.filter(bid => bid.playerId === currentPlayer.$id)
    : [];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getBidderColor = (bidderId: string, currentBidderId: string | null) => {
    if (currentBidderId === bidderId) return 'text-chrome';
    return 'text-white';
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-bold chrome-text mb-6">Bid History</h3>

      {currentPlayer ? (
        <div>
          {/* Current Player Info */}
          <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-1">{currentPlayer.name}</h4>
              <p className="text-sm text-slate-400">{currentPlayer.team} • {currentPlayer.position}</p>
              <div className="text-2xl font-bold text-chrome mt-2">
                ${currentPlayer.currentBid.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Current Bid</div>
            </div>
          </div>

          {/* Bid History */}
          {currentPlayerBids.length > 0 ? (
            <div className="space-y-3">
              {currentPlayerBids
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((bid, index) => (
                  <div
                    key={bid.$id}
                    className={`p-3 rounded-lg border ${
                      index === 0 
                        ? 'border-chrome bg-chrome/10' 
                        : 'border-slate-600 bg-slate-700/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-chrome' : 'bg-slate-500'
                        }`} />
                        <span className={`font-semibold ${getBidderColor(bid.bidderId, currentPlayer.currentBidder)}`}>
                          {bid.bidderName}
                        </span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-1 bg-chrome text-black rounded-full font-medium">
                            Leading
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-chrome">
                          ${bid.bidAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatTime(bid.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💰</div>
              <p className="text-slate-400">No bids yet</p>
              <p className="text-sm text-slate-500">Be the first to bid!</p>
            </div>
          )}

          {/* Bid Statistics */}
          {currentPlayerBids.length > 0 && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Bid Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Total Bids</div>
                  <div className="text-white font-semibold">{currentPlayerBids.length}</div>
                </div>
                <div>
                  <div className="text-slate-400">Unique Bidders</div>
                  <div className="text-white font-semibold">
                    {new Set(currentPlayerBids.map(bid => bid.bidderId)).size}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Starting Bid</div>
                  <div className="text-white font-semibold">
                    ${currentPlayer.startingBid.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Bid Increase</div>
                  <div className="text-white font-semibold">
                    ${(currentPlayer.currentBid - currentPlayer.startingBid).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-slate-400">No player currently up for auction</p>
          <p className="text-sm text-slate-500">Bid history will appear here</p>
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-white mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {bids
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map((bid) => (
              <div key={bid.$id} className="flex items-center justify-between text-xs p-2 bg-slate-700/20 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-chrome">💰</span>
                  <span className="text-white">{bid.bidderName}</span>
                  <span className="text-slate-400">bid</span>
                  <span className="text-chrome font-semibold">${bid.bidAmount.toLocaleString()}</span>
                  <span className="text-slate-400">on</span>
                  <span className="text-white">{bid.playerName}</span>
                </div>
                <span className="text-slate-500">{formatTime(bid.timestamp)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 