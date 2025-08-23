#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { Query } from 'node-appwrite'
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, slugify, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0, notes: {} }
  const map: Record<string, string> = {}

  // Ensure schools collection exists before writing
  try { await databases.getCollection(databaseId, 'schools') } catch { await databases.createCollection(databaseId, 'schools', 'schools') }

  for await (const team of paginate(databases, databaseId, 'teams')) {
    summary.scanned++
    const id = team.$id
    const name = team.name || team.displayName || team.school || team.team || 'Unknown'
    const slug = slugify(name)
    const data = {
      name: String(name),
      conference: String(team.conference || team.league || ''),
      slug,
      abbreviation: team.abbreviation || team.abbrev || '',
      logo_url: team.logo || team.logo_url || '',
      primary_color: team.primary_color || '',
      secondary_color: team.secondary_color || '',
      mascot: team.mascot || ''
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'schools', id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
      map[name] = id
    } catch (e) {
      summary.errors!++
    }
  }

  const outDir = path.join(process.cwd(), 'ops', 'out')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'school_map.json'), JSON.stringify(map, null, 2))
  writeSummary('migrate_teams_to_schools', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


