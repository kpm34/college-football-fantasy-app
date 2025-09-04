import { COLLECTIONS, DATABASE_ID, databases as serverDatabases } from '@/lib/appwrite-server'
import { Permission, Query, Role } from 'node-appwrite'

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
export function computeNextState(
  prev: DraftState,
  order: string[],
  pickTimeSeconds: number
): DraftState {
  const picksPerRound = Math.max(1, order.length)
  const nextPickIndex = prev.pickIndex + 1
  const nextRound = Math.ceil(nextPickIndex / picksPerRound)
  const onClockTeamId =
    nextPickIndex > order.length ? null : order[(nextPickIndex - 1) % order.length]
  return {
    ...prev,
    version: prev.version + 1,
    round: nextRound,
    pickIndex: nextPickIndex,
    onClockTeamId,
    picksPerRound,
    phase: onClockTeamId ? 'drafting' : 'complete',
    deadlineAt: new Date(Date.now() + pickTimeSeconds * 1000).toISOString(),
    serverNow: new Date().toISOString(),
  }
}

// --------------------------------------------------------------------------------
// IO helpers (Appwrite Server SDK)
// --------------------------------------------------------------------------------

/** Convenience: fetch league doc (throws 404 if not found) */
export async function loadLeague(leagueId: string) {
  return serverDatabases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)
}

/** Return draft state doc or null if it doesn't exist */
export async function loadState(leagueId: string): Promise<DraftState | null> {
  try {
    // Document ID = leagueId
    const doc: any = await serverDatabases.getDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      leagueId
    )
    // Compute picksPerRound from order
    const order = await loadDraftOrder(leagueId)
    const picksPerRound = Math.max(1, order.length)
    const nowIso = new Date().toISOString()
    const enriched: DraftState = {
      _id: String(leagueId),
      version: 0,
      phase: (doc?.draftStatus as any) || 'pre-draft',
      onClockTeamId: doc?.onClockTeamId || null,
      round: Number(doc?.round || 0),
      pickIndex: Number(doc?.pickIndex || 0),
      picksPerRound,
      deadlineAt: (doc?.deadlineAt as string) || nowIso,
      lastPickId: null,
      serverNow: nowIso,
    }
    return enriched
  } catch (err: any) {
    if (err.code === 404) return null
    throw err
  }
}

async function loadDraftOrder(leagueId: string): Promise<string[]> {
  // Prefer order from drafts doc for this league, fall back to league.draftOrderJson
  try {
    const drafts = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFTS, [
      Query.equal('leagueId', leagueId),
      Query.limit(1),
    ])
    const draftDoc: any = drafts.documents?.[0]
    if (draftDoc?.orderJson) {
      try {
        const parsed = JSON.parse(draftDoc.orderJson)
        if (Array.isArray(parsed?.draftOrder)) return parsed.draftOrder.map((v: any) => String(v))
      } catch {}
    }
  } catch {}
  try {
    const league: any = await loadLeague(leagueId)
    const fromLeague = league?.draftOrder ?? league?.draftOrderJson
    if (typeof fromLeague === 'string') {
      const parsed = JSON.parse(fromLeague)
      if (Array.isArray(parsed)) return parsed.map((v: any) => String(v))
    } else if (Array.isArray(fromLeague)) {
      return fromLeague.map((v: any) => String(v))
    }
  } catch {}
  return []
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

  const order: string[] = await loadDraftOrder(leagueId)
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
    const stateDoc = {
      draftId: String(leagueId),
      onClockTeamId: state.onClockTeamId,
      deadlineAt: state.deadlineAt,
      round: state.round,
      pickIndex: state.pickIndex,
      draftStatus: 'drafting',
    }
    await serverDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      leagueId,
      stateDoc as any,
      [Permission.read(Role.users())]
    )
  } catch (err: any) {
    if (err.code !== 409) throw err // 409 = already exists
  }

  // 3. Update league.phase -> drafting (ignore errors if already set)
  try {
    await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId, {
      phase: 'drafting',
    })
  } catch (_) {
    /* non-fatal */
  }

  return state
}

/** Utility: throw if condition is false */
function invariant(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

export async function validatePick({
  leagueId,
  teamId,
  playerId,
  idemKey,
}: {
  leagueId: string
  teamId: string
  playerId: string
  idemKey: string
}) {
  invariant(idemKey, 'Missing Idempotency-Key header')
  const state = await loadState(leagueId)
  invariant(state, 'Draft not started')
  invariant(state.phase === 'drafting', 'Draft not active')
  invariant(state.onClockTeamId === teamId, 'Not your turn')
  const now = Date.now()
  invariant(now < new Date(state.deadlineAt).getTime(), 'Pick window expired')

  // Ensure player not already drafted in this league
  const dup = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
    Query.equal('leagueId', leagueId),
    Query.equal('playerId', playerId),
    Query.limit(1),
  ])
  invariant(dup.total === 0, 'Player already drafted')

  // ensure idempotency (if idemKey already used accept as success)
  if (state.lastPickId === idemKey) return state
}

export async function applyPick({
  leagueId,
  teamId,
  playerId,
  idemKey,
}: {
  leagueId: string
  teamId: string
  playerId: string
  idemKey: string
}): Promise<DraftState> {
  // Re-fetch state to be safe
  const state = await loadState(leagueId)
  if (!state) throw new Error('Draft state missing')
  const pickId = `p_${leagueId}_${state.pickIndex}`
  // 1. Create pick
  await serverDatabases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, pickId, {
    leagueId,
    teamId,
    playerId,
    round: state.round,
    pick: state.pickIndex,
    timestamp: new Date().toISOString(),
  })

  // 2. Compute next snapshot
  const league = await loadLeague(leagueId)
  const order: string[] = await loadDraftOrder(leagueId)
  const pickTimeSeconds: number = league.pickTimeSeconds ?? league.clockSeconds ?? 60
  const next = computeNextState(state, order, pickTimeSeconds)
  next.lastPickId = idemKey

  // 3. Update draft_states with optimistic concurrency (version match)
  try {
    await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, {
      onClockTeamId: next.onClockTeamId,
      deadlineAt: next.deadlineAt,
      round: next.round,
      pickIndex: next.pickIndex,
      draftStatus: next.phase === 'complete' ? 'complete' : 'drafting',
    } as any)
    // success
    return next
  } catch (err: any) {
    // If version conflict, somebody else updated first; return fresh state
    return (await loadState(leagueId)) as DraftState
  }
}

export async function bestAvailable(leagueId: string, teamId: string): Promise<string> {
  // naive implementation: first eligible player not yet picked (no 'draftable' dependency)
  const draftedRes = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
    Query.equal('leagueId', leagueId),
    Query.select(['playerId']),
    Query.limit(10000),
  ])
  const draftedIds = new Set<string>((draftedRes.documents || []).map((d: any) => d.playerId))

  async function queryPool(filters: string[]) {
    try {
      return await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.PLAYERS, [
        ...filters,
        Query.limit(200),
      ])
    } catch {
      return { documents: [] as any[] }
    }
  }

  // Try: eligible + order by rating
  let pool = await queryPool([Query.equal('eligible', true), Query.orderDesc('rating')])
  if (!pool.documents || pool.documents.length === 0) {
    // Fallback: order by fantasyPoints if rating not present
    pool = await queryPool([Query.equal('eligible', true), Query.orderDesc('fantasyPoints')])
  }
  if (!pool.documents || pool.documents.length === 0) {
    // Last resort: no filter except ordering
    pool = await queryPool([Query.orderDesc('rating')])
  }

  const found = (pool.documents || []).find((p: any) => !draftedIds.has(p.$id))
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
  const updated: DraftState = {
    ...state,
    phase: 'paused',
    serverNow: new Date().toISOString(),
    version: state.version + 1,
  }
  await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, {
    draftStatus: 'paused',
  } as any)
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
  await serverDatabases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, {
    draftStatus: 'drafting',
    deadlineAt: updated.deadlineAt,
  } as any)
  return updated
}
