import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check user league membership
 * Only works for logged in users
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
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

    // Debug info
    const debugInfo = {
      user: {
        id: user.$id,
        email: user.email,
        name: user.name
      },
      collections: {
        leagues: COLLECTIONS.LEAGUES,
        rosters: COLLECTIONS.ROSTERS
      }
    };

    // Get user's rosters
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [
        Query.equal('userId', user.$id),
        Query.limit(50)
      ]
    );

    debugInfo.rosters = {
      found: rostersResponse.documents.length,
      documents: rostersResponse.documents.map(r => ({
        id: r.$id,
        leagueId: r.leagueId,
        teamName: r.teamName,
        userId: r.userId
      }))
    };

    // Get leagues where user is commissioner
    const commissionerLeagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [
        Query.equal('commissioner', user.$id),
        Query.limit(50)
      ]
    );

    debugInfo.commissionerLeagues = {
      found: commissionerLeagues.documents.length,
      documents: commissionerLeagues.documents.map(l => ({
        id: l.$id,
        name: l.name,
        commissioner: l.commissioner
      }))
    };

    // If user has rosters, get the league details
    if (rostersResponse.documents.length > 0) {
      const leagueIds = rostersResponse.documents.map(roster => roster.leagueId);
      const leaguesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        [
          Query.equal('$id', leagueIds),
          Query.limit(50)
        ]
      );

      debugInfo.playerLeagues = {
        found: leaguesResponse.documents.length,
        documents: leaguesResponse.documents.map(l => ({
          id: l.$id,
          name: l.name,
          status: l.status
        }))
      };
    }

    return NextResponse.json(debugInfo);

  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}