'use client';

import { TeamBudget } from '@/types/auction';

interface TeamBudgetsProps {
  budgets: TeamBudget[];
  currentUserId: string;
  currentBidderId: string | null;
}

export default function TeamBudgets({ budgets, currentUserId, currentBidderId }: TeamBudgetsProps) {
  const sortedBudgets = [...budgets].sort((a, b) => b.remainingBudget - a.remainingBudget);

  const getBudgetPercentage = (budget: TeamBudget) => {
    return (budget.remainingBudget / budget.totalBudget) * 100;
  };

  const getBudgetColor = (percentage: number) => {
    if (percentage > 70) return 'text-green-400';
    if (percentage > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-bold chrome-text mb-6">Team Budgets</h3>

      <div className="space-y-4">
        {sortedBudgets.map((budget) => {
          const percentage = getBudgetPercentage(budget);
          const isCurrentUser = budget.userId === currentUserId;
          const isCurrentBidder = budget.userId === currentBidderId;
          
          return (
            <div
              key={budget.userId}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isCurrentBidder
                  ? 'border-chrome bg-chrome/10'
                  : isCurrentUser
                    ? 'border-slate-500 bg-slate-700/30'
                    : 'border-slate-600 bg-slate-700/20'
              }`}
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isCurrentBidder 
                      ? 'bg-chrome' 
                      : isCurrentUser 
                        ? 'bg-slate-400' 
                        : 'bg-slate-500'
                  }`} />
                  <div>
                    <div className="font-semibold text-white">
                      {isCurrentUser ? 'You' : budget.teamName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {budget.playersOwned}/{budget.maxPlayers} players
                    </div>
                  </div>
                </div>
                {isCurrentBidder && (
                  <span className="text-xs px-2 py-1 bg-chrome text-black rounded-full font-medium">
                    Leading
                  </span>
                )}
              </div>

              {/* Budget Display */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Budget</span>
                  <span className={`text-lg font-bold ${getBudgetColor(percentage)}`}>
                    ${budget.remainingBudget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Spent: ${budget.spentBudget.toLocaleString()}</span>
                  <span>Total: ${budget.totalBudget.toLocaleString()}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Budget Status */}
              <div className="text-xs text-slate-400">
                {percentage > 70 && '💰 Well Funded'}
                {percentage <= 70 && percentage > 40 && '⚠️ Moderate Budget'}
                {percentage <= 40 && '🚨 Low Budget'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-3">League Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-slate-400">Total Budget</div>
            <div className="text-white font-semibold">
              ${budgets.reduce((sum, b) => sum + b.totalBudget, 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Remaining</div>
            <div className="text-white font-semibold">
              ${budgets.reduce((sum, b) => sum + b.remainingBudget, 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Avg Per Team</div>
            <div className="text-white font-semibold">
              ${Math.round(budgets.reduce((sum, b) => sum + b.remainingBudget, 0) / budgets.length).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Players Drafted</div>
            <div className="text-white font-semibold">
              {budgets.reduce((sum, b) => sum + b.playersOwned, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 