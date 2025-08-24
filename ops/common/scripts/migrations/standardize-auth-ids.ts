#!/usr/bin/env tsx

/**
 * Standardize Auth IDs and Display Names
 * - fantasy_teams.display_name <= Auth Users name/email
 * - league_memberships.client_id <= Auth user id (not clients doc id)
 * - league_memberships.display_name <= Auth Users name/email (or clients.display_name)
 */

import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { Client, Databases, Users, Query } from 'node-appwrite'

// Load production env first if present, else local
const prodEnvPath = path.resolve(process.cwd(), '.vercel/.env.production.local')
if (fs.existsSync(prodEnvPath)) {
  dotenv.config({ path: prodEnvPath })
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

function sanitize(raw: string | undefined): string { return (raw || '').replace(/^"|"$/g, '').trim() }

const APPWRITE_ENDPOINT = sanitize(process.env.APPWRITE_ENDPOINT) || sanitize(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
const APPWRITE_PROJECT_ID = sanitize(process.env.APPWRITE_PROJECT_ID) || sanitize(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
const APPWRITE_API_KEY = sanitize(process.env.APPWRITE_API_KEY)
const DATABASE_ID = sanitize(process.env.DATABASE_ID) || sanitize(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) || 'college-football-fantasy'

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('Missing Appwrite env. endpoint/project/apiKey required.')
  process.exit(1)
}

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY)
const databases = new Databases(client)
const users = new Users(client)

const FANTASY_TEAMS = 'fantasy_teams'
const LEAGUE_MEMBERSHIPS = 'league_memberships'
const CLIENTS = 'clients'
const USERS_ALIAS = 'users'

async function paginateList(collection: string, queries: any[] = [], pageSize = 1000) {
  const docs: any[] = []
  let offset = 0
  // Appwrite supports limit up to 100; some setups allow more. We'll loop defensively.
  const limit = Math.min(pageSize, 1000)
  while (true) {
    const res: any = await databases.listDocuments(DATABASE_ID, collection, [...queries, Query.limit(limit), Query.offset(offset)])
    if (!res || !Array.isArray(res.documents) || res.documents.length === 0) break
    docs.push(...res.documents)
    offset += res.documents.length
    if (res.documents.length < limit) break
  }
  return docs
}

async function getClientDoc(id: string): Promise<any | null> {
  try { return await databases.getDocument(DATABASE_ID, CLIENTS, id) } catch { /* try alias */ }
  try { return await databases.getDocument(DATABASE_ID, USERS_ALIAS, id) } catch { /* no-op */ }
  return null
}

async function run() {
  const result = { fantasyTeamsUpdated: 0, membershipsUpdated: 0, missingUsers: 0 }

  // 1) Backfill fantasy_teams.display_name from Auth
  const teams = await paginateList(FANTASY_TEAMS)
  for (const t of teams) {
    const ownerId: string | undefined = t.owner_client_id || t.client_id || t.owner
    if (!ownerId || ownerId.startsWith('BOT-')) continue
    try {
      const u: any = await users.get(ownerId)
      const display = u.name || u.email || 'Unknown User'
      if (t.display_name !== display) {
        await databases.updateDocument(DATABASE_ID, FANTASY_TEAMS, t.$id, { display_name: display })
        result.fantasyTeamsUpdated++
      }
    } catch {
      result.missingUsers++
    }
  }

  // 2) Normalize league_memberships.client_id to Auth user id and backfill display_name
  const memberships = await paginateList(LEAGUE_MEMBERSHIPS)
  for (const m of memberships) {
    const currentClientId: string | undefined = m.client_id
    if (!currentClientId) continue
    let desiredId: string | undefined = currentClientId
    let display = m.display_name as string | undefined
    try {
      const u: any = await users.get(currentClientId)
      desiredId = u.$id
      display = display || u.name || u.email
    } catch {
      const clientDoc = await getClientDoc(currentClientId)
      if (clientDoc?.auth_user_id) {
        desiredId = clientDoc.auth_user_id
        display = display || clientDoc.display_name || clientDoc.email
      }
    }
    const payload: any = {}
    if (desiredId && desiredId !== m.client_id) payload.client_id = desiredId
    if (display && display !== m.display_name) payload.display_name = display
    if (Object.keys(payload).length > 0) {
      await databases.updateDocument(DATABASE_ID, LEAGUE_MEMBERSHIPS, m.$id, payload)
      result.membershipsUpdated++
    }
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2))
}

run().catch((e) => { console.error(e); process.exit(1) })


