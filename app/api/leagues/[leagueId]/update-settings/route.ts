import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Valid league attributes that can be updated
// NOTE: These must match EXACTLY what exists in Appwrite!
const VALID_LEAGUE_ATTRIBUTES = [
  'name',
  'maxTeams', 
  'isPublic',
  'pickTimeSeconds',
  'scoringRules',
  // 'draftDate', // REMOVED - doesn't exist in Appwrite collection yet!
  'draftType',
  // 'orderMode', // May not exist either
  'gameMode',
  'status',
  'season',
  'commissioner',
  'currentTeams'
];

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
    console.log('Update settings request body:', body);
    
    // Verify user is commissioner
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId
    );
    
    if (league.commissioner !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can update league settings' },
        { status: 403 }
      );
    }
    
    // Map frontend field names to database field names
    const fieldMapping: Record<string, string> = {
      'draftDate': 'draft_date',  // Frontend sends camelCase, DB uses snake_case
      // Add other mappings as needed
    };
    
    // Filter out invalid attributes to prevent schema errors
    const validUpdates: Record<string, any> = {};
    const invalidFields: string[] = [];
    
    for (const [key, value] of Object.entries(body)) {
      // Check if this field needs to be mapped
      const dbFieldName = fieldMapping[key] || key;
      
      if (VALID_LEAGUE_ATTRIBUTES.includes(dbFieldName)) {
        validUpdates[dbFieldName] = value;
      } else if (VALID_LEAGUE_ATTRIBUTES.includes(key)) {
        validUpdates[key] = value;
      } else {
        invalidFields.push(key);
      }
    }
    
    if (invalidFields.length > 0) {
      console.warn('Filtered out invalid league attributes:', invalidFields);
    }
    
    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid attributes to update', invalidFields },
        { status: 400 }
      );
    }
    
    console.log('Valid updates to apply:', validUpdates);
    
    // Update league settings with only valid attributes
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId,
      validUpdates
    );
    
    return NextResponse.json({ 
      success: true, 
      league: result,
      appliedUpdates: validUpdates,
      filteredFields: invalidFields
    });
  } catch (error: any) {
    console.error('Update league settings error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update league settings';
    if (error.message?.includes('Unknown attribute')) {
      errorMessage = 'Invalid field in update request';
    } else if (error.message?.includes('Invalid document structure')) {
      errorMessage = 'Invalid data format';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        code: error.code 
      },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}
