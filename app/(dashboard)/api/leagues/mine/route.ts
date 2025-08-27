import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Get user's leagues with simplified format for Navbar
 * This endpoint is specifically for the sidebar navigation
 */
export async function GET(request: NextRequest) {
  try {
    let sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      const native = request.cookies.get('a_session_college-football-fantasy-app')?.value;
      if (native) sessionCookie = native;
    }

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user info
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await userResponse.json();
    console.log('[/api/leagues/mine] User authenticated:', user.$id, user.email);

    // Get user's rosters to find their leagues (canonical ownerAuthUserId)
    console.log('[/api/leagues/mine] Querying fantasy_teams with ownerAuthUserId:', user.$id);
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [
        Query.equal('ownerAuthUserId', user.$id),
        Query.limit(100)
      ]
    );

    // Also consider league_memberships as a fallback/source of truth (auth_user_id standard)
    let membershipsResponse: any = { documents: [] };
    try {
      membershipsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUE_MEMBERSHIPS,
        [
          Query.equal('authUserId', user.$id),
          Query.limit(100)
        ]
      );
    } catch {}

    // Union league ids from rosters and memberships
    const leagueIdSet = new Set<string>();
    for (const r of rostersResponse.documents || []) if (r?.leagueId) leagueIdSet.add(String(r.leagueId));
    for (const m of membershipsResponse.documents || []) if (m?.leagueId) leagueIdSet.add(String(m.leagueId));
    const leagueIds = Array.from(leagueIdSet);

    if (leagueIds.length === 0) {
      console.log('[/api/leagues/mine] No leagues found for user via rosters or memberships');
      return NextResponse.json({ leagues: [], teams: [] });
    }
    // Fetch leagues by IDs. Some Appwrite versions are strict about $id equality values.
    // Use robust fallback to per-id getDocument when listDocuments fails.
    let leaguesResponse: any;
    try {
      if (leagueIds.length === 1) {
        const doc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          leagueIds[0]
        );
        leaguesResponse = { documents: [doc] };
      } else {
        leaguesResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          [
            Query.equal('$id', leagueIds as string[]),
            Query.limit(50)
          ]
        );
      }
    } catch (err) {
      // Fallback: fetch each league individually
      const docs = await Promise.all(
        leagueIds.map(async (id: string) => {
          try { return await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, id); }
          catch { return null; }
        })
      );
      leaguesResponse = { documents: docs.filter(Boolean) };
    }

    // Format leagues for UI consumption (sidebar + dashboard)
    const leagues = leaguesResponse.documents.map((league: any) => {
      const userRoster = rostersResponse.documents.find((r: any) => r.leagueId === league.$id);
      const commishId = (league as any).commissionerAuthUserId || (league as any).commissioner;
      const isCommissioner = commishId === user.$id;

      return {
        $id: league.$id,
        id: league.$id,
        name: league.leagueName,
        status: league.status || 'active',
        isCommissioner,
        teamName: userRoster?.name || userRoster?.teamName || 'My Team',
        commissioner: commishId,
        maxTeams: league.maxTeams ?? 0,
        currentTeams: league.currentTeams ?? (league.members?.length ?? undefined),
        draftDate: league.draftDate
      };
    });

    // Also provide teams (roster-backed entries only) to support dashboard expectations
    const teams = rostersResponse.documents.map((r: any) => ({
      $id: r.$id,
      leagueId: r.leagueId || r.leagueId,
      name: r.name || r.teamName || 'Team',
      wins: r.wins ?? 0,
      losses: r.losses ?? 0,
      pointsFor: r.pointsFor ?? r.points ?? 0,
    }));

    return NextResponse.json({ leagues, teams });

  } catch (error: any) {
    console.error('Error fetching user leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues', details: error.message },
      { status: 500 }
    );
  }
}