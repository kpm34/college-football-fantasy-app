'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { databases, realtime, DATABASE_ID, COLLECTIONS, REALTIME_CHANNELS } from '@/lib/appwrite';
import { DraftState, Player, DraftPick, League } from '@/types/draft';
import PickPlayerModal from '@/components/draft/PickPlayerModal';
import DraftBoard from '@/components/draft/DraftBoard';
import DraftTimer from '@/components/draft/DraftTimer';
import DraftOrder from '@/components/draft/DraftOrder';

interface DraftPageProps {
  params: { leagueId: string };
  searchParams: { userId?: string };
}

export default function DraftPage({ params, searchParams }: DraftPageProps) {
  const { leagueId } = params;
  const userId = searchParams.userId || 'current-user'; // In real app, get from auth

  const [draftState, setDraftState] = useState<DraftState>({
    league: null,
    picks: [],
    availablePlayers: [],
    currentUserTurn: false,
    timeRemaining: 0,
    loading: true,
    error: null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDraftData();
  }, [leagueId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!leagueId) return;

    const unsubscribe = realtime.subscribe(
      REALTIME_CHANNELS.DRAFT_PICKS(leagueId),
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          // New pick made
          loadDraftData();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [leagueId]);

  // Timer effect
  useEffect(() => {
    if (!draftState.currentUserTurn || draftState.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setDraftState(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [draftState.currentUserTurn, draftState.timeRemaining]);

  const loadDraftData = useCallback(async () => {
    try {
      setDraftState(prev => ({ ...prev, loading: true, error: null }));

      // Load league data
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      const league = leagueResponse as League;

      // Load draft picks
      const picksResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        [
          // Query by leagueId
        ]
      );
      const picks = picksResponse.documents as DraftPick[];

      // Load available players
      const playersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        [
          // Query for eligible players
        ]
      );
      const availablePlayers = playersResponse.documents as Player[];

      // Determine if it's current user's turn
      const currentUserTurn = isUserTurn(league, picks, userId);

      // Calculate time remaining
      const timeRemaining = calculateTimeRemaining(league, picks);

      setDraftState({
        league,
        picks,
        availablePlayers,
        currentUserTurn,
        timeRemaining,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading draft data:', error);
      setDraftState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load draft data'
      }));
    }
  }, [leagueId, userId]);

  const isUserTurn = (league: League, picks: DraftPick[], userId: string): boolean => {
    if (!league || league.status !== 'drafting') return false;
    
    const totalPicks = picks.length;
    const expectedPick = totalPicks + 1;
    const currentUserId = league.draftOrder[expectedPick - 1];
    
    return currentUserId === userId;
  };

  const calculateTimeRemaining = (league: League, picks: DraftPick[]): number => {
    if (!league) return 0;
    
    const lastPick = picks[picks.length - 1];
    if (!lastPick) return league.settings.draftTimeLimit;
    
    const lastPickTime = new Date(lastPick.timestamp).getTime();
    const currentTime = Date.now();
    const elapsed = Math.floor((currentTime - lastPickTime) / 1000);
    
    return Math.max(0, league.settings.draftTimeLimit - elapsed);
  };

  const handlePickPlayer = async (player: Player) => {
    if (!draftState.league || !draftState.currentUserTurn) return;

    try {
      const newPick: Omit<DraftPick, '$id'> = {
        leagueId,
        round: Math.floor(draftState.picks.length / draftState.league.members.length) + 1,
        pickNumber: draftState.picks.length + 1,
        userId,
        playerId: player.$id,
        playerName: player.name,
        playerPosition: player.position,
        playerTeam: player.team,
        timestamp: new Date().toISOString(),
        timeRemaining: draftState.timeRemaining
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        'unique()',
        newPick
      );

      setIsModalOpen(false);
      await loadDraftData(); // Refresh data
    } catch (error) {
      console.error('Error making pick:', error);
      setDraftState(prev => ({
        ...prev,
        error: 'Failed to make pick'
      }));
    }
  };

  const handleAutoPick = async () => {
    if (!draftState.availablePlayers.length) return;
    
    // Auto-pick the first available player
    const autoPlayer = draftState.availablePlayers[0];
    await handlePickPlayer(autoPlayer);
  };

  if (draftState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chrome mx-auto mb-4"></div>
            <p className="text-xl">Loading draft...</p>
          </div>
        </div>
      </div>
    );
  }

  if (draftState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">{draftState.error}</p>
            <button 
              onClick={loadDraftData}
              className="chrome-button px-6 py-3 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!draftState.league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl">League not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold chrome-text">{draftState.league.name} Draft</h1>
              <p className="text-slate-400">Round {draftState.league.currentRound} • Pick {draftState.league.currentPick}</p>
            </div>
            
            <DraftTimer 
              timeRemaining={draftState.timeRemaining}
              isUserTurn={draftState.currentUserTurn}
              onAutoPick={handleAutoPick}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Draft Order */}
          <div className="lg:col-span-1">
            <DraftOrder 
              league={draftState.league}
              picks={draftState.picks}
              currentUserId={userId}
            />
          </div>

          {/* Draft Board */}
          <div className="lg:col-span-2">
            <DraftBoard 
              picks={draftState.picks}
              league={draftState.league}
            />
          </div>
        </div>

        {/* Pick Player Button */}
        {draftState.currentUserTurn && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="chrome-button px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:scale-105 transition-transform"
            >
              Pick Player
            </button>
          </div>
        )}
      </div>

      {/* Pick Player Modal */}
      <PickPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPickPlayer={handlePickPlayer}
        availablePlayers={draftState.availablePlayers}
        loading={false}
      />
    </div>
  );
} 