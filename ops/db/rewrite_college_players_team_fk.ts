#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { getDatabases, paginate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, updated: 0, skipped: 0, errors: 0 }
  const mapPath = path.join(process.cwd(), 'ops', 'out', 'school_map.json')
  if (!fs.existsSync(mapPath)) throw new Error('Missing ops/out/school_map.json. Run migrate_teams_to_schools first.')
  const schoolMap: Record<string, string> = JSON.parse(fs.readFileSync(mapPath, 'utf8'))

  for await (const p of paginate(databases, databaseId, 'college_players')) {
    summary.scanned++
    const teamName = p.team || p.school || p.team_name
    const school_id = (teamName && schoolMap[teamName]) || p.school_id
    if (school_id === p.school_id && !p.team) { summary.skipped!++; continue }
    try {
      const data: any = { school_id }
      if (p.team !== undefined) data.team = undefined
      await databases.updateDocument(databaseId, 'college_players', p.$id, data)
      summary.updated!++
    } catch (e) {
      summary.errors!++
    }
  }

  writeSummary('rewrite_college_players_team_fk', summary)
  console.log(`Done. scanned=${summary.scanned} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


