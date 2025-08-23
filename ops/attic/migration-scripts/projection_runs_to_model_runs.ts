#!/usr/bin/env ts-node
import { getDatabases, paginate, safeCreateOrUpdate, writeSummary, Summary } from './_shared'

async function main() {
  const { databases, databaseId } = getDatabases()
  const summary: Summary = { scanned: 0, created: 0, updated: 0, errors: 0 }

  // Load side tables as maps if present
  const inputsMap: Record<string, any> = {}
  const metricsMap: Record<string, any> = {}

  try {
    for await (const i of paginate(databases, databaseId, 'model_inputs')) {
      inputsMap[i.runId || i.run_id || i.$id] = i
    }
  } catch {}
  try {
    for await (const m of paginate(databases, databaseId, 'projection_run_metrics')) {
      metricsMap[m.runId || m.run_id || m.$id] = m
    }
  } catch {}

  for await (const r of paginate(databases, databaseId, 'projection_runs')) {
    summary.scanned++
    const run_id = r.runId || r.run_id || r.$id
    const data = {
      run_id,
      model_version_id: r.modelVersionId || r.model_version_id || null,
      season: r.season,
      week: r.week ?? null,
      scope: r.scope || 'season',
      sources: Array.isArray(r.sources) ? r.sources.join(',') : (r.sources || ''),
      started_at: r.startedAt || r.started_at || null,
      finished_at: r.finishedAt || r.finished_at || null,
      status: r.status || 'done',
      inputs_json: JSON.stringify(inputsMap[run_id] || {}),
      metrics_json: JSON.stringify(metricsMap[run_id] || {}),
      weights_json: r.weights_json || ''
    }
    try {
      const res = await safeCreateOrUpdate(databases, databaseId, 'model_runs', run_id, data)
      if (res === 'created') summary.created!++
      if (res === 'updated') summary.updated!++
    } catch (e) { summary.errors!++ }
  }

  writeSummary('projection_runs_to_model_runs', summary)
  console.log(`Done. scanned=${summary.scanned} created=${summary.created} updated=${summary.updated}`)
}

main().catch((e) => { console.error(e); process.exit(1) })


