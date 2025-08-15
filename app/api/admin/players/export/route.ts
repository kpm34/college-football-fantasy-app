import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Format = 'csv' | 'json';

function csvEscape(value: any): string {
  const s = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(rows: any[]): string {
  const headers = ['id','name','position','team','conference','season','cfbd_id','rating','draftable','power_4'];
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(',')),
  ].join('\n');
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Allow CRON secret or admin session
  const headerSecret = request.headers.get('x-cron-secret') || request.headers.get('X-Cron-Secret');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && headerSecret === cronSecret) return true;

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
  return (me.email || '').toLowerCase() === adminEmail;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const season = Number(searchParams.get('season') || new Date().getFullYear());
    const format = (searchParams.get('format') || 'csv').toLowerCase() as Format;

    const rows: any[] = [];
    let offset = 0; const pageSize = 200;
    while (true) {
      const page = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [Query.equal('season', season), Query.limit(pageSize), Query.offset(offset)]
      );
      const docs: any[] = page.documents || [];
      if (docs.length === 0) break;
      for (const d of docs) {
        rows.push({
          id: d.$id,
          name: d.name || `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim(),
          position: d.position,
          team: d.team,
          conference: d.conference,
          season: Number(d.season),
          cfbd_id: d.cfbd_id,
          rating: Number(d.rating ?? d.ea_rating ?? 0) || undefined,
          draftable: Boolean(d.draftable),
          power_4: Boolean(d.power_4),
        });
      }
      offset += docs.length;
      if (offset >= page.total) break;
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify({ season, count: rows.length, players: rows }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="college_players_${season}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('export players error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


