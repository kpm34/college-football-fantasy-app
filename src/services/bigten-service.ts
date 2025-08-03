import { databases } from '../config/appwrite.config';

export interface BigTenTeam {
  name: string;
  abbreviation: string;
  conference: string;
  division: 'East' | 'West';
  location: string;
  stadium: string;
  capacity: number;
  colors: string[];
  mascot: string;
  coach: string;
  established: number;
  conference_id: string;
  power_4: boolean;
  created_at: string;
}

export interface BigTenPlayer {
  name: string;
  position: string;
  team: string;
  team_abbreviation: string;
  conference: string;
  year: string;
  rating: number;
  draftable: boolean;
  conference_id: string;
  power_4: boolean;
  created_at: string;
}

export interface BigTenGame {
  home_team: string;
  away_team: string;
  date: string;
  time: string;
  venue: string;
  conference_game: boolean;
  rivalry: boolean;
  week: number;
  season: number;
  conference: string;
  status: string;
  created_at: string;
}

export class BigTenService {
  private static instance: BigTenService;
  private databaseId = 'college_football';
  private teamsCollectionId = 'teams';
  private playersCollectionId = 'college_players';
  private gamesCollectionId = 'games';

  private constructor() {}

  public static getInstance(): BigTenService {
    if (!BigTenService.instance) {
      BigTenService.instance = new BigTenService();
    }
    return BigTenService.instance;
  }

  /**
   * Get all Big Ten teams
   */
  async getBigTenTeams(): Promise<BigTenTeam[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.teamsCollectionId,
        [
          // Filter for Big Ten teams
          `conference_id.equal("big_ten")`,
          // Only Power 4 teams
          `power_4.equal(true)`
        ]
      );

      return response.documents as BigTenTeam[];
    } catch (error) {
      console.error('Error fetching Big Ten teams:', error);
      throw error;
    }
  }

  /**
   * Get Big Ten teams by division
   */
  async getBigTenTeamsByDivision(division: 'East' | 'West'): Promise<BigTenTeam[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.teamsCollectionId,
        [
          `conference_id.equal("big_ten")`,
          `power_4.equal(true)`,
          `division.equal("${division}")`
        ]
      );

      return response.documents as BigTenTeam[];
    } catch (error) {
      console.error(`Error fetching Big Ten ${division} teams:`, error);
      throw error;
    }
  }

  /**
   * Get all Big Ten players
   */
  async getBigTenPlayers(): Promise<BigTenPlayer[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.playersCollectionId,
        [
          `conference_id.equal("big_ten")`,
          `power_4.equal(true)`,
          `draftable.equal(true)`
        ]
      );

      return response.documents as BigTenPlayer[];
    } catch (error) {
      console.error('Error fetching Big Ten players:', error);
      throw error;
    }
  }

  /**
   * Get Big Ten players by team
   */
  async getBigTenPlayersByTeam(teamName: string): Promise<BigTenPlayer[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.playersCollectionId,
        [
          `conference_id.equal("big_ten")`,
          `power_4.equal(true)`,
          `draftable.equal(true)`,
          `team.equal("${teamName}")`
        ]
      );

      return response.documents as BigTenPlayer[];
    } catch (error) {
      console.error(`Error fetching ${teamName} players:`, error);
      throw error;
    }
  }

  /**
   * Get Big Ten players by position
   */
  async getBigTenPlayersByPosition(position: string): Promise<BigTenPlayer[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.playersCollectionId,
        [
          `conference_id.equal("big_ten")`,
          `power_4.equal(true)`,
          `draftable.equal(true)`,
          `position.equal("${position}")`
        ]
      );

      return response.documents as BigTenPlayer[];
    } catch (error) {
      console.error(`Error fetching Big Ten ${position}s:`, error);
      throw error;
    }
  }

  /**
   * Get Big Ten games
   */
  async getBigTenGames(): Promise<BigTenGame[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.gamesCollectionId,
        [
          `conference.equal("Big Ten")`
        ]
      );

      return response.documents as BigTenGame[];
    } catch (error) {
      console.error('Error fetching Big Ten games:', error);
      throw error;
    }
  }

  /**
   * Get Big Ten rivalry games
   */
  async getBigTenRivalryGames(): Promise<BigTenGame[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.gamesCollectionId,
        [
          `conference.equal("Big Ten")`,
          `rivalry.equal(true)`
        ]
      );

      return response.documents as BigTenGame[];
    } catch (error) {
      console.error('Error fetching Big Ten rivalry games:', error);
      throw error;
    }
  }

  /**
   * Get Big Ten games by week
   */
  async getBigTenGamesByWeek(week: number): Promise<BigTenGame[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.gamesCollectionId,
        [
          `conference.equal("Big Ten")`,
          `week.equal(${week})`
        ]
      );

      return response.documents as BigTenGame[];
    } catch (error) {
      console.error(`Error fetching Big Ten week ${week} games:`, error);
      throw error;
    }
  }

  /**
   * Get top rated Big Ten players
   */
  async getTopRatedBigTenPlayers(limit: number = 10): Promise<BigTenPlayer[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.playersCollectionId,
        [
          `conference_id.equal("big_ten")`,
          `power_4.equal(true)`,
          `draftable.equal(true)`
        ],
        limit,
        0,
        'rating',
        'DESC'
      );

      return response.documents as BigTenPlayer[];
    } catch (error) {
      console.error('Error fetching top rated Big Ten players:', error);
      throw error;
    }
  }

  /**
   * Get Big Ten draft board (players sorted by rating)
   */
  async getBigTenDraftBoard(): Promise<BigTenPlayer[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.playersCollectionId,
        [
          `conference_id.equal("big_ten")`,
          `power_4.equal(true)`,
          `draftable.equal(true)`
        ],
        100, // Get top 100 players
        0,
        'rating',
        'DESC'
      );

      return response.documents as BigTenPlayer[];
    } catch (error) {
      console.error('Error fetching Big Ten draft board:', error);
      throw error;
    }
  }

  /**
   * Get Big Ten conference stats
   */
  async getBigTenStats(): Promise<{
    totalTeams: number;
    totalPlayers: number;
    totalGames: number;
    eastTeams: number;
    westTeams: number;
    topRatedPlayer: BigTenPlayer | null;
  }> {
    try {
      const [teams, players, games, eastTeams, westTeams, topPlayer] = await Promise.all([
        this.getBigTenTeams(),
        this.getBigTenPlayers(),
        this.getBigTenGames(),
        this.getBigTenTeamsByDivision('East'),
        this.getBigTenTeamsByDivision('West'),
        this.getTopRatedBigTenPlayers(1)
      ]);

      return {
        totalTeams: teams.length,
        totalPlayers: players.length,
        totalGames: games.length,
        eastTeams: eastTeams.length,
        westTeams: westTeams.length,
        topRatedPlayer: topPlayer.length > 0 ? topPlayer[0] : null
      };
    } catch (error) {
      console.error('Error fetching Big Ten stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bigTenService = BigTenService.getInstance(); 