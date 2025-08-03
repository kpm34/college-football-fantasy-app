import { Client, Databases, Query } from 'node-appwrite';

// Server-side Appwrite client
const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const databases = new Databases(client);

export const DATABASE_ID = 'college-football-fantasy';

export const COLLECTIONS = {
  COLLEGE_PLAYERS: 'college_players',
  PLAYER_STATS: 'player_stats',
  TEAMS: 'teams',
  GAMES: 'games',
  RANKINGS: 'rankings',
  LEAGUES: 'leagues',
  ROSTERS: 'rosters',
  LINEUPS: 'lineups',
  DRAFT_PICKS: 'draft_picks',
  PLAYERS: 'players',
  DRAFTS: 'drafts'
};

// Helper function to get draftable players
export async function getDraftablePlayers(week: number = 1) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COLLEGE_PLAYERS,
      [
        Query.equal('eligibleForWeek', true),
        Query.orderDesc('fantasyPoints'),
        Query.limit(100)
      ]
    );

    // Parse JSON fields
    const players = response.documents.map(doc => ({
      ...doc,
      seasonStats: doc.seasonStats ? JSON.parse(doc.seasonStats) : null,
      weeklyProjections: doc.weeklyProjections ? JSON.parse(doc.weeklyProjections) : [],
      position: {
        id: doc.fantasyPosition,
        name: doc.position,
        abbreviation: doc.fantasyPosition,
        fantasyCategory: doc.fantasyPosition
      }
    }));

    return {
      players,
      total: response.total,
      week
    };
  } catch (error) {
    console.error('Error fetching draftable players from Appwrite:', error);
    throw error;
  }
}