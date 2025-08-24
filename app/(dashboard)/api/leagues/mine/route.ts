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

    // Get user's rosters to find their leagues (fantasy_teams uses owner_client_id)
    console.log('[/api/leagues/mine] Querying fantasy_teams with owner_client_id:', user.$id);
    console.log('[/api/leagues/mine] Collection name:', COLLECTIONS.FANTASY_TEAMS);
    
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [
        Query.equal('owner_client_id', user.$id),
        Query.limit(50)
      ]
    );

    console.log('[/api/leagues/mine] Found rosters:', rostersResponse.documents.length);
    
    if (rostersResponse.documents.length === 0) {
      console.log('[/api/leagues/mine] No rosters found for user');
      return NextResponse.json({ leagues: [] });
    }

    // Get league details for each roster (schema uses league_id)
    const leagueIds = rostersResponse.documents.map((roster: any) => roster.league_id).filter(Boolean);
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
      const userRoster = rostersResponse.documents.find((r: any) => (r.league_id || r.leagueId) === league.$id);
      const isCommissioner = league.commissioner === user.$id;

      return {
        $id: league.$id,
        id: league.$id,
        name: league.name,
        status: league.status || 'active',
        isCommissioner,
        teamName: userRoster?.name || userRoster?.teamName || 'My Team',
        commissioner: league.commissioner,
        maxTeams: league.maxTeams ?? 0,
        currentTeams: league.currentTeams ?? (league.members?.length ?? undefined),
        draftDate: league.draftDate
      };
    });

    // Also provide teams to support dashboard expectations
    const teams = rostersResponse.documents.map((r: any) => ({
      $id: r.$id,
      leagueId: r.league_id || r.leagueId,
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