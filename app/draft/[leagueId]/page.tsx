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

  const [filters, setFilters] = useState<{ position?: string; team?: string; conference?: string }>({});
  const [top100, setTop100] = useState<Player[]>([]);

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

      // Load available players from API with filters
      const qs = new URLSearchParams();
      if (filters.position) qs.set('position', filters.position);
      if (filters.team) qs.set('team', filters.team);
      if (filters.conference) qs.set('conference', filters.conference);
      const res = await fetch(`/api/players/draftable?${qs.toString()}`);
      const data = await res.json();
      const availablePlayers = (data.players || []) as Player[];
      setTop100(availablePlayers.slice(0, 100));

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
  
  const search = async (patch: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
    await loadDraftData();
  };

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
        
        {/* Filters/Search */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select className="input" value={filters.position || ''} onChange={e => search({ position: e.target.value || undefined })}>
            <option value="">All Positions</option>
            <option>QB</option>
            <option>RB</option>
            <option>WR</option>
            <option>TE</option>
            <option>K</option>
            <option>DEF</option>
          </select>
          <input className="input" placeholder="Team" value={filters.team || ''} onChange={e => search({ team: e.target.value || undefined })} />
          <select className="input" value={filters.conference || ''} onChange={e => search({ conference: e.target.value || undefined })}>
            <option value="">All Conferences</option>
            <option value="SEC">SEC</option>
            <option value="ACC">ACC</option>
            <option value="Big 12">Big 12</option>
            <option value="Big Ten">Big Ten</option>
          </select>
          <button className="btn btn-accent" onClick={() => search({})}>Reset</button>
        </div>

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

            {/* Top 100 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-2">Top 100 Players</h3>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {top100.map((p, i) => (
                  <div key={p.$id || i} className="flex items-center justify-between text-sm">
                    <div className="truncate"><span className="text-slate-400 mr-2">#{i+1}</span>{p.name}</div>
                    <div className="text-slate-400">{p.position} • {p.team}</div>
                  </div>
                ))}
              </div>
            </div>
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