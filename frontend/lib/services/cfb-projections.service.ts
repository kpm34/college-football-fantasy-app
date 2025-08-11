import { PlayerProjection } from '@/types/projections';

interface TeamStats {
  teamId: string;
  pace: number; // plays per game
  passRate: number;
  rushRate: number;
  redZoneRate: number;
  returningProduction: number;
  strengthOffense: number;
  strengthDefense: number;
}

interface PlayerUsage {
  playerId: string;
  rushShare: number;
  targetShare: number;
  routeShare: number;
  redZoneShare: number;
  goalLineAttempts: number;
}

interface GameOdds {
  gameId: string;
  spread: number;
  total: number;
  homeTeamTotal: number;
  awayTeamTotal: number;
}

export class CFBProjectionsService {
  private static readonly CFBD_BASE_URL = 'https://api.collegefootballdata.com';
  private static readonly ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';
  
  private static cfbdApiKey = process.env.NEXT_PUBLIC_CFBD_API_KEY || '';

  /**
   * Get player projections for the season
   */
  static async getSeasonProjections(
    conference?: string,
    position?: string
  ): Promise<PlayerProjection[]> {
    try {
      // 1. Get rosters for Power 4 conferences
      const rosters = await this.getPower4Rosters();
      
      // 2. Get team statistics
      const teamStats = await this.getTeamStats();
      
      // 3. Get player usage from previous season
      const playerUsage = await this.getPlayerUsage();
      
      // 4. Get schedule and odds
      const scheduleWithOdds = await this.getScheduleWithOdds();
      
      // 5. Calculate projections
      const projections = this.calculateProjections(
        rosters,
        teamStats,
        playerUsage,
        scheduleWithOdds
      );
      
      // 6. Filter by conference and position if provided
      let filtered = projections;
      if (conference) {
        filtered = filtered.filter(p => p.team === conference);
      }
      if (position) {
        filtered = filtered.filter(p => p.position === position);
      }
      
      return filtered;
    } catch (error) {
      console.error('Error getting season projections:', error);
      return this.getMockProjections(); // Fallback to mock data
    }
  }

  /**
   * Get weekly projections
   */
  static async getWeeklyProjections(
    week: number,
    conference?: string,
    position?: string
  ): Promise<PlayerProjection[]> {
    try {
      // Get this week's games
      const games = await this.getWeekGames(week);
      
      // Get current odds
      const odds = await this.getCurrentOdds(week);
      
      // Get injury/role updates
      const roleUpdates = await this.getRoleUpdates();
      
      // Calculate weekly projections
      const projections = await this.calculateWeeklyProjections(
        week,
        games,
        odds,
        roleUpdates
      );
      
      return projections;
    } catch (error) {
      console.error('Error getting weekly projections:', error);
      return this.getMockProjections();
    }
  }

  /**
   * Fetch rosters from CFBD
   */
  private static async getPower4Rosters() {
    const conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    const rosters = [];
    
    for (const conf of conferences) {
      try {
        const response = await fetch(
          `${this.CFBD_BASE_URL}/roster?year=2025&conference=${conf}`,
          {
            headers: {
              'Authorization': `Bearer ${this.cfbdApiKey}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          rosters.push(...data);
        }
      } catch (error) {
        console.error(`Error fetching ${conf} rosters:`, error);
      }
    }
    
    return rosters;
  }

  /**
   * Get team statistics from previous season
   */
  private static async getTeamStats(): Promise<Map<string, TeamStats>> {
    const stats = new Map<string, TeamStats>();
    
    try {
      // Get team stats from CFBD
      const response = await fetch(
        `${this.CFBD_BASE_URL}/stats/season?year=2024`,
        {
          headers: {
            'Authorization': `Bearer ${this.cfbdApiKey}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Process and calculate team pace, pass rate, etc.
        data.forEach((team: any) => {
          stats.set(team.team, {
            teamId: team.team,
            pace: team.playsPerGame || 70,
            passRate: team.passAttempts / (team.passAttempts + team.rushAttempts) || 0.5,
            rushRate: 1 - (team.passAttempts / (team.passAttempts + team.rushAttempts) || 0.5),
            redZoneRate: team.redZoneAttempts / team.totalPlays || 0.2,
            returningProduction: 0.6, // TODO: Calculate from returning players
            strengthOffense: team.offenseRating || 0.5,
            strengthDefense: team.defenseRating || 0.5
          });
        });
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
    
    return stats;
  }

  /**
   * Get player usage data
   */
  private static async getPlayerUsage(): Promise<Map<string, PlayerUsage>> {
    const usage = new Map<string, PlayerUsage>();
    
    // TODO: Calculate from play-by-play data
    // For now, return estimated usage based on position and depth
    
    return usage;
  }

  /**
   * Get schedule with odds
   */
  private static async getScheduleWithOdds() {
    try {
      const response = await fetch(
        `${this.CFBD_BASE_URL}/games?year=2025&seasonType=regular`,
        {
          headers: {
            'Authorization': `Bearer ${this.cfbdApiKey}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
    
    return [];
  }

  /**
   * Calculate season-long projections
   */
  private static calculateProjections(
    rosters: any[],
    teamStats: Map<string, TeamStats>,
    playerUsage: Map<string, PlayerUsage>,
    schedule: any[]
  ): PlayerProjection[] {
    const projections: PlayerProjection[] = [];
    
    rosters.forEach(player => {
      const team = teamStats.get(player.team);
      if (!team) return;
      
      const usage = playerUsage.get(player.id) || this.getDefaultUsage(player.position);
      
      // Calculate expected stats based on position
      let projection: PlayerProjection = {
        playerId: player.id,
        playerName: `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team,
        // Base projections
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        rushingYards: 0,
        rushingTDs: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTDs: 0,
        fantasyPoints: 0,
        confidence: 0.7,
        adp: 100,
        valueScore: 0
      };
      
      // Position-specific projections
      switch (player.position) {
        case 'QB':
          const passAttempts = team.pace * team.passRate * 12; // 12 games
          projection.passingYards = passAttempts * 7.5; // 7.5 YPA average
          projection.passingTDs = passAttempts * 0.05; // 5% TD rate
          projection.interceptions = passAttempts * 0.025; // 2.5% INT rate
          projection.rushingYards = 200; // Average QB rushing
          projection.rushingTDs = 2;
          break;
          
        case 'RB':
          const carries = team.pace * team.rushRate * usage.rushShare * 12;
          projection.rushingYards = carries * 5.0; // 5.0 YPC
          projection.rushingTDs = carries * 0.06; // 6% TD rate
          projection.receptions = team.pace * team.passRate * 0.15 * 12; // 15% target share
          projection.receivingYards = projection.receptions * 7;
          projection.receivingTDs = projection.receptions * 0.04;
          break;
          
        case 'WR':
        case 'TE':
          const targets = team.pace * team.passRate * usage.targetShare * 12;
          projection.receptions = targets * 0.65; // 65% catch rate
          projection.receivingYards = projection.receptions * 12; // 12 YPR
          projection.receivingTDs = targets * 0.06; // 6% TD rate
          break;
      }
      
      // Calculate fantasy points (PPR scoring)
      projection.fantasyPoints = this.calculateFantasyPoints(projection, 'PPR');
      
      projections.push(projection);
    });
    
    return projections;
  }

  /**
   * Calculate weekly projections
   */
  private static async calculateWeeklyProjections(
    week: number,
    games: any[],
    odds: any[],
    roleUpdates: any[]
  ): Promise<PlayerProjection[]> {
    // TODO: Implement weekly projection logic
    return this.getMockProjections();
  }

  /**
   * Get default usage for position
   */
  private static getDefaultUsage(position: string): PlayerUsage {
    const defaults: Record<string, PlayerUsage> = {
      'QB': {
        playerId: '',
        rushShare: 0.1,
        targetShare: 0,
        routeShare: 0,
        redZoneShare: 0.2,
        goalLineAttempts: 2
      },
      'RB': {
        playerId: '',
        rushShare: 0.25,
        targetShare: 0.15,
        routeShare: 0.4,
        redZoneShare: 0.3,
        goalLineAttempts: 4
      },
      'WR': {
        playerId: '',
        rushShare: 0.02,
        targetShare: 0.2,
        routeShare: 0.8,
        redZoneShare: 0.15,
        goalLineAttempts: 0
      },
      'TE': {
        playerId: '',
        rushShare: 0,
        targetShare: 0.15,
        routeShare: 0.6,
        redZoneShare: 0.15,
        goalLineAttempts: 0
      }
    };
    
    return defaults[position] || defaults['WR'];
  }

  /**
   * Calculate fantasy points based on scoring system
   */
  private static calculateFantasyPoints(
    stats: any,
    scoringType: 'PPR' | 'HALF_PPR' | 'STANDARD'
  ): number {
    let points = 0;
    
    // Passing
    points += (stats.passingYards || 0) * 0.04;
    points += (stats.passingTDs || 0) * 4;
    points += (stats.interceptions || 0) * -2;
    
    // Rushing
    points += (stats.rushingYards || 0) * 0.1;
    points += (stats.rushingTDs || 0) * 6;
    
    // Receiving
    points += (stats.receivingYards || 0) * 0.1;
    points += (stats.receivingTDs || 0) * 6;
    
    // Receptions
    if (scoringType === 'PPR') {
      points += (stats.receptions || 0) * 1;
    } else if (scoringType === 'HALF_PPR') {
      points += (stats.receptions || 0) * 0.5;
    }
    
    // Bonuses
    if (stats.passingYards >= 300) points += 3;
    if (stats.rushingYards >= 100) points += 3;
    if (stats.receivingYards >= 100) points += 3;
    
    return Math.round(points * 10) / 10;
  }

  /**
   * Get week's games
   */
  private static async getWeekGames(week: number) {
    try {
      const response = await fetch(
        `${this.CFBD_BASE_URL}/games?year=2025&week=${week}&seasonType=regular`,
        {
          headers: {
            'Authorization': `Bearer ${this.cfbdApiKey}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching week games:', error);
    }
    
    return [];
  }

  /**
   * Get current odds from ESPN
   */
  private static async getCurrentOdds(week: number) {
    // TODO: Implement odds fetching
    return [];
  }

  /**
   * Get role updates (injuries, depth chart changes)
   */
  private static async getRoleUpdates() {
    // TODO: Implement role updates
    return [];
  }

  /**
   * Get advanced projections from our Python backend
   */
  static async getAdvancedProjections(): Promise<PlayerProjection[]> {
    try {
      const response = await fetch('/api/projections/advanced');
      const data = await response.json();
      
      if (data.success && data.projections) {
        return data.projections.map((proj: any) => ({
          playerId: proj.playerId,
          playerName: proj.playerName,
          position: proj.position,
          team: proj.team,
          conference: proj.conference,
          
          // Stats from advanced model
          passingYards: proj.projectedStats?.passingYards || 0,
          passingTDs: proj.projectedStats?.passingTDs || 0,
          interceptions: proj.projectedStats?.interceptions || 0,
          rushingYards: proj.projectedStats?.rushingYards || 0,
          rushingTDs: proj.projectedStats?.rushingTDs || 0,
          receptions: proj.projectedStats?.receptions || 0,
          receivingYards: proj.projectedStats?.receivingYards || 0,
          receivingTDs: proj.projectedStats?.receivingTDs || 0,
          
          // Advanced metrics
          fantasyPoints: proj.fantasyPoints,
          floor: proj.floor,
          ceiling: proj.ceiling,
          consistency: proj.consistency,
          vorp: proj.vorp,
          tier: proj.tier,
          
          // Rankings
          overallRank: proj.overallRank,
          positionRank: proj.positionRank,
          adp: proj.adp,
          
          // Derived metrics
          confidence: proj.consistency,
          valueScore: proj.vorp / 100 // Normalize VORP to 0-1 scale
        }));
      }
    } catch (error) {
      console.error('Error fetching advanced projections:', error);
    }
    
    return this.getMockProjections();
  }

  /**
   * Get mock projections for testing
   */
  private static getMockProjections(): PlayerProjection[] {
    return [
      {
        playerId: '1',
        playerName: 'Quinn Ewers',
        position: 'QB',
        team: 'Texas',
        passingYards: 3200,
        passingTDs: 28,
        interceptions: 8,
        rushingYards: 150,
        rushingTDs: 2,
        receptions: 0,
        receivingYards: 0,
        receivingTDs: 0,
        fantasyPoints: 285.5,
        confidence: 0.85,
        adp: 15.2,
        valueScore: 0.75
      },
      {
        playerId: '2',
        playerName: 'Ollie Gordon II',
        position: 'RB',
        team: 'Oklahoma State',
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        rushingYards: 1400,
        rushingTDs: 16,
        receptions: 35,
        receivingYards: 280,
        receivingTDs: 2,
        fantasyPoints: 245.8,
        confidence: 0.80,
        adp: 8.5,
        valueScore: 0.82
      },
      {
        playerId: '3',
        playerName: 'Luther Burden III',
        position: 'WR',
        team: 'Missouri',
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        rushingYards: 50,
        rushingTDs: 0,
        receptions: 75,
        receivingYards: 1100,
        receivingTDs: 9,
        fantasyPoints: 209.5,
        confidence: 0.78,
        adp: 22.3,
        valueScore: 0.70
      }
    ];
  }
}
