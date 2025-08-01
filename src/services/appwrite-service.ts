import { databases, DATABASE_ID, COLLECTIONS } from '../config/appwrite.config';
import { ID, Query } from 'node-appwrite';
import { Game, Team, APRanking } from '../types/api.types';

export class AppwriteService {
  // Store games in Appwrite
  async storeGames(games: Game[]): Promise<void> {
    try {
      const promises = games.map(game => 
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.GAMES,
          game.id || ID.unique(),
          {
            season: game.season,
            week: game.week,
            seasonType: game.seasonType,
            startDate: game.startDate,
            homeTeam: game.homeTeam,
            homeConference: game.homeConference,
            homePoints: game.homePoints || 0,
            awayTeam: game.awayTeam,
            awayConference: game.awayConference,
            awayPoints: game.awayPoints || 0,
            status: game.status,
            period: game.period || 0,
            clock: game.clock || '',
            isConferenceGame: game.homeConference === game.awayConference,
            lastUpdated: new Date().toISOString()
          }
        ).catch(error => {
          // If document exists, update it
          if (error.code === 409) {
            return databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.GAMES,
              game.id,
              {
                homePoints: game.homePoints || 0,
                awayPoints: game.awayPoints || 0,
                status: game.status,
                period: game.period || 0,
                clock: game.clock || '',
                lastUpdated: new Date().toISOString()
              }
            );
          }
          throw error;
        })
      );

      await Promise.all(promises);
      console.log(`Stored/updated ${games.length} games in Appwrite`);
    } catch (error) {
      console.error('Error storing games:', error);
      throw error;
    }
  }

  // Get games from Appwrite
  async getGames(week?: number, year?: number): Promise<Game[]> {
    try {
      const queries = [];
      
      if (week) queries.push(Query.equal('week', week));
      if (year) queries.push(Query.equal('season', year));
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        queries
      );

      return response.documents.map(doc => ({
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
        status: doc.status,
        period: doc.period,
        clock: doc.clock
      }));
    } catch (error) {
      console.error('Error fetching games from Appwrite:', error);
      return [];
    }
  }

  // Store rankings in Appwrite
  async storeRankings(rankings: APRanking[], week: number, year: number): Promise<void> {
    try {
      const documentId = `${year}-week${week}-ap`;
      
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.RANKINGS,
        documentId,
        {
          season: year,
          week: week,
          poll: 'AP Top 25',
          rankings: JSON.stringify(rankings.map(r => ({
            rank: r.rank,
            school: r.school,
            conference: r.conference || '',
            firstPlaceVotes: r.firstPlaceVotes || 0,
            points: r.points
          }))),
          lastUpdated: new Date().toISOString()
        }
      ).catch(error => {
        // If document exists, update it
        if (error.code === 409) {
          return databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.RANKINGS,
            documentId,
            {
              rankings: JSON.stringify(rankings.map(r => ({
                rank: r.rank,
                school: r.school,
                conference: r.conference || '',
                firstPlaceVotes: r.firstPlaceVotes || 0,
                points: r.points
              }))),
              lastUpdated: new Date().toISOString()
            }
          );
        }
        throw error;
      });

      console.log(`Stored AP rankings for week ${week}`);
    } catch (error) {
      console.error('Error storing rankings:', error);
      throw error;
    }
  }

  // Get latest rankings from Appwrite
  async getLatestRankings(): Promise<APRanking[] | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RANKINGS,
        [
          Query.orderDesc('lastUpdated'),
          Query.limit(1)
        ]
      );

      if (response.documents.length === 0) return null;

      return JSON.parse(response.documents[0].rankings);
    } catch (error) {
      console.error('Error fetching rankings from Appwrite:', error);
      return null;
    }
  }

  // Store teams in Appwrite
  async storeTeams(teams: Team[]): Promise<void> {
    try {
      const promises = teams.map(team => 
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TEAMS,
          team.id,
          {
            school: team.school,
            mascot: team.mascot || '',
            abbreviation: team.abbreviation || '',
            conference: team.conference || '',
            conferenceId: team.conferenceId || 0,
            color: team.color || '',
            altColor: team.altColor || '',
            logo: team.logo || '',
            lastUpdated: new Date().toISOString()
          }
        ).catch(error => {
          // If document exists, update it
          if (error.code === 409) {
            return databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.TEAMS,
              team.id,
              {
                lastUpdated: new Date().toISOString()
              }
            );
          }
          throw error;
        })
      );

      await Promise.all(promises);
      console.log(`Stored ${teams.length} teams in Appwrite`);
    } catch (error) {
      console.error('Error storing teams:', error);
      throw error;
    }
  }

  // Get teams by conference
  async getTeamsByConference(conference: string): Promise<Team[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('conference', conference)]
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
}