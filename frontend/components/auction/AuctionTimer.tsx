'use client';

import { useEffect, useState } from 'react';

interface AuctionTimerProps {
  timeRemaining: number;
  currentBid: number;
  currentBidder: string | null;
}

export default function AuctionTimer({ timeRemaining, currentBid, currentBidder }: AuctionTimerProps) {
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    setIsWarning(timeRemaining <= 30 && timeRemaining > 10);
    setIsCritical(timeRemaining <= 10);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isCritical) return 'text-red-400';
    if (isWarning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getTimerBgColor = () => {
    if (isCritical) return 'bg-red-500/20';
    if (isWarning) return 'bg-yellow-500/20';
    return 'bg-green-500/20';
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Timer Display */}
      <div className={`px-6 py-3 rounded-lg ${getTimerBgColor()} border border-slate-600`}>
        <div className="text-center">
          <div className={`text-3xl font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-slate-400">
            Time Remaining
          </div>
        </div>
      </div>

      {/* Current Bid Display */}
      <div className="px-6 py-3 rounded-lg bg-slate-700/50 border border-slate-600">
        <div className="text-center">
          <div className="text-2xl font-bold text-chrome">
            ${currentBid.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Current Bid
          </div>
        </div>
      </div>

      {/* Current Bidder */}
      {currentBidder && (
        <div className="px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {currentBidder}
            </div>
            <div className="text-xs text-slate-400">
              Leading
            </div>
          </div>
        </div>
      )}

      {/* Timer Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isCritical 
            ? 'bg-red-400 animate-pulse' 
            : isWarning 
              ? 'bg-yellow-400' 
              : 'bg-green-400'
        }`} />
        <span className="text-sm text-slate-400">
          {isCritical 
            ? 'Time Critical!' 
            : isWarning 
              ? 'Time Running Out' 
              : 'Auction Active'
          }
        </span>
      </div>
    </div>
  );
} 