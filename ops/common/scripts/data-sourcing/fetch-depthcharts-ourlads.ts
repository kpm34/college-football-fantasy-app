#!/usr/bin/env tsx

/**
 * Fetch depth charts from OurLads (best-effort) and write to model_inputs.depth_chart_json
 * - Primary teams: pass via --teams=Alabama,Clemson,LSU,Louisville,Texas
 * - If parsing fails for a team, it will be recorded in a missing list
 */

import { Client, Databases, ID, Query } from 'node-appwrite'
import cheerio from 'cheerio'

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

// Normalize team names for URL building and matching
function normalizeTeamName(team: string): string {
  return team
    .replace(/ & /g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Known OurLads NCAA team slug map (extend as needed)
const TEAM_SLUG_OVERRIDES: Record<string, string> = {
  'Alabama': 'alabama',
  'Clemson': 'clemson',
  'LSU': 'lsu',
  'Louisville': 'louisville',
  'Texas': 'texas',
  'Arizona State Sun Devils': 'arizona-state',
  'Arizona Wildcats': 'arizona',
}

function toOurLadsSlug(team: string): string | null {
  const norm = normalizeTeamName(team)
  if (TEAM_SLUG_OVERRIDES[norm]) return TEAM_SLUG_OVERRIDES[norm]
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function fetchDepthChartForTeam(team: string) {
  const slug = toOurLadsSlug(team)
  if (!slug) return { team, positions: {}, ok: false }

  // Known OurLads depth chart URL pattern (best effort)
  // Example: https://www.ourlads.com/ncaa-football/depth-charts/team/arizona-state/
  const url = `https://www.ourlads.com/ncaa-football/depth-charts/team/${slug}/`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 depthchart-fetcher' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)

    const positions: Record<string, Array<{ player_name: string; pos_rank: number }>> = {}

    // Heuristic parsing: find tables with position headers, collect first 3 players per position
    $('table').each((_, table) => {
      const $table = $(table)
      const headerText = $table.prev('h3').text().toLowerCase()
      // Only parse offense/defense skill positions from offense table area
      const isOffense = headerText.includes('offense') || headerText.includes('offensive')
      if (!isOffense) return

      $table.find('tr').each((rowIdx, tr) => {
        if (rowIdx === 0) return // skip header row
        const tds = $(tr).find('td')
        if (tds.length < 2) return
        const pos = $(tds[0]).text().trim().toUpperCase()
        if (!pos) return
        const names: string[] = []
        for (let i = 1; i < Math.min(4, tds.length); i++) {
          const raw = $(tds[i]).text().replace(/\s+/g, ' ').trim()
          if (raw) names.push(raw)
        }
        if (names.length) {
          positions[pos] = names.map((n, idx) => ({ player_name: n, pos_rank: idx + 1 }))
        }
      })
    })

    const ok = Object.keys(positions).length > 0
    return { team, positions, ok }
  } catch (e) {
    return { team, positions: {}, ok: false }
  }
}

function assertEnv() {
  const req = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY']
  const miss = req.filter(k => !process.env[k])
  if (miss.length) throw new Error('Missing env: ' + miss.join(', '))
}

async function writeDepthChartToModelInputs(databases: Databases, dbId: string, season: number, depthObj: any) {
  // Merge into existing model_inputs doc for the season
  const docs = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)])
  if (docs.total > 0) {
    await databases.updateDocument(dbId, 'model_inputs', docs.documents[0].$id, { depth_chart_json: JSON.stringify(depthObj) })
  } else {
    await databases.createDocument(dbId, 'model_inputs', ID.unique(), { season, depth_chart_json: JSON.stringify(depthObj) })
  }
}

async function main() {
  assertEnv()
  const teamsArg = process.argv.find(a => a.startsWith('--teams='))
  if (!teamsArg) throw new Error('Pass --teams=Comma,Separated,Teams')
  const teams = teamsArg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean)
  const seasonArg = process.argv.find(a => a.startsWith('--season='))
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear()

  const client = new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!).setKey(process.env.APPWRITE_API_KEY!)
  const databases = new Databases(client)
  const dbId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy'

  const out: Record<string, any> = {}
  const missing: string[] = []
  for (const team of teams) {
    const res = await fetchDepthChartForTeam(team)
    if (res.ok) {
      out[team] = res.positions
    } else {
      missing.push(team)
    }
    await sleep(400) // politeness delay
  }

  console.log('Depth charts fetched:', Object.keys(out).length, 'Missing:', missing)
  await writeDepthChartToModelInputs(databases, dbId, season, out)
}

main().catch(e => { console.error(e); process.exit(1) })



