#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Client, Databases, ID, Query } from 'node-appwrite'

const endpoint = (process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1').trim()
const project = (process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app').trim()
const databaseId = (process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy').trim()
const apiKey = process.env.APPWRITE_API_KEY

if (!apiKey) {
  console.error('APPWRITE_API_KEY missing in environment (.env.local)')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
const db = new Databases(client)

async function listAll(collectionId: string, baseQueries: string[] = []): Promise<any[]> {
  const results: any[] = []
  let offset = 0
  const pageSize = 100
  while (true) {
    const queries = [...baseQueries, Query.limit(pageSize) as unknown as string, Query.offset(offset) as unknown as string]
    const res: any = await db.listDocuments(databaseId, collectionId, queries as any)
    results.push(...(res.documents || []))
    if (!res.documents || res.documents.length < pageSize) break
    offset += pageSize
  }
  return results
}

async function ensureTeamsForActiveMembers() {
  const MEMBERS = 'league_memberships'
  const TEAMS = 'fantasy_teams'

  console.log('Auditing memberships and teams...')
  const memberships = await listAll(MEMBERS)
  const active = memberships.filter((m: any) => (m.status || 'ACTIVE').toUpperCase() === 'ACTIVE')
  console.log(`Active memberships: ${active.length}`)

  const teams = await listAll(TEAMS)
  const teamKey = (t: any) => `${t.league_id}|${t.owner_auth_user_id}`
  const have = new Set(teams.map(teamKey))

  const missing = active.filter((m: any) => !have.has(`${m.league_id}|${m.auth_user_id}`))
  console.log(`Missing fantasy_teams to create: ${missing.length}`)

  let created = 0
  for (const m of missing) {
    try {
      const name = m.display_name || 'Team'
      await db.createDocument(databaseId, TEAMS, ID.unique(), {
        league_id: m.league_id,
        owner_auth_user_id: m.auth_user_id,
        name,
        wins: 0,
        losses: 0,
        ties: 0,
      })
      created++
      console.log(`Created team for user ${m.auth_user_id} in league ${m.league_id}`)
    } catch (err: any) {
      console.error('Create failed', m.league_id, m.auth_user_id, err?.message || err)
    }
  }

  console.log('Summary:')
  console.log('  Active memberships:', active.length)
  console.log('  Existing teams    :', teams.length)
  console.log('  Created teams     :', created)
}

ensureTeamsForActiveMembers().catch((e) => {
  console.error(e)
  process.exit(1)
})


