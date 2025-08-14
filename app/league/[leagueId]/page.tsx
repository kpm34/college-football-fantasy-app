"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";
import { FiSettings, FiUsers, FiCalendar, FiTrendingUp, FiClipboard, FiAward } from "react-icons/fi";
import { leagueColors } from "@/lib/theme/colors";
import { useAuth } from "@/hooks/useAuth";
import { isUserCommissioner, debugCommissionerMatch } from "@/lib/utils/commissioner";

interface League {
  $id: string;
  name: string;
  commissioner: string;
  commissionerId: string;
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
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

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
    debugCommissionerMatch(league, user);
    setIsCommissioner(isUserCommissioner(league, user));
  }, [league, user?.$id, (user as any)?.email, (user as any)?.name]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      
      // Load league from Appwrite
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      const leagueData = leagueResponse as unknown as League;
      setLeague(leagueData);
      
      // Check if current user is commissioner (match by id, email, or name)
      if (user) {
        debugCommissionerMatch(leagueData, user);
        if (isUserCommissioner(leagueData, user)) {
          setIsCommissioner(true);
        }
      }

      // Parse scoring rules if they exist
      if (leagueData.scoringRules) {
        try {
          const rules = JSON.parse(leagueData.scoringRules);
          setScoringSettings(prev => ({ ...prev, ...rules }));
        } catch (e) {
          console.log('Error parsing scoring rules');
        }
      }

      // Set draft settings
      setDraftSettings({
        type: leagueData.draftType || 'snake',
        pickTimeSeconds: leagueData.pickTimeSeconds || 90,
        date: leagueData.draftDate ? new Date(leagueData.draftDate).toISOString().split('T')[0] : '',
        time: leagueData.draftDate ? new Date(leagueData.draftDate).toTimeString().slice(0, 5) : '',
        orderMode: leagueData.orderMode || 'random'
      });

      // Load all teams in this league (TEAMS + fallback to legacy fields + ROSTERS)
      try {
        let leagueTeams: Team[] = [];
        try {
          const teamsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TEAMS,
            [Query.equal('leagueId', leagueId)]
          );
          leagueTeams = teamsResponse.documents as unknown as Team[];
        } catch (primaryErr) {
          // Continue with legacy fallback if primary attribute not present
          console.warn('Primary teams query failed, trying legacy league_id', primaryErr);
        }

        // Normalize missing userId from owner if present
        leagueTeams = (leagueTeams as any[]).map((t) => ({
          ...t,
          userId: t.userId || t.owner || '',
          name: t.name || t.teamName || 'Team',
        }));

        // Also check legacy field naming: league_id and owner
        // Legacy TEAMS field fallback
        try {
          const altTeamsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TEAMS,
            [Query.equal('league_id', leagueId)]
          );
          const altDocs = altTeamsResponse.documents as any[];
          const existingUserIds2 = new Set(leagueTeams.map(t => t.userId).filter(Boolean));
          const adaptedAltTeams: Team[] = altDocs.map((d) => ({
            $id: d.$id,
            leagueId: d.leagueId || d.league_id,
            userId: d.userId || d.owner || '',
            name: d.name || d.teamName || 'Team',
            userName: d.userName,
            email: d.email,
            wins: d.wins ?? 0,
            losses: d.losses ?? 0,
            ties: d.ties ?? 0,
            points: d.points ?? d.pointsFor ?? 0,
            pointsFor: d.pointsFor ?? d.points ?? 0,
            pointsAgainst: d.pointsAgainst ?? 0,
            players: d.players
          })).filter((t) => t.userId && !existingUserIds2.has(t.userId));
          if (adaptedAltTeams.length > 0) {
            leagueTeams = [...leagueTeams, ...adaptedAltTeams];
          }
        } catch (e) {
          // ignore if legacy field not present
        }

        // Fallback: also read legacy ROSTERS and merge any teams not already present
        try {
          const rostersResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [Query.equal('leagueId', leagueId)]
          );
          const rosterDocs = rostersResponse.documents as any[];
          const existingUserIds = new Set(leagueTeams.map(t => t.userId).filter(Boolean));
          const adaptedFromRosters: Team[] = rosterDocs.map((r) => ({
            $id: r.$id,
            leagueId: r.leagueId,
            userId: r.userId || r.owner || '',
            name: r.teamName || r.name || 'Team',
            userName: r.userName,
            email: r.email,
            wins: r.wins ?? 0,
            losses: r.losses ?? 0,
            ties: r.ties ?? 0,
            points: r.points ?? r.pointsFor ?? 0,
            pointsFor: r.pointsFor ?? r.points ?? 0,
            pointsAgainst: r.pointsAgainst ?? 0,
            players: r.players
          })).filter((t) => !existingUserIds.has(t.userId));

          if (adaptedFromRosters.length > 0) {
            leagueTeams = [...leagueTeams, ...adaptedFromRosters];
          }
        } catch (e) {
          // ignore if rosters collection not present
        }

        setTeams(leagueTeams);

        // Find user's team
        const currentUserId = user?.$id;
        if (currentUserId && leagueTeams.length > 0) {
          const myTeam = leagueTeams.find(team => team.userId === currentUserId);
          if (myTeam) {
            setUserTeam(myTeam);
          }
        }
      } catch (e) {
        console.log('Error loading teams:', e);
        // Create empty teams array if rosters don't exist yet
        setTeams([]);
      }

    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">League Members</h3>
        {isCommissioner && (
          <button
            onClick={() => router.push(`/league/${leagueId}/invite`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Invite Members
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
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
                  {team.userId === league?.commissionerId && (
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
                const winPct = ((team.wins + team.ties * 0.5) / (team.wins + team.losses + team.ties || 1) * 100).toFixed(1);
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
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          league.$id,
          { scoringRules: JSON.stringify(newSettings) }
        );
      } catch (error) {
        console.error('Error saving scoring settings:', error);
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

        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          league.$id,
          updates
        );
      } catch (error) {
        console.error('Error saving draft settings:', error);
      } finally {
        setSavingSettings(false);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-6">League Settings</h3>

        {/* Scoring Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-xl font-bold mb-4">Scoring Settings</h4>
          {savingSettings && (
            <p className="text-sm text-green-400 mb-2">Saving changes...</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scoringSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {isCommissioner ? (
                  <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => updateScoringSettings(key, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-right"
                  />
                ) : (
                  <span className="font-semibold">{value}</span>
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
                onClick={() => router.push(`/draft/${leagueId}`)}
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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: leagueColors.primary.highlight }}></div>
            <p className="text-lg" style={{ color: leagueColors.text.primary }}>Loading league...</p>
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
              {userTeam && (
                <button
                  onClick={() => router.push(`/league/${leagueId}/locker-room`)}
                  className="px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  style={{ backgroundColor: leagueColors.primary.brown, color: leagueColors.text.inverse }}
                >
                  <FiClipboard />
                  Locker Room
                </button>
              )}
              
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
                  borderColor: activeTab === tab ? leagueColors.primary.coral : 'transparent',
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
                  <p className="font-semibold">{league?.commissioner}</p>
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
                  <p className="font-semibold">{(teams.length || (league?.teams || 0))} / {league?.maxTeams || 12}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push(`/league/${leagueId}/locker-room`)}
                className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                style={{ backgroundColor: leagueColors.primary.coral, color: leagueColors.text.inverse }}
              >
                <FiClipboard className="text-xl" />
                <span className="font-semibold">Locker Room</span>
              </button>
              
              <button
                onClick={() => setActiveTab('standings')}
                className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                style={{ backgroundColor: leagueColors.primary.brown, color: leagueColors.text.inverse }}
              >
                <FiTrendingUp className="text-xl" />
                <span className="font-semibold">View Standings</span>
              </button>
              
              <button
                onClick={() => setActiveTab('schedule')}
                className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                style={{ backgroundColor: leagueColors.primary.taupe, color: leagueColors.text.primary }}
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
    </div>
  );
}
