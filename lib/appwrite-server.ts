import { Client, Databases, Users, Storage, Functions, Messaging, Account } from 'node-appwrite';
import { DATABASE_ID, COLLECTIONS } from './appwrite-generated';
import { cookies } from 'next/headers';

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
// Use NEXT_PUBLIC_ variables which are available in Vercel
const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(sanitizeApiKey(process.env.APPWRITE_API_KEY));

// Export server-side services
export const serverDatabases = new Databases(serverClient);
export const serverUsers = new Users(serverClient);
export const serverStorage = new Storage(serverClient);
export const serverFunctions = new Functions(serverClient);
export const serverMessaging = new Messaging(serverClient);

// Re-export common constants
export { DATABASE_ID, COLLECTIONS };
// Alias commonly imported names for backward compatibility
export const databases = serverDatabases;
export const client = serverClient;

// Helper to check if server is properly configured
export function isServerConfigured(): boolean {
  return !!(
    process.env.APPWRITE_API_KEY &&
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
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
    id: 'schools',
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
    requiredAttributes: ['week', 'season', 'seasonType', 'homeTeam', 'awayTeam', 'startDate'],
  },
  rankings: {
    id: 'rankings',
    name: 'Rankings',
    description: 'AP Top 25 and other poll rankings',
    attributeCount: 7,
    indexCount: 5,
    requiredAttributes: ['week', 'season', 'pollType', 'team', 'rank'],
  },
  leagues: {
    id: 'leagues',
    name: 'Leagues',
    description: 'Fantasy football leagues',
    attributeCount: 14,
    indexCount: 4,
    requiredAttributes: ['name', 'commissioner', 'season', 'maxTeams', 'draftType', 'gameMode', 'status'],
  },
  fantasy_teams: {
    id: 'fantasy_teams',
    name: 'Fantasy Teams',
    description: 'Fantasy team rosters within leagues',
    attributeCount: 13,
    indexCount: 4,
    requiredAttributes: ['leagueId', 'clientId', 'teamName'],
  },
  lineups: {
    id: 'lineups',
    name: 'Lineups',
    description: 'Weekly fantasy lineups',
    attributeCount: 7,
    indexCount: 3,
    requiredAttributes: ['fantasyTeamId', 'week', 'season'],
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
    requiredAttributes: ['auctionId', 'playerId', 'fantasyTeamId', 'amount', 'timestamp'],
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
    id: 'clients',
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
    // Appwrite SDK v16: listCollections(databaseId) returns { total, items }
    const response: any = await (serverDatabases as any).listCollections(DATABASE_ID);
    const items = Array.isArray(response?.collections)
      ? response.collections
      : Array.isArray(response?.items)
        ? response.items
        : []
    const existingIds = new Set(items.map((c: any) => c.$id));
    
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

/**
 * Create a client with session from cookies (for API routes)
 */
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');

  // Get session from cookies
  const cookieStore = await cookies();
  
  // Try to find the Appwrite session cookie
  // Appwrite sets cookies like: a_session_[projectId] or just appwrite-session
  const sessionNames = [
    'appwrite-session',
    'a_session_college-football-fantasy-app',
    'a_session_college-football-fantasy-app_legacy'
  ];
  
  let session = null;
  for (const name of sessionNames) {
    const cookie = cookieStore.get(name);
    if (cookie?.value) {
      session = cookie.value;
      console.log(`Found session cookie ${name} (length: ${cookie.value.length})`);
      break;
    }
  }
  
  // Also check for any cookie starting with a_session_
  if (!session) {
    const allCookies = cookieStore.getAll();
    const sessionCookie = allCookies.find(c => c.name.startsWith('a_session_') || c.name.includes('appwrite'));
    if (sessionCookie) {
      session = sessionCookie.value;
      console.log(`Found session cookie ${sessionCookie.name} (length: ${sessionCookie.value.length})`);
    }
  }
  
  if (!session) {
    console.log('No session cookie found. Available cookies:', cookieStore.getAll().map(c => c.name).join(', '));
  }
  
  if (session) {
    client.setSession(session);
  }

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    hasSession: !!session
  };
}