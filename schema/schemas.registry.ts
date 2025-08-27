/**
 * Schema Registry
 * Central registry for all database schemas and their TypeScript types
 * 
 * This file maps collection names to their schema definitions and provides
 * type-safe access to all collections in the database.
 */

import { SCHEMA, type SchemaCollection } from './schema';
import { 
  COLLECTIONS as ZOD_COLLECTIONS,
  SCHEMA_REGISTRY as ZOD_SCHEMA_REGISTRY,
  type FantasyTeam,
  type League,
  type CollegePlayer,
  type Game,
  type Ranking,
  type DraftEvent,
  type DraftState,
  type Lineup,
  type PlayerStat,
  type Auction,
  type Bid,
} from './zod-schema';

/**
 * Collection Name Constants
 * Use these constants throughout the application for type-safe collection references
 */
export const COLLECTIONS = {
  // Core Collections
  FANTASY_TEAMS: 'fantasy_teams' as const,  // User fantasy teams within leagues
  LEAGUES: 'leagues' as const,               // Fantasy leagues
  COLLEGE_PLAYERS: 'college_players' as const, // Player pool
  GAMES: 'games' as const,                   // Game schedule
  RANKINGS: 'rankings' as const,             // AP Top 25 rankings
  SCHOOLS: 'schools' as const,               // College teams/schools
  
  // Draft Collections
  DRAFT_EVENTS: 'draft_events' as const,     // Draft event log
  DRAFT_STATES: 'draft_states' as const,     // Draft state snapshots
  DRAFTS: 'drafts' as const,                 // Draft configurations
  
  // Roster Management
  ROSTER_SLOTS: 'roster_slots' as const,     // Individual player slots
  LINEUPS: 'lineups' as const,               // Weekly lineups
  
  // League Management
  LEAGUE_MEMBERSHIPS: 'league_memberships' as const, // User-league associations
  CLIENTS: 'clients' as const,               // User profiles
  MATCHUPS: 'matchups' as const,             // Weekly matchups
  TRANSACTIONS: 'transactions' as const,     // Trades, waivers, etc.
  
  // Auction Draft
  AUCTIONS: 'auctions' as const,             // Auction sessions
  BIDS: 'bids' as const,                     // Auction bids
  
  // Stats & Projections
  PLAYER_STATS: 'player_stats' as const,     // Historical stats
  PROJECTIONS: 'projections' as const,       // Player projections
  MODEL_RUNS: 'model_runs' as const,         // Projection model runs
  
  // System Collections
  ACTIVITY_LOG: 'activity_log' as const,     // User activity tracking
  INVITES: 'invites' as const,               // League invites
  MIGRATIONS: 'migrations' as const,         // Database migrations
  MESHY_JOBS: 'meshy_jobs' as const,        // 3D model generation jobs
  MODEL_VERSIONS: 'model_versions' as const, // 3D model versions
} as const;

/**
 * Type definitions for collection documents
 * These types are inferred from the Zod schemas for type safety
 */
export type Collections = {
  [COLLECTIONS.FANTASY_TEAMS]: FantasyTeam;
  [COLLECTIONS.LEAGUES]: League;
  [COLLECTIONS.COLLEGE_PLAYERS]: CollegePlayer;
  [COLLECTIONS.GAMES]: Game;
  [COLLECTIONS.RANKINGS]: Ranking;
  [COLLECTIONS.DRAFT_EVENTS]: DraftEvent;
  [COLLECTIONS.DRAFT_STATES]: DraftState;
  [COLLECTIONS.LINEUPS]: Lineup;
  [COLLECTIONS.PLAYER_STATS]: PlayerStat;
  [COLLECTIONS.AUCTIONS]: Auction;
  [COLLECTIONS.BIDS]: Bid;
  // Add more as needed from zod-schema types
};

/**
 * Schema Registry
 * Maps collection IDs to their schema definitions
 */
export const SCHEMA_REGISTRY = {
  // Map from collection ID to schema
  ...Object.fromEntries(
    Object.entries(SCHEMA).map(([id, schema]) => [id, schema])
  ),
  
  // Ensure Zod schemas are also accessible
  ...ZOD_SCHEMA_REGISTRY,
} as const;

/**
 * Helper Functions
 */

/**
 * Get schema for a collection
 */
export function getCollectionSchema(collectionId: string): SchemaCollection | undefined {
  return SCHEMA[collectionId];
}

/**
 * Get Zod schema for a collection
 */
export function getZodSchema(collectionId: string) {
  return ZOD_SCHEMA_REGISTRY[collectionId as keyof typeof ZOD_SCHEMA_REGISTRY];
}

/**
 * Check if a collection exists
 */
export function isValidCollection(collectionId: string): boolean {
  return collectionId in SCHEMA || collectionId in ZOD_SCHEMA_REGISTRY;
}

/**
 * Get all collection IDs
 */
export function getAllCollectionIds(): string[] {
  return Object.keys(COLLECTIONS).map(key => COLLECTIONS[key as keyof typeof COLLECTIONS]);
}

/**
 * Collection Metadata
 * Additional information about collections for UI and documentation
 */
export const COLLECTION_METADATA = {
  [COLLECTIONS.FANTASY_TEAMS]: {
    displayName: 'Fantasy Teams',
    description: 'User fantasy teams within leagues',
    icon: '🏈',
    category: 'core',
  },
  [COLLECTIONS.LEAGUES]: {
    displayName: 'Leagues',
    description: 'Fantasy football leagues',
    icon: '🏆',
    category: 'core',
  },
  [COLLECTIONS.COLLEGE_PLAYERS]: {
    displayName: 'College Players',
    description: 'Power 4 conference players',
    icon: '👤',
    category: 'core',
  },
  [COLLECTIONS.GAMES]: {
    displayName: 'Games',
    description: 'College football game schedule',
    icon: '🏟️',
    category: 'core',
  },
  [COLLECTIONS.RANKINGS]: {
    displayName: 'Rankings',
    description: 'AP Top 25 weekly rankings',
    icon: '📊',
    category: 'core',
  },
  [COLLECTIONS.DRAFT_EVENTS]: {
    displayName: 'Draft Events',
    description: 'Draft pick events and history',
    icon: '📝',
    category: 'draft',
  },
  [COLLECTIONS.DRAFT_STATES]: {
    displayName: 'Draft States',
    description: 'Draft state snapshots',
    icon: '💾',
    category: 'draft',
  },
  [COLLECTIONS.ROSTER_SLOTS]: {
    displayName: 'Roster Slots',
    description: 'Individual player roster slots',
    icon: '📋',
    category: 'roster',
  },
  [COLLECTIONS.LINEUPS]: {
    displayName: 'Lineups',
    description: 'Weekly starting lineups',
    icon: '📑',
    category: 'roster',
  },
  // Add more metadata as needed
} as const;

/**
 * Export everything for convenience
 */
export {
  SCHEMA,
  ZOD_COLLECTIONS,
  ZOD_SCHEMA_REGISTRY,
  type SchemaCollection,
  type SchemaAttribute,
  type SchemaIndex,
} from './schema';

export * from './zod-schema';

// Backwards compatibility aliases (deprecated)
export const USER_TEAMS = COLLECTIONS.FANTASY_TEAMS;  // @deprecated Use FANTASY_TEAMS
export const ROSTERS = COLLECTIONS.FANTASY_TEAMS;     // @deprecated Use FANTASY_TEAMS
