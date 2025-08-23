#!/usr/bin/env ts-node
import { getDatabases, paginate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, updated: 0, skipped: 0, errors: 0 }
  for await (const d of paginate(databases, databaseId, 'lineups')) {
    summary.scanned++
    const rosterId = d.rosterId || d.roster_id
    if (!rosterId) { summary.skipped!++; continue }
    try {
      await databases.updateDocument(databaseId, 'lineups', d.$id, { fantasy_team_id: rosterId, rosterId: undefined })
      summary.updated!++
    } catch { summary.errors!++ }
  }
  writeSummary('lineups_rosterid_to_fantasy_team_id', summary)
  console.log(`Done. scanned=${summary.scanned} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


