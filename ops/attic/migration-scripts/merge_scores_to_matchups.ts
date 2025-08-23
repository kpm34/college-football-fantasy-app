#!/usr/bin/env ts-node
import { getDatabases, paginate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, updated: 0, created: 0, errors: 0 }

  for await (const s of paginate(databases, databaseId, 'scores')) {
    summary.scanned++
    const league_id = s.leagueId || s.league_id
    const season = s.season
    const week = s.week
    const home_team_id = s.homeTeamId || s.home_team_id
    const away_team_id = s.awayTeamId || s.away_team_id
    const home_points = s.homePoints || s.home_points || 0
    const away_points = s.awayPoints || s.away_points || 0

    // find or create matchup id (deterministic key)
    const key = `${league_id}_${season}_${week}_${home_team_id}_${away_team_id}`
    try {
      await databases.createDocument(databaseId, 'matchups', key, {
        league_id, season, week, home_team_id, away_team_id, home_points, away_points
      })
      summary.created!++
    } catch (e: any) {
      // assume exists
      try {
        await databases.updateDocument(databaseId, 'matchups', key, { home_points, away_points })
        summary.updated!++
      } catch {
        summary.errors!++
      }
    }
  }

  writeSummary('merge_scores_to_matchups', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


