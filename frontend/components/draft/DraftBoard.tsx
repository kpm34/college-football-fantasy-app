'use client';

import { DraftPick, League } from '@/types/draft';

interface DraftBoardProps {
  picks: DraftPick[];
  league: League;
}

const POSITION_COLORS = {
  QB: 'bg-blue-500',
  RB: 'bg-green-500',
  WR: 'bg-purple-500',
  TE: 'bg-orange-500',
  K: 'bg-yellow-500',
  DEF: 'bg-red-500'
};

export default function DraftBoard({ picks, league }: DraftBoardProps) {
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
    const roundPicks = picks.filter(pick => pick.round === round);
    const orderForRound = getDraftOrderForRound(round);
    const userId = orderForRound[position];
    return roundPicks.find(pick => pick.userId === userId);
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
            {picksByRound.map((roundPicks, roundIndex) => {
              const round = roundIndex + 1;
              const orderForRound = getDraftOrderForRound(round);
              const isSerpentine = round % 2 === 0;
              
              return (
                <tr key={round} className="border-b border-slate-700/50">
                  <td className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{round}</div>
                      <div className="text-xs text-slate-400">
                        {isSerpentine ? 'Serpentine' : 'Standard'}
                      </div>
                    </div>
                  </td>
                  {orderForRound.map((userId, position) => {
                    const pick = getPickForPosition(round, position);
                    
                    return (
                      <td key={`${round}-${userId}`} className="p-3">
                        {pick ? (
                          <div className="glass-card p-3 rounded-lg border border-slate-600">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-white text-sm">
                                  {pick.playerName}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {pick.playerTeam}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${POSITION_COLORS[pick.playerPosition as keyof typeof POSITION_COLORS]}`}>
                                {pick.playerPosition}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Pick #{pick.pickNumber}</span>
                              <span>{formatTime(pick.timestamp)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border-2 border-dashed border-slate-600">
                            <div className="text-center text-slate-500 text-sm">
                              Waiting...
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