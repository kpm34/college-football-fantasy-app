import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin endpoint to sync league members and fix navigation issues
 * Ensures all roster records are properly linked and accessible
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication
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

    const { leagueId } = await request.json().catch(() => ({}));
    
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID required' }, { status: 400 });
    }

    // Get all rosters for this league
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      [
        Query.equal('leagueId', leagueId),
        Query.limit(100)
      ]
    );

    const rosters = rostersResponse.documents;
    let fixed = 0;
    let errors = 0;
    const results = [];

    // Check each roster for issues
    for (const roster of rosters) {
      try {
        const rosterInfo = {
          teamName: roster.teamName,
          userId: roster.userId,
          leagueId: roster.leagueId,
          status: 'ok'
        };

        // Verify user exists and can access
        try {
          const userCheck = await fetch(`https://nyc.cloud.appwrite.io/v1/users/${roster.userId}`, {
            headers: {
              'X-Appwrite-Project': 'college-football-fantasy-app',
              'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
            },
          });
          
          if (userCheck.ok) {
            const userData = await userCheck.json();
            rosterInfo.userEmail = userData.email;
          } else {
            rosterInfo.status = 'user_not_found';
          }
        } catch (e) {
          rosterInfo.status = 'user_check_failed';
        }

        // Try to update roster to ensure it's accessible
        try {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USER_TEAMS,
            roster.$id,
            {
              // Refresh the roster record with current data (only valid fields)
              teamName: roster.teamName || `Team ${roster.userId.slice(-4)}`,
              leagueId: roster.leagueId,
              userId: roster.userId,
              wins: roster.wins || 0,
              losses: roster.losses || 0,
              ties: roster.ties || 0,
              pointsFor: roster.pointsFor || 0,
              pointsAgainst: roster.pointsAgainst || 0
            }
          );
          
          if (rosterInfo.status === 'ok') {
            fixed++;
          }
        } catch (updateError) {
          rosterInfo.status = 'update_failed';
          rosterInfo.error = updateError.message;
          errors++;
        }

        results.push(rosterInfo);
      } catch (error) {
        errors++;
        results.push({
          teamName: roster.teamName,
          userId: roster.userId,
          status: 'processing_failed',
          error: error.message
        });
      }
    }

    // Also verify the league itself is accessible
    let leagueStatus = 'ok';
    try {
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      leagueStatus = 'verified';
    } catch (e) {
      leagueStatus = 'league_not_accessible';
    }

    return NextResponse.json({
      success: true,
      leagueId,
      leagueStatus,
      totalRosters: rosters.length,
      fixed,
      errors,
      results
    });

  } catch (error: any) {
    console.error('League sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    );
  }
}