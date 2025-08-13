"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS, client } from "@/lib/appwrite";
import { Query } from "appwrite";
import { PlayerProjection, DraftPlayer } from "@/types/projections";
import { ProjectionsService } from "@/lib/services/projections.service";
import { FiSearch, FiFilter, FiTrendingUp, FiStar, FiInfo } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";

interface DraftRoomProps {
  params: Promise<{
    leagueId: string;
  }>;
}

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const CONFERENCES = ['ALL', 'SEC', 'Big Ten', 'Big 12', 'ACC'];

export default function DraftRoom({ params }: DraftRoomProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leagueId, setLeagueId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Draft state
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [currentPick, setCurrentPick] = useState(1);
  const [myPicks, setMyPicks] = useState<DraftPlayer[]>([]);
  const [allPicks, setAllPicks] = useState<Record<number, DraftPlayer>>({});
  
  // Player search state
  const [players, setPlayers] = useState<DraftPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);
  
  // UI state
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'myteam' | 'rankings'>('available');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (leagueId && !authLoading && user) {
      initializeDraft();
    }
  }, [leagueId, authLoading, user]);

  const initializeDraft = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Load draft order
      // TODO: Load from draft settings
      
      // Load players with projections
      await loadPlayers();
      
      // Subscribe to draft updates
      subscribeToUpdates();
      
    } catch (error) {
      console.error('Error initializing draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    const { players } = await ProjectionsService.searchPlayers({
      position: positionFilter === 'ALL' ? undefined : positionFilter,
      conference: conferenceFilter === 'ALL' ? undefined : conferenceFilter,
      school: schoolFilter || undefined,
      search: searchQuery,
      limit: 200
    });
    
    // Mark drafted players
    const draftedPlayers = players.map(player => ({
      ...player,
      isDrafted: false, // TODO: Check against actual draft picks
      draftedBy: undefined,
      draftPosition: undefined
    })) as DraftPlayer[];
    
    setPlayers(draftedPlayers);
  };

  const subscribeToUpdates = () => {
    // Subscribe to draft pick updates
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          // Handle new draft pick
          handleNewPick(response.payload);
        }
      }
    );
    
    return () => unsubscribe();
  };

  const handleNewPick = (pick: any) => {
    // Update draft state with new pick
    setCurrentPick(prev => prev + 1);
    
    // Update player as drafted
    setPlayers(prev => 
      prev.map(player => 
        player.$id === pick.playerId 
          ? { ...player, isDrafted: true, draftedBy: pick.userId, draftPosition: pick.pickNumber }
          : player
      )
    );
    
    // Update picks record
    setAllPicks(prev => ({
      ...prev,
      [pick.pickNumber]: pick
    }));
  };

  const draftPlayer = async (player: DraftPlayer) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        'unique()',
        {
          leagueId,
          userId: user?.$id || '',
          playerId: player.$id,
          playerName: player.playerName,
          position: player.position,
          team: player.team,
          pickNumber: currentPick,
          round: Math.ceil(currentPick / draftOrder.length),
          timestamp: new Date().toISOString()
        }
      );
      
      // Add to my picks
      setMyPicks(prev => [...prev, { ...player, isDrafted: true, draftPosition: currentPick }]);
      
    } catch (error) {
      console.error('Error drafting player:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading draft room...</p>
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
            <h1 className="text-xl font-bold">Draft Room</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-400">Pick:</span> #{currentPick}
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Round:</span> {Math.ceil(currentPick / (draftOrder.length || 12))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Search and Filters */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
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
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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

            {/* School Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">School</label>
              <input
                type="text"
                placeholder="e.g., Alabama, Ohio State"
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Top Players Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="topOnly"
                checked={showTopOnly}
                onChange={(e) => setShowTopOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="topOnly" className="text-sm font-medium text-gray-700">
                Show Top {positionFilter === 'WR' ? '40' : '20'} Only
              </label>
            </div>

            <button
              onClick={loadPlayers}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Main Content - Player List */}
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
                onClick={() => setActiveTab('rankings')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'rankings'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                Rankings
              </button>
            </div>
          </div>

          {/* Player Grid */}
          <div className="p-4">
            {activeTab === 'available' && (
              <div className="grid gap-2">
                {players
                  .filter(player => !player.isDrafted)
                  .map((player) => (
                    <div
                      key={player.$id}
                      onClick={() => setSelectedPlayer(player)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getPositionBadgeColor(player.position)}`}>
                            {player.position}
                          </span>
                          <div>
                            <div className="font-semibold">{player.playerName}</div>
                            <div className="text-sm text-gray-600">
                              {player.team} • {player.school}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Proj</div>
                            <div className="font-bold">{player.projections.fantasyPoints.toFixed(1)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">ADP</div>
                            <div className="font-semibold">{player.rankings.adp}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              draftPlayer(player);
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Draft
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
                    {myPicks.map((player) => (
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
                          <div className="font-bold">{player.projections.fantasyPoints.toFixed(1)} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="space-y-6">
                {POSITIONS.filter(pos => pos !== 'ALL').map(position => (
                  <div key={position}>
                    <h3 className="text-lg font-semibold mb-3">Top {position}s</h3>
                    <div className="grid gap-2">
                      {players
                        .filter(p => p.position === position && !p.isDrafted)
                        .slice(0, position === 'WR' ? 10 : 5)
                        .map((player, idx) => (
                          <div key={player.$id} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                                <div>
                                  <div className="font-semibold">{player.playerName}</div>
                                  <div className="text-sm text-gray-600">{player.team}</div>
                                </div>
                              </div>
                              <div className="font-bold">{player.projections.fantasyPoints.toFixed(1)}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
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
                <p className="text-sm text-gray-500">{selectedPlayer.school} • {selectedPlayer.conference}</p>
              </div>

              {/* Projections */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiTrendingUp /> 2025 Projections
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fantasy Points</span>
                    <span className="font-bold">{selectedPlayer.projections.fantasyPoints.toFixed(1)}</span>
                  </div>
                  {selectedPlayer.position === 'QB' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passing Yards</span>
                        <span>{selectedPlayer.projections.passingYards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passing TDs</span>
                        <span>{selectedPlayer.projections.passingTDs}</span>
                      </div>
                    </>
                  )}
                  {['RB', 'WR', 'TE'].includes(selectedPlayer.position) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Receptions</span>
                        <span>{selectedPlayer.projections.receptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Receiving Yards</span>
                        <span>{selectedPlayer.projections.receivingYards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Receiving TDs</span>
                        <span>{selectedPlayer.projections.receivingTDs}</span>
                      </div>
                    </>
                  )}
                  {['QB', 'RB'].includes(selectedPlayer.position) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rushing Yards</span>
                        <span>{selectedPlayer.projections.rushingYards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rushing TDs</span>
                        <span>{selectedPlayer.projections.rushingTDs}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Previous Year Stats */}
              <div>
                <h3 className="font-semibold mb-3">2024 Stats</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Games Played</span>
                    <span>{selectedPlayer.prevYearStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fantasy Points</span>
                    <span className="font-bold">{selectedPlayer.prevYearStats.fantasyPoints.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Rankings & Ratings */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiStar /> Rankings & Ratings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">#{selectedPlayer.rankings.overall}</div>
                    <div className="text-sm text-gray-600">Overall Rank</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">#{selectedPlayer.rankings.position}</div>
                    <div className="text-sm text-gray-600">{selectedPlayer.position} Rank</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedPlayer.rankings.adp}</div>
                    <div className="text-sm text-gray-600">ADP</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedPlayer.projections.confidence}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => draftPlayer(selectedPlayer)}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  disabled={selectedPlayer.isDrafted}
                >
                  {selectedPlayer.isDrafted ? 'Already Drafted' : 'Draft Player'}
                </button>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
