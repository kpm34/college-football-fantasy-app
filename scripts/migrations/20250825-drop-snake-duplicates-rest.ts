import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.DATABASE_ID || 'college-football-fantasy'
const apiKey = process.env.APPWRITE_API_KEY

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const db = new Databases(client)

type Pair = [snake: string, camel: string]

const targets: Record<string, Pair[]> = {
  drafts: [
    ['league_id','leagueId'],
    ['start_time','startTime'],
    ['end_time','endTime'],
    ['current_round','currentRound'],
    ['current_pick','currentPick'],
    ['max_rounds','maxRounds']
  ],
  draft_states: [
    ['draft_id','draftId'],
    ['on_clock_team_id','onClockTeamId'],
    ['pick_index','pickIndex'],
    ['deadline_at','deadlineAt']
  ],
  invites: [
    ['created_at','createdAt'],
    ['accepted_at','acceptedAt'],
    ['expires_at','expiresAt'],
    ['league_id','leagueId'],
    ['invited_by','invited_by_auth_user_id']
  ],
  activity_log: [
    ['createdAt','createdAt'], // normalize: prefer camel createdAt; if snake exists it's created_at
  ],
  model_versions: [
    ['created_at','createdAt'],
    ['created_by','createdBy'],
    ['thumbnail_url','thumbnailUrl'],
    ['version_id','versionId']
  ],
  player_stats: [
    ['game_id','gameId'],
    ['player_id','playerId']
  ]
}

function snakeToCamelFallback(snake: string): string {
  // helper for activity_log special case
  if (snake === 'createdAt') return 'createdAt'
  return snake
}

async function listAttrKeys(collection: string): Promise<Set<string>> {
  const res = await db.listAttributes(databaseId, collection)
  const keys = new Set<string>()
  for (const a of (res as any).attributes || []) keys.add(String(a.key))
  return keys
}

async function dropAttributeIfDuplicate(collection: string, snake: string, camel: string): Promise<boolean> {
  const keys = await listAttrKeys(collection)
  // special case: activity_log listed pair incorrectly above; handle snake created_at
  if (collection === 'activity_log' && snake === 'createdAt') {
    // treat snake as created_at here
    snake = 'created_at'
  }
  if (keys.has(snake) && keys.has(camel)) {
    try {
      await db.deleteAttribute(databaseId, collection, snake)
      console.log(`Deleted ${collection}.${snake} (kept ${camel})`)
      return true
    } catch (e: any) {
      console.warn(`Could not delete ${collection}.${snake}: ${e?.message}`)
    }
  }
  return false
}

async function dropDuplicateIndexes() {
  // draft_states: drop snake index if camel one exists
  try {
    const idxs = await db.listIndexes(databaseId, 'draft_states')
    const names = new Set<string>(((idxs as any).indexes || []).map((i: any) => String(i.key)))
    if (names.has('draft_unique') && names.has('draft_unique_idx')) {
      try {
        await db.deleteIndex(databaseId, 'draft_states', 'draft_unique')
        console.log('Deleted draft_states index draft_unique (snake)')
      } catch (e: any) {
        console.warn('Could not delete draft_states.draft_unique:', e?.message)
      }
    }
  } catch {}
}

async function main() {
  for (const [collection, pairs] of Object.entries(targets)) {
    for (const [snake, camel] of pairs) {
      // if snake==camel, interpret as special-case mapping handled in function
      const s = snake
      const c = camel || snakeToCamelFallback(snake)
      await dropAttributeIfDuplicate(collection, s, c)
    }
  }
  await dropDuplicateIndexes()
}

main().catch(err => { console.error(err); process.exit(1) })


