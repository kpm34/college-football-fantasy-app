import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface TeamContext {
  team: string;
  opponent?: string;
  home_away: 'H' | 'A' | 'N';
  pace: number;
  estimated_team_total: number;
  pass_rate: number;
  red_zone_rate: number;
}

interface TeamVolumes {
  pass_yards: number;
  rush_yards: number;
  pass_tds: number;
  rush_tds: number;
  rec_targets: number;
  total_plays: number;
}

interface PlayerData {
  player_id: string;
  name: string;
  position: string;
  team: string;
  depth_chart_rank: number;
  injury_status?: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out';
  is_starter: boolean;
  returning_production?: {
    yards_share: number;
    td_share: number;
  };
}

/**
 * Weekly Projections Builder following the pseudo code structure
 * Adapts to Appwrite collections: college_players, rosters, player_stats, games, etc.
 */
export class WeeklyProjectionsBuilder {

  /**
   * Main function to build weekly projections
   * FUNCTION build_weekly_projections(season, week)
   */
  static async build_weekly_projections(season: number, week: number): Promise<string> {
    console.log(`🏈 Building weekly projections for Season ${season}, Week ${week}`);

    const teams = await this.list_all_teams();
    
    for (const team of teams) {
      try {
        console.log(`📊 Processing ${team}...`);

        // Load data for this team
        const roster = await this.load_team_roster(team, season, week);
        const team_ctx = await this.load_team_context(team, season, week);
        const hist = await this.load_historical_stats(team, season, week);
        const injuries = await this.load_injury_and_status(team, week);

        // Estimate team volumes
        const team_volumes = this.estimate_team_volumes(team_ctx, hist);

        // Allocate by position
        const qb_proj = this.allocate_position("QB", roster, team_volumes, hist, injuries);
        const rb_proj = this.allocate_position("RB", roster, team_volumes, hist, injuries);
        const wr_proj = this.allocate_position("WR", roster, team_volumes, hist, injuries);
        const te_proj = this.allocate_position("TE", roster, team_volumes, hist, injuries);

        // Merge all projections
        let projections = [...qb_proj, ...rb_proj, ...wr_proj, ...te_proj];

        // Apply caps and calibration
        projections = this.enforce_position_caps(projections);
        projections = this.apply_calibration(projections);

        // Save to Appwrite
        await this.save_projections_to_appwrite(team, season, week, projections);

      } catch (error) {
        console.error(`Error processing ${team}:`, error);
      }
    }

    console.log('✅ Weekly projections build completed');
    return "done";
  }

  /**
   * Get all Power 4 teams
   */
  private static async list_all_teams(): Promise<string[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.limit(200)]
      );
      
      return response.documents
        .filter(team => ['SEC', 'ACC', 'Big Ten', 'Big 12'].includes(team.conference))
        .map(team => team.name || team.school);
    } catch (error) {
      console.error('Error listing teams:', error);
      return [];
    }
  }

  /**
   * Load team roster from college_players and rosters collections
   * load_team_roster(team, season, week)
   */
  private static async load_team_roster(team: string, season: number, week: number): Promise<PlayerData[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS, // college_players collection
        [
          Query.equal('team', team),
          Query.limit(100)
        ]
      );

      return response.documents.map(player => ({
        player_id: player.$id,
        name: `${player.firstName || player.first_name || ''} ${player.lastName || player.last_name || ''}`.trim(),
        position: player.position,
        team: player.team,
        depth_chart_rank: player.depth || player.depth_chart_rank || 1,
        injury_status: player.injury_status || 'Healthy',
        is_starter: player.is_starter || player.depth === 1,
        returning_production: {
          yards_share: player.returning_yards_share || 0,
          td_share: player.returning_td_share || 0
        }
      }));
    } catch (error) {
      console.error(`Error loading roster for ${team}:`, error);
      return [];
    }
  }

  /**
   * Load team context (schedule, opponent, pace, etc.)
   * load_team_context(team, season, week)
   */
  private static async load_team_context(team: string, season: number, week: number): Promise<TeamContext> {
    try {
      // Get this week's game
      const gamesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [
          Query.equal('week', week),
          Query.equal('season', season),
          Query.or([
            Query.equal('home_team', team),
            Query.equal('away_team', team)
          ]),
          Query.limit(1)
        ]
      );

      let opponent = '';
      let home_away: 'H' | 'A' | 'N' = 'N';
      let estimated_team_total = 24; // Default

      if (gamesResponse.documents.length > 0) {
        const game = gamesResponse.documents[0];
        if (game.home_team === team) {
          opponent = game.away_team;
          home_away = 'H';
        } else {
          opponent = game.home_team;
          home_away = 'A';
        }
        estimated_team_total = game.home_points || game.away_points || 24;
      }

      // Get team pace and tendencies (from team stats or defaults)
      const pace = 70; // Default plays per game
      const pass_rate = 0.55; // Default pass rate
      const red_zone_rate = 0.20; // Default red zone rate

      return {
        team,
        opponent,
        home_away,
        pace,
        estimated_team_total,
        pass_rate,
        red_zone_rate
      };
    } catch (error) {
      console.error(`Error loading team context for ${team}:`, error);
      return {
        team,
        home_away: 'N',
        pace: 70,
        estimated_team_total: 24,
        pass_rate: 0.55,
        red_zone_rate: 0.20
      };
    }
  }

  /**
   * Load historical stats and usage patterns
   * load_historical_stats(team, season, week)
   */
  private static async load_historical_stats(team: string, season: number, week: number): Promise<any> {
    try {
      // Get recent player stats for usage patterns
      const statsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_STATS,
        [
          Query.equal('team', team),
          Query.equal('season', season),
          Query.lessThan('week', week),
          Query.limit(200)
        ]
      );

      // Process into usage patterns by player
      const usage: Record<string, any> = {};
      
      for (const stat of statsResponse.documents) {
        const playerId = stat.player_id;
        if (!usage[playerId]) {
          usage[playerId] = {
            games: 0,
            total_yards: 0,
            total_tds: 0,
            target_share: 0,
            rush_share: 0
          };
        }
        
        usage[playerId].games++;
        usage[playerId].total_yards += (stat.passing_yards || 0) + (stat.rushing_yards || 0) + (stat.receiving_yards || 0);
        usage[playerId].total_tds += (stat.passing_tds || 0) + (stat.rushing_tds || 0) + (stat.receiving_tds || 0);
      }

      return { usage };
    } catch (error) {
      console.error(`Error loading historical stats for ${team}:`, error);
      return { usage: {} };
    }
  }

  /**
   * Load injury and status information
   * load_injury_and_status(team, week)
   */
  private static async load_injury_and_status(team: string, week: number): Promise<Record<string, any>> {
    // In a real implementation, this would check injury reports
    // For now, return empty since injury data structure isn't defined
    return {};
  }

  /**
   * Estimate team volumes based on context and history
   * estimate_team_volumes(team_ctx, hist)
   */
  private static estimate_team_volumes(team_ctx: TeamContext, hist: any): TeamVolumes {
    const { pace, pass_rate, estimated_team_total } = team_ctx;

    // Rough estimates based on team total and pace
    const total_plays = pace;
    const pass_plays = total_plays * pass_rate;
    const rush_plays = total_plays * (1 - pass_rate);

    // Volume estimates
    const pass_yards = pass_plays * 7.5; // ~7.5 yards per pass attempt
    const rush_yards = rush_plays * 4.5; // ~4.5 yards per rush attempt
    const pass_tds = Math.round(pass_plays * 0.045); // ~4.5% TD rate
    const rush_tds = Math.round(rush_plays * 0.055); // ~5.5% TD rate
    const rec_targets = Math.round(pass_plays * 1.1); // ~1.1 targets per pass play

    return {
      pass_yards,
      rush_yards,
      pass_tds,
      rush_tds,
      rec_targets,
      total_plays
    };
  }

  /**
   * Enhanced allocate_position function following the 7-step process
   * FUNCTION allocate_position(position, roster, team_volumes, hist, injuries)
   */
  private static allocate_position(
    position: string,
    roster: PlayerData[],
    team_volumes: TeamVolumes,
    hist: any,
    injuries: Record<string, any>
  ): any[] {
    // Filter players by position
    const players = roster.filter(p => p.position === position);
    if (players.length === 0) return [];

    console.log(`🔧 Allocating ${position} for ${players.length} players`);

    // 1) Depth weights from rank + status
    let weights = this.depth_chart_weights(players, position, injuries);
    console.log(`📊 Initial depth weights:`, weights.map((w, i) => `${players[i].name}: ${(w*100).toFixed(1)}%`));

    // 2) Returning production & recent usage adjustments
    weights = this.adjust_with_returning_production(weights, players, hist);
    weights = this.adjust_with_recent_usage(weights, players, hist);
    console.log(`📈 After usage adjustments:`, weights.map((w, i) => `${players[i].name}: ${(w*100).toFixed(1)}%`));

    // 3) Normalize weights (sum to 1) with floors
    weights = this.normalize_with_floors(weights, position);
    console.log(`⚖️  After normalization:`, weights.map((w, i) => `${players[i].name}: ${(w*100).toFixed(1)}%`));

    // 4) Convert team volume → player stat lines
    const player_stats = this.allocate_team_volume_to_players(position, team_volumes, weights, players);

    // 5) Convert stat lines → fantasy points
    let player_points = this.statlines_to_fantasy_points(position, player_stats);

    // 6) Add uncertainty bands (floor/median/ceiling)
    player_points = this.add_uncertainty_bands(player_points, position, hist);

    // 7) Add explainability (top feature/weight drivers)
    player_points = this.attach_explanations(player_points, weights, hist, players);

    console.log(`✅ ${position} allocation complete:`, player_points.map(p => `${p.player_name}: ${p.fantasy_points} pts`));

    return player_points;
  }

  /**
   * Get position-specific depth multipliers (from our enhanced system)
   */
  private static getPositionDepthMultiplier(position: string, rank: number): number {
    switch (position) {
      case 'QB':
        return [0.95, 0.05, 0.0][rank - 1] ?? 0.0;
      case 'RB':
        return [0.55, 0.25, 0.15, 0.025, 0.025][rank - 1] ?? 0.01;
      case 'WR':
        if (rank <= 4) {
          return [0.25, 0.20, 0.15, 0.10][rank - 1];
        } else {
          return 0.15; // WR5+ share remaining equally
        }
      case 'TE':
        return [0.7, 0.3, 0.0][rank - 1] ?? 0.0;
      default:
        return 1.0 / rank;
    }
  }

  /**
   * Calculate individual player projection
   */
  private static calculatePositionProjection(player: PlayerData, multiplier: number, teamVolumes: TeamVolumes): any {
    const projection: any = {
      player_id: player.player_id,
      player_name: player.name,
      position: player.position,
      team: player.team,
      depth_chart_rank: player.depth_chart_rank,
      share_multiplier: multiplier
    };

    switch (player.position) {
      case 'QB':
        projection.passing_yards = Math.round(teamVolumes.pass_yards * multiplier);
        projection.passing_tds = Math.round(teamVolumes.pass_tds * multiplier);
        projection.interceptions = Math.round(teamVolumes.pass_tds * 0.5 * multiplier); // Roughly half of TDs
        projection.rushing_yards = Math.round(teamVolumes.rush_yards * 0.15 * multiplier); // QB gets 15% of rush yards
        projection.rushing_tds = Math.round(teamVolumes.rush_tds * 0.10 * multiplier);
        break;

      case 'RB':
        projection.rushing_yards = Math.round(teamVolumes.rush_yards * 0.85 * multiplier); // 85% to RBs
        projection.rushing_tds = Math.round(teamVolumes.rush_tds * 0.90 * multiplier);
        projection.receptions = Math.round(teamVolumes.rec_targets * 0.20 * 0.7 * multiplier); // 20% targets, 70% catch rate
        projection.receiving_yards = Math.round(projection.receptions * 7); // 7 yards per catch
        projection.receiving_tds = Math.round(teamVolumes.rec_targets * 0.20 * 0.04 * multiplier); // 4% TD rate
        break;

      case 'WR':
        projection.receptions = Math.round(teamVolumes.rec_targets * 0.65 * 0.65 * multiplier); // 65% targets, 65% catch rate
        projection.receiving_yards = Math.round(projection.receptions * 12); // 12 yards per catch
        projection.receiving_tds = Math.round(teamVolumes.rec_targets * 0.65 * 0.06 * multiplier); // 6% TD rate
        break;

      case 'TE':
        projection.receptions = Math.round(teamVolumes.rec_targets * 0.15 * 0.7 * multiplier); // 15% targets, 70% catch rate
        projection.receiving_yards = Math.round(projection.receptions * 10); // 10 yards per catch
        projection.receiving_tds = Math.round(teamVolumes.rec_targets * 0.15 * 0.05 * multiplier); // 5% TD rate
        break;
    }

    // Calculate fantasy points
    projection.fantasy_points = this.calculateFantasyPoints(projection);

    return projection;
  }

  /**
   * Calculate fantasy points from projection stats
   */
  private static calculateFantasyPoints(projection: any): number {
    let points = 0;
    points += (projection.passing_yards || 0) * 0.04; // 1 pt per 25 yards
    points += (projection.passing_tds || 0) * 4;
    points += (projection.interceptions || 0) * -2;
    points += (projection.rushing_yards || 0) * 0.1; // 1 pt per 10 yards
    points += (projection.rushing_tds || 0) * 6;
    points += (projection.receiving_yards || 0) * 0.1;
    points += (projection.receiving_tds || 0) * 6;
    points += (projection.receptions || 0) * 1; // PPR
    
    return Math.round(points * 10) / 10;
  }

  /**
   * Enforce position caps (backup limits, min/max guards)
   * enforce_position_caps(projections)
   */
  private static enforce_position_caps(projections: any[]): any[] {
    // Group by team and position
    const teamPosGroups: Record<string, any[]> = {};
    
    for (const proj of projections) {
      const key = `${proj.team}_${proj.position}`;
      if (!teamPosGroups[key]) teamPosGroups[key] = [];
      teamPosGroups[key].push(proj);
    }

    // Apply caps to each group
    for (const [key, group] of Object.entries(teamPosGroups)) {
      const [team, position] = key.split('_');
      this.applyCapsToGroup(group, position);
    }

    return projections;
  }

  /**
   * Apply caps to a position group
   */
  private static applyCapsToGroup(group: any[], position: string): void {
    group.sort((a, b) => b.fantasy_points - a.fantasy_points);
    
    if (group.length === 0) return;
    
    const starter = group[0];
    const starterPoints = starter.fantasy_points;

    for (let i = 1; i < group.length; i++) {
      const player = group[i];
      let maxPoints = starterPoints;

      switch (position) {
        case 'QB':
          maxPoints = i === 1 ? starterPoints * 0.25 : starterPoints * 0.05;
          break;
        case 'RB':
          if (i >= 3) maxPoints = starterPoints * 0.10;
          break;
        case 'WR':
          if (i >= 4) maxPoints = starterPoints * 0.10;
          break;
        case 'TE':
          if (i >= 2) maxPoints = starterPoints * 0.05;
          break;
      }

      if (player.fantasy_points > maxPoints) {
        const scaleFactor = maxPoints / player.fantasy_points;
        this.scaleProjectionStats(player, scaleFactor);
      }
    }
  }

  /**
   * Scale projection stats by a factor
   */
  private static scaleProjectionStats(projection: any, factor: number): void {
    const statsToScale = ['passing_yards', 'passing_tds', 'interceptions', 'rushing_yards', 
                         'rushing_tds', 'receiving_yards', 'receiving_tds', 'receptions'];
    
    for (const stat of statsToScale) {
      if (projection[stat]) {
        projection[stat] = Math.round(projection[stat] * factor);
      }
    }
    
    projection.fantasy_points = this.calculateFantasyPoints(projection);
  }

  /**
   * Apply calibration (optional mapping)
   * apply_calibration(projections)
   */
  private static apply_calibration(projections: any[]): any[] {
    // Optional calibration step - could adjust based on historical accuracy
    // For now, return as-is
    return projections;
  }

  /**
   * Save projections to Appwrite
   * save_projections_to_appwrite(team, season, week, projections)
   */
  private static async save_projections_to_appwrite(
    team: string, 
    season: number, 
    week: number, 
    projections: any[]
  ): Promise<void> {
    try {
      for (const projection of projections) {
        const docData = {
          player_id: projection.player_id,
          season,
          week,
          team,
          position: projection.position,
          
          // Simple projections
          statline_simple: {
            passing_yards: projection.passing_yards || undefined,
            passing_tds: projection.passing_tds || undefined,
            interceptions: projection.interceptions || undefined,
            rushing_yards: projection.rushing_yards || undefined,
            rushing_tds: projection.rushing_tds || undefined,
            receiving_yards: projection.receiving_yards || undefined,
            receiving_tds: projection.receiving_tds || undefined,
            receptions: projection.receptions || undefined
          },
          fantasy_points_simple: projection.fantasy_points,
          
          // Metadata
          depth_chart_rank: projection.depth_chart_rank,
          share_multiplier: projection.share_multiplier,
          
          updatedAt: new Date().toISOString()
        };

        // Check if projection exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PROJECTIONS_WEEKLY || 'projections_weekly',
          [
            Query.equal('player_id', projection.player_id),
            Query.equal('season', season),
            Query.equal('week', week),
            Query.limit(1)
          ]
        );

        if (existing.documents.length > 0) {
          // Update existing
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTIONS_WEEKLY || 'projections_weekly',
            existing.documents[0].$id,
            docData
          );
        } else {
          // Create new
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTIONS_WEEKLY || 'projections_weekly',
            'unique()',
            docData
          );
        }
      }
      
      console.log(`✅ Saved ${projections.length} projections for ${team}`);
    } catch (error) {
      console.error(`Error saving projections for ${team}:`, error);
    }
  }

  // ===== 7-STEP ALLOCATION METHODS =====

  /**
   * Step 1: Depth chart weights from rank + injury status
   * depth_chart_weights(players, position, injuries)
   */
  private static depth_chart_weights(players: PlayerData[], position: string, injuries: Record<string, any>): number[] {
    const weights: number[] = [];
    
    // Sort by depth chart rank first
    const sortedPlayers = [...players].sort((a, b) => a.depth_chart_rank - b.depth_chart_rank);
    
    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      const rank = i + 1; // 1-indexed rank after sorting
      
      // Get base multiplier
      let baseWeight = this.getPositionDepthMultiplier(position, rank);
      
      // Adjust for injury status
      const injuryStatus = player.injury_status || 'Healthy';
      switch (injuryStatus) {
        case 'Out':
          baseWeight = 0.0;
          break;
        case 'Doubtful':
          baseWeight *= 0.25;
          break;
        case 'Questionable':
          baseWeight *= 0.75;
          break;
        // Healthy players get full weight
      }
      
      weights.push(baseWeight);
    }
    
    // Map back to original player order
    const originalOrderWeights = new Array(players.length);
    for (let i = 0; i < sortedPlayers.length; i++) {
      const originalIndex = players.findIndex(p => p.player_id === sortedPlayers[i].player_id);
      originalOrderWeights[originalIndex] = weights[i];
    }
    
    return originalOrderWeights;
  }

  /**
   * Step 2a: Adjust weights with returning production
   * adjust_with_returning_production(weights, players, hist)
   */
  private static adjust_with_returning_production(weights: number[], players: PlayerData[], hist: any): number[] {
    const adjustedWeights = [...weights];
    let totalAdjustment = 0;
    
    // First pass: identify high returning production players
    const adjustments: number[] = new Array(players.length).fill(0);
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const returning = player.returning_production;
      
      if (returning && (returning.yards_share > 0.20 || returning.td_share > 0.20)) {
        // Add +0.05 boost for high returning production
        adjustments[i] = 0.05;
        totalAdjustment += 0.05;
        console.log(`📈 Returning production boost for ${player.name}: +${adjustments[i]}`);
      }
    }
    
    // Second pass: apply adjustments and redistribute
    if (totalAdjustment > 0) {
      const playersToAdjustDown = players.length - adjustments.filter(adj => adj > 0).length;
      const redistributeAmount = totalAdjustment / Math.max(1, playersToAdjustDown);
      
      for (let i = 0; i < players.length; i++) {
        if (adjustments[i] > 0) {
          adjustedWeights[i] += adjustments[i];
        } else {
          adjustedWeights[i] = Math.max(0, adjustedWeights[i] - redistributeAmount);
        }
      }
    }
    
    return adjustedWeights;
  }

  /**
   * Step 2b: Adjust weights with recent usage (1w & 4w EMAs)
   * adjust_with_recent_usage(weights, players, hist)
   */
  private static adjust_with_recent_usage(weights: number[], players: PlayerData[], hist: any): number[] {
    const adjustedWeights = [...weights];
    
    // For now, use historical usage patterns from hist.usage
    if (hist.usage) {
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const usage = hist.usage[player.player_id];
        
        if (usage && usage.games > 0) {
          // Simple recent usage adjustment based on touches/targets trend
          const avgYardsPerGame = usage.total_yards / usage.games;
          const avgTDsPerGame = usage.total_tds / usage.games;
          
          // Players trending up get small boost, down get small penalty
          if (avgYardsPerGame > 50 || avgTDsPerGame > 0.5) {
            adjustedWeights[i] *= 1.05; // 5% boost for hot players
            console.log(`🔥 Recent usage boost for ${player.name}: +5%`);
          } else if (avgYardsPerGame < 10 && avgTDsPerGame < 0.1) {
            adjustedWeights[i] *= 0.95; // 5% penalty for cold players
            console.log(`🧊 Recent usage penalty for ${player.name}: -5%`);
          }
        }
      }
    }
    
    return adjustedWeights;
  }

  /**
   * Step 3: Normalize weights (sum to 1) with floors
   * normalize_with_floors(weights, position)
   */
  private static normalize_with_floors(weights: number[], position: string): number[] {
    if (weights.length === 0) return weights;
    
    // Apply position-specific floors
    const floors = this.getPositionFloors(position, weights.length);
    
    // Ensure no weight is below its floor
    const flooredWeights = weights.map((w, i) => Math.max(w, floors[i]));
    
    // Normalize so they sum to 1.0
    const sum = flooredWeights.reduce((acc, w) => acc + w, 0);
    
    if (sum === 0) {
      // Fallback: equal distribution
      return new Array(weights.length).fill(1 / weights.length);
    }
    
    return flooredWeights.map(w => w / sum);
  }

  /**
   * Get position-specific minimum floors
   */
  private static getPositionFloors(position: string, playerCount: number): number[] {
    const floors: number[] = new Array(playerCount).fill(0);
    
    switch (position) {
      case 'QB':
        // QB1 minimum 80%, QB2 minimum 2%
        if (playerCount >= 1) floors[0] = 0.80;
        if (playerCount >= 2) floors[1] = 0.02;
        break;
        
      case 'RB':
        // RB1 minimum 30%, RB2 minimum 15%, RB3 minimum 8%
        if (playerCount >= 1) floors[0] = 0.30;
        if (playerCount >= 2) floors[1] = 0.15;
        if (playerCount >= 3) floors[2] = 0.08;
        break;
        
      case 'WR':
        // More distributed, but WR1 gets minimum 15%
        if (playerCount >= 1) floors[0] = 0.15;
        if (playerCount >= 2) floors[1] = 0.12;
        if (playerCount >= 3) floors[2] = 0.10;
        if (playerCount >= 4) floors[3] = 0.08;
        break;
        
      case 'TE':
        // TE1 minimum 50%, TE2 minimum 20%
        if (playerCount >= 1) floors[0] = 0.50;
        if (playerCount >= 2) floors[1] = 0.20;
        break;
    }
    
    return floors;
  }

  /**
   * Step 4: Convert team volume → player stat lines
   * allocate_team_volume_to_players(position, team_volumes, weights, players)
   */
  private static allocate_team_volume_to_players(
    position: string, 
    team_volumes: TeamVolumes, 
    weights: number[], 
    players: PlayerData[]
  ): any[] {
    const playerStats: any[] = [];
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const weight = weights[i];
      
      const stats: any = {
        player_id: player.player_id,
        player_name: player.name,
        position: player.position,
        team: player.team,
        depth_chart_rank: player.depth_chart_rank,
        weight_share: weight
      };
      
      // Allocate stats based on position
      switch (position) {
        case 'QB':
          stats.passing_yards = Math.round(team_volumes.pass_yards * weight);
          stats.passing_tds = Math.round(team_volumes.pass_tds * weight);
          stats.passing_attempts = Math.round(stats.passing_yards / 7.5);
          stats.interceptions = Math.round(stats.passing_attempts * 0.025);
          // QB rushing (15% of team rushing)
          stats.rushing_yards = Math.round(team_volumes.rush_yards * 0.15 * weight);
          stats.rushing_attempts = Math.round(stats.rushing_yards / 4.5);
          stats.rushing_tds = Math.round(team_volumes.rush_tds * 0.10 * weight);
          break;
          
        case 'RB':
          // RBs get 85% of team rushing
          stats.rushing_yards = Math.round(team_volumes.rush_yards * 0.85 * weight);
          stats.rushing_attempts = Math.round(stats.rushing_yards / 4.5);
          stats.rushing_tds = Math.round(team_volumes.rush_tds * 0.90 * weight);
          // RBs get 20% of targets
          stats.targets = Math.round(team_volumes.rec_targets * 0.20 * weight);
          stats.receptions = Math.round(stats.targets * 0.75); // 75% catch rate
          stats.receiving_yards = Math.round(stats.receptions * 7.0); // 7 YAC
          stats.receiving_tds = Math.round(stats.targets * 0.04); // 4% red zone rate
          break;
          
        case 'WR':
          // WRs get 65% of targets
          stats.targets = Math.round(team_volumes.rec_targets * 0.65 * weight);
          stats.receptions = Math.round(stats.targets * 0.65); // 65% catch rate
          stats.receiving_yards = Math.round(stats.receptions * 12.0); // 12 YAC
          stats.receiving_tds = Math.round(stats.targets * 0.06); // 6% red zone rate
          break;
          
        case 'TE':
          // TEs get 15% of targets
          stats.targets = Math.round(team_volumes.rec_targets * 0.15 * weight);
          stats.receptions = Math.round(stats.targets * 0.70); // 70% catch rate
          stats.receiving_yards = Math.round(stats.receptions * 10.0); // 10 YAC
          stats.receiving_tds = Math.round(stats.targets * 0.05); // 5% red zone rate
          break;
      }
      
      playerStats.push(stats);
    }
    
    return playerStats;
  }

  /**
   * Step 5: Convert stat lines → fantasy points
   * statlines_to_fantasy_points(position, player_stats)
   */
  private static statlines_to_fantasy_points(position: string, player_stats: any[]): any[] {
    return player_stats.map(stats => {
      let fantasy_points = 0;
      
      // Passing stats (1 pt per 25 yards, 4 pts per TD, -2 per INT)
      fantasy_points += (stats.passing_yards || 0) * 0.04;
      fantasy_points += (stats.passing_tds || 0) * 4;
      fantasy_points += (stats.interceptions || 0) * -2;
      
      // Rushing stats (1 pt per 10 yards, 6 pts per TD)
      fantasy_points += (stats.rushing_yards || 0) * 0.1;
      fantasy_points += (stats.rushing_tds || 0) * 6;
      
      // Receiving stats (1 pt per 10 yards, 6 pts per TD, 1 pt per catch - PPR)
      fantasy_points += (stats.receiving_yards || 0) * 0.1;
      fantasy_points += (stats.receiving_tds || 0) * 6;
      fantasy_points += (stats.receptions || 0) * 1; // PPR
      
      // Bonus points for big games
      if (stats.passing_yards >= 300) fantasy_points += 3;
      if (stats.rushing_yards >= 100) fantasy_points += 3;
      if (stats.receiving_yards >= 100) fantasy_points += 3;
      
      return {
        ...stats,
        fantasy_points: Math.round(fantasy_points * 10) / 10
      };
    });
  }

  /**
   * Step 6: Add uncertainty bands (floor/median/ceiling)
   * add_uncertainty_bands(player_points, position, hist)
   */
  private static add_uncertainty_bands(player_points: any[], position: string, hist: any): any[] {
    return player_points.map(player => {
      const basePoints = player.fantasy_points;
      
      // Position-specific volatility
      let volatility = 0.3; // Default 30% volatility
      switch (position) {
        case 'QB': volatility = 0.25; break; // QBs more consistent
        case 'RB': volatility = 0.35; break; // RBs more volatile
        case 'WR': volatility = 0.40; break; // WRs most volatile
        case 'TE': volatility = 0.35; break;
      }
      
      // Adjust volatility based on depth (backups more volatile)
      if (player.depth_chart_rank > 1) {
        volatility *= 1.5;
      }
      
      // Calculate bands
      const floor = Math.max(0, basePoints * (1 - volatility));
      const ceiling = basePoints * (1 + volatility);
      
      return {
        ...player,
        fantasy_points_floor: Math.round(floor * 10) / 10,
        fantasy_points_median: basePoints,
        fantasy_points_ceiling: Math.round(ceiling * 10) / 10,
        volatility_score: Math.round(volatility * 100)
      };
    });
  }

  /**
   * Step 7: Add explainability (top feature/weight drivers)
   * attach_explanations(player_points, weights, hist, players)
   */
  private static attach_explanations(player_points: any[], weights: number[], hist: any, players: PlayerData[]): any[] {
    return player_points.map((player, index) => {
      const playerData = players[index];
      const weight = weights[index];
      
      const explanations: string[] = [];
      
      // Depth chart explanation
      if (playerData.depth_chart_rank === 1) {
        explanations.push(`Starter (${(weight * 100).toFixed(1)}% share)`);
      } else {
        explanations.push(`Depth ${playerData.depth_chart_rank} (${(weight * 100).toFixed(1)}% share)`);
      }
      
      // Returning production
      if (playerData.returning_production) {
        const { yards_share, td_share } = playerData.returning_production;
        if (yards_share > 0.20 || td_share > 0.20) {
          explanations.push(`High returning production (${(Math.max(yards_share, td_share) * 100).toFixed(1)}%)`);
        }
      }
      
      // Injury status
      if (playerData.injury_status && playerData.injury_status !== 'Healthy') {
        explanations.push(`Injury concern: ${playerData.injury_status}`);
      }
      
      // Performance tier
      if (player.fantasy_points > 15) {
        explanations.push('High-volume role');
      } else if (player.fantasy_points > 8) {
        explanations.push('Moderate role');
      } else {
        explanations.push('Limited role');
      }
      
      return {
        ...player,
        explanations,
        primary_factor: explanations[0] || 'Depth chart position'
      };
    });
  }
}