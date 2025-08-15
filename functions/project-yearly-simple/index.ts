#!/usr/bin/env ts-node

import { Client, Databases, ID, Query } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

type Position = 'QB' | 'RB' | 'WR' | 'TE';

interface PaceEstimates { [teamId: string]: { plays_per_game?: number } }
interface TeamEfficiency { [teamId: string]: { off_eff?: number; pace_est?: number } }
interface UsagePriorsByTeam {
  [teamId: string]: {
    QB?: Array<{ player_name: string; snap_share: number }>
    RB?: Array<{ player_name: string; snap_share: number; rush_share?: number }>
    WR?: Array<{ player_name: string; snap_share: number; target_share?: number }>
    TE?: Array<{ player_name: string; snap_share: number; target_share?: number }>
  }
}
interface DepthChartByTeam {
  [teamId: string]: {
    QB?: Array<{ player_name: string; pos_rank: number; status: string }>
    RB?: Array<{ player_name: string; pos_rank: number; status: string }>
    WR?: Array<{ player_name: string; pos_rank: number; status: string }>
    TE?: Array<{ player_name: string; pos_rank: number; status: string }>
  }
}

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

function parseMaybeJson<T>(val: any): T {
  if (val == null) return {} as T;
  if (typeof val === 'string') {
    try { return JSON.parse(val) as T; } catch { return {} as T; }
  }
  return val as T;
}

function clamp(min: number, max: number, v: number): number { return Math.max(min, Math.min(max, v)); }

// --- Scoring ---
function score(stat: any): number {
  let pts = 0;
  pts += (stat.pass_yards || 0) * 0.04;
  pts += (stat.pass_tds || 0) * 4;
  pts += (stat.ints || 0) * -2;
  pts += (stat.rush_yards || 0) * 0.1;
  pts += (stat.rush_tds || 0) * 6;
  pts += (stat.rec_yards || 0) * 0.1;
  pts += (stat.rec_tds || 0) * 6;
  pts += (stat.receptions || 0) * 1;
  return Math.round(pts * 10) / 10;
}

async function ensureYearlyAttributes(databases: Databases, dbId: string) {
  try { await databases.getAttribute(dbId, 'projections_yearly', 'statline_simple_json'); }
  catch { await databases.createStringAttribute(dbId, 'projections_yearly', 'statline_simple_json', 8192, false); }
}

function oppScalarFromOffZ(z: number): number {
  // Convert offensive z-score to a modest multiplier
  return clamp(0.85, 1.15, 1 + (z || 0) * 0.05);
}

function getUsageRate(pos: Position, pri: any): number {
  if (!pri) return 0;
  if (pos === 'RB') return pri.rush_share ?? pri.snap_share ?? 0;
  if (pos === 'WR' || pos === 'TE') return pri.target_share ?? pri.snap_share ?? 0;
  return pri.snap_share ?? 1.0;
}

async function main() {
  assertServerEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const { databases, dbId } = getDatabases();
  await ensureYearlyAttributes(databases, dbId);

  // Load model_inputs for season (week null)
  const res = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const model = res.documents.find((d: any) => d.week === undefined || d.week === null);
  if (!model) throw new Error(`model_inputs not found for season=${season}`);

  const depthChart = parseMaybeJson<DepthChartByTeam>(model.depth_chart_json);
  const usagePriors = parseMaybeJson<UsagePriorsByTeam>(model.usage_priors_json);
  const teamEff = parseMaybeJson<TeamEfficiency>(model.team_efficiency_json);
  const pace = parseMaybeJson<PaceEstimates>(model.pace_estimates_json);
  const ea = parseMaybeJson<Record<string, any>>(model.ea_ratings_json);
  const draft = parseMaybeJson<Record<string, { draft_capital_score?: number }>>(model.nfl_draft_capital_json);

  // Build inverse team map (team_id -> probable names) if file exists for name matching
  let idToNames: Record<string, string[]> = {};
  try {
    const mapPath = path.join(process.cwd(), 'data/teams_map.json');
    if (fs.existsSync(mapPath)) {
      const tm = JSON.parse(fs.readFileSync(mapPath, 'utf8')) as Record<string, string>;
      for (const [name, id] of Object.entries(tm)) {
        idToNames[id] = [...(idToNames[id] || []), name];
      }
    }
  } catch {}

  // Iterate players
  const candidates: Array<{ teamId: string; pos: Position; player_name: string; usage_rate: number; pace_adj: number; effZ: number; games: number; draftBoost: number; eaKey?: string }>
    = [];

  for (const [teamId, positions] of Object.entries(depthChart || {})) {
    const teamPace = pace?.[teamId]?.plays_per_game || (teamEff?.[teamId]?.pace_est ?? 70);
    const offZ = teamEff?.[teamId]?.off_eff ?? 0;
    for (const posKey of ['QB', 'RB', 'WR', 'TE'] as Position[]) {
      const arr = (positions as any)[posKey] as Array<{ player_name: string; pos_rank: number; status: string }> | undefined;
      if (!arr) continue;
      const priArr = (usagePriors?.[teamId] as any)?.[posKey] as any[] | undefined;
      for (const p of arr) {
        const pri = priArr?.find((x) => (x.player_name || '').trim().toLowerCase() === (p.player_name || '').trim().toLowerCase());
        const usage_rate = getUsageRate(posKey, pri);
        if (usage_rate < 0.05) continue;
        const effScalar = oppScalarFromOffZ(offZ);
        const injKey = findEAKey(ea, p.player_name, teamId, posKey);
        const injNorm = injKey && ea[injKey]?.inj?.norm ? Number(ea[injKey].inj.norm) : 0.5;
        const games = Math.round(12 * clamp(0.7, 1.0, 0.85 + 0.15 * injNorm));
        const dKey = buildKey(p.player_name, teamId, posKey);
        const draftBoost = draft?.[dKey]?.draft_capital_score && draft[dKey].draft_capital_score > 0.8 ? 1.03 : 1.0;
        candidates.push({ teamId, pos: posKey, player_name: p.player_name, usage_rate, pace_adj: teamPace * effScalar, effZ: offZ, games, draftBoost, eaKey: injKey });
      }
    }
  }

  // Compute projections and upsert
  const results: Array<{ key: string; points: number }> = [];
  for (const c of candidates) {
    const stat = computeStatline(c);
    const points = score(stat) * c.draftBoost;
    const playerId = await resolvePlayerId(databases, dbId, c.teamId, c.pos, c.player_name, idToNames);
    if (!playerId) continue;
    await upsertYearly(databases, dbId, playerId, season, {
      games_played_est: c.games,
      usage_rate: Number(c.usage_rate.toFixed(3)),
      pace_adj: Number(c.pace_adj.toFixed(2)),
      statline_simple_json: JSON.stringify(stat),
      fantasy_points_simple: Number(points.toFixed(1)),
      position: c.pos,
    });
    results.push({ key: `${c.player_name}|${c.teamId}|${c.pos}`, points: Number(points.toFixed(1)) });
  }

  // Log top 10
  results.sort((a, b) => b.points - a.points);
  console.log('Top 10 yearly (simple):');
  for (const r of results.slice(0, 10)) console.log(r);
}

function computeStatline(c: { teamId: string; pos: Position; usage_rate: number; pace_adj: number; games: number; effZ: number }) {
  const P = c.pace_adj; // plays per game (adjusted)
  const G = c.games;
  const PR = 0.52; // simple global pass rate
  const RR = 1 - PR;
  if (c.pos === 'QB') {
    const passAtt = P * PR * 1.0 * G;
    const passYds = passAtt * 7.5;
    const passTD = passAtt * 0.05;
    const ints = passAtt * 0.025;
    const rushAtt = P * RR * 0.10 * G;
    const rushYds = rushAtt * 5.0;
    const rushTD = rushAtt * 0.02;
    return { pass_yards: Math.round(passYds), pass_tds: Math.round(passTD), ints: Math.round(ints), rush_yards: Math.round(rushYds), rush_tds: Math.round(rushTD), receptions: 0, rec_yards: 0, rec_tds: 0 };
  }
  if (c.pos === 'RB') {
    const rushAtt = P * RR * c.usage_rate * G;
    const rushYds = rushAtt * 4.8;
    const rushTD = rushAtt * 0.03;
    const targets = P * PR * (c.usage_rate * 0.5) * G;
    const rec = targets * 0.65;
    const recYds = rec * 7.5;
    const recTD = targets * 0.03;
    return { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: Math.round(rushYds), rush_tds: Math.round(rushTD), receptions: Math.round(rec), rec_yards: Math.round(recYds), rec_tds: Math.round(recTD) };
  }
  // WR / TE
  const targets = P * PR * c.usage_rate * G;
  const catchRate = c.pos === 'TE' ? 0.62 : 0.65;
  const ypr = c.pos === 'TE' ? 10 : 12;
  const tdRate = c.pos === 'TE' ? 0.04 : 0.05;
  const rec = targets * catchRate;
  const recYds = rec * ypr;
  const recTD = targets * tdRate;
  return { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: 0, rush_tds: 0, receptions: Math.round(rec), rec_yards: Math.round(recYds), rec_tds: Math.round(recTD) };
}

function buildKey(playerName: string, teamId: string, pos: Position): string {
  return `${playerName}|${teamId}|${pos}`;
}

function findEAKey(ea: Record<string, any>, playerName: string, teamId: string, pos: Position): string | undefined {
  const key = buildKey(playerName, teamId, pos);
  if (ea && ea[key]) return key;
  // fallback: loose search by includes
  const lname = playerName.trim().toLowerCase();
  return Object.keys(ea || {}).find((k) => k.toLowerCase().includes(lname) && k.includes(`|${teamId}|`) && k.endsWith(`|${pos}`));
}

async function resolvePlayerId(databases: Databases, dbId: string, teamId: string, pos: Position, playerName: string, idToNames: Record<string, string[]>): Promise<string | null> {
  try {
    const teamNames = idToNames[teamId] || [];
    const q: any[] = [Query.equal('position', pos), Query.limit(5)];
    if (playerName) q.push(Query.search('name', playerName));
    const res = await databases.listDocuments(dbId, 'college_players', q);
    const docs = res.documents as any[];
    const doc = docs.find((d) => {
      const nameOk = (d.name || '').toString().toLowerCase().includes(playerName.toLowerCase());
      const teamOk = teamNames.length === 0 || teamNames.some((n) => ((d.team || d.school || '').toString().toLowerCase() === n.toLowerCase()));
      return nameOk && teamOk;
    }) || docs[0];
    return doc ? (doc.$id as string) : null;
  } catch {
    return null;
  }
}

async function upsertYearly(databases: Databases, dbId: string, playerId: string, season: number, data: { games_played_est: number; usage_rate: number; pace_adj: number; statline_simple_json: string; fantasy_points_simple: number; position: Position }) {
  // Find existing
  const existing = await databases.listDocuments(dbId, 'projections_yearly', [Query.equal('player_id', playerId), Query.equal('season', season), Query.limit(1)]);
  if (existing.total > 0) {
    const id = existing.documents[0].$id as string;
    await databases.updateDocument(dbId, 'projections_yearly', id, data);
  } else {
    await databases.createDocument(dbId, 'projections_yearly', ID.unique(), { player_id: playerId, season, position: data.position, ...data });
  }
}

const _entry = process.argv[1] || '';
if (_entry.includes('project-yearly-simple')) {
  main().catch((e) => { console.error('❌ project:yearly_simple failed', e); process.exit(1); });
}


