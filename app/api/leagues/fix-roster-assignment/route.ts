import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
    console.log('User:', user.$id, user.email);
    
    // Only allow for specific user
    if (user.email !== 'kashpm2002@gmail.com') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    const leagueId = '6894db4a0001ad84e4b0';
    
    // Find all rosters in the league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', leagueId)]
    );
    
    // Find the commissioner roster
    const commissionerRoster = rosters.documents.find((r: any) => 
      r.teamName.includes('Commissioner')
    );
    
    if (!commissionerRoster) {
      return NextResponse.json({ error: 'Commissioner roster not found' }, { status: 404 });
    }
    
    // Update the roster to be assigned to current user
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      commissionerRoster.$id,
      { userId: user.$id }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Updated commissioner roster assignment',
      roster: result
    });
    
  } catch (error: any) {
    console.error('Fix roster assignment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix roster assignment' },
      { status: 500 }
    );
  }
}
