'use client';

import React, { useState } from 'react';
import { FiClock, FiUsers, FiList, FiGrid, FiFilter, FiX } from 'react-icons/fi';
import { DraftPlayer } from '@lib/types/projections';

interface MobileDraftInterfaceProps {
  players: DraftPlayer[];
  myPicks: DraftPlayer[];
  draftOrder: any[];
  // current pick metadata for header: { teamId, teamName, pickNumber }
  currentPick: any;
  timeRemaining: number | null;
  onPickPlayer: (player: DraftPlayer) => void;
  isMyTurn: boolean;
  draftStarted: boolean;
  leagueColors: any;
  // Enriched teams with picks for roster previews (no dependence on users collection)
  teams?: Array<{ $id: string; teamName: string; picks: any[] }>;
  // Recent picks for ticker
  recentPicks?: any[];
}

export default function MobileDraftInterface({
  players = [],
  myPicks = [],
  draftOrder = [],
  currentPick,
  timeRemaining,
  onPickPlayer,
  isMyTurn,
  draftStarted,
  leagueColors,
  teams = [],
  recentPicks = []
}: MobileDraftInterfaceProps) {
  const [activeView, setActiveView] = useState<'players' | 'myteam' | 'order'>('players');
  const [showFilters, setShowFilters] = useState(false);
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Filter players - with safety checks
  // Normalize player records and filter drafted
  const normalizedPlayers: DraftPlayer[] = (players || []).map((p: any) => ({
    ...p,
    playerName: p.playerName || p.name || p.displayName || p.fullName || 'Unknown Player',
    position: p.position || p.pos || (p.meta && p.meta.position) || '—',
    team: p.team || p.school || p.college || '',
    projections: p.projections || { fantasyPoints: p.projectedPoints ?? p.fantasyPoints ?? 0 },
  })) as any;

  const availablePlayers = (normalizedPlayers || []).filter(p => p && !(p as any).isDrafted);
  const filteredPlayers = availablePlayers.filter(player => {
    if (!player) return false;
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesSearch = !searchQuery || 
      ((player as any).playerName && (player as any).playerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((player as any).team && (player as any).team.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPosition && matchesSearch;
  });

  // Loading state
  if (!leagueColors) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Header with Timer */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        {/* Timer Bar */}
        {draftStarted && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiClock className="text-lg" />
                <span className="font-bold text-xl">
                  {timeRemaining !== null ? `${timeRemaining}s` : '--'}
                </span>
              </div>
              <div className="text-sm">
                {isMyTurn ? (
                  <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full font-semibold animate-pulse">
                    YOUR TURN
                  </span>
                ) : currentPick ? (
                  <span>On the clock: {currentPick.teamName || 'Team'}</span>
                ) : (
                  <span>Waiting to start...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Picks Ticker */}
        {Array.isArray(recentPicks) && recentPicks.length > 0 && (
          <div className="bg-white border-t border-b px-3 py-2 text-xs text-gray-700 overflow-x-auto whitespace-nowrap">
            {recentPicks.slice(-10).map((p: any, i: number) => {
              const pos = String(p.playerPosition || p.position || '').toUpperCase();
              return (
                <span key={`${p.$id || p.playerId || i}`} className="inline-flex items-center gap-2 mr-3">
                  <span className="text-gray-400">#{p.pickNumber || p.overall || ''}</span>
                  {pos && (<span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{pos}</span>)}
                  <span className="font-medium">{p.playerName || p.name || 'Player'}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b bg-white">
          <button
            onClick={() => setActiveView('players')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeView === 'players' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600'
            }`}
          >
            <FiList className="inline mr-1" />
            Players
          </button>
          <button
            onClick={() => setActiveView('myteam')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              activeView === 'myteam' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600'
            }`}
          >
            <FiUsers className="inline mr-1" />
            My Team
            {myPicks.length > 0 && (
              <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {myPicks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('order')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeView === 'order' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600'
            }`}
          >
            <FiGrid className="inline mr-1" />
            Order
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'players' && (
          <div>
            {/* Search and Filters */}
            <div className="sticky top-0 bg-white p-3 border-b space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 border rounded-lg ${
                    showFilters ? 'bg-blue-50 text-blue-600 border-blue-300' : ''
                  }`}
                >
                  <FiFilter />
                </button>
              </div>

              {/* Position Filters */}
              {showFilters && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['ALL', 'QB', 'RB', 'WR', 'TE', 'K'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPositionFilter(pos)}
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        positionFilter === pos
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Players List */}
            <div className="divide-y">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No players available</p>
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                filteredPlayers.slice(0, 50).map((player) => (
                  <div
                    key={player.$id || Math.random()}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{(player as any).playerName || 'Unknown Player'}</div>
                      <div className="text-xs text-gray-600">
                        {player.position || 'POS'} • {player.team || 'Team'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Proj: {(player as any).projections?.fantasyPoints?.toFixed ? (player as any).projections.fantasyPoints.toFixed(1) : (((player as any).projections?.fantasyPoints ?? 0).toString())} pts
                      </div>
                    </div>
                    {isMyTurn && (
                      <button
                        onClick={() => onPickPlayer(player)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm active:bg-blue-700 transition-colors"
                      >
                        Draft
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeView === 'myteam' && (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-3">My Roster ({myPicks.length})</h3>
            {myPicks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No players drafted yet
              </div>
            ) : (
              <div className="space-y-2">
                {myPicks.map((player, index) => (
                  <div key={player.$id || `pick-${index}`} className="bg-white p-3 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-500">Pick #{index + 1}</span>
                        <div className="font-semibold">{player.playerName || 'Unknown Player'}</div>
                        <div className="text-sm text-gray-600">
                          {player.position || 'POS'} • {player.team || 'Team'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {player.projections?.fantasyPoints?.toFixed(1) || '0.0'} pts
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'order' && (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-3">Draft Order</h3>
            <div className="grid grid-cols-2 gap-2">
              {(teams.length > 0 ? teams : draftOrder).map((team: any, index: number) => (
                <div key={team.$id || index} className={`p-3 rounded-lg border ${currentPick?.teamId === team.$id ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <button
                      className="text-xs text-blue-600"
                      onClick={() => setExpandedTeamId(expandedTeamId === (team.$id || '') ? null : (team.$id || ''))}
                    >
                      {expandedTeamId === (team.$id || '') ? 'Hide' : 'Roster'}
                    </button>
                  </div>
                  <div className="font-medium text-sm mt-1">
                    {team.teamName || team.name || `Team ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Picks: {Array.isArray(team.picks) ? team.picks.length : (team.picks || 0)}
                  </div>
                  {expandedTeamId === (team.$id || '') && Array.isArray(team.picks) && team.picks.length > 0 && (
                    <div className="mt-2 border-t pt-2 space-y-1">
                      {team.picks.slice(0, 8).map((p: any, i: number) => (
                        <div key={`${p.$id || p.playerId || i}`} className="flex items-center justify-between text-xs">
                          <span className="truncate">{p.playerName || p.name || 'Player'}</span>
                          <span className="text-gray-500">{String(p.playerPosition || p.position || '').toUpperCase()}</span>
                        </div>
                      ))}
                      {team.picks.length > 8 && (
                        <div className="text-[11px] text-gray-500">and {team.picks.length - 8} more…</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar (when it's your turn) */}
      {isMyTurn && activeView === 'players' && (
        <div className="sticky bottom-0 bg-white border-t p-3 shadow-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">It's your turn to pick!</p>
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium">
                Auto Pick
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">
                View Best Available
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
