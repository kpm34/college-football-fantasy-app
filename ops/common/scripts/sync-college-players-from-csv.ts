#!/usr/bin/env -S node -r esbuild-register
/**
 * Sync college_players from a CSV (exports/skill_positions_2025.csv)
 * - Dry-run by default (shows adds/updates/deactivations)
 * - Apply mode performs upserts and soft-deactivations (draftable=false)
 * - Handles pagination (cursor or offset fallback)
 *
 * Usage:
 *   npx tsx scripts/sync-college-players-from-csv.ts --csv exports/skill_positions_2025.csv --dry-run
 *   npx tsx scripts/sync-college-players-from-csv.ts --csv exports/skill_positions_2025.csv --apply
 */
import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases, ID, Query } from 'node-appwrite'

type CsvRow = {
  conference: string
  team: string
  name: string
  jersey: string
  pos: string
  height: string
  weight: string
  class: string
  source_file: string
}

type DBPlayer = {
  $id: string
  name: string
  position: string
  team: string
  conference: string
  jerseyNumber?: number
  height?: string
  weight?: number
  year?: string
  eligible?: boolean
  [key: string]: unknown
}

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''
const COLLECTION_ID = 'college_players'

function fail(msg: string): never {
  console.error(`Error: ${msg}`)
  process.exit(1)
}

function parseArgs(): {
  csvPath: string
  apply: boolean
  dryRun: boolean
  onlyPower4: boolean
  teams: string[] | null
  start: number | null
  count: number | null
  outPath: string | null
} {
  const args = process.argv.slice(2)
  let csvPath = 'exports/skill_positions_2025.csv'
  let apply = false
  let dryRun = true
  let onlyPower4 = false
  let teams: string[] | null = null
  let start: number | null = null
  let count: number | null = null
  let outPath: string | null = null
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if ((a === '--csv' || a === '-c') && args[i + 1]) {
      csvPath = args[++i]
    } else if (a === '--apply') {
      apply = true
      dryRun = false
    } else if (a === '--dry-run') {
      dryRun = true
      apply = false
    } else if (a === '--only-power4' || a === '--power4') {
      onlyPower4 = true
    } else if ((a === '--teams' || a === '-t') && args[i + 1]) {
      teams = args[++i].split(',').map(s => s.trim()).filter(Boolean)
    } else if (a === '--start' && args[i + 1]) {
      start = Number.parseInt(args[++i], 10)
      if (!Number.isFinite(start)) start = 0
    } else if (a === '--count' && args[i + 1]) {
      count = Number.parseInt(args[++i], 10)
      if (!Number.isFinite(count)) count = 10
    } else if ((a === '--out' || a === '--out-path') && args[i + 1]) {
      outPath = args[++i]
    }
  }
  return { csvPath, apply, dryRun, onlyPower4, teams, start, count, outPath }
}

function normalizePosition(pos: string): string {
  const p = (pos || '').trim().toUpperCase()
  if (p === 'PK' || p === 'K/P' || p === 'P/K' || p === 'KO') return 'K'
  return p
}

function normalizeTeamName(team: string): string {
  const t = (team || '').trim()
  // Normalize whitespace and punctuation for comparison key
  return t.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

function normalizeName(name: string): string {
  return (name || '').trim().replace(/\s+/g, ' ');
}

function buildKey(name: string, team: string, pos: string): string {
  return `${normalizeName(name).toLowerCase()}|${normalizeTeamName(team)}|${normalizePosition(pos)}`
}

function isPower4(conf: string): boolean {
  const c = (conf || '').toLowerCase()
  return c === 'sec' || c === 'acc' || c === 'big 12' || c === 'big twelve' || c === 'big ten'
}

function readCsv(csvPath: string): CsvRow[] {
  if (!fs.existsSync(csvPath)) fail(`CSV not found at ${csvPath}`)
  const text = fs.readFileSync(csvPath, 'utf8')
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = lines.shift()
  if (!header) return []
  const cols = header.split(',')
  const idx: Record<string, number> = {}
  cols.forEach((h, i) => (idx[h.trim()] = i))
  const rows: CsvRow[] = []
  for (const line of lines) {
    // minimal CSV split (no embedded commas expected in our export)
    const parts = line.split(',')
    rows.push({
      conference: parts[idx['conference']]?.trim() || '',
      team: parts[idx['team']]?.trim() || '',
      name: parts[idx['name']]?.trim() || '',
      jersey: parts[idx['jersey']]?.trim() || '',
      pos: parts[idx['pos']]?.trim() || '',
      height: parts[idx['height']]?.trim() || '',
      weight: parts[idx['weight']]?.trim() || '',
      class: parts[idx['class']]?.trim() || '',
      source_file: parts[idx['source_file']]?.trim() || '',
    })
  }
  return rows
}

function parseIntOrUndef(value: string): number | undefined {
  const v = (value || '').trim()
  if (!v) return undefined
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : undefined
}

function parseJersey(value: string): number | undefined {
  const n = parseIntOrUndef(value)
  if (n === undefined) return undefined
  if (n < 0 || n > 99) return undefined
  return n
}

function parseWeight(value: string): number | undefined {
  const n = parseIntOrUndef(value)
  if (n === undefined) return undefined
  if (n < 150 || n > 400) return undefined
  return n
}

async function fetchAllPlayers(databases: Databases): Promise<DBPlayer[]> {
  const all: DBPlayer[] = []
  let cursor: string | null = null
  const pageSize = 100
  while (true) {
    const queries: string[] = [Query.limit(pageSize)]
    // Try to stabilize ordering for cursor pagination
    try { queries.push(Query.orderAsc('$id')) } catch {}
    if (cursor) {
      try { queries.push(Query.cursorAfter(cursor)) } catch {}
    }
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID, queries)
    const docs = (res.documents as unknown as DBPlayer[]) || []
    if (docs.length === 0) break
    all.push(...docs)
    const last = docs[docs.length - 1]
    if (!last || !last.$id) break
    cursor = last.$id
    if (docs.length < pageSize) break
  }
  // If cursor failed (older Appwrite), fallback to offset pagination
  if (all.length === 0) {
    let offset = 0
    while (true) {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID, [
        Query.limit(pageSize),
        Query.offset(offset),
      ])
      const docs = (res.documents as unknown as DBPlayer[]) || []
      if (docs.length === 0) break
      all.push(...docs)
      offset += docs.length
      if (docs.length < pageSize) break
    }
  }
  return all
}

async function fetchPlayersByTeams(databases: Databases, teams: string[]): Promise<DBPlayer[]> {
  const all: DBPlayer[] = []
  // Appwrite supports equal(field, arrayOfValues) for OR matching
  const pageSize = 100
  let cursor: string | null = null
  while (true) {
    const queries: string[] = [
      Query.equal('team', teams as unknown as any),
      Query.limit(pageSize),
    ]
    try { queries.push(Query.orderAsc('$id')) } catch {}
    if (cursor) {
      try { queries.push(Query.cursorAfter(cursor)) } catch {}
    }
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID, queries)
    const docs = (res.documents as unknown as DBPlayer[]) || []
    if (docs.length === 0) break
    all.push(...docs)
    const last = docs[docs.length - 1]
    if (!last || !last.$id) break
    cursor = last.$id
    if (docs.length < pageSize) break
  }
  return all
}

function computeDiff(
  csvRows: CsvRow[],
  dbPlayers: DBPlayer[],
  opts: { onlyPower4: boolean; scopeTeams?: Set<string> | null }
) {
  const csvMap = new Map<string, CsvRow>()
  for (const r of csvRows) {
    if (!r.name || !r.team || !r.pos) continue
    if (opts.onlyPower4 && !isPower4(r.conference)) continue
    csvMap.set(buildKey(r.name, r.team, r.pos), r)
  }
  const dbMap = new Map<string, DBPlayer>()
  const dbGroups = new Map<string, DBPlayer[]>()
  for (const p of dbPlayers) {
    if (!p.name || !p.team || !p.position) continue
    const key = buildKey(p.name, p.team, p.position)
    dbMap.set(key, p)
    const group = dbGroups.get(key) || []
    group.push(p)
    dbGroups.set(key, group)
  }

  const toCreate: Array<{ key: string; csv: CsvRow }> = []
  const toUpdate: Array<{ key: string; db: DBPlayer; updates: Partial<DBPlayer> }> = []
  const toDeactivate: Array<{ key: string; db: DBPlayer }> = []

  // New or update
  for (const [key, csv] of csvMap.entries()) {
    const existing = dbMap.get(key)
    const normConference = csv.conference
    const desired: Partial<DBPlayer> = {
      name: normalizeName(csv.name),
      position: normalizePosition(csv.pos),
      team: csv.team.trim(),
      conference: normConference,
      jerseyNumber: parseJersey(csv.jersey),
      height: csv.height || undefined,
      weight: parseWeight(csv.weight),
      year: csv.class || undefined,
      eligible: true,
    }
    if (!existing) {
      toCreate.push({ key, csv })
    } else {
      const diff: Partial<DBPlayer> = {}
      for (const k of Object.keys(desired) as (keyof DBPlayer)[]) {
        const dv = desired[k]
        const ev = existing[k]
        if (dv === undefined) continue
        // Compare numerics as numbers, strings as strings
        const isNum = typeof dv === 'number'
        const left = isNum ? Number(ev) : String(ev ?? '')
        const right = isNum ? Number(dv) : String(dv)
        if (left !== right) diff[k] = dv
      }
      // Ensure still eligible
      if (existing.eligible !== true) diff.eligible = true
      if (Object.keys(diff).length > 0) toUpdate.push({ key, db: existing, updates: diff })
    }
  }

  // Deactivate DB entries not present in CSV (respect scope)
  for (const [key, db] of dbMap.entries()) {
    if (!csvMap.has(key)) {
      if (opts.onlyPower4 && !isPower4(String(db.conference || ''))) continue
      if (opts.scopeTeams && !opts.scopeTeams.has(String(db.team || ''))) continue
      if (db.eligible !== false) toDeactivate.push({ key, db })
    }
  }

  // Deactivate duplicate DB entries that share the same key (keep the first)
  for (const [key, group] of dbGroups.entries()) {
    if (!group || group.length <= 1) continue
    // Sort deterministically by $id to keep the smallest id
    const sorted = group.slice().sort((a, b) => String(a.$id).localeCompare(String(b.$id)))
    const keep = sorted[0]
    for (let i = 1; i < sorted.length; i++) {
      const dup = sorted[i]
      if (opts.scopeTeams && !opts.scopeTeams.has(String(dup.team || ''))) continue
      // Mark duplicates for deactivation
      toDeactivate.push({ key, db: dup })
    }
  }
  return { toCreate, toUpdate, toDeactivate }
}

async function applyChanges(databases: Databases, diff: ReturnType<typeof computeDiff>) {
  const createdIds: string[] = []
  const updatedIds: string[] = []
  const deactivatedIds: string[] = []

  for (const item of diff.toCreate) {
    const r = item.csv
    const data: Partial<DBPlayer> = {
      name: normalizeName(r.name),
      position: normalizePosition(r.pos),
      team: r.team.trim(),
      conference: r.conference,
      jerseyNumber: parseJersey(r.jersey),
      height: r.height || undefined,
      weight: parseWeight(r.weight),
      year: r.class || undefined,
      eligible: true,
    }
    const res = await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, ID.unique(), data as any)
    createdIds.push((res as any).$id)
  }

  for (const item of diff.toUpdate) {
    const res = await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, item.db.$id, {
      ...item.updates,
    } as any)
    updatedIds.push((res as any).$id)
  }

  for (const item of diff.toDeactivate) {
    const res = await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, item.db.$id, {
      eligible: false,
    } as any)
    deactivatedIds.push((res as any).$id)
  }

  return { createdIds, updatedIds, deactivatedIds }
}

async function main() {
  const { csvPath, apply, dryRun, onlyPower4, teams, start, count, outPath } = parseArgs()
  if (!APPWRITE_API_KEY) fail('APPWRITE_API_KEY missing in env')

  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY)
  const databases = new Databases(client)

  console.log(`Reading CSV: ${csvPath}`)
  const csvRowsAll = readCsv(csvPath)
  console.log(`CSV rows: ${csvRowsAll.length}`)

  // Determine team scope
  let teamScope: string[] | null = null
  if (teams && teams.length > 0) {
    teamScope = teams
  } else if (count !== null) {
    // Build unique team list from CSV (respect onlyPower4 if set)
    const uniqueTeams = Array.from(new Set(
      csvRowsAll
        .filter(r => (!onlyPower4 || isPower4(r.conference)))
        .map(r => r.team.trim())
    )).sort((a, b) => a.localeCompare(b))
    const startIndex = Math.max(0, Number(start ?? 0))
    const batchCount = Math.max(1, Number(count))
    teamScope = uniqueTeams.slice(startIndex, startIndex + batchCount)
    console.log(`Batching teams ${startIndex}..${startIndex + batchCount - 1} of ${uniqueTeams.length}`)
  }

  const csvRows = teamScope
    ? csvRowsAll.filter(r => teamScope!.includes(r.team.trim()))
    : csvRowsAll
  const scopeTeamsSet = teamScope ? new Set(teamScope) : null
  console.log(`Scoped CSV rows: ${csvRows.length}${teamScope ? ` (teams: ${teamScope.join(', ')})` : ''}`)

  console.log('Fetching Appwrite players...')
  const dbPlayers = teamScope ? await fetchPlayersByTeams(databases, teamScope) : await fetchAllPlayers(databases)
  console.log(`DB players fetched: ${dbPlayers.length}`)

  const diff = computeDiff(csvRows, dbPlayers, { onlyPower4, scopeTeams: scopeTeamsSet })
  const report = {
    summary: {
      toCreate: diff.toCreate.length,
      toUpdate: diff.toUpdate.length,
      toDeactivate: diff.toDeactivate.length,
    },
    scope: {
      teams: teamScope,
      onlyPower4,
    },
    verification: (function () {
      // Build simple cross-reference check per team
      const teamsToCheck = teamScope || Array.from(new Set(csvRows.map(r => r.team.trim())))
      const perTeam: Record<string, { csvCount: number; dbCount: number }> = {}
      for (const t of teamsToCheck) {
        perTeam[t] = {
          csvCount: csvRows.filter(r => r.team.trim() === t).length,
          dbCount: dbPlayers.filter(p => String(p.team || '').trim() === t).length,
        }
      }
      return { perTeam }
    })(),
    examples: {
      create: diff.toCreate.slice(0, 5).map(x => x.csv.name),
      update: diff.toUpdate.slice(0, 5).map(x => ({ id: x.db.$id, name: x.db.name })),
      deactivate: diff.toDeactivate.slice(0, 5).map(x => ({ id: x.db.$id, name: x.db.name })),
    },
    options: { onlyPower4 },
  }
  console.log(JSON.stringify(report, null, 2))

  const outDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPathResolved = outPath ? path.join(process.cwd(), outPath) : path.join(outDir, 'college_players_sync_report.json')
  fs.writeFileSync(outPathResolved, JSON.stringify(report, null, 2))
  console.log(`Wrote report: ${outPathResolved}`)

  if (dryRun) {
    console.log('Dry run complete. Re-run with --apply to perform changes.')
    return
  }

  console.log('Applying changes...')
  const result = await applyChanges(databases, diff)
  console.log(JSON.stringify(result, null, 2))
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


