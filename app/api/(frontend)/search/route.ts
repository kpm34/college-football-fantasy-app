import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'players';
  const limit = parseInt(searchParams.get('limit') || '8', 10);

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const start = Date.now();
  try {
    let results: any[] = [];
    if (type === 'players') {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [Query.search('name', q), Query.limit(limit)]
      );
      results = res.documents.map((d: any) => ({ id: d.$id, name: d.name, team: d.team, position: d.position }));
    } else if (type === 'leagues') {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        [
          Query.search('leagueName', q),
          Query.limit(limit)
        ]
      );
      results = res.documents.map((d: any) => ({ id: d.$id, name: d.leagueName, teams: d.currentTeams ?? 0 }));
    }

    const ms = Date.now() - start;
    return NextResponse.json({ suggestions: results, ms });
  } catch (error) {
    return NextResponse.json({ suggestions: [], error: 'search_failed' }, { status: 500 });
  }
}

