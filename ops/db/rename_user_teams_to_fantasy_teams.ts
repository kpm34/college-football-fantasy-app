#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0 }
  try { await databases.getCollection(databaseId, 'fantasy_teams') } catch { await databases.createCollection(databaseId, 'fantasy_teams', 'fantasy_teams') }

  for await (const t of paginate(databases, databaseId, 'user_teams')) {
    summary.scanned++
    const id = t.$id
    const data = {
      league_id: t.leagueId || t.league_id,
      owner_client_id: t.userId || t.owner_client_id,
      name: t.teamName || t.name,
      abbrev: t.abbrev || t.abbreviation || '',
      logo_url: t.logo_url || '',
      wins: t.wins || 0,
      losses: t.losses || 0,
      ties: t.ties || 0,
      points_for: t.pointsFor || 0,
      points_against: t.pointsAgainst || 0,
      draft_position: t.draftPosition || null,
      auction_budget_total: t.budgetTotal || t.auction_budget_total || 0,
      auction_budget_remaining: t.budgetRemaining || t.auction_budget_remaining || 0
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'fantasy_teams', id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
    } catch (e) { summary.errors!++ }
  }

  writeSummary('rename_user_teams_to_fantasy_teams', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


