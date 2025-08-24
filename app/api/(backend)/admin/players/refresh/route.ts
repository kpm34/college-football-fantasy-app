import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CFBD_API_KEY = process.env.CFBD_API_KEY || process.env.NEXT_PUBLIC_CFBD_API_KEY;
const CFBD_BASE_URL = 'https://api.collegefootballdata.com';
const POWER_4 = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
const FANTASY_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];

function getYearString(year?: number): string {
  switch (year) {
    case 1: return 'FR';
    case 2: return 'SO';
    case 3: return 'JR';
    case 4: return 'SR';
    default: return 'FR';
  }
}

async function fetchCFBD(endpoint: string, params: Record<string, any>) {
  const url = new URL(`${CFBD_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
  });
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${CFBD_API_KEY}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`CFBD ${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth via current session + allowlist email
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
    });
    if (!meRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const me = await meRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((me.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!CFBD_API_KEY) {
      return NextResponse.json({ error: 'CFBD_API_KEY missing' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const season = Number(body?.season) || new Date().getFullYear();

    // Upsert latest rosters for Power 4
    const seenIds = new Set<string>();
    let created = 0, updated = 0, errors = 0;

    for (const conference of POWER_4) {
      const roster = await fetchCFBD('/roster', { year: season, conference });
      for (const p of roster) {
        try {
          if (!FANTASY_POSITIONS.includes(p.position)) continue;
          const cfbdId = String(p.id);
          seenIds.add(cfbdId);

          let existing;
          try {
            existing = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.PLAYERS || 'college_players',
              [Query.equal('cfbd_id', cfbdId), Query.limit(1)]
            );
          } catch {
            // If index missing, fallback to name+team+pos (best effort)
            const guess = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.PLAYERS || 'college_players',
              [Query.limit(100)]
            );
            existing = { documents: (guess.documents || []).filter((doc: any) =>
              (doc.name || '').toLowerCase() === `${(p.first_name || '').toLowerCase()} ${(p.last_name || '').toLowerCase()}`.trim() &&
              (doc.team || '').toLowerCase() === (p.team || '').toLowerCase() &&
              (doc.position || '') === p.position
            ) } as any;
          }

          const playerData = {
            cfbd_id: cfbdId,
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            position: p.position,
            team: p.team,
            conference,
            jersey: p.jersey ? String(p.jersey) : '',
            height: p.height ? `${Math.floor(p.height / 12)}-${p.height % 12}` : '',
            weight: p.weight ? String(p.weight) : '',
            year: getYearString(p.year),
            season,
            draftable: true,
            power_4: true,
          } as any;

          if (existing.documents && existing.documents.length > 0) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYERS || 'college_players',
              existing.documents[0].$id,
              playerData
            );
            updated++;
          } else {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYERS || 'college_players',
              ID.unique(),
              playerData
            );
            created++;
          }
        } catch (e) {
          errors++;
        }
      }
    }

    // Mark non-current or missing as not draftable (batch scan)
    let offset = 0;
    const pageSize = 100;
    let scanned = 0;
    while (true) {
      const page = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [Query.limit(pageSize), Query.offset(offset)]
      );
      const docs = page.documents || [];
      if (docs.length === 0) break;
      for (const doc of docs) {
        scanned++;
        const cfbdId = String(doc.cfbd_id || '');
        const isCurrentSeason = Number(doc.season) === season;
        if (!cfbdId || !seenIds.has(cfbdId) || !isCurrentSeason) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYERS || 'college_players',
              doc.$id,
              { draftable: false, season }
            );
          } catch {}
        }
      }
      offset += docs.length;
      if (offset >= page.total) break;
    }

    return NextResponse.json({ success: true, season, created, updated, errors, markedNotDraftable: scanned - seenIds.size, totalSeen: seenIds.size });
  } catch (error: any) {
    console.error('Admin players refresh error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


