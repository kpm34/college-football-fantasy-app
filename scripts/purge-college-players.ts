#!/usr/bin/env -S node -r esbuild-register
/**
 * Purge all documents from the `college_players` collection.
 * - Dry-run by default (counts and previews deletions)
 * - Requires APPWRITE_API_KEY in env
 *
 * Usage:
 *   npx tsx scripts/purge-college-players.ts --dry-run
 *   npx tsx scripts/purge-college-players.ts --apply --yes
 */
import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases, Query } from 'node-appwrite'

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''
const COLLECTION_ID = 'college_players'

function fail(msg: string): never {
  console.error(`Error: ${msg}`)
  process.exit(1)
}

function parseArgs(): { apply: boolean; yes: boolean; dryRun: boolean; batchSize: number } {
  const args = process.argv.slice(2)
  let apply = false
  let dryRun = true
  let yes = false
  let batchSize = 100
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--apply') {
      apply = true
      dryRun = false
    } else if (a === '--dry-run') {
      dryRun = true
      apply = false
    } else if (a === '--yes' || a === '-y') {
      yes = true
    } else if ((a === '--batch-size' || a === '-b') && args[i + 1]) {
      const n = Number.parseInt(args[++i], 10)
      if (Number.isFinite(n) && n > 0 && n <= 100) batchSize = n
    }
  }
  return { apply, yes, dryRun, batchSize }
}

async function listAll(databases: Databases, batchSize: number) {
  const all: Array<{ $id: string; name?: string; team?: string; position?: string }> = []
  let cursor: string | null = null
  while (true) {
    const queries: string[] = [Query.limit(batchSize)]
    try { queries.push(Query.orderAsc('$id')) } catch {}
    if (cursor) {
      try { queries.push(Query.cursorAfter(cursor)) } catch {}
    }
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID, queries)
    const docs = (res.documents as any[]) || []
    if (docs.length === 0) break
    for (const d of docs) {
      all.push({ $id: d.$id, name: d.name, team: d.team, position: d.position })
    }
    const last = docs[docs.length - 1]
    if (!last || !last.$id) break
    cursor = last.$id
    if (docs.length < batchSize) break
  }
  return all
}

async function purge(databases: Databases, ids: string[]) {
  const deleted: string[] = []
  const errors: Array<{ id: string; error: string }> = []
  for (const id of ids) {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, id)
      deleted.push(id)
    } catch (err: any) {
      errors.push({ id, error: String(err?.message || err) })
    }
  }
  return { deleted, errors }
}

async function main() {
  const { apply, yes, dryRun, batchSize } = parseArgs()
  if (!APPWRITE_API_KEY) fail('APPWRITE_API_KEY missing in env')

  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY)
  const databases = new Databases(client)

  console.log(`Target database: ${APPWRITE_DATABASE_ID}`)
  console.log(`Target collection: ${COLLECTION_ID}`)
  console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'APPLY'}`)

  console.log('Listing documents...')
  const docs = await listAll(databases, batchSize)
  console.log(`Found ${docs.length} documents in ${COLLECTION_ID}.`)

  const preview = docs.slice(0, 10).map(d => ({ id: d.$id, name: d.name, team: d.team, position: d.position }))
  const report = {
    summary: {
      total: docs.length,
      toDelete: docs.length,
      mode: dryRun ? 'dry-run' : 'apply',
    },
    preview,
  }
  const outDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'college_players_purge_report.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log(`Wrote report: ${outPath}`)

  if (dryRun) {
    console.log('Dry run complete. Re-run with --apply --yes to perform deletions.')
    return
  }

  if (!yes) fail('Refusing to purge without --yes flag')

  console.log('Deleting documents...')
  const { deleted, errors } = await purge(databases, docs.map(d => d.$id))
  console.log(JSON.stringify({ deletedCount: deleted.length, errorCount: errors.length }, null, 2))
  if (errors.length) {
    console.log('Errors:')
    for (const e of errors.slice(0, 10)) console.log(` - ${e.id}: ${e.error}`)
  }
  console.log('Purge complete.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


