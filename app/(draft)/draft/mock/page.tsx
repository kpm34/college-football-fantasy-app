"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DraftCore from '@components/draft/DraftCore';
import { DraftPlayer } from '@/types/projections';
import {
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { leagueColors } from '@/lib/theme/colors';
import CFPLoadingScreen from '@components/CFPLoadingScreen';

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
  projections?: {
    season: {
      total: number;
      passing: number;
      rushing: number;
      receiving: number;
      touchdowns: number;
      fieldGoals: number;
      extraPoints: number;
    };
    perGame: {
      points: string;
    };
  };
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
  rating?: number;
}

export default function MockDraftPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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

  // Mock draft states
  const [mockDraftStarted, setMockDraftStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [draftStarted, setDraftStarted] = useState(false);
  const [draftInitializing, setDraftInitializing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftedPlayers, setDraftedPlayers] = useState<Set<string>>(new Set());
  const [myMockPicks, setMyMockPicks] = useState<Player[]>([]);
  const [myRoster, setMyRoster] = useState<Player[]>([]);
  const [allPicks, setAllPicks] = useState<Record<number, { player: Player; team: number }>>({});
  const [currentPick, setCurrentPick] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  
  // Mock draft settings
  const [settings, setSettings] = useState<MockDraftSettings>({
    draftType: 'snake',
    numTeams: 12,
    userPosition: 1,
    pickTimeSeconds: 90,
    scoringType: 'PPR',
    rosterSize: 15
  });

  

  const loadPlayers = async () => {
    try {
      // Load players from our enhanced draft endpoint with top 200 ordering
      const season = new Date().getFullYear();
      const response = await fetch(`/api/draft/players?limit=10000&season=${season}&orderBy=projection`);
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
          projectedPoints: player.projectedPoints || player.fantasy_points || 0, // Use enhanced projections
          adp: player.adp,
          projections: player.projections || {
            season: {
              total: player.projectedPoints || player.fantasy_points || 0,
              passing: 0,
              rushing: 0,
              receiving: 0,
              touchdowns: 0,
              fieldGoals: 0,
              extraPoints: 0,
            },
            perGame: {
              points: player.projectedPoints ? (player.projectedPoints / 12).toFixed(1) : '0.0'
            }
          },
          pastStats: player.prevSeasonStats || {
            games: 12,
            passingYards: player.prevSeasonStats?.passingYards,
            passingTDs: player.prevSeasonStats?.passingTDs || player.projectedStats?.passingTDs,
            rushingYards: player.prevSeasonStats?.rushingYards || player.projectedStats?.rushingYards,
            rushingTDs: player.prevSeasonStats?.rushingTDs || player.projectedStats?.rushingTDs,
            receivingYards: player.prevSeasonStats?.receivingYards || player.projectedStats?.receivingYards,
            receptions: player.prevSeasonStats?.receptions || player.projectedStats?.receptions,
            receivingTDs: player.prevSeasonStats?.receivingTDs || player.projectedStats?.receivingTDs,
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

  const startDraft = async () => {
    setDraftInitializing(true);
    
    // Simulate draft initialization delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowSettings(false);
    setDraftStarted(true);
    setDraftInitializing(false);
    initializeDraftOrder();
  };

  const handleStartMockDraft = async () => {
    try {
      setDraftInitializing(true);
      
      // Create a new mock draft via API
      const response = await fetch('/api/mock-draft/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftName: `Mock Draft ${new Date().toLocaleDateString()}`,
          rounds: settings.rosterSize,
          timerPerPickSec: settings.pickTimeSeconds,
          numTeams: settings.numTeams,
          // Pre-create participants so the user's chosen slot is human
          participants: Array.from({ length: settings.numTeams }, (_, i) => {
            const slot = i + 1;
            if (slot === settings.userPosition) {
              const displayName = (user as any)?.name || (user as any)?.email || 'Guest';
              const userId = (user as any)?.$id || (user as any)?.id || `user-${Date.now()}`;
              return { slot, userType: 'human', displayName, userId };
            }
            return { slot, userType: 'bot', displayName: `Bot Team ${slot}` };
          })
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Failed to create draft (${response.status})`);
      }

      const data = await response.json();

      if (data?.draftId) {
        try {
          const displayName = (user as any)?.name || (user as any)?.email || 'Guest';
          const userId = (user as any)?.$id || (user as any)?.id || `user-${Date.now()}`;
          localStorage.setItem('mockDraftUserName', displayName);
          localStorage.setItem('mockDraftUserId', userId);
        } catch {}
        // Navigate to the new mock draft room
        router.push(`/mock-draft/${data.draftId}`);
      } else {
        throw new Error(data?.error || 'Draft creation returned no draftId');
      }
    } catch (error) {
      console.error('Error creating mock draft:', error);
      alert(`Failed to start mock draft: ${(error as Error)?.message || error}`);
      setDraftInitializing(false);
    }
  };

  const handleMockDraftPlayer = (player: Player) => {
    if (!player) return;
    
    // Add to drafted players
    setDraftedPlayers(prev => new Set(prev).add(player.id));
    
    // Add to my picks if it's my turn
    const teamIndex = getCurrentTeam() - 1;
    const isMyPick = teamIndex === settings.userPosition - 1;
    
    if (isMyPick) {
      setMyMockPicks(prev => [...prev, player]);
    }
    
    // Move to next pick
    setCurrentPick(prev => prev + 1);
    setSelectedPlayer(null);
    
    // Reset timer
    setTimeRemaining(settings.pickTimeSeconds);
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
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.team.toLowerCase().includes(searchLower) ||
        p.conference.toLowerCase().includes(searchLower) ||
        p.position.toLowerCase().includes(searchLower)
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
    
    // Sorting - Default to projections (highest first)
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
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-pick when time expires
          const teamIndex = getCurrentTeam() - 1;
          const isMyPick = teamIndex === settings.userPosition - 1;
          
          if (isMyPick && filteredPlayers.length > 0) {
            // Auto-pick the best available player
            const bestAvailable = filteredPlayers[0];
            if (bestAvailable) {
              handleMockDraftPlayer(bestAvailable);
            }
          }
          return settings.pickTimeSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [draftStarted, timeRemaining, getCurrentTeam, settings, filteredPlayers]);

  // Load players on mount
  useEffect(() => {
    if (!authLoading) {
      loadPlayers();
    }
  }, [authLoading]);

  if (loading || authLoading || draftInitializing) {
    return <CFPLoadingScreen isLoading={true} minDuration={1000} />;
  }

  // Show DraftCore when mock draft is started
  if (mockDraftStarted) {
    const currentRound = Math.ceil(currentPick / settings.numTeams);
    const isMyTurn = getCurrentTeam() - 1 === settings.userPosition - 1;
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: leagueColors.text.primary }}>
                Mock Draft Practice
              </h1>
              <p className="text-sm mt-1 flex items-center gap-2" style={{ color: leagueColors.text.secondary }}>
                <span>Round {currentRound} • Pick {currentPick} • </span>
                {isMyTurn ? (
                  <span className="inline-flex items-center gap-2 text-green-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-semibold">Your turn</span>
                  </span>
                ) : (
                  <span>On the clock: {draftOrder[getCurrentTeam() - 1]}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-mono ${timeRemaining <= 10 ? 'bg-red-100 text-red-700' : ''}`}
                   style={{ backgroundColor: timeRemaining > 10 ? leagueColors.background.card : '', 
                            color: timeRemaining > 10 ? leagueColors.text.primary : '',
                            border: `1px solid ${leagueColors.border.light}` }}>
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </div>
              <button
                onClick={() => {
                  setMockDraftStarted(false);
                  setDraftStarted(false);
                  setCurrentPick(1);
                  setDraftedPlayers(new Set());
                  setMyMockPicks([]);
                  setTimeRemaining(0);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: leagueColors.background.overlay, color: leagueColors.text.primary }}
              >
                ← Back to Settings
              </button>
            </div>
          </div>
          
          <DraftCore
            leagueId="mock-draft"
            draftType="mock"
            onPlayerSelect={setSelectedPlayer}
            onPlayerDraft={handleMockDraftPlayer}
            myPicks={myMockPicks}
            draftedPlayers={Array.from(draftedPlayers).map(id => ({ id } as any))}
            canDraft={isMyTurn}
            timeRemainingSec={timeRemaining}
            currentPickNumber={currentPick}
            currentTeamLabel={draftOrder[getCurrentTeam() - 1] || 'Team 1'}
          />
        </div>
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
                onClick={handleStartMockDraft}
                className="flex-1 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundImage: `linear-gradient(90deg, ${leagueColors.primary.crimson}, ${leagueColors.primary.crimson})`, color: '#FFFFFF', border: `2px solid ${leagueColors.border.light}` }}
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

      <div className="max-w-7xl mx-auto px-4 pt-3">
        <div className="overflow-x-auto whitespace-nowrap rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
          {Object.entries(allPicks).sort((a,b)=> Number(a[0]) - Number(b[0])).slice(-12).map(([pickNum, info]) => (
            <span key={pickNum} className="inline-flex items-center gap-2 mr-4">
              <span className="text-xs" style={{ color: leagueColors.text.secondary }}>#{pickNum}</span>
              <span className="font-medium">{info.player.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.secondary }}>T{(info.team||0)+1}</span>
            </span>
          ))}
          {Object.keys(allPicks).length === 0 && (
            <span className="text-xs" style={{ color: leagueColors.text.secondary }}>No picks yet</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: My Team */}
          <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: leagueColors.text.primary }}>My Team</h3>
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
          </div>

          {/* Middle: Player Pool */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
              {/* Filters */}
              <div className="p-4 space-y-4" style={{ borderBottom: `1px solid ${leagueColors.border.light}` }}>
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: leagueColors.text.muted }} />
                  <input
                    type="text"
                    placeholder="Search by player name, team, conference, or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg font-medium"
                    style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value as Position)}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                  >
                    <option value="ALL">All Positions</option>
                    <option value="QB">QB</option>
                    <option value="RB">RB</option>
                    <option value="WR">WR</option>
                    <option value="TE">TE</option>
                    <option value="K">K</option>
                  </select>
                  
                  <select
                    value={conferenceFilter}
                    onChange={(e) => setConferenceFilter(e.target.value as Conference)}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
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
                    className="px-3 py-2 rounded-lg text-sm font-medium"
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
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                  >
                    <option value="PROJ">↓ Projections</option>
                    <option value="ADP">↑ ADP</option>
                    <option value="NAME">A-Z Name</option>
                    <option value="TEAM">A-Z Team</option>
                  </select>

                  <button
                    onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5`}
                    style={{ backgroundColor: showOnlyAvailable ? leagueColors.primary.crimson : leagueColors.background.overlay, color: showOnlyAvailable ? leagueColors.text.inverse : leagueColors.text.primary, border: `1px solid ${showOnlyAvailable ? leagueColors.primary.crimson : leagueColors.border.light}` }}
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Available
                  </button>
                </div>
                
                {/* Results Count */}
                <div className="text-sm" style={{ color: leagueColors.text.secondary }}>
                  Showing {filteredPlayers.length} of {players.length} players
                </div>
              </div>

              {/* Player List */}
              <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full">
                  <thead className="sticky top-0 z-10" style={{ backgroundColor: leagueColors.background.secondary }}>
                    <tr className="text-xs uppercase tracking-wider" style={{ color: leagueColors.text.secondary }}>
                      <th className="text-left py-2 px-3 font-semibold">#</th>
                      <th className="text-left py-2 px-3 font-semibold">Player</th>
                      <th className="text-center py-2 px-2 font-semibold w-16">Pos</th>
                      <th className="text-left py-2 px-3 font-semibold">School</th>
                      <th className="text-center py-2 px-2 font-semibold w-16">Proj</th>
                      <th className="text-center py-2 px-2 font-semibold w-16">PPG</th>
                      <th className="text-center py-2 px-3 font-semibold w-16">ADP</th>
                      <th className="text-center py-2 px-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, index) => {
                      const isDrafted = draftedPlayers.has(player.id);
                      const isMyPick = getCurrentTeam() - 1 === settings.userPosition - 1;
                      const ppg = player.projections?.perGame?.points || (player.projectedPoints / 12).toFixed(1);
                      
                      return (
                        <tr 
                          key={player.id}
                          className={`border-b hover:bg-opacity-5 hover:bg-white transition-colors ${isDrafted ? 'opacity-50' : ''}`} 
                          style={{ borderColor: leagueColors.border.light }}
                        >
                          <td className="py-2 px-3 font-medium text-sm" style={{ color: leagueColors.text.muted }}>
                            {index + 1}
                          </td>
                          <td className="py-2 px-3">
                            <div>
                              <div className="font-semibold text-sm" style={{ color: isDrafted ? leagueColors.text.muted : leagueColors.text.primary }}>
                                {player.name}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: leagueColors.text.secondary }}>
                                {player.conference} • {player.class} • {player.height} • {player.weight}lbs
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold`} 
                              style={{ 
                                backgroundColor: player.position === 'QB' ? '#3B82F6' : 
                                               player.position === 'RB' ? '#10B981' : 
                                               player.position === 'WR' ? '#F59E0B' : 
                                               player.position === 'TE' ? '#8B5CF6' : 
                                               player.position === 'K' ? '#6B7280' : leagueColors.background.overlay,
                                color: player.position === 'K' ? leagueColors.text.primary : '#FFFFFF'
                              }}
                            >
                              {player.position}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-sm" style={{ color: leagueColors.text.secondary }}>
                            {player.team}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="text-sm font-bold" style={{ color: leagueColors.text.primary }}>
                              {player.projectedPoints}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-sm" style={{ color: leagueColors.text.secondary }}>
                            {ppg}
                          </td>
                          <td className="py-2 px-3 text-center text-sm" style={{ color: leagueColors.text.muted }}>
                            {player.adp.toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {!isDrafted && isMyPick && (
                              <button
                                onClick={() => draftPlayer(player)}
                                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all hover:shadow-lg hover:scale-105 transform"
                                style={{ 
                                  backgroundColor: '#B41F24',  // Strong crimson for better contrast
                                  color: '#FFFFFF',
                                  border: '2px solid #8B0000',  // Dark red border for definition
                                  boxShadow: '0 2px 4px rgba(180, 31, 36, 0.3)'
                                }}
                              >
                                DRAFT
                              </button>
                            )}
                            {isDrafted && (
                              <span className="text-xs font-medium" style={{ color: leagueColors.text.muted }}>Drafted</span>
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
