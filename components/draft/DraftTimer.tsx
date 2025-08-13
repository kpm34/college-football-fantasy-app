'use client';

import { useEffect, useState } from 'react';

interface DraftTimerProps {
  timeRemaining: number;
  isUserTurn: boolean;
  onAutoPick: () => void;
}

export default function DraftTimer({ timeRemaining, isUserTurn, onAutoPick }: DraftTimerProps) {
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    setIsWarning(timeRemaining <= 30 && timeRemaining > 10);
    setIsCritical(timeRemaining <= 10);
  }, [timeRemaining]);

  useEffect(() => {
    if (isUserTurn && timeRemaining <= 0) {
      onAutoPick();
    }
  }, [timeRemaining, isUserTurn, onAutoPick]);

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
    <div className="flex items-center space-x-4">
      {/* Timer Display */}
      <div className={`px-4 py-2 rounded-lg ${getTimerBgColor()} border border-slate-600`}>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-slate-400">
            {isUserTurn ? 'Your Turn' : 'Waiting...'}
          </div>
        </div>
      </div>

      {/* Auto Pick Button */}
      {isUserTurn && (
        <button
          onClick={onAutoPick}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
        >
          Auto Pick
        </button>
      )}

      {/* Timer Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isUserTurn 
            ? isCritical 
              ? 'bg-red-400 animate-pulse' 
              : isWarning 
                ? 'bg-yellow-400' 
                : 'bg-green-400'
            : 'bg-slate-400'
        }`} />
        <span className="text-sm text-slate-400">
          {isUserTurn 
            ? isCritical 
              ? 'Time Critical!' 
              : isWarning 
                ? 'Time Running Out' 
                : 'Time Remaining'
            : 'Not Your Turn'
          }
        </span>
      </div>
    </div>
  );
} 