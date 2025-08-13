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
}
