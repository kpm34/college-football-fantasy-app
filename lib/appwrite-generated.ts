/**
 * Appwrite Generated Types
 * Generated from live schema on 2025-09-03T09:36:22.859Z
 */

// Database Configuration
export const DATABASE_ID = 'college-football-fantasy';
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';

// Collection IDs
export const COLLECTIONS = {
  ACTIVITY_LOG: 'activity_log',
  RANKINGS: 'rankings',
  AUCTIONS: 'auctions',
  BIDS: 'bids',
  CLIENTS: 'clients',
  COLLEGE_PLAYERS: 'college_players',
  MIGRATIONS: 'migrations',
  DRAFT_STATES: 'draft_states',
  DRAFT_EVENTS: 'draft_events',
  DRAFTS: 'drafts',
  FANTASY_TEAMS: 'fantasy_teams',
  GAMES: 'games',
  INVITES: 'invites',
  LEAGUE_MEMBERSHIPS: 'league_memberships',
  LEAGUES: 'leagues',
  LINEUPS: 'lineups',
  MATCHUPS: 'matchups',
  MESHY_JOBS: 'meshy_jobs',
  MODEL_VERSIONS: 'model_versions',
  MODEL_RUNS: 'model_runs',
  PLAYER_STATS: 'player_stats',
  PROJECTIONS: 'projections',
  ROSTER_SLOTS: 'roster_slots',
  SCHOOLS: 'schools',
  TRANSACTIONS: 'transactions',
} as const;

// Collection Names
export const COLLECTION_NAMES = {
  'activity_log': 'activity_log',
  'rankings': 'AP Rankings',
  'auctions': 'Auctions',
  'bids': 'Bids',
  'clients': 'clients',
  'college_players': 'College Players',
  'migrations': 'Database Migrations',
  'draft_states': 'Draft States',
  'draft_events': 'draft_events',
  'drafts': 'drafts',
  'fantasy_teams': 'fantasy_teams',
  'games': 'Games',
  'invites': 'invites',
  'league_memberships': 'league_memberships',
  'leagues': 'Leagues',
  'lineups': 'Lineups',
  'matchups': 'Matchups',
  'meshy_jobs': 'meshy_jobs',
  'model_versions': 'Model Versions',
  'model_runs': 'model_runs',
  'player_stats': 'Player Stats',
  'projections': 'projections',
  'roster_slots': 'roster_slots',
  'schools': 'schools',
  'transactions': 'Transactions',
} as const;

// Type exports for collection IDs
export type CollectionId = typeof COLLECTIONS[keyof typeof COLLECTIONS];
export type CollectionName = typeof COLLECTION_NAMES[keyof typeof COLLECTION_NAMES];
