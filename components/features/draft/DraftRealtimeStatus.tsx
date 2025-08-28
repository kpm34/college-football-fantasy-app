'use client';

import { useEffect, useState } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';
import { DraftPick } from '@lib/types/draft';

interface DraftRealtimeStatusProps {
  connected: boolean;
  onTheClock: string | null;
  currentPick: number;
  currentRound: number;
  recentPicks: DraftPick[];
  users: Record<string, { name: string; teamName?: string }>;
}

export function DraftRealtimeStatus({
  connected,
  onTheClock,
  currentPick,
  currentRound,
  recentPicks,
  users,
}: DraftRealtimeStatusProps) {
  const [showRecentPicks, setShowRecentPicks] = useState(true);

  // Get user display name
  const getUserName = (userId: string) => {
    const u = users[userId];
    return (u?.teamName || u?.name || 'Unknown Team');
  };

  // Get last 3 picks
  const lastPicks = recentPicks.slice(-3).reverse();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Connection Status */}
      <div className={`px-4 py-2 border-b flex items-center justify-between ${
        connected ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <FiWifi className="text-green-600" />
              <span className="text-sm font-medium text-green-800">Live Draft Connected</span>
            </>
          ) : (
            <>
              <FiWifiOff className="text-red-600" />
              <span className="text-sm font-medium text-red-800">Reconnecting...</span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-600">
          Pick #{currentPick} • Round {currentRound}
        </div>
      </div>

      {/* On The Clock */}
      {onTheClock && (
        <div className="px-4 py-3 border-b bg-blue-50">
          <div className="text-sm text-blue-600 font-medium">On the Clock</div>
          <div className="text-lg font-bold text-blue-900">
            {getUserName(onTheClock)}
          </div>
        </div>
      )}

      {/* Recent Picks */}
      {showRecentPicks && lastPicks.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Recent Picks</h4>
            <button
              onClick={() => setShowRecentPicks(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            {lastPicks.map((pick, index) => (
              <div 
                key={pick.$id} 
                className={`text-sm flex items-center justify-between py-1 ${
                  index === 0 ? 'font-medium' : 'text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">#{pick.pickNumber}</span>
                  <span>{getUserName((pick as any).authUserId || (pick as any).userId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded font-medium text-white ${
                    getPositionColor(pick.playerPosition)
                  }`}>
                    {pick.playerPosition}
                  </span>
                  <span className="font-medium">{pick.playerName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Recent Picks Button */}
      {!showRecentPicks && (
        <div className="px-4 py-2 border-t">
          <button
            onClick={() => setShowRecentPicks(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Show Recent Picks
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function for position colors
function getPositionColor(position: string): string {
  const colors: Record<string, string> = {
    QB: 'bg-red-500',
    RB: 'bg-blue-500',
    WR: 'bg-green-500',
    TE: 'bg-orange-500',
    K: 'bg-purple-500',
    DEF: 'bg-gray-600',
  };
  return colors[position] || 'bg-gray-500';
}
