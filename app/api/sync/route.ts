import { NextRequest, NextResponse } from 'next/server';
import { dataSyncManager } from '@/lib/data-sync';
// Removed auth-utils import - using inline auth check
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin/commissioner
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
    
    // Check if user is admin (you may want to implement proper admin checking)
    const isAdmin = user.labels?.includes('admin') || user.email === 'kashpm2002@gmail.com';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const body = await request.json();
    const { sources, season, week, forceUpdate } = body;
    
    // Run sync
    const results = await dataSyncManager.syncAll({
      sources,
      season,
      week,
      forceUpdate
    });
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { error: 'Sync failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get sync status
    const status = await dataSyncManager.getSyncStatus();
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', message: error.message },
      { status: 500 }
    );
  }
}
