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

    // Determine commissioner (new canonical + fallbacks)
    const commishId = (league as any).commissionerAuthUserId || (league as any).commissioner || (league as any).ownerClientId;
    const isCommissioner = Boolean(commishId && commishId === user.$id);

    // Load team from ROSTERS (TEAMS collection deprecated)
    let team = null;
    try {
      const teamQuery = [
        AwQuery.equal('leagueId', leagueId),
        AwQuery.or([
          AwQuery.equal('ownerAuthUserId', user.$id),
          AwQuery.equal('ownerClientId', user.$id),
          AwQuery.equal('authUserId', user.$id),
          AwQuery.equal('teammanager_id', user.$id)
        ]),
        AwQuery.limit(1)
      ];
      const rostersRes = await serverDb.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, teamQuery);
      team = rostersRes.documents[0] || null;
    } catch (error: any) {
      console.error('Error loading roster:', error);
      // If leagueId doesn't exist in rosters, try without it
      try {
        const userQuery = [AwQuery.or([
          AwQuery.equal('ownerAuthUserId', user.$id),
          AwQuery.equal('ownerClientId', user.$id),
          AwQuery.equal('authUserId', user.$id),
          AwQuery.equal('teammanager_id', user.$id)
        ])];
        const allRosters = await serverDb.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, userQuery);
        // Filter by leagueId manually
        team = allRosters.documents.find((r: any) => (r.leagueId || r.leagueId) === leagueId) || null;
      } catch (fallbackError) {
        console.error('Fallback roster query failed:', fallbackError);
      }
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
      success: true,
      league,
      team,
      players,
      isCommissioner,
    });
  } catch (error: any) {
    return NextRes.json(
      { error: 'Failed to load locker room', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// Note: legacy duplicate implementation removed to avoid double declaration during Sentry wrapping
