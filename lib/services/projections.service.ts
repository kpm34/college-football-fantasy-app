import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { PlayerProjection } from '@/types/projections';

export class ProjectionsService {
  // Search players with filters
  static async searchPlayers(filters: {
    search?: string;
    position?: string;
    conference?: string;
    school?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ players: PlayerProjection[]; total: number }> {
    const queries: any[] = [];
    
    if (filters.position && filters.position !== 'ALL') {
      queries.push(Query.equal('position', filters.position));
    }
    
    if (filters.conference) {
      queries.push(Query.equal('conference', filters.conference));
    }
    
    if (filters.school) {
      queries.push(Query.equal('school', filters.school));
    }
    
    if (filters.search) {
      queries.push(Query.search('playerName', filters.search));
    }
    
    // Sort by fantasy points projection
    queries.push(Query.orderDesc('projections.fantasyPoints'));
    
    // Pagination
    queries.push(Query.limit(filters.limit || 50));
    if (filters.offset) {
      queries.push(Query.offset(filters.offset));
    }
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_PROJECTIONS,
        queries
      );
      
      return {
        players: response.documents as unknown as PlayerProjection[],
        total: response.total
      };
    } catch (error) {
      console.error('Error searching players:', error);
      return { players: [], total: 0 };
    }
  }
  
  // Get top players by position
  static async getTopPlayersByPosition(position: string, limit: number = 20): Promise<PlayerProjection[]> {
    const queries = [
      Query.equal('position', position),
      Query.orderDesc('projections.fantasyPoints'),
      Query.limit(position === 'WR' ? 40 : limit)
    ];
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_PROJECTIONS,
        queries
      );
      
      return response.documents as unknown as PlayerProjection[];
    } catch (error) {
      console.error('Error getting top players:', error);
      return [];
    }
  }
  
  // Calculate composite projection score
  static calculateCompositeScore(projection: PlayerProjection): number {
    const weights = {
      prevYearPerformance: 0.3,
      ratings: 0.25,
      mockDraftPosition: 0.2,
      socialBuzz: 0.15,
      risk: 0.1
    };
    
    // Previous year performance score (normalized to 0-100)
    const maxFantasyPoints = 400; // Approximate max for top players
    const prevYearScore = (projection.prevYearStats.fantasyPoints / maxFantasyPoints) * 100;
    
    // Ratings score
    const ratingsScore = projection.ratings.composite;
    
    // Mock draft position score (inverse - lower ADP is better)
    const adpScore = Math.max(0, 100 - (projection.rankings.adp * 2));
    
    // Social buzz score
    const socialScore = projection.sources.socialMediaBuzz;
    
    // Risk score (inverse - lower risk is better)
    const riskScore = 100 - projection.risk.riskScore;
    
    // Calculate weighted composite
    const composite = 
      (prevYearScore * weights.prevYearPerformance) +
      (ratingsScore * weights.ratings) +
      (adpScore * weights.mockDraftPosition) +
      (socialScore * weights.socialBuzz) +
      (riskScore * weights.risk);
    
    return Math.round(composite);
  }
  
  // Get conference leaders
  static async getConferenceLeaders(): Promise<Record<string, PlayerProjection[]>> {
    const conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    const leaders: Record<string, PlayerProjection[]> = {};
    
    for (const conference of conferences) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PLAYER_PROJECTIONS,
          [
            Query.equal('conference', conference),
            Query.orderDesc('projections.fantasyPoints'),
            Query.limit(5)
          ]
        );
        
        leaders[conference] = response.documents as unknown as PlayerProjection[];
      } catch (error) {
        console.error(`Error getting ${conference} leaders:`, error);
        leaders[conference] = [];
      }
    }
    
    return leaders;
  }
  
  // Create or update projection
  static async upsertProjection(projection: Partial<PlayerProjection>): Promise<PlayerProjection | null> {
    try {
      // Check if projection exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_PROJECTIONS,
        [Query.equal('playerId', projection.playerId!)]
      );
      
      if (existing.documents.length > 0) {
        // Update existing
        const updated = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PLAYER_PROJECTIONS,
          existing.documents[0].$id,
          {
            ...projection,
            updatedAt: new Date().toISOString()
          }
        );
        return updated as unknown as PlayerProjection;
      } else {
        // Create new
        const created = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PLAYER_PROJECTIONS,
          'unique()',
          {
            ...projection,
            updatedAt: new Date().toISOString()
          }
        );
        return created as unknown as PlayerProjection;
      }
    } catch (error) {
      console.error('Error upserting projection:', error);
      return null;
    }
  }

  // === Calculated projections (consolidated) ===
  private static readonly CFBD_BASE_URL = 'https://api.collegefootballdata.com';
  private static readonly ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';
  private static cfbdApiKey = process.env.CFBD_API_KEY || process.env.NEXT_PUBLIC_CFBD_API_KEY || '';

  static async getSeasonProjections(
    conference?: string,
    position?: string
  ): Promise<PlayerProjection[]> {
    try {
      const rosters = await this.getPower4Rosters();
      const teamStats = await this.getTeamStats();
      const playerUsage = await this.getPlayerUsage();
      const scheduleWithOdds = await this.getScheduleWithOdds();
      const modelInputs = await this.loadModelInputs(new Date().getFullYear());

      const projections = this.calculateProjections(
        rosters,
        teamStats,
        playerUsage,
        scheduleWithOdds,
        modelInputs
      );

      let filtered = projections;
      if (conference) {
        filtered = filtered.filter(p => p.conference === conference);
      }
      if (position) {
        filtered = filtered.filter(p => p.position === position);
      }
      return filtered;
    } catch (error) {
      console.error('Error getting season projections:', error);
      return [];
    }
  }

  static async getWeeklyProjections(
    week: number,
    conference?: string,
    position?: string
  ): Promise<PlayerProjection[]> {
    try {
      const games = await this.getWeekGames(week);
      const odds: any[] = [];
      const roleUpdates: any[] = [];
      // TODO: Implement weekly projections off games/odds/roles
      return [];
    } catch (error) {
      console.error('Error getting weekly projections:', error);
      return [];
    }
  }

  private static async getPower4Rosters() {
    const conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    const rosters: any[] = [];
    for (const conf of conferences) {
      try {
        const response = await fetch(
          `${this.CFBD_BASE_URL}/roster?year=2025&conference=${conf}`,
          { headers: { 'Authorization': `Bearer ${this.cfbdApiKey}`, 'Accept': 'application/json' } }
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

  private static async getTeamStats(): Promise<Map<string, any>> {
    const stats = new Map<string, any>();
    try {
      const response = await fetch(
        `${this.CFBD_BASE_URL}/stats/season?year=2024`,
        { headers: { 'Authorization': `Bearer ${this.cfbdApiKey}`, 'Accept': 'application/json' } }
      );
      if (response.ok) {
        const data = await response.json();
        data.forEach((team: any) => {
          stats.set(team.team, {
            teamId: team.team,
            pace: team.playsPerGame || 70,
            passRate: team.passAttempts / (team.passAttempts + team.rushAttempts) || 0.5,
            rushRate: 1 - (team.passAttempts / (team.passAttempts + team.rushAttempts) || 0.5),
            redZoneRate: team.redZoneAttempts / team.totalPlays || 0.2,
            returningProduction: 0.6,
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

  private static async getPlayerUsage(): Promise<Map<string, any>> {
    return new Map();
  }

  private static async loadModelInputs(season: number): Promise<{
    depthIndex: Map<string, { teamId: string; posRank: number }>,
    teamPace: Record<string, number>,
    passRushRates: Record<string, { passRate: number; rushRate: number }>,
    ratings: Record<string, number>,
    adp: Record<string, number>,
  }> {
    const result = {
      depthIndex: new Map<string, { teamId: string; posRank: number }>(),
      teamPace: {},
      passRushRates: {},
      ratings: {},
      adp: {},
    };
    try {
      const { Query } = await import('node-appwrite');
      const { serverDatabases, DATABASE_ID } = await import('@/lib/appwrite-server');
      const databases = (serverDatabases as any);
      const res = await databases.listDocuments(
        DATABASE_ID,
        (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs',
        [Query.equal('season', season), Query.limit(1)]
      );
      const doc = res.documents?.[0];
      if (!doc) return result;

      // Depth chart
      let depth: any = doc.depth_chart_json;
      if (typeof depth === 'string') {
        try { depth = JSON.parse(depth); } catch { depth = null; }
      }
      if (depth && typeof depth === 'object') {
        for (const [teamId, posMap] of Object.entries(depth)) {
          for (const [pos, players] of Object.entries(posMap as any)) {
            if (!Array.isArray(players)) continue;
            for (const entry of players as any[]) {
              const name = (entry.player_name || entry.name || '').toString().trim().toLowerCase();
              const key = `${name}|${pos}`;
              const posRank = Number((entry.pos_rank ?? entry.rank ?? entry.depth) || 1);
              result.depthIndex.set(key, { teamId: teamId as string, posRank });
            }
          }
        }
      }

      // Team pace
      let pace = doc.team_pace_json;
      if (typeof pace === 'string') { try { pace = JSON.parse(pace); } catch { pace = null; } }
      if (pace && typeof pace === 'object') {
        result.teamPace = pace as Record<string, number>;
      }

      // Pass/Rush rates
      let pr = doc.pass_rush_rates_json;
      if (typeof pr === 'string') { try { pr = JSON.parse(pr); } catch { pr = null; } }
      if (pr && typeof pr === 'object') {
        result.passRushRates = pr as Record<string, { passRate: number; rushRate: number }>;
      }

      // Ratings
      let ratings = doc.player_ratings_json;
      if (typeof ratings === 'string') { try { ratings = JSON.parse(ratings); } catch { ratings = null; } }
      if (ratings && typeof ratings === 'object') {
        result.ratings = ratings as Record<string, number>;
      }

      // ADP / mock drafts
      let adp = doc.mock_adp_json || doc.adp_json;
      if (typeof adp === 'string') { try { adp = JSON.parse(adp); } catch { adp = null; } }
      if (adp && typeof adp === 'object') {
        result.adp = adp as Record<string, number>;
      }
    } catch (e) {
      // best-effort only
    }
    return result;
  }

  private static async getScheduleWithOdds() {
    try {
      const response = await fetch(
        `${this.CFBD_BASE_URL}/games?year=2025&seasonType=regular`,
        { headers: { 'Authorization': `Bearer ${this.cfbdApiKey}`, 'Accept': 'application/json' } }
      );
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
    return [];
  }

  private static calculateProjections(
    rosters: any[],
    teamIdToStats: Map<string, any>,
    playerUsage: Map<string, any>,
    schedule: any[],
    modelInputs?: {
      depthIndex: Map<string, { teamId: string; posRank: number }>,
      teamPace: Record<string, number>,
      passRushRates: Record<string, { passRate: number; rushRate: number }>,
      ratings: Record<string, number>,
      adp: Record<string, number>,
    }
  ): PlayerProjection[] {
    const projections: PlayerProjection[] = [];
    for (const p of rosters) {
      const teamStats = teamIdToStats.get(p.team);
      if (!teamStats) continue;

      const usage = playerUsage.get(p.id) || this.getDefaultUsage(p.position);
      const eligibleGames = this.estimateEligibleGames(p.team, schedule) || 12;
      const perGamePlays = (modelInputs?.teamPace?.[p.team] || teamStats.pace || 70);
      const overridePR = modelInputs?.passRushRates?.[p.team];
      const passRate = overridePR?.passRate ?? teamStats.passRate ?? 0.5;
      const rushRate = overridePR?.rushRate ?? teamStats.rushRate ?? 0.5;

      let statline = {
        passingYards: 0,
        passingTDs: 0,
        interceptions: 0,
        rushingYards: 0,
        rushingTDs: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTDs: 0,
      } as any;

      // Depth multiplier from model inputs
      const key = `${(`${p.first_name || ''} ${p.last_name || p.name || ''}`).trim().toLowerCase()}|${p.position}`;
      const depthInfo = modelInputs?.depthIndex.get(key);
      // If depth chart missing, do NOT suppress projection. Treat as unknown starter status
      // and rely on other inputs (ratings, pace, usage). Use neutral multiplier of 1.0.
      let depthMult = depthInfo ? this.depthMultiplier(p.position, depthInfo.posRank) : 1.0;
      
      // Apply returning production adjustment
      depthMult = this.applyReturningProductionBoost(depthMult, p, playerUsage);

      switch (p.position) {
        case 'QB': {
          const passAttemptsPerGame = perGamePlays * passRate;
          const ypa = 7.5;
          const passTDRate = 0.05;
          const intRate = 0.025;
          statline.passingYards = Math.round(passAttemptsPerGame * ypa * eligibleGames * depthMult);
          statline.passingTDs = Math.round(passAttemptsPerGame * passTDRate * eligibleGames * depthMult);
          statline.interceptions = Math.round(passAttemptsPerGame * intRate * eligibleGames * depthMult);
          statline.rushingYards = Math.round(20 * eligibleGames * depthMult);
          statline.rushingTDs = Math.round(0.15 * eligibleGames * depthMult);
          break;
        }
        case 'RB': {
          const rushAttemptsPerGame = perGamePlays * rushRate * usage.rushShare;
          const targetShare = Math.max(usage.targetShare, 0.08);
          const targetsPerGame = perGamePlays * passRate * targetShare;
          const ypc = 5.0;
          const rushTDRate = 0.06;
          const catchRate = 0.7;
          const ypr = 7.0;
          const recTDRate = 0.04;
          statline.rushingYards = Math.round(rushAttemptsPerGame * ypc * eligibleGames * depthMult);
          statline.rushingTDs = Math.round(rushAttemptsPerGame * rushTDRate * eligibleGames * depthMult);
          statline.receptions = Math.round(targetsPerGame * catchRate * eligibleGames * depthMult);
          statline.receivingYards = Math.round(statline.receptions * ypr);
          statline.receivingTDs = Math.round(targetsPerGame * recTDRate * eligibleGames * depthMult);
          break;
        }
        case 'WR':
        case 'TE': {
          const targetShare = usage.targetShare || (p.position === 'WR' ? 0.2 : 0.15);
          const targetsPerGame = perGamePlays * passRate * targetShare;
          const catchRate = 0.65;
          const ypr = p.position === 'WR' ? 12 : 10;
          const recTDRate = 0.06;
          statline.receptions = Math.round(targetsPerGame * catchRate * eligibleGames * depthMult);
          statline.receivingYards = Math.round(statline.receptions * ypr);
          statline.receivingTDs = Math.round(targetsPerGame * recTDRate * eligibleGames * depthMult);
          break;
        }
      }

      // Ratings multiplier
      const playerKey = p.id || `${p.first_name || ''} ${p.last_name || p.name || ''}`.trim();
      const rating = modelInputs?.ratings?.[playerKey] ?? modelInputs?.ratings?.[playerKey.toLowerCase()];
      const ratingMult = rating ? Math.max(0.6, Math.min(1.4, (rating / 80))) : 1.0;

      let fantasyPoints = this.calculateFantasyPoints(statline, 'PPR');
      fantasyPoints = Math.round(fantasyPoints * ratingMult);
      const conference = this.inferConference(p.team, schedule) || 'Unknown';
      const nowIso = new Date().toISOString();

      projections.push({
        $id: p.id,
        playerId: p.id,
        playerName: `${p.first_name} ${p.last_name}`.trim(),
        position: p.position,
        team: p.team,
        conference,
        school: p.team,
        year: String(p.year || 'JR'),
        prevYearStats: { gamesPlayed: 0, fantasyPoints: 0 },
        ratings: { composite: 75 },
        projections: {
          gamesPlayed: eligibleGames,
          passingYards: statline.passingYards || undefined,
          passingTDs: statline.passingTDs || undefined,
          interceptions: statline.interceptions || undefined,
          rushingYards: statline.rushingYards || undefined,
          rushingTDs: statline.rushingTDs || undefined,
          receivingYards: statline.receivingYards || undefined,
          receivingTDs: statline.receivingTDs || undefined,
          receptions: statline.receptions || undefined,
          fantasyPoints,
          // Lower confidence when depth is unknown
          confidence: depthInfo ? 70 : 55,
          floor: Math.round(fantasyPoints * 0.7),
          ceiling: Math.round(fantasyPoints * 1.4),
          consistency: 0.6,
        },
        rankings: { overall: 0, position: 0, adp: modelInputs?.adp?.[playerKey] ?? 100, tier: 3 },
        sources: { espn: false, ncaa: false, spPlus: false, mockDrafts: [], socialMediaBuzz: 0, articles: [] },
        risk: { injuryHistory: [], suspensions: [], riskScore: 20 },
        updatedAt: nowIso,
      });
    }
    return projections;
  }

  private static depthMultiplier(position: string, rank: number): number {
    const r = Math.max(1, rank);
    switch (position) {
      case 'QB':
        // QB: rank1 = 0.95 share, rank2 = 0.05, rank3+ = 0.0
        return [0.95, 0.05, 0.0, 0.0, 0.0][r - 1] ?? 0.0;
      case 'RB':
        // RB: rank1 = 0.55, rank2 = 0.25, rank3 = 0.15, others share remaining 0.05
        return [0.55, 0.25, 0.15, 0.025, 0.025][r - 1] ?? 0.01;
      case 'WR':
        // WR: rank1 = 0.25, rank2 = 0.20, rank3 = 0.15, rank4 = 0.10, rank5+ share 0.30 equally
        if (r <= 4) {
          return [0.25, 0.20, 0.15, 0.10][r - 1];
        } else {
          // WR5+ share remaining 0.30 equally (assuming max 6 WRs = 0.15 each)
          return 0.15;
        }
      case 'TE':
        // TE: rank1 = 0.7, rank2 = 0.3
        return [0.7, 0.3, 0.0][r - 1] ?? 0.0;
      default:
        return 1.0;
    }
  }

  private static getDefaultUsage(position: string) {
    const defaults: Record<string, any> = {
      QB: { rushShare: 0.1, targetShare: 0, routeShare: 0, redZoneShare: 0.2, goalLineAttempts: 2 },
      RB: { rushShare: 0.25, targetShare: 0.15, routeShare: 0.4, redZoneShare: 0.3, goalLineAttempts: 4 },
      WR: { rushShare: 0.02, targetShare: 0.2, routeShare: 0.8, redZoneShare: 0.15, goalLineAttempts: 0 },
      TE: { rushShare: 0, targetShare: 0.15, routeShare: 0.6, redZoneShare: 0.15, goalLineAttempts: 0 },
    };
    return defaults[position] || defaults['WR'];
  }

  private static calculateFantasyPoints(stats: any, scoringType: 'PPR' | 'HALF_PPR' | 'STANDARD'): number {
    let points = 0;
    points += (stats.passingYards || 0) * 0.04;
    points += (stats.passingTDs || 0) * 4;
    points += (stats.interceptions || 0) * -2;
    points += (stats.rushingYards || 0) * 0.1;
    points += (stats.rushingTDs || 0) * 6;
    points += (stats.receivingYards || 0) * 0.1;
    points += (stats.receivingTDs || 0) * 6;
    if (scoringType === 'PPR') points += (stats.receptions || 0) * 1;
    if (scoringType === 'HALF_PPR') points += (stats.receptions || 0) * 0.5;
    if (stats.passingYards >= 300) points += 3;
    if (stats.rushingYards >= 100) points += 3;
    if (stats.receivingYards >= 100) points += 3;
    return Math.round(points * 10) / 10;
  }

  private static async getWeekGames(week: number) {
    try {
      const response = await fetch(
        `${this.CFBD_BASE_URL}/games?year=2025&week=${week}&seasonType=regular`,
        { headers: { 'Authorization': `Bearer ${this.cfbdApiKey}`, 'Accept': 'application/json' } }
      );
      if (response.ok) return await response.json();
    } catch (error) {
      console.error('Error fetching week games:', error);
    }
    return [];
  }

  private static estimateEligibleGames(teamName: string, schedule: any[]): number {
    let count = 0;
    for (const g of schedule) {
      const isTeamInGame = g.home_team === teamName || g.away_team === teamName;
      const isConferenceGame = Boolean(g.conference_game);
      if (isTeamInGame && isConferenceGame) count++;
    }
    return count || 12;
  }

  private static inferConference(teamName: string, schedule: any[]): string | null {
    for (const g of schedule) {
      if (g.home_team === teamName) return g.home_conference || null;
      if (g.away_team === teamName) return g.away_conference || null;
    }
    return null;
  }

  /**
   * Apply returning production boost
   * If player had >20% team share last season in yards or TDs, add +0.05 to their multiplier
   */
  private static applyReturningProductionBoost(
    baseMult: number, 
    player: any, 
    playerUsage: Map<string, any>
  ): number {
    const usage = playerUsage.get(player.id);
    if (!usage) return baseMult;

    // Check if player had >20% team share last season
    const hadHighYardShare = (usage.prevYardShare || 0) > 0.20;
    const hadHighTDShare = (usage.prevTDShare || 0) > 0.20;

    if (hadHighYardShare || hadHighTDShare) {
      return Math.min(1.0, baseMult + 0.05); // Cap at 100%
    }

    return baseMult;
  }

  /**
   * Enforce minimum/maximum floors and caps
   * Apply post-calculation caps to ensure proper hierarchy
   */
  static enforceProjectionCaps(projections: PlayerProjection[]): PlayerProjection[] {
    // Group by team and position
    const teamPositionGroups: Record<string, PlayerProjection[]> = {};
    
    for (const projection of projections) {
      const key = `${projection.team}_${projection.position}`;
      if (!teamPositionGroups[key]) teamPositionGroups[key] = [];
      teamPositionGroups[key].push(projection);
    }

    // Apply caps for each team-position group
    for (const [key, group] of Object.entries(teamPositionGroups)) {
      const [team, position] = key.split('_');
      this.applyPositionCaps(group, position);
    }

    return projections;
  }

  /**
   * Apply position-specific caps to a group of players
   */
  private static applyPositionCaps(players: PlayerProjection[], position: string): void {
    // Sort by fantasy points descending to identify starters
    const sortedPlayers = players.sort((a, b) => 
      (b.projections?.fantasyPoints || 0) - (a.projections?.fantasyPoints || 0)
    );

    if (sortedPlayers.length === 0) return;

    const starter = sortedPlayers[0];
    const starterPoints = starter.projections?.fantasyPoints || 0;

    for (let i = 1; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      if (!player.projections) continue;

      let maxPoints = starterPoints;

      switch (position) {
        case 'QB':
          if (i === 1) {
            // QB2 cannot exceed 25% of QB1 projection unless starter flagged as OUT
            maxPoints = starterPoints * 0.25;
          } else {
            // QB3+ get minimal projections
            maxPoints = starterPoints * 0.05;
          }
          break;

        case 'RB':
          // Non-starters (depth rank >3) cap at 10% of starter projection
          if (i >= 3) {
            maxPoints = starterPoints * 0.10;
          }
          break;

        case 'WR':
          // Non-starters (depth rank >4) cap at 10% of starter projection  
          if (i >= 4) {
            maxPoints = starterPoints * 0.10;
          }
          break;

        case 'TE':
          // TE3+ get minimal projections
          if (i >= 2) {
            maxPoints = starterPoints * 0.05;
          }
          break;

        default:
          continue; // No caps for other positions
      }

      // Apply the cap if needed
      if (player.projections.fantasyPoints > maxPoints) {
        const scaleFactor = maxPoints / player.projections.fantasyPoints;
        this.scalePlayerProjection(player, scaleFactor);
      }
    }
  }

  /**
   * Scale all stats in a player's projection by a factor
   */
  private static scalePlayerProjection(player: PlayerProjection, scaleFactor: number): void {
    if (!player.projections) return;

    const p = player.projections;
    
    // Scale all counting stats
    if (p.passingYards) p.passingYards = Math.round(p.passingYards * scaleFactor);
    if (p.passingTDs) p.passingTDs = Math.round(p.passingTDs * scaleFactor);
    if (p.interceptions) p.interceptions = Math.round(p.interceptions * scaleFactor);
    if (p.rushingYards) p.rushingYards = Math.round(p.rushingYards * scaleFactor);
    if (p.rushingTDs) p.rushingTDs = Math.round(p.rushingTDs * scaleFactor);
    if (p.receivingYards) p.receivingYards = Math.round(p.receivingYards * scaleFactor);
    if (p.receivingTDs) p.receivingTDs = Math.round(p.receivingTDs * scaleFactor);
    if (p.receptions) p.receptions = Math.round(p.receptions * scaleFactor);
    
    // Recalculate fantasy points
    p.fantasyPoints = Math.round(p.fantasyPoints * scaleFactor);
    
    // Adjust floor and ceiling
    if (p.floor) p.floor = Math.round(p.floor * scaleFactor);
    if (p.ceiling) p.ceiling = Math.round(p.ceiling * scaleFactor);
  }

  /**
   * Generate enhanced projections with proper depth chart enforcement
   */
  static async getEnhancedSeasonProjections(
    conference?: string,
    position?: string
  ): Promise<PlayerProjection[]> {
    try {
      // Get base projections
      let projections = await this.getSeasonProjections(conference, position);
      
      // Apply caps to enforce proper depth chart distribution
      projections = this.enforceProjectionCaps(projections);
      
      return projections;
    } catch (error) {
      console.error('Error getting enhanced season projections:', error);
      return [];
    }
  }
}
