'use client';

import { useState } from 'react';
import { DraftablePlayer, TeamNeeds } from '@/types/player.types';

interface DraftHelperProps {
  teamNeeds: TeamNeeds | null;
  availablePlayers: DraftablePlayer[];
  onDraftPlayer: (player: DraftablePlayer) => void;
  onResearchPlayer: (player: DraftablePlayer) => void;
  onComparePlayers: (players: DraftablePlayer[]) => void;
}

export default function DraftHelper({
  teamNeeds,
  availablePlayers,
  onDraftPlayer,
  onResearchPlayer,
  onComparePlayers
}: DraftHelperProps) {
  const [activeTab, setActiveTab] = useState<'needs' | 'recommendations' | 'research'>('needs');

  const getTopPlayersByPosition = (position: string, count: number = 3) => {
    return availablePlayers
      .filter(p => p.pos === position)
      .sort((a, b) => (b.season_projection?.proj_pts_total || 0) - (a.season_projection?.proj_pts_total || 0))
      .slice(0, count);
  };

  const getBestAvailable = () => {
    return availablePlayers
      .sort((a, b) => (b.season_projection?.proj_pts_total || 0) - (a.season_projection?.proj_pts_total || 0))
      .slice(0, 5);
  };

  const getSleepers = () => {
    return availablePlayers
      .filter(p => p.sleeper_potential)
      .sort((a, b) => (b.season_projection?.proj_pts_total || 0) - (a.season_projection?.proj_pts_total || 0))
      .slice(0, 3);
  };

  const getValuePicks = () => {
    return availablePlayers
      .filter(p => p.value_pick)
      .sort((a, b) => (b.season_projection?.proj_pts_total || 0) - (a.season_projection?.proj_pts_total || 0))
      .slice(0, 3);
  };

  const getRiskAssessment = (player: DraftablePlayer) => {
    const risk = player.risk_assessment?.overall_risk || 'medium';
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[risk as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('needs')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'needs' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Needs
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'recommendations' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'research' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Research
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'needs' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Team Needs Analysis</h3>
              
              {teamNeeds?.needs.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm text-gray-600">All positions filled!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamNeeds?.needs.map((need, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{need.position}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          need.priority === 'high' ? 'bg-red-100 text-red-800' :
                          need.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {need.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{need.reason}</p>
                      
                      <div className="space-y-2">
                        {need.recommended_players.map((player, pIndex) => (
                          <div key={pIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{player.name}</div>
                              <div className="text-xs text-gray-600">{player.team}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {player.season_projection?.proj_pts_total?.toFixed(1) || '0.0'} pts
                              </div>
                              <div className={`text-xs px-1 py-0.5 rounded ${getRiskAssessment(player)}`}>
                                {player.risk_assessment?.overall_risk || 'medium'} risk
                              </div>
                            </div>
                            <div className="ml-2 space-x-1">
                              <button
                                onClick={() => onResearchPlayer(player)}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                              >
                                Research
                              </button>
                              <button
                                onClick={() => onDraftPlayer(player)}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                              >
                                Draft
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Smart Recommendations</h3>
              
              {/* Best Available */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Best Available</h4>
                <div className="space-y-2">
                  {getBestAvailable().map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{player.name}</div>
                        <div className="text-xs text-gray-600">{player.pos} • {player.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {player.season_projection?.proj_pts_total?.toFixed(1) || '0.0'} pts
                        </div>
                        <div className="text-xs text-gray-600">#{index + 1} overall</div>
                      </div>
                      <div className="ml-2">
                        <button
                          onClick={() => onDraftPlayer(player)}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Draft
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sleepers */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sleepers</h4>
                <div className="space-y-2">
                  {getSleepers().map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{player.name}</div>
                        <div className="text-xs text-gray-600">{player.pos} • {player.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {player.season_projection?.proj_pts_total?.toFixed(1) || '0.0'} pts
                        </div>
                        <div className="text-xs text-purple-600">High upside</div>
                      </div>
                      <div className="ml-2">
                        <button
                          onClick={() => onResearchPlayer(player)}
                          className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                        >
                          Research
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Picks */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Value Picks</h4>
                <div className="space-y-2">
                  {getValuePicks().map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{player.name}</div>
                        <div className="text-xs text-gray-600">{player.pos} • {player.team}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {player.season_projection?.proj_pts_total?.toFixed(1) || '0.0'} pts
                        </div>
                        <div className="text-xs text-green-600">Great value</div>
                      </div>
                      <div className="ml-2">
                        <button
                          onClick={() => onDraftPlayer(player)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Draft
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Research</h3>
              
              {/* Position Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Top Players by Position</h4>
                <div className="space-y-3">
                  {['QB', 'RB', 'WR', 'TE'].map(pos => (
                    <div key={pos}>
                      <div className="text-sm font-medium text-gray-700 mb-1">{pos}</div>
                      <div className="space-y-1">
                        {getTopPlayersByPosition(pos, 2).map((player, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <div className="flex-1">
                              <div className="font-medium">{player.name}</div>
                              <div className="text-xs text-gray-600">{player.team}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {player.season_projection?.proj_pts_total?.toFixed(1) || '0.0'} pts
                              </div>
                              <div className={`text-xs px-1 py-0.5 rounded ${getRiskAssessment(player)}`}>
                                {player.risk_assessment?.overall_risk || 'medium'}
                              </div>
                            </div>
                            <div className="ml-2">
                              <button
                                onClick={() => onResearchPlayer(player)}
                                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onComparePlayers(getBestAvailable().slice(0, 3))}
                    className="w-full text-left p-2 bg-blue-50 rounded text-sm hover:bg-blue-100"
                  >
                    🔍 Compare Top 3 Available
                  </button>
                  <button
                    onClick={() => onComparePlayers(getTopPlayersByPosition('QB', 3))}
                    className="w-full text-left p-2 bg-green-50 rounded text-sm hover:bg-green-100"
                  >
                    🏈 Compare Top QBs
                  </button>
                  <button
                    onClick={() => onComparePlayers(getTopPlayersByPosition('RB', 3))}
                    className="w-full text-left p-2 bg-purple-50 rounded text-sm hover:bg-purple-100"
                  >
                    🏃 Compare Top RBs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Available Players</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total</div>
            <div className="font-medium">{availablePlayers.length}</div>
          </div>
          <div>
            <div className="text-gray-600">QB</div>
            <div className="font-medium">{availablePlayers.filter(p => p.pos === 'QB').length}</div>
          </div>
          <div>
            <div className="text-gray-600">RB</div>
            <div className="font-medium">{availablePlayers.filter(p => p.pos === 'RB').length}</div>
          </div>
          <div>
            <div className="text-gray-600">WR</div>
            <div className="font-medium">{availablePlayers.filter(p => p.pos === 'WR').length}</div>
          </div>
          <div>
            <div className="text-gray-600">TE</div>
            <div className="font-medium">{availablePlayers.filter(p => p.pos === 'TE').length}</div>
          </div>
          <div>
            <div className="text-gray-600">K/DEF</div>
            <div className="font-medium">
              {availablePlayers.filter(p => p.pos === 'K' || p.pos === 'DEF').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 