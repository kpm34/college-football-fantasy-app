import { Client, Databases, Account } from 'appwrite';
import { APPWRITE_PUBLIC_CONFIG } from './appwrite-config';

// Initialize Appwrite client for frontend (NO API KEY - uses session auth)
const client = new Client();

client
  .setEndpoint(APPWRITE_PUBLIC_CONFIG.endpoint)
  .setProject(APPWRITE_PUBLIC_CONFIG.projectId);

// Export Appwrite services
export const databases = new Databases(client);
export const account = new Account(client);
// Realtime functionality temporarily disabled - using client directly where needed
export { client };

// Database and collection IDs
export const DATABASE_ID = APPWRITE_PUBLIC_CONFIG.databaseId;

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
  TEAM_BUDGETS: 'team_budgets',
  ACTIVITY_LOG: 'activity_log'
};

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_SESSIONS}.documents`
};

export default client; 