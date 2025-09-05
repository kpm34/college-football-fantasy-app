import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';

// Admin-only recount endpoint: Authorization: Bearer <CRON_SECRET>
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leagueId } = await request.json();
    if (!leagueId) return NextResponse.json({ error: 'leagueId required' }, { status: 400 });

    const rosterCountPage = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(1)]
    );
    const total = (rosterCountPage as any).total ?? (rosterCountPage.documents?.length || 0);
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId);
    const maxTeams = (league as any).maxTeams ?? 12;
    const payload: any = { currentTeams: total };
    try {
      payload.leagueStatus = total >= maxTeams ? 'closed' : 'open';
    } catch {}
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId, payload);
    return NextResponse.json({ success: true, leagueId, currentTeams: total, leagueStatus: payload.leagueStatus || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Recount failed' }, { status: 500 });
  }
}


