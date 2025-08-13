'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DraftablePlayer, PlayerFilters, DraftBoardState, TeamNeeds } from '@/types/player.types';
import DraftHelper from '@/components/draft/DraftHelper';
import PlayerResearchModal from '@/components/draft/PlayerResearchModal';
import PlayerComparisonModal from '@/components/draft/PlayerComparisonModal';
import DraftBoard from '@/components/draft/DraftBoard';
import DraftTimer from '@/components/draft/DraftTimer';
import DraftOrder from '@/components/draft/DraftOrder';

export default function DraftBoardPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  
  const [draftState, setDraftState] = useState<DraftBoardState>({
    available_players: [],
    drafted_players: [],
    current_pick: 1,
    current_round: 1,
    time_remaining: 120,
    is_user_turn: false,
    filters: {},
    sort_by: 'projection',
    sort_order: 'desc'
  });

  const [teamNeeds, setTeamNeeds] = useState<TeamNeeds | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftablePlayer | null>(null);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [playersToCompare, setPlayersToCompare] = useState<DraftablePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDraftData();
  }, [leagueId]);

  const loadDraftData = async () => {
    try {
      // Load draftable players with projections
      const playersResponse = await fetch(`/api/players/draftable?week=1`);
      const playersData = await playersResponse.json();
      
      // Load draft status
      const statusResponse = await fetch(`/api/draft/${leagueId}/status`);
      const statusData = await statusResponse.json();
      
      setDraftState(prev => ({
        ...prev,
        available_players: playersData.players,
        drafted_players: statusData.drafted_players || [],
        current_pick: statusData.current_pick || 1,
        current_round: statusData.current_round || 1,
        time_remaining: statusData.time_remaining || 120,
        is_user_turn: statusData.is_user_turn || false
      }));

      // Analyze team needs
      analyzeTeamNeeds(playersData.players, statusData.drafted_players || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading draft data:', error);
      setLoading(false);
    }
  };

  const analyzeTeamNeeds = (availablePlayers: DraftablePlayer[], draftedPlayers: any[]) => {
    // Simple team needs analysis
    const currentRoster = draftedPlayers.map(dp => dp.player);
    const needs = [];
    
    // Check position needs
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    positions.forEach(pos => {
      const count = currentRoster.filter(p => p.pos === pos).length;
      const max = pos === 'QB' ? 2 : pos === 'K' || pos === 'DEF' ? 1 : 4;
      
      if (count < max) {
        const priority = count === 0 ? 'high' : count < Math.ceil(max/2) ? 'medium' : 'low';
        const recommended = availablePlayers
          .filter(p => p.pos === pos)
          .slice(0, 3);
        
        needs.push({
          position: pos,
          priority,
          reason: `Need ${max - count} more ${pos}${count === 0 ? ' (starter needed)' : ''}`,
          recommended_players: recommended
        });
      }
    });

    setTeamNeeds({
      team_id: 'user-team',
      current_roster: currentRoster,
      needs,
      best_available: availablePlayers.slice(0, 5),
      next_picks: [draftState.current_pick + 1, draftState.current_pick + 2]
    });
  };

  const handleDraftPlayer = async (player: DraftablePlayer) => {
    try {
      const response = await fetch(`/api/draft/${leagueId}/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.player_id, pick: draftState.current_pick })
      });

      if (response.ok) {
        // Update local state
        setDraftState(prev => ({
          ...prev,
          available_players: prev.available_players.filter(p => p.player_id !== player.player_id),
          drafted_players: [...prev.drafted_players, {
            player,
            pick_number: prev.current_pick,
            round: prev.current_round,
            team_id: 'user-team',
            team_name: 'Your Team',
            timestamp: new Date()
          }],
          current_pick: prev.current_pick + 1,
          current_round: Math.floor((prev.current_pick + 1) / 12) + 1
        }));

        // Re-analyze team needs
        analyzeTeamNeeds(
          draftState.available_players.filter(p => p.player_id !== player.player_id),
          [...draftState.drafted_players, { player }]
        );
      }
    } catch (error) {
      console.error('Error drafting player:', error);
    }
  };

  const handleFilterChange = (filters: PlayerFilters) => {
    setDraftState(prev => ({ ...prev, filters }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setDraftState(prev => ({ 
      ...prev, 
      sort_by: sortBy as any, 
      sort_order: sortOrder 
    }));
  };

  const openPlayerResearch = (player: DraftablePlayer) => {
    setSelectedPlayer(player);
    setResearchModalOpen(true);
  };

  const openPlayerComparison = (players: DraftablePlayer[]) => {
    setPlayersToCompare(players);
    setComparisonModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading draft board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Draft Board</h1>
              <p className="text-gray-600">League: {leagueId}</p>
            </div>
            <div className="flex items-center space-x-4">
              <DraftTimer 
                timeRemaining={draftState.time_remaining}
                isUserTurn={draftState.is_user_turn}
                onAutoPick={() => console.log('Auto pick')}
              />
              <div className="text-sm text-gray-600">
                Round {draftState.current_round} • Pick {draftState.current_pick}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Draft Helper */}
          <div className="lg:col-span-1">
            <DraftHelper 
              teamNeeds={teamNeeds}
              availablePlayers={draftState.available_players}
              onDraftPlayer={handleDraftPlayer}
              onResearchPlayer={openPlayerResearch}
              onComparePlayers={openPlayerComparison}
            />
          </div>

          {/* Main Content - Draft Board */}
          <div className="lg:col-span-2">
            <DraftBoard 
              availablePlayers={draftState.available_players}
              draftedPlayers={draftState.drafted_players}
              filters={draftState.filters}
              sortBy={draftState.sort_by}
              sortOrder={draftState.sort_order}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onDraftPlayer={handleDraftPlayer}
              onResearchPlayer={openPlayerResearch}
              onComparePlayers={openPlayerComparison}
            />
          </div>

          {/* Right Sidebar - Draft Order */}
          <div className="lg:col-span-1">
            <DraftOrder 
              league={{ $id: leagueId, name: 'League', members: [] }}
              picks={draftState.drafted_players}
              currentUserId="user1"
            />
          </div>
        </div>
      </div>

      {/* Player Research Modal */}
      {selectedPlayer && (
        <PlayerResearchModal
          isOpen={researchModalOpen}
          onClose={() => setResearchModalOpen(false)}
          player={selectedPlayer}
          onDraftPlayer={handleDraftPlayer}
        />
      )}

      {/* Player Comparison Modal */}
      {playersToCompare.length > 0 && (
        <PlayerComparisonModal
          isOpen={comparisonModalOpen}
          onClose={() => setComparisonModalOpen(false)}
          players={playersToCompare}
          onDraftPlayer={handleDraftPlayer}
        />
      )}
    </div>
  );
} 