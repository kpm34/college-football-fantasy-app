import { Client, Databases } from 'node-appwrite'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.DATABASE_ID || 'college-football-fantasy'
const apiKey = process.env.APPWRITE_API_KEY

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY in env')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const db = new Databases(client)

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try { return await p } catch { return null }
}

async function getAttrs(collection: string) {
  const list = await safe(db.listAttributes(databaseId, collection))
  return (list as any)?.attributes?.map((a: any) => ({ key: a.key, type: a.type, required: a.required })) || []
}

async function getIndexes(collection: string) {
  const list = await safe(db.listIndexes(databaseId, collection))
  return (list as any)?.indexes?.map((i: any) => ({ key: i.key, type: i.type, attributes: i.attributes })) || []
}

async function inspectCollection(collection: string) {
  const attrs = await getAttrs(collection)
  const indexes = await getIndexes(collection)
  return { collection, attrs, indexes }
}

function hasAttr(attrs: any[], key: string) {
  return attrs.some(a => a.key === key)
}

async function main() {
  const targets = ['leagues', 'league_memberships', 'fantasy_teams', 'clients', 'invites']
  const results = [] as any[]
  for (const col of targets) {
    results.push(await inspectCollection(col))
  }

  const out = Object.fromEntries(results.map(r => [r.collection, r]))

  const leagues = out['leagues']
  const memberships = out['league_memberships']
  const teams = out['fantasy_teams']
  const clients = out['clients']
  const invites = out['invites']

  const summary = {
    leagues: {
      has_commissioner_auth_user_id: leagues ? hasAttr(leagues.attrs, 'commissioner_auth_user_id') : false,
      has_commissioner: leagues ? hasAttr(leagues.attrs, 'commissioner') : false,
      has_owner_client_id: leagues ? hasAttr(leagues.attrs, 'owner_client_id') : false,
      indexes: leagues?.indexes || []
    },
    league_memberships: {
      has_auth_user_id: memberships ? hasAttr(memberships.attrs, 'auth_user_id') : false,
      has_client_id: memberships ? hasAttr(memberships.attrs, 'client_id') : false,
      has_unique_league_user: memberships ? (memberships.indexes || []).some((i: any) => i.type === 'unique' && Array.isArray(i.attributes) && i.attributes.join(',') === 'league_id,auth_user_id') : false,
      indexes: memberships?.indexes || []
    },
    fantasy_teams: {
      has_owner_auth_user_id: teams ? hasAttr(teams.attrs, 'owner_auth_user_id') : false,
      has_owner_client_id: teams ? hasAttr(teams.attrs, 'owner_client_id') : false,
      has_auth_user_id: teams ? hasAttr(teams.attrs, 'auth_user_id') : false,
      indexes: teams?.indexes || []
    },
    clients: {
      has_auth_user_id: clients ? hasAttr(clients.attrs, 'auth_user_id') : false,
      indexes: clients?.indexes || []
    },
    invites: {
      has_invited_by_auth_user_id: invites ? hasAttr(invites.attrs, 'invited_by_auth_user_id') : false,
      indexes: invites?.indexes || []
    }
  }

  console.log('SCHEMA INSPECTION:')
  console.log(JSON.stringify(summary, null, 2))

  // Helpful diffs
  const actions: string[] = []
  if (!summary.leagues.has_commissioner_auth_user_id) actions.push('leagues: add commissioner_auth_user_id (string:64) + index')
  if (!summary.leagues.has_commissioner && !summary.leagues.has_owner_client_id) actions.push('leagues: ensure one owner pointer exists (commissioner_auth_user_id preferred)')

  if (!summary.league_memberships.has_auth_user_id) actions.push('league_memberships: add auth_user_id (string:64)')
  if (!summary.league_memberships.has_unique_league_user) actions.push('league_memberships: add UNIQUE(league_id, auth_user_id) index')

  if (!summary.fantasy_teams.has_owner_auth_user_id) actions.push('fantasy_teams: add owner_auth_user_id (string:64) + index')

  if (!summary.invites.has_invited_by_auth_user_id) actions.push('invites: add invited_by_auth_user_id (string:64)')

  console.log('\nRECOMMENDED MIGRATIONS:')
  console.log(actions.map(a => `- ${a}`).join('\n') || '- none')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


