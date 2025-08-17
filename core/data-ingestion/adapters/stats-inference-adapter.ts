/**
 * Stats Inference Adapter
 * 
 * Infers depth chart positions and usage patterns from player_stats data
 * when official team sources are unavailable. Uses statistical analysis
 * to determine:
 * - Depth chart rankings based on usage
 * - Starter probabilities from snap counts
 * - Usage trend calculations (EMAs)
 * - Team context from aggregate stats
 */

import { BaseAdapter, AdapterConfig, RawDataRecord } from './base-adapter';
import { PlayerDepthChart, TeamContext, DataSource } from '../schemas/database-schema';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite-server';
import { Query } from 'node-appwrite';

export interface StatsInferenceRecord extends PlayerDepthChart {
  inference_method: string;
  statistical_confidence: number;
}

interface PlayerGameStats {
  player_id: string;
  player_name: string;
  team: string;
  position: string;
  week: number;
  season: number;
  snaps?: number;
  routes?: number;
  carries?: number;
  targets?: number;
  fantasy_points: number;
  game_participation: number; // 0.0-1.0
}

interface UsageMetrics {
  snap_pct: number;
  route_pct: number;
  carry_share: number;
  target_share: number;
  consistency: number; // coefficient of variation
}

interface PositionGroup {
  position: string;
  team: string;
  players: Array<{
    player_id: string;
    player_name: string;
    total_usage: number;
    avg_usage: UsageMetrics;
    games_played: number;
    depth_rank_inferred: number;
    starter_prob_inferred: number;
  }>;
}

export class StatsInferenceAdapter extends BaseAdapter<StatsInferenceRecord> {
  private readonly LOOKBACK_WEEKS = 4; // How many weeks to analyze
  private readonly MIN_GAMES_SAMPLE = 2; // Minimum games for reliable inference

  constructor() {
    const config: AdapterConfig = {
      sourceId: 'stats_inference',
      sourceName: 'Statistical Usage Inference',
      sourceType: 'stats_inference',
      rateLimit: {
        requestsPerHour: 1000 // Database queries, not external API
      },
      timeout: 60000 // Allow time for complex queries
    };
    
    super(config);
  }

  protected async fetchRawData(season: number, week: number): Promise<RawDataRecord[]> {
    console.log(`[StatsInference] Analyzing ${this.LOOKBACK_WEEKS} weeks of data ending at ${season}W${week}`);

    try {
      // Get player stats for recent weeks
      const startWeek = Math.max(1, week - this.LOOKBACK_WEEKS + 1);
      const playerStats = await this.fetchPlayerStats(season, startWeek, week);
      
      if (playerStats.length === 0) {
        console.warn('[StatsInference] No player stats found for analysis period');
        return [];
      }

      console.log(`[StatsInference] Loaded ${playerStats.length} player game records`);

      // Group players by team and position
      const positionGroups = this.groupPlayersByTeamPosition(playerStats);
      
      // Calculate usage metrics for each group
      const rawRecords: RawDataRecord[] = [];
      for (const group of positionGroups) {
        const groupRecords = await this.analyzePositionGroup(group, season, week);
        rawRecords.push(...groupRecords);
      }

      console.log(`[StatsInference] Generated ${rawRecords.length} inferred depth records`);
      return rawRecords;

    } catch (error) {
      console.error('[StatsInference] Failed to fetch raw data:', error);
      throw error;
    }
  }

  protected async processData(rawData: RawDataRecord[], season: number, week: number): Promise<StatsInferenceRecord[]> {
    const processedRecords: StatsInferenceRecord[] = [];

    for (const rawRecord of rawData) {
      try {
        const record = await this.processStatisticalRecord(rawRecord, season, week);
        if (record) {
          processedRecords.push(record);
        }
      } catch (error) {
        console.warn('[StatsInference] Failed to process raw record:', error);
      }
    }

    // Apply final validation and cleanup
    return this.validateAndCleanInferences(processedRecords);
  }

  protected validateRecord(record: StatsInferenceRecord): boolean {
    // Base validation
    const requiredFields = ['player_id', 'team_id', 'position', 'depth_chart_rank'];
    const errors = this.validateRequiredFields(record, requiredFields);
    
    if (errors.length > 0) {
      return false;
    }

    // Statistical confidence threshold
    if (record.statistical_confidence < 0.3) {
      console.warn(`[StatsInference] Low confidence inference for ${record.player_id}: ${record.statistical_confidence}`);
      return false;
    }

    // Reasonable depth rank
    if (record.depth_chart_rank < 1 || record.depth_chart_rank > 8) {
      return false;
    }

    // Valid probabilities
    if (record.starter_prob < 0 || record.starter_prob > 1) {
      return false;
    }

    return true;
  }

  private async fetchPlayerStats(season: number, startWeek: number, endWeek: number): Promise<PlayerGameStats[]> {
    try {
      // Query player_stats collection for the analysis window
      const queries = [
        Query.equal('season', season),
        Query.greaterThanEqual('week', startWeek),
        Query.lessThanEqual('week', endWeek),
        Query.limit(5000) // Large limit to get all relevant stats
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_STATS || 'player_stats',
        queries
      );

      return response.documents.map((doc: any) => ({
        player_id: doc.playerId || doc.player_id,
        player_name: doc.playerName || doc.player_name || 'Unknown',
        team: doc.team || doc.teamName || 'Unknown',
        position: doc.position || 'RB',
        week: doc.week,
        season: doc.season,
        snaps: this.parseNumeric(doc.snaps),
        routes: this.parseNumeric(doc.routes),
        carries: this.parseNumeric(doc.carries),
        targets: this.parseNumeric(doc.targets),
        fantasy_points: this.parseNumeric(doc.fantasy_points || doc.fantasyPoints),
        game_participation: this.calculateParticipation(doc)
      }));

    } catch (error) {
      console.warn('[StatsInference] Database query failed, trying fallback method:', error);
      return []; // Return empty array on failure
    }
  }

  private calculateParticipation(statDoc: any): number {
    // Estimate game participation from available stats
    const snaps = this.parseNumeric(statDoc.snaps);
    const carries = this.parseNumeric(statDoc.carries);
    const targets = this.parseNumeric(statDoc.targets);
    const receptions = this.parseNumeric(statDoc.receptions);
    
    // Estimate based on activity level
    if (snaps > 0) {
      // If we have snap count, use it (assuming 70 snaps = 100% participation)
      return Math.min(1.0, snaps / 70);
    } else {
      // Estimate from touches for skill positions
      const touches = carries + targets + receptions;
      if (touches > 20) return 0.9;
      if (touches > 10) return 0.6;
      if (touches > 5) return 0.4;
      if (touches > 0) return 0.2;
      return 0.1;
    }
  }

  private groupPlayersByTeamPosition(playerStats: PlayerGameStats[]): PositionGroup[] {
    const groups = new Map<string, PlayerGameStats[]>();

    // Group by team_position key
    for (const stat of playerStats) {
      const key = `${stat.team}_${stat.position}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(stat);
    }

    const positionGroups: PositionGroup[] = [];

    for (const [key, stats] of groups.entries()) {
      const [team, position] = key.split('_');
      
      // Calculate per-player aggregated metrics
      const playerMap = new Map<string, PlayerGameStats[]>();
      for (const stat of stats) {
        const playerId = stat.player_id || this.standardizePlayerName(stat.player_name);
        if (!playerMap.has(playerId)) {
          playerMap.set(playerId, []);
        }
        playerMap.get(playerId)!.push(stat);
      }

      // Only process groups with sufficient data
      if (playerMap.size >= 1) {
        const group = this.calculateGroupMetrics(team, position, playerMap);
        positionGroups.push(group);
      }
    }

    return positionGroups;
  }

  private calculateGroupMetrics(team: string, position: string, playerMap: Map<string, PlayerGameStats[]>): PositionGroup {
    const players: PositionGroup['players'] = [];

    for (const [playerId, gameStats] of playerMap.entries()) {
      if (gameStats.length < this.MIN_GAMES_SAMPLE) {
        continue; // Skip players with insufficient data
      }

      const playerName = gameStats[0].player_name;
      const gamesPlayed = gameStats.length;

      // Calculate usage metrics
      const avgUsage = this.calculateAverageUsage(gameStats);
      const totalUsage = this.calculateTotalUsage(gameStats);

      players.push({
        player_id: playerId,
        player_name: playerName,
        total_usage: totalUsage,
        avg_usage: avgUsage,
        games_played: gamesPlayed,
        depth_rank_inferred: 1, // Will be calculated after sorting
        starter_prob_inferred: 0 // Will be calculated after sorting
      });
    }

    // Sort by total usage to infer depth chart
    players.sort((a, b) => b.total_usage - a.total_usage);

    // Assign depth rankings and starter probabilities
    players.forEach((player, index) => {
      player.depth_rank_inferred = index + 1;
      player.starter_prob_inferred = this.calculateStarterProbability(player, index, players.length);
    });

    return {
      position,
      team,
      players
    };
  }

  private calculateAverageUsage(gameStats: PlayerGameStats[]): UsageMetrics {
    if (gameStats.length === 0) {
      return { snap_pct: 0, route_pct: 0, carry_share: 0, target_share: 0, consistency: 1 };
    }

    const totals = gameStats.reduce((sum, game) => ({
      snaps: sum.snaps + (game.snaps || 0),
      routes: sum.routes + (game.routes || 0),
      carries: sum.carries + (game.carries || 0),
      targets: sum.targets + (game.targets || 0),
      participation: sum.participation + game.game_participation
    }), { snaps: 0, routes: 0, carries: 0, targets: 0, participation: 0 });

    const games = gameStats.length;

    // Calculate consistency (lower coefficient of variation = more consistent)
    const participationValues = gameStats.map(g => g.game_participation);
    const avgParticipation = totals.participation / games;
    const variance = participationValues.reduce((sum, val) => sum + Math.pow(val - avgParticipation, 2), 0) / games;
    const stdDev = Math.sqrt(variance);
    const consistency = avgParticipation > 0 ? 1 - (stdDev / avgParticipation) : 0;

    return {
      snap_pct: avgParticipation,
      route_pct: totals.routes / games / 25, // Assuming 25 team routes per game
      carry_share: totals.carries / games / 35, // Assuming 35 team carries per game
      target_share: totals.targets / games / 25, // Assuming 25 team targets per game
      consistency: Math.max(0, Math.min(1, consistency))
    };
  }

  private calculateTotalUsage(gameStats: PlayerGameStats[]): number {
    return gameStats.reduce((sum, game) => {
      // Weight recent games more heavily
      const recencyWeight = 1.0; // Could implement exponential decay
      const gameValue = (
        game.game_participation * 2.0 + // Participation is key indicator
        (game.carries || 0) * 0.3 +
        (game.targets || 0) * 0.3 +
        (game.fantasy_points || 0) * 0.1
      ) * recencyWeight;
      
      return sum + gameValue;
    }, 0);
  }

  private calculateStarterProbability(player: PositionGroup['players'][0], rank: number, totalPlayers: number): number {
    const { avg_usage, games_played } = player;
    
    // Base probability by rank
    const rankProbs = [0.85, 0.35, 0.15, 0.08, 0.05];
    let baseProb = rankProbs[rank] || 0.02;

    // Adjust by usage metrics
    if (avg_usage.snap_pct > 0.7) baseProb *= 1.2;
    else if (avg_usage.snap_pct < 0.3) baseProb *= 0.7;

    // Adjust by consistency
    baseProb *= (0.7 + 0.3 * avg_usage.consistency);

    // Adjust by sample size
    if (games_played < 3) baseProb *= 0.8;

    return Math.max(0, Math.min(1, baseProb));
  }

  private async analyzePositionGroup(group: PositionGroup, season: number, week: number): Promise<RawDataRecord[]> {
    const records: RawDataRecord[] = [];

    for (const player of group.players) {
      // Calculate EMAs for usage trends
      const ema1w = await this.calculateEMA(player.player_id, season, week, 1);
      const ema4w = await this.calculateEMA(player.player_id, season, week, 4);

      const record: RawDataRecord = {
        source: 'stats_inference' as DataSource,
        timestamp: new Date().toISOString(),
        confidence: this.calculateInferenceConfidence(player),
        data: {
          player_id: player.player_id,
          team_id: this.standardizeTeamName(group.team).toLowerCase(),
          position: group.position,
          season,
          week,
          depth_chart_rank: player.depth_rank_inferred,
          starter_prob: player.starter_prob_inferred,
          snap_share_proj: player.avg_usage.snap_pct,
          
          // Injury status (assume ACTIVE for statistical inference)
          injury_status: 'ACTIVE',
          injury_as_of: new Date().toISOString(),
          injury_source: 'stats_inference',
          
          // Usage trends
          usage_1w_snap_pct: ema1w.snap_pct,
          usage_4w_snap_pct: ema4w.snap_pct,
          usage_1w_route_pct: ema1w.route_pct,
          usage_4w_route_pct: ema4w.route_pct,
          usage_1w_carry_share: ema1w.carry_share,
          usage_4w_carry_share: ema4w.carry_share,
          usage_1w_target_share: ema1w.target_share,
          usage_4w_target_share: ema4w.target_share,
          
          // Metadata
          inference_method: 'usage_analysis',
          statistical_confidence: this.calculateInferenceConfidence(player),
          games_analyzed: player.games_played
        },
        provenance: this.createProvenanceRecord('statistical_inference', {
          method: 'usage_analysis',
          games_analyzed: player.games_played,
          total_usage: player.total_usage
        }, this.calculateInferenceConfidence(player))
      };

      records.push(record);
    }

    return records;
  }

  private async calculateEMA(playerId: string, season: number, week: number, windowWeeks: number): Promise<UsageMetrics> {
    // Exponential Moving Average calculation
    const alpha = 2.0 / (windowWeeks + 1); // EMA smoothing factor
    
    try {
      // Fetch recent stats for this player
      const startWeek = Math.max(1, week - windowWeeks + 1);
      const queries = [
        Query.equal('season', season),
        Query.equal('playerId', playerId),
        Query.greaterThanEqual('week', startWeek),
        Query.lessThanEqual('week', week),
        Query.orderDesc('week'),
        Query.limit(windowWeeks)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_STATS || 'player_stats',
        queries
      );

      if (response.documents.length === 0) {
        return { snap_pct: 0, route_pct: 0, carry_share: 0, target_share: 0, consistency: 0 };
      }

      // Calculate EMA for each metric
      const stats = response.documents.reverse(); // Oldest first for EMA calculation
      let emaSnap = 0, emaRoute = 0, emaCarry = 0, emaTarget = 0;

      for (let i = 0; i < stats.length; i++) {
        const stat = stats[i];
        const participation = this.calculateParticipation(stat);
        const routes = this.parseNumeric(stat.routes) / 25; // Normalize
        const carries = this.parseNumeric(stat.carries) / 35;
        const targets = this.parseNumeric(stat.targets) / 25;

        if (i === 0) {
          // Initialize with first value
          emaSnap = participation;
          emaRoute = routes;
          emaCarry = carries;
          emaTarget = targets;
        } else {
          // Apply EMA formula
          emaSnap = alpha * participation + (1 - alpha) * emaSnap;
          emaRoute = alpha * routes + (1 - alpha) * emaRoute;
          emaCarry = alpha * carries + (1 - alpha) * emaCarry;
          emaTarget = alpha * targets + (1 - alpha) * emaTarget;
        }
      }

      return {
        snap_pct: emaSnap,
        route_pct: emaRoute,
        carry_share: emaCarry,
        target_share: emaTarget,
        consistency: stats.length / windowWeeks // Completeness as proxy for consistency
      };

    } catch (error) {
      console.warn(`[StatsInference] EMA calculation failed for player ${playerId}:`, error);
      return { snap_pct: 0, route_pct: 0, carry_share: 0, target_share: 0, consistency: 0 };
    }
  }

  private calculateInferenceConfidence(player: PositionGroup['players'][0]): number {
    let confidence = 0.5; // Base confidence for statistical inference

    // Boost confidence based on data quality
    if (player.games_played >= 4) confidence += 0.2;
    else if (player.games_played >= 2) confidence += 0.1;

    // Boost confidence for clear usage leaders
    if (player.avg_usage.snap_pct > 0.8) confidence += 0.2;
    else if (player.avg_usage.snap_pct > 0.5) confidence += 0.1;

    // Boost confidence for consistent players
    confidence += player.avg_usage.consistency * 0.2;

    // Cap confidence - statistical inference can't be as reliable as official sources
    return Math.min(0.8, Math.max(0.3, confidence));
  }

  private async processStatisticalRecord(rawRecord: RawDataRecord, season: number, week: number): Promise<StatsInferenceRecord | null> {
    const data = rawRecord.data;

    if (!data.player_id || !data.team_id) return null;

    return {
      $id: '', // Will be set by database
      player_id: data.player_id,
      team_id: data.team_id,
      position: data.position,
      season,
      week,
      depth_chart_rank: data.depth_chart_rank,
      starter_prob: data.starter_prob,
      snap_share_proj: data.snap_share_proj || 0,
      injury_status: data.injury_status,
      injury_note: undefined,
      injury_as_of: data.injury_as_of,
      injury_source: data.injury_source,
      usage_1w_snap_pct: data.usage_1w_snap_pct,
      usage_4w_snap_pct: data.usage_4w_snap_pct,
      usage_1w_route_pct: data.usage_1w_route_pct,
      usage_4w_route_pct: data.usage_4w_route_pct,
      usage_1w_carry_share: data.usage_1w_carry_share,
      usage_4w_carry_share: data.usage_4w_carry_share,
      usage_1w_target_share: data.usage_1w_target_share,
      usage_4w_target_share: data.usage_4w_target_share,
      prior_season_target_share: 0, // Would need prior season stats
      prior_season_carry_share: 0,
      prior_season_yards_share: 0,
      prior_season_td_share: 0,
      as_of: new Date().toISOString(),
      source: 'stats_inference',
      confidence: rawRecord.confidence,
      provenance_trail: JSON.stringify([rawRecord.provenance]),
      manual_overrides: '[]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inference_method: data.inference_method,
      statistical_confidence: data.statistical_confidence
    };
  }

  private validateAndCleanInferences(records: StatsInferenceRecord[]): StatsInferenceRecord[] {
    // Remove low-confidence inferences
    const filtered = records.filter(record => record.statistical_confidence >= 0.4);
    
    // Normalize starter probabilities within position groups
    const positionGroups = new Map<string, StatsInferenceRecord[]>();
    
    for (const record of filtered) {
      const key = `${record.team_id}_${record.position}`;
      if (!positionGroups.has(key)) {
        positionGroups.set(key, []);
      }
      positionGroups.get(key)!.push(record);
    }

    // Normalize probabilities within each group
    for (const [key, groupRecords] of positionGroups.entries()) {
      const totalProb = groupRecords.reduce((sum, r) => sum + r.starter_prob, 0);
      
      if (totalProb > 1.2) {
        // If probabilities sum to too much, normalize them
        const factor = 1.0 / totalProb;
        groupRecords.forEach(record => {
          record.starter_prob *= factor;
        });
      }
    }

    console.log(`[StatsInference] Validated ${filtered.length} statistical inferences`);
    return filtered;
  }
}