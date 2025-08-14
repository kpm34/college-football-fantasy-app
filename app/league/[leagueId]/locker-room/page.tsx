'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  PlusIcon,
  ArrowUpDownIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Player {
  $id: string;
  name: string;
  position: string;
  team: string;
  conference?: string;
  year?: string;
  cfbd_id?: string;
  projection?: number;
  fantasy_points?: number;
  isStarter?: boolean;
  slotPosition?: string;
}

interface Team {
  $id: string;
  leagueId: string;
  userId: string;
  name: string;
  teamName?: string;
  wins?: number;
  losses?: number;
  ties?: number;
  players?: string;
}

interface League {
  $id: string;
  name: string;
  commissionerId: string;
  gameMode?: string;
  rosterSchema?: {
    rb?: number;
    wr?: number;
    benchSize?: number;
  };
}

interface SlotConfig {
  position: string;
  count: number;
  eligiblePositions: string[];
}

const DEFAULT_ROSTER_CONFIG: SlotConfig[] = [
  { position: 'QB', count: 1, eligiblePositions: ['QB'] },
  { position: 'RB', count: 2, eligiblePositions: ['RB'] },
  { position: 'WR', count: 2, eligiblePositions: ['WR'] },
  { position: 'TE', count: 1, eligiblePositions: ['TE'] },
  { position: 'FLEX', count: 1, eligiblePositions: ['RB', 'WR', 'TE'] },
  { position: 'K', count: 1, eligiblePositions: ['K'] },
  { position: 'DEF', count: 1, eligiblePositions: ['DEF'] }
];

export default function LockerRoomPage({ params, searchParams }: {
  params: Promise<{ leagueId: string }>;
  searchParams?: Promise<{ teamId?: string }>;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<League | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [leagueId, setLeagueId] = useState('');
  const [teamIdParam, setTeamIdParam] = useState('');
  const [viewingOtherTeam, setViewingOtherTeam] = useState(false);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  
  // UI state
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [guardMessage, setGuardMessage] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Drag state
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  // Roster configuration based on league settings
  const [rosterConfig, setRosterConfig] = useState<SlotConfig[]>(DEFAULT_ROSTER_CONFIG);
  const [benchSize, setBenchSize] = useState(7);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
      const resolvedSearchParams = await searchParams;
      setTeamIdParam(resolvedSearchParams?.teamId || '');
    };
    resolveParams();
  }, [params, searchParams]);

  useEffect(() => {
    if (!leagueId || authLoading || !user) return;
    loadLeagueAndTeamData();
  }, [leagueId, authLoading, user, teamIdParam]);

  const loadLeagueAndTeamData = async () => {
    try {
      setLoading(true);
      
      // Load league data
      const leagueData = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      setLeague(leagueData as unknown as League);
      
      // Check if user is commissioner
      const isComm = leagueData.commissionerId === user?.$id;
      setIsCommissioner(isComm);
      
      // Configure roster based on league settings
      if (leagueData.gameMode && leagueData.rosterSchema) {
        const config = [...DEFAULT_ROSTER_CONFIG];
        if (leagueData.gameMode === 'conference') {
          // Conference mode adjustments
          const rbIndex = config.findIndex(c => c.position === 'RB');
          const wrIndex = config.findIndex(c => c.position === 'WR');
          if (rbIndex >= 0) config[rbIndex].count = Math.min(leagueData.rosterSchema.rb || 2, 2);
          if (wrIndex >= 0) config[wrIndex].count = Math.min(leagueData.rosterSchema.wr || 2, 5);
        } else {
          // Power 4 mode
          const rbIndex = config.findIndex(c => c.position === 'RB');
          const wrIndex = config.findIndex(c => c.position === 'WR');
          if (rbIndex >= 0) config[rbIndex].count = leagueData.rosterSchema.rb || 2;
          if (wrIndex >= 0) config[wrIndex].count = Math.min(leagueData.rosterSchema.wr || 2, 6);
        }
        setRosterConfig(config);
        setBenchSize(leagueData.rosterSchema.benchSize || 7);
      }
      
      // Determine which team to load
      let targetTeamId = teamIdParam;
      if (targetTeamId && !isComm) {
        // Non-commissioner trying to view another team
        router.push(`/league/${leagueId}/locker-room`);
        return;
      }
      
      // Load team data
      let teamQuery: Query[] = [Query.equal('leagueId', leagueId)];
      if (targetTeamId) {
        teamQuery.push(Query.equal('$id', targetTeamId));
        setViewingOtherTeam(true);
        setCanEdit(false);
      } else {
        teamQuery.push(Query.equal('userId', user.$id));
        setViewingOtherTeam(false);
        setCanEdit(true);
      }
      
      const teamsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        teamQuery
      );
      
      if (teamsResponse.documents.length > 0) {
        const teamData = teamsResponse.documents[0] as unknown as Team;
        setTeam(teamData);
        setTeamName(teamData.teamName || teamData.name || 'My Team');
        
        // Load player data
        if (teamData.players) {
          try {
            const playerIds = JSON.parse(teamData.players);
            if (playerIds.length > 0) {
              const playersResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLAYERS,
                [Query.equal('$id', playerIds)]
              );
              const playerMap = new Map(playersResponse.documents.map(p => [p.$id, p as unknown as Player]));
              const orderedPlayers = playerIds.map((id: string) => playerMap.get(id)).filter(Boolean);
              setPlayers(orderedPlayers);
            }
          } catch (e) {
            console.error('Error parsing players:', e);
          }
        }
      }
      
      // Load all available players for add player modal
      const allPlayersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        [Query.limit(500)]
      );
      setAllPlayers(allPlayersResponse.documents as unknown as Player[]);
      
    } catch (error) {
      console.error('Error loading data:', error);
      router.push(`/league/${leagueId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeamName = async () => {
    if (!team || !canEdit || teamName === team.name) {
      setIsEditingName(false);
      return;
    }
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        team.$id,
        { teamName: teamName, name: teamName }
      );
      setTeam({ ...team, name: teamName, teamName: teamName });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating team name:', error);
    }
  };

  const handleSaveLineup = async () => {
    if (!team || !canEdit) return;
    
    try {
      const playerIds = players.map(p => p.$id);
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        team.$id,
        { players: JSON.stringify(playerIds) }
      );
      showGuardMessage('Lineup saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving lineup:', error);
      showGuardMessage('Failed to save lineup', 'error');
    }
  };

  const handleAddPlayer = (player: Player) => {
    if (players.find(p => p.$id === player.$id)) {
      showGuardMessage('Player already on roster', 'error');
      return;
    }
    
    const totalSlots = rosterConfig.reduce((sum, config) => sum + config.count, 0) + benchSize;
    if (players.length >= totalSlots) {
      showGuardMessage('Roster is full', 'error');
      return;
    }
    
    setPlayers([...players, { ...player, isStarter: false }]);
    setShowAddPlayer(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.$id !== playerId));
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    if (!canEdit) return;
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: string, targetPosition: string) => {
    e.preventDefault();
    if (!draggedPlayer || !canEdit) return;
    
    // Validate move
    const config = rosterConfig.find(c => c.position === targetPosition);
    if (targetSlot.startsWith('starter') && config) {
      if (!config.eligiblePositions.includes(draggedPlayer.position)) {
        showGuardMessage(`${draggedPlayer.position} cannot play ${targetPosition}`, 'error');
        setDraggedPlayer(null);
        setDragOverSlot(null);
        return;
      }
    }
    
    // Perform move
    movePlayerToSlot(draggedPlayer.$id, targetSlot, targetPosition);
    setDraggedPlayer(null);
    setDragOverSlot(null);
  };

  const movePlayerToSlot = (playerId: string, targetSlot: string, targetPosition: string) => {
    const playerIndex = players.findIndex(p => p.$id === playerId);
    if (playerIndex === -1) return;
    
    const updatedPlayers = [...players];
    const player = updatedPlayers[playerIndex];
    
    // Clear any existing player in target slot
    if (targetSlot.startsWith('starter')) {
      updatedPlayers.forEach(p => {
        if (p.slotPosition === targetSlot) {
          p.isStarter = false;
          p.slotPosition = undefined;
        }
      });
    }
    
    // Move player to new slot
    if (targetSlot.startsWith('starter')) {
      player.isStarter = true;
      player.slotPosition = targetSlot;
    } else {
      player.isStarter = false;
      player.slotPosition = undefined;
    }
    
    setPlayers(updatedPlayers);
    setMoveMode(false);
    setSelectedPlayerId(null);
  };

  const handleMoveClick = (targetSlot: string, targetPosition: string) => {
    if (!selectedPlayerId || !canEdit) return;
    
    const player = players.find(p => p.$id === selectedPlayerId);
    if (!player) return;
    
    // Validate move
    const config = rosterConfig.find(c => c.position === targetPosition);
    if (targetSlot.startsWith('starter') && config) {
      if (!config.eligiblePositions.includes(player.position)) {
        showGuardMessage(`${player.position} cannot play ${targetPosition}`, 'error');
        return;
      }
    }
    
    movePlayerToSlot(selectedPlayerId, targetSlot, targetPosition);
  };

  const showGuardMessage = (message: string, type: 'error' | 'success' = 'error') => {
    setGuardMessage(message);
    setTimeout(() => setGuardMessage(''), 3000);
  };

  const getStarters = () => {
    const starters: { [key: string]: (Player | null)[] } = {};
    
    rosterConfig.forEach(config => {
      starters[config.position] = [];
      for (let i = 0; i < config.count; i++) {
        const slotId = `starter-${config.position}-${i}`;
        const player = players.find(p => p.slotPosition === slotId);
        starters[config.position].push(player || null);
      }
    });
    
    return starters;
  };

  const getBenchPlayers = () => {
    return players.filter(p => !p.isStarter);
  };

  const filteredAvailablePlayers = allPlayers
    .filter(p => !players.find(rp => rp.$id === p.$id))
    .filter(p => {
      if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.team.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      <div className="aurora-bg" />
      
      {/* Header */}
      <div className="surface-card border-b border-white/10 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/league/${leagueId}`}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-white" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  {isEditingName && canEdit ? (
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      onBlur={handleSaveTeamName}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTeamName()}
                      className="text-2xl font-bold bg-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      autoFocus
                    />
                  ) : (
                    <h1
                      className={`text-2xl font-bold text-white ${canEdit ? 'cursor-pointer hover:text-white/80' : ''}`}
                      onClick={() => canEdit && setIsEditingName(true)}
                    >
                      {teamName}
                    </h1>
                  )}
                  {viewingOtherTeam && (
                    <span className="text-sm px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                      Commissioner View
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/60">{league?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {canEdit && (
                <>
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Waivers / Add Player
                  </button>
                  <button
                    onClick={handleSaveLineup}
                    className="px-4 py-2 rounded-lg btn-primary flex items-center gap-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Save Lineup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guard Message */}
      {guardMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            guardMessage.includes('cannot') || guardMessage.includes('Failed') || guardMessage.includes('full')
              ? 'bg-red-500/90' : 'bg-green-500/90'
          } text-white font-medium`}>
            {guardMessage}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative">
        <div className="space-y-6">
          {/* Starters */}
          <div className="surface-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Starting Lineup</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">POS</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">PLAYER</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">TEAM</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white/60">OPP</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white/60">STATUS</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white/60">OPRK</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white/60">%ST</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white/60">%ROST</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-white/60">+/-</th>
                    {canEdit && <th className="text-center py-3 px-4 text-sm font-medium text-white/60">ACTION</th>}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(getStarters()).map(([position, positionPlayers]) =>
                    positionPlayers.map((player, index) => {
                      const slotId = `starter-${position}-${index}`;
                      const isEmpty = !player;
                      const isDragOver = dragOverSlot === slotId;
                      
                      return (
                        <tr
                          key={slotId}
                          className={`border-b border-white/5 transition-colors ${
                            isDragOver ? 'bg-white/10' : 'hover:bg-white/5'
                          } ${moveMode && selectedPlayerId ? 'cursor-pointer' : ''}`}
                          onDragOver={(e) => handleDragOver(e, slotId)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, slotId, position)}
                          onClick={() => moveMode && handleMoveClick(slotId, position)}
                        >
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/10 text-white">
                              {position}
                            </span>
                          </td>
                          {isEmpty ? (
                            <>
                              <td colSpan={canEdit ? 9 : 8} className="py-3 px-4 text-white/40 italic">
                                Empty Slot
                              </td>
                            </>
                          ) : (
                            <>
                              <td
                                className="py-3 px-4 font-medium text-white"
                                draggable={canEdit}
                                onDragStart={(e) => handleDragStart(e, player)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    player.position === 'QB' ? 'bg-red-500/20 text-red-400' :
                                    player.position === 'RB' ? 'bg-blue-500/20 text-blue-400' :
                                    player.position === 'WR' ? 'bg-green-500/20 text-green-400' :
                                    player.position === 'TE' ? 'bg-yellow-500/20 text-yellow-400' :
                                    player.position === 'K' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {player.position}
                                  </span>
                                  {player.name}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-white/60">{player.team}</td>
                              <td className="py-3 px-4 text-center text-white/60">-</td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                                  ACTIVE
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-white/60">-</td>
                              <td className="py-3 px-4 text-center text-white/60">-</td>
                              <td className="py-3 px-4 text-center text-white/60">-</td>
                              <td className="py-3 px-4 text-center text-white/60">-</td>
                              {canEdit && (
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => {
                                      setMoveMode(true);
                                      setSelectedPlayerId(player.$id);
                                    }}
                                    className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                                  >
                                    MOVE
                                  </button>
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bench */}
          <div className="surface-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Bench ({getBenchPlayers().length}/{benchSize})</h2>
            <div className="space-y-2">
              {Array.from({ length: benchSize }).map((_, index) => {
                const benchPlayer = getBenchPlayers()[index];
                const slotId = `bench-${index}`;
                const isDragOver = dragOverSlot === slotId;
                
                return (
                  <div
                    key={slotId}
                    className={`p-4 rounded-lg border transition-all ${
                      isDragOver ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                    } ${moveMode && selectedPlayerId ? 'cursor-pointer hover:bg-white/10' : ''}`}
                    onDragOver={(e) => handleDragOver(e, slotId)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, slotId, 'BENCH')}
                    onClick={() => moveMode && handleMoveClick(slotId, 'BENCH')}
                  >
                    {benchPlayer ? (
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-3"
                          draggable={canEdit}
                          onDragStart={(e) => handleDragStart(e, benchPlayer)}
                        >
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            benchPlayer.position === 'QB' ? 'bg-red-500/20 text-red-400' :
                            benchPlayer.position === 'RB' ? 'bg-blue-500/20 text-blue-400' :
                            benchPlayer.position === 'WR' ? 'bg-green-500/20 text-green-400' :
                            benchPlayer.position === 'TE' ? 'bg-yellow-500/20 text-yellow-400' :
                            benchPlayer.position === 'K' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {benchPlayer.position}
                          </span>
                          <span className="font-medium text-white">{benchPlayer.name}</span>
                          <span className="text-sm text-white/60">{benchPlayer.team}</span>
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setMoveMode(true);
                                setSelectedPlayerId(benchPlayer.$id);
                              }}
                              className="text-xs px-3 py-1.5 rounded bg-[var(--color-secondary)] hover:opacity-80 text-white transition-opacity"
                            >
                              Move to Lineup
                            </button>
                            <button
                              onClick={() => handleRemovePlayer(benchPlayer.$id)}
                              className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/40 italic">Empty Bench Slot</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add Player</h2>
                <button
                  onClick={() => setShowAddPlayer(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="mt-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="ALL">All Positions</option>
                  <option value="QB">QB</option>
                  <option value="RB">RB</option>
                  <option value="WR">WR</option>
                  <option value="TE">TE</option>
                  <option value="K">K</option>
                  <option value="DEF">DEF</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[var(--color-surface)]">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-6 text-sm font-medium text-white/60">PLAYER</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-white/60">TEAM</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-white/60">YEAR</th>
                    <th className="text-center py-3 px-6 text-sm font-medium text-white/60">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvailablePlayers.map((player) => (
                    <tr key={player.$id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            player.position === 'QB' ? 'bg-red-500/20 text-red-400' :
                            player.position === 'RB' ? 'bg-blue-500/20 text-blue-400' :
                            player.position === 'WR' ? 'bg-green-500/20 text-green-400' :
                            player.position === 'TE' ? 'bg-yellow-500/20 text-yellow-400' :
                            player.position === 'K' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {player.position}
                          </span>
                          <span className="font-medium text-white">{player.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-white/60">{player.team}</td>
                      <td className="py-3 px-6 text-white/60">{player.year || '-'}</td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleAddPlayer(player)}
                          className="text-sm px-3 py-1 rounded bg-[var(--color-primary)] hover:opacity-80 text-white transition-opacity"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Move Mode Indicator */}
      {moveMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <ArrowUpDownIcon className="h-5 w-5" />
            <span className="font-medium">Select destination slot</span>
            <button
              onClick={() => {
                setMoveMode(false);
                setSelectedPlayerId(null);
              }}
              className="ml-2 px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
