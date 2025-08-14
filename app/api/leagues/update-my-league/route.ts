import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

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
    
    // Hardcoded fix for Jawn League
    if (user.email === 'kashpm2002@gmail.com') {
      const leagueId = '6894db4a0001ad84e4b0';
      
      // Update the league commissioner field
      const result = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId,
        { commissioner: user.$id }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Updated Jawn League commissioner',
        league: result
      });
    }
    
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    
  } catch (error: any) {
    console.error('Update league error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update league' },
      { status: 500 }
    );
  }
}
