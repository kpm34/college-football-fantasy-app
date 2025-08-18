"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import Link from "next/link";
import { FiSettings, FiUsers, FiCalendar, FiTrendingUp, FiClipboard, FiAward, FiShare2, FiActivity } from "react-icons/fi";
import { leagueColors } from "@/lib/theme/colors";
import { useAuth } from "@/hooks/useAuth";
import { useLeagueMembersRealtime } from "@/hooks/useLeagueMembersRealtime";
import { useLeagueRealtime } from "@/hooks/useLeagueRealtime";
import { isUserCommissioner, debugCommissionerMatch } from "@/lib/utils/commissioner";
import { InviteModal } from "@/components/league/InviteModal";

interface League {
  $id: string;
  name: string;
  commissioner: string; // User ID of commissioner
  commissionerName?: string; // Commissioner display name
  season: number;
  scoringType: string;
  maxTeams: number;
  teams?: number;
  draftDate: string;
  status: string;
  inviteCode: string;
  gameMode?: string;
  selectedConference?: string;
  isPrivate?: boolean;
  password?: string;
  draftType?: string;
  scoringRules?: string;
  pickTimeSeconds?: number;
  orderMode?: string;
  draftOrder?: string;
  members?: string[];
}

interface Team {
  $id: string;
  leagueId: string;
  userId: string;
  name: string;
  userName?: string;
  email?: string;
  wins: number;
  losses: number;
  // Some environments store only aggregate points
  points?: number;
  // Optional legacy fields
  ties?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  players?: string;
}

interface LeagueHomePageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default function LeagueHomePage({ params }: LeagueHomePageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'standings' | 'schedule' | 'settings' | 'draft'>('overview');
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // State for commissioner settings
  const [scoringSettings, setScoringSettings] = useState({
    passingTD: 4,
    passingYard: 0.04,
    interception: -2,
    rushingTD: 6,
    rushingYard: 0.1,
    receivingTD: 6,
    receivingYard: 0.1,
    reception: 1,
    fumble: -2
  });

  const [draftSettings, setDraftSettings] = useState({
    type: 'snake',
    pickTimeSeconds: 90,
    date: '',
    time: '',
    orderMode: 'random'
  });

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      console.log('League ID resolved:', resolvedParams.leagueId);
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Hook: live members
  const membersRealtime = useLeagueMembersRealtime(leagueId);
  
  // Hook: live league updates and deletion
  const leagueRealtime = useLeagueRealtime(leagueId, league);

  // Load league data when leagueId resolves or user becomes available
  useEffect(() => {
    if (!leagueId || authLoading) return;
    loadLeagueData();
    // server truth override
    (async () => {
      try {
        const res = await fetch(`/api/leagues/is-commissioner/${leagueId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.isCommissioner === 'boolean') setIsCommissioner(data.isCommissioner);
        }
      } catch {}
    })();
  }, [leagueId, user?.$id, authLoading]);

  // Re-evaluate commissioner status once both league and user are present
  useEffect(() => {
    if (!league || !user) return;
    console.log('Commissioner check data:', {
      league_commissioner: league.commissioner,
      league_commissionerId: league.commissionerId,
      league_commissionerEmail: league.commissionerEmail,
      user_id: user.$id,
      user_email: user.email,
      user_name: user.name
    });
    debugCommissionerMatch(league, user);
    const result = isUserCommissioner(league, user);
    console.log('Is commissioner result:', result);
    setIsCommissioner(result);
  }, [league, user?.$id, (user as any)?.email, (user as any)?.name]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      // Load league via server API (handles documentSecurity and membership)
      let mapped: League | null = null;
      const res = await fetch(`/api/leagues/${leagueId}`, {
        cache: 'no-store',
        headers: user?.$id ? { 'x-user-id': user.$id } as any : undefined
      });
      if (!res.ok) {
        setLeague(null);
      } else {
        const data = await res.json();
        const l = data.league;
        
        // Get commissioner name if we have commissioner ID
        let commissionerName = 'Unknown Commissioner';
        if (l.commissioner) {
          try {
            const nameRes = await fetch(`/api/users/${l.commissioner}/name`, { cache: 'no-store' });
            if (nameRes.ok) {
              const nameData = await nameRes.json();
              commissionerName = nameData.name;
            }
          } catch (error) {
            console.error('Failed to fetch commissioner name:', error);
          }
        }
        
        mapped = {
          $id: l.id,
          name: l.name,
          commissioner: l.commissioner, // Always use the primary field
          commissionerName,
          season: l.seasonStartWeek ? new Date().getFullYear() : (l.season || new Date().getFullYear()),
          scoringType: 'PPR',
          maxTeams: l.maxTeams || 12,
          teams: l.members?.length || 0,
          draftDate: l.draftDate || '',
          status: l.status || 'ACTIVE',
          inviteCode: '',
          gameMode: l.mode,
          selectedConference: l.conf || undefined,
          draftType: (l as any).draftType,
          pickTimeSeconds: (l as any).pickTimeSeconds,
          orderMode: (l as any).orderMode,
          members: l.members || []
        };
        setLeague(mapped);
      }
      
      // Check if current user is commissioner (match by id, email, or name)
      if (mapped && user && (typeof window !== 'undefined')) {
        debugCommissionerMatch(mapped as any, user as any);
        if (isUserCommissioner(mapped as any, user as any)) {
          setIsCommissioner(true);
        }
      }

      // Parse scoring rules if they exist
      if ((league as any)?.scoringRules) {
        try {
          const rules = JSON.parse((league as any).scoringRules);
          setScoringSettings(prev => ({ ...prev, ...rules }));
        } catch (e) {
          console.log('Error parsing scoring rules');
        }
      }

      // Set draft settings
      if (mapped) {
        setDraftSettings({
          type: (mapped as any).draftType || 'snake',
          pickTimeSeconds: (mapped as any).pickTimeSeconds || 90,
          date: mapped.draftDate ? new Date(mapped.draftDate).toISOString().split('T')[0] : '',
          time: mapped.draftDate ? new Date(mapped.draftDate).toTimeString().slice(0, 5) : '',
          orderMode: (mapped as any).orderMode || 'random'
        });
      }

      // Initial roster list handled by realtime hook; derive userTeam only when available



    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adopt realtime teams whenever hook emits
  useEffect(() => {
    if (membersRealtime && Array.isArray(membersRealtime.teams)) {
      console.log('Realtime members update:', membersRealtime.teams.length, 'teams');
      setTeams(membersRealtime.teams as unknown as Team[]);
    }
  }, [membersRealtime.teams]);

  // Handle league real-time updates
  useEffect(() => {
    if (leagueRealtime.league && leagueRealtime.league !== league) {
      console.log('League updated via realtime:', leagueRealtime.league);
      setLeague(leagueRealtime.league);
    }
  }, [leagueRealtime.league]);

  // Handle league deletion
  useEffect(() => {
    if (leagueRealtime.deleted) {
      console.log('League deleted via realtime');
      // Show message and redirect after delay
      setTimeout(() => {
        router.push('/dashboard?deleted=true');
      }, 3000);
    }
  }, [leagueRealtime.deleted, router]);

  // When teams update, if we have a user, derive the user's team locally
  useEffect(() => {
    if (!user || teams.length === 0) return;
    console.log('Finding user team:', {
      userId: user.$id,
      userEmail: user.email,
      userName: user.name,
      teams: teams.map(t => ({ 
        teamId: t.$id, 
        userId: t.userId, 
        email: t.email, 
        userName: t.userName,
        owner: (t as any).owner 
      }))
    });
    // Check multiple fields for user match
    const mine = teams.find(t => 
      t.userId === user.$id || 
      t.userId === user.email ||
      t.email === user.email ||
      t.userName === user.name ||
      (t as any).owner === user.$id // legacy field
    ) || null;
    if (mine) {
      console.log('Found user team:', mine.name);
    } else {
      console.log('No user team found');
    }
    setUserTeam(mine as any);
  }, [teams, user?.$id, user?.email, user?.name]);

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">League Members ({teams.length})</h3>
        {membersRealtime.connected && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        {membersRealtime.loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading members...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No members have joined yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6">Team</th>
                <th className="text-left py-4 px-6">Manager</th>
                <th className="text-center py-4 px-6">Record</th>
                <th className="text-center py-4 px-6">Points</th>
                <th className="text-center py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
              <tr key={team.$id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-semibold">{team.name}</span>
                  {team.userId === league?.commissioner && (
                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Commissioner</span>
                  )}
                </td>
                <td className="py-4 px-6">{team.userName || 'Unknown'}</td>
                <td className="py-4 px-6 text-center">
                  {team.wins}-{team.losses}
                </td>
                <td className="py-4 px-6 text-center">{(team.points ?? team.pointsFor ?? 0).toFixed(1)}</td>
                <td className="py-4 px-6 text-center">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderStandingsTab = () => {
    const sortedTeams = [...teams].sort((a, b) => {
      const aTies = a.ties ?? 0;
      const bTies = b.ties ?? 0;
      const aWinPct = (a.wins + aTies * 0.5) / (a.wins + a.losses + aTies || 1);
      const bWinPct = (b.wins + bTies * 0.5) / (b.wins + b.losses + bTies || 1);
      if (aWinPct !== bWinPct) return bWinPct - aWinPct;
      const aPts = a.points ?? a.pointsFor ?? 0;
      const bPts = b.points ?? b.pointsFor ?? 0;
      return bPts - aPts;
    });

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-6">Standings</h3>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6">Rank</th>
                <th className="text-left py-4 px-6">Team</th>
                <th className="text-center py-4 px-6">W-L-T</th>
                <th className="text-center py-4 px-6">PF</th>
                <th className="text-center py-4 px-6">PA</th>
                <th className="text-center py-4 px-6">Win %</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const ties = team.ties ?? 0;
                const winPct = ((team.wins + ties * 0.5) / (team.wins + team.losses + ties || 1) * 100).toFixed(1);
                return (
                  <tr key={team.$id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold">{index + 1}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold">{team.name}</span>
                      {team.userId === user?.$id && (
                        <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">You</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {team.wins}-{team.losses}
                    </td>
                    <td className="py-4 px-6 text-center">{(team.points ?? team.pointsFor ?? 0).toFixed(1)}</td>
                    <td className="py-4 px-6 text-center">{(team.pointsAgainst ?? 0).toFixed(1)}</td>
                    <td className="py-4 px-6 text-center">{winPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">Schedule</h3>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <p className="text-gray-400">Schedule will be generated after the draft is completed.</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => {
    const updateScoringSettings = async (key: string, value: number) => {
      if (!isCommissioner || !league) return;

      const newSettings = { ...scoringSettings, [key]: value };
      setScoringSettings(newSettings);
      setSavingSettings(true);

      try {
        const response = await fetch(`/api/leagues/${league.$id}/update-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scoringRules: JSON.stringify(newSettings) })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        console.log('Scoring settings saved successfully');
        
      } catch (error: any) {
        console.error('Error saving scoring settings:', error);
        alert(`Failed to save scoring settings: ${error.message || 'Unknown error'}`);
        
        // Revert the UI state on error
        const originalValue = (league as any).scoringRules ? 
          JSON.parse((league as any).scoringRules)[key] || 0 : 0;
        setScoringSettings(prev => ({ ...prev, [key]: originalValue }));
      } finally {
        setSavingSettings(false);
      }
    };

    const updateDraftSettings = async (key: string, value: string | number) => {
      if (!isCommissioner || !league) return;

      const newSettings = { ...draftSettings, [key]: value };
      setDraftSettings(newSettings);
      setSavingSettings(true);

      try {
        const updates: Record<string, any> = {};
        
        if (key === 'type') updates.draftType = value;
        if (key === 'pickTimeSeconds') updates.pickTimeSeconds = value;
        if (key === 'orderMode') updates.orderMode = value;
        if (key === 'date' || key === 'time') {
          const date = key === 'date' ? value : draftSettings.date;
          const time = key === 'time' ? value : draftSettings.time;
          if (date && time) {
            updates.draftDate = new Date(`${date}T${time}`).toISOString();
          }
        }

        const response = await fetch(`/api/leagues/${league.$id}/update-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Settings saved successfully:', result);
        
      } catch (error: any) {
        console.error('Error saving draft settings:', error);
        alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
        
        // Revert the UI state on error
        const originalValue = key === 'type' ? (league as any).draftType || 'snake' :
                             key === 'pickTimeSeconds' ? (league as any).pickTimeSeconds || 90 :
                             key === 'orderMode' ? (league as any).orderMode || 'random' :
                             key === 'date' ? (league.draftDate ? new Date(league.draftDate).toISOString().split('T')[0] : '') :
                             key === 'time' ? (league.draftDate ? new Date(league.draftDate).toTimeString().slice(0, 5) : '') : value;
        
        setDraftSettings(prev => ({ ...prev, [key]: originalValue }));
      } finally {
        setSavingSettings(false);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-6">League Settings</h3>

        {/* Scoring Settings */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
          <h4 className="text-xl font-bold mb-4 text-gray-800">Scoring Settings</h4>
          {savingSettings && (
            <p className="text-sm text-green-400 mb-2">Saving changes...</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scoringSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm capitalize font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {isCommissioner ? (
                  <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => updateScoringSettings(key, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 bg-white border-2 border-blue-300 rounded text-gray-800 text-center font-medium focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-gray-700">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Draft Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-xl font-bold mb-4">Draft Settings</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Draft Type</label>
              {isCommissioner ? (
                <select
                  value={draftSettings.type}
                  onChange={(e) => updateDraftSettings('type', e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded"
                >
                  <option value="snake">Snake</option>
                  <option value="auction">Auction</option>
                </select>
              ) : (
                <span className="font-semibold capitalize">{draftSettings.type}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Pick Time (seconds)</label>
              {isCommissioner ? (
                <input
                  type="number"
                  value={draftSettings.pickTimeSeconds}
                  onChange={(e) => updateDraftSettings('pickTimeSeconds', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-right"
                />
              ) : (
                <span className="font-semibold">{draftSettings.pickTimeSeconds}s</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Draft Date</label>
              {isCommissioner ? (
                <input
                  type="date"
                  value={draftSettings.date}
                  onChange={(e) => updateDraftSettings('date', e.target.value)}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded"
                />
              ) : (
                <span className="font-semibold">
                  {draftSettings.date ? new Date(draftSettings.date).toLocaleDateString() : 'Not set'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Draft Time</label>
              {isCommissioner ? (
                <input
                  type="time"
                  value={draftSettings.time}
                  onChange={(e) => updateDraftSettings('time', e.target.value)}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded"
                />
              ) : (
                <span className="font-semibold">{draftSettings.time || 'Not set'}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Draft Order</label>
              {isCommissioner ? (
                <select
                  value={draftSettings.orderMode}
                  onChange={(e) => updateDraftSettings('orderMode', e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded"
                >
                  <option value="random">Random</option>
                  <option value="manual">Manual</option>
                  <option value="lastYear">Last Year's Standings</option>
                </select>
              ) : (
                <span className="font-semibold capitalize">{draftSettings.orderMode}</span>
              )}
            </div>
          </div>
        </div>

        {/* Commissioner Tools */}
        {isCommissioner && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h4 className="text-xl font-bold mb-4">Commissioner Tools</h4>
            
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Pause/Resume League
              </button>
              <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Reset Draft
              </button>
              <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Edit Team Rosters
              </button>
              <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Process Waivers
              </button>
              <button className="w-full text-left px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
                Delete League
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDraftTab = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">Draft</h3>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="text-center space-y-4">
          <FiAward className="text-6xl mx-auto text-yellow-400" />
          <h4 className="text-xl font-bold">Draft Not Started</h4>
          <p className="text-gray-400">
            {league?.draftDate 
              ? `Draft scheduled for ${new Date(league.draftDate).toLocaleDateString()}`
              : 'Draft date not set'}
          </p>
          
          {isCommissioner && (
            <div className="space-y-2 mt-6">
              <button
                onClick={() => router.push(`/draft/${leagueId}/realtime`)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
              >
                Start Draft
              </button>
              <p className="text-sm text-gray-400">Make sure all teams have joined before starting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Show league deleted message
  if (leagueRealtime.deleted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">League Deleted</h1>
            <p className="text-gray-300 mb-4">
              This league has been deleted and is no longer available.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to dashboard in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: leagueColors.primary.highlight }}></div>
            <p className="text-lg" style={{ color: leagueColors.text.primary }}>Loading league...</p>
            {/* Real-time connection status */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${membersRealtime.connected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-400">
                {membersRealtime.connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: leagueColors.text.primary }}>League Not Found</h1>
            <Link href="/dashboard" className="hover:underline" style={{ color: leagueColors.primary.highlight }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
      {/* Header */}
      <div style={{ backgroundColor: leagueColors.background.secondary, borderBottom: `1px solid ${leagueColors.border.medium}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: leagueColors.text.primary }}>{league.name}</h1>
              <p className="mt-1" style={{ color: leagueColors.text.muted }}>
                {league.gameMode} • {league.selectedConference || 'All Conferences'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {userTeam ? (
                <button
                  onClick={() => router.push(`/league/${leagueId}/locker-room`)}
                  className="px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#4A90E2', color: '#FFFFFF', fontWeight: '600' }}
                >
                  <FiUsers />
                  My Locker Room
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: '#4A90E2', color: '#FFFFFF', fontWeight: '600' }}
                >
                  <FiUsers />
                  Join League First
                </button>
              )}
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
              >
                <FiShare2 />
                Invite
              </button>
              
              {isCommissioner && (
                <button
                  onClick={() => router.push(`/league/${leagueId}/commissioner`)}
                  className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
                >
                  <FiSettings />
                  Commissioner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-sm" style={{ backgroundColor: leagueColors.interactive.hover, borderBottom: `1px solid ${leagueColors.border.medium}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'members', 'standings', 'schedule', 'draft', ...(isCommissioner ? ['settings'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors`}
                style={{
                  borderColor: activeTab === tab ? leagueColors.primary.crimson : 'transparent',
                  color: activeTab === tab ? leagueColors.text.primary : leagueColors.text.secondary
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* League Info */}
            <div className="backdrop-blur-sm rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
              <h3 className="text-xl font-bold mb-4">League Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>Commissioner</p>
                  <p className="font-semibold">
                    {league?.commissionerName || 'Loading...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>Season</p>
                  <p className="font-semibold">{league?.season}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>Scoring Type</p>
                  <p className="font-semibold">{league?.scoringType || 'PPR'}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>Teams</p>
                  <p className="font-semibold">{membersRealtime.loading ? '...' : (membersRealtime.count || teams.length || 0)} / {league?.maxTeams || 12}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>Draft Date</p>
                  <p className="font-semibold">
                    {league?.draftDate ? new Date(league.draftDate).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>Status</p>
                  <p className="font-semibold capitalize">{league?.status || 'Pre-Draft'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {/* Launch Draft Button - Only show to commissioners when draft date is set */}
              {isCommissioner && league?.draftDate && (
                <button
                  onClick={() => router.push(`/draft/${leagueId}/realtime`)}
                  className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg animate-pulse"
                  style={{ backgroundColor: '#22C55E', color: '#FFFFFF' }}
                >
                  <FiAward className="text-xl" />
                  <span className="font-semibold">Launch Draft</span>
                </button>
              )}

              <button
                onClick={() => router.push(`/league/${leagueId}/standings`)}
                className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                style={{ backgroundColor: leagueColors.primary.sand, color: leagueColors.text.inverse }}
              >
                <FiTrendingUp className="text-xl" />
                <span className="font-semibold">View Standings</span>
              </button>
              
              <button
                onClick={() => router.push(`/league/${leagueId}/scoreboard`)}
                className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#E94B3C', color: '#FFFFFF' }}
              >
                <FiActivity className="text-xl" />
                <span className="font-semibold">Scoreboard</span>
              </button>
              
              <button
                onClick={() => router.push(`/league/${leagueId}/schedule`)}
                className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                style={{ backgroundColor: leagueColors.primary.mint, color: leagueColors.text.primary }}
              >
                <FiCalendar className="text-xl" />
                <span className="font-semibold">Schedule</span>
              </button>
              
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'standings' && renderStandingsTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'draft' && renderDraftTab()}
      </div>
      
      {/* Invite Modal */}
      {showInviteModal && league && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          leagueId={league.$id}
          leagueName={league.name}
        />
      )}
    </div>
  );
}
