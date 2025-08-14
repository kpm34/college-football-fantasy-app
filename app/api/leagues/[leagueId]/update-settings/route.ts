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
    
    // Update league settings
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId,
      body
    );
    
    return NextResponse.json({ success: true, league: result });
  } catch (error: any) {
    console.error('Update league settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update league settings' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}
