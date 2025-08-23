'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@hooks/useAuth';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  PlusIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { RotowireNews } from '@components/RotowireNews';

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
  searchParams?: Promise<{ fantasy_team_id?: string }>;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<League | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [leagueId, setLeagueId] = useState('');
  const [fantasy_team_idParam, setTeamIdParam] = useState('');
  const [viewingOtherTeam, setViewingOtherTeam] = useState(false);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  
  // Dashboard color palette
  const palette = {
    maroon: '#3A1220',
    orange: '#E89A5C',
    periwinkle: '#8091BB',
    tan: '#D9BBA4',
    gold: '#DAA520',
    bronze: '#B8860B',
  } as const;
  
  // UI state
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [guardMessage, setGuardMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
      setTeamIdParam(resolvedSearchParams?.fantasy_team_id || '');
    };
    resolveParams();
  }, [params, searchParams]);

  useEffect(() => {
    if (!leagueId || authLoading) return;
    
    if (!user) {
      console.log('Locker room: No user found, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('Locker room: Loading data for user:', user.$id);
    loadLeagueAndTeamData();
  }, [leagueId, authLoading, user, fantasy_team_idParam, router]);

  const loadLeagueAndTeamData = async () => {
    try {
      setLoading(true);
      setErrorMessage(''); // Clear any previous errors
      console.log('Locker room: Loading data from API for league:', leagueId);
      
      // Fetch all data from server-side API
      const response = await fetch(`/api/leagues/${leagueId}/locker-room`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load locker room data');
      }

      const data = await response.json();
      console.log('Locker room: API data received:', data);
      
      // Set league data
      setLeague(data.league);
      setIsCommissioner(data.isCommissioner);
      
      // Configure roster based on league settings
      if (data.league.gameMode && data.league.rosterSchema) {
        const config = [...DEFAULT_ROSTER_CONFIG];
        if (data.league.gameMode === 'conference') {
          // Conference mode adjustments
          const rbIndex = config.findIndex(c => c.position === 'RB');
          const wrIndex = config.findIndex(c => c.position === 'WR');
          if (rbIndex >= 0) config[rbIndex].count = Math.min(data.league.rosterSchema.rb || 2, 2);
          if (wrIndex >= 0) config[wrIndex].count = Math.min(data.league.rosterSchema.wr || 2, 5);
        } else {
          // Power 4 mode
          const rbIndex = config.findIndex(c => c.position === 'RB');
          const wrIndex = config.findIndex(c => c.position === 'WR');
          if (rbIndex >= 0) config[rbIndex].count = data.league.rosterSchema.rb || 2;
          if (wrIndex >= 0) config[wrIndex].count = Math.min(data.league.rosterSchema.wr || 2, 6);
        }
        setRosterConfig(config);
        setBenchSize(data.league.rosterSchema.benchSize || 7);
      }
      
      // Set team data
      if (data.team) {
        setTeam(data.team);
        setTeamName(data.team.teamName || data.team.name || 'My Team');
        setCanEdit(true);
        setViewingOtherTeam(false);
        
        // Set players
        if (data.players && data.players.length > 0) {
          setPlayers(data.players);
          console.log('Locker room: Players loaded:', data.players.length);
        }
      } else {
        console.log('Locker room: No team found for user in this league');
        setTeam(null);
        setPlayers([]);
        setTeamName('My Team');
        setCanEdit(true); // Allow them to set up their team
      }
      
      // TODO: Load all players for add player modal separately when needed
      setAllPlayers([]); // For now, set empty - will load when modal opens
      
    } catch (error: any) {
      console.error('Error loading locker room data:', error);
      console.error('Locker room loading error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        response: error?.response,
        fullError: error
      });
      
      // Don't redirect - let's see what the error is
      setLoading(false);
      
      // Set error state to show to user
      if (!team) {
        setTeam(null);
        setPlayers([]);
      }
      
      // Set error message for display
      if (error?.code === 404) {
        setErrorMessage('League not found. Please check the URL.');
      } else if (error?.code === 401) {
        setErrorMessage('You do not have permission to access this league.');
      } else {
        setErrorMessage(`Error loading locker room: ${error?.message || 'Unknown error'}`);
      }
      
      return; // Exit early to prevent redirect
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
      const response = await fetch(`/api/leagues/${leagueId}/update-team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.$id,
          updates: { teamName: teamName, name: teamName }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update team name');
      }
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
      const response = await fetch(`/api/leagues/${leagueId}/update-team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.$id,
          updates: { players: JSON.stringify(playerIds) }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update roster');
      }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${palette.maroon} 0%, ${palette.orange} 35%, ${palette.periwinkle} 65%, ${palette.tan} 100%)` }}>
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }
  
  // Show error state if there's an error message
  if (errorMessage) {
    return (
      <div className="min-h-screen relative" style={{ background: `linear-gradient(135deg, ${palette.maroon} 0%, ${palette.orange} 35%, ${palette.periwinkle} 65%, ${palette.tan} 100%)` }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#F5F5DC]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#3A1220]/20">
              <div className="flex items-center gap-4 mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                <h2 className="text-2xl font-bold text-white">Error Loading Locker Room</h2>
              </div>
              <p className="text-white/80 mb-6">{errorMessage}</p>
              <div className="flex gap-4">
                <Link
                  href={`/league/${leagueId}`}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Back to League Home
                </Link>
                <button
                  onClick={() => {
                    setErrorMessage('');
                    loadLeagueAndTeamData();
                  }}
                  className="px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-[#DAA520] to-[#B8860B] hover:opacity-90"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: `linear-gradient(135deg, ${palette.maroon} 0%, ${palette.orange} 35%, ${palette.periwinkle} 65%, ${palette.tan} 100%)` }}>
      {/* Gradient background effect */}
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 relative">
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
                    className="px-4 py-2 rounded-lg flex items-center gap-2 text-white font-semibold"
                    style={{ background: `linear-gradient(135deg, ${palette.gold} 0%, ${palette.bronze} 100%)` }}
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
          <div className="bg-[#F5F5DC]/10 backdrop-blur-sm rounded-xl p-6 border border-[#3A1220]/20">
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
                                    player.position === 'QB' ? 'bg-red-500/40 text-red-300' :
                                    player.position === 'RB' ? 'bg-blue-500/40 text-blue-300' :
                                    player.position === 'WR' ? 'bg-green-500/40 text-green-300' :
                                    player.position === 'TE' ? 'bg-yellow-500/40 text-yellow-300' :
                                    player.position === 'K' ? 'bg-purple-500/40 text-purple-300' :
                                    'bg-gray-500/40 text-gray-300'
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
          <div className="bg-[#F5F5DC]/10 backdrop-blur-sm rounded-xl p-6 border border-[#3A1220]/20">
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
                            benchPlayer.position === 'QB' ? 'bg-red-500/40 text-red-300' :
                            benchPlayer.position === 'RB' ? 'bg-blue-500/40 text-blue-300' :
                            benchPlayer.position === 'WR' ? 'bg-green-500/40 text-green-300' :
                            benchPlayer.position === 'TE' ? 'bg-yellow-500/40 text-yellow-300' :
                            benchPlayer.position === 'K' ? 'bg-purple-500/40 text-purple-300' :
                            'bg-gray-500/40 text-gray-300'
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
                              className="text-xs px-3 py-1.5 rounded bg-gradient-to-r from-[#DAA520] to-[#B8860B] hover:opacity-80 text-white transition-opacity"
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

          {/* Rotowire News */}
          <div className="bg-[#F5F5DC]/10 backdrop-blur-sm rounded-xl p-6 border border-[#3A1220]/20">
            <RotowireNews 
              team={team?.name} 
              compact={false} 
              maxItems={10} 
            />
          </div>
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden backdrop-blur-lg" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)' }}>
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
                <thead className="sticky top-0" style={{ background: 'rgba(58,18,32,0.95)' }}>
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
                            player.position === 'QB' ? 'bg-red-500/40 text-red-300' :
                            player.position === 'RB' ? 'bg-blue-500/40 text-blue-300' :
                            player.position === 'WR' ? 'bg-green-500/40 text-green-300' :
                            player.position === 'TE' ? 'bg-yellow-500/40 text-yellow-300' :
                            player.position === 'K' ? 'bg-purple-500/40 text-purple-300' :
                            'bg-gray-500/40 text-gray-300'
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
                          className="text-sm px-3 py-1 rounded bg-gradient-to-r from-[#DAA520] to-[#B8860B] hover:opacity-80 text-white transition-opacity"
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
          <div className="text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 bg-gradient-to-r from-[#DAA520] to-[#B8860B]">
            <ArrowsUpDownIcon className="h-5 w-5" />
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
