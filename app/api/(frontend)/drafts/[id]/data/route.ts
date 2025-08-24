import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: leagueId } = params;

  try {
    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await userRes.json();

    // Authorization: must be a member of the league to access real draft
    let isMember = false;
    try {
      const membership = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUE_MEMBERSHIPS,
        [Query.equal('league_id', leagueId), Query.equal('client_id', user.$id), Query.limit(1)]
      );
      isMember = (membership.total || membership.documents.length) > 0;
    } catch {}
    // Fallback: owner of a fantasy team within the league
    if (!isMember) {
      try {
        const teams = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FANTASY_TEAMS,
          [Query.equal('league_id', leagueId), Query.equal('owner_client_id', user.$id), Query.limit(1)]
        );
        isMember = (teams.total || teams.documents.length) > 0;
      } catch {}
    }
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this league' }, { status: 403 });
    }
    
    // Load league data
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Load user's fantasy team(s)
    let userTeams: any[] = [];
    try {
      const teamDocs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FANTASY_TEAMS,
        [Query.equal('league_id', leagueId), Query.equal('owner_client_id', user.$id)]
      );
      userTeams = teamDocs.documents;
    } catch {}

    // Load existing draft picks
    let picks: any[] = [];
    try {
      const picksResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS,
        [
          Query.equal('leagueId', leagueId),
          Query.orderAsc('pick'),
          Query.limit(500)
        ]
      );
      picks = picksResponse.documents;
    } catch {}

    // Load draft state if exists
    let draftState: any = null;
    try {
      const statesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_STATES,
        [Query.equal('draftId', leagueId), Query.limit(1)]
      );
      if (statesResponse.documents.length > 0) {
        draftState = statesResponse.documents[0];
      }
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        league,
        userTeams,
        picks,
        draftState,
        userId: user.$id
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching draft data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch draft data' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
