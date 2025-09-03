/**
 * Compatibility layer for schema migration
 * Maps old collection names to new ones
 */

import { COLLECTIONS } from './appwrite-generated'

// Add backwards compatibility aliases
export const COLLECTIONS_COMPAT = {
  ...COLLECTIONS,
  // Old names -> New names
  PLAYERS: COLLECTIONS.COLLEGE_PLAYERS,
  ROSTERS: COLLECTIONS.ROSTER_SLOTS,
  USER_TEAMS: COLLECTIONS.FANTASY_TEAMS,
} as const

// Re-export with compatibility
export { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, DATABASE_ID } from './appwrite-generated'
export { COLLECTIONS_COMPAT as COLLECTIONS }
