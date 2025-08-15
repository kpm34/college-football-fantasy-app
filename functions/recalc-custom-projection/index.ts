#!/usr/bin/env ts-node

import { Client, Databases, ID, Query } from 'node-appwrite';

type Position = 'QB' | 'RB' | 'WR' | 'TE';

interface RecalcArgs {
  user_id: string;
  player_id: string;
  season: number;
  week?: number;
  save?: boolean;
  overrides?: { custom_usage?: number; custom_pace?: number };
  runs?: number;
  seed?: number;
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

function parseJSON<T = any>(x: any): T | undefined {
  if (x == null) return undefined;
  if (typeof x === 'string') { try { return JSON.parse(x) as T; } catch { return undefined; } }
  return x as T;
}

function clamp(min: number, max: number, v: number): number { return Math.max(min, Math.min(max, v)); }

// ---- Scoring ----
function fp(s: any): number {
  let pts = 0;
  pts += (s.pass_yards || 0) * 0.04;
  pts += (s.pass_tds || 0) * 4;
  pts += (s.ints || 0) * -2;
  pts += (s.rush_yards || 0) * 0.1;
  pts += (s.rush_tds || 0) * 6;
  pts += (s.rec_yards || 0) * 0.1;
  pts += (s.rec_tds || 0) * 6;
  pts += (s.receptions || 0) * 1;
  return Math.round(pts * 10) / 10;
}

// ---- PRNG & Sampling (same as Step 6) ----
function mulberry32(seed: number): () => number { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
function sampleNormal(rng: () => number, mu = 0, sigma = 1): number { const u = 1 - rng(); const v = 1 - rng(); const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v); return mu + sigma * z; }
function sampleLogNormal(rng: () => number, mu = 0, sigma = 1): number { return Math.exp(sampleNormal(rng, mu, sigma)); }
function sampleGamma(rng: () => number, k: number, theta: number): number { if (k < 1) { const u = rng(); return sampleGamma(rng, k + 1, theta) * Math.pow(u, 1 / k); } const d = k - 1 / 3; const c = 1 / Math.sqrt(9 * d); while (true) { const x = sampleNormal(rng); let v = 1 + c * x; if (v <= 0) continue; v = v * v * v; const u = rng(); if (u < 1 - 0.0331 * (x * x) * (x * x)) return theta * d * v; if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return theta * d * v; } }
function sampleBeta(rng: () => number, a: number, b: number): number { const x = sampleGamma(rng, a, 1); const y = sampleGamma(rng, b, 1); return x / (x + y); }
function samplePoisson(rng: () => number, lambda: number): number { if (lambda <= 0) return 0; if (lambda > 20) { const n = Math.round(sampleNormal(rng, lambda, Math.sqrt(lambda))); return Math.max(0, n); } const L = Math.exp(-lambda); let p = 1.0, k = 0; do { k++; p *= rng(); } while (p > L); return k - 1; }
function binomial(rng: () => number, n: number, p: number): number { if (n <= 0 || p <= 0) return 0; if (n > 50) { const mean = n * p; const sd = Math.sqrt(n * p * (1 - p)); return Math.max(0, Math.round(sampleNormal(rng, mean, sd))); } let c = 0; for (let i = 0; i < n; i++) if (rng() < p) c++; return c; }

function getUsageRate(pos: Position, pri: any): number {
  if (!pri) return 0;
  if (pos === 'RB') return pri.rush_share ?? pri.snap_share ?? 0.3;
  if (pos === 'WR' || pos === 'TE') return pri.target_share ?? pri.snap_share ?? (pos === 'WR' ? 0.2 : 0.15);
  return pri.snap_share ?? 1.0;
}

function computeSimpleWeekly(pos: Position, usage: number, pace: number): any {
  const PR = 0.52; const RR = 1 - PR; const G = 1;
  if (pos === 'QB') {
    const att = pace * PR * G; const yds = att * 7.5; const td = att * 0.05; const ints = att * 0.025; const rAtt = pace * RR * 0.10 * G; const rYds = rAtt * 5.0; const rTD = rAtt * 0.02; return { pass_yards: Math.round(yds), pass_tds: Math.round(td), ints: Math.round(ints), rush_yards: Math.round(rYds), rush_tds: Math.round(rTD), receptions: 0, rec_yards: 0, rec_tds: 0 };
  }
  if (pos === 'RB') {
    const rushAtt = pace * RR * usage * G; const rushYds = rushAtt * 4.8; const rushTD = rushAtt * 0.03; const targets = pace * PR * usage * 0.5 * G; const rec = targets * 0.65; const recYds = rec * 7.5; const recTD = targets * 0.03; return { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: Math.round(rushYds), rush_tds: Math.round(rushTD), receptions: Math.round(rec), rec_yards: Math.round(recYds), rec_tds: Math.round(recTD) };
  }
  const targets = pace * PR * usage * G; const rec = targets * 0.65; const recYds = rec * (pos === 'TE' ? 10 : 12); const recTD = targets * (pos === 'TE' ? 0.04 : 0.05); return { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: 0, rush_tds: 0, receptions: Math.round(rec), rec_yards: Math.round(recYds), rec_tds: Math.round(recTD) };
}

function simulateWeekly(pos: Position, usage: number, pace: number, oppGrade: number, injuryRisk: number, draftScore: number, rng: () => number, runs: number) {
  const PR = 0.52; const RR = 1 - PR; const draftBoost = draftScore ? Math.min(1.05, 1 + 0.05 * draftScore) : 1.0; const oppScalar = clamp(0.8, 1.2, 0.9 + ((oppGrade || 100) - 100) / 100 * 0.2);
  const samples: number[] = []; const statlines: any[] = [];
  for (let i = 0; i < runs; i++) {
    let u = usage; if (rng() < injuryRisk) u *= (1 - sampleBeta(rng, 2, 5)); if (rng() < 0.05) u *= 1 + sampleBeta(rng, 2, 2) * 0.2; const plays = pace * (0.9 + rng() * 0.2); const teamPoints = 28 + sampleNormal(rng, 0, 3);
    if (pos === 'QB') { const att = samplePoisson(rng, plays * PR); const ypa = sampleLogNormal(rng, Math.log(7.5) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar * draftBoost; const yds = att * ypa; const td = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.5)); const ints = samplePoisson(rng, att * 0.02); const rAtt = samplePoisson(rng, plays * RR * 0.1); const ypc = sampleLogNormal(rng, Math.log(5.0) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar; const rYds = rAtt * ypc; const rTD = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.1)); const s = { pass_yards: yds, pass_tds: td, ints, rush_yards: rYds, rush_tds: rTD, receptions: 0, rec_yards: 0, rec_tds: 0 }; samples.push(fp(s)); statlines.push(roundStat(s)); continue; }
    if (pos === 'RB') { const rushMean = plays * RR * u; const rushLam = sampleGamma(rng, 5, rushMean / 5); const rAtt = samplePoisson(rng, rushLam); const ypc = sampleLogNormal(rng, Math.log(4.8) - 0.5 * 0.2 * 0.2, 0.2) * oppScalar * draftBoost; const rYds = rAtt * ypc; const targets = samplePoisson(rng, plays * PR * u * 0.5); const catchP = sampleBeta(rng, 40, 22); const rec = binomial(rng, targets, catchP); const ypr = sampleLogNormal(rng, Math.log(7.5) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar; const recYds = rec * ypr; const td = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.35 * u)); const s = { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: rYds, rush_tds: td, receptions: rec, rec_yards: recYds, rec_tds: samplePoisson(rng, td * 0.2) }; samples.push(fp(s)); statlines.push(roundStat(s)); continue; }
    const targetsMean = plays * PR * u; const lam = sampleGamma(rng, 5, targetsMean / 5); const tgts = samplePoisson(rng, lam); const catchP = sampleBeta(rng, 42, 22); const rec = binomial(rng, tgts, catchP); const ypr = sampleLogNormal(rng, Math.log(12) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar * draftBoost; const recYds = rec * ypr; const td = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.30 * u)); const s = { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: 0, rush_tds: 0, receptions: rec, rec_yards: recYds, rec_tds: td }; samples.push(fp(s)); statlines.push(roundStat(s));
  }
  const sorted = [...samples].sort((a, b) => a - b); const trim = Math.floor(sorted.length * 0.005); const arr = sorted.slice(trim, sorted.length - trim); const q = (p: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor(p * (arr.length - 1))))]; const p50 = q(0.5); const p80 = q(0.8); const p20 = q(0.2); const boomProb = samples.filter((x) => x >= 1.5 * p50).length / samples.length; const bustProb = samples.filter((x) => x <= 0.5 * p50).length / samples.length; const statsSorted = [...statlines].sort((a, b) => fp(a) - fp(b)); const mid = statsSorted[Math.floor(statsSorted.length / 2)]; const flo = statsSorted[Math.floor(statsSorted.length * 0.2)]; const cei = statsSorted[Math.floor(statsSorted.length * 0.8)]; return { summary: { p20, p50, p80, boomProb, bustProb }, statlines: { median: mid, floor: flo, ceiling: cei } };
}

function roundStat(s: any) { const o: any = {}; for (const [k, v] of Object.entries(s)) o[k] = Math.round((v as number) * 10) / 10; return o; }

export async function mergeOverrides(base: { usage: number; pace: number }, custom?: { custom_usage?: number; custom_pace?: number }) {
  return {
    usage: clamp(0, 1, custom?.custom_usage ?? base.usage),
    pace: clamp(40, 90, custom?.custom_pace ?? base.pace),
  };
}

export async function recalcWeeklyProjection(params: RecalcArgs) {
  const { databases, dbId } = getDatabases();
  const season = params.season; const week = params.week!; const runs = params.runs || 2000; const seed = params.seed || 42; const rng = mulberry32(seed);

  const miRes = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const mi = miRes.documents.find((d: any) => d.week == null);
  if (!mi) throw new Error('model_inputs not found');
  const usage = parseJSON<any>(mi.usage_priors_json) || {};
  const eff = parseJSON<any>(mi.team_efficiency_json) || {};
  const pace = parseJSON<any>(mi.pace_estimates_json) || {};
  const oppGrades = parseJSON<any>((mi as any).opponent_grades_by_pos) || {};

  // Resolve player context from projections_yearly or players
  const yr = await databases.listDocuments(dbId, 'projections_yearly', [Query.equal('season', season), Query.equal('player_id', params.player_id), Query.limit(1)]);
  const baseDoc = yr.total > 0 ? yr.documents[0] as any : null;
  let teamId = baseDoc?.team_id || baseDoc?.teamId || baseDoc?.team;
  let pos: Position = baseDoc?.position || baseDoc?.pos;
  let playerName = baseDoc?.player_name || baseDoc?.name || '';
  if (!teamId || !pos) {
    const pl = await databases.listDocuments(dbId, 'college_players', [Query.equal('$id', params.player_id), Query.limit(1)]);
    if (pl.total > 0) { const p = pl.documents[0] as any; teamId = p.team || p.school; pos = p.position; playerName = p.name || p.player_name || playerName; }
  }
  if (!teamId || !pos) throw new Error('Unable to resolve player team/pos');

  const pri = usage?.[teamId]?.[pos]?.find((x: any) => (x.player_name || '').toLowerCase() === (playerName || '').toLowerCase());
  const baseUsage = getUsageRate(pos, pri) || 0.2;
  const basePace = pace?.[teamId]?.plays_per_game || eff?.[teamId]?.pace_est || 70;

  // user overrides
  const userDoc = await databases.listDocuments(dbId, 'user_custom_projections', [Query.equal('user_id', params.user_id), Query.equal('player_id', params.player_id), Query.equal('season', season), Query.limit(1)]);
  const custom = userDoc.total > 0 ? (userDoc.documents[0] as any) : {};
  const merged = await mergeOverrides({ usage: baseUsage, pace: basePace }, { custom_usage: params.overrides?.custom_usage ?? custom.custom_usage, custom_pace: params.overrides?.custom_pace ?? custom.custom_pace });

  // opponent
  const games = await databases.listDocuments(dbId, 'games', [Query.equal('season', season), Query.equal('week', week), Query.limit(10000)]);
  let oppId: string | undefined; for (const g of (games.documents as any[])) { const ht = g.home_team || g.homeTeam || g.homeTeamId || g.home_team_id; const at = g.away_team || g.awayTeam || g.awayTeamId || g.away_team_id; if (String(ht) === String(teamId)) oppId = String(at); if (String(at) === String(teamId)) oppId = String(ht); }
  const oppGrade = oppId ? (oppGrades?.[oppId]?.[pos + '_grade'] || 100) : 100;

  const sim = simulateWeekly(pos, merged.usage, merged.pace, oppGrade, 0.15, 0, rng, runs);
  const simple = computeSimpleWeekly(pos, merged.usage, merged.pace);
  const response = {
    player_id: params.player_id,
    season,
    week,
    simple: { statline_simple_json: simple, fantasy_points_simple: fp(simple) },
    pro: {
      statline_median_json: sim.statlines.median,
      statline_floor_json: sim.statlines.floor,
      statline_ceiling_json: sim.statlines.ceiling,
      boom_prob: Number(sim.summary.boomProb.toFixed(3)),
      bust_prob: Number(sim.summary.bustProb.toFixed(3)),
      defense_vs_pos_grade: Math.round(oppGrade),
    },
  };

  if (params.save) {
    if (userDoc.total > 0) await databases.updateDocument(dbId, 'user_custom_projections', userDoc.documents[0].$id as string, { custom_usage: merged.usage, custom_pace: merged.pace });
    else await databases.createDocument(dbId, 'user_custom_projections', ID.unique(), { user_id: params.user_id, player_id: params.player_id, season, custom_usage: merged.usage, custom_pace: merged.pace });
  }
  return response;
}

export async function recalcYearlyProjection(params: RecalcArgs) {
  const { databases, dbId } = getDatabases();
  const season = params.season; const runs = params.runs || 2000; const seed = params.seed || 42; const rng = mulberry32(seed);
  const miRes = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const mi = miRes.documents.find((d: any) => d.week == null);
  if (!mi) throw new Error('model_inputs not found');
  const usage = parseJSON<any>(mi.usage_priors_json) || {};
  const eff = parseJSON<any>(mi.team_efficiency_json) || {};
  const pace = parseJSON<any>(mi.pace_estimates_json) || {};

  const yr = await databases.listDocuments(dbId, 'projections_yearly', [Query.equal('season', season), Query.equal('player_id', params.player_id), Query.limit(1)]);
  const d = yr.total > 0 ? yr.documents[0] as any : null;
  let teamId = d?.team_id || d?.teamId || d?.team; let pos: Position = d?.position || d?.pos; let playerName = d?.player_name || d?.name || '';
  if (!teamId || !pos) {
    const pl = await databases.listDocuments(dbId, 'college_players', [Query.equal('$id', params.player_id), Query.limit(1)]);
    if (pl.total > 0) { const p = pl.documents[0] as any; teamId = p.team || p.school; pos = p.position; playerName = p.name || p.player_name || playerName; }
  }
  if (!teamId || !pos) throw new Error('Unable to resolve player');
  const pri = usage?.[teamId]?.[pos]?.find((x: any) => (x.player_name || '').toLowerCase() === (playerName || '').toLowerCase());
  const baseUsage = getUsageRate(pos, pri) || 0.2;
  const basePace = pace?.[teamId]?.plays_per_game || eff?.[teamId]?.pace_est || 70;
  const games = d?.games_played_est || 12;
  const userDoc = await databases.listDocuments(dbId, 'user_custom_projections', [Query.equal('user_id', params.user_id), Query.equal('player_id', params.player_id), Query.equal('season', season), Query.limit(1)]);
  const custom = userDoc.total > 0 ? (userDoc.documents[0] as any) : {};
  const merged = await mergeOverrides({ usage: baseUsage, pace: basePace }, { custom_usage: params.overrides?.custom_usage ?? custom.custom_usage, custom_pace: params.overrides?.custom_pace ?? custom.custom_pace });

  const sim = simulateWeekly(pos, merged.usage, merged.pace, 100, 0.15, 0, rng, runs);
  const weeklySamples = sim.summary; // p20/p50/p80 weekly
  const yearSamples = { p10: weeklySamples.p20 * games * 0.8, p25: weeklySamples.p20 * games, p50: weeklySamples.p50 * games, p75: weeklySamples.p80 * games, p80: weeklySamples.p80 * games, p90: weeklySamples.p80 * games * 1.2 };

  const response = {
    player_id: params.player_id,
    season,
    simple: { statline_simple_json: computeSimpleWeekly(pos, merged.usage, merged.pace), fantasy_points_simple: fp(computeSimpleWeekly(pos, merged.usage, merged.pace)) * games },
    pro: { range_floor: Number((weeklySamples.p20 * games).toFixed(1)), range_median: Number((weeklySamples.p50 * games).toFixed(1)), range_ceiling: Number((weeklySamples.p80 * games).toFixed(1)), percentiles_json: yearSamples, volatility_score: Math.round(clamp(0, 100, 100 * ((weeklySamples.p80 - weeklySamples.p20) / Math.max(1, weeklySamples.p50)))) }
  };
  if (params.save) {
    if (userDoc.total > 0) await databases.updateDocument(dbId, 'user_custom_projections', userDoc.documents[0].$id as string, { custom_usage: merged.usage, custom_pace: merged.pace });
    else await databases.createDocument(dbId, 'user_custom_projections', ID.unique(), { user_id: params.user_id, player_id: params.player_id, season, custom_usage: merged.usage, custom_pace: merged.pace });
  }
  return response;
}

async function main() {
  assertServerEnv();
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.startsWith('--') ? a.replace(/^--/, '').split('=') : []));
  const season = Number(args.season); if (!season) throw new Error('season is required');
  const user_id = String(args.user || args.user_id || '');
  const player_id = String(args.player || args.player_id || '');
  const week = args.week != null ? Number(args.week) : undefined;
  const save = String(args.save || '').toLowerCase() === 'true';
  const custom_usage = args.custom_usage != null ? Number(args.custom_usage) : undefined;
  const custom_pace = args.custom_pace != null ? Number(args.custom_pace) : undefined;
  const runs = args.runs != null ? Number(args.runs) : undefined;
  const seed = args.seed != null ? Number(args.seed) : undefined;

  const params: RecalcArgs = { user_id, player_id, season, week, save, overrides: { custom_usage, custom_pace }, runs, seed };
  const result = week != null ? await recalcWeeklyProjection(params) : await recalcYearlyProjection(params);
  console.log(JSON.stringify(result, null, 2));
}

const entry = process.argv[1] || '';
if (entry.includes('recalc-custom-projection')) {
  main().catch((e) => { console.error('❌ recalc-custom-projection failed', e); process.exit(1); });
}


