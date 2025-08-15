import { Client, Databases, Avatars, Storage, Functions } from 'appwrite';
import { APPWRITE_CONFIG } from './config/appwrite.config';
import { env, COLLECTIONS as ENV_COLLECTIONS } from '@/core/config/environment';

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

// Centralized database and collections (single source of truth)
export const DATABASE_ID = env.client.appwrite.databaseId;
export const COLLECTIONS = {
  ...ENV_COLLECTIONS,
  // Backwards-compatible UPPERCASE aliases
  LEAGUES: ENV_COLLECTIONS.leagues,
  ROSTERS: ENV_COLLECTIONS.rosters,
  PLAYERS: ENV_COLLECTIONS.players,
  TEAMS: ENV_COLLECTIONS.teams,
  GAMES: ENV_COLLECTIONS.games,
  RANKINGS: ENV_COLLECTIONS.rankings,
  DRAFT_PICKS: ENV_COLLECTIONS.draftPicks,
  AUCTIONS: ENV_COLLECTIONS.auctions,
  BIDS: ENV_COLLECTIONS.bids,
  PLAYER_STATS: ENV_COLLECTIONS.playerStats,
  MATCHUPS: ENV_COLLECTIONS.matchups,
  LINEUPS: ENV_COLLECTIONS.lineups,
  PLAYER_PROJECTIONS: ENV_COLLECTIONS.playerProjections,
  PROJECTIONS_YEARLY: ENV_COLLECTIONS.playerProjectionsYearly,
  PROJECTIONS_WEEKLY: ENV_COLLECTIONS.playerProjectionsWeekly,
  MODEL_INPUTS: ENV_COLLECTIONS.modelInputs,
  USER_CUSTOM_PROJECTIONS: ENV_COLLECTIONS.userCustomProjections,
  USERS: ENV_COLLECTIONS.users,
  ACTIVITY_LOG: ENV_COLLECTIONS.activityLog,
} as const;

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTIONS}.documents`,
  PLAYER_PROJECTIONS: () => `databases.${DATABASE_ID}.collections.${COLLECTIONS.PLAYER_PROJECTIONS}.documents`
};

export default client;