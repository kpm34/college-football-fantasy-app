import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

// GET commissioner settings and members
export async function GET(
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
    
    // Get league
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId
    );
    
    // Check if user is commissioner
    if (league.commissionerId !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can access these settings' },
        { status: 403 }
      );
    }
    
    // Get members
    const [rosters, teams] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('leagueId', params.leagueId)]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('leagueId', params.leagueId)]
      ).catch(() => ({ documents: [] }))
    ]);
    
    return NextResponse.json({
      success: true,
      league,
      members: [...rosters.documents, ...teams.documents]
    });
  } catch (error: any) {
    console.error('Get commissioner settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get commissioner settings' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}

// PUT update all league settings
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
    
    // Verify user is commissioner
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId
    );
    
    if (league.commissionerId !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can update league settings' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    
    // Update league with all provided settings
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId,
      updates
    );
    
    return NextResponse.json({ success: true, league: result });
  } catch (error: any) {
    console.error('Update commissioner settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update commissioner settings' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}
