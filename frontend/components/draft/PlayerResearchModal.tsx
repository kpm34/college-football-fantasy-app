'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChartBarIcon, TrophyIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Player, PlayerStats, SeasonProjection, WeeklyProjection, RiskAssessment } from '@/types/player.types';
import { Badge } from '@/components/ui/Badge';

interface PlayerResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
}

export default function PlayerResearchModal({ isOpen, onClose, player }: PlayerResearchModalProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getStatValue = (stats: PlayerStats | undefined, statPath: string): number => {
    if (!stats) return 0;
    const keys = statPath.split('.');
    let value: any = stats;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || 0;
  };

  const formatStatLine = (label: string, value: number | string, suffix?: string) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">
        {value}{suffix && ` ${suffix}`}
      </span>
    </div>
  );

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-700">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-bold chrome-text">
                      {player.name}
                    </Dialog.Title>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {player.pos}
                      </Badge>
                      <span className="text-sm text-slate-400">{player.team}</span>
                      <span className="text-sm text-slate-400">•</span>
                      <span className="text-sm text-slate-400">{player.conference}</span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-slate-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Season Projection */}
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <ChartBarIcon className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-white">Season Projection</h4>
                    </div>
                    {player.season_projection ? (
                      <div>
                        <div className="text-3xl font-bold text-white mb-2">
                          {player.season_projection.proj_pts_total.toFixed(1)}
                        </div>
                        <div className="text-sm text-slate-400 mb-4">Total Fantasy Points</div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Ceiling</span>
                            <span className="text-sm font-medium text-green-400">
                              {player.season_projection.ceiling.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Floor</span>
                            <span className="text-sm font-medium text-red-400">
                              {player.season_projection.floor.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Risk</span>
                            <span className={`text-sm font-medium ${getRiskColor(player.season_projection.risk)}`}>
                              {player.season_projection.risk.toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-400">Confidence</span>
                              <span className="text-sm font-medium text-white">
                                {player.season_projection.confidence}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">No projection data available</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <TrophyIcon className="w-5 h-5 text-purple-400" />
                      <h4 className="font-semibold text-white">Season Stats</h4>
                    </div>
                    {player.stats ? (
                      <div className="space-y-1">
                        {player.stats.games && formatStatLine('Games Played', player.stats.games)}
                        
                        {/* Position-specific stats */}
                        {player.pos === 'QB' && player.stats.passing && (
                          <>
                            {formatStatLine('Pass Yards', player.stats.passing.yards)}
                            {formatStatLine('Pass TDs', player.stats.passing.touchdowns)}
                            {formatStatLine('INTs', player.stats.passing.interceptions)}
                            {formatStatLine('Rating', player.stats.passing.rating.toFixed(1))}
                          </>
                        )}
                        
                        {['RB', 'QB'].includes(player.pos) && player.stats.rushing && (
                          <>
                            {formatStatLine('Rush Yards', player.stats.rushing.yards)}
                            {formatStatLine('Rush TDs', player.stats.rushing.touchdowns)}
                            {formatStatLine('YPC', player.stats.rushing.yardsPerCarry.toFixed(1))}
                          </>
                        )}
                        
                        {['WR', 'TE'].includes(player.pos) && player.stats.receiving && (
                          <>
                            {formatStatLine('Receptions', player.stats.receiving.receptions)}
                            {formatStatLine('Rec Yards', player.stats.receiving.yards)}
                            {formatStatLine('Rec TDs', player.stats.receiving.touchdowns)}
                            {formatStatLine('YPR', player.stats.receiving.yardsPerReception.toFixed(1))}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500">No stats available</p>
                    )}
                  </div>

                  {/* Risk Assessment */}
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold text-white">Risk Assessment</h4>
                    </div>
                    {player.risk_assessment ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {formatStatLine('Injury Risk', player.risk_assessment.injury_risk.toUpperCase())}
                          {formatStatLine('Depth Chart', player.risk_assessment.depth_chart_risk.toUpperCase())}
                          {formatStatLine('Schedule', player.risk_assessment.schedule_risk.toUpperCase())}
                        </div>
                        
                        <div className="pt-3 border-t border-slate-700">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-slate-400">Overall Risk</span>
                            <span className={`text-sm font-bold ${getRiskColor(player.risk_assessment.overall_risk)}`}>
                              {player.risk_assessment.overall_risk.toUpperCase()}
                            </span>
                          </div>
                          
                          {player.risk_assessment.risk_factors.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-400 mb-2">Risk Factors:</p>
                              <ul className="text-xs text-slate-300 space-y-1">
                                {player.risk_assessment.risk_factors.map((factor, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-yellow-500 mr-2">•</span>
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">No risk assessment available</p>
                    )}
                  </div>
                </div>

                {/* Weekly Projections */}
                {player.weekly_projections && player.weekly_projections.length > 0 && (
                  <div className="mt-6 glass-card p-4 rounded-xl">
                    <h4 className="font-semibold text-white mb-4">Weekly Projections</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3 text-slate-400">Week</th>
                            <th className="text-left py-2 px-3 text-slate-400">Opponent</th>
                            <th className="text-center py-2 px-3 text-slate-400">Proj Pts</th>
                            <th className="text-center py-2 px-3 text-slate-400">Conf</th>
                            <th className="text-center py-2 px-3 text-slate-400">Top 25</th>
                            <th className="text-center py-2 px-3 text-slate-400">Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {player.weekly_projections.slice(0, 6).map((proj) => (
                            <tr key={proj.week} className="border-b border-slate-700/50">
                              <td className="py-2 px-3 text-white">Week {proj.week}</td>
                              <td className="py-2 px-3 text-slate-300">{proj.opponent}</td>
                              <td className="py-2 px-3 text-center font-semibold text-white">
                                {proj.proj_fantasy_pts.toFixed(1)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {proj.is_conf_game ? (
                                  <span className="text-green-400">✓</span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {proj.is_top25_opp ? (
                                  <span className="text-yellow-400">★</span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center text-slate-300">
                                {proj.confidence}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {player.season_projection?.notes && (
                  <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Scouting Notes</h4>
                    <p className="text-sm text-slate-300">{player.season_projection.notes}</p>
                  </div>
                )}

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