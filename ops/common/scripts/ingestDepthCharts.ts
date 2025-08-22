#!/usr/bin/env ts-node
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { Client, Databases, ID, Query } from 'node-appwrite';

type Position = 'QB' | 'RB' | 'WR' | 'TE';
type Status = 'Healthy' | 'Questionable' | 'DayToDay' | 'Out' | 'Redshirt' | 'Freshman';

type SourceTag = 'team_sites' | 'ourlads' | '247';

interface RawDepthBase {
  team_name?: string;
  school?: string;
  player_name: string;
  position: string;
  pos_rank: number | string;
  status?: string;
  notes?: string;
}

export interface RawDepth extends RawDepthBase {
  __source: SourceTag;
  __mtime: number; // file mtime
}

export interface CanonicalDepth {
  team_id: string;
  team_name: string;
  player_name: string;
  player_key: string; // hygienic for matching
  pos: Position;
  pos_rank: number;
  status: Status;
  notes?: string;
  __source: SourceTag;
  __mtime: number;
}

export type DepthChartPayload = Record<string, Record<Position, Array<{ player_name: string; pos_rank: number; status: Status; source: SourceTag; notes?: string }>>>;

export type UsagePriorsPayload = Record<string, Record<Position, Array<{ player_name: string; snap_share: number; rush_share?: number; target_share?: number }>>>;

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

function cleanName(name: string): string {
  const base = name.replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '').replace(/\s+/g, ' ').trim();
  return base.toLowerCase();
}

function toStatus(s?: string): Status {
  const t = (s || 'OK').toUpperCase();
  switch (t) {
    case 'OK':
    case 'HEALTHY':
      return 'Healthy';
    case 'Q':
    case 'QUESTIONABLE':
      return 'Questionable';
    case 'DTD':
    case 'DAY-TO-DAY':
      return 'DayToDay';
    case 'OUT':
      return 'Out';
    case 'RS':
    case 'REDSHIRT':
      return 'Redshirt';
    case 'FR':
    case 'TRUE FRESHMAN':
      return 'Freshman';
    default:
      return 'Healthy';
  }
}

function toPos(p: string): Position | null {
  const v = p.toUpperCase();
  return (['QB', 'RB', 'WR', 'TE'] as Position[]).includes(v as Position) ? (v as Position) : null;
}

function readJsonIfExists(file: string): any[] | null {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function readCsvIfExists(file: string): any[] | null {
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, 'utf8');
  return parseCsv(text, { columns: true, skip_empty_lines: true, trim: true }) as any[];
}

export async function loadDepthSources(season: number): Promise<RawDepth[]> {
  const dir = path.join(process.cwd(), 'data/player/depth');
  const patterns: Array<{ name: SourceTag; files: string[] }> = [
    { name: 'team_sites', files: [`team_sites_${season}.json`, `team_sites_${season}.csv`] },
    { name: 'ourlads', files: [`ourlads_${season}.json`, `ourlads_${season}.csv`] },
    { name: '247', files: [`247_${season}.json`, `247_${season}.csv`] },
  ];

  const rows: RawDepth[] = [];
  for (const { name, files } of patterns) {
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.existsSync(full) ? fs.statSync(full) : null;
      const mtime = stat ? stat.mtimeMs : 0;
      const parsed = f.endsWith('.json') ? readJsonIfExists(full) : readCsvIfExists(full);
      if (!parsed) continue;
      for (const r of parsed) {
        const row: RawDepth = {
          player_name: r.player_name ?? r.name ?? '',
          team_name: r.team_name ?? r.school ?? r.team ?? '',
          position: r.position ?? r.pos ?? '',
          pos_rank: r.pos_rank ?? r.rank ?? r.depth ?? '',
          status: r.status ?? r.injury_status ?? '',
          notes: r.notes ?? '',
          __source: name,
          __mtime: mtime,
        };
        rows.push(row);
      }
    }
  }
  if (rows.length === 0) {
    console.warn(`No depth sources found under data/player/depth for season ${season}. Expected files like 247_${season}.csv/json, ourlads_${season}.csv/json, team_sites_${season}.csv/json.`);
  }
  return rows;
}

export function normalizeDepth(rows: RawDepth[], teamMap: Record<string, string>): CanonicalDepth[] {
  const result: CanonicalDepth[] = [];
  const unmapped = new Set<string>();
  for (const r of rows) {
    const pos = toPos((r.position || '').toString());
    if (!pos) continue;
    const teamName = (r.team_name || r.school || '').toString().trim();
    const team_id = teamMap[teamName];
    if (!team_id) {
      unmapped.add(teamName);
      continue;
    }
    const player = (r.player_name || '').toString().trim();
    const rank = Number(r.pos_rank || 0);
    if (!player || !Number.isFinite(rank)) continue;
    result.push({
      team_id,
      team_name: teamName,
      player_name: player,
      player_key: cleanName(player),
      pos,
      pos_rank: Math.max(1, Math.floor(rank)),
      status: toStatus(r.status),
      notes: r.notes,
      __source: r.__source,
      __mtime: r.__mtime,
    });
  }
  if (unmapped.size) {
    console.warn('Unmapped teams — add to data/teams_map.json:', Array.from(unmapped).slice(0, 20));
  }
  return result;
}

export function resolveConflicts(rows: CanonicalDepth[]): CanonicalDepth[] {
  // Precedence: team_sites > ourlads > 247; tie-breaker: latest mtime
  const precedence: Record<SourceTag, number> = { team_sites: 3, ourlads: 2, '247': 1 };
  const map = new Map<string, CanonicalDepth>();
  let conflicts = 0;
  for (const r of rows) {
    const key = `${r.team_id}|${r.pos}|${r.player_key}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, r);
      continue;
    }
    const a = precedence[r.__source];
    const b = precedence[existing.__source];
    if (a > b || (a === b && r.__mtime > existing.__mtime)) {
      map.set(key, r);
      conflicts++;
    }
  }
  console.log(`Conflicts resolved: ${conflicts}`);
  return Array.from(map.values());
}

export function buildDepthChart(rows: CanonicalDepth[]): DepthChartPayload {
  const byTeam: DepthChartPayload = {} as any;
  const groups = new Map<string, CanonicalDepth[]>();
  for (const r of rows) {
    const key = `${r.team_id}|${r.pos}`;
    const arr = groups.get(key) || [];
    arr.push(r);
    groups.set(key, arr);
  }
  for (const [key, arr] of groups.entries()) {
    const [team_id, pos] = key.split('|') as [string, Position];
    const sorted = arr.sort((a, b) => a.pos_rank - b.pos_rank);
    byTeam[team_id] = byTeam[team_id] || ({} as any);
    byTeam[team_id][pos] = sorted.map((r) => ({ player_name: r.player_name, pos_rank: r.pos_rank, status: r.status, source: r.__source, notes: r.notes }));
  }
  return byTeam;
}

function normalizeToSum(values: number[], target: number): number[] {
  const sum = values.reduce((a, b) => a + b, 0) || 1;
  return values.map((v) => (v / sum) * target);
}

export function buildUsagePriors(depth: DepthChartPayload): UsagePriorsPayload {
  const priors: UsagePriorsPayload = {} as any;
  for (const [team_id, positions] of Object.entries(depth)) {
    priors[team_id] = {} as any;

    // QB
    if (positions.QB) {
      priors[team_id].QB = positions.QB.map((p, idx) => ({ player_name: p.player_name, snap_share: idx === 0 ? 0.95 : 0.05 }));
    }

    // RB
    if (positions.RB) {
      const rbWeights = positions.RB.map((_, idx) => (idx === 0 ? 0.6 : idx === 1 ? 0.3 : 0.1));
      const snapShares = normalizeToSum(rbWeights, Math.min(0.95, rbWeights.reduce((a, b) => a + b, 0)));
      priors[team_id].RB = positions.RB.map((p, i) => ({ player_name: p.player_name, snap_share: Number(snapShares[i]?.toFixed(2) ?? 0), rush_share: Number(((snapShares[i] || 0) * 0.9).toFixed(2)) }));
    }

    // WR
    if (positions.WR) {
      const weights = positions.WR.map((_, idx) => (idx === 0 ? 0.8 : idx === 1 ? 0.7 : idx === 2 ? 0.6 : 0.2));
      const snapShares = normalizeToSum(weights.slice(0, Math.max(positions.WR.length, 1)), positions.WR.length < 3 ? 1.0 : 1.0);
      priors[team_id].WR = positions.WR.map((p, i) => ({ player_name: p.player_name, snap_share: Number((snapShares[i] || 0).toFixed(2)), target_share: Number((snapShares[i] || 0).toFixed(2)) }));
    }

    // TE
    if (positions.TE) {
      let te1 = 0.7; let te2 = 0.35;
      const has12 = positions.TE.slice(0, 2).some((p) => /12\s*-?personnel/i.test(p.notes || ''));
      const cap = has12 ? 1.0 : 0.85;
      const weights = positions.TE.map((_, idx) => (idx === 0 ? te1 : idx === 1 ? te2 : 0.15));
      const snapShares = normalizeToSum(weights, cap);
      priors[team_id].TE = positions.TE.map((p, i) => ({ player_name: p.player_name, snap_share: Number((snapShares[i] || 0).toFixed(2)), target_share: Number(((snapShares[i] || 0)).toFixed(2)) }));
    }
  }
  return priors;
}

async function ensureAttributes(databases: Databases, dbId: string) {
  // Ensure attributes exist on model_inputs
  try { await databases.getAttribute(dbId, 'model_inputs', 'depth_chart_json'); }
  catch { await databases.createStringAttribute(dbId, 'model_inputs', 'depth_chart_json', 16384, false); }
  try { await databases.getAttribute(dbId, 'model_inputs', 'usage_priors_json'); }
  catch { await databases.createStringAttribute(dbId, 'model_inputs', 'usage_priors_json', 16384, false); }
}

export async function upsertModelInputs({ season, depthChart, usagePriors }: { season: number; depthChart: DepthChartPayload; usagePriors: UsagePriorsPayload }): Promise<void> {
  const { databases, dbId } = getDatabases();
  await ensureAttributes(databases, dbId);
  const res = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const doc = res.documents.find((d: any) => d.week === undefined || d.week === null);
  const update = {
    depth_chart_json: JSON.stringify(depthChart),
    usage_priors_json: JSON.stringify(usagePriors),
  } as any;
  if (doc) {
    await databases.updateDocument(dbId, 'model_inputs', doc.$id, update);
    console.log(`✔ Updated model_inputs ${doc.$id} (depth_chart_json, usage_priors_json)`);
  } else {
    const created = await databases.createDocument(dbId, 'model_inputs', ID.unique(), { season, ...update });
    console.log(`✔ Created model_inputs ${created.$id} (depth_chart_json, usage_priors_json)`);
  }
}

function readTeamMap(): Record<string, string> {
  const file = path.join(process.cwd(), 'data/teams_map.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>; } catch { return {}; }
}

function applyOverrides(season: number, priors: UsagePriorsPayload): UsagePriorsPayload {
  const file = path.join(process.cwd(), `data/player/depth/overrides_${season}.json`);
  if (!fs.existsSync(file)) return priors;
  try {
    const overrides = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, any>;
    // Expect overrides keyed by team_id -> pos -> array of { player_name, snap_share?, rush_share?, target_share? }
    for (const [team_id, posObj] of Object.entries(overrides)) {
      for (const [pos, arr] of Object.entries(posObj as any)) {
        (priors[team_id] as any)[pos] = arr;
      }
    }
  } catch {}
  return priors;
}

async function main() {
  assertServerEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const teamMap = readTeamMap();
  const raw = await loadDepthSources(season);
  const norm = normalizeDepth(raw, teamMap);
  const resolved = resolveConflicts(norm);
  const depth = buildDepthChart(resolved);
  let priors = buildUsagePriors(depth);
  priors = applyOverrides(season, priors);

  // Save snapshots
  const rawDir = path.join(process.cwd(), 'data/player/raw/depth'); fs.mkdirSync(rawDir, { recursive: true });
  fs.writeFileSync(path.join(rawDir, `merged_${season}.json`), JSON.stringify(resolved, null, 2));
  const processedDir = path.join(process.cwd(), 'data/player/processed/depth'); fs.mkdirSync(processedDir, { recursive: true });
  fs.writeFileSync(path.join(processedDir, `depth_chart_${season}.json`), JSON.stringify(depth, null, 2));
  fs.writeFileSync(path.join(processedDir, `usage_priors_${season}.json`), JSON.stringify(priors, null, 2));

  await upsertModelInputs({ season, depthChart: depth, usagePriors: priors });

  // Logging summary
  let teamCount = Object.keys(depth).length; let positions = 0; let players = 0;
  for (const posMap of Object.values(depth)) {
    for (const arr of Object.values(posMap)) { positions++; players += (arr as any[]).length; }
  }
  console.log(`✅ Depth charts ingested: teams=${teamCount}, positions=${positions}, players=${players}`);
}

// Support both CJS and ESM execution
try {
  // @ts-ignore
  if (typeof require !== 'undefined' && require.main === module) {
    main().catch((e) => { console.error('❌ Ingest depth charts failed', e); process.exit(1); });
  }
} catch {}

try {
  // ESM direct run check
  // eslint-disable-next-line no-undef
  const isDirect = (import.meta as any)?.url && process.argv[1] && (new URL((import.meta as any).url).pathname.endsWith(path.basename(process.argv[1])));
  if (isDirect) {
    main().catch((e) => { console.error('❌ Ingest depth charts failed', e); process.exit(1); });
  }
} catch {}


