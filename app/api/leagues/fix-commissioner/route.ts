import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { APPWRITE_CONFIG } from '@/lib/config/appwrite.config';
import { COLLECTIONS } from '@/lib/appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': `a_session_${APPWRITE_CONFIG.projectId}=${sessionCookie}`,
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await userRes.json();

    // Admin check
    if (user.email !== 'kashpm2002@gmail.com') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId)
      .setKey(APPWRITE_CONFIG.apiKey);

    const databases = new Databases(client);
    const databaseId = APPWRITE_CONFIG.databaseId;

    // Get all leagues
    const leagues = await databases.listDocuments(
      databaseId,
      COLLECTIONS.LEAGUES,
      []
    );

    let fixedCount = 0;
    const fixes: any[] = [];

    for (const league of leagues.documents) {
      // Check if commissioner field contains a name instead of ID
      if (league.commissioner && !league.commissioner.startsWith('6')) {
        console.log(`Fixing league ${league.$id}: commissioner is "${league.commissioner}"`);
        
        // Find the actual commissioner by checking rosters
        const rosters = await databases.listDocuments(
          databaseId,
          COLLECTIONS.ROSTERS,
          []
        );

        // Look for "Commissioner" in team name
        const commissionerRoster = rosters.documents.find((r: any) => 
          r.leagueId === league.$id && 
          (r.teamName.toLowerCase().includes('commissioner') || r.teamName === league.name + ' Commissioner')
        );

        if (commissionerRoster) {
          // Update league with correct commissioner ID
          await databases.updateDocument(
            databaseId,
            COLLECTIONS.LEAGUES,
            league.$id,
            { commissioner: commissionerRoster.userId }
          );
          
          fixes.push({
            leagueId: league.$id,
            leagueName: league.name,
            oldCommissioner: league.commissioner,
            newCommissioner: commissionerRoster.userId,
            commissionerTeam: commissionerRoster.teamName
          });
          fixedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${fixedCount} leagues`,
      fixes 
    });

  } catch (error: any) {
    console.error('Fix commissioner error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix commissioner fields', details: error },
      { status: 500 }
    );
  }
}
