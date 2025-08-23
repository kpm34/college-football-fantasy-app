#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases, Query } from 'node-appwrite'

type Mapping = Record<string, { action: string; target: string | null; notes?: string }>

function getEnv(name: string, fallback?: string): string {
  const raw = process.env[name] ?? fallback
  if (!raw) throw new Error(`Missing env ${name}`)
  return raw.replace(/^"|"$/g, '').trim()
}

async function count(databases: Databases, databaseId: string, collectionId: string): Promise<number> {
  try {
    const res = await databases.listDocuments(databaseId, collectionId, [Query.limit(1) as any])
    return (res as any).total ?? res.documents.length
  } catch {
    return 0
  }
}

async function listSome(databases: Databases, databaseId: string, collectionId: string, n = 10) {
  try { return await databases.listDocuments(databaseId, collectionId, [Query.limit(n) as any]) } catch { return { documents: [] } as any }
}

async function main() {
  const endpoint = getEnv('APPWRITE_ENDPOINT', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  const projectId = getEnv('APPWRITE_PROJECT_ID', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  const apiKey = getEnv('APPWRITE_API_KEY')
  const databaseId = getEnv('APPWRITE_DATABASE_ID', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databases = new Databases(client)

  const mappingPath = path.join(process.cwd(), 'schema', 'schema_mapping.json')
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as Mapping

  const pairs: Array<{ oldId: string; targetId: string; action: string; oldCount: number; newCount: number; status: 'ok'|'warn'|'info' }>=[]

  // Count comparisons per mapping
  const mergeTotals: Record<string, { sumOld: number; newCount: number }> = {}
  for (const [oldId, info] of Object.entries(mapping)) {
    if (!info.target) continue
    const oldCount = await count(databases, databaseId, oldId)
    const newCount = await count(databases, databaseId, info.target)
    let status: 'ok'|'warn'|'info' = 'ok'
    if (info.action.startsWith('keep') || info.action === 'rename' || info.action === 'keep_rename') {
      status = oldCount === newCount ? 'ok' : 'warn'
    } else if (info.action === 'merge') {
      status = 'info'
      mergeTotals[info.target] = mergeTotals[info.target] || { sumOld: 0, newCount }
      mergeTotals[info.target].sumOld += oldCount
      mergeTotals[info.target].newCount = newCount
    } else {
      status = 'info'
    }
    pairs.push({ oldId, targetId: info.target, action: info.action, oldCount, newCount, status })
  }

  const merges: Array<{ targetId: string; sumOld: number; newCount: number; status: 'ok'|'warn' }>=[]
  for (const [targetId, val] of Object.entries(mergeTotals)) {
    const ok = val.newCount >= val.sumOld * 0.95 // allow small tolerance
    merges.push({ targetId, sumOld: val.sumOld, newCount: val.newCount, status: ok ? 'ok' : 'warn' })
  }

  // Spot checks
  const spot: any = { playersSchools: { ok: 0, total: 0 }, lineupsPoints: { ok: 0, total: 0, mismatches: [] as any[] }, projections: { ok: 0, total: 0, mismatches: [] as any[] } }

  // a) 10 players have valid school
  const playersSome = await listSome(databases, databaseId, 'college_players', 10)
  for (const p of (playersSome as any).documents ?? []) {
    spot.playersSchools.total++
    const sid = p.school_id
    if (!sid) continue
    try { await databases.getDocument(databaseId, 'schools', sid); spot.playersSchools.ok++ } catch {}
  }

  // b) 10 lineups points match corresponding matchup
  const lineupsSome = await listSome(databases, databaseId, 'lineups', 10)
  for (const l of (lineupsSome as any).documents ?? []) {
    spot.lineupsPoints.total++
    const teamId = l.fantasy_team_id || l.rosterId
    const season = l.season
    const week = l.week
    if (!teamId || season == null || week == null) { continue }
    try {
      const team = await databases.getDocument(databaseId, 'fantasy_teams', teamId)
      const leagueId = (team as any).league_id
      const matches = await databases.listDocuments(databaseId, 'matchups', [Query.equal('league_id', leagueId) as any, Query.equal('season', season) as any, Query.equal('week', week) as any, Query.limit(10) as any])
      const m = (matches as any).documents.find((m: any) => m.home_team_id === teamId || m.away_team_id === teamId)
      if (!m) continue
      const mPoints = m.home_team_id === teamId ? (m.home_points || 0) : (m.away_points || 0)
      if ((l.points || 0) === (mPoints || 0)) spot.lineupsPoints.ok++
      else spot.lineupsPoints.mismatches.push({ lineup: l.$id, lineupPoints: l.points || 0, matchup: m.$id, matchupPoints: mPoints })
    } catch {}
  }

  // c) 10 projections match by key
  const projsSome = await listSome(databases, databaseId, 'projections', 10)
  for (const pr of (projsSome as any).documents ?? []) {
    spot.projections.total++
    const period = pr.period
    let sourceCol = 'player_projections'
    if (period === 'weekly') sourceCol = 'projections_weekly'
    if (period === 'yearly') sourceCol = 'projections_yearly'
    if (pr.source === 'custom') sourceCol = 'user_custom_projections'
    try {
      const candidates = await databases.listDocuments(databaseId, sourceCol, [
        Query.equal('player_id', pr.player_id) as any,
        Query.equal('season', pr.season) as any,
        ...(pr.week != null ? [Query.equal('week', pr.week) as any] : []),
        Query.limit(1) as any
      ])
      const old = (candidates as any).documents[0]
      if (old && Number(old.fantasy_points || old.points || 0) === Number(pr.fantasy_points || 0)) spot.projections.ok++
      else spot.projections.mismatches.push({ projection: pr.$id, foundIn: sourceCol })
    } catch {}
  }

  const report = {
    summary: {
      pairsChecked: pairs.length,
      okPairs: pairs.filter((p) => p.status === 'ok').length,
      warnPairs: pairs.filter((p) => p.status === 'warn').length,
      mergeGroupsOk: merges.filter((m) => m.status === 'ok').length,
      mergeGroupsWarn: merges.filter((m) => m.status === 'warn').length,
    },
    counts: pairs,
    merges,
    spotChecks: spot
  }

  const outDir = path.join(process.cwd(), 'ops', 'out')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'parity_report.json')
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2))

  // Human summary
  console.log('Parity Check Summary')
  console.log(`Pairs OK: ${report.summary.okPairs}/${report.summary.pairsChecked} | Merge groups OK: ${report.summary.mergeGroupsOk}/${report.summary.mergeGroupsOk + report.summary.mergeGroupsWarn}`)
  console.log(`Spot: players-schools ${spot.playersSchools.ok}/${spot.playersSchools.total}, lineups-points ${spot.lineupsPoints.ok}/${spot.lineupsPoints.total}, projections ${spot.projections.ok}/${spot.projections.total}`)
  console.log(`Report written to ${outFile}`)

  // Post-cutover plan (informational)
  console.log('\nPost-cutover prerequisites:')
  console.log('- NEXT_PUBLIC_USE_NEW_SCHEMA=true in all environments')
  console.log('- ops/out/parity_report.json shows OK/within tolerance for every pair')
  console.log('- Smoke tests pass in CI')
  console.log('- No writes to old collections in last 24h (check activity_log)')
  console.log('\nThen: Freeze & backup legacy collections, export JSON snapshots, set read-only permissions while decommissioning.')
}

main().catch((e) => { console.error(e); process.exit(1) })


