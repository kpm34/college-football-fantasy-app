'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftRealtime } from '@/hooks/useDraftRealtime';
import { useAuth } from '@/hooks/useAuth';
import { DraftTimer } from '@/components/draft/DraftTimer';
import { DraftRealtimeStatus } from '@/components/draft/DraftRealtimeStatus';
import { PlayerProjection, DraftPlayer } from '@/types/projections';
import { FiSearch, FiFilter, FiTrendingUp, FiStar, FiWifi } from 'react-icons/fi';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface Props {
  params: Promise<{ leagueId: string }>;
}

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const CONFERENCES = ['ALL', 'SEC', 'Big Ten', 'Big 12', 'ACC'];

export default function RealtimeDraftRoom({ params }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leagueId, setLeagueId] = useState<string>('');
  
  // Realtime draft state
  const draft = useDraftRealtime(leagueId);
  
  // Player state
  const [players, setPlayers] = useState<DraftPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'myteam' | 'board'>('available');
  
  // User data
  const [users, setUsers] = useState<Record<string, any>>({});
  const [myPicks, setMyPicks] = useState<DraftPlayer[]>([]);

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

      // Load players
      await loadPlayers();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadPlayers = async () => {
    try {
      // Use enhanced projections API with depth chart logic
      const params = new URLSearchParams();
      if (positionFilter !== 'ALL') params.append('position', positionFilter);
      if (conferenceFilter !== 'ALL') params.append('conference', conferenceFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '10000'); // Get all available players
      params.append('orderBy', 'projection');
      
      const response = await fetch(`/api/draft/players?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load players');
      }
      
      // Transform to expected format
      const players = data.players.map((p: any) => ({
        $id: p.id,
        playerId: p.id,
        playerName: p.name,
        position: p.position,
        team: p.team,
        conference: p.conference,
        school: p.team,
        year: p.year || p.class,
        projections: {
          fantasyPoints: p.projectedPoints,
          confidence: 70,
          floor: Math.round(p.projectedPoints * 0.7),
          ceiling: Math.round(p.projectedPoints * 1.3)
        },
        ratings: { composite: p.rating || 75 },
        rankings: { adp: p.adp || 100 }
      }));
      
      // Mark drafted players based on draft picks
      const draftedPlayerIds = new Set(draft.picks.map(pick => pick.playerId));
      
      const processedPlayers = players.map(player => ({
        ...player,
        isDrafted: draftedPlayerIds.has(player.$id),
        draftedBy: draft.picks.find(pick => pick.playerId === player.$id)?.userId,
        draftPosition: draft.picks.find(pick => pick.playerId === player.$id)?.pickNumber
      })) as DraftPlayer[];
      
      setPlayers(processedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleTimeExpired = async () => {
    // Auto-pick logic
    console.log('Time expired! Auto-picking...');
    
    // Find best available player
    const availablePlayers = players
      .filter(p => !p.isDrafted)
      .sort((a, b) => b.projections.fantasyPoints - a.projections.fantasyPoints);
    
    if (availablePlayers.length > 0 && draft.isMyTurn) {
      await handleDraftPlayer(availablePlayers[0]);
    }
  };

  const handleDraftPlayer = async (player: DraftPlayer) => {
    if (!draft.isMyTurn) {
      alert("It's not your turn!");
      return;
    }

    try {
      await draft.makePick(player.$id, {
        playerName: player.playerName,
        position: player.position,
        team: player.team,
      });
      
      // Clear selection
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
            </div>
            
            {/* Draft Timer */}
            <DraftTimer
              timeLimit={draft.league?.settings?.draftTimeLimit || 90}
              isMyTurn={draft.isMyTurn}
              onTimeExpired={handleTimeExpired}
              currentPick={draft.currentPick}
            />
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
          
          {/* Filters */}
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Position Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Position</label>
              <div className="grid grid-cols-4 gap-2">
                {POSITIONS.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPositionFilter(pos)}
                    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      positionFilter === pos
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Conference Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Conference</label>
              <select
                value={conferenceFilter}
                onChange={(e) => setConferenceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONFERENCES.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </div>

            <button
              onClick={loadPlayers}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'available'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                Available Players
              </button>
              <button
                onClick={() => setActiveTab('myteam')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'myteam'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                My Team ({myPicks.length})
              </button>
              <button
                onClick={() => setActiveTab('board')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'board'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                Draft Board
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'available' && (
              <div className="grid gap-2">
                {players
                  .filter(player => !player.isDrafted)
                  .filter(player => 
                    searchQuery === '' || 
                    player.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    player.team.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((player) => (
                    <div
                      key={player.$id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedPlayer?.$id === player.$id ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getPositionBadgeColor(player.position)}`}>
                            {player.position}
                          </span>
                          <div>
                            <div className="font-semibold">{player.playerName}</div>
                            <div className="text-sm text-gray-600">
                              {player.team} • {player.school || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Proj</div>
                            <div className="font-bold">{player.projections.fantasyPoints.toFixed(1)}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDraftPlayer(player);
                            }}
                            disabled={!draft.isMyTurn}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                              draft.isMyTurn
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {draft.isMyTurn ? 'Draft' : 'Wait'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'myteam' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">My Roster</h3>
                {myPicks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No players drafted yet</p>
                ) : (
                  <div className="grid gap-2">
                    {myPicks
                      .sort((a, b) => (a.draftPosition || 0) - (b.draftPosition || 0))
                      .map((player) => (
                        <div key={player.$id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getPositionBadgeColor(player.position)}`}>
                                {player.position}
                              </span>
                              <div>
                                <div className="font-semibold">{player.playerName}</div>
                                <div className="text-sm text-gray-600">
                                  {player.team} • Pick #{player.draftPosition}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'board' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Draft Board</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draft.picks.map((pick) => (
                    <div key={pick.$id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Pick #{pick.pickNumber} (R{pick.round})
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                          getPositionBadgeColor(pick.playerPosition)
                        }`}>
                          {pick.playerPosition}
                        </span>
                      </div>
                      <div className="font-semibold">{pick.playerName}</div>
                      <div className="text-sm text-gray-600">
                        {pick.playerTeam} • {users[pick.userId]?.name || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
                    <span className="font-bold">{selectedPlayer.projections.fantasyPoints.toFixed(1)}</span>
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
