#!/usr/bin/env ts-node

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { ID, Query } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID as DB_ID } from '../lib/appwrite-server.ts';
function assertServerEnv(): void {
  const req = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
  const miss = req.filter((k) => !process.env[k]);
  if (miss.length) throw new Error(`Missing env: ${miss.join(', ')}`);
}

type Position = 'QB' | 'RB' | 'WR' | 'TE';

interface EARow {
  player_name: string;
  school?: string;
  team?: string;
  position: string;
  pos?: string;
  ovr?: number | string;
  spd?: number | string;
  acc?: number | string;
  thp?: number | string;
  sac?: number | string;
  mac?: number | string;
  dac?: number | string;
  bcv?: number | string;
  car?: number | string;
  btk?: number | string;
  cth?: number | string;
  cit?: number | string;
  rls?: number | string;
  rtr?: number | string;
  jmp?: number | string;
  inj?: number | string;
  tgh?: number | string;
  [key: string]: unknown;
}

interface NormalizedPlayer {
  player_name: string;
  team_id: string | null;
  pos: Position;
  metrics: Record<string, { raw: number; norm: number }>;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function normRating(value: number | undefined | null): { raw: number; norm: number } | undefined {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return undefined;
  const raw = Number(value);
  const norm = clamp01((raw - 50) / 50);
  return { raw, norm: Number(norm.toFixed(2)) };
}

export async function loadEA(season: number): Promise<EARow[]> {
  const file = path.join(process.cwd(), `data/player/ea/ratings_${season}.csv`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing EA ratings CSV at ${file}`);
  }
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsv(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as EARow[];
  return rows;
}

export function normalize(rows: EARow[], teamMap: Record<string, string>): NormalizedPlayer[] {
  const allowed: Position[] = ['QB', 'RB', 'WR', 'TE'];
  const out: NormalizedPlayer[] = [];

  for (const r of rows) {
    const playerName = (r.player_name || '').toString().trim();
    const rawPos = (r.position || r.pos || '').toString().toUpperCase().trim();
    if (!playerName || !allowed.includes(rawPos as Position)) continue;

    const school = ((r.school || r.team || '') as string).trim();
    const team_id = teamMap[school] || null;

    const metricKeys = [
      'ovr', 'spd', 'acc', 'thp', 'sac', 'mac', 'dac', 'bcv', 'car', 'btk', 'cth', 'cit', 'rls', 'rtr', 'jmp', 'inj', 'tgh',
    ];
    const metrics: Record<string, { raw: number; norm: number }> = {};
    for (const k of metricKeys) {
      const v = r[k as keyof EARow] as number | string | undefined;
      const parsed = v === undefined ? undefined : Number(v);
      const rr = normRating(Number.isNaN(parsed as number) ? undefined : (parsed as number));
      if (rr) metrics[k] = rr;
    }

    out.push({ player_name: playerName, team_id, pos: rawPos as Position, metrics });
  }
  return out;
}

export function toEAInputsPayload(players: NormalizedPlayer[]): Record<string, any> {
  const payload: Record<string, any> = {};
  for (const p of players) {
    const key = `${p.player_name}|${p.team_id ?? ''}|${p.pos}`;
    payload[key] = {
      ...Object.fromEntries(Object.entries(p.metrics)),
      pos: p.pos,
      team_id: p.team_id,
      player_name: p.player_name,
    };
  }
  return payload;
}

export async function upsertModelInputs(args: { season: number; payload: Record<string, any> }): Promise<void> {
  const { season, payload } = args;

  const res = await databases.listDocuments(DB_ID, 'model_inputs', [
    Query.equal('season', season),
    // week absent or null — try to find both
    Query.limit(1),
  ]);

  const doc = res.documents.find((d: any) => d.week === undefined || d.week === null);

  if (doc) {
    await databases.updateDocument(DB_ID, 'model_inputs', doc.$id, {
      ea_ratings_json: payload,
    });
    console.log(`✔ Updated model_inputs ${doc.$id} with ea_ratings_json for season=${season}`);
  } else {
    const created = await databases.createDocument(DB_ID, 'model_inputs', ID.unique(), {
      season,
      ea_ratings_json: payload,
    });
    console.log(`✔ Created model_inputs ${created.$id} for season=${season}`);
  }
}

function readTeamMap(): Record<string, string> {
  const file = path.join(process.cwd(), 'data/teams_map.json');
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

async function main() {
  assertServerEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  if (!Number.isFinite(season)) throw new Error('Invalid --season');

  const rows = await loadEA(season);
  const teamMap = readTeamMap();
  const normalized = normalize(rows, teamMap);
  const payload = toEAInputsPayload(normalized);

  // Ensure raw write path and save raw snapshot
  const rawDir = path.join(process.cwd(), 'data/player/raw/ea');
  fs.mkdirSync(rawDir, { recursive: true });
  fs.writeFileSync(path.join(rawDir, `ratings_${season}.json`), JSON.stringify(rows, null, 2));

  // Save transformed snapshot
  const outDir = path.join(process.cwd(), 'data/player/processed/ea');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `ratings_${season}.json`), JSON.stringify(payload, null, 2));

  await upsertModelInputs({ season, payload });
  console.log(`✅ EA ratings ingested for season=${season}. Players processed=${normalized.length}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Ingestion failed:', err);
    process.exit(1);
  });
}


