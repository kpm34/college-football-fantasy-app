import { Client, Databases, Account, Realtime } from 'appwrite';

// Initialize Appwrite client for frontend
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Export Appwrite services
export const databases = new Databases(client);
export const account = new Account(client);
export const realtime = new Realtime(client);

// Database and collection IDs
export const DATABASE_ID = 'college-football-fantasy';

export const COLLECTIONS = {
  USERS: 'users',
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  GAMES: 'games',
  RANKINGS: 'rankings',
  ROSTERS: 'rosters',
  LINEUPS: 'lineups',
  SCORES: 'scores',
  DRAFTS: 'drafts',
  DRAFT_PICKS: 'draft_picks',
  PLAYERS: 'players',
  AUCTION_SESSIONS: 'auction_sessions',
  AUCTION_BIDS: 'auction_bids',
  TEAM_BUDGETS: 'team_budgets'
};

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_SESSIONS}.documents`
};

export default client; 