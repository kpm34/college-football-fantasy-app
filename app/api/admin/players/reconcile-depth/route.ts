import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Position = 'QB'|'RB'|'WR'|'TE'|'K';

function cleanName(name: string): string {
  return name.replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function readTeamsMap(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), 'data/teams_map.json');
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
  } catch { return {}; }
}

function invert(obj: Record<string, string>): Record<string, string> {
  const inv: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) inv[v] = k;
  return inv;
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth via session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });
    if (!meRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const me = await meRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((me.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const season = Number(body?.season) || new Date().getFullYear();
    const apply: boolean = Boolean(body?.apply);
    const positions: Position[] = ['QB','RB','WR','TE','K'];

    // Load model_inputs.depth_chart_json
    const mi = await databases.listDocuments(
      DATABASE_ID,
      (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs',
      [Query.equal('season', season), Query.limit(1)]
    );
    const mDoc: any = mi.documents?.[0];
    if (!mDoc) return NextResponse.json({ error: 'model_inputs not found for season' }, { status: 404 });
    let depthChart: any = mDoc.depth_chart_json;
    try { if (typeof depthChart === 'string') depthChart = JSON.parse(depthChart); } catch {}
    if (!depthChart || typeof depthChart !== 'object') {
      return NextResponse.json({ error: 'depth_chart_json missing or invalid' }, { status: 400 });
    }

    // Build reverse index: name+pos -> team_id
    const nameIndex = new Map<string, { teamId: string; pos: Position }>();
    for (const [teamId, posMap] of Object.entries(depthChart)) {
      for (const posKey of Object.keys(posMap as any)) {
        if (!positions.includes(posKey as Position)) continue;
        const arr: Array<any> = (posMap as any)[posKey] || [];
        for (const entry of arr) {
          const key = `${cleanName(entry.player_name)}|${posKey}`;
          nameIndex.set(key, { teamId: teamId, pos: posKey as Position });
        }
      }
    }

    const teamsMap = readTeamsMap();
    const idToTeamName = invert(teamsMap);

    // Scan players in batches and reconcile
    const updates: Array<{ id: string; fromTeam: string; toTeam: string }> = [];
    const notFound: Array<{ name: string; pos: string }> = [];
    const ambiguous: Array<{ name: string; pos: string }> = [];
    let offset = 0; const pageSize = 200; let scanned = 0;
    while (true) {
      const page = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [Query.equal('season', season), Query.limit(pageSize), Query.offset(offset)]
      );
      const docs: any[] = page.documents || [];
      if (docs.length === 0) break;
      for (const doc of docs) {
        scanned++;
        const pos = (doc.position || '').toUpperCase();
        if (!positions.includes(pos as Position)) continue;
        const key = `${cleanName(doc.name || `${doc.first_name || ''} ${doc.last_name || ''}`)}|${pos}`;
        const match = nameIndex.get(key);
        if (!match) {
          notFound.push({ name: doc.name, pos });
          continue;
        }
        const expectedTeam = idToTeamName[match.teamId] || doc.team;
        if (expectedTeam && doc.team !== expectedTeam) {
          updates.push({ id: doc.$id, fromTeam: doc.team, toTeam: expectedTeam });
          if (apply) {
            try {
              await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PLAYERS || 'college_players',
                doc.$id,
                { team: expectedTeam, power_4: true, draftable: true }
              );
            } catch {}
          }
        }
      }
      offset += docs.length;
      if (offset >= page.total) break;
    }

    return NextResponse.json({
      success: true,
      season,
      scanned,
      proposedUpdates: updates.length,
      applied: apply ? updates.length : 0,
      updates,
      notFound: notFound.slice(0, 50),
      ambiguous: ambiguous.slice(0, 20)
    });
  } catch (error: any) {
    console.error('Reconcile-depth error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


