#!/usr/bin/env ts-node

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { Client, Databases, ID, Query } from 'node-appwrite';

function assertServerEnv(): void {
  const req = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
  const miss = req.filter((k) => !process.env[k]);
  if (miss.length) throw new Error(`Missing env: ${miss.join(', ')}`);
}

function getDatabases(): { databases: Databases; dbId: string } {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
  return { databases, dbId };
}

export type Position = 'QB' | 'RB' | 'WR' | 'TE';

export interface MockRow {
  player_name: string;
  position?: string;
  school?: string;
  team?: string;
  projected_pick?: string | number;
  projected_round?: string | number;
  source?: string;
}

export interface NormalizedDraft {
  player_name: string;
  team_id: string | null;
  pos: Position;
  projected_pick: number;
  projected_round: number;
  draft_capital_score: number;
  source?: string;
}

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

export function loadMockDraft(season: number): MockRow[] {
  const candidates = [
    path.join(process.cwd(), `data/market/mockdraft/${season}.json`),
    path.join(process.cwd(), `data/market/mockdraft/capital_${season}.json`),
    path.join(process.cwd(), `data/market/mockdraft/${season}.csv`),
    path.join(process.cwd(), `data/market/mockdraft/capital_${season}.csv`),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    if (file.endsWith('.json')) {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as MockRow[];
    }
    if (file.endsWith('.csv')) {
      const text = fs.readFileSync(file, 'utf8');
      return parseCsv(text, { columns: true, skip_empty_lines: true, trim: true }) as MockRow[];
    }
  }
  console.warn(`No mock draft file found in data/market/mockdraft for season ${season} — skipping.`);
  return [];
}

export function normalizeDraft(rows: MockRow[], teamMap: Record<string, string>): NormalizedDraft[] {
  const allowed: Position[] = ['QB', 'RB', 'WR', 'TE'];
  const bestByKey = new Map<string, NormalizedDraft>();
  const skipped: string[] = [];

  for (const r of rows) {
    const name = (r.player_name || '').toString().trim();
    const rawPos = (r.position || '').toString().toUpperCase().trim();
    if (!name || !allowed.includes(rawPos as Position)) {
      if (name) skipped.push(name);
      continue;
    }
    const school = (r.school || r.team || '').toString().trim();
    const team_id = teamMap[school] || null;
    const overall = Number(r.projected_pick ?? 0);
    const round = Number(r.projected_round ?? 0);
    const score = clamp01((259 - (overall || 260)) / 259);

    const norm: NormalizedDraft = {
      player_name: name,
      team_id,
      pos: rawPos as Position,
      projected_pick: overall || 0,
      projected_round: round || 0,
      draft_capital_score: Number(score.toFixed(3)),
      source: r.source || undefined,
    };

    const key = `${name}|${team_id ?? ''}|${norm.pos}`;
    const existing = bestByKey.get(key);
    if (!existing || (norm.projected_pick > 0 && norm.projected_pick < (existing.projected_pick || Infinity))) {
      bestByKey.set(key, norm);
    }
  }

  if (skipped.length) console.log(`Skipped (pos not supported): ${skipped.length}`);
  return Array.from(bestByKey.values());
}

export function toDraftPayload(players: NormalizedDraft[]): Record<string, any> {
  const payload: Record<string, any> = {};
  for (const p of players) {
    const key = `${p.player_name}|${p.team_id ?? ''}|${p.pos}`;
    payload[key] = {
      projected_pick: p.projected_pick,
      projected_round: p.projected_round,
      draft_capital_score: p.draft_capital_score,
      source: p.source || null,
    };
  }
  return payload;
}

export async function upsertModelInputs({ season, payload }: { season: number; payload: Record<string, any> }): Promise<void> {
  const { databases, dbId } = getDatabases();
  const res = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const doc = res.documents.find((d: any) => d.week === undefined || d.week === null);
  if (doc) {
    await databases.updateDocument(dbId, 'model_inputs', doc.$id, { nfl_draft_capital_json: payload });
    console.log(`✔ Updated model_inputs ${doc.$id} (nfl_draft_capital_json)`);
  } else {
    const created = await databases.createDocument(dbId, 'model_inputs', ID.unique(), { season, nfl_draft_capital_json: payload });
    console.log(`✔ Created model_inputs ${created.$id} (nfl_draft_capital_json)`);
  }
}

function readTeamMap(): Record<string, string> {
  const file = path.join(process.cwd(), 'data/teams_map.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>; } catch { return {}; }
}

async function main() {
  assertServerEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const rows = loadMockDraft(season);
  if (rows.length === 0) return;

  // Save raw snapshot
  const rawDir = path.join(process.cwd(), 'data/player/raw/mockdraft');
  fs.mkdirSync(rawDir, { recursive: true });
  fs.writeFileSync(path.join(rawDir, `capital_${season}.json`), JSON.stringify(rows, null, 2));

  // Transform and upsert
  const teamMap = readTeamMap();
  const normalized = normalizeDraft(rows, teamMap);
  const payload = toDraftPayload(normalized);

  const processedDir = path.join(process.cwd(), 'data/player/processed/mockdraft');
  fs.mkdirSync(processedDir, { recursive: true });
  fs.writeFileSync(path.join(processedDir, `capital_${season}.json`), JSON.stringify(payload, null, 2));

  await upsertModelInputs({ season, payload });
  console.log(`✅ Mock draft capital ingested for season=${season}, players=${normalized.length}`);
}

if (require.main === module) {
  main().catch((e) => { console.error('❌ Ingest mock draft failed', e); process.exit(1); });
}


