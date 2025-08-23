#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

function parsePlayers(raw: any): Array<{ player_id: string; position?: string }> {
  try {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return JSON.parse(String(raw))
  } catch {
    return []
  }
}

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, skipped: 0, errors: 0 }
  try { await databases.getCollection(databaseId, 'roster_slots') } catch { await databases.createCollection(databaseId, 'roster_slots', 'roster_slots') }

  for await (const t of paginate(databases, databaseId, 'user_teams')) {
    summary.scanned++
    const fantasy_team_id = t.$id
    const arr = parsePlayers(t.players || t.players_json)
    for (const p of arr) {
      const id = `${fantasy_team_id}_${p.player_id}`
      try {
        const res = await safeCreateOrUpdate(databases, databaseId, 'roster_slots', id, {
          fantasy_team_id,
          player_id: p.player_id,
          position: p.position || '',
          acquired_via: 'seed',
          acquired_at: t.$createdAt
        })
        if (res === 'created') summary.created!++
        else summary.skipped!++
      } catch { summary.errors!++ }
    }
  }

  writeSummary('add_roster_slots_from_user_teams', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


