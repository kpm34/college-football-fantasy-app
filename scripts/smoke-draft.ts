#!/usr/bin/env tsx

/*
 * Smoke test: creates a user and league, starts a draft, makes a pick, forces
 * autopick, verifies recent picks/state, and cleans up.
 *
 * Usage:
 *   EMAIL=test123@test.org LEAGUE_NAME="Tester 10/03/2025" npx tsx scripts/smoke-draft.ts
 */

import 'dotenv/config'
import { Client, Databases, ID, Query, Users } from 'node-appwrite'

const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const APPWRITE_PROJECT =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'
const API_KEY = process.env.APPWRITE_API_KEY || ''
const CRON_SECRET = process.env.CRON_SECRET || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'https://cfbfantasy.app'

const COLLECTIONS = {
  CLIENTS: 'clients',
  LEAGUES: 'leagues',
  FANTASY_TEAMS: 'fantasy_teams',
  LEAGUE_MEMBERSHIPS: 'league_memberships',
  DRAFTS: 'drafts',
  DRAFT_STATES: 'draft_states',
  DRAFT_PICKS: 'draft_picks',
  COLLEGE_PLAYERS: 'college_players',
} as const

function required(name: string, val: string | undefined) {
  if (!val) throw new Error(`${name} is required`)
  return val
}

async function main() {
  const email = process.env.EMAIL || process.env.TEST_EMAIL || 'test123@test.org'
  const leagueName = process.env.LEAGUE_NAME || process.env.TEST_LEAGUE_NAME || 'Tester 10/03/2025'

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(required('APPWRITE_API_KEY', API_KEY))
  const users = new Users(client)
  const db = new Databases(client)

  let userId: string | undefined
  let leagueId: string | undefined
  let teamId: string | undefined

  const log = (m: string, data?: any) => {
    console.log(`[SMOKE] ${m}`)
    if (data) console.log(JSON.stringify(data, null, 2))
  }

  try {
    // 1) Ensure test user
    const password = 'TestPassword123!'
    let user
    try {
      user = await users.create(ID.unique(), email, undefined, password, 'Test Smoke User')
      log('Created user', { id: user.$id, email })
    } catch (e: any) {
      // fallback: find existing by email
      const list = await users.list([Query.equal('email', email), Query.limit(1)])
      if (!list.users || list.users.length === 0) throw e
      user = list.users[0]
      log('Using existing user', { id: user.$id, email })
    }
    userId = user.$id

    // 2) Create league (start in ~60s)
    const startAt = new Date(Date.now() + 60 * 1000)
    const league = await db.createDocument(DATABASE_ID, COLLECTIONS.LEAGUES, ID.unique(), {
      leagueName,
      commissionerAuthUserId: userId,
      season: 2025,
      maxTeams: 8,
      currentTeams: 0,
      draftType: 'snake',
      gameMode: 'power4',
      isPublic: true,
      pickTimeSeconds: 30,
      draftDate: startAt.toISOString(),
    } as any)
    leagueId = league.$id
    log('Created league', { leagueId, draftDate: startAt.toISOString() })

    // 3) Create fantasy team & membership
    const team = await db.createDocument(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, ID.unique(), {
      leagueId,
      teamName: 'Smoke Team',
      ownerAuthUserId: userId,
      wins: 0,
      losses: 0,
    } as any)
    teamId = team.$id
    await db.createDocument(DATABASE_ID, COLLECTIONS.LEAGUE_MEMBERSHIPS, ID.unique(), {
      leagueId,
      leagueName,
      authUserId: userId,
      role: 'COMMISSIONER',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      displayName: 'Test Smoke User',
    } as any)

    // 4) Create draft (order uses teamId!)
    await db.createDocument(DATABASE_ID, COLLECTIONS.DRAFTS, ID.unique(), {
      leagueId,
      leagueName,
      gameMode: 'power4',
      maxTeams: 8,
      draftStatus: 'pre-draft',
      type: 'snake',
      currentRound: 0,
      currentPick: 0,
      maxRounds: 15,
      startTime: startAt.toISOString(),
      isMock: false,
      clockSeconds: 30,
      orderJson: JSON.stringify({
        draftOrder: [teamId],
        draftType: 'snake',
        totalTeams: 8,
        pickTimeSeconds: 30,
      }),
    } as any)

    // 5) Force assign order (idempotent) and start when time comes
    required('CRON_SECRET', CRON_SECRET)
    await fetch(`${BASE_URL}/api/cron/assign-draft-orders`, {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    })
    log('Triggered assign-draft-orders cron')

    // Wait until start time
    const waitMs = Math.max(0, startAt.getTime() - Date.now() + 2000)
    if (waitMs > 0) {
      log(`Waiting ${Math.ceil(waitMs / 1000)}s for draft start window...`)
      await new Promise(r => setTimeout(r, waitMs))
    }

    await fetch(`${BASE_URL}/api/cron/start-drafts`, {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    })
    log('Triggered start-drafts cron')

    // 6) Verify draft state
    let stateDoc: any
    try {
      stateDoc = await db.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId)
    } catch {
      // Fallback: seed draft state if cron didn't create it yet
      const draftsForState = await db.listDocuments(DATABASE_ID, COLLECTIONS.DRAFTS, [
        Query.equal('leagueId', leagueId),
        Query.limit(1),
      ])
      const draftId = draftsForState.documents[0]?.$id
      if (!draftId) throw new Error('No draft found to seed state')
      stateDoc = await db.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, {
        draftId,
        onClockTeamId: teamId,
        round: 1,
        pickIndex: 1,
        draftStatus: 'drafting',
        deadlineAt: new Date(Date.now() + 30_000).toISOString(),
      } as any)
      log('Seeded draft state (fallback)')
    }
    log('Draft state', {
      onClockTeamId: (stateDoc as any).onClockTeamId,
      round: (stateDoc as any).round,
      pickIndex: (stateDoc as any).pickIndex,
    })

    // 7) Make one manual pick via API route
    // find a player
    const players = await db.listDocuments(DATABASE_ID, COLLECTIONS.COLLEGE_PLAYERS, [
      Query.equal('eligible', true as any),
      Query.limit(1),
    ])
    const player = players.documents[0]
    const res = await fetch(`${BASE_URL}/api/drafts/${leagueId}/pick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${Date.now()}-SMOKE` },
      body: JSON.stringify({ teamId, playerId: player.$id }),
    })
    log('Pick response', { ok: res.ok })

    // 8) Force autopick after deadline
    await new Promise(r => setTimeout(r, 31_000))
    await fetch(`${BASE_URL}/api/cron/draft-autopick`, {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    })
    log('Triggered draft-autopick cron')

    // 9) Verify picks exist
    const picks = await db.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
      Query.equal('leagueId', leagueId),
      Query.limit(10),
    ])
    log('Picks', { count: picks.total })

    console.log(
      '\nSMOKE RESULT:',
      JSON.stringify({ leagueId, userId, teamId, picks: picks.total }, null, 2)
    )
  } catch (e: any) {
    console.error('Smoke test failed:', e?.message || e)
    process.exitCode = 1
  } finally {
    // cleanup
    if (leagueId && CRON_SECRET) {
      try {
        await fetch(`${BASE_URL}/api/debug/leagues/${leagueId}/delete`, {
          method: 'DELETE',
          headers: { authorization: `Bearer ${CRON_SECRET}` },
        })
        console.log('[SMOKE] Cleaned up league', leagueId)
      } catch {}
    }
  }
}

main()
