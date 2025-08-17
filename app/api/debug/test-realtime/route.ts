import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to test real-time deletions
 * Can delete leagues or rosters for testing
 */
export async function DELETE(request: NextRequest) {
  try {
    const { type, id } = await request.json();

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 });
    }

    // Only allow admin access
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((user.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    let result;
    
    if (type === 'league') {
      result = await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        id
      );
      console.log(`Deleted league ${id} for testing`);
    } else if (type === 'roster') {
      result = await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        id
      );
      console.log(`Deleted roster ${id} for testing`);
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "league" or "roster"' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`,
      id,
      deletedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Test deletion error:', error);
    return NextResponse.json(
      { error: 'Deletion failed', details: error.message },
      { status: 500 }
    );
  }
}