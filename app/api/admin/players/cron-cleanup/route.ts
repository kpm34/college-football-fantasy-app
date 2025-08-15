import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Position = 'QB'|'RB'|'WR'|'TE'|'K';
const POWER_4 = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
const FANTASY_POS: Position[] = ['QB','RB','WR','TE','K'];

function cleanName(name: string): string {
  return (name || '')
    .replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '')
    .replace(/[^A-Za-z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function fetchCFBD(endpoint: string, params: Record<string, any>) {
  const apiKey = process.env.CFBD_API_KEY || process.env.NEXT_PUBLIC_CFBD_API_KEY;
  const base = 'https://api.collegefootballdata.com';
  const url = new URL(`${base}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, String(v)); });
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`CFBD ${endpoint} ${res.status}`);
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    // Auth: allow either CRON_SECRET or current admin session
    let isAuthorized = false;
    const headerSecret = request.headers.get('x-cron-secret') || request.headers.get('X-Cron-Secret');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && headerSecret === cronSecret) {
      isAuthorized = true;
    } else {
      // Try session-based admin check
      const sessionCookie = request.cookies.get('appwrite-session')?.value;
      if (sessionCookie) {
        const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
        const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
          headers: {
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
            'X-Appwrite-Response-Format': '1.4.0',
            Cookie: cookieHeader,
          },
          cache: 'no-store',
        });
        if (meRes.ok) {
          const me = await meRes.json();
          const adminEmail = (process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com').toLowerCase();
          if ((me.email || '').toLowerCase() === adminEmail) isAuthorized = true;
        }
      }
    }
    if (!isAuthorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const season: number = Number(body?.season) || new Date().getFullYear();
    const apply: boolean = body?.apply !== false; // default apply=true

    // Build roster index from CFBD
    const namePosToTeam = new Map<string, string>();
    for (const conference of POWER_4) {
      const roster = await fetchCFBD('/roster', { year: season, conference });
      for (const p of roster) {
        const pos = String(p.position || '').toUpperCase();
        if (!FANTASY_POS.includes(pos as Position)) continue;
        const key = `${cleanName(`${p.first_name || ''} ${p.last_name || ''}`)}|${pos}`;
        if (!namePosToTeam.has(key)) namePosToTeam.set(key, p.team);
      }
    }

    // Scan players and prepare updates/deletes
    const dedupe = new Map<string, any>();
    const duplicates: any[] = [];
    const updates: Array<{ id: string; data: any }> = [];
    let scanned = 0; let offset = 0; const pageSize = 200;
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
        const pos = String(doc.position || '').toUpperCase();
        if (!FANTASY_POS.includes(pos as Position)) continue;
        const key = `${cleanName(doc.name || `${doc.first_name || ''} ${doc.last_name || ''}`)}|${pos}`;
        const cfbdTeam = namePosToTeam.get(key);

        const patch: any = {};
        if (cfbdTeam) {
          if (doc.team !== cfbdTeam) patch.team = cfbdTeam;
          if (doc.draftable !== true) patch.draftable = true;
          if (doc.power_4 !== true) patch.power_4 = true;
        } else {
          if (doc.draftable !== false) patch.draftable = false;
        }
        if (Object.keys(patch).length) updates.push({ id: doc.$id, data: patch });

        // dedupe by name|team|pos
        const dkey = `${cleanName(doc.name)}|${cleanName(doc.team)}|${pos}`;
        const ex = dedupe.get(dkey);
        if (!ex) dedupe.set(dkey, doc);
        else {
          const ra = Number(ex.rating ?? ex.ea_rating ?? 0);
          const rb = Number(doc.rating ?? doc.ea_rating ?? 0);
          if (rb > ra) { duplicates.push(ex); dedupe.set(dkey, doc); } else { duplicates.push(doc); }
        }
      }
      offset += docs.length;
      if (offset >= page.total) break;
    }

    let updated = 0, deleted = 0;
    if (apply) {
      for (const u of updates) {
        try { await databases.updateDocument(DATABASE_ID, COLLECTIONS.PLAYERS || 'college_players', u.id, u.data); updated++; } catch {}
      }
      for (const d of duplicates) {
        try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PLAYERS || 'college_players', d.$id); deleted++; } catch {}
      }
    }

    return NextResponse.json({ success: true, season, scanned, proposedUpdates: updates.length, duplicates: duplicates.length, appliedUpdates: updated, deletedDuplicates: deleted });
  } catch (error: any) {
    console.error('cron-cleanup error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


