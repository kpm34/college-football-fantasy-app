#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function upsertPick(databases: any, databaseId: string, source: string, p: any, summary: Summary) {
  const id = p.$id
  
  // Map fields based on source collection
  let draft_id: string;
  let fantasy_team_id: string | null;
  
  if (source === 'mock_draft_picks') {
    draft_id = p.draftId; // mock_draft_picks uses draftId
    fantasy_team_id = p.participantId || null; // mock uses participantId
  } else {
    draft_id = p.draft_id || p.draftId; // draft_picks might use either
    fantasy_team_id = p.teamId || p.fantasy_team_id || null;
  }
  
  const data = {
    draft_id: draft_id,
    type: 'pick',
    round: p.round || null,
    overall: p.overall || p.pick || p.slot || null,
    fantasy_team_id: fantasy_team_id,
    player_id: p.playerId || p.player_id || null,
    ts: p.pickedAt || p.ts || p.timestamp || p.$createdAt || null,
    payload_json: p.payload_json || p.meta_json || JSON.stringify({ autopick: p.autopick })
  }
  
  // Ensure draft_id is present
  if (!data.draft_id) {
    console.warn(`Skipping document ${id} - missing draft_id`);
    summary.errors!++;
    return;
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


