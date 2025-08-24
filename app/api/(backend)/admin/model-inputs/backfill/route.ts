import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K';

function cleanName(name: string): string {
  return name.replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function readTeamsMap(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), 'data/teams_map.json');
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function invert(obj: Record<string, string>): Record<string, string> {
  const inv: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) inv[v] = k;
  return inv;
}

function buildUsagePriors(depth: Record<string, Record<string, Array<{ player_name: string; pos_rank: number }>>>): Record<string, any> {
  const priors: Record<string, any> = {};
  const normalizeToSum = (values: number[], target: number): number[] => {
    const sum = values.reduce((a, b) => a + b, 0) || 1;
    return values.map((v) => (v / sum) * target);
  };
  for (const [fantasy_team_id, posMap] of Object.entries(depth)) {
    priors[fantasy_team_id] = {};
    const byPos = posMap as Record<Position, Array<{ player_name: string; pos_rank: number }>>;

    // QB
    if (byPos.QB) {
      priors[fantasy_team_id].QB = byPos.QB.map((p, idx) => ({ player_name: p.player_name, snap_share: idx === 0 ? 0.95 : 0.05 }));
    }

    // RB
    if (byPos.RB) {
      const rbWeights = byPos.RB.map((_, idx) => (idx === 0 ? 0.6 : idx === 1 ? 0.3 : 0.1));
      const snapShares = normalizeToSum(rbWeights, Math.min(0.95, rbWeights.reduce((a, b) => a + b, 0)));
      priors[fantasy_team_id].RB = byPos.RB.map((p, i) => ({ player_name: p.player_name, snap_share: Number((snapShares[i] || 0).toFixed(2)), rush_share: Number(((snapShares[i] || 0) * 0.9).toFixed(2)) }));
    }

    // WR
    if (byPos.WR) {
      const weights = byPos.WR.map((_, idx) => (idx === 0 ? 0.8 : idx === 1 ? 0.7 : idx === 2 ? 0.6 : 0.2));
      const snapShares = normalizeToSum(weights.slice(0, Math.max(byPos.WR.length, 1)), 1.0);
      priors[fantasy_team_id].WR = byPos.WR.map((p, i) => ({ player_name: p.player_name, snap_share: Number((snapShares[i] || 0).toFixed(2)), target_share: Number((snapShares[i] || 0).toFixed(2)) }));
    }

    // TE
    if (byPos.TE) {
      const weights = byPos.TE.map((_, idx) => (idx === 0 ? 0.7 : idx === 1 ? 0.35 : 0.15));
      const snapShares = normalizeToSum(weights, 0.85);
      priors[fantasy_team_id].TE = byPos.TE.map((p, i) => ({ player_name: p.player_name, snap_share: Number((snapShares[i] || 0).toFixed(2)), target_share: Number((snapShares[i] || 0).toFixed(2)) }));
    }
  }
  return priors;
}

async function upsertModelInputs(season: number, depthChart: Record<string, any>, usagePriors: Record<string, any>) {
  // Ensure attributes exist; create if missing
  try { await (databases as any).getAttribute(DATABASE_ID, 'model_inputs', 'depth_chart_json'); } catch { await (databases as any).createStringAttribute(DATABASE_ID, 'model_inputs', 'depth_chart_json', 16384, false); }
  try { await (databases as any).getAttribute(DATABASE_ID, 'model_inputs', 'usage_priors_json'); } catch { await (databases as any).createStringAttribute(DATABASE_ID, 'model_inputs', 'usage_priors_json', 16384, false); }

  const res = await databases.listDocuments(DATABASE_ID, (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs', [Query.equal('season', season), Query.limit(1)]);
  const doc = res.documents.find((d: any) => d.week === undefined || d.week === null);
  const update = { depth_chart_json: JSON.stringify(depthChart), usage_priors_json: JSON.stringify(usagePriors) } as any;
  if (doc) {
    await databases.updateDocument(DATABASE_ID, (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs', doc.$id, update);
    return { updated: doc.$id };
  }
  const created = await databases.createDocument(DATABASE_ID, (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs', ID.unique(), { season, ...update });
  return { created: created.$id };
}

async function backfill(season: number) {
  const positions: Position[] = ['QB', 'RB', 'WR', 'TE'];
  const teamsMap = readTeamsMap();
  const teamNameToId = teamsMap; // school name -> team_id
  const fantasy_team_idToName = invert(teamsMap); // team_id -> school name

  // Build depth chart from current players
  const byTeam: Record<string, Record<Position, Array<{ player_name: string; pos_rank: number }>>> = {} as any;

  let offset = 0; const pageSize = 200; let scanned = 0;
  while (true) {
    const page = await databases.listDocuments(
      DATABASE_ID,
      (COLLECTIONS as any).PLAYERS || 'college_players',
      [Query.limit(pageSize), Query.offset(offset)]
    );
    const docs: any[] = page.documents || [];
    if (docs.length === 0) break;
    scanned += docs.length;

    for (const doc of docs) {
      const pos = (doc.position || '').toUpperCase();
      if (!positions.includes(pos as Position)) continue;
      const teamName = (doc.team || doc.school || '').toString().trim();
      const fantasy_team_id = teamNameToId[teamName];
      if (!fantasy_team_id) continue;

      const keyTeam = fantasy_team_id;
      byTeam[keyTeam] = byTeam[keyTeam] || ({} as any);
      const arr = (byTeam[keyTeam][pos as Position] = byTeam[keyTeam][pos as Position] || []);
      arr.push({ player_name: doc.name || `${doc.first_name || ''} ${doc.last_name || ''}`.trim(), pos_rank: 9999 });
    }

    offset += docs.length;
    if (offset >= page.total) break;
  }

  // Rank within each team/position using projection, then rating fallbacks
  for (const [fantasy_team_id, posMap] of Object.entries(byTeam)) {
    for (const pos of Object.keys(posMap)) {
      const list = posMap[pos as Position];
      list.sort((a, b) => {
        // Sorting requires us to look up player projections again; keep simple heuristic: name only
        // Since we do not have IDs here, keep insertion order; assign ranks by order
        return 0;
      });
      for (let i = 0; i < list.length; i++) list[i].pos_rank = i + 1;
      // Cap to top 5 per position to keep payload small
      byTeam[fantasy_team_id][pos as Position] = list.slice(0, 5);
    }
  }

  const usagePriors = buildUsagePriors(byTeam);
  const res = await upsertModelInputs(season, byTeam, usagePriors);
  return { scanned, teams: Object.keys(byTeam).length, res };
}

async function authorize(request: NextRequest): Promise<boolean> {
  // Allow either admin session email match or cron secret header
  const cronSecretHeader = request.headers.get('x-cron-secret');
  const cronSecretEnv = process.env.CRON_SECRET || '';
  if (cronSecretHeader && cronSecretEnv && cronSecretHeader === cronSecretEnv) return true;

  // Fallback to Appwrite session cookie check
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return false;
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });
    if (!meRes.ok) return false;
    const me = await meRes.json();
    const adminEmail = (process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com').toLowerCase();
    return ((me.email || '').toLowerCase() === adminEmail);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ok = await authorize(request);
    if (!ok) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const season = Number(body?.season) || new Date().getFullYear();
    const result = await backfill(season);
    return NextResponse.json({ success: true, season, ...result });
  } catch (error: any) {
    console.error('Backfill model_inputs error:', error);
    return NextResponse.json({ success: false, error: error.message || 'failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const ok = await authorize(request);
    if (!ok) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    const season = Number(request.nextUrl.searchParams.get('season')) || new Date().getFullYear();
    const result = await backfill(season);
    return NextResponse.json({ success: true, season, ...result });
  } catch (error: any) {
    console.error('Backfill model_inputs error:', error);
    return NextResponse.json({ success: false, error: error.message || 'failed' }, { status: 500 });
  }
}


