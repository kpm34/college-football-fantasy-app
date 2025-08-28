import { useEffect, useState, useCallback, useRef } from 'react';
import { Models, RealtimeResponseEvent } from 'appwrite';
import { client, databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';
import { Query } from 'appwrite';
import { DraftPick, League } from '@lib/types/draft';
import { useAuth } from './useAuth';

interface DraftRealtimeState {
  league: League | null;
  picks: DraftPick[];
  currentPick: number;
  currentRound: number;
  onTheClock: string | null; // clientId who is currently picking
  isMyTurn: boolean;
  connected: boolean;
  loading: boolean;
  error: string | null;
  deadlineAt: string | null;
  draftStatus: string | null;
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
    deadlineAt: null,
    draftStatus: null,
  });
  // Track IDs that represent "me" for turn checks (auth user id + roster doc ids)
  const myIdsRef = useRef<Set<string>>(new Set());
  // Cache the user's fantasy team ID for this league
  const myFantasyTeamIdRef = useRef<string | null>(null);

  // Initialize draft data
  useEffect(() => {
    if (!leagueId) return;

    const loadDraftData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        // Load all draft data through API route (server-side auth)
        const response = await fetch(`/api/drafts/${leagueId}/data`);
        if (!response.ok) {
          throw new Error('Failed to load draft data');
        }
        
        const { data } = await response.json();
        const { league, userTeams, picks: picksData, userId, draftState } = data as any;

        // Load my roster ids within this league (some data paths use roster $id instead of authUserId)
        myIdsRef.current = new Set([userId]);
        for (const d of userTeams as any[]) {
          if (d?.$id) {
            myIdsRef.current.add(String(d.$id));
            // Cache the fantasy team ID for this user
            if (d.ownerAuthUserId === userId) {
              myFantasyTeamIdRef.current = d.$id;
            }
          }
          if (d?.ownerAuthUserId) myIdsRef.current.add(String(d.ownerAuthUserId));
        }

        // Use picks from API response
        const picksResponse = { documents: picksData };

        const normalizePick = (doc: any): DraftPick => ({
          $id: doc.$id,
          leagueId: doc.leagueId,
          round: doc.round,
          pickNumber: typeof doc.pickNumber === 'number' ? doc.pickNumber : (doc.pick as number),
          userId: doc.authUserId || doc.userId || doc.teamId,  // Support multiple field names
          playerId: doc.playerId,
          playerName: doc.playerName,
          playerPosition: doc.playerPosition,
          playerTeam: doc.playerTeam,
          timestamp: doc.timestamp,
          timeRemaining: doc.timeRemaining,
        });

        const picks = (picksResponse.documents as any[]).map(normalizePick);
        const currentPick = picks.length + 1;
        let orderArray: string[] = Array.isArray((league as any).draftOrder)
          ? (league as any).draftOrder
          : (typeof (league as any).draftOrder === 'string'
            ? (() => { try { return JSON.parse((league as any).draftOrder); } catch { return []; } })()
            : []);
        // Fallback: look in scoringRules.draftOrderOverride if present
        if (orderArray.length === 0 && typeof (league as any).scoringRules === 'string') {
          try {
            const rules = JSON.parse((league as any).scoringRules);
            if (Array.isArray(rules?.draftOrderOverride)) {
              orderArray = [...rules.draftOrderOverride];
            }
          } catch {}
        }
        // Fallback: use members when present
        if (orderArray.length === 0 && Array.isArray((league as any).members)) {
          orderArray = [...(league as any).members];
        }
        const teamsCount = orderArray.length || (league.members?.length || 12);
        const currentRound = Math.ceil(currentPick / teamsCount);
        
        // Determine who's on the clock
        const pickIndex = (currentPick - 1) % teamsCount;
        const isSnakeRound = currentRound % 2 === 0;
        const actualIndex = isSnakeRound 
          ? teamsCount - 1 - pickIndex 
          : pickIndex;
        const onTheClock = orderArray[actualIndex] || league.draftOrder?.[actualIndex];
        const draftStartMs = (league as any)?.draftDate ? new Date((league as any).draftDate).getTime() : 0;
        // Treat server draftStatus as source of truth; also allow time-reached fallback
        const effectiveDraftStatus = String(draftState?.draftStatus || '');
        const isDraftLive = (effectiveDraftStatus === 'drafting') || (draftStartMs > 0 ? Date.now() >= draftStartMs : false);
        const isMyTurn = isDraftLive && (onTheClock ? myIdsRef.current.has(String(onTheClock)) : false);

        setState({
          league,
          picks,
          currentPick,
          currentRound,
          onTheClock: isDraftLive ? onTheClock : null,
          isMyTurn,
          connected: false,
          loading: false,
          error: null,
          deadlineAt: draftState?.deadlineAt || null,
          draftStatus: draftState?.draftStatus || null,
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
  }, [leagueId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!leagueId) return;

    console.log('[Draft Realtime] Subscribing to updates...');

    // Subscribe to draft picks collection
    const unsubscribe = client.subscribe(
      [
        // Subscribe to draft picks
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
        // Subscribe to league updates (for draft status changes)
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents.${leagueId}`,
        // Subscribe to draft state snapshots (pause/resume, deadlines)
        `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_STATES}.documents`
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

        // Handle draft state events (filter to this league)
        if (response.channels.includes(`databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_STATES}.documents`)) {
          handleDraftStateEvent(response);
        }

        // Mark as connected when we receive any event
        setState(prev => ({ ...prev, connected: true }));
      }
    );

    // Optimistically mark as connected upon successful subscription to avoid
    // showing a stale "Reconnecting" state while waiting for the first event.
    setState(prev => ({ ...prev, connected: true }));

    return () => {
      console.log('[Draft Realtime] Unsubscribing...');
      unsubscribe();
    };
  }, [leagueId]);

  // Handle draft pick events
  const handleDraftPickEvent = useCallback((response: RealtimeResponseEvent<any>) => {
    const { events, payload } = response;

    // New pick created
    if (events.includes('databases.*.collections.*.documents.*.create')) {
      const src = payload as any;
      const newPick: DraftPick = {
        $id: src.$id,
        leagueId: src.leagueId,
        round: src.round,
        pickNumber: typeof src.pickNumber === 'number' ? src.pickNumber : (src.pick as number),
        userId: src.authUserId || src.userId || src.teamId,
        playerId: src.playerId,
        playerName: src.playerName,
        playerPosition: src.playerPosition,
        playerTeam: src.playerTeam,
        timestamp: src.timestamp,
        timeRemaining: src.timeRemaining,
      };
      
      // Only process picks for this league
      if (newPick.leagueId !== leagueId) return;

      setState(prev => {
        const updatedPicks = [...prev.picks, newPick].sort((a, b) => a.pickNumber - b.pickNumber);
        const currentPick = updatedPicks.length + 1;
        const parsedOrder: string[] = Array.isArray((prev.league as any)?.draftOrder)
          ? (prev.league as any).draftOrder
          : (typeof (prev.league as any)?.draftOrder === 'string'
            ? (() => { try { return JSON.parse((prev.league as any).draftOrder); } catch { return []; } })()
            : []);
        const totalTeams = parsedOrder.length || ((prev.league as any)?.members?.length || 12);
        const currentRound = Math.ceil(currentPick / totalTeams);
        
        // Check if draft is complete
        const totalRounds = (prev.league as any)?.draftRounds || 15;
        // parsedOrder already computed
        const totalPicks = totalRounds * totalTeams;
        
        if (updatedPicks.length >= totalPicks) {
          console.log('🏁 Draft completed! Processing final roster assignments...');
          
          // Call the draft completion endpoint to save rosters (async, don't wait)
          setTimeout(async () => {
            try {
              const response = await fetch('/api/draft/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leagueId })
              });
              
              if (!response.ok) {
                console.error('Failed to process draft completion:', await response.text());
              } else {
                const result = await response.json();
                console.log('✅ Draft rosters processed:', result);
              }
            } catch (error) {
              console.error('Error calling draft completion endpoint:', error);
            }
          }, 1000); // Small delay to ensure all picks are processed
        }
        
        // Determine who's on the clock next (if draft not complete)
        if (prev.league && updatedPicks.length < totalPicks) {
          const pickIndex = (currentPick - 1) % totalTeams;
          const isSnakeRound = currentRound % 2 === 0;
          const actualIndex = isSnakeRound 
            ? totalTeams - 1 - pickIndex 
            : pickIndex;
          const fallbackMembers: string[] = Array.isArray((prev.league as any)?.members) ? (prev.league as any).members : [];
          const onTheClock = parsedOrder[actualIndex] || fallbackMembers[actualIndex] || prev.league.draftOrder?.[actualIndex];
          const draftStartMs = (prev.league as any)?.draftDate ? new Date((prev.league as any).draftDate).getTime() : 0;
          const isDraftLive = (String(prev.draftStatus || '') === 'drafting') || (draftStartMs > 0 ? Date.now() >= draftStartMs : false);
          const isMyTurn = isDraftLive && (onTheClock ? myIdsRef.current.has(String(onTheClock)) : false);

          return {
            ...prev,
            picks: updatedPicks,
            currentPick,
            currentRound,
            onTheClock: isDraftLive ? onTheClock : null,
            isMyTurn,
          };
        }

        return {
          ...prev,
          picks: updatedPicks,
          currentPick,
          currentRound,
          onTheClock: null,
          isMyTurn: false,
        };
      });
    }

    // Pick updated (e.g., timer expired, auto-pick)
    if (events.includes('databases.*.collections.*.documents.*.update')) {
      const src = payload as any;
      const updatedPick: DraftPick = {
        $id: src.$id,
        leagueId: src.leagueId,
        round: src.round,
        pickNumber: typeof src.pickNumber === 'number' ? src.pickNumber : (src.pick as number),
        userId: src.authUserId || src.userId || src.teamId,
        playerId: src.playerId,
        playerName: src.playerName,
        playerPosition: src.playerPosition,
        playerTeam: src.playerTeam,
        timestamp: src.timestamp,
        timeRemaining: src.timeRemaining,
      };
      
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

  // Handle draft state events (pause/resume, deadline changes)
  const handleDraftStateEvent = useCallback((response: RealtimeResponseEvent<any>) => {
    const { events, payload } = response;
    const doc = payload as any;
    // Only react to this league's draftId
    if (!doc || (doc.draftId !== leagueId)) return;

    if (
      events.includes('databases.*.collections.*.documents.*.create') ||
      events.includes('databases.*.collections.*.documents.*.update')
    ) {
      setState(prev => {
        const draftStartMs = (prev.league as any)?.draftDate ? new Date((prev.league as any).draftDate).getTime() : 0;
        const effectiveStatus = String(doc.draftStatus || '');
        const isDraftLive = (effectiveStatus === 'drafting') || (draftStartMs > 0 ? Date.now() >= draftStartMs : true);
        const onClock = doc.onClockTeamId || prev.onTheClock;
        const isMyTurn = isDraftLive && (onClock ? myIdsRef.current.has(String(onClock)) : false);
        return {
          ...prev,
          onTheClock: onClock,
          isMyTurn,
          deadlineAt: doc.deadlineAt || null,
          draftStatus: effectiveStatus || prev.draftStatus,
        };
      });
    }
  }, [leagueId]);

  // Make a draft pick
  const makePick = async (playerId: string) => {
    if (!state.isMyTurn || !user || !state.league) {
      throw new Error('Not your turn to pick');
    }

    try {
      // Use the cached fantasy team ID or fall back to onTheClock
      const fantasyTeamId = myFantasyTeamIdRef.current || state.onTheClock;
      
      if (!fantasyTeamId) {
        throw new Error('Could not determine fantasy team ID');
      }

      console.log('[Draft] Making pick:', {
        playerId,
        fantasyTeamId,
        userId: user.$id,
        onTheClock: state.onTheClock
      });

      const res = await fetch(`/api/drafts/${leagueId}/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerId, 
          fantasyTeamId,
          by: user.$id 
        })
      });
      
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to make pick');
      }
      const json = await res.json();

      // The realtime subscription (draft_events watcher) keeps UI in sync; server advances state
      return json;
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
