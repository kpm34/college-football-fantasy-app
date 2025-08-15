#!/usr/bin/env ts-node

import { Client, Databases, ID, Query } from 'node-appwrite';

type Position = 'QB' | 'RB' | 'WR' | 'TE';

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

// ---------- PRNG (mulberry32) ----------
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleNormal(rng: () => number, mu = 0, sigma = 1): number {
  // Box-Muller
  const u = 1 - rng();
  const v = 1 - rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mu + sigma * z;
}

function sampleLogNormal(rng: () => number, mu = 0, sigma = 1): number {
  return Math.exp(sampleNormal(rng, mu, sigma));
}

function sampleGamma(rng: () => number, k: number, theta: number): number {
  // Marsaglia and Tsang method for k >= 1; boost for k < 1
  if (k < 1) {
    const u = rng();
    return sampleGamma(rng, k + 1, theta) * Math.pow(u, 1 / k);
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const x = sampleNormal(rng);
    let v = 1 + c * x;
    if (v <= 0) continue;
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return theta * d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return theta * d * v;
  }
}

function sampleBeta(rng: () => number, a: number, b: number): number {
  const x = sampleGamma(rng, a, 1);
  const y = sampleGamma(rng, b, 1);
  return x / (x + y);
}

function samplePoisson(rng: () => number, lambda: number): number {
  if (lambda <= 0) return 0;
  if (lambda > 20) {
    const n = Math.round(sampleNormal(rng, lambda, Math.sqrt(lambda)));
    return Math.max(0, n);
  }
  const L = Math.exp(-lambda);
  let p = 1.0, k = 0;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

function clamp(min: number, max: number, v: number): number { return Math.max(min, Math.min(max, v)); }

// ---------- Types for context ----------
interface ModelInputs {
  usage_priors_json?: any;
  team_efficiency_json?: any;
  pace_estimates_json?: any;
  opponent_grades_by_pos?: any;
  injury_reports_json?: any;
  ea_ratings_json?: any;
  nfl_draft_capital_json?: any;
}

interface PlayerCtx {
  playerId: string;
  playerName: string;
  teamId: string;
  pos: Position;
  usageRate: number; // per play share (RB rush_share, WR/TE target_share, QB snap share)
  pace: number; // plays per game
  offZ: number; // team offensive z from team_efficiency_json
  oppGrade: number; // 70..130 index, weekly only
  injuryRisk: number; // 0..1 chance of reduction
  draftScore?: number; // 0..1
  games: number; // yearly sims only
}

// ---------- Build player model from inputs ----------
async function buildPlayerUniverse(databases: Databases, dbId: string, season: number, week?: number, filterIds?: Set<string>): Promise<PlayerCtx[]> {
  // base from projections_yearly (for pos/team mapping and games)
  const yearly = await databases.listDocuments(dbId, 'projections_yearly', [Query.equal('season', season), Query.limit(10000)]);
  const base = (yearly.documents as any[]).filter((d) => (filterIds ? filterIds.has(d.player_id) : true));

  // load model_inputs
  const miRes = await databases.listDocuments(dbId, 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const mi = miRes.documents.find((d: any) => d.week === undefined || d.week === null) as ModelInputs | undefined;
  const usage = parseJSON(mi?.usage_priors_json) || {};
  const eff = parseJSON(mi?.team_efficiency_json) || {};
  const pace = parseJSON(mi?.pace_estimates_json) || {};
  const oppGrades = parseJSON((mi as any)?.opponent_grades_by_pos) || {};
  const injuries = parseJSON(mi?.injury_reports_json) || {};
  const ea = parseJSON(mi?.ea_ratings_json) || {};
  const draft = parseJSON(mi?.nfl_draft_capital_json) || {};

  // games mapping for week → opponent
  const oppMap: Record<string, string> = {};
  if (week != null) {
    const games = await databases.listDocuments(dbId, 'games', [Query.equal('season', season), Query.equal('week', week), Query.limit(10000)]);
    for (const g of (games.documents as any[])) {
      const ht = g.home_team || g.homeTeam || g.homeTeamId || g.home_team_id;
      const at = g.away_team || g.awayTeam || g.awayTeamId || g.away_team_id;
      if (ht && at) { oppMap[String(ht)] = String(at); oppMap[String(at)] = String(ht); }
    }
  }

  const out: PlayerCtx[] = [];
  for (const d of base) {
    const teamId = d.team_id || d.teamId || d.team || '';
    const pos = (d.position || d.pos) as Position;
    const playerName = d.player_name || d.name || '';
    const playerId = d.player_id || d.$id;
    if (!teamId || !pos || !playerId) continue;
    // usage priors by team/pos
    const pri = usage?.[teamId]?.[pos]?.find((x: any) => (x.player_name || '').toLowerCase() === (playerName || '').toLowerCase());
    const usageRate = getUsageRate(pos, pri);
    if (usageRate < 0.001) continue;

    const ppg = pace?.[teamId]?.plays_per_game || eff?.[teamId]?.pace_est || 70;
    const offZ = eff?.[teamId]?.off_eff || 0;
    const oppId = week != null ? oppMap[teamId] : undefined;
    const grade = oppId ? (oppGrades?.[oppId]?.[pos + '_grade'] || 100) : 100;
    const injKey = Object.keys(ea).find((k) => k.includes(`|${teamId}|${pos}`) && k.toLowerCase().startsWith((playerName || '').toLowerCase()));
    const injRisk = injKey && ea[injKey]?.inj ? (1 - Number(ea[injKey].inj.norm || 0.5)) : 0.15;
    const draftScore = draft?.[`${playerName}|${teamId}|${pos}`]?.draft_capital_score || 0;
    const games = d.games_played_est || 12;
    out.push({ playerId, playerName, teamId, pos, usageRate, pace: ppg, offZ, oppGrade: grade, injuryRisk: clamp(0, 0.5, injRisk), draftScore, games });
  }
  return out;
}

function parseJSON<T = any>(x: any): T | undefined {
  if (x == null) return undefined;
  if (typeof x === 'string') { try { return JSON.parse(x) as T; } catch { return undefined; } }
  return x as T;
}

function getUsageRate(pos: Position, pri: any): number {
  if (!pri) return 0;
  if (pos === 'RB') return pri.rush_share ?? pri.snap_share ?? 0;
  if (pos === 'WR' || pos === 'TE') return pri.target_share ?? pri.snap_share ?? 0;
  return pri.snap_share ?? 1.0;
}

// ---------- Simulation ----------
function simulateWeekly(ctx: PlayerCtx, runs: number, rng: () => number) {
  const PR = 0.52; const RR = 1 - PR;
  const draftBoost = ctx.draftScore ? Math.min(1.05, 1 + 0.05 * ctx.draftScore) : 1.0;
  const oppScalar = clamp(0.8, 1.2, 0.9 + ((ctx.oppGrade || 100) - 100) / 100 * 0.2);
  const samples: number[] = [];
  const statlines: any[] = [];
  for (let i = 0; i < runs; i++) {
    // Injury/role shock
    let usage = ctx.usageRate;
    if (rng() < ctx.injuryRisk) usage *= (1 - sampleBeta(rng, 2, 5));
    // small spike chance
    if (rng() < 0.05) usage *= 1 + sampleBeta(rng, 2, 2) * 0.2;

    const plays = ctx.pace * (0.9 + rng() * 0.2); // ±10%
    const teamPoints = 28 + ctx.offZ * 3 + sampleNormal(rng, 0, 3);

    if (ctx.pos === 'QB') {
      const attMean = plays * PR;
      const att = samplePoisson(rng, attMean);
      const ypa = sampleLogNormal(rng, Math.log(7.5) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar * draftBoost;
      const yds = att * ypa;
      const td = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.5));
      const ints = samplePoisson(rng, att * 0.02);
      const rushAtt = samplePoisson(rng, plays * RR * 0.1);
      const ypc = sampleLogNormal(rng, Math.log(5.0) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar;
      const rYds = rushAtt * ypc;
      const rTD = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.1));
      const stat = { pass_yards: yds, pass_tds: td, ints, rush_yards: rYds, rush_tds: rTD, receptions: 0, rec_yards: 0, rec_tds: 0 };
      const pts = fp(stat);
      samples.push(pts);
      statlines.push(roundStat(stat));
      continue;
    }

    if (ctx.pos === 'RB') {
      const rushMean = plays * RR * usage;
      const rushRate = sampleGamma(rng, 5, rushMean / 5);
      const rushAtt = samplePoisson(rng, rushRate);
      const ypc = sampleLogNormal(rng, Math.log(4.8) - 0.5 * 0.2 * 0.2, 0.2) * oppScalar * draftBoost;
      const rYds = rushAtt * ypc;
      const targets = samplePoisson(rng, plays * PR * usage * 0.5);
      const catchP = sampleBeta(rng, 40, 22);
      const rec = binomial(rng, targets, catchP);
      const ypr = sampleLogNormal(rng, Math.log(7.5) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar;
      const recYds = rec * ypr;
      const td = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.35 * usage));
      const stat = { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: rYds, rush_tds: td, receptions: rec, rec_yards: recYds, rec_tds: samplePoisson(rng, td * 0.2) };
      const pts = fp(stat);
      samples.push(pts);
      statlines.push(roundStat(stat));
      continue;
    }

    // WR / TE
    const targetsMean = plays * PR * usage;
    const lam = sampleGamma(rng, 5, targetsMean / 5);
    const targets = samplePoisson(rng, lam);
    const catchP = sampleBeta(rng, 42, 22);
    const rec = binomial(rng, targets, catchP);
    const ypr = sampleLogNormal(rng, Math.log(12) - 0.5 * 0.25 * 0.25, 0.25) * oppScalar * draftBoost;
    const recYds = rec * ypr;
    const td = samplePoisson(rng, Math.max(0, teamPoints / 7 * 0.30 * usage));
    const stat = { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: 0, rush_tds: 0, receptions: rec, rec_yards: recYds, rec_tds: td };
    const pts = fp(stat);
    samples.push(pts);
    statlines.push(roundStat(stat));
  }
  return { samples, statlines };
}

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
  return pts;
}

function roundStat(s: any) {
  const o: any = {};
  for (const [k, v] of Object.entries(s)) o[k] = Math.round((v as number) * 10) / 10;
  return o;
}

function binomial(rng: () => number, n: number, p: number): number {
  if (n <= 0 || p <= 0) return 0;
  if (n > 50) {
    const mean = n * p; const sd = Math.sqrt(n * p * (1 - p));
    return Math.max(0, Math.round(sampleNormal(rng, mean, sd)));
  }
  let c = 0; for (let i = 0; i < n; i++) if (rng() < p) c++; return c;
}

function summarize(samples: number[]) {
  if (samples.length === 0) return { p10: 0, p20: 0, p25: 0, p50: 0, p75: 0, p80: 0, p90: 0, boomProb: 0, bustProb: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.005);
  const arr = sorted.slice(trim, sorted.length - trim);
  const q = (p: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor(p * (arr.length - 1))))];
  const p50 = q(0.5);
  const p80 = q(0.8);
  const p20 = q(0.2);
  const p10 = q(0.1);
  const p25 = q(0.25);
  const p75 = q(0.75);
  const p90 = q(0.9);
  const boomProb = samples.filter((x) => x >= 1.5 * p50).length / samples.length;
  const bustProb = samples.filter((x) => x <= 0.5 * p50).length / samples.length;
  return { p10, p20, p25, p50, p75, p80, p90, boomProb, bustProb };
}

async function writeWeekly(databases: Databases, dbId: string, playerId: string, season: number, week: number, summary: any, statlines: any, ctx: PlayerCtx) {
  // upsert in projections_weekly
  const res = await databases.listDocuments(dbId, 'projections_weekly', [Query.equal('player_id', playerId), Query.equal('season', season), Query.equal('week', week), Query.limit(1)]);
  const payload: any = {
    statline_median_json: JSON.stringify(statlines.median),
    statline_floor_json: JSON.stringify(statlines.floor),
    statline_ceiling_json: JSON.stringify(statlines.ceiling),
    boom_prob: Number(summary.boomProb.toFixed(3)),
    bust_prob: Number(summary.bustProb.toFixed(3)),
    defense_vs_pos_grade: Math.round(ctx.oppGrade || 100),
    injury_status: ctx.injuryRisk >= 0.25 ? 'Questionable' : 'Healthy',
    utilization_trend: '=',
    start_sit_color: summary.boomProb >= 0.3 && summary.bustProb <= 0.2 ? 'Green' : summary.bustProb >= 0.35 ? 'Red' : 'Yellow',
  };
  if (res.total > 0) await databases.updateDocument(dbId, 'projections_weekly', res.documents[0].$id as string, payload);
  else await databases.createDocument(dbId, 'projections_weekly', ID.unique(), { player_id: playerId, season, week, ...payload });
}

async function writeYearly(databases: Databases, dbId: string, playerId: string, season: number, summary: any) {
  const res = await databases.listDocuments(dbId, 'projections_yearly', [Query.equal('player_id', playerId), Query.equal('season', season), Query.limit(1)]);
  const payload: any = {
    range_floor: Number(summary.p20.toFixed(1)),
    range_median: Number(summary.p50.toFixed(1)),
    range_ceiling: Number(summary.p80.toFixed(1)),
    percentiles_json: JSON.stringify({ p10: summary.p10, p25: summary.p25, p50: summary.p50, p75: summary.p75, p90: summary.p90 }),
    volatility_score: Math.round(clamp(0, 100, 100 * ((summary.p80 - summary.p20) / Math.max(1, summary.p50))))
  };
  if (res.total > 0) await databases.updateDocument(dbId, 'projections_yearly', res.documents[0].$id as string, payload);
  else await databases.createDocument(dbId, 'projections_yearly', ID.unique(), { player_id: playerId, season, position: 'WR', ...payload });
}

async function computeReplacementValues(databases: Databases, dbId: string, season: number) {
  const res = await databases.listDocuments(dbId, 'projections_yearly', [Query.equal('season', season), Query.limit(10000)]);
  const byPos: Record<Position, number[]> = { QB: [], RB: [], WR: [], TE: [] } as any;
  for (const d of (res.documents as any[])) {
    const pos = (d.position || d.pos) as Position; if (!pos) continue;
    const med = Number(d.range_median ?? d.fantasy_points_simple ?? 0); if (!Number.isFinite(med)) continue;
    byPos[pos].push(med);
  }
  const cut: Record<Position, number> = { QB: 24, RB: 48, WR: 60, TE: 24 };
  const repl: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0 } as any;
  for (const pos of Object.keys(byPos) as Position[]) {
    const arr = byPos[pos].sort((a, b) => b - a);
    const idx = Math.min(arr.length - 1, (cut[pos] || 1) - 1);
    repl[pos] = arr.length ? arr[idx] || arr[arr.length - 1] : 0;
  }
  // write replacement_value for each
  for (const d of (res.documents as any[])) {
    const pos = (d.position || d.pos) as Position; if (!pos) continue;
    const med = Number(d.range_median ?? d.fantasy_points_simple ?? 0);
    const value = Number((med - (repl[pos] || 0)).toFixed(1));
    await databases.updateDocument(dbId, 'projections_yearly', d.$id as string, { replacement_value: value });
  }
}

async function main() {
  assertServerEnv();
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.startsWith('--') ? a.replace(/^--/, '').split('=') : []));
  const season = Number(args.season || new Date().getFullYear());
  const week = args.week != null ? Number(args.week) : undefined;
  const runs = Number(args.runs || 5000);
  const seed = Number(args.seed || 42);
  const playersFilter = args.players ? new Set(String(args.players).split(',').map((s) => s.trim())) : undefined;

  const rng = mulberry32(seed);
  const { databases, dbId } = getDatabases();

  const universe = await buildPlayerUniverse(databases, dbId, season, week, playersFilter);

  const weeklyResults: Array<{ playerId: string; summary: any; statlines: any; ctx: PlayerCtx }> = [];
  const yearlyResults: Array<{ playerId: string; summary: any }> = [];

  for (const ctx of universe) {
    const { samples, statlines } = simulateWeekly(ctx, runs, rng);
    const sum = summarize(samples);
    const statsSorted = [...statlines].sort((a, b) => fp(a) - fp(b));
    const mid = statsSorted[Math.floor(statsSorted.length / 2)];
    const flo = statsSorted[Math.floor(statsSorted.length * 0.2)];
    const cei = statsSorted[Math.floor(statsSorted.length * 0.8)];
    weeklyResults.push({ playerId: ctx.playerId, summary: sum, statlines: { median: mid, floor: flo, ceiling: cei }, ctx });

    if (week == null) {
      // Yearly: sum weekly draws for games
      const seasonSamples = new Array<number>(runs);
      for (let i = 0; i < runs; i++) seasonSamples[i] = samples[i] * ctx.games;
      const yr = summarize(seasonSamples);
      // rename fields to pXX keys
      yearlyResults.push({ playerId: ctx.playerId, summary: { p10: yr.p10, p20: yr.p20, p25: yr.p25, p50: yr.p50, p75: yr.p75, p80: yr.p80, p90: yr.p90 } });
    }
  }

  if (week != null) {
    for (const r of weeklyResults) await writeWeekly(databases, dbId, r.playerId, season, week, r.summary, r.statlines, r.ctx);
    // rank_pro by median descending within position
    const weeklyDocs = await databases.listDocuments(dbId, 'projections_weekly', [Query.equal('season', season), Query.equal('week', week), Query.limit(10000)]);
    const byPos: Record<Position, any[]> = { QB: [], RB: [], WR: [], TE: [] } as any;
    for (const d of (weeklyDocs.documents as any[])) {
      const pos = (d.position || d.pos) as Position; if (!pos) continue;
      const median = d.statline_median_json ? fp(JSON.parse(d.statline_median_json)) : 0;
      byPos[pos].push({ id: d.$id, median });
    }
    for (const pos of Object.keys(byPos) as Position[]) {
      byPos[pos].sort((a, b) => b.median - a.median);
      for (let i = 0; i < byPos[pos].length; i++) await databases.updateDocument(dbId, 'projections_weekly', byPos[pos][i].id, { rank_pro: i + 1 });
    }
  } else {
    for (const r of yearlyResults) await writeYearly(databases, dbId, r.playerId, season, r.summary);
    await computeReplacementValues(databases, dbId, season);
  }
}

const entry = process.argv[1] || '';
if (entry.includes('project-pro-distributions')) {
  main().catch((e) => { console.error('❌ project-pro-distributions failed', e); process.exit(1); });
}


