#!/usr/bin/env tsx
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0 }

  try { await databases.getCollection(databaseId, 'league_memberships') } catch { await databases.createCollection(databaseId, 'league_memberships', 'league_memberships') }

  // Build unique set of (league_id, client_id)
  const seen = new Set<string>()

  for await (const t of paginate(databases, databaseId, 'fantasy_teams')) {
    summary.scanned++
    const league_id = t.league_id || t.leagueId
    const client_id = t.owner_client_id || t.userId
    if (!league_id || !client_id) { summary.skipped!++; continue }
    const key = `${league_id}::${client_id}`
    if (seen.has(key)) { summary.skipped!++; continue }
    seen.add(key)

    const id = key.replace(/[:]/g, '__')
    const data = {
      league_id,
      client_id,
      role: 'member',
      status: 'active',
      joined_at: t.$createdAt || new Date().toISOString(),
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'league_memberships', id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
    } catch { summary.errors!++ }
  }

  writeSummary('seed_memberships_from_fantasy_teams', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated} skipped=${summary.skipped}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
