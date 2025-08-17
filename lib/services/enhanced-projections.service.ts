import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { PlayerProjection } from '@/types/projections';

/**
 * @deprecated This service is deprecated as of August 17, 2025
 * The enhanced projection logic has been consolidated into:
 * - /api/draft/players endpoint (with depth chart logic)
 * - /api/players/cached endpoint (cached player data)
 * - scripts/ingestDepthCharts.ts for depth chart updates
 */

interface DepthChartPlayer {
  playerName: string;
  depth_chart_rank: number;
  team: string;
  position: string;
  returning_stats?: {
    yards?: number;
    touchdowns?: number;
    teamYardShare?: number;
    teamTDShare?: number;
  };
}

interface TeamVolume {
  passing_yards: number;
  passing_tds: number;
  rushing_yards: number;
  rushing_tds: number;
  receiving_yards: number;
  receiving_tds: number;
}

export class EnhancedProjectionsService {
  
  /**
   * Apply depth chart weights based on position-specific multipliers
   * @param players Array of players at the same position for a team
   * @param position Position group (QB, RB, WR, TE)
   * @param teamVolume Team's projected total volume
   * @param returningStats Map of returning production stats
   * @returns Dictionary of player projections with depth-weighted allocations
   */
  static apply_depth_chart_weights(
    players: DepthChartPlayer[],
    position: string,
    teamVolume: TeamVolume,
    returningStats: Map<string, any>
  ): Record<string, any> {
    const projections: Record<string, any> = {};
    
    // Sort players by depth chart rank
    const sortedPlayers = players.sort((a, b) => a.depth_chart_rank - b.depth_chart_rank);
    
    // Get base position multipliers
    const baseMultipliers = this.getPositionMultipliers(position, sortedPlayers.length);
    
    // Apply returning production adjustments
    const adjustedMultipliers = this.applyReturningProductionAdjustments(
      sortedPlayers,
      baseMultipliers,
      returningStats
    );
    
    // Allocate team volume based on adjusted multipliers
    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      const multiplier = adjustedMultipliers[i];
      
      projections[player.playerName] = this.calculatePlayerProjection(
        player,
        multiplier,
        teamVolume,
        position
      );
    }
    
    return projections;
  }

  /**
   * Get position-specific depth chart multipliers
   */
  private static getPositionMultipliers(position: string, playerCount: number): number[] {
    const multipliers: number[] = [];
    
    switch (position) {
      case 'QB':
        multipliers[0] = 0.95; // QB1
        multipliers[1] = 0.05; // QB2
        for (let i = 2; i < playerCount; i++) {
          multipliers[i] = 0.0; // QB3+
        }
        break;
        
      case 'RB':
        multipliers[0] = 0.55; // RB1
        multipliers[1] = 0.25; // RB2
        multipliers[2] = 0.15; // RB3
        // Remaining share (0.05) split among others
        const remainingRBs = playerCount - 3;
        const remainingShare = 0.05;
        for (let i = 3; i < playerCount; i++) {
          multipliers[i] = remainingShare / Math.max(1, remainingRBs);
        }
        break;
        
      case 'WR':
        multipliers[0] = 0.25; // WR1
        multipliers[1] = 0.20; // WR2
        multipliers[2] = 0.15; // WR3
        multipliers[3] = 0.10; // WR4
        // WR5+ share remaining 0.30 equally
        const remainingWRs = Math.max(1, playerCount - 4);
        const wr5PlusShare = 0.30;
        for (let i = 4; i < playerCount; i++) {
          multipliers[i] = wr5PlusShare / remainingWRs;
        }
        break;
        
      case 'TE':
        multipliers[0] = 0.7; // TE1
        multipliers[1] = 0.3; // TE2
        for (let i = 2; i < playerCount; i++) {
          multipliers[i] = 0.0; // TE3+
        }
        break;
        
      default:
        // Default equal distribution
        const equalShare = 1.0 / playerCount;
        for (let i = 0; i < playerCount; i++) {
          multipliers[i] = equalShare;
        }
    }
    
    return multipliers;
  }

  /**
   * Apply returning production adjustments
   * If player had >20% team share last season, add +0.05 to their multiplier
   */
  private static applyReturningProductionAdjustments(
    players: DepthChartPlayer[],
    baseMultipliers: number[],
    returningStats: Map<string, any>
  ): number[] {
    const adjustedMultipliers = [...baseMultipliers];
    let totalAdjustment = 0;
    
    // First pass: identify players with >20% returning production
    const adjustments: number[] = new Array(players.length).fill(0);
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const stats = returningStats.get(player.playerName);
      
      if (stats && (stats.teamYardShare > 0.20 || stats.teamTDShare > 0.20)) {
        adjustments[i] = 0.05;
        totalAdjustment += 0.05;
      }
    }
    
    // Second pass: apply adjustments and subtract from others
    if (totalAdjustment > 0) {
      const nonAdjustedPlayers = players.length - adjustments.filter(adj => adj > 0).length;
      const reductionPerPlayer = totalAdjustment / Math.max(1, nonAdjustedPlayers);
      
      for (let i = 0; i < players.length; i++) {
        if (adjustments[i] > 0) {
          adjustedMultipliers[i] += adjustments[i];
        } else {
          adjustedMultipliers[i] = Math.max(0, adjustedMultipliers[i] - reductionPerPlayer);
        }
      }
    }
    
    return adjustedMultipliers;
  }

  /**
   * Calculate individual player projection based on multiplier and team volume
   */
  private static calculatePlayerProjection(
    player: DepthChartPlayer,
    multiplier: number,
    teamVolume: TeamVolume,
    position: string
  ): any {
    const projection: any = {
      playerName: player.playerName,
      position: player.position,
      team: player.team,
      depth_chart_rank: player.depth_chart_rank,
      share_multiplier: multiplier
    };
    
    switch (position) {
      case 'QB':
        projection.passingYards = Math.round(teamVolume.passing_yards * multiplier);
        projection.passingTDs = Math.round(teamVolume.passing_tds * multiplier);
        projection.rushingYards = Math.round(teamVolume.rushing_yards * 0.15 * multiplier); // QB rushing
        projection.rushingTDs = Math.round(teamVolume.rushing_tds * 0.10 * multiplier);
        break;
        
      case 'RB':
        projection.rushingYards = Math.round(teamVolume.rushing_yards * 0.85 * multiplier); // 85% of team rushing to RBs
        projection.rushingTDs = Math.round(teamVolume.rushing_tds * 0.90 * multiplier);
        projection.receivingYards = Math.round(teamVolume.receiving_yards * 0.20 * multiplier); // RB receiving share
        projection.receivingTDs = Math.round(teamVolume.receiving_tds * 0.15 * multiplier);
        projection.receptions = Math.round((projection.receivingYards / 7.0)); // ~7 yards per reception for RBs
        break;
        
      case 'WR':
        projection.receivingYards = Math.round(teamVolume.receiving_yards * 0.65 * multiplier); // 65% of team receiving to WRs
        projection.receivingTDs = Math.round(teamVolume.receiving_tds * 0.70 * multiplier);
        projection.receptions = Math.round((projection.receivingYards / 12.0)); // ~12 yards per reception for WRs
        break;
        
      case 'TE':
        projection.receivingYards = Math.round(teamVolume.receiving_yards * 0.15 * multiplier); // 15% of team receiving to TEs
        projection.receivingTDs = Math.round(teamVolume.receiving_tds * 0.15 * multiplier);
        projection.receptions = Math.round((projection.receivingYards / 10.0)); // ~10 yards per reception for TEs
        break;
    }
    
    // Calculate fantasy points
    projection.fantasyPoints = this.calculateFantasyPoints(projection);
    
    return projection;
  }

  /**
   * Apply adjustments to projections (for returning production, etc.)
   */
  static apply_adjustments(
    projections: Record<string, any>,
    returningProduction: Map<string, any>
  ): Record<string, any> {
    // This is already handled in the depth chart weighting function
    // Could add additional adjustments here (injury history, etc.)
    return projections;
  }

  /**
   * Enforce minimum/maximum caps on projections
   */
  static enforce_caps(projections: Record<string, any>): Record<string, any> {
    const cappedProjections = { ...projections };
    
    // Group by position and team for cap enforcement
    const positionGroups: Record<string, any[]> = {};
    
    for (const [playerName, projection] of Object.entries(projections)) {
      const key = `${projection.team}_${projection.position}`;
      if (!positionGroups[key]) positionGroups[key] = [];
      positionGroups[key].push({ playerName, ...projection });
    }
    
    // Apply caps by position group
    for (const [key, players] of Object.entries(positionGroups)) {
      const [team, position] = key.split('_');
      const sortedPlayers = players.sort((a, b) => a.depth_chart_rank - b.depth_chart_rank);
      
      this.applyCapsToPositionGroup(sortedPlayers, position, cappedProjections);
    }
    
    return cappedProjections;
  }

  /**
   * Apply caps to a position group
   */
  private static applyCapsToPositionGroup(
    players: any[],
    position: string,
    projections: Record<string, any>
  ): void {
    if (players.length === 0) return;
    
    const starter = players[0];
    const starterProjection = projections[starter.playerName];
    
    for (let i = 1; i < players.length; i++) {
      const player = players[i];
      const projection = projections[player.playerName];
      
      // Apply position-specific caps
      switch (position) {
        case 'QB':
          // QB2 cannot exceed 25% of QB1 projection unless starter flagged as OUT
          if (i === 1) {
            const maxQB2 = starterProjection.fantasyPoints * 0.25;
            if (projection.fantasyPoints > maxQB2) {
              this.scaleProjection(projection, maxQB2 / projection.fantasyPoints);
            }
          }
          // QB3+ get minimal projections
          else {
            const maxBackup = starterProjection.fantasyPoints * 0.05;
            if (projection.fantasyPoints > maxBackup) {
              this.scaleProjection(projection, maxBackup / projection.fantasyPoints);
            }
          }
          break;
          
        case 'RB':
          // Non-starters (depth rank >3) cap at 10% of starter projection
          if (player.depth_chart_rank > 3) {
            const maxBackup = starterProjection.fantasyPoints * 0.10;
            if (projection.fantasyPoints > maxBackup) {
              this.scaleProjection(projection, maxBackup / projection.fantasyPoints);
            }
          }
          break;
          
        case 'WR':
          // Non-starters (depth rank >4) cap at 10% of starter projection
          if (player.depth_chart_rank > 4) {
            const maxBackup = starterProjection.fantasyPoints * 0.10;
            if (projection.fantasyPoints > maxBackup) {
              this.scaleProjection(projection, maxBackup / projection.fantasyPoints);
            }
          }
          break;
          
        case 'TE':
          // TE3+ get minimal projections
          if (player.depth_chart_rank > 2) {
            const maxBackup = starterProjection.fantasyPoints * 0.05;
            if (projection.fantasyPoints > maxBackup) {
              this.scaleProjection(projection, maxBackup / projection.fantasyPoints);
            }
          }
          break;
      }
    }
  }

  /**
   * Scale all stats in a projection by a factor
   */
  private static scaleProjection(projection: any, scaleFactor: number): void {
    const statsToScale = ['passingYards', 'passingTDs', 'rushingYards', 'rushingTDs', 
                         'receivingYards', 'receivingTDs', 'receptions', 'fantasyPoints'];
    
    for (const stat of statsToScale) {
      if (projection[stat]) {
        projection[stat] = Math.round(projection[stat] * scaleFactor);
      }
    }
  }

  /**
   * Calculate fantasy points from projection stats
   */
  private static calculateFantasyPoints(projection: any): number {
    let points = 0;
    
    // Passing stats
    points += (projection.passingYards || 0) * 0.04; // 1 point per 25 yards
    points += (projection.passingTDs || 0) * 4;
    
    // Rushing stats  
    points += (projection.rushingYards || 0) * 0.1; // 1 point per 10 yards
    points += (projection.rushingTDs || 0) * 6;
    
    // Receiving stats
    points += (projection.receivingYards || 0) * 0.1; // 1 point per 10 yards
    points += (projection.receivingTDs || 0) * 6;
    points += (projection.receptions || 0) * 1; // PPR
    
    // Bonus points
    if (projection.passingYards >= 300) points += 3;
    if (projection.rushingYards >= 100) points += 3;
    if (projection.receivingYards >= 100) points += 3;
    
    return Math.round(points * 10) / 10;
  }

  /**
   * Generate team volume projections based on historical data and pace
   */
  static async generateTeamVolume(teamId: string, season: number = 2025): Promise<TeamVolume> {
    // This would typically pull from team stats, pace data, etc.
    // For now, return reasonable defaults
    return {
      passing_yards: 3500,
      passing_tds: 25,
      rushing_yards: 2000,
      rushing_tds: 20,
      receiving_yards: 3500,
      receiving_tds: 25
    };
  }

  /**
   * Load player depth chart and returning stats from Appwrite
   */
  static async loadPlayerDepthData(teamId: string): Promise<{
    players: DepthChartPlayer[],
    returningStats: Map<string, any>
  }> {
    const players: DepthChartPlayer[] = [];
    const returningStats = new Map<string, any>();
    
    try {
      // Load players from college_players collection
      const playersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS, // or college_players
        [
          Query.equal('team', teamId),
          Query.limit(100)
        ]
      );
      
      for (const player of playersResponse.documents) {
        players.push({
          playerName: `${player.firstName} ${player.lastName}`.trim(),
          depth_chart_rank: player.depth || 1,
          team: player.team,
          position: player.position,
          returning_stats: player.returning_stats || {}
        });
        
        // Load returning stats if available
        if (player.prevYearStats) {
          returningStats.set(`${player.firstName} ${player.lastName}`.trim(), {
            yards: player.prevYearStats.yards || 0,
            touchdowns: player.prevYearStats.touchdowns || 0,
            teamYardShare: player.prevYearStats.teamYardShare || 0,
            teamTDShare: player.prevYearStats.teamTDShare || 0
          });
        }
      }
      
    } catch (error) {
      console.error('Error loading player depth data:', error);
    }
    
    return { players, returningStats };
  }

  /**
   * Main function to generate enhanced projections for a team
   */
  static async generateEnhancedProjections(teamId: string): Promise<Record<string, any>> {
    const { players, returningStats } = await this.loadPlayerDepthData(teamId);
    const teamVolume = await this.generateTeamVolume(teamId);
    
    const allProjections: Record<string, any> = {};
    
    // Group players by position
    const positionGroups: Record<string, DepthChartPlayer[]> = {};
    for (const player of players) {
      if (!positionGroups[player.position]) {
        positionGroups[player.position] = [];
      }
      positionGroups[player.position].push(player);
    }
    
    // Generate projections for each position group
    for (const [position, positionPlayers] of Object.entries(positionGroups)) {
      const positionProjections = this.apply_depth_chart_weights(
        positionPlayers,
        position,
        teamVolume,
        returningStats
      );
      
      Object.assign(allProjections, positionProjections);
    }
    
    // Apply adjustments and caps
    const adjustedProjections = this.apply_adjustments(allProjections, returningStats);
    const finalProjections = this.enforce_caps(adjustedProjections);
    
    return finalProjections;
  }

  /**
   * Test function for Louisville players
   */
  static async testLouisvilleProjections(): Promise<void> {
    console.log('Testing Louisville projections...');
    
    const projections = await this.generateEnhancedProjections('Louisville');
    
    // Check QB projections
    const millerMoss = projections['Miller Moss'];
    if (millerMoss) {
      console.log(`Miller Moss projection: ${millerMoss.fantasyPoints} points`);
      console.log(`- Passing yards: ${millerMoss.passingYards}`);
      console.log(`- Passing TDs: ${millerMoss.passingTDs}`);
    }
    
    // Check WR projections
    const caullinLacy = projections['Caullin Lacy'];
    const chrisBell = projections['Chris Bell'];
    if (caullinLacy && chrisBell) {
      console.log(`Caullin Lacy: ${caullinLacy.fantasyPoints} points`);
      console.log(`Chris Bell: ${chrisBell.fantasyPoints} points`);
    }
    
    // Check RB projections
    const isaacBrown = projections['Isaac Brown'];
    if (isaacBrown) {
      console.log(`Isaac Brown: ${isaacBrown.fantasyPoints} points`);
    }
    
    console.log('Test completed.');
  }
}