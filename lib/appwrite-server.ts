import { Client, Databases, Users, Storage, Functions, Messaging } from 'node-appwrite';

// Server-side Appwrite client configuration (with API key)
// This should only be used in API routes, never exposed to client

if (!process.env.APPWRITE_API_KEY) {
  console.warn('Warning: APPWRITE_API_KEY not found in environment variables');
}

// Normalize API key to avoid common env formatting pitfalls (quotes/newlines)
function sanitizeApiKey(raw: string | undefined): string {
  if (!raw) return '';
  // Remove surrounding quotes and trailing newline/CR characters
  return raw.replace(/^"|"$/g, '').replace(/\r?\n$/g, '');
}

// Initialize server client with API key
const serverClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(sanitizeApiKey(process.env.APPWRITE_API_KEY));

// Export server-side services
export const serverDatabases = new Databases(serverClient);
export const serverUsers = new Users(serverClient);
export const serverStorage = new Storage(serverClient);
export const serverFunctions = new Functions(serverClient);
export const serverMessaging = new Messaging(serverClient);

// Re-export common constants
export { DATABASE_ID, COLLECTIONS } from './appwrite';

// Helper to check if server is properly configured
export function isServerConfigured(): boolean {
  return !!(
    process.env.APPWRITE_API_KEY &&
    process.env.APPWRITE_ENDPOINT &&
    process.env.APPWRITE_PROJECT_ID
  );
}

// Helper to get server client (for advanced use cases)
export function getServerClient(): Client {
  if (!isServerConfigured()) {
    throw new Error('Appwrite server not properly configured. Check environment variables.');
  }
  return serverClient;
}

// Schema version for migration compatibility
export const SCHEMA_VERSION = '1.0.0';

// Collection metadata for validation and tooling
export const COLLECTION_METADATA = {
  college_players: {
    id: 'college_players',
    name: 'College Players',
    description: 'Player roster data from Power 4 conferences',
    attributeCount: 16,
    indexCount: 7,
    requiredAttributes: ['name', 'position', 'team', 'conference'],
  },
  teams: {
    id: 'teams',
    name: 'Teams',
    description: 'Power 4 conference team information',
    attributeCount: 10,
    indexCount: 3,
    requiredAttributes: ['name', 'abbreviation', 'conference'],
  },
  games: {
    id: 'games',
    name: 'Games',
    description: 'College football game schedule and results',
    attributeCount: 14,
    indexCount: 6,
    requiredAttributes: ['week', 'season', 'season_type', 'home_team', 'away_team', 'start_date'],
  },
  rankings: {
    id: 'rankings',
    name: 'Rankings',
    description: 'AP Top 25 and other poll rankings',
    attributeCount: 7,
    indexCount: 5,
    requiredAttributes: ['week', 'season', 'poll_type', 'team', 'rank'],
  },
  leagues: {
    id: 'leagues',
    name: 'Leagues',
    description: 'Fantasy football leagues',
    attributeCount: 14,
    indexCount: 4,
    requiredAttributes: ['name', 'commissioner', 'season', 'maxTeams', 'draftType', 'gameMode', 'status'],
  },
  user_teams: {
    id: 'user_teams',
    name: 'User Teams',
    description: 'Fantasy team rosters within leagues',
    attributeCount: 13,
    indexCount: 4,
    requiredAttributes: ['leagueId', 'userId', 'teamName'],
  },
  lineups: {
    id: 'lineups',
    name: 'Lineups',
    description: 'Weekly fantasy lineups',
    attributeCount: 7,
    indexCount: 3,
    requiredAttributes: ['rosterId', 'week', 'season'],
  },
  auctions: {
    id: 'auctions',
    name: 'Auctions',
    description: 'Auction draft sessions',
    attributeCount: 8,
    indexCount: 2,
    requiredAttributes: ['leagueId', 'status'],
  },
  bids: {
    id: 'bids',
    name: 'Bids',
    description: 'Auction bid history',
    attributeCount: 6,
    indexCount: 4,
    requiredAttributes: ['auctionId', 'playerId', 'teamId', 'amount', 'timestamp'],
  },
  player_stats: {
    id: 'player_stats',
    name: 'Player Stats',
    description: 'Game-by-game player statistics',
    attributeCount: 8,
    indexCount: 4,
    requiredAttributes: ['playerId', 'gameId', 'week', 'season'],
  },
  users: {
    id: 'users',
    name: 'Users',
    description: 'Application users',
    attributeCount: 7,
    indexCount: 3,
    requiredAttributes: ['authId', 'email'],
  },
  activity_log: {
    id: 'activity_log',
    name: 'Activity Log',
    description: 'System activity and audit trail',
    attributeCount: 7,
    indexCount: 4,
    requiredAttributes: ['action', 'timestamp'],
  },
} as const;

/**
 * Get collection ID with type safety
 */
export function getCollectionId(name: keyof typeof COLLECTIONS): string {
  return COLLECTIONS[name];
}

/**
 * Validate that all required collections exist
 */
export async function validateCollections(): Promise<{ valid: boolean; missing: string[] }> {
  try {
    const response = await serverDatabases.listCollections(DATABASE_ID);
    const existingIds = new Set(response.collections.map(c => c.$id));
    
    const requiredCollections = Object.values(COLLECTIONS);
    const missing = requiredCollections.filter(id => !existingIds.has(id));
    
    return { valid: missing.length === 0, missing };
  } catch (error) {
    console.error('Failed to validate collections:', error);
    return { valid: false, missing: Object.values(COLLECTIONS) };
  }
}

/**
 * Get collection metadata
 */
export function getCollectionMetadata(collectionId: string) {
  return COLLECTION_METADATA[collectionId as keyof typeof COLLECTION_METADATA];
}