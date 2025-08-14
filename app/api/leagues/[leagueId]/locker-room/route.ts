import { NextRequest, NextResponse as NextRes } from 'next/server';
import { serverDatabases as serverDb, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query as AwQuery } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;
    if (!leagueId) {
      return NextRes.json({ error: 'leagueId required' }, { status: 400 });
    }

    // Resolve current user from session cookie
    const sessionId = request.cookies.get('appwrite-session')?.value;
    const cookieHeader = sessionId ? `a_session_college-football-fantasy-app=${sessionId}` : '';

    let user: any = null;
    if (sessionId) {
      const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
      });
      if (!userRes.ok) return NextRes.json({ error: 'Not authenticated' }, { status: 401 });
      user = await userRes.json();
    } else {
      return NextRes.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Load league (admin client)
    const league = await serverDb.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Determine commissioner
    const isCommissioner = Boolean(league?.commissionerId && league.commissionerId === user.$id);

    // Load team from TEAMS first, fallback to ROSTERS
    const teamQuery = [AwQuery.equal('leagueId', leagueId), AwQuery.equal('userId', user.$id), AwQuery.limit(1)];
    const teamsRes = await serverDb.listDocuments(DATABASE_ID, COLLECTIONS.TEAMS, teamQuery);
    let team = teamsRes.documents[0] || null;

    if (!team) {
      const rostersRes = await serverDb.listDocuments(DATABASE_ID, COLLECTIONS.ROSTERS, teamQuery);
      team = rostersRes.documents[0] || null;
    }

    // Load players if roster has players field
    let players: any[] = [];
    if (team && (team as any).players) {
      try {
        const playerIds: string[] = JSON.parse((team as any).players);
        if (Array.isArray(playerIds) && playerIds.length > 0) {
          const playersRes = await serverDb.listDocuments(
                      DATABASE_ID,
          COLLECTIONS.PLAYERS,
          [AwQuery.equal('$id', playerIds)]
          );
          players = playersRes.documents;
        }
      } catch {}
    }

    return NextRes.json({
      league,
      isCommissioner,
      team,
      players,
    });
  } catch (error: any) {
    return NextRes.json(
      { error: 'Failed to load locker room', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// Note: legacy duplicate implementation removed to avoid double declaration during Sentry wrapping
