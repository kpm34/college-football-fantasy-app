'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ScaleIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Player, PlayerStats } from '@/types/player.types';
import { Badge } from '@/components/ui/Badge';

interface PlayerComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1: Player;
  player2: Player;
}

export default function PlayerComparisonModal({ isOpen, onClose, player1, player2 }: PlayerComparisonModalProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getComparisonArrow = (value1: number, value2: number, higherIsBetter: boolean = true) => {
    if (value1 === value2) return null;
    const isPlayer1Better = higherIsBetter ? value1 > value2 : value1 < value2;
    return isPlayer1Better ? (
      <ArrowUpIcon className="w-4 h-4 text-green-500 inline ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 text-red-500 inline ml-1" />
    );
  };

  const formatStatComparison = (
    label: string,
    value1: number | string,
    value2: number | string,
    suffix?: string,
    higherIsBetter: boolean = true
  ) => {
    const numValue1 = typeof value1 === 'number' ? value1 : 0;
    const numValue2 = typeof value2 === 'number' ? value2 : 0;
    
    return (
      <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-700/50">
        <div className="col-span-1 text-sm text-slate-400">{label}</div>
        <div className="col-span-2 text-sm font-semibold text-white text-center">
          {value1}{suffix && ` ${suffix}`}
          {typeof value1 === 'number' && typeof value2 === 'number' && 
            getComparisonArrow(numValue1, numValue2, higherIsBetter)}
        </div>
        <div className="col-span-2 text-sm font-semibold text-white text-center">
          {value2}{suffix && ` ${suffix}`}
          {typeof value1 === 'number' && typeof value2 === 'number' && 
            getComparisonArrow(numValue2, numValue1, higherIsBetter)}
        </div>
      </div>
    );
  };

  const getStatValue = (stats: PlayerStats | undefined, path: string): number => {
    if (!stats) return 0;
    const keys = path.split('.');
    let value: any = stats;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || 0;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <ScaleIcon className="w-6 h-6 text-blue-400" />
                    <Dialog.Title as="h3" className="text-2xl font-bold chrome-text">
                      Player Comparison
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-slate-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Player Headers */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <div className="col-span-1"></div>
                  <div className="col-span-2 text-center">
                    <div className="glass-card p-4 rounded-xl">
                      <h4 className="text-lg font-bold text-white">{player1.name}</h4>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {player1.pos}
                        </Badge>
                        <span className="text-sm text-slate-400">{player1.team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="glass-card p-4 rounded-xl">
                      <h4 className="text-lg font-bold text-white">{player2.name}</h4>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {player2.pos}
                        </Badge>
                        <span className="text-sm text-slate-400">{player2.team}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season Projections */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-400" />
                    Season Projections
                  </h4>
                  <div className="glass-card p-4 rounded-xl">
                    {formatStatComparison(
                      'Total Points',
                      player1.season_projection?.proj_pts_total.toFixed(1) || 0,
                      player2.season_projection?.proj_pts_total.toFixed(1) || 0
                    )}
                    {formatStatComparison(
                      'Ceiling',
                      player1.season_projection?.ceiling.toFixed(1) || 0,
                      player2.season_projection?.ceiling.toFixed(1) || 0
                    )}
                    {formatStatComparison(
                      'Floor',
                      player1.season_projection?.floor.toFixed(1) || 0,
                      player2.season_projection?.floor.toFixed(1) || 0
                    )}
                    {formatStatComparison(
                      'Risk Level',
                      player1.season_projection?.risk || 'N/A',
                      player2.season_projection?.risk || 'N/A'
                    )}
                    {formatStatComparison(
                      'Confidence',
                      player1.season_projection?.confidence || 0,
                      player2.season_projection?.confidence || 0,
                      '%'
                    )}
                  </div>
                </div>

                {/* Position-Specific Stats */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">Season Stats</h4>
                  <div className="glass-card p-4 rounded-xl">
                    {formatStatComparison(
                      'Games',
                      player1.stats?.games || 0,
                      player2.stats?.games || 0
                    )}

                    {/* QB Stats */}
                    {(player1.pos === 'QB' || player2.pos === 'QB') && (
                      <>
                        {formatStatComparison(
                          'Pass Yards',
                          getStatValue(player1.stats, 'passing.yards'),
                          getStatValue(player2.stats, 'passing.yards')
                        )}
                        {formatStatComparison(
                          'Pass TDs',
                          getStatValue(player1.stats, 'passing.touchdowns'),
                          getStatValue(player2.stats, 'passing.touchdowns')
                        )}
                        {formatStatComparison(
                          'INTs',
                          getStatValue(player1.stats, 'passing.interceptions'),
                          getStatValue(player2.stats, 'passing.interceptions'),
                          '',
                          false // Lower is better for INTs
                        )}
                        {formatStatComparison(
                          'Rating',
                          getStatValue(player1.stats, 'passing.rating').toFixed(1),
                          getStatValue(player2.stats, 'passing.rating').toFixed(1)
                        )}
                      </>
                    )}

                    {/* RB Stats */}
                    {(player1.pos === 'RB' || player2.pos === 'RB' || 
                      getStatValue(player1.stats, 'rushing.yards') > 0 || 
                      getStatValue(player2.stats, 'rushing.yards') > 0) && (
                      <>
                        {formatStatComparison(
                          'Rush Yards',
                          getStatValue(player1.stats, 'rushing.yards'),
                          getStatValue(player2.stats, 'rushing.yards')
                        )}
                        {formatStatComparison(
                          'Rush TDs',
                          getStatValue(player1.stats, 'rushing.touchdowns'),
                          getStatValue(player2.stats, 'rushing.touchdowns')
                        )}
                        {formatStatComparison(
                          'YPC',
                          getStatValue(player1.stats, 'rushing.yardsPerCarry').toFixed(1),
                          getStatValue(player2.stats, 'rushing.yardsPerCarry').toFixed(1)
                        )}
                      </>
                    )}

                    {/* WR/TE Stats */}
                    {(['WR', 'TE'].includes(player1.pos) || ['WR', 'TE'].includes(player2.pos) ||
                      getStatValue(player1.stats, 'receiving.yards') > 0 || 
                      getStatValue(player2.stats, 'receiving.yards') > 0) && (
                      <>
                        {formatStatComparison(
                          'Receptions',
                          getStatValue(player1.stats, 'receiving.receptions'),
                          getStatValue(player2.stats, 'receiving.receptions')
                        )}
                        {formatStatComparison(
                          'Rec Yards',
                          getStatValue(player1.stats, 'receiving.yards'),
                          getStatValue(player2.stats, 'receiving.yards')
                        )}
                        {formatStatComparison(
                          'Rec TDs',
                          getStatValue(player1.stats, 'receiving.touchdowns'),
                          getStatValue(player2.stats, 'receiving.touchdowns')
                        )}
                        {formatStatComparison(
                          'YPR',
                          getStatValue(player1.stats, 'receiving.yardsPerReception').toFixed(1),
                          getStatValue(player2.stats, 'receiving.yardsPerReception').toFixed(1)
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">Risk Assessment</h4>
                  <div className="glass-card p-4 rounded-xl">
                    <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-700/50">
                      <div className="col-span-1 text-sm text-slate-400">Injury Risk</div>
                      <div className={`col-span-2 text-sm font-semibold text-center ${getRiskColor(player1.risk_assessment?.injury_risk || 'medium')}`}>
                        {player1.risk_assessment?.injury_risk.toUpperCase() || 'N/A'}
                      </div>
                      <div className={`col-span-2 text-sm font-semibold text-center ${getRiskColor(player2.risk_assessment?.injury_risk || 'medium')}`}>
                        {player2.risk_assessment?.injury_risk.toUpperCase() || 'N/A'}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-700/50">
                      <div className="col-span-1 text-sm text-slate-400">Schedule</div>
                      <div className={`col-span-2 text-sm font-semibold text-center ${getRiskColor(player1.risk_assessment?.schedule_risk || 'medium')}`}>
                        {player1.risk_assessment?.schedule_risk.toUpperCase() || 'N/A'}
                      </div>
                      <div className={`col-span-2 text-sm font-semibold text-center ${getRiskColor(player2.risk_assessment?.schedule_risk || 'medium')}`}>
                        {player2.risk_assessment?.schedule_risk.toUpperCase() || 'N/A'}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 py-3">
                      <div className="col-span-1 text-sm text-slate-400">Overall</div>
                      <div className={`col-span-2 text-sm font-bold text-center ${getRiskColor(player1.risk_assessment?.overall_risk || 'medium')}`}>
                        {player1.risk_assessment?.overall_risk.toUpperCase() || 'N/A'}
                      </div>
                      <div className={`col-span-2 text-sm font-bold text-center ${getRiskColor(player2.risk_assessment?.overall_risk || 'medium')}`}>
                        {player2.risk_assessment?.overall_risk.toUpperCase() || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="glass-card p-4 rounded-xl bg-blue-500/10 border-blue-500/30">
                  <h4 className="font-semibold text-white mb-2">Quick Summary</h4>
                  <div className="text-sm text-slate-300">
                    {(() => {
                      const p1Proj = player1.season_projection?.proj_pts_total || 0;
                      const p2Proj = player2.season_projection?.proj_pts_total || 0;
                      const diff = Math.abs(p1Proj - p2Proj);
                      const winner = p1Proj > p2Proj ? player1 : player2;
                      const loser = p1Proj > p2Proj ? player2 : player1;
                      
                      return (
                        <>
                          <strong>{winner.name}</strong> is projected to score{' '}
                          <strong>{diff.toFixed(1)}</strong> more fantasy points than{' '}
                          <strong>{loser.name}</strong> this season.
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}