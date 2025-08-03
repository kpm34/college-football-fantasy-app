'use client';

import { useState, useEffect } from 'react';
import { DraftPick, League } from '@/types/draft';
import { SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DraftBoardProps {
  picks: DraftPick[];
  league: League;
  currentPickNumber?: number;
  currentUserId?: string;
}

const POSITION_COLORS = {
  QB: 'bg-blue-500',
  RB: 'bg-green-500',
  WR: 'bg-purple-500',
  TE: 'bg-orange-500',
  K: 'bg-yellow-500',
  DEF: 'bg-red-500'
};

const POSITION_GRADIENTS = {
  QB: 'from-blue-500/20 to-blue-600/20',
  RB: 'from-green-500/20 to-green-600/20',
  WR: 'from-purple-500/20 to-purple-600/20',
  TE: 'from-orange-500/20 to-orange-600/20',
  K: 'from-yellow-500/20 to-yellow-600/20',
  DEF: 'from-red-500/20 to-red-600/20'
};

export default function DraftBoard({ picks, league, currentPickNumber = 0, currentUserId }: DraftBoardProps) {
  const [recentPicks, setRecentPicks] = useState<Set<number>>(new Set());
  const [animatingPicks, setAnimatingPicks] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Track recent picks for animation
    const latestPick = picks[picks.length - 1];
    if (latestPick) {
      setRecentPicks(prev => new Set(prev).add(latestPick.pickNumber));
      setAnimatingPicks(prev => new Set(prev).add(latestPick.pickNumber));
      
      // Remove from animating after animation completes
      setTimeout(() => {
        setAnimatingPicks(prev => {
          const newSet = new Set(prev);
          newSet.delete(latestPick.pickNumber);
          return newSet;
        });
      }, 1000);

      // Remove from recent after 5 seconds
      setTimeout(() => {
        setRecentPicks(prev => {
          const newSet = new Set(prev);
          newSet.delete(latestPick.pickNumber);
          return newSet;
        });
      }, 5000);
    }
  }, [picks]);
  const getPicksByRound = () => {
    const picksByRound: DraftPick[][] = [];
    const maxRounds = Math.ceil(league.settings.rosterSize / league.members.length);
    
    for (let round = 1; round <= maxRounds; round++) {
      const roundPicks = picks.filter(pick => pick.round === round);
      picksByRound.push(roundPicks);
    }
    
    return picksByRound;
  };

  const getDraftOrderForRound = (round: number) => {
    const isSerpentine = round % 2 === 0;
    if (isSerpentine) {
      return [...league.draftOrder].reverse();
    }
    return league.draftOrder;
  };

  const getPickForPosition = (round: number, position: number) => {
    const orderForRound = getDraftOrderForRound(round);
    const userId = orderForRound[position];
    
    // Calculate the pick number for this position
    const pickNumber = round === 1 
      ? position + 1
      : round % 2 === 0 
        ? (round - 1) * league.members.length + (league.members.length - position)
        : (round - 1) * league.members.length + position + 1;
    
    return picks.find(pick => pick.pickNumber === pickNumber);
  };

  const isCurrentPick = (pickNumber: number) => {
    return currentPickNumber === pickNumber;
  };

  const isUserPick = (userId: string) => {
    return currentUserId === userId;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const picksByRound = getPicksByRound();

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-bold chrome-text mb-6">Draft Board</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Round</th>
              {league.draftOrder.map((userId, index) => (
                <th key={userId} className="text-center p-3 text-slate-400 font-medium">
                  Team {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {picksByRound.map((_, roundIndex) => {
              const round = roundIndex + 1;
              const orderForRound = getDraftOrderForRound(round);
              const isSerpentine = round % 2 === 0;
              
              return (
                <tr key={round} className="border-b border-slate-700/50">
                  <td className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{round}</div>
                      <div className="text-xs text-slate-400">
                        {isSerpentine ? '← →' : '→'}
                      </div>
                    </div>
                  </td>
                  {orderForRound.map((userId, position) => {
                    const pick = getPickForPosition(round, position);
                    const pickNumber = round === 1 
                      ? position + 1
                      : round % 2 === 0 
                        ? (round - 1) * league.members.length + (league.members.length - position)
                        : (round - 1) * league.members.length + position + 1;
                    
                    const isRecent = pick && recentPicks.has(pick.pickNumber);
                    const isAnimating = pick && animatingPicks.has(pick.pickNumber);
                    const isCurrent = isCurrentPick(pickNumber);
                    const isUser = isUserPick(userId);
                    
                    return (
                      <td key={`${round}-${userId}`} className="p-3 relative">
                        {pick ? (
                          <div className={`
                            relative rounded-lg overflow-hidden transition-all duration-500
                            ${isAnimating ? 'scale-105 animate-pulse' : ''}
                            ${isRecent ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                          `}>
                            {/* Background gradient for position */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${
                              POSITION_GRADIENTS[pick.playerPosition as keyof typeof POSITION_GRADIENTS]
                            } opacity-30`} />
                            
                            {/* Recent pick indicator */}
                            {isRecent && (
                              <div className="absolute top-1 right-1 z-10">
                                <SparklesIcon className="w-4 h-4 text-yellow-400 animate-pulse" />
                              </div>
                            )}
                            
                            <div className="relative glass-card p-3 border border-slate-600">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-semibold text-white text-sm">
                                    {pick.playerName}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {pick.playerTeam}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                                  POSITION_COLORS[pick.playerPosition as keyof typeof POSITION_COLORS]
                                }`}>
                                  {pick.playerPosition}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Pick #{pick.pickNumber}</span>
                                <span>{formatTime(pick.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`
                            relative p-3 rounded-lg border-2 transition-all duration-300
                            ${isCurrent 
                              ? 'border-blue-500 bg-blue-500/10 animate-pulse' 
                              : 'border-dashed border-slate-600 hover:border-slate-500'
                            }
                            ${isUser && isCurrent ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                          `}>
                            {isCurrent && (
                              <div className="absolute top-1 right-1">
                                <ClockIcon className="w-4 h-4 text-blue-400 animate-spin" />
                              </div>
                            )}
                            <div className="text-center text-sm">
                              <div className={`${isCurrent ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                                {isCurrent ? 'On the Clock' : 'Pick #' + pickNumber}
                              </div>
                              {isUser && isCurrent && (
                                <div className="text-xs text-blue-400 mt-1">Your Pick!</div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Draft Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <div className="text-2xl font-bold text-white">{picks.length}</div>
          <div className="text-sm text-slate-400">Total Picks</div>
        </div>
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {Math.floor(picks.length / league.members.length) + 1}
          </div>
          <div className="text-sm text-slate-400">Current Round</div>
        </div>
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {league.settings.rosterSize * league.members.length - picks.length}
          </div>
          <div className="text-sm text-slate-400">Picks Remaining</div>
        </div>
      </div>

      {/* Position Breakdown */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-white mb-3">Position Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Object.entries(POSITION_COLORS).map(([position, color]) => {
            const count = picks.filter(pick => pick.playerPosition === position).length;
            return (
              <div key={position} className="p-3 bg-slate-700/30 rounded-lg text-center">
                <div className={`w-4 h-4 rounded mx-auto mb-2 ${color}`} />
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-xs text-slate-400">{position}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 