'use client';

import { DraftPick, League } from '@/types/draft';

interface DraftOrderProps {
  league: League;
  picks: DraftPick[];
  currentUserId: string;
}

export default function DraftOrder({ league, picks, currentUserId }: DraftOrderProps) {
  const getCurrentPickNumber = () => picks.length + 1;
  const getCurrentRound = () => Math.floor(picks.length / league.members.length) + 1;
  const isSerpentine = (round: number) => round % 2 === 0;

  const getDraftOrderForRound = (round: number) => {
    if (isSerpentine(round)) {
      return [...league.draftOrder].reverse();
    }
    return league.draftOrder;
  };

  const getCurrentUserPosition = () => {
    return league.draftOrder.indexOf(currentUserId) + 1;
  };

  const getNextPicks = (count: number = 5) => {
    const nextPicks = [];
    let currentPick = getCurrentPickNumber();
    let currentRound = getCurrentRound();

    for (let i = 0; i < count; i++) {
      const round = currentRound + Math.floor((currentPick + i - 1) / league.members.length);
      const pickInRound = (currentPick + i - 1) % league.members.length;
      const orderForRound = getDraftOrderForRound(round);
      const userId = orderForRound[pickInRound];
      
      nextPicks.push({
        pickNumber: currentPick + i,
        round,
        userId,
        isCurrentUser: userId === currentUserId
      });
    }

    return nextPicks;
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-bold chrome-text mb-6">Draft Order</h3>

      {/* Current Round Info */}
      <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            Round {getCurrentRound()}
          </div>
          <div className="text-slate-400">
            Pick {getCurrentPickNumber()} of {league.members.length * league.settings.rosterSize}
          </div>
          <div className="text-sm text-chrome mt-2">
            {isSerpentine(getCurrentRound()) ? 'Serpentine Order' : 'Standard Order'}
          </div>
        </div>
      </div>

      {/* Full Draft Order */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Full Order</h4>
        <div className="space-y-2">
          {league.draftOrder.map((userId, index) => {
            const isCurrentUser = userId === currentUserId;
            const isCurrentTurn = getCurrentPickNumber() === index + 1;
            
            return (
              <div
                key={userId}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isCurrentTurn 
                    ? 'bg-chrome/20 border border-chrome' 
                    : isCurrentUser 
                      ? 'bg-slate-600/50' 
                      : 'bg-slate-700/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrentTurn 
                      ? 'bg-chrome text-black' 
                      : isCurrentUser 
                        ? 'bg-slate-500 text-white' 
                        : 'bg-slate-600 text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {isCurrentUser ? 'You' : `Team ${index + 1}`}
                    </div>
                    <div className="text-xs text-slate-400">
                      {userId}
                    </div>
                  </div>
                </div>
                {isCurrentTurn && (
                  <div className="text-chrome text-sm font-medium">
                    Current Turn
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Picks */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Next Picks</h4>
        <div className="space-y-2">
          {getNextPicks().map((pick) => (
            <div
              key={pick.pickNumber}
              className={`flex items-center justify-between p-3 rounded-lg ${
                pick.isCurrentUser 
                  ? 'bg-slate-600/50 border border-slate-500' 
                  : 'bg-slate-700/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  pick.isCurrentUser 
                    ? 'bg-chrome text-black' 
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {pick.pickNumber}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {pick.isCurrentUser ? 'You' : `Team ${pick.userId}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    Round {pick.round}
                  </div>
                </div>
              </div>
              {pick.isCurrentUser && (
                <div className="text-chrome text-sm font-medium">
                  Your Turn
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Draft Settings */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Draft Settings</h4>
        <div className="space-y-1 text-xs text-slate-400">
          <div>Time Limit: {Math.floor(league.settings.draftTimeLimit / 60)} minutes</div>
          <div>Roster Size: {league.settings.rosterSize} players</div>
          <div>Scoring: {league.settings.scoringType}</div>
          <div>Teams: {league.members.length}</div>
        </div>
      </div>
    </div>
  );
} 