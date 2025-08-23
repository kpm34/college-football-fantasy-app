#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function upsertPick(databases: any, databaseId: string, source: string, p: any, summary: Summary) {
  const id = p.$id
  const data = {
    draft_id: p.draftId || p.draft_id,
    type: 'pick',
    round: p.round || null,
    overall: p.overall || p.pick || null,
    fantasy_team_id: p.teamId || p.fantasy_team_id || null,
    player_id: p.playerId || p.player_id || null,
    ts: p.ts || p.timestamp || p.$createdAt || null,
    payload_json: p.payload_json || p.meta_json || ''
  }
  const res = await safeCreateOrUpdate(databases, databaseId, 'draft_events', id, data)
  if (res === 'created') summary.created!++
  if (res === 'updated') summary.updated!++
}

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, errors: 0 }
  for await (const p of paginate(databases, databaseId, 'draft_picks')) {
    summary.scanned++
    await upsertPick(databases, databaseId, 'draft_picks', p, summary)
  }
  for await (const p of paginate(databases, databaseId, 'mock_draft_picks')) {
    summary.scanned++
    await upsertPick(databases, databaseId, 'mock_draft_picks', p, summary)
  }
  writeSummary('merge_draft_picks_and_mock_picks_to_draft_events', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


