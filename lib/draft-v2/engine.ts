import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite'

export interface DraftState {
  /** leagueId acts as document ID */
  _id: string
  /** optimistic-concurrency revision */
  version: number
  phase: 'scheduled' | 'drafting' | 'paused' | 'complete' | 'canceled' | 'failed'
  /** team currently on the clock (fantasy team id) */
  onClockTeamId: string | null
  /** current round (1-based) */
  round: number
  /** overall pick number (1-based) */
  pickIndex: number
  /** picks per round == number of teams */
  picksPerRound: number
  /** ISO timestamp of the current deadline */
  deadlineAt: string
  /** Idempotency-Key of last accepted pick */
  lastPickId: string | null
  /** server timestamp to sync client clock */
  serverNow: string
}

/*
 * Tiny, pure helper that returns the next draft state given the previous
 * snapshot and the immutable draft order. It does NOT perform IO.
 */
export function computeNextState(prev: DraftState, order: string[], pickTimeSeconds: number): DraftState {
  const nextPickIndex = prev.pickIndex + 1
  const nextRound = Math.ceil(nextPickIndex / prev.picksPerRound)
  const onClockTeamId = nextPickIndex > order.length ? null : order[(nextPickIndex - 1) % order.length]
  return {
    ...prev,
    version: prev.version + 1,
    round: nextRound,
    pickIndex: nextPickIndex,
    onClockTeamId,
    phase: onClockTeamId ? 'drafting' : 'complete',
    deadlineAt: new Date(Date.now() + pickTimeSeconds * 1000).toISOString(),
    serverNow: new Date().toISOString(),
  }
}

// --------------------------------------------------------------------------------
// IO helpers (Appwrite SDK) — stub implementations for now; to be filled out later.
// --------------------------------------------------------------------------------

/** Convenience: fetch league doc (throws 404 if not found) */
export async function loadLeague(leagueId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)
}

/** Return draft state doc or null if it doesn't exist */
export async function loadState(leagueId: string): Promise<DraftState | null> {
  try {
    // Document ID = leagueId
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId)
    return doc as unknown as DraftState
  } catch (err: any) {
    if (err.code === 404) return null
    throw err
  }
}

/**
 * Seed draft_state document and set league.phase="drafting".
 * Idempotent: if state already exists, returns it.
 */
export async function startDraft(leagueId: string): Promise<DraftState> {
  // 1. Fetch league to read order & settings
  const league: any = await loadLeague(leagueId)
  if (!league) throw new Error('League not found')
  if (league.phase && league.phase !== 'scheduled') {
    // Already started – return existing state
    const existing = await loadState(leagueId)
    if (existing) return existing
    throw new Error(`Cannot start draft; league.phase=${league.phase}`)
  }

  const order: string[] = league.draftOrder ?? JSON.parse(league.draftOrderJson || '[]')
  if (!order.length) throw new Error('League missing draftOrder')

  const pickTimeSeconds: number = league.pickTimeSeconds ?? league.clockSeconds ?? 60

  const now = new Date()
  const state: DraftState = {
    _id: leagueId,
    version: 1,
    phase: 'drafting',
    onClockTeamId: order[0],
    round: 1,
    pickIndex: 1,
    picksPerRound: order.length,
    deadlineAt: new Date(now.getTime() + pickTimeSeconds * 1000).toISOString(),
    lastPickId: null,
    serverNow: now.toISOString(),
  }

  // 2. Try to create draft_states document; if it already exists, fall back to get
  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, state as any)
  } catch (err: any) {
    if (err.code !== 409) throw err // 409 = already exists
  }

  // 3. Update league.phase -> drafting (ignore errors if already set)
  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId, { phase: 'drafting' })
  } catch (_) {/* non-fatal */}

  return state
}

/** Utility: throw if condition is false */
function invariant(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

export async function validatePick({ leagueId, teamId, playerId, idemKey }: { leagueId: string; teamId: string; playerId: string; idemKey: string }) {
  invariant(idemKey, 'Missing Idempotency-Key header')
  const state = await loadState(leagueId)
  invariant(state, 'Draft not started')
  invariant(state.phase === 'drafting', 'Draft not active')
  invariant(state.onClockTeamId === teamId, 'Not your turn')
  const now = Date.now()
  invariant(now < new Date(state.deadlineAt).getTime(), 'Pick window expired')

  // Ensure player not already drafted in this league
  const dup = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
    Query.equal('leagueId', leagueId),
    Query.equal('playerId', playerId),
    Query.limit(1),
  ])
  invariant(dup.total === 0, 'Player already drafted')

  // ensure idempotency (if idemKey already used accept as success)
  if (state.lastPickId === idemKey) return state
}

export async function applyPick({ leagueId, teamId, playerId, idemKey }: { leagueId: string; teamId: string; playerId: string; idemKey: string }): Promise<DraftState> {
  // Re-fetch state to be safe
  const state = await loadState(leagueId)
  if (!state) throw new Error('Draft state missing')
  const pickId = `p_${leagueId}_${state.pickIndex}`
  // 1. Create pick
  await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, pickId, {
    leagueId,
    teamId,
    playerId,
    round: state.round,
    pick: state.pickIndex,
    timestamp: new Date().toISOString(),
  })

  // 2. Compute next snapshot
  const league = await loadLeague(leagueId)
  const order: string[] = league.draftOrder ?? JSON.parse(league.draftOrderJson || '[]')
  const pickTimeSeconds: number = league.pickTimeSeconds ?? league.clockSeconds ?? 60
  const next = computeNextState(state, order, pickTimeSeconds)
  next.lastPickId = idemKey

  // 3. Update draft_states with optimistic concurrency (version match)
  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, next as any)
    // success
    return next
  } catch (err: any) {
    // If version conflict, somebody else updated first; return fresh state
    return (await loadState(leagueId)) as DraftState
  }
}

export async function bestAvailable(leagueId: string, teamId: string): Promise<string> {
  // naive implementation: first draftable eligible player not yet picked
  const draftedRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
    Query.equal('leagueId', leagueId),
    Query.select(['playerId']),
    Query.limit(10000),
  ])
  const draftedIds = new Set<string>(draftedRes.documents.map((d: any) => d.playerId))

  const pool = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PLAYERS, [
    Query.equal('draftable', true),
    Query.equal('eligible', true),
    Query.orderDesc('rating'),
    Query.limit(100),
  ])
  const found = pool.documents.find((p: any) => !draftedIds.has(p.$id))
  if (!found) throw new Error('No players available')
  return found.$id
}

export async function maybeAutopick(leagueId: string): Promise<void> {
  const state = await loadState(leagueId)
  if (!state || state.phase !== 'drafting') return
  if (Date.now() < new Date(state.deadlineAt).getTime()) return // not expired

  const autoPlayerId = await bestAvailable(leagueId, state.onClockTeamId || '')
  const idemKey = `AUTOPICK-${Date.now()}`
  await applyPick({ leagueId, teamId: state.onClockTeamId || '', playerId: autoPlayerId, idemKey })
}

export async function pauseDraft(leagueId: string): Promise<DraftState> {
  const state = await loadState(leagueId)
  if (!state) throw new Error('Draft state not found')
  if (state.phase !== 'drafting') throw new Error('Draft not active')
  const updated: DraftState = { ...state, phase: 'paused', serverNow: new Date().toISOString(), version: state.version + 1 }
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, updated as any)
  return updated
}

export async function resumeDraft(leagueId: string): Promise<DraftState> {
  const state = await loadState(leagueId)
  if (!state) throw new Error('Draft state not found')
  if (state.phase !== 'paused') throw new Error('Draft is not paused')
  const league = await loadLeague(leagueId)
  const pickTimeSeconds: number = league.pickTimeSeconds ?? league.clockSeconds ?? 60
  const updated: DraftState = {
    ...state,
    phase: 'drafting',
    deadlineAt: new Date(Date.now() + pickTimeSeconds * 1000).toISOString(),
    serverNow: new Date().toISOString(),
    version: state.version + 1,
  }
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, updated as any)
  return updated
}
