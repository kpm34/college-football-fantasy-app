import { useEffect, useState, useCallback } from 'react';
import { Models, RealtimeResponseEvent } from 'appwrite';
import { client, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { DraftPick, League } from '@/types/draft';
import { useAuth } from './useAuth';

interface DraftRealtimeState {
  league: League | null;
  picks: DraftPick[];
  currentPick: number;
  currentRound: number;
  onTheClock: string | null; // userId who is currently picking
  isMyTurn: boolean;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export function useDraftRealtime(leagueId: string) {
  const { user } = useAuth();
  const [state, setState] = useState<DraftRealtimeState>({
    league: null,
    picks: [],
    currentPick: 1,
    currentRound: 1,
    onTheClock: null,
    isMyTurn: false,
    connected: false,
    loading: true,
    error: null,
  });

  // Initialize draft data
  useEffect(() => {
    if (!leagueId || !user) return;

    const loadDraftData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        // Load league data
        const league = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          leagueId
        ) as unknown as League;

        // Load existing draft picks
        const picksResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DRAFT_PICKS,
          [
            Query.equal('leagueId', leagueId),
            Query.orderAsc('pickNumber')
          ]
        );

        const picks = picksResponse.documents as unknown as DraftPick[];
        const currentPick = picks.length + 1;
        const currentRound = Math.ceil(currentPick / (league.draftOrder?.length || 12));
        
        // Determine who's on the clock
        const pickIndex = (currentPick - 1) % league.draftOrder.length;
        const isSnakeRound = currentRound % 2 === 0;
        const actualIndex = isSnakeRound 
          ? league.draftOrder.length - 1 - pickIndex 
          : pickIndex;
        const onTheClock = league.draftOrder[actualIndex];
        const isMyTurn = onTheClock === user.$id;

        setState({
          league,
          picks,
          currentPick,
          currentRound,
          onTheClock,
          isMyTurn,
          connected: false,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error loading draft data:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load draft data'
        }));
      }
    };

    loadDraftData();
  }, [leagueId, user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!leagueId || !user) return;

    console.log('[Draft Realtime] Subscribing to updates...');

    // Subscribe to draft picks collection
    const unsubscribe = client.subscribe(
      [
        // Subscribe to draft picks
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
        // Subscribe to league updates (for draft status changes)
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents.${leagueId}`
      ],
      (response: RealtimeResponseEvent<any>) => {
        console.log('[Draft Realtime] Received event:', response);

        // Handle draft pick events
        if (response.channels.includes(`databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`)) {
          handleDraftPickEvent(response);
        }

        // Handle league update events
        if (response.channels.includes(`databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents.${leagueId}`)) {
          handleLeagueEvent(response);
        }

        // Mark as connected when we receive any event
        setState(prev => ({ ...prev, connected: true }));
      }
    );

    return () => {
      console.log('[Draft Realtime] Unsubscribing...');
      unsubscribe();
    };
  }, [leagueId, user]);

  // Handle draft pick events
  const handleDraftPickEvent = useCallback((response: RealtimeResponseEvent<any>) => {
    const { events, payload } = response;

    // New pick created
    if (events.includes('databases.*.collections.*.documents.*.create')) {
      const newPick = payload as DraftPick;
      
      // Only process picks for this league
      if (newPick.leagueId !== leagueId) return;

      setState(prev => {
        const updatedPicks = [...prev.picks, newPick].sort((a, b) => a.pickNumber - b.pickNumber);
        const currentPick = updatedPicks.length + 1;
        const currentRound = Math.ceil(currentPick / (prev.league?.draftOrder?.length || 12));
        
        // Determine who's on the clock next
        if (prev.league) {
          const pickIndex = (currentPick - 1) % prev.league.draftOrder.length;
          const isSnakeRound = currentRound % 2 === 0;
          const actualIndex = isSnakeRound 
            ? prev.league.draftOrder.length - 1 - pickIndex 
            : pickIndex;
          const onTheClock = prev.league.draftOrder[actualIndex];
          const isMyTurn = onTheClock === user?.$id;

          return {
            ...prev,
            picks: updatedPicks,
            currentPick,
            currentRound,
            onTheClock,
            isMyTurn,
          };
        }

        return {
          ...prev,
          picks: updatedPicks,
          currentPick,
          currentRound,
        };
      });
    }

    // Pick updated (e.g., timer expired, auto-pick)
    if (events.includes('databases.*.collections.*.documents.*.update')) {
      const updatedPick = payload as DraftPick;
      
      setState(prev => ({
        ...prev,
        picks: prev.picks.map(pick => 
          pick.$id === updatedPick.$id ? updatedPick : pick
        )
      }));
    }
  }, [leagueId, user]);

  // Handle league events
  const handleLeagueEvent = useCallback((response: RealtimeResponseEvent<any>) => {
    const { events, payload } = response;

    // League updated (status change, settings, etc.)
    if (events.includes('databases.*.collections.*.documents.*.update')) {
      const updatedLeague = payload as League;
      
      setState(prev => ({
        ...prev,
        league: updatedLeague,
      }));
    }
  }, []);

  // Make a draft pick
  const makePick = async (playerId: string, playerData: any) => {
    if (!state.isMyTurn || !user || !state.league) {
      throw new Error('Not your turn to pick');
    }

    try {
      const pick = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        'unique()',
        {
          leagueId,
          userId: user.$id,
          playerId,
          playerName: playerData.playerName,
          playerPosition: playerData.position,
          playerTeam: playerData.team,
          pickNumber: state.currentPick,
          round: state.currentRound,
          timestamp: new Date().toISOString(),
        }
      );

      // The realtime subscription will handle updating the state
      return pick;
    } catch (error) {
      console.error('Error making pick:', error);
      throw error;
    }
  };

  // Auto-pick when timer expires
  const autoPick = async () => {
    // This would be called by a timer component
    // Implementation depends on your auto-pick strategy
    console.log('[Draft] Auto-pick triggered');
  };

  return {
    ...state,
    makePick,
    autoPick,
  };
}
