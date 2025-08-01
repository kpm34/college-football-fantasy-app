import { databases, DATABASE_ID, COLLECTIONS } from '../config/appwrite.config';
import { Query } from 'node-appwrite';
import { Game, Team, APPoll, APRanking, GameStatus } from '../types/api.types';

export class AppwriteDataService {
  // Get current week games from Appwrite
  async getCurrentWeekGames(): Promise<Game[]> {
    try {
      // For now, get the most recent games
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [
          Query.orderDesc('startDate'),
          Query.limit(100)
        ]
      );

      return this.transformDocumentsToGames(response.documents);
    } catch (error) {
      console.error('Error fetching games from Appwrite:', error);
      return [];
    }
  }

  // Get games for a specific week
  async getGamesForWeek(week: number, year: number = new Date().getFullYear()): Promise<Game[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [
          Query.equal('week', week),
          Query.equal('season', year),
          Query.orderAsc('startDate')
        ]
      );

      return this.transformDocumentsToGames(response.documents);
    } catch (error) {
      console.error('Error fetching games for week:', error);
      return [];
    }
  }

  // Get AP Rankings from Appwrite
  async getAPRankings(week?: number, year: number = new Date().getFullYear()): Promise<APPoll | null> {
    try {
      const queries = [Query.orderDesc('week'), Query.limit(1)];
      
      if (week) {
        queries.push(Query.equal('week', week));
      }
      if (year) {
        queries.push(Query.equal('season', year));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RANKINGS,
        queries
      );

      if (response.documents.length === 0) return null;

      const doc = response.documents[0];
      const rankings = JSON.parse(doc.rankings);

      return {
        season: doc.season,
        seasonType: 'regular',
        week: doc.week,
        polls: [{
          poll: doc.poll,
          ranks: rankings
        }]
      };
    } catch (error) {
      console.error('Error fetching rankings from Appwrite:', error);
      return null;
    }
  }

  // Get Power 4 teams from Appwrite
  async getTeams(): Promise<Team[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.limit(100)]
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        school: doc.school,
        mascot: doc.mascot,
        abbreviation: doc.abbreviation,
        conference: doc.conference,
        conferenceId: doc.conferenceId,
        color: doc.color,
        altColor: doc.altColor,
        logo: doc.logo
      }));
    } catch (error) {
      console.error('Error fetching teams from Appwrite:', error);
      return [];
    }
  }

  // Get team roster (stub for now - would need player collection)
  async getTeamRoster(teamId: string): Promise<any> {
    // TODO: Implement when we have player data
    return {
      athletes: [],
      message: 'Player data not yet available'
    };
  }

  // Get live game stats
  async getLiveGameStats(gameId: string): Promise<any> {
    try {
      const game = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        gameId
      );

      return {
        id: game.$id,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeScore: game.homePoints,
        awayScore: game.awayPoints,
        status: game.status,
        period: game.period,
        clock: game.clock,
        lastUpdated: game.lastUpdated
      };
    } catch (error) {
      console.error('Error fetching game stats:', error);
      return null;
    }
  }

  // Helper to transform Appwrite documents to Game type
  private transformDocumentsToGames(documents: any[]): Game[] {
    return documents.map(doc => ({
      id: doc.$id,
      season: doc.season,
      week: doc.week,
      seasonType: doc.seasonType,
      startDate: doc.startDate,
      homeTeam: doc.homeTeam,
      homeConference: doc.homeConference,
      homePoints: doc.homePoints,
      awayTeam: doc.awayTeam,
      awayConference: doc.awayConference,
      awayPoints: doc.awayPoints,
      status: doc.status as GameStatus,
      period: doc.period,
      clock: doc.clock
    }));
  }

  // Get eligible games (with AP rankings consideration)
  async getEligibleGames(): Promise<{ games: Game[], rankings: APRanking[] }> {
    try {
      const [games, rankingsData] = await Promise.all([
        this.getCurrentWeekGames(),
        this.getAPRankings()
      ]);

      const rankings = rankingsData?.polls[0]?.ranks || [];
      
      return { games, rankings };
    } catch (error) {
      console.error('Error fetching eligible games:', error);
      return { games: [], rankings: [] };
    }
  }
}