#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, errors: 0 }
  for await (const b of paginate(databases, databaseId, 'auction_bids')) {
    summary.scanned++
    const id = b.$id
    const data = {
      auction_id: b.auctionId || b.auction_id,
      fantasy_team_id: b.teamId || b.fantasy_team_id,
      amount: b.amount || b.bid || 0,
      timestamp: b.ts || b.timestamp || b.$createdAt
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'bids', id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
    } catch (e) { summary.errors!++ }
  }
  writeSummary('merge_auction_bids_to_bids', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


