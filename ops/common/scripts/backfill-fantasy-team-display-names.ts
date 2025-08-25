#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Client, Databases, Query, Users } from 'node-appwrite'

const endpoint = (process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1').trim()
const project = (process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app').trim()
const databaseId = (process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy').trim()
const apiKey = process.env.APPWRITE_API_KEY

if (!apiKey) {
  console.error('APPWRITE_API_KEY missing')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
const db = new Databases(client)
const users = new Users(client)

async function listAll(collectionId: string, baseQueries: string[] = []): Promise<any[]> {
  const results: any[] = []
  let offset = 0
  const page = 100
  while (true) {
    const q = [...baseQueries, Query.limit(page) as unknown as string, Query.offset(offset) as unknown as string]
    const res: any = await db.listDocuments(databaseId, collectionId, q as any)
    results.push(...(res.documents || []))
    if (!res.documents || res.documents.length < page) break
    offset += page
  }
  return results
}

async function getDisplayName(authUserId: string, leagueId: string): Promise<string | undefined> {
  try {
    const res: any = await db.listDocuments(
      databaseId,
      'league_memberships',
      [Query.equal('league_id', leagueId) as any, Query.equal('auth_user_id', authUserId) as any, Query.limit(1) as any] as any
    )
    const m = res.documents?.[0]
    if (m?.display_name) return String(m.display_name)
  } catch {}

  try {
    const res: any = await db.listDocuments(databaseId, 'clients', [Query.equal('auth_user_id', authUserId) as any, Query.limit(1) as any] as any)
    const c = res.documents?.[0]
    if (c?.display_name) return String(c.display_name)
  } catch {}

  try {
    const u: any = await users.get(authUserId)
    if (u?.name && String(u.name).trim()) return String(u.name)
    if (u?.email) return String(u.email).split('@')[0]
  } catch {}

  return undefined
}

async function main() {
  const TEAMS = 'fantasy_teams'
  const teams = await listAll(TEAMS)
  const targets = teams.filter((t: any) => (!t.display_name || t.display_name === null) && t.owner_auth_user_id)
  console.log('Teams missing display_name:', targets.length)

  let updated = 0
  for (const t of targets) {
    const dn = await getDisplayName(String(t.owner_auth_user_id), String(t.league_id))
    const finalName =
      dn || (t.name && String(t.name).trim() && !String(t.name).toLowerCase().startsWith('bot team')
        ? String(t.name)
        : `Team-${String(t.owner_auth_user_id).slice(-4)}`)
    try {
      await db.updateDocument(databaseId, TEAMS, t.$id, { display_name: finalName })
      updated++
      console.log('Updated', t.$id, '=>', finalName)
    } catch (e: any) {
      console.error('Update failed', t.$id, e?.message || e)
    }
  }
  console.log('Backfill complete. Updated:', updated)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
