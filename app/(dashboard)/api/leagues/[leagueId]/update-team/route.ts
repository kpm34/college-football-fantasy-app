import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
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
    
    const body = await request.json();
    const { fantasy_team_id, updates } = body;
    
    if (!fantasy_team_id || !updates) {
      return NextResponse.json(
        { error: 'Team ID and updates are required' },
        { status: 400 }
      );
    }

    // Load the target roster first; if not found, fallback to TEAMS collection
    let collectionToUpdate = COLLECTIONS.ROSTERS;
    let teamDoc: any = null;
    try {
      teamDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        fantasy_team_id
      );
    } catch (_err) {
      try {
        teamDoc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.SCHOOLS,
          fantasy_team_id
        );
        collectionToUpdate = COLLECTIONS.SCHOOLS;
      } catch (_err2) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
    }

    // Verify the team belongs to the league in the URL
    if ((teamDoc as any).leagueId !== params.leagueId) {
      return NextResponse.json({ error: 'Team does not belong to this league' }, { status: 400 });
    }

    // Fetch league to determine commissioner privileges
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId
    );

    const isOwner = (teamDoc as any).client_id === user.$id || (teamDoc as any).ownerId === user.$id;
    const isCommissioner = Boolean((league as any)?.commissioner && (league as any).commissioner === user.$id);

    if (!isOwner && !isCommissioner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the team document in the correct collection
    const result = await databases.updateDocument(
      DATABASE_ID,
      collectionToUpdate,
      fantasy_team_id,
      updates
    );
    
    return NextResponse.json({ success: true, team: result });
  } catch (error: any) {
    console.error('Update team error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update team' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}
