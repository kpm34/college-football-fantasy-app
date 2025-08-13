import { Client, Databases, Avatars } from 'appwrite';
import { APPWRITE_PUBLIC_CONFIG } from './appwrite-config';

// Initialize Appwrite client for frontend (NO API KEY - uses session auth)
const client = new Client();

client
  .setEndpoint(APPWRITE_PUBLIC_CONFIG.endpoint)
  .setProject(APPWRITE_PUBLIC_CONFIG.projectId);

// Export Appwrite services for data operations only
// Authentication is handled through API routes
export const databases = new Databases(client);
export const avatars = new Avatars(client);
export { client };

// Re-export configuration
export { APPWRITE_PUBLIC_CONFIG };

// Collection names for consistency
export const COLLECTIONS = {
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  ROSTERS: 'rosters',
  LINEUPS: 'lineups',
  GAMES: 'games',
  PLAYERS: 'players',
  RANKINGS: 'rankings',
  ACTIVITY_LOG: 'activity_log',
  DRAFT_PICKS: 'draft_picks',
  AUCTION_BIDS: 'auction_bids',
  AUCTION_SESSIONS: 'auction_sessions',
  PLAYER_PROJECTIONS: 'player_projections',
  USERS: 'users'
};

export const DATABASE_ID = APPWRITE_PUBLIC_CONFIG.databaseId;

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_SESSIONS}.documents`,
  PLAYER_PROJECTIONS: () => `databases.${DATABASE_ID}.collections.${COLLECTIONS.PLAYER_PROJECTIONS}.documents`
};

export default client;