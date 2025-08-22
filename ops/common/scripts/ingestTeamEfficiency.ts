#!/usr/bin/env ts-node

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { Client, Databases, ID, Query } from 'node-appwrite';

type Position = 'QB' | 'RB' | 'WR' | 'TE';

// ==== Raw shapes
export interface RawSP { team_name: string; sp_off?: number | string; sp_def?: number | string; sp_st?: number | string; sp_total?: number | string; sp_rank?: number | string }
export interface RawFEI { team_name: string; fei_off?: number | string; fei_def?: number | string; fei_st?: number | string; fei_total?: number | string; fei_rank?: number | string }
export interface RawPace { team_name: string; plays_per_game?: number | string; sec_per_play?: number | string; neutral_plays_pg?: number | string }

export interface NormalizedEff {
  team_id: string;
  team_name: string;
  off_sp?: number; def_sp?: number; st_sp?: number; total_sp?: number; sp_rank?: number;
  off_fei?: number; def_fei?: number; st_fei?: number; total_fei?: number; fei_rank?: number;
}

export interface NormalizedPace { team_id: string; plays_per_game?: number; sec_per_play?: number; neutral_plays_pg?: number }

export interface TeamEfficiencyRecord {
  off_eff: number; // composite z average
  def_eff: number;
  special_teams_eff: number;
  pace_est: number;
  sp_plus?: any;
  fei?: any;
}

export type TeamEfficiencyPayload = Record<string, TeamEfficiencyRecord>;
export type PacePayload = Record<string, { plays_per_game?: number; sec_per_play?: number; neutral_plays_pg?: number }>;
export type OppGradesPayload = Record<string, { QB_grade: number; RB_grade: number; WR_grade: number; TE_grade: number }>;

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

function readJson(file: string): any[] | null { if (!fs.existsSync(file)) return null; try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function readCsv(file: string): any[] | null { if (!fs.existsSync(file)) return null; const txt = fs.readFileSync(file, 'utf8'); return parseCsv(txt, { columns: true, skip_empty_lines: true, trim: true }) as any[]; }

export async function loadEfficiencyData(season: number): Promise<{ sp: RawSP[]; fei: RawFEI[]; pace: RawPace[] }> {
  const dir = path.join(process.cwd(), 'data/market/efficiency');
  const candidates = (base: string) => [path.join(dir, `${base}_${season}.json`), path.join(dir, `${base}_${season}.csv`)];

  const spFiles = [...candidates('sp_plus'), ...candidates('spplus')];
  const feiFiles = candidates('fei');
  const paceFiles = candidates('pace');

  let sp: RawSP[] = [];
  for (const f of spFiles) { const rows = f.endsWith('.json') ? readJson(f) : readCsv(f); if (rows) { sp = rows as RawSP[]; break; } }
  let fei: RawFEI[] = [];
  for (const f of feiFiles) { const rows = f.endsWith('.json') ? readJson(f) : readCsv(f); if (rows) { fei = rows as RawFEI[]; break; } }
  let pace: RawPace[] = [];
  for (const f of paceFiles) { const rows = f.endsWith('.json') ? readJson(f) : readCsv(f); if (rows) { pace = rows as RawPace[]; break; } }

  return { sp, fei, pace };
}

function readTeamMap(): Record<string, string> {
  const file = path.join(process.cwd(), 'data/teams_map.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>; } catch { return {}; }
}

export function normalizeTeams(data: { sp: RawSP[]; fei: RawFEI[]; pace: RawPace[] }, teamMap: Record<string, string>) {
  const normSp: NormalizedEff[] = [];
  const normFei: NormalizedEff[] = [];
  const normPace: NormalizedPace[] = [];
  const unknown = new Set<string>();

  for (const r of data.sp) {
    const name = (r.team_name || '').toString().trim();
    const team_id = teamMap[name]; if (!team_id) { unknown.add(name); continue; }
    normSp.push({ team_id, team_name: name, off_sp: num(r.sp_off), def_sp: num(r.sp_def), st_sp: num(r.sp_st), total_sp: num(r.sp_total), sp_rank: num(r.sp_rank) });
  }
  for (const r of data.fei) {
    const name = (r.team_name || '').toString().trim();
    const team_id = teamMap[name]; if (!team_id) { unknown.add(name); continue; }
    normFei.push({ team_id, team_name: name, off_fei: num(r.fei_off), def_fei: num(r.fei_def), st_fei: num(r.fei_st), total_fei: num(r.fei_total), fei_rank: num(r.fei_rank) });
  }
  for (const r of data.pace) {
    const name = (r.team_name || '').toString().trim();
    const team_id = teamMap[name]; if (!team_id) { unknown.add(name); continue; }
    normPace.push({ team_id, plays_per_game: num(r.plays_per_game), sec_per_play: num(r.sec_per_play), neutral_plays_pg: num(r.neutral_plays_pg) });
  }

  if (unknown.size) console.warn('Unmapped efficiency teams:', Array.from(unknown).slice(0, 20));
  return { normSp, normFei, normPace };
}

function num(v: any): number | undefined { const n = Number(v); return Number.isFinite(n) ? n : undefined; }

function zScoreMap(records: Array<{ team_id: string; value?: number }>): Map<string, number> {
  const vals = records.map((r) => r.value).filter((v): v is number => Number.isFinite(v as number));
  const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  const sd = Math.sqrt(vals.reduce((a, b) => a + Math.pow((b - mean), 2), 0) / Math.max(1, vals.length - 1));
  const m = new Map<string, number>();
  for (const r of records) {
    if (!Number.isFinite(r.value as number) || !sd) { m.set(r.team_id, 0); continue; }
    m.set(r.team_id, ((r.value as number) - mean) / sd);
  }
  return m;
}

function idxFromZ(z: number): number { return Math.max(70, Math.min(130, Number((100 + 10 * z).toFixed(1)))); }

export function mergeMetrics(sp: NormalizedEff[], fei: NormalizedEff[], pace?: NormalizedPace[]): TeamEfficiencyPayload {
  const byTeam: Record<string, Partial<NormalizedEff>> = {};
  for (const r of sp) byTeam[r.team_id] = { ...(byTeam[r.team_id] || {}), ...r };
  for (const r of fei) byTeam[r.team_id] = { ...(byTeam[r.team_id] || {}), ...r };

  // Build z-score maps for composite
  const zOffSp = zScoreMap(Object.values(byTeam).map((r: any) => ({ team_id: r.team_id, value: r.off_sp })));
  const zDefSp = zScoreMap(Object.values(byTeam).map((r: any) => ({ team_id: r.team_id, value: r.def_sp })));
  const zStSp = zScoreMap(Object.values(byTeam).map((r: any) => ({ team_id: r.team_id, value: r.st_sp })));
  const zOffFei = zScoreMap(Object.values(byTeam).map((r: any) => ({ team_id: r.team_id, value: r.off_fei })));
  const zDefFei = zScoreMap(Object.values(byTeam).map((r: any) => ({ team_id: r.team_id, value: r.def_fei })));
  const zStFei = zScoreMap(Object.values(byTeam).map((r: any) => ({ team_id: r.team_id, value: r.st_fei })));

  const payload: TeamEfficiencyPayload = {};
  for (const [team_id, r] of Object.entries(byTeam)) {
    const zOff = avgDefined([zOffSp.get(team_id), zOffFei.get(team_id)]);
    const zDef = avgDefined([zDefSp.get(team_id), zDefFei.get(team_id)]);
    const zSt = avgDefined([zStSp.get(team_id), zStFei.get(team_id)]);

    // Pace from input if present; else estimate from offense index
    const pRec = (pace || []).find((p) => p.team_id === team_id);
    const offIdx = idxFromZ(zOff || 0);
    const estPlays = clamp(60, 80, 68 + (offIdx - 100) / 3); // heuristic
    const pace_est = pRec?.plays_per_game || estPlays;

    payload[team_id] = {
      off_eff: Number((zOff || 0).toFixed(3)),
      def_eff: Number((zDef || 0).toFixed(3)),
      special_teams_eff: Number((zSt || 0).toFixed(3)),
      pace_est: Number((pace_est).toFixed(1)),
      sp_plus: {
        off: (r as any).off_sp, def: (r as any).def_sp, st: (r as any).st_sp, total: (r as any).total_sp, rank: (r as any).sp_rank,
      },
      fei: {
        off: (r as any).off_fei, def: (r as any).def_fei, st: (r as any).st_fei, total: (r as any).total_fei, rank: (r as any).fei_rank,
      },
    };
  }
  return payload;
}

function clamp(min: number, max: number, v: number): number { return Math.max(min, Math.min(max, v)); }
function avgDefined(values: Array<number | undefined>): number { const vs = values.filter((x): x is number => Number.isFinite(x as number)); return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0; }

export function buildPaceEstimates(payload: TeamEfficiencyPayload, pace?: NormalizedPace[]): PacePayload {
  const out: PacePayload = {};
  for (const [team_id, rec] of Object.entries(payload)) {
    const p = (pace || []).find((x) => x.team_id === team_id);
    out[team_id] = {
      plays_per_game: p?.plays_per_game ?? rec.pace_est,
      sec_per_play: p?.sec_per_play ?? Number((24 - (rec.off_eff * 1.2)).toFixed(1)),
      neutral_plays_pg: p?.neutral_plays_pg,
    };
  }
  return out;
}

export function deriveOpponentGrades(teamEff: TeamEfficiencyPayload): OppGradesPayload {
  const out: OppGradesPayload = {};
  for (const [team_id, rec] of Object.entries(teamEff)) {
    // Higher grade → easier matchup. Use inverse of defensive z.
    const idx = idxFromZ(-(rec.def_eff || 0));
    out[team_id] = { QB_grade: idx, RB_grade: idx, WR_grade: idx, TE_grade: idx };
  }
  return out;
}

async function ensureAttributes(databases: Databases, dbId: string) {
  try { await databases.getAttribute(dbId, 'model_inputs', 'team_efficiency_json'); }
  catch { await databases.createStringAttribute(dbId, 'model_inputs', 'team_efficiency_json', 16384, false); }
  try { await databases.getAttribute(dbId, 'model_inputs', 'pace_estimates_json'); }
  catch { await databases.createStringAttribute(dbId, 'model_inputs', 'pace_estimates_json', 16384, false); }
  // opponent_grades_by_pos might already exist; if not, create
  try { await databases.getAttribute(dbId, 'model_inputs', 'opponent_grades_by_pos'); }
  catch { await databases.createStringAttribute(dbId, 'model_inputs', 'opponent_grades_by_pos', 8192, false); }
}

export async function upsertModelInputs({ season, teamEfficiency, pace, opponentGrades }: { season: number; teamEfficiency: TeamEfficiencyPayload; pace: PacePayload; opponentGrades: OppGradesPayload }): Promise<void> {
  const { databases, dbId } = getDatabases();
  await ensureAttributes(databases, dbId);
  const res = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const doc = res.documents.find((d: any) => d.week === undefined || d.week === null);

  const update: any = {
    team_efficiency_json: JSON.stringify(teamEfficiency),
    pace_estimates_json: JSON.stringify(pace),
  };
  // Only set opponent grades if missing to avoid clobbering richer later data
  const shouldWriteOpp = !doc || doc.opponent_grades_by_pos === undefined;
  if (shouldWriteOpp) update.opponent_grades_by_pos = JSON.stringify(opponentGrades);

  if (doc) {
    await databases.updateDocument(dbId, 'model_inputs', doc.$id, update);
    console.log(`✔ Updated model_inputs ${doc.$id} (team_efficiency_json, pace_estimates_json${shouldWriteOpp ? ', opponent_grades_by_pos' : ''})`);
  } else {
    const created = await databases.createDocument(dbId, 'model_inputs', ID.unique(), { season, ...update });
    console.log(`✔ Created model_inputs ${created.$id} (team_efficiency_json, pace_estimates_json${shouldWriteOpp ? ', opponent_grades_by_pos' : ''})`);
  }
}

async function main() {
  assertServerEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const data = await loadEfficiencyData(season);
  const teamMap = readTeamMap();
  const { normSp, normFei, normPace } = normalizeTeams(data, teamMap);
  const teamEfficiency = mergeMetrics(normSp, normFei, normPace);
  const paceEstimates = buildPaceEstimates(teamEfficiency, normPace);
  const opponentGrades = deriveOpponentGrades(teamEfficiency);

  // Save snapshots
  const outDir = path.join(process.cwd(), 'data/player/processed/efficiency'); fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `team_efficiency_${season}.json`), JSON.stringify(teamEfficiency, null, 2));
  fs.writeFileSync(path.join(outDir, `pace_estimates_${season}.json`), JSON.stringify(paceEstimates, null, 2));
  fs.writeFileSync(path.join(outDir, `opponent_grades_${season}.json`), JSON.stringify(opponentGrades, null, 2));

  await upsertModelInputs({ season, teamEfficiency, pace: paceEstimates, opponentGrades });

  // Simple summary logs
  const offPairs = Object.entries(teamEfficiency).map(([tid, r]) => ({ tid, z: r.off_eff })).sort((a, b) => b.z - a.z);
  const defPairs = Object.entries(teamEfficiency).map(([tid, r]) => ({ tid, z: r.def_eff })).sort((a, b) => a.z - b.z); // lower def_eff is better defense if z from allowed values; keep as z
  console.log('Top offenses (z):', offPairs.slice(0, 5));
  console.log('Bottom offenses (z):', offPairs.slice(-5));
  console.log('Top defenses (z low→high):', defPairs.slice(0, 5));
}

const _entry = process.argv[1] || '';
if (_entry.includes('ingestTeamEfficiency')) {
  main().catch((e) => { console.error('❌ Ingest team efficiency failed', e); process.exit(1); });
}


