"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Player {
  $id: string;
  name: string;
  position: string;
  team: string;
  team_abbreviation: string;
  jersey: string;
  projection: number;
  fantasy_points: number;
}

interface Team {
  $id: string;
  leagueId: string;
  userId: string;
  teamName: string;
  players?: string;
}

interface LineupSlot {
  position: string;
  player: Player | null;
}

const ROSTER_POSITIONS = [
  { position: 'QB', count: 1 },
  { position: 'RB', count: 2 },
  { position: 'WR', count: 2 },
  { position: 'TE', count: 1 },
  { position: 'FLEX', count: 1 },
  { position: 'K', count: 1 },
  { position: 'DEF', count: 1 }
];

interface LockerRoomPageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default function LockerRoomPage({ params }: LockerRoomPageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leagueId, setLeagueId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [lineup, setLineup] = useState<LineupSlot[]>([]);
  const [bench, setBench] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Load team data
  useEffect(() => {
    if (leagueId && !authLoading && user) {
      loadTeamData();
    } else if (leagueId && !authLoading && !user) {
      router.push('/login');
    }
  }, [leagueId, authLoading, user, router]);

  const loadTeamData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load user's team in this league
      const teamsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('leagueId', leagueId), Query.equal('userId', user.$id)]
      );
      
      if (teamsResponse.documents.length === 0) {
        // No team found - redirect to league page
        router.push(`/league/${leagueId}`);
        return;
      }
      
      const userTeam = teamsResponse.documents[0] as unknown as Team;
      setTeam(userTeam);
      
      // Parse lineup if exists
      if (userTeam.players) {
        const playersData = JSON.parse(userTeam.players);
        // Initialize lineup slots
        const lineupSlots: LineupSlot[] = [];
        ROSTER_POSITIONS.forEach(({ position, count }) => {
          for (let i = 0; i < count; i++) {
            lineupSlots.push({ position, player: null });
          }
        });
        setLineup(lineupSlots);
        
        // TODO: Load actual player data
      } else {
        // Initialize empty lineup
        const lineupSlots: LineupSlot[] = [];
        ROSTER_POSITIONS.forEach(({ position, count }) => {
          for (let i = 0; i < count; i++) {
            lineupSlots.push({ position, player: null });
          }
        });
        setLineup(lineupSlots);
      }

      // Load available players
      await loadAvailablePlayers();
      
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePlayers = async () => {
    try {
      const playersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COLLEGE_PLAYERS,
        [Query.equal('draftable', true), Query.limit(100)]
      );
      setAvailablePlayers(playersResponse.documents as unknown as Player[]);
    } catch (error) {
      console.error('Error loading available players:', error);
    }
  };

  const saveLineup = async () => {
    if (!team) return;
    
    setSaving(true);
    try {
      const lineupData = {
        starters: lineup.map(slot => ({
          position: slot.position,
          playerId: slot.player?.$id || null
        })),
        bench: bench.map(player => player.$id)
      };

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        team.$id,
        { players: JSON.stringify(lineupData) }
      );
    } catch (error) {
      console.error('Error saving lineup:', error);
    } finally {
      setSaving(false);
    }
  };

  const addPlayerToRoster = (player: Player) => {
    // Find first empty slot for player's position
    const updatedLineup = [...lineup];
    let added = false;

    for (let i = 0; i < updatedLineup.length; i++) {
      const slot = updatedLineup[i];
      if (!slot.player && 
          (slot.position === player.position || 
           (slot.position === 'FLEX' && ['RB', 'WR', 'TE'].includes(player.position)))) {
        updatedLineup[i] = { ...slot, player };
        added = true;
        break;
      }
    }

    if (!added) {
      // Add to bench if no starter slot available
      setBench([...bench, player]);
    } else {
      setLineup(updatedLineup);
    }

    // Remove from available players
    setAvailablePlayers(availablePlayers.filter(p => p.$id !== player.$id));
    setShowAddPlayer(false);
    
    // Auto-save
    saveLineup();
  };

  const removePlayer = (slotIndex: number) => {
    const updatedLineup = [...lineup];
    const player = updatedLineup[slotIndex].player;
    
    if (player) {
      updatedLineup[slotIndex] = { ...updatedLineup[slotIndex], player: null };
      setLineup(updatedLineup);
      setAvailablePlayers([...availablePlayers, player]);
      
      // Auto-save
      saveLineup();
    }
  };

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3a3a3a] text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading locker room...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3a3a3a] text-white">
      {/* Header */}
      <div className="bg-[#2a2a2a] border-b border-[#4a4a4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/league/${leagueId}`}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to League
              </Link>
              <h1 className="text-2xl font-bold">{team?.teamName || 'My Team'}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {saving && (
                <span className="text-sm text-green-400">Saving...</span>
              )}
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-[#5a5a5a] hover:bg-[#6a6a6a] text-white px-4 py-2 rounded transition-colors"
              >
                + Add Player
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-[#2a2a2a] border-b border-[#4a4a4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3">
            <span className="text-sm font-semibold">Set Lineup:</span>
            <select
              value={activeWeek}
              onChange={(e) => setActiveWeek(parseInt(e.target.value))}
              className="bg-[#3a3a3a] border border-[#4a4a4a] rounded px-3 py-1 text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400">
              Trade & Acquisition Limits: Unlimited
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Starters */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
              STARTERS
              <span className="text-sm font-normal text-gray-400">NFL WEEK {activeWeek}</span>
            </h2>
            
            <div className="bg-[#2a2a2a] rounded-lg border border-[#4a4a4a] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a1a1a] text-xs">
                    <th className="text-left py-2 px-3">SLOT</th>
                    <th className="text-left py-2 px-3">PLAYER</th>
                    <th className="text-center py-2 px-3">ACTION</th>
                    <th className="text-center py-2 px-3">OPP</th>
                    <th className="text-center py-2 px-3">PROJ</th>
                    <th className="text-center py-2 px-3">SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {lineup.map((slot, index) => (
                    <tr key={index} className="border-t border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors">
                      <td className="py-3 px-3 text-sm font-semibold">{slot.position}</td>
                      <td className="py-3 px-3">
                        {slot.player ? (
                          <div>
                            <div className="font-semibold">{slot.player.name}</div>
                            <div className="text-xs text-gray-400">
                              {slot.player.team_abbreviation} - {slot.player.position}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Empty</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {slot.player && (
                          <button
                            onClick={() => removePlayer(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-sm">--</td>
                      <td className="py-3 px-3 text-center text-sm">
                        {slot.player ? slot.player.projection.toFixed(1) : '--'}
                      </td>
                      <td className="py-3 px-3 text-center text-sm">--</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bench */}
          <div>
            <h2 className="text-lg font-bold mb-4">BENCH</h2>
            
            <div className="bg-[#2a2a2a] rounded-lg border border-[#4a4a4a] overflow-hidden">
              {bench.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No players on bench
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1a1a1a] text-xs">
                      <th className="text-left py-2 px-3">PLAYER</th>
                      <th className="text-center py-2 px-3">PROJ</th>
                      <th className="text-center py-2 px-3">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bench.map((player, index) => (
                      <tr key={player.$id} className="border-t border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-xs text-gray-400">
                              {player.team_abbreviation} - {player.position}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          {player.projection.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Move to Lineup
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-[#4a4a4a]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Add Player</h3>
                <button
                  onClick={() => setShowAddPlayer(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-[#3a3a3a] border border-[#4a4a4a] rounded px-3 py-2"
                />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="bg-[#3a3a3a] border border-[#4a4a4a] rounded px-3 py-2"
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
                <thead className="sticky top-0 bg-[#1a1a1a]">
                  <tr className="text-xs">
                    <th className="text-left py-2 px-4">PLAYER</th>
                    <th className="text-center py-2 px-4">POS</th>
                    <th className="text-center py-2 px-4">TEAM</th>
                    <th className="text-center py-2 px-4">PROJ</th>
                    <th className="text-center py-2 px-4">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.$id} className="border-t border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors">
                      <td className="py-3 px-4 font-semibold">{player.name}</td>
                      <td className="py-3 px-4 text-center">{player.position}</td>
                      <td className="py-3 px-4 text-center">{player.team_abbreviation}</td>
                      <td className="py-3 px-4 text-center">{player.projection.toFixed(1)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => addPlayerToRoster(player)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
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
    </div>
  );
}