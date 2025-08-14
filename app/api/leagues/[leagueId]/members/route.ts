import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

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
    
    // Get rosters for this league
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', params.leagueId)]
    );
    
    return NextResponse.json({ 
      success: true, 
      members: rostersResponse.documents 
    });
  } catch (error: any) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get members' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}
