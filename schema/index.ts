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
export { COLLECTIONS, databases, DATABASE_ID } from '../lib/appwrite-generated';
export type * from '../types/generated';

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
  ROSTERS: 'user_teams',
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