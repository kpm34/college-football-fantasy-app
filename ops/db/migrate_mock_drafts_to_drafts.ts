#!/usr/bin/env tsx
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0, notes: {} }

  // Ensure target collections exist
  try { await databases.getCollection(databaseId, 'drafts') } catch { await databases.createCollection(databaseId, 'drafts', 'drafts') }
  try { await databases.getCollection(databaseId, 'draft_events') } catch { await databases.createCollection(databaseId, 'draft_events', 'draft_events') }

  // Migrate mock_drafts → drafts (is_mock=true)
  for await (const md of paginate(databases, databaseId, 'mock_drafts')) {
    summary.scanned++
    const id = md.$id
    const data = {
      league_id: md.leagueId || null,
      type: 'snake',
      status: md.status || 'scheduled',
      start_time: md.startedAt || null,
      end_time: md.completedAt || null,
      clock_seconds:  md.clock_seconds || md.pickTimeSeconds || 90,
      order_json: md.config?.order_json || md.order_json || (typeof md.config === 'string' ? md.config : ''),
      max_rounds: md.rounds || 15,
      current_pick: null,
      current_round: null,
      is_mock: true,
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'drafts', id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
    } catch { summary.errors!++ }
  }

  writeSummary('migrate_mock_drafts_to_drafts', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


