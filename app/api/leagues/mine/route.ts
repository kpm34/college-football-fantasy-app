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

    // Get league details for each roster
    const leagueIds = rostersResponse.documents.map(roster => roster.leagueId);
    const leaguesResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [
        Query.equal('$id', leagueIds),
        Query.limit(50)
      ]
    );

    // Format leagues for Navbar consumption
    const leagues = leaguesResponse.documents.map(league => {
      const userRoster = rostersResponse.documents.find(r => r.leagueId === league.$id);
      const isCommissioner = league.commissioner === user.$id;
      
      return {
        id: league.$id,
        name: league.name,
        isCommissioner,
        teamName: userRoster?.teamName || 'My Team',
        status: league.status || 'active'
      };
    });

    return NextResponse.json({ leagues });

  } catch (error: any) {
    console.error('Error fetching user leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues', details: error.message },
      { status: 500 }
    );
  }
}