'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DraftPlayer } from '@/types/projections';
import { FiSearch, FiFilter, FiTrendingUp, FiStar, FiWifi } from 'react-icons/fi';

export type DraftType = 'snake' | 'mock';
export type Position = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
export type Conference = 'ALL' | 'SEC' | 'Big Ten' | 'Big 12' | 'ACC';

export interface DraftCoreState {
  players: DraftPlayer[];
  searchQuery: string;
  positionFilter: Position;
  conferenceFilter: Conference;
  selectedPlayer: DraftPlayer | null;
  activeTab: 'available' | 'myteam' | 'board';
  loading: boolean;
  error: string | null;
}

export interface DraftCoreProps {
  leagueId: string;
  draftType: DraftType;
  onPlayerSelect?: (player: DraftPlayer) => void;
  onPlayerDraft?: (player: DraftPlayer) => void;
  myPicks?: DraftPlayer[];
  draftedPlayers?: DraftPlayer[];
  children?: React.ReactNode;
}

const POSITIONS: Position[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const CONFERENCES: Conference[] = ['ALL', 'SEC', 'Big Ten', 'Big 12', 'ACC'];

export default function DraftCore({
  leagueId,
  draftType,
  onPlayerSelect,
  onPlayerDraft,
  myPicks = [],
  draftedPlayers = [],
  children
}: DraftCoreProps) {
  const { user } = useAuth();
  
  const [state, setState] = useState<DraftCoreState>({
    players: [],
    searchQuery: '',
    positionFilter: 'ALL',
    conferenceFilter: 'ALL',
    selectedPlayer: null,
    activeTab: 'available',
    loading: true,
    error: null
  });

  // Load players from database
  const loadPlayers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`/api/draft/players?leagueId=${leagueId}&draftType=${draftType}`);
      if (!response.ok) {
        throw new Error(`Failed to load players: ${response.status}`);
      }
      
      const data = await response.json();
      setState(prev => ({ 
        ...prev, 
        players: data.players || [], 
        loading: false 
      }));
    } catch (error) {
      console.error('Error loading players:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load players' 
      }));
    }
  }, [leagueId, draftType]);

  // Initialize players on component mount
  useEffect(() => {
    if (leagueId) {
      loadPlayers();
    }
  }, [leagueId, loadPlayers]);

  // Filter available players (not drafted)
  const availablePlayers = state.players.filter(player => 
    !draftedPlayers.some(drafted => drafted.id === player.id)
  );

  // Apply search and position filters
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = state.searchQuery === '' || 
      player.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      player.team?.toLowerCase().includes(state.searchQuery.toLowerCase());
      
    const matchesPosition = state.positionFilter === 'ALL' || 
      player.position === state.positionFilter;
      
    const matchesConference = state.conferenceFilter === 'ALL' || 
      player.conference === state.conferenceFilter;
      
    return matchesSearch && matchesPosition && matchesConference;
  });

  // Sort players by projected points (descending)
  const sortedPlayers = filteredPlayers.sort((a, b) => 
    (b.projectedPoints || 0) - (a.projectedPoints || 0)
  );

  // Handle player selection
  const handlePlayerSelect = (player: DraftPlayer) => {
    setState(prev => ({ ...prev, selectedPlayer: player }));
    onPlayerSelect?.(player);
  };

  // Handle player draft
  const handlePlayerDraft = (player: DraftPlayer) => {
    onPlayerDraft?.(player);
    setState(prev => ({ ...prev, selectedPlayer: null }));
  };

  // Reset filters
  const resetFilters = () => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      positionFilter: 'ALL',
      conferenceFilter: 'ALL'
    }));
  };

  // Get position badge color
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      QB: 'bg-red-100 text-red-800',
      RB: 'bg-green-100 text-green-800', 
      WR: 'bg-blue-100 text-blue-800',
      TE: 'bg-yellow-100 text-yellow-800',
      K: 'bg-purple-100 text-purple-800',
      DEF: 'bg-gray-100 text-gray-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search players or teams..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-4 h-4" />
            <select
              value={state.positionFilter}
              onChange={(e) => setState(prev => ({ ...prev, positionFilter: e.target.value as Position }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Conference Filter */}
          <div className="flex items-center gap-2">
            <select
              value={state.conferenceFilter}
              onChange={(e) => setState(prev => ({ ...prev, conferenceFilter: e.target.value as Conference }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CONFERENCES.map(conf => (
                <option key={conf} value={conf}>{conf}</option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          {/* Results Count */}
          <div className="text-sm text-gray-500">
            {sortedPlayers.length} players available
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setState(prev => ({ ...prev, activeTab: 'available' }))}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              state.activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Players ({availablePlayers.length})
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, activeTab: 'myteam' }))}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              state.activeTab === 'myteam'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Team ({myPicks.length})
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, activeTab: 'board' }))}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              state.activeTab === 'board'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Draft Board
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {state.loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading players...</p>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-600">
              <p className="mb-2">Error loading players</p>
              <p className="text-sm text-gray-500">{state.error}</p>
              <button
                onClick={loadPlayers}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : state.activeTab === 'available' ? (
          <div className="p-6">
            <div className="grid gap-4">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                    state.selectedPlayer?.id === player.id
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.team} • {player.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{player.projectedPoints?.toFixed(1) || '0.0'}</p>
                        <p className="text-xs text-gray-500">proj pts</p>
                      </div>
                      {draftType !== 'mock' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayerDraft(player);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          Draft
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : state.activeTab === 'myteam' ? (
          <div className="p-6">
            <div className="grid gap-4">
              {myPicks.map((player) => (
                <div
                  key={player.id}
                  className="p-4 border border-green-200 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiStar className="text-green-600 w-5 h-5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.team} • {player.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{player.projectedPoints?.toFixed(1) || '0.0'}</p>
                        <p className="text-xs text-gray-500">proj pts</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {myPicks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No players drafted yet
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              Draft board coming soon
            </div>
          </div>
        )}
      </div>

      {/* Children (custom content) */}
      {children}
    </div>
  );
}

// Export hook for draft state management
export function useDraftCore(initialState?: Partial<DraftCoreState>) {
  const [state, setState] = useState<DraftCoreState>({
    players: [],
    searchQuery: '',
    positionFilter: 'ALL',
    conferenceFilter: 'ALL', 
    selectedPlayer: null,
    activeTab: 'available',
    loading: false,
    error: null,
    ...initialState
  });

  const updateState = useCallback((updates: Partial<DraftCoreState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return { state, updateState };
}