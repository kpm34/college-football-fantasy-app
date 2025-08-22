/**
 * Data Loader for Projection Evaluation
 * Loads predictions and ground truth from Appwrite collections
 */

import { Databases, Query } from 'node-appwrite';
import { WeekRange, PlayerProjection, ActualPerformance, ScoringRules } from './types';

export class ProjectionDataLoader {
  constructor(
    private databases: Databases,
    private databaseId: string
  ) {}

  /**
   * Load weekly projections for evaluation period
   */
  async loadWeeklyProjections(weekRange: WeekRange): Promise<PlayerProjection[]> {
    const projections: PlayerProjection[] = [];
    
    console.log(`📊 Loading weekly projections for ${weekRange.startSeason}W${weekRange.startWeek} to ${weekRange.endSeason}W${weekRange.endWeek}`);
    
    // Query projections_weekly collection
    const queries = [
      Query.greaterThanEqual('season', weekRange.startSeason),
      Query.lessThanEqual('season', weekRange.endSeason),
      Query.limit(5000)
    ];
    
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'projections_weekly',
        queries
      );
      
      for (const doc of response.documents) {
        // Filter by week range (more precise than season-level query)
        if (this.isWeekInRange(doc.season, doc.week, weekRange)) {
          projections.push({
            player_id: doc.player_id,
            season: doc.season,
            week: doc.week,
            position: doc.position || 'UNKNOWN',
            team_id: doc.team_id,
            fantasy_points_simple: doc.fantasy_points_simple || 0,
            range_floor: doc.range_floor,
            range_median: doc.range_median,
            range_ceiling: doc.range_ceiling,
            volatility_score: doc.volatility_score,
            injury_risk: doc.injury_risk
          });
        }
      }
      
      console.log(`✅ Loaded ${projections.length} weekly projections`);
      return projections;
      
    } catch (error) {
      console.error('❌ Error loading weekly projections:', error);
      throw error;
    }
  }

  /**
   * Load yearly projections (for season-long evaluation)
   */
  async loadYearlyProjections(seasons: number[]): Promise<PlayerProjection[]> {
    const projections: PlayerProjection[] = [];
    
    console.log(`📊 Loading yearly projections for seasons: ${seasons.join(', ')}`);
    
    const queries = [
      Query.equal('season', seasons),
      Query.limit(5000)
    ];
    
    try {
      const response = await this.databases.listDocuments(
        this.databaseId,
        'projections_yearly',
        queries
      );
      
      for (const doc of response.documents) {
        projections.push({
          player_id: doc.player_id,
          season: doc.season,
          position: doc.position || 'UNKNOWN',
          team_id: doc.team_id,
          fantasy_points_simple: doc.fantasy_points_simple || 0,
          range_floor: doc.range_floor,
          range_median: doc.range_median,
          range_ceiling: doc.range_ceiling,
          volatility_score: doc.volatility_score,
          injury_risk: doc.injury_risk
        });
      }
      
      console.log(`✅ Loaded ${projections.length} yearly projections`);
      return projections;
      
    } catch (error) {
      console.error('❌ Error loading yearly projections:', error);
      throw error;
    }
  }

  /**
   * Load actual performance data (ground truth)
   */
  async loadActualPerformance(weekRange: WeekRange): Promise<ActualPerformance[]> {
    const performances: ActualPerformance[] = [];
    
    console.log(`📊 Loading actual performance data for ${weekRange.startSeason}W${weekRange.startWeek} to ${weekRange.endSeason}W${weekRange.endWeek}`);
    
    // First try to load from scoring collection (if available)
    try {
      const scoringData = await this.loadFromScoring(weekRange);
      if (scoringData.length > 0) {
        performances.push(...scoringData);
        console.log(`✅ Loaded ${scoringData.length} records from scoring collection`);
        return performances;
      }
    } catch (error) {
      console.warn('⚠️ Scoring collection not available, falling back to player stats');
    }
    
    // Fallback: Load from player_stats collection
    try {
      const playerStats = await this.loadFromPlayerStats(weekRange);
      performances.push(...playerStats);
      console.log(`✅ Loaded ${playerStats.length} records from player_stats collection`);
      return performances;
    } catch (error) {
      console.warn('⚠️ Player stats collection not available');
    }
    
    // If no dedicated collections, try to derive from games and existing data
    console.log('⚠️ No dedicated performance data found. You may need to populate scoring/player_stats collections.');
    return performances;
  }

  /**
   * Load scoring rules from a specific league
   */
  async loadScoringRules(leagueId?: string): Promise<ScoringRules> {
    if (!leagueId) {
      // Return default PPR scoring
      return this.getDefaultScoringRules();
    }
    
    try {
      const league = await this.databases.getDocument(
        this.databaseId,
        'leagues',
        leagueId
      );
      
      if (league.scoringRules) {
        const rules = typeof league.scoringRules === 'string' 
          ? JSON.parse(league.scoringRules)
          : league.scoringRules;
        
        return this.validateScoringRules(rules);
      }
    } catch (error) {
      console.warn(`⚠️ Could not load scoring rules for league ${leagueId}, using defaults`);
    }
    
    return this.getDefaultScoringRules();
  }

  /**
   * Private helper methods
   */
  private isWeekInRange(season: number, week: number, range: WeekRange): boolean {
    if (season < range.startSeason || season > range.endSeason) {
      return false;
    }
    
    if (season === range.startSeason && week < range.startWeek) {
      return false;
    }
    
    if (season === range.endSeason && week > range.endWeek) {
      return false;
    }
    
    return true;
  }

  private async loadFromScoring(weekRange: WeekRange): Promise<ActualPerformance[]> {
    const performances: ActualPerformance[] = [];
    
    const queries = [
      Query.greaterThanEqual('week', weekRange.startWeek),
      Query.lessThanEqual('week', weekRange.endWeek),
      Query.limit(5000)
    ];
    
    const response = await this.databases.listDocuments(
      this.databaseId,
      'scoring',
      queries
    );
    
    for (const doc of response.documents) {
      // Map scoring collection to ActualPerformance
      performances.push({
        player_id: doc.playerId,
        season: doc.season || 2025, // Default to current season
        week: doc.week,
        position: doc.position || 'UNKNOWN',
        team: doc.team || 'UNKNOWN',
        actual_fantasy_points: doc.fantasyPoints || 0,
        passing_yards: doc.passingYards,
        rushing_yards: doc.rushingYards,
        receiving_yards: doc.receivingYards,
        touchdowns: (doc.passingTDs || 0) + (doc.rushingTDs || 0) + (doc.receivingTDs || 0),
        interceptions: doc.interceptions,
        game_completed: true
      });
    }
    
    return performances;
  }

  private async loadFromPlayerStats(weekRange: WeekRange): Promise<ActualPerformance[]> {
    const performances: ActualPerformance[] = [];
    
    const queries = [
      Query.greaterThanEqual('week', weekRange.startWeek),
      Query.lessThanEqual('week', weekRange.endWeek),
      Query.limit(5000)
    ];
    
    const response = await this.databases.listDocuments(
      this.databaseId,
      'player_stats',
      queries
    );
    
    for (const doc of response.documents) {
      performances.push({
        player_id: doc.playerId,
        season: doc.season || 2025,
        week: doc.week,
        position: 'UNKNOWN', // May need to look up from player
        team: 'UNKNOWN',
        actual_fantasy_points: doc.fantasy_points || 0,
        game_completed: doc.eligible !== false
      });
    }
    
    return performances;
  }

  private getDefaultScoringRules(): ScoringRules {
    return {
      passing_yards_per_point: 25, // 1 point per 25 passing yards
      rushing_yards_per_point: 10, // 1 point per 10 rushing yards
      receiving_yards_per_point: 10, // 1 point per 10 receiving yards
      passing_td: 4,
      rushing_td: 6,
      receiving_td: 6,
      interception: -2,
      fumble: -2,
      field_goal: 3,
      extra_point: 1
    };
  }

  private validateScoringRules(rules: any): ScoringRules {
    const defaults = this.getDefaultScoringRules();
    
    return {
      passing_yards_per_point: rules.passing_yards_per_point || defaults.passing_yards_per_point,
      rushing_yards_per_point: rules.rushing_yards_per_point || defaults.rushing_yards_per_point,
      receiving_yards_per_point: rules.receiving_yards_per_point || defaults.receiving_yards_per_point,
      passing_td: rules.passing_td || defaults.passing_td,
      rushing_td: rules.rushing_td || defaults.rushing_td,
      receiving_td: rules.receiving_td || defaults.receiving_td,
      interception: rules.interception || defaults.interception,
      fumble: rules.fumble || defaults.fumble,
      field_goal: rules.field_goal || defaults.field_goal,
      extra_point: rules.extra_point || defaults.extra_point
    };
  }
}