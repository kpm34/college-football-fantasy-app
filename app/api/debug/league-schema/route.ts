import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check league schema and test updates
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leagueId = searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId parameter required' }, { status: 400 });
    }

    // Get the league document
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Extract relevant fields
    const leagueData = {
      id: league.$id,
      name: league.name,
      draftType: league.draftType,
      pickTimeSeconds: league.pickTimeSeconds,
      orderMode: league.orderMode,
      draftDate: league.draftDate,
      scoringRules: league.scoringRules,
      status: league.status,
      commissioner: league.commissioner,
      allFields: Object.keys(league)
    };

    return NextResponse.json({
      success: true,
      leagueData,
      collectionId: COLLECTIONS.LEAGUES
    });

  } catch (error: any) {
    console.error('League schema debug error:', error);
    return NextResponse.json(
      { error: 'Failed to get league data', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leagueId, testUpdates } = await request.json();

    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId required' }, { status: 400 });
    }

    // Test update with the provided data
    console.log('Testing update with:', testUpdates);
    
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      testUpdates
    );

    return NextResponse.json({
      success: true,
      message: 'Test update successful',
      updatedFields: testUpdates,
      result: {
        id: result.$id,
        updatedAt: result.$updatedAt
      }
    });

  } catch (error: any) {
    console.error('League schema test update error:', error);
    return NextResponse.json(
      { 
        error: 'Test update failed', 
        details: error.message,
        type: error.type,
        code: error.code
      },
      { status: 500 }
    );
  }
}