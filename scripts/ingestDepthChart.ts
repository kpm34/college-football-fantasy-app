#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { ID, Query } from 'node-appwrite';
import { assertEnv, databases, DB_ID } from '../src/appwrite';

// Accepts JSON input placed at data/depth/depth_chart_{{season}}.json
// Shape is flexible; we store as-is under depth_chart_json to allow audits.

async function upsert(season: number, payload: any): Promise<void> {
  const res = await databases.listDocuments(DB_ID, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const doc = res.documents.find((d: any) => d.week === undefined || d.week === null);
  if (doc) {
    await databases.updateDocument(DB_ID, 'model_inputs', doc.$id, { depth_chart_json: payload });
    console.log(`✔ Updated model_inputs ${doc.$id} (depth_chart_json)`);
  } else {
    const created = await databases.createDocument(DB_ID, 'model_inputs', ID.unique(), { season, depth_chart_json: payload });
    console.log(`✔ Created model_inputs ${created.$id} (depth_chart_json)`);
  }
}

async function main() {
  assertEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const file = path.join(process.cwd(), `data/depth/depth_chart_${season}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`No depth chart file at ${file} — skipping.`);
    return;
  }
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));

  const rawDir = path.join(process.cwd(), 'data/raw/depth');
  fs.mkdirSync(rawDir, { recursive: true });
  fs.writeFileSync(path.join(rawDir, `depth_chart_${season}.json`), JSON.stringify(payload, null, 2));

  await upsert(season, payload);
  console.log(`✅ Depth chart ingested for season=${season}`);
}

if (require.main === module) {
  main().catch((e) => { console.error('❌ Ingest depth chart failed', e); process.exit(1); });
}


