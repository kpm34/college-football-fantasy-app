/*
  Targeted Appwrite seeder for new collections/indexes only.
  Ensures without modifying existing large collections like `leagues`.
*/
import { Client, Databases } from 'node-appwrite'

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('Missing Appwrite env vars. Required: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const db = new Databases(client)

async function ensureCollection(collectionId: string, name: string) {
  try {
    await db.getCollection(databaseId, collectionId)
    console.log(`✅ Collection exists: ${collectionId}`)
  } catch {
    try {
      await db.createCollection(databaseId, collectionId, name, [], true)
      console.log(`✅ Created collection: ${collectionId}`)
    } catch (err) {
      console.warn(`⚠️  createCollection failed for ${collectionId}:`, (err as any)?.message || err)
    }
  }
}

async function ensureString(collectionId: string, key: string, size = 255, required = true) {
  try { await db.createStringAttribute(databaseId, collectionId, key, size, required) } catch {}
}
async function ensureInteger(collectionId: string, key: string, required = true) {
  try { await db.createIntegerAttribute(databaseId, collectionId, key, required) } catch {}
}
async function ensureFloat(collectionId: string, key: string, required = false) {
  try { await db.createFloatAttribute(databaseId, collectionId, key, required) } catch {}
}
async function ensureDatetime(collectionId: string, key: string, required = false) {
  try { await db.createDatetimeAttribute(databaseId, collectionId, key, required) } catch {}
}
async function ensureBoolean(collectionId: string, key: string, required = false) {
  try { await db.createBooleanAttribute(databaseId, collectionId, key, required) } catch {}
}
async function ensureEnum(collectionId: string, key: string, values: string[], required = true) {
  try { await db.createEnumAttribute(databaseId, collectionId, key, values, required) } catch {}
}
async function ensureIndex(collectionId: string, key: string, type: 'key'|'unique'|'fulltext', attributes: string[], orders?: ('ASC'|'DESC')[]) {
  try { await db.createIndex(databaseId, collectionId, key, type, attributes, orders) } catch {}
}

async function main() {
  // draft_events
  await ensureCollection('draft_events', 'Draft Events')
  await ensureString('draft_events', 'draftId')
  await ensureDatetime('draft_events', 'ts')
  await ensureEnum('draft_events', 'type', ['pick', 'autopick', 'undo', 'pause', 'resume'])
  await ensureString('draft_events', 'teamId')
  await ensureString('draft_events', 'playerId', 255, false)
  await ensureInteger('draft_events', 'round')
  await ensureInteger('draft_events', 'overall')
  await ensureString('draft_events', 'by', 255, false)
  await ensureIndex('draft_events', 'draft_ts_idx', 'key', ['draftId', 'ts'], ['ASC', 'DESC'])
  await ensureIndex('draft_events', 'draft_overall_idx', 'key', ['draftId', 'overall'])

  // draft_states
  await ensureCollection('draft_states', 'Draft States')
  await ensureString('draft_states', 'draftId')
  await ensureString('draft_states', 'onClockTeamId')
  await ensureDatetime('draft_states', 'deadlineAt')
  await ensureInteger('draft_states', 'round')
  await ensureInteger('draft_states', 'pickIndex')
  await ensureEnum('draft_states', 'status', ['active', 'paused', 'complete'])
  await ensureIndex('draft_states', 'draft_unique_idx', 'unique', ['draftId'])

  // projection_runs
  await ensureCollection('projection_runs', 'Projection Runs')
  await ensureString('projection_runs', 'runId')
  await ensureInteger('projection_runs', 'version')
  await ensureEnum('projection_runs', 'scope', ['season', 'week'])
  await ensureInteger('projection_runs', 'season')
  await ensureInteger('projection_runs', 'week', false)
  await ensureString('projection_runs', 'sources', 20000, false)
  await ensureString('projection_runs', 'weights', 10000, false)
  await ensureString('projection_runs', 'metrics', 10000, false)
  await ensureEnum('projection_runs', 'status', ['running', 'success', 'failed'])
  await ensureDatetime('projection_runs', 'startedAt')
  await ensureDatetime('projection_runs', 'finishedAt', false)
  await ensureIndex('projection_runs', 'run_unique_idx', 'unique', ['runId'])
  await ensureIndex('projection_runs', 'version_idx', 'key', ['version'])
  await ensureIndex('projection_runs', 'season_week_idx', 'key', ['season', 'week'])

  // player_projections (ensure versioned fields and indexes)
  await ensureCollection('player_projections', 'Player Projections')
  await ensureString('player_projections', 'playerId')
  await ensureInteger('player_projections', 'season')
  await ensureInteger('player_projections', 'week', false)
  await ensureInteger('player_projections', 'version')
  await ensureFloat('player_projections', 'points', false)
  await ensureString('player_projections', 'components', 10000, false)
  await ensureIndex('player_projections', 'season_week_version_idx', 'key', ['season', 'week', 'version'])
  await ensureIndex('player_projections', 'player_season_week_version_idx', 'key', ['playerId', 'season', 'week', 'version'])

  // projection_run_metrics (separate metrics store)
  await ensureCollection('projection_run_metrics', 'Projection Run Metrics')
  await ensureString('projection_run_metrics', 'runId')
  await ensureString('projection_run_metrics', 'metrics', 10000)
  await ensureIndex('projection_run_metrics', 'run_id_idx', 'key', ['runId'])
  await ensureIndex('projection_run_metrics', 'run_unique_idx', 'unique', ['runId'])

  // league_memberships
  await ensureCollection('league_memberships', 'League Memberships')
  await ensureString('league_memberships', 'leagueId')
  await ensureString('league_memberships', 'userId')
  await ensureEnum('league_memberships', 'role', ['commissioner', 'member', 'viewer'])
  await ensureIndex('league_memberships', 'league_user_idx', 'key', ['leagueId', 'userId'])
  await ensureIndex('league_memberships', 'user_idx', 'key', ['userId'])

  console.log('✅ Targeted collections ensured')
}

main().catch((e) => {
  console.error('❌ Targeted ensure failed:', e)
  process.exit(1)
})


