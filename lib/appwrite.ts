import { Client, Databases, Avatars, Storage, Functions } from 'appwrite';
import { APPWRITE_CONFIG } from './config/appwrite.config';

// Initialize Appwrite client for frontend (NO API KEY - uses session auth)
const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Export Appwrite services for data operations only
// Authentication is handled through API routes
export const databases = new Databases(client);
export const avatars = new Avatars(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export { client };

// Re-export configuration
export { APPWRITE_CONFIG };

// Database ID from environment
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.DATABASE_ID || 'college-football-fantasy';

// Collection names from environment variables
export const COLLECTIONS = {
  LEAGUES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues',
  TEAMS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS || 'teams',
  ROSTERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS || 'rosters',
  LINEUPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS || 'matchups',
  GAMES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES || 'games',
  PLAYERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
  RANKINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS || 'rankings',
  ACTIVITY_LOG: 'activity_log', // Not in env
  DRAFT_PICKS: 'draft_picks', // Not in env
  AUCTION_BIDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS || 'auction_bids',
  AUCTION_SESSIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS || 'auction_sessions',
  PLAYER_PROJECTIONS: 'player_projections', // Not in env
  PROJECTIONS_YEARLY: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_YEARLY || 'projections_yearly',
  PROJECTIONS_WEEKLY: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_WEEKLY || 'projections_weekly',
  MODEL_INPUTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS || 'model_inputs',
  USER_CUSTOM_PROJECTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CUSTOM_PROJECTIONS || 'user_custom_projections',
  PLAYER_STATS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS || 'player_stats',
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users'
};

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_SESSIONS}.documents`,
  PLAYER_PROJECTIONS: () => `databases.${DATABASE_ID}.collections.${COLLECTIONS.PLAYER_PROJECTIONS}.documents`
};

export default client;