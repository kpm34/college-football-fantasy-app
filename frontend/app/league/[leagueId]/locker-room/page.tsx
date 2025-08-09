'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

interface LockerRoomPageProps {
  params: Promise<{ leagueId: string }>;
}

interface Player {
  $id: string;
  name: string;
  position: string;
  team: string;
  conference: string;
  jersey: string;
  height: string;
  weight: string;
  year: string;
  fantasy_points: number;
  projection: number;
  rushing_projection: number;
  receiving_projection: number;
  td_projection: number;
  int_projection: number;
  field_goals_projection: number;
  extra_points_projection: number;
}

interface Roster {
  $id: string;
  league_id: string;
  user_id: string;
  starters: string[]; // Player IDs
  bench: string[]; // Player IDs
  ir: string[]; // Player IDs
  created_at: string;
  updated_at: string;
}

interface League {
  $id: string;
  name: string;
  roster_settings: Record<string, number>;
  scoring_settings: Record<string, number>;
  status: string;
}

export default function LockerRoomPage({ params }: LockerRoomPageProps) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<League | null>(null);
  const [roster, setRoster] = useState<Roster | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'add-drop' | 'projections'>('roster');

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Load data
  useEffect(() => {
    if (leagueId) {
      loadLockerRoomData();
    }
  }, [leagueId]);

  const loadLockerRoomData = async () => {
    try {
      setLoading(true);
      
      // Load league
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      setLeague(leagueResponse as unknown as League);

      // Load user's roster (for now, get first roster in league)
      const rostersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('league_id', leagueId)]
      );
      
      if (rostersResponse.documents.length > 0) {
        const userRoster = rostersResponse.documents[0] as unknown as Roster;
        setRoster(userRoster);
        
        // Load all players for this roster
        await loadRosterPlayers(userRoster);
      }

    } catch (error) {
      console.error('Error loading locker room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRosterPlayers = async (userRoster: Roster) => {
    try {
      // Get all players in the roster (starters + bench + IR)
      const allPlayerIds = [
        ...userRoster.starters,
        ...userRoster.bench,
        ...userRoster.ir
      ];

      if (allPlayerIds.length === 0) {
        setAllPlayers([]);
        return;
      }

      // Load player details
      const players: Player[] = [];
      for (const playerId of allPlayerIds) {
        try {
          const playerResponse = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.COLLEGE_PLAYERS,
            playerId
          );
          players.push(playerResponse as unknown as Player);
        } catch (error) {
          console.error(`Error loading player ${playerId}:`, error);
        }
      }

      setAllPlayers(players);
    } catch (error) {
      console.error('Error loading roster players:', error);
    }
  };

  const getPlayerById = (playerId: string): Player | undefined => {
    return allPlayers.find(player => player.$id === playerId);
  };

  const movePlayer = async (playerId: string, fromSlot: 'starters' | 'bench' | 'ir', toSlot: 'starters' | 'bench' | 'ir') => {
    if (!roster || fromSlot === toSlot) return;

    try {
      setSaving(true);

      const updatedRoster = { ...roster };
      
      // Remove from source slot
      updatedRoster[fromSlot] = updatedRoster[fromSlot].filter(id => id !== playerId);
      
      // Add to destination slot
      updatedRoster[toSlot] = [...updatedRoster[toSlot], playerId];

      // Update in Appwrite
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        roster.$id,
        {
          starters: updatedRoster.starters,
          bench: updatedRoster.bench,
          ir: updatedRoster.ir,
          updated_at: new Date().toISOString()
        }
      );

      setRoster(updatedRoster);
    } catch (error) {
      console.error('Error moving player:', error);
    } finally {
      setSaving(false);
    }
  };

  const canMoveToStarters = (playerId: string): boolean => {
    if (!roster || !league) return false;
    
    const player = getPlayerById(playerId);
    if (!player) return false;

    const position = player.position;
    const currentStarters = roster.starters.length;
    const maxStarters = Object.values(league.roster_settings).reduce((sum, count) => sum + count, 0) - league.roster_settings.BN;

    // Check if we have room for this position
    const positionCount = roster.starters.filter(id => {
      const starter = getPlayerById(id);
      return starter?.position === position;
    }).length;

    const maxForPosition = league.roster_settings[position] || 0;
    
    return currentStarters < maxStarters && positionCount < maxForPosition;
  };

  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'QB': return 'bg-blue-500';
      case 'RB': return 'bg-green-500';
      case 'WR': return 'bg-purple-500';
      case 'TE': return 'bg-orange-500';
      case 'K': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading your locker room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!league || !roster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Roster Found</h1>
            <p className="text-slate-300 mb-4">You don't have a roster in this league yet.</p>
            <button
              onClick={() => router.push(`/league/${leagueId}`)}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Back to League
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-locker-slateDark via-locker-slate to-black text-white">
      {/* Header */}
      <div className="bg-locker-primary/20 backdrop-blur-sm border-b border-locker-primary/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-bebas tracking-wide">🏈 My Locker Room</h1>
              <p className="text-locker-ice/80">{league.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/league/${leagueId}`)}
                className="bg-locker-slate hover:bg-locker-slateDark px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Back to League
              </button>
              {saving && (
                <div className="flex items-center text-locker-ice">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-locker-ice mr-2"></div>
                  Saving...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-locker-slate/60 rounded-lg p-1">
          {[
            { id: 'roster', label: 'My Roster', icon: '👥' },
            { id: 'add-drop', label: 'Add/Drop', icon: '➕' },
            { id: 'projections', label: 'Projections', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-locker-primary text-white shadow'
                  : 'text-locker-ice/80 hover:text-white hover:bg-locker-slateDark'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'roster' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Starters */}
            <div className="lg:col-span-2">
              <div className="bg-locker-slate/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  🏆 Starting Lineup
                  <span className="ml-2 text-sm text-slate-400">
                    ({roster.starters.length}/{Object.values(league.roster_settings).reduce((sum, count) => sum + count, 0) - league.roster_settings.BN})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(league.roster_settings).map(([position, count]) => {
                    if (position === 'BN') return null;
                    
                    const positionPlayers = roster.starters
                      .map(id => getPlayerById(id))
                      .filter(player => player?.position === position)
                      .slice(0, count);

                    return (
                      <div key={position} className="bg-locker-slate/70 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPositionColor(position)}`}></span>
                          {position} ({positionPlayers.length}/{count})
                        </h3>
                        <div className="space-y-2">
                          {positionPlayers.map((player, index) => (
                            <div key={player.$id} className="bg-locker-slate rounded p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">{player.name}</div>
                                  <div className="text-sm text-slate-400">
                                    {player.team} • {player.position} • #{player.jersey}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold">{player.fantasy_points.toFixed(1)} pts</div>
                                  <div className="text-xs text-slate-400">Proj: {player.projection}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => movePlayer(player.$id, 'starters', 'bench')}
                                className="mt-2 w-full bg-locker-coral hover:bg-locker-primary py-1 px-2 rounded text-xs font-semibold transition-colors text-black"
                              >
                                Move to Bench
                              </button>
                            </div>
                          ))}
                          {positionPlayers.length < count && (
                            <div className="text-slate-400 text-sm italic">
                              {count - positionPlayers.length} spot(s) empty
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bench */}
            <div>
              <div className="bg-locker-slate/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold mb-4">🪑 Bench ({roster.bench.length})</h2>
                <div className="space-y-3">
                  {roster.bench.map(playerId => {
                    const player = getPlayerById(playerId);
                    if (!player) return null;

                    return (
                      <div key={playerId} className="bg-locker-slate/70 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-sm text-slate-400">
                              {player.team} • {player.position}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{player.fantasy_points.toFixed(1)} pts</div>
                          </div>
                        </div>
                          {canMoveToStarters(playerId) && (
                          <button
                            onClick={() => movePlayer(playerId, 'bench', 'starters')}
                              className="w-full bg-locker-primary hover:bg-locker-primaryDark py-1 px-2 rounded text-xs font-semibold transition-colors"
                          >
                            Move to Starters
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {roster.bench.length === 0 && (
                    <div className="text-slate-400 text-sm italic text-center py-4">
                      No players on bench
                    </div>
                  )}
                </div>
              </div>

              {/* IR */}
              {roster.ir.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-6 mt-6">
                  <h2 className="text-xl font-bold mb-4">🏥 Injured Reserve ({roster.ir.length})</h2>
                  <div className="space-y-3">
                    {roster.ir.map(playerId => {
                      const player = getPlayerById(playerId);
                      if (!player) return null;

                      return (
                        <div key={playerId} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-slate-400">
                            {player.team} • {player.position}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add-drop' && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">➕ Add/Drop Players</h2>
            <p className="text-slate-300 mb-6">
              Add/Drop functionality will be implemented here. Users will be able to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Browse available players by position</li>
              <li>Add players to their roster</li>
              <li>Drop players from their roster</li>
              <li>Use waiver priority or FAAB budget</li>
              <li>View transaction history</li>
            </ul>
          </div>
        )}

        {activeTab === 'projections' && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📊 Weekly Projections</h2>
            <p className="text-slate-300 mb-6">
              Projections functionality will be implemented here. Users will be able to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>View weekly projections for their players</li>
              <li>Compare projections across positions</li>
              <li>See matchup-based projections</li>
              <li>Track projection accuracy</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 