#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import { getDatabases, paginate, Summary, writeSummary } from './_shared'

const LEGACY = [
  'auction_bids', 'auction_sessions', 'draft_picks', 'mock_draft_participants', 'mock_draft_picks', 'mock_drafts',
  'model_inputs', 'player_projections', 'projections_weekly', 'projections_yearly', 'user_custom_projections', 'projection_runs',
  'scores', 'team_budgets', 'teams', 'users', 'user_teams', 'editor_sessions', 'file_changes', 'message_templates', 'migrations', 'scoring', 'sync_status'
]

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0, notes: {} }
  const outDir = path.join(process.cwd(), 'ops', 'out', 'snapshots')
  fs.mkdirSync(outDir, { recursive: true })

  for (const collectionId of LEGACY) {
    summary.scanned++
    const records: any[] = []
    try {
      for await (const doc of paginate(databases, databaseId, collectionId)) {
        records.push(doc)
      }
      fs.writeFileSync(path.join(outDir, `${collectionId}.json`), JSON.stringify({ collectionId, count: records.length, documents: records }, null, 2))
      summary.updated!++
    } catch (e) {
      summary.errors!++
    }
  }

  writeSummary('export_legacy_collections', summary)
  console.log(`Exported ${summary.updated} collections to ${outDir}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


