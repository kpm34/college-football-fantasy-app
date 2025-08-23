#!/usr/bin/env tsx
import { getDatabases, writeSummary, Summary } from './_shared'

const LEGACY = [
  'auction_bids', 'auction_sessions', 'draft_picks', 'mock_draft_participants', 'mock_draft_picks', 'mock_drafts',
  'model_inputs', 'player_projections', 'projections_weekly', 'projections_yearly', 'user_custom_projections', 'projection_runs',
  'scores', 'team_budgets', 'teams', 'users', 'user_teams', 'editor_sessions', 'file_changes', 'message_templates', 'migrations', 'scoring', 'sync_status'
]

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0, notes: {} }

  // Read existing collections
  const existing = new Set<string>()
  try {
    const list = await databases.listCollections(databaseId)
    for (const c of (list.collections || [])) existing.add(c.$id)
  } catch {}

  for (const id of LEGACY) {
    summary.scanned++
    if (!existing.has(id)) { summary.skipped!++; continue }
    try {
      await databases.deleteCollection(databaseId, id)
      summary.updated!++
    } catch (e) {
      summary.errors!++
    }
  }

  writeSummary('drop_legacy_collections', summary)
  console.log(`Done. attempted=${summary.scanned} dropped=${summary.updated} skipped=${summary.skipped} errors=${summary.errors}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


