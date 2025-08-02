'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { DraftState, Player, DraftPick, League } from '@/types/draft';
import DraftBoard from '@/components/draft/DraftBoard';
import DraftOrder from '@/components/draft/DraftOrder';
import DraftTimer from '@/components/draft/DraftTimer';
import PickPlayerModal from '@/components/draft/PickPlayerModal';

interface DraftPageProps {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ userId?: string }>;
}

export default function DraftPage({ params, searchParams }: DraftPageProps) {
  const [leagueId, setLeagueId] = useState<string>('');
  const [userId, setUserId] = useState<string>('current-user');

  // Resolve params and searchParams
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      setLeagueId(resolvedParams.leagueId);
      setUserId(resolvedSearchParams.userId || 'current-user');
    };
    resolveParams();
  }, [params, searchParams]);

  const [draftState, setDraftState] = useState<DraftState>({
    league: null,
    availablePlayers: [],
    picks: [],
    loading: true,
    error: null,
    currentUserTurn: false,
    timeRemaining: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial draft data
  useEffect(() => {
    if (leagueId) {
      loadDraftData();
    }
  }, [leagueId]);

  // Subscribe to realtime updates - temporarily disabled for frontend development
  // useEffect(() => {
  //   if (!leagueId) return;

  //   const unsubscribe = client.realtime.subscribe(
  //     REALTIME_CHANNELS.DRAFT_PICKS(leagueId),
  //     (response: any) => {
  //       if (response.events.includes('databases.*.collections.*.documents.*.create')) {
  //         loadDraftData();
  //       }
  //     }
  //   );

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [leagueId]);

  const loadDraftData = useCallback(async () => {
    try {
      setDraftState(prev => ({ ...prev, loading: true, error: null }));

      // Load draft league
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        leagueId
      );
      const league = leagueResponse as unknown as League;

      // Load available players
      const playersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        [
          // Add filters for available players
        ]
      );
      const availablePlayers = playersResponse.documents as unknown as Player[];

      // Load draft picks
      const picksResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        [
          // Add filters for this league
        ]
      );
      const picks = picksResponse.documents as unknown as DraftPick[];

      setDraftState({
        league,
        availablePlayers,
        picks,
        loading: false,
        error: null,
        currentUserTurn: league.draftOrder[league.currentPick - 1] === userId,
        timeRemaining: 0
      });
    } catch (error) {
      console.error('Error loading draft data:', error);
      setDraftState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load draft data',
        timeRemaining: 0
      }));
    }
  }, [leagueId, userId]);

  const handlePickPlayer = async (playerId: string) => {
    try {
      // Create draft pick
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        'unique()',
        {
          leagueId,
          playerId,
          userId,
          round: draftState.league?.currentRound || 1,
          pickNumber: draftState.picks.length + 1
        }
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error making draft pick:', error);
    }
  };

  if (draftState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading Draft...</p>
        </div>
      </div>
    );
  }

  if (draftState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl">{draftState.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Draft Room</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Draft Board */}
          <div className="lg:col-span-2">
            <DraftBoard 
              picks={draftState.picks}
              league={draftState.league!}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DraftOrder 
              league={draftState.league!}
              picks={draftState.picks}
              currentUserId={userId}
            />
            
            <DraftTimer 
              timeRemaining={draftState.timeRemaining}
              isUserTurn={draftState.currentUserTurn}
              onAutoPick={() => {
                // Auto pick logic would go here
                console.log('Auto pick triggered');
              }}
            />
          </div>
        </div>

        {/* Pick Player Modal - Disabled for now */}
        {/* {isModalOpen && (
          <PickPlayerModal
            player={null}
            onConfirm={() => {}}
            onCancel={() => setIsModalOpen(false)}
          />
        )} */}
      </div>
    </div>
  );
} 