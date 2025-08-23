/**
 * SINGLE SOURCE OF TRUTH - Schema Index
 * 
 * This is the master export for the canonical schema that drives everything:
 * - Appwrite collections and configuration
 * - TypeScript type generation  
 * - Environment variable configuration
 * - API client setup
 * - Validation and migrations
 */

// Export the canonical schema
export * from './schema';

// Export generated configurations
// Generated types and server exports may not exist in dev; provide fallbacks
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const generated = require('../lib/generated/appwrite-types');
  // Re-export if present
  // @ts-ignore
  exports.generated = generated;
} catch {}

export { COLLECTIONS } from '@/lib/appwrite';
export { DATABASE_ID } from '@/lib/appwrite';

// Re-export commonly used items for convenience
export { 
  SCHEMA,
  SCHEMA_VERSION,
  ENV_VARS,
  COLLECTION_IDS,
  REQUIRED_COLLECTIONS,
  OPTIONAL_COLLECTIONS,
  validateSchema,
  getEnvVarName,
  getTypeName
} from './schema';

/**
 * Quick access to collection IDs with full type safety
 */
export const Collections = {
  COLLEGE_PLAYERS: 'college_players',
  TEAMS: 'teams', 
  GAMES: 'games',
  RANKINGS: 'rankings',
  LEAGUES: 'leagues',
  USER_TEAMS: 'user_teams',
  LINEUPS: 'lineups',
  AUCTIONS: 'auctions',
  BIDS: 'bids',
  PLAYER_STATS: 'player_stats',
  USERS: 'users',
  ACTIVITY_LOG: 'activity_log'
} as const;

/**
 * Type-safe collection access
 */
export type CollectionId = typeof Collections[keyof typeof Collections];

/**
 * Validate that the schema is consistent
 */
export function validateSchemaConsistency(): boolean {
  const validation = validateSchema();
  
  if (!validation.valid) {
    console.error('Schema validation failed:', validation.errors);
    return false;
  }
  
  console.log('✅ Schema validation passed');
  return true;
}