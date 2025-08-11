import { Client, Databases, Account, Avatars } from 'appwrite';
import { APPWRITE_CONFIG, DATABASE_ID, COLLECTIONS } from './config/appwrite.config';

// Initialize Appwrite client with CORS fix
const client = new Client();

// Force the correct endpoint based on environment
const endpoint = 'https://nyc.cloud.appwrite.io/v1';
const projectId = 'college-football-fantasy-app';

client
  .setEndpoint(endpoint)
  .setProject(projectId);

// Add custom headers to help with CORS
if (typeof window !== 'undefined') {
  // Log the initialization for debugging
  console.log('Initializing Appwrite client:', {
    endpoint,
    projectId,
    origin: window.location.origin
  });
}

// Export Appwrite services
export const databases = new Databases(client);
// Deprecated shim. Route through main proxy-aware export instead if ever used.
export const account = new Account(client);
export const avatars = new Avatars(client);
export { client };

// Re-export configuration
export { DATABASE_ID, COLLECTIONS };

// Realtime channels
export const REALTIME_CHANNELS = {
  DRAFT_PICKS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
  LEAGUE_UPDATES: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`,
  AUCTION_BIDS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_BIDS}.documents`,
  AUCTION_SESSIONS: (leagueId: string) => `databases.${DATABASE_ID}.collections.${COLLECTIONS.AUCTION_SESSIONS}.documents`,
  PLAYER_PROJECTIONS: () => `databases.${DATABASE_ID}.collections.${COLLECTIONS.PLAYER_PROJECTIONS}.documents`
};

export default client;
