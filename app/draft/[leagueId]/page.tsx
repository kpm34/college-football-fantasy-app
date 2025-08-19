'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftCoreLive } from '@/lib/draft/core';
import { useAuth } from '@/hooks/useAuth';
import { DraftTimer } from '@/components/draft/DraftTimer';
import { DraftRealtimeStatus } from '@/components/draft/DraftRealtimeStatus';
import DraftCore from '@/components/draft/DraftCore';
import { PlayerProjection, DraftPlayer } from '@/types/projections';
import { FiTrendingUp, FiStar, FiWifi } from 'react-icons/fi';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface Props {
  params: Promise<{ leagueId: string }>;
}

export default function DraftRoom({ params }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leagueId, setLeagueId] = useState<string>('');
  
  // Realtime draft state
  const draft = useDraftCoreLive(leagueId);
  
  // User data
  const [users, setUsers] = useState<Record<string, any>>({});
  const [myPicks, setMyPicks] = useState<DraftPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Initialize
  useEffect(() => {
    if (leagueId && !authLoading && user) {
      loadInitialData();
    }
  }, [leagueId, authLoading, user]);

  // Update my picks when draft picks change
  useEffect(() => {
    if (user && draft.picks.length > 0) {
      const myDraftPicks = draft.picks.filter(pick => pick.userId === user.$id);
      setMyPicks(
        myDraftPicks.map(pick => ({
          $id: pick.playerId,
          playerName: pick.playerName,
          position: pick.playerPosition,
          team: pick.playerTeam,
          draftPosition: pick.pickNumber,
          isDrafted: true,
          draftedBy: pick.userId,
          // Add other required fields with defaults
          projections: { fantasyPoints: 0 },
          rankings: { overall: 0, position: 0, adp: 0 },
          prevYearStats: { gamesPlayed: 0, fantasyPoints: 0 },
        } as DraftPlayer))
      );
    }
  }, [user, draft.picks]);

  // Check if draft is complete
  const isDraftComplete = draft.league && draft.picks.length >= 
    (draft.league.draftRounds || 15) * (draft.league.draftOrder?.length || 12);

  const loadInitialData = async () => {
    try {
      // Load users
      if (draft.league?.members) {
        const userDocs = await databases.listDocuments(
          DATABASE_ID,
          'users',
          [Query.equal('$id', draft.league.members)]
        );
        
        const userMap: Record<string, any> = {};
        userDocs.documents.forEach(doc => {
          userMap[doc.$id] = doc;
        });
        setUsers(userMap);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleTimeExpired = async () => {
    console.log('Time expired! Auto-picking best available player...');
    // Auto-pick will be handled by the DraftCore component
  };

  const handleDraftPlayer = async (player: DraftPlayer) => {
    if (!draft.isMyTurn) {
      alert("It's not your turn!");
      return;
    }

    try {
      await draft.makePick({ playerId: player.$id || player.playerId });
      
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error drafting player:', error);
      alert('Failed to draft player. Please try again.');
    }
  };

  const getPositionBadgeColor = (position: string) => {
    const colors: Record<string, string> = {
      QB: 'bg-red-500',
      RB: 'bg-blue-500',
      WR: 'bg-green-500',
      TE: 'bg-orange-500',
      K: 'bg-purple-500',
      DEF: 'bg-gray-600'
    };
    return colors[position] || 'bg-gray-500';
  };

  if (draft.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Connecting to draft room...</p>
        </div>
      </div>
    );
  }

  const handleProcessRosters = async () => {
    try {
      const response = await fetch('/api/draft/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process rosters');
      }
      
      const result = await response.json();
      alert(`Rosters processed successfully! ${result.processed} teams updated.`);
    } catch (error) {
      console.error('Error processing rosters:', error);
      alert('Failed to process rosters. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Live Draft Room</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                draft.connected ? 'bg-green-600' : 'bg-red-600'
              }`}>
                <FiWifi className="text-xs" />
                {draft.connected ? 'Connected' : 'Connecting...'}
              </div>
              {isDraftComplete && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-yellow-600">
                  <FiStar className="text-xs" />
                  Draft Complete!
                </div>
              )}
            </div>
            
            {/* Draft Timer or Completion Actions */}
            {isDraftComplete ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/league/${leagueId}/locker-room`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View My Team
                </button>
                <button
                  onClick={handleProcessRosters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Process Rosters
                </button>
              </div>
            ) : (
              <DraftTimer
                timeLimit={draft.league?.settings?.draftTimeLimit || 90}
                isMyTurn={draft.isMyTurn}
                onTimeExpired={handleTimeExpired}
                currentPick={draft.currentPick}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Realtime Status */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <DraftRealtimeStatus
            connected={draft.connected}
            onTheClock={draft.onTheClock}
            currentPick={draft.currentPick}
            currentRound={draft.currentRound}
            recentPicks={draft.picks}
            users={users}
          />
        </div>

        {/* Main Content - DraftCore Component */}
        <div className="flex-1">
          <DraftCore
            leagueId={leagueId}
            draftType="snake"
            onPlayerSelect={setSelectedPlayer}
            onPlayerDraft={handleDraftPlayer}
            myPicks={myPicks}
            draftedPlayers={draft.picks.map(pick => ({
              $id: pick.playerId,
              playerId: pick.playerId,
              playerName: pick.playerName,
              position: pick.playerPosition,
              team: pick.playerTeam,
              conference: '',
              school: '',
              year: 'JR',
              prevYearStats: { gamesPlayed: 0, fantasyPoints: 0 },
              ratings: { composite: 0 },
              projections: { gamesPlayed: 0, fantasyPoints: 0, confidence: 0 },
              rankings: { overall: 0, position: 0, adp: 0, tier: 0 },
              sources: { espn: false, ncaa: false, spPlus: false, mockDrafts: [], socialMediaBuzz: 0, articles: [] },
              risk: { injuryHistory: [], suspensions: [], riskScore: 0 },
              updatedAt: new Date().toISOString(),
              isDrafted: true,
              draftedBy: pick.userId,
              draftPosition: pick.pickNumber
            } as DraftPlayer))}
            canDraft={draft.isMyTurn}
            timeRemainingSec={undefined}
            currentPickNumber={draft.currentPick}
            currentTeamLabel={draft.onTheClock ? (users[draft.onTheClock]?.name || 'On the clock') : undefined}
          /></div>

        {/* Right Sidebar - Player Details */}
        {selectedPlayer && (
          <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedPlayer.playerName}</h2>
                <p className="text-gray-600">{selectedPlayer.position} • {selectedPlayer.team}</p>
              </div>

              {/* Draft Button */}
              <button
                onClick={() => handleDraftPlayer(selectedPlayer)}
                disabled={!draft.isMyTurn || selectedPlayer.isDrafted}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  !draft.isMyTurn || selectedPlayer.isDrafted
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {selectedPlayer.isDrafted ? 'Already Drafted' : 
                 !draft.isMyTurn ? 'Not Your Turn' : 'Draft Player'}
              </button>

              {/* Projections */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiTrendingUp /> 2025 Projections
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fantasy Points</span>
                    <span className="font-bold">{selectedPlayer.projections?.fantasyPoints?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 