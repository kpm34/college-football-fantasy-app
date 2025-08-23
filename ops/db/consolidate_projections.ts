#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function upsert(databases: any, databaseId: string, doc: any, summary: Summary) {
  const id = doc.$id
  const res = await safeCreateOrUpdate(databases, databaseId, 'projections', id, doc)
  if (res === 'created') summary.created!++
  if (res === 'updated') summary.updated!++
}

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, errors: 0 }

  // player_projections → projections (period='adhoc')
  for await (const p of paginate(databases, databaseId, 'player_projections')) {
    summary.scanned++
    const doc = {
      player_id: p.playerId || p.player_id,
      season: p.season,
      week: p.week ?? null,
      period: 'adhoc',
      version: p.version || 1,
      model: p.model || null,
      source: p.source || 'adhoc',
      client_id: null,
      fantasy_points: p.fantasy_points || p.points || 0,
      components_json: p.components_json || p.breakdown_json || '',
    }
    await upsert(databases, databaseId, { $id: p.$id, ...doc }, summary)
  }

  // projections_weekly
  for await (const p of paginate(databases, databaseId, 'projections_weekly')) {
    summary.scanned++
    const doc = {
      player_id: p.playerId || p.player_id,
      season: p.season,
      week: p.week,
      period: 'weekly',
      version: p.version || 1,
      model: p.model || null,
      source: p.source || 'weekly',
      client_id: null,
      fantasy_points: p.fantasy_points || 0,
      components_json: p.components_json || ''
    }
    await upsert(databases, databaseId, { $id: p.$id, ...doc }, summary)
  }

  // projections_yearly
  for await (const p of paginate(databases, databaseId, 'projections_yearly')) {
    summary.scanned++
    const doc = {
      player_id: p.playerId || p.player_id,
      season: p.season,
      week: null,
      period: 'yearly',
      version: p.version || 1,
      model: p.model || null,
      source: p.source || 'yearly',
      client_id: null,
      fantasy_points: p.fantasy_points || 0,
      components_json: p.components_json || ''
    }
    await upsert(databases, databaseId, { $id: p.$id, ...doc }, summary)
  }

  // user_custom_projections → projections with source='custom'
  for await (const p of paginate(databases, databaseId, 'user_custom_projections')) {
    summary.scanned++
    const doc = {
      player_id: p.playerId || p.player_id,
      season: p.season,
      week: p.week ?? null,
      period: p.week ? 'weekly' : 'adhoc',
      version: p.version || 1,
      model: 'custom',
      source: 'custom',
      client_id: p.clientId || p.client_id || null,
      fantasy_points: p.fantasy_points || 0,
      components_json: p.components_json || ''
    }
    await upsert(databases, databaseId, { $id: p.$id, ...doc }, summary)
  }

  writeSummary('consolidate_projections', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


