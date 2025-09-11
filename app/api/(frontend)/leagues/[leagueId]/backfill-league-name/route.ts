import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';

// POST: Backfill fantasy_teams.leagueName for a specific league
export async function POST(req: NextRequest, { params }: { params: Promise<{ leagueId: string }> }) {
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { leagueId } = await params;
  if (!leagueId) {
    return NextResponse.json({ error: 'leagueId required' }, { status: 400 });
  }

  try {
    // Load league to get canonical name
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId);
    const leagueName: string = (league as any).leagueName || (league as any).name || '';

    // Fetch all fantasy teams for this league (limit 200 per call)
    let updated = 0;
    let offset = 0;
    const pageSize = 200;
    // Appwrite supports offset; paginate until fewer than pageSize docs returned
    while (true) {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FANTASY_TEAMS,
        [Query.equal('leagueId', leagueId), Query.limit(pageSize), Query.offset(offset)]
      );

      for (const doc of res.documents as any[]) {
        if (doc.leagueName !== leagueName) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.FANTASY_TEAMS,
              doc.$id,
              { leagueName } as any
            );
            updated++;
          } catch {}
        }
      }

      if (res.documents.length < pageSize) break;
      offset += pageSize;
    }

    return NextResponse.json({ success: true, leagueId, leagueName, updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Backfill failed' }, { status: 500 });
  }
}


