import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
    
    // Check fantasy_teams for this user
    const fantasyTeams = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [Query.or([
        Query.equal('ownerAuthUserId', user.$id),
        Query.equal('ownerClientId', user.$id),
        Query.equal('authUserId', user.$id),
        Query.equal('teammanager_id', user.$id)
      ])]
    );
    
    // Check leagues where user is commissioner
    const commissionerLeagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.or([
        Query.equal('commissionerAuthUserId', user.$id),
        Query.equal('commissioner', user.$id),
        Query.equal('ownerClientId', user.$id)
      ])]
    );
    
    return NextResponse.json({
      auth_user: {
        id: user.$id,
        email: user.email,
        name: user.name
      },
      fantasy_teams: fantasyTeams.documents.map(t => ({
        id: t.$id,
        name: t.name,
        leagueId: t.leagueId,
        ownerClientId: t.ownerClientId
      })),
      commissioner_of: commissionerLeagues.documents.map(l => ({
        id: l.$id,
        name: l.name
      })),
      debug: {
        expected_kashyap_id: '68aa1f09001547b92a17',
        matches: user.$id === '68aa1f09001547b92a17'
      }
    });
    
  } catch (error: any) {
    console.error('Error in whoami:', error);
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}
