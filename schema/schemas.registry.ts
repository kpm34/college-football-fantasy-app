/**
 * Schema Registry
 * Central registry for all database schemas
 * Auto-generated from live Appwrite schema
 * Generated: 2025-09-03T10:03:13.520Z
 */

import {
  ActivityLog,
  Auctions,
  Bids,
  Clients,
  CollegePlayers,
  DraftEvents,
  DraftPicks,
  DraftStates,
  Drafts,
  FantasyTeams,
  Games,
  Invites,
  LeagueMemberships,
  Leagues,
  Lineups,
  MascotDownloadTasks,
  MascotJobs,
  MascotPresets,
  Matchups,
  MeshyJobs,
  Migrations,
  ModelRuns,
  ModelVersions,
  PlayerStats,
  Projections,
  Rankings,
  RosterSlots,
  Schools,
  Transactions
} from './zod-schema'

// Collection ID to Schema mapping
export const schemas = {
  activity_log: ActivityLog,
  auctions: Auctions,
  bids: Bids,
  clients: Clients,
  college_players: CollegePlayers,
  draft_events: DraftEvents,
  draft_picks: DraftPicks,
  draft_states: DraftStates,
  drafts: Drafts,
  fantasy_teams: FantasyTeams,
  games: Games,
  invites: Invites,
  league_memberships: LeagueMemberships,
  leagues: Leagues,
  lineups: Lineups,
  mascot_download_tasks: MascotDownloadTasks,
  mascot_jobs: MascotJobs,
  mascot_presets: MascotPresets,
  matchups: Matchups,
  meshy_jobs: MeshyJobs,
  migrations: Migrations,
  model_runs: ModelRuns,
  model_versions: ModelVersions,
  player_stats: PlayerStats,
  projections: Projections,
  rankings: Rankings,
  roster_slots: RosterSlots,
  schools: Schools,
  transactions: Transactions,
} as const

// Collection names for reference
export const COLLECTION_NAMES = {
  'activity_log': 'activity_log',
  'auctions': 'Auctions',
  'bids': 'Bids',
  'clients': 'clients',
  'college_players': 'College Players',
  'draft_events': 'draft_events',
  'draft_picks': 'Draft Picks',
  'draft_states': 'Draft States',
  'drafts': 'drafts',
  'fantasy_teams': 'fantasy_teams',
  'games': 'Games',
  'invites': 'invites',
  'league_memberships': 'league_memberships',
  'leagues': 'Leagues',
  'lineups': 'Lineups',
  'mascot_download_tasks': 'Mascot Download Tasks',
  'mascot_jobs': 'Mascot Jobs',
  'mascot_presets': 'Mascot Presets',
  'matchups': 'Matchups',
  'meshy_jobs': 'meshy_jobs',
  'migrations': 'Database Migrations',
  'model_runs': 'model_runs',
  'model_versions': 'Model Versions',
  'player_stats': 'Player Stats',
  'projections': 'projections',
  'rankings': 'AP Rankings',
  'roster_slots': 'roster_slots',
  'schools': 'schools',
  'transactions': 'Transactions',
} as const

// Type exports
export type SchemaRegistry = typeof schemas
export type CollectionId = keyof SchemaRegistry
export type CollectionSchema<T extends CollectionId> = typeof schemas[T]

// Helper to get schema by collection ID
export function getSchema<T extends CollectionId>(collectionId: T) {
  return schemas[collectionId]
}

// Helper to validate data against schema
export function validateSchema<T extends CollectionId>(
  collectionId: T,
  data: unknown
) {
  const schema = schemas[collectionId]
  return schema.parse(data)
}

// Export collection statistics
export const SCHEMA_STATS = {
  totalCollections: 29,
  lastUpdated: '2025-09-03T10:03:13.521Z',
  collections: [
    'activity_log',
    'auctions',
    'bids',
    'clients',
    'college_players',
    'draft_events',
    'draft_picks',
    'draft_states',
    'drafts',
    'fantasy_teams',
    'games',
    'invites',
    'league_memberships',
    'leagues',
    'lineups',
    'mascot_download_tasks',
    'mascot_jobs',
    'mascot_presets',
    'matchups',
    'meshy_jobs',
    'migrations',
    'model_runs',
    'model_versions',
    'player_stats',
    'projections',
    'rankings',
    'roster_slots',
    'schools',
    'transactions',
  ]
} as const
