import { AppwriteDataService } from './appwrite-data-service';
import { CollegePlayer, WeeklyProjection } from '../types/player.types';

export class ProjectionService {
  private appwriteService: AppwriteDataService;

  constructor() {
    this.appwriteService = new AppwriteDataService();
  }

  // Generate weekly projections for all draftable players
  async generateWeeklyProjections(week: number): Promise<void> {
    console.log(`Generating weekly projections for week ${week}...`);
    
    try {
      const players = await this.getDraftablePlayers();
      
      for (const player of players) {
        const projection = await this.calculatePlayerProjection(player, week);
        await this.updatePlayerProjection(player.id, projection);
      }
      
      console.log(`Completed generating projections for week ${week}`);
    } catch (error) {
      console.error('Failed to generate weekly projections:', error);
      throw error;
    }
  }

  // Get all draftable players
  private async getDraftablePlayers(): Promise<CollegePlayer[]> {
    try {
      const players = await this.appwriteService.listDocuments('college_players', [
        { key: 'eligibleForWeek', operator: 'equal', value: true },
        { key: 'injuryStatus', operator: 'equal', value: 'healthy' }
      ]);

      return players.map(player => ({
        ...player,
        seasonStats: JSON.parse(player.seasonStats || '{}'),
        weeklyProjections: JSON.parse(player.weeklyProjections || '[]')
      }));
    } catch (error) {
      console.error('Failed to get draftable players:', error);
      return [];
    }
  }

  // Calculate projection for a specific player
  private async calculatePlayerProjection(player: CollegePlayer, week: number): Promise<WeeklyProjection> {
    try {
      // Get historical stats
      const historicalStats = await this.getPlayerHistoricalStats(player.id);
      
      // Get opponent data
      const opponent = await this.getPlayerOpponent(player.teamId, week);
      
      // Calculate projection based on multiple factors
      const projectedPoints = this.calculateProjectedPoints(player, historicalStats, opponent);
      
      // Determine confidence level
      const confidence = this.calculateConfidence(player, historicalStats);
      
      // Generate projection notes
      const notes = this.generateProjectionNotes(player, opponent, historicalStats);
      
      return {
        week,
        opponent: opponent?.name || 'TBD',
        projectedPoints,
        confidence,
        notes
      };
    } catch (error) {
      console.error(`Failed to calculate projection for player ${player.displayName}:`, error);
      
      // Return default projection
      return {
        week,
        opponent: 'TBD',
        projectedPoints: 0,
        confidence: 'low',
        notes: 'Unable to calculate projection'
      };
    }
  }

  // Get player's historical stats
  private async getPlayerHistoricalStats(playerId: string): Promise<any[]> {
    try {
      const stats = await this.appwriteService.listDocuments('player_stats', [
        { key: 'playerId', operator: 'equal', value: playerId }
      ]);
      return stats;
    } catch (error) {
      console.error(`Failed to get historical stats for player ${playerId}:`, error);
      return [];
    }
  }

  // Get player's opponent for the week
  private async getPlayerOpponent(teamId: string, week: number): Promise<any> {
    try {
      const games = await this.appwriteService.listDocuments('games', [
        { key: 'week', operator: 'equal', value: week },
        { key: 'season', operator: 'equal', value: 2024 }
      ]);

      // Find game where team is playing
      const game = games.find(g => 
        g.homeTeam === teamId || g.awayTeam === teamId
      );

      if (!game) return null;

      // Return opponent team info
      const opponentId = game.homeTeam === teamId ? game.awayTeam : game.homeTeam;
      const opponent = await this.appwriteService.getDocument('teams', opponentId);
      
      return opponent;
    } catch (error) {
      console.error(`Failed to get opponent for team ${teamId} in week ${week}:`, error);
      return null;
    }
  }

  // Calculate projected points based on historical data and opponent
  private calculateProjectedPoints(player: CollegePlayer, historicalStats: any[], opponent: any): number {
    let baseProjection = 0;
    
    // Calculate base projection from historical performance
    if (historicalStats.length > 0) {
      const recentStats = historicalStats.slice(-3); // Last 3 games
      const avgPoints = recentStats.reduce((sum, stat) => sum + stat.fantasyPoints, 0) / recentStats.length;
      baseProjection = avgPoints;
    } else if (player.fantasyPoints) {
      // Use season average if no historical stats
      baseProjection = player.fantasyPoints / (player.seasonStats?.games || 1);
    }

    // Apply opponent adjustments
    if (opponent) {
      const opponentAdjustment = this.calculateOpponentAdjustment(player, opponent);
      baseProjection *= opponentAdjustment;
    }

    // Apply position-specific adjustments
    const positionAdjustment = this.calculatePositionAdjustment(player);
    baseProjection *= positionAdjustment;

    // Apply injury/status adjustments
    const statusAdjustment = this.calculateStatusAdjustment(player);
    baseProjection *= statusAdjustment;

    return Math.round(baseProjection * 100) / 100;
  }

  // Calculate opponent strength adjustment
  private calculateOpponentAdjustment(player: CollegePlayer, opponent: any): number {
    // This would be based on opponent's defensive rankings
    // For now, use a simple random adjustment between 0.8 and 1.2
    return 0.8 + Math.random() * 0.4;
  }

  // Calculate position-specific adjustments
  private calculatePositionAdjustment(player: CollegePlayer): number {
    const position = player.position.fantasyCategory;
    
    switch (position) {
      case 'QB':
        return 1.0; // QBs are generally consistent
      case 'RB':
        return 0.9; // RBs can be inconsistent due to committee
      case 'WR':
        return 0.85; // WRs can be volatile
      case 'TE':
        return 0.8; // TEs are often inconsistent
      case 'K':
        return 0.7; // Kickers are very volatile
      case 'DEF':
        return 0.9; // Defenses can be inconsistent
      default:
        return 1.0;
    }
  }

  // Calculate status-based adjustments
  private calculateStatusAdjustment(player: CollegePlayer): number {
    switch (player.injuryStatus) {
      case 'healthy':
        return 1.0;
      case 'questionable':
        return 0.7;
      case 'doubtful':
        return 0.3;
      case 'out':
        return 0.0;
      default:
        return 1.0;
    }
  }

  // Calculate confidence level for projection
  private calculateConfidence(player: CollegePlayer, historicalStats: any[]): 'high' | 'medium' | 'low' {
    // More historical data = higher confidence
    if (historicalStats.length >= 5) {
      return 'high';
    } else if (historicalStats.length >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Generate projection notes
  private generateProjectionNotes(player: CollegePlayer, opponent: any, historicalStats: any[]): string {
    const notes: string[] = [];
    
    if (historicalStats.length === 0) {
      notes.push('Limited historical data available');
    }
    
    if (player.injuryStatus !== 'healthy') {
      notes.push(`Injury status: ${player.injuryStatus}`);
    }
    
    if (opponent) {
      notes.push(`Facing ${opponent.school || opponent.name}`);
    }
    
    if (player.seasonStats?.games && player.seasonStats.games < 3) {
      notes.push('Limited playing time this season');
    }
    
    return notes.join('. ');
  }

  // Update player's projection in Appwrite
  private async updatePlayerProjection(playerId: string, projection: WeeklyProjection): Promise<void> {
    try {
      // Get current player
      const player = await this.appwriteService.getDocument('college_players', playerId);
      
      // Parse existing projections
      const existingProjections = JSON.parse(player.weeklyProjections || '[]');
      
      // Update or add new projection
      const projectionIndex = existingProjections.findIndex((p: any) => p.week === projection.week);
      
      if (projectionIndex >= 0) {
        existingProjections[projectionIndex] = projection;
      } else {
        existingProjections.push(projection);
      }
      
      // Update player document
      await this.appwriteService.updateDocument('college_players', playerId, {
        weeklyProjections: JSON.stringify(existingProjections),
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error(`Failed to update projection for player ${playerId}:`, error);
    }
  }

  // Get projections for a specific week
  async getWeeklyProjections(week: number): Promise<WeeklyProjection[]> {
    try {
      const players = await this.getDraftablePlayers();
      const projections: WeeklyProjection[] = [];
      
      for (const player of players) {
        const playerProjections = player.weeklyProjections || [];
        const weekProjection = playerProjections.find(p => p.week === week);
        
        if (weekProjection) {
          projections.push({
            ...weekProjection,
            playerId: player.id,
            playerName: player.displayName,
            position: player.position.fantasyCategory,
            team: player.team
          });
        }
      }
      
      // Sort by projected points
      return projections.sort((a, b) => b.projectedPoints - a.projectedPoints);
    } catch (error) {
      console.error(`Failed to get weekly projections for week ${week}:`, error);
      return [];
    }
  }

  // Get top projected players by position
  async getTopProjectedPlayers(week: number, position?: string, limit: number = 20): Promise<any[]> {
    try {
      const projections = await this.getWeeklyProjections(week);
      
      let filteredProjections = projections;
      
      if (position) {
        filteredProjections = projections.filter(p => p.position === position);
      }
      
      return filteredProjections.slice(0, limit);
    } catch (error) {
      console.error('Failed to get top projected players:', error);
      return [];
    }
  }
} 