// Appwrite Function: on-league-membership-change
// Trigger: databases.*.collections.fantasy_teams.documents.* (create/update/delete)
// Purpose: Keep `leagues.currentTeams` and `leagues.leagueStatus` up-to-date

import type { Models } from 'node-appwrite'
import { Client, Databases, Query } from 'node-appwrite'

type EventPayload = {
  $id?: string
  leagueId?: string
  data?: { $id?: string; leagueId?: string }
}

export async function main(_req: unknown): Promise<{ ok: boolean; leagueId?: string; currentTeams?: number; leagueStatus?: string }> {
  // Build client from environment
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
  const project = process.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_FUNCTION_PROJECT_ID || 'college-football-fantasy-app'
  const apiKey = process.env.APPWRITE_API_KEY || ''
  const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'

  const client = new Client().setEndpoint(endpoint).setProject(project)
  if (apiKey) client.setKey(apiKey)
  const databases = new Databases(client)

  // Extract event payload
  let payload: EventPayload = {}
  try {
    const raw = process.env.APPWRITE_FUNCTION_EVENT_DATA || process.env.APPWRITE_FUNCTION_EVENT_PAYLOAD
    if (raw) payload = JSON.parse(raw)
  } catch {}

  const doc = (payload as any) as Models.Document
  const leagueId = (doc as any)?.leagueId || payload.leagueId || payload?.data?.leagueId
  if (!leagueId) {
    console.log('[on-league-membership-change] No leagueId found in payload; skipping')
    return { ok: true }
  }

  // Load league to get maxTeams
  let maxTeams = 12
  try {
    const league = await databases.getDocument(databaseId, 'leagues', leagueId as string)
    maxTeams = Number((league as any)?.maxTeams || 12)
  } catch (e) {
    console.log('[on-league-membership-change] Could not load league, defaulting maxTeams=12')
  }

  // Count current teams in fantasy_teams for this league
  let currentTeams = 0
  try {
    const res = await databases.listDocuments(databaseId, 'fantasy_teams', [
      Query.equal('leagueId', leagueId as string),
      Query.limit(200)
    ])
    currentTeams = (res as any).total ?? res.documents.length
  } catch (e) {
    console.error('[on-league-membership-change] Failed to count fantasy teams:', e)
  }

  // Update league document with currentTeams and leagueStatus
  const leagueStatus = currentTeams >= maxTeams ? 'closed' : 'open'
  try {
    await databases.updateDocument(databaseId, 'leagues', leagueId as string, {
      currentTeams,
      leagueStatus
    } as any)
  } catch (e) {
    console.error('[on-league-membership-change] Failed to update league:', e)
  }

  return { ok: true, leagueId, currentTeams, leagueStatus }
}

export default main


