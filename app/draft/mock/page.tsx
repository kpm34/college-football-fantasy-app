"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { leagueColors } from '@/lib/theme/colors';

type DraftType = 'snake' | 'auction';
type Position = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
type Conference = 'ALL' | 'SEC' | 'Big Ten' | 'Big 12' | 'ACC';

interface MockDraftSettings {
  draftType: DraftType;
  numTeams: number;
  pickTimeSeconds: number;
  scoringType: 'PPR' | 'HALF_PPR' | 'STANDARD';
  rosterSize: number;
  userPosition: number;
}

interface Player {
  id: string;
  name: string;
  position: Position;
  team: string;
  conference: Conference;
  class: string;
  height: string;
  weight: number;
  projectedPoints: number;
  adp: number; // Average Draft Position
  pastStats?: {
    games: number;
    passingYards?: number;
    passingTDs?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receivingYards?: number;
    receptions?: number;
    receivingTDs?: number;
  };
  eaRating?: number; // EA Sports rating if available
}

export default function MockDraftPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [draftStarted, setDraftStarted] = useState(false);
  
  // Draft settings
  const [settings, setSettings] = useState<MockDraftSettings>({
    draftType: 'snake',
    numTeams: 12,
    pickTimeSeconds: 90,
    scoringType: 'PPR',
    rosterSize: 16,
    userPosition: 1
  });

  // Draft state
  const [currentPick, setCurrentPick] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(settings.pickTimeSeconds);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [draftedPlayers, setDraftedPlayers] = useState<Set<string>>(new Set());
  const [myRoster, setMyRoster] = useState<Player[]>([]);
  const [allPicks, setAllPicks] = useState<{[pick: number]: {player: Player, team: number}}>({}); 

  // Player filters
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<Position>("ALL");
  const [conferenceFilter, setConferenceFilter] = useState<Conference>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<'PROJ'|'TEAM'|'NAME'|'ADP'>('PROJ');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  // Player data
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadPlayers();
    }
  }, [user, authLoading, router]);

  const loadPlayers = async () => {
    try {
      // Load players from our dedicated draft endpoint
      const response = await fetch('/api/draft/players?limit=1000');
      const data = await response.json();
      
      if (data.success && data.players && data.players.length > 0) {
        // Transform to our Player format
        const transformedPlayers: Player[] = data.players.map((player: any) => ({
          id: player.id,
          name: player.name,
          position: player.position as Position,
          team: player.team,
          conference: player.conference as Conference,
          class: player.year,
          height: player.height,
          weight: typeof player.weight === 'string' ? parseInt(player.weight) : player.weight,
          projectedPoints: player.projectedPoints,
          adp: player.adp,
          pastStats: player.projectedStats || {
            games: 12,
            passingYards: player.projectedStats?.passingYards,
            passingTDs: player.projectedStats?.passingTDs,
            rushingYards: player.projectedStats?.rushingYards,
            rushingTDs: player.projectedStats?.rushingTDs,
            receivingYards: player.projectedStats?.receivingYards,
            receptions: player.projectedStats?.receptions,
            receivingTDs: player.projectedStats?.receivingTDs,
          },
          eaRating: player.rating
        }));
        
        setPlayers(transformedPlayers);
        setFilteredPlayers(transformedPlayers);
        
        console.log(`Loaded ${transformedPlayers.length} players from Appwrite`);
      } else {
        // Fallback to mock data if no players found
        console.log('No players found in Appwrite, using mock data');
        loadMockPlayers();
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading players from Appwrite:", error);
      loadMockPlayers();
      setLoading(false);
    }
  };

  const loadPlayersByConference = async () => {
    try {
      const conferences = [
        { endpoint: '/api/sec', name: 'SEC' },
        { endpoint: '/api/bigten', name: 'Big Ten' },
        { endpoint: '/api/big12', name: 'Big 12' },
        { endpoint: '/api/acc', name: 'ACC' }
      ];
      
      const allPlayers: Player[] = [];
      
      for (const conf of conferences) {
        try {
          const response = await fetch(conf.endpoint);
          const data = await response.json();
          
          if (data.players) {
            const confPlayers = data.players.map((player: any, index: number) => ({
              id: player.$id || player.id || `${conf.name}-player-${index}`,
              name: player.name,
              position: player.position as Position,
              team: player.team,
              conference: conf.name as Conference,
              class: player.year || 'JR',
              height: player.height || '6-0',
              weight: parseInt(player.weight) || 200,
              projectedPoints: player.projectedPoints || (player.rating ? player.rating * 3 : 150),
              adp: allPlayers.length + index + 1,
              pastStats: {
                games: 12,
                passingYards: player.passing_yards,
                passingTDs: player.passing_tds,
                rushingYards: player.rushing_yards,
                rushingTDs: player.rushing_tds,
                receivingYards: player.receiving_yards,
                receptions: player.receptions,
                receivingTDs: player.receiving_tds,
              },
              eaRating: player.rating || 80
            }));
            
            allPlayers.push(...confPlayers);
          }
        } catch (error) {
          console.error(`Error loading ${conf.name} players:`, error);
        }
      }
      
      if (allPlayers.length > 0) {
        // Sort by projected points
        allPlayers.sort((a, b) => b.projectedPoints - a.projectedPoints);
        setPlayers(allPlayers);
        setFilteredPlayers(allPlayers);
      } else {
        loadMockPlayers();
      }
    } catch (error) {
      console.error("Error loading conference players:", error);
      loadMockPlayers();
    }
  };
  
  const loadMockPlayers = () => {
    const mockPlayers: Player[] = [
      {
        id: "1",
        name: "Quinn Ewers",
        position: "QB",
        team: "Texas",
        conference: "SEC",
        class: "JR",
        height: "6-2",
        weight: 210,
        projectedPoints: 285.5,
        adp: 15.2,
        pastStats: {
          games: 12,
          passingYards: 3479,
          passingTDs: 31,
          rushingYards: 128,
          rushingTDs: 3
        },
        eaRating: 92
      },
      {
        id: "2", 
        name: "Ollie Gordon II",
        position: "RB",
        team: "Oklahoma State",
        conference: "Big 12",
        class: "JR",
        height: "6-1",
        weight: 225,
        projectedPoints: 245.8,
        adp: 8.5,
        pastStats: {
          games: 14,
          rushingYards: 1732,
          rushingTDs: 21,
          receptions: 40,
          receivingYards: 330,
          receivingTDs: 1
        },
        eaRating: 94
      },
    ];
    
    setPlayers(mockPlayers);
    setFilteredPlayers(mockPlayers);
  };
  
  const getConferenceForTeam = (team: string): Conference => {
    const conferenceMap: Record<string, Conference> = {
      // SEC
      'Alabama': 'SEC', 'Arkansas': 'SEC', 'Auburn': 'SEC', 'Florida': 'SEC',
      'Georgia': 'SEC', 'Kentucky': 'SEC', 'LSU': 'SEC', 'Mississippi State': 'SEC',
      'Missouri': 'SEC', 'Oklahoma': 'SEC', 'Ole Miss': 'SEC', 'South Carolina': 'SEC',
      'Tennessee': 'SEC', 'Texas': 'SEC', 'Texas A&M': 'SEC', 'Vanderbilt': 'SEC',
      // Big Ten
      'Illinois': 'Big Ten', 'Indiana': 'Big Ten', 'Iowa': 'Big Ten', 'Maryland': 'Big Ten',
      'Michigan': 'Big Ten', 'Michigan State': 'Big Ten', 'Minnesota': 'Big Ten', 'Nebraska': 'Big Ten',
      'Northwestern': 'Big Ten', 'Ohio State': 'Big Ten', 'Oregon': 'Big Ten', 'Penn State': 'Big Ten',
      'Purdue': 'Big Ten', 'Rutgers': 'Big Ten', 'UCLA': 'Big Ten', 'USC': 'Big Ten',
      'Washington': 'Big Ten', 'Wisconsin': 'Big Ten',
      // Big 12
      'Arizona': 'Big 12', 'Arizona State': 'Big 12', 'Baylor': 'Big 12', 'BYU': 'Big 12',
      'Cincinnati': 'Big 12', 'Colorado': 'Big 12', 'Houston': 'Big 12', 'Iowa State': 'Big 12',
      'Kansas': 'Big 12', 'Kansas State': 'Big 12', 'Oklahoma State': 'Big 12', 'TCU': 'Big 12',
      'Texas Tech': 'Big 12', 'UCF': 'Big 12', 'Utah': 'Big 12', 'West Virginia': 'Big 12',
      // ACC
      'Boston College': 'ACC', 'California': 'ACC', 'Clemson': 'ACC', 'Duke': 'ACC',
      'Florida State': 'ACC', 'Georgia Tech': 'ACC', 'Louisville': 'ACC', 'Miami': 'ACC',
      'NC State': 'ACC', 'North Carolina': 'ACC', 'Pittsburgh': 'ACC', 'SMU': 'ACC',
      'Stanford': 'ACC', 'Syracuse': 'ACC', 'Virginia': 'ACC', 'Virginia Tech': 'ACC',
      'Wake Forest': 'ACC'
    };
    
    return conferenceMap[team] || 'ALL';
  };

  const startDraft = () => {
    setShowSettings(false);
    setDraftStarted(true);
    initializeDraftOrder();
  };

  const initializeDraftOrder = () => {
    const teams = Array.from({length: settings.numTeams}, (_, i) => `Team ${i + 1}`);
    teams[settings.userPosition - 1] = "Your Team";
    setDraftOrder(teams);
  };

  const getCurrentTeam = () => {
    const round = Math.floor((currentPick - 1) / settings.numTeams) + 1;
    const pickInRound = ((currentPick - 1) % settings.numTeams) + 1;
    
    if (settings.draftType === 'snake' && round % 2 === 0) {
      return settings.numTeams - pickInRound + 1;
    }
    return pickInRound;
  };

  const draftPlayer = (player: Player) => {
    if (draftedPlayers.has(player.id)) return;
    
    const teamIndex = getCurrentTeam() - 1;
    const isMyPick = teamIndex === settings.userPosition - 1;
    
    setDraftedPlayers(prev => new Set([...prev, player.id]));
    setAllPicks(prev => ({
      ...prev,
      [currentPick]: { player, team: teamIndex }
    }));
    
    if (isMyPick) {
      setMyRoster(prev => [...prev, player]);
    }
    
    setCurrentPick(prev => prev + 1);
    setTimeRemaining(settings.pickTimeSeconds);
  };

  // Filter players based on search and filters
  useEffect(() => {
    let filtered = players;
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (positionFilter !== "ALL") {
      filtered = filtered.filter(p => p.position === positionFilter);
    }
    
    if (conferenceFilter !== "ALL") {
      filtered = filtered.filter(p => p.conference === conferenceFilter);
    }
    
    if (teamFilter !== 'ALL') {
      filtered = filtered.filter(p => p.team === teamFilter);
    }
    
    if (showOnlyAvailable) {
      filtered = filtered.filter(p => !draftedPlayers.has(p.id));
    }
    
    // Sorting
    switch (sortBy) {
      case 'TEAM':
        filtered.sort((a, b) => a.team.localeCompare(b.team) || b.projectedPoints - a.projectedPoints);
        break;
      case 'NAME':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'ADP':
        filtered.sort((a, b) => (a.adp ?? 9999) - (b.adp ?? 9999));
        break;
      case 'PROJ':
      default:
        filtered.sort((a, b) => b.projectedPoints - a.projectedPoints);
        break;
    }
    
    setFilteredPlayers(filtered);
  }, [players, searchQuery, positionFilter, conferenceFilter, teamFilter, sortBy, showOnlyAvailable, draftedPlayers]);

  // Timer countdown
  useEffect(() => {
    if (!draftStarted || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [draftStarted, timeRemaining]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0E13] via-[#1c1117] to-[#0B0E13] flex items-center justify-center">
        <div className="text-white">Loading draft room...</div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: leagueColors.text.primary }}>Mock Draft Setup</h1>
          
          <div className="rounded-xl p-8" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Draft Type */}
              <div>
                <label className="block mb-2" style={{ color: leagueColors.text.primary }}>Draft Type</label>
                <select
                  value={settings.draftType}
                  onChange={(e) => setSettings({...settings, draftType: e.target.value as DraftType})}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="snake">Snake Draft</option>
                  <option value="auction">Auction Draft</option>
                </select>
              </div>

              {/* Number of Teams */}
              <div>
                <label className="block mb-2" style={{ color: leagueColors.text.primary }}>Number of Teams</label>
                <select
                  value={settings.numTeams}
                  onChange={(e) => setSettings({...settings, numTeams: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  {[8, 10, 12, 14, 16].map(n => (
                    <option key={n} value={n}>{n} Teams</option>
                  ))}
                </select>
              </div>

              {/* Pick Time */}
              <div>
                <label className="block mb-2" style={{ color: leagueColors.text.primary }}>Seconds Per Pick</label>
                <select
                  value={settings.pickTimeSeconds}
                  onChange={(e) => setSettings({...settings, pickTimeSeconds: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="90">90 seconds</option>
                  <option value="120">120 seconds</option>
                  <option value="0">No Timer</option>
                </select>
              </div>

              {/* Scoring Type */}
              <div>
                <label className="block mb-2" style={{ color: leagueColors.text.primary }}>Scoring Type</label>
                <select
                  value={settings.scoringType}
                  onChange={(e) => setSettings({...settings, scoringType: e.target.value as any})}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="PPR">PPR</option>
                  <option value="HALF_PPR">Half PPR</option>
                  <option value="STANDARD">Standard</option>
                </select>
              </div>

              {/* Draft Position */}
              <div className="md:col-span-2">
                <label className="block mb-2" style={{ color: leagueColors.text.primary }}>Your Draft Position</label>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({length: settings.numTeams}, (_, i) => i + 1).map(pos => (
                    <button
                      key={pos}
                      onClick={() => setSettings({...settings, userPosition: pos})}
                      className={`py-2 rounded-lg transition-colors ${
                        settings.userPosition === pos
                          ? 'text-white'
                          : ''
                      }`}
                      style={{ backgroundColor: settings.userPosition === pos ? leagueColors.primary.crimson : leagueColors.background.overlay, color: settings.userPosition === pos ? leagueColors.text.inverse : leagueColors.text.secondary, border: `1px solid ${leagueColors.border.light}` }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={startDraft}
                className="flex-1 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundImage: `linear-gradient(90deg, ${leagueColors.primary.coral}, ${leagueColors.primary.crimson})`, color: '#FFFFFF', border: `2px solid ${leagueColors.border.light}` }}
              >
                Start Mock Draft
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: leagueColors.background.overlay, color: leagueColors.text.primary, border: `1px solid ${leagueColors.border.light}` }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Draft UI
  return (
    <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: leagueColors.background.secondary, borderColor: leagueColors.border.medium }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold" style={{ color: leagueColors.text.primary }}>Mock Draft</h1>
              <div className="flex items-center gap-2" style={{ color: leagueColors.text.secondary }}>
                <UserGroupIcon className="w-5 h-5" />
                <span>{settings.numTeams} Teams</span>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg`} style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}`, color: timeRemaining < 10 ? '#B41F24' : leagueColors.text.primary }}>
                <ClockIcon className="w-5 h-5" />
                <span className="font-mono">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
              </div>
              
              <div>
                Pick {currentPick} - {draftOrder[getCurrentTeam() - 1]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Pool */}
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
              {/* Filters */}
              <div className="p-4" style={{ borderBottom: `1px solid ${leagueColors.border.light}` }}>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: leagueColors.text.muted }} />
                      <input
                        type="text"
                        placeholder="Search players..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg"
                        style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                      />
                    </div>
                    <button
                      onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                      className={`px-4 py-2 rounded-lg transition-colors`}
                      style={{ backgroundColor: showOnlyAvailable ? leagueColors.primary.taupe : leagueColors.background.overlay, color: leagueColors.text.primary, border: `1px solid ${leagueColors.border.light}` }}
                    >
                      Available Only
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value as Position)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    >
                      <option value="ALL">All Positions</option>
                      <option value="QB">QB</option>
                      <option value="RB">RB</option>
                      <option value="WR">WR</option>
                      <option value="TE">TE</option>
                      <option value="K">K</option>
                      <option value="DEF">DEF</option>
                    </select>
                    
                    <select
                      value={conferenceFilter}
                      onChange={(e) => setConferenceFilter(e.target.value as Conference)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    >
                      <option value="ALL">All Conferences</option>
                      <option value="SEC">SEC</option>
                      <option value="Big Ten">Big Ten</option>
                      <option value="Big 12">Big 12</option>
                      <option value="ACC">ACC</option>
                    </select>

                    <select
                      value={teamFilter}
                      onChange={(e) => setTeamFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    >
                      <option value="ALL">All Teams</option>
                      {Array.from(new Set(players.map(p => p.team))).sort((a, b) => a.localeCompare(b)).map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    >
                      <option value="PROJ">Sort: Proj</option>
                      <option value="TEAM">Sort: Team A–Z</option>
                      <option value="NAME">Sort: Name A–Z</option>
                      <option value="ADP">Sort: ADP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Player List */}
              <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full">
                  <thead className="sticky top-0" style={{ backgroundColor: leagueColors.background.secondary }}>
                    <tr className="text-xs" style={{ color: leagueColors.text.secondary }}>
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Player</th>
                      <th className="text-center py-3 px-4">Pos</th>
                      <th className="text-left py-3 px-4">Team</th>
                      <th className="text-center py-3 px-4">Proj</th>
                      <th className="text-center py-3 px-4">ADP</th>
                      <th className="text-center py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, index) => {
                      const isDrafted = draftedPlayers.has(player.id);
                      const isMyPick = getCurrentTeam() - 1 === settings.userPosition - 1;
                      
                      return (
                        <tr 
                          key={player.id}
                          className={`border-b`} style={{ borderColor: leagueColors.border.light, backgroundColor: isDrafted ? 'transparent' : 'transparent' }}
                        >
                          <td className="py-3 px-4" style={{ color: leagueColors.text.muted }}>{index + 1}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium" style={{ color: leagueColors.text.primary }}>{player.name}</div>
                              <div className="text-xs" style={{ color: leagueColors.text.secondary }}>{player.class} • {player.height} • {player.weight}lbs</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium`} style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                              {player.position}
                            </span>
                          </td>
                          <td className="py-3 px-4" style={{ color: leagueColors.text.secondary }}>{player.team}</td>
                          <td className="py-3 px-4 text-center" style={{ color: leagueColors.text.primary, fontWeight: 600 }}>{player.projectedPoints}</td>
                          <td className="py-3 px-4 text-center" style={{ color: leagueColors.text.muted }}>{player.adp}</td>
                          <td className="py-3 px-4 text-center">
                            {!isDrafted && isMyPick && (
                              <button
                                onClick={() => draftPlayer(player)}
                                className="px-3 py-1 rounded text-sm transition-colors"
                                style={{ backgroundColor: leagueColors.primary.coral, color: leagueColors.text.inverse }}
                              >
                                Draft
                              </button>
                            )}
                            {isDrafted && (
                              <span className="text-xs" style={{ color: leagueColors.text.muted }}>Drafted</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* My Roster */}
            <div className="rounded-xl p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: leagueColors.text.primary }}>My Roster</h3>
              <div className="space-y-2">
                {myRoster.length === 0 ? (
                  <p className="text-sm" style={{ color: leagueColors.text.muted }}>No players drafted yet</p>
                ) : (
                  myRoster.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${leagueColors.border.light}` }}>
                      <div>
                        <div className="text-sm" style={{ color: leagueColors.text.primary }}>{player.name}</div>
                        <div className="text-xs" style={{ color: leagueColors.text.secondary }}>{player.position} - {player.team}</div>
                      </div>
                      <div className="text-xs" style={{ color: leagueColors.text.muted }}>Pick {Object.entries(allPicks).find(([_, p]) => p.player.id === player.id)?.[0]}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Draft Order */}
            <div className="rounded-xl p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: leagueColors.text.primary }}>Draft Order</h3>
              <div className="space-y-1">
                {draftOrder.map((team, index) => (
                  <div
                    key={index}
                    className={`py-2 px-3 rounded`}
                    style={{ backgroundColor: getCurrentTeam() - 1 === index ? leagueColors.background.overlay : 'transparent', color: getCurrentTeam() - 1 === index ? leagueColors.text.primary : leagueColors.text.secondary, border: `1px solid ${leagueColors.border.light}` }}
                  >
                    {index + 1}. {team}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
