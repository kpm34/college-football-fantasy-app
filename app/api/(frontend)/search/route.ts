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
      let docs: any[] = [];
      // Try fulltext on canonical attribute first
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          [Query.search('leagueName', q), Query.limit(limit)]
        );
        docs = res.documents || [];
      } catch {}

      // Fallback: try legacy 'name' attribute
      if (docs.length === 0) {
        try {
          const res2 = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LEAGUES,
            [Query.search('name', q), Query.limit(limit)]
          );
          docs = res2.documents || [];
        } catch {}
      }

      // Last resort: fetch a page and filter in-memory (works without fulltext index)
      if (docs.length === 0) {
        try {
          const res3 = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LEAGUES,
            [Query.limit(100)]
          );
          const ql = q.toLowerCase();
          docs = (res3.documents || []).filter((d: any) =>
            String(d.leagueName || d.name || '').toLowerCase().includes(ql)
          ).slice(0, limit);
        } catch {}
      }

      results = docs.map((d: any) => ({ id: d.$id, name: d.leagueName || d.name, teams: d.currentTeams ?? (d.members?.length ?? 0) }));
    }

    const ms = Date.now() - start;
    return NextResponse.json({ suggestions: results, ms });
  } catch (error) {
    return NextResponse.json({ suggestions: [], error: 'search_failed' }, { status: 500 });
  }
}

