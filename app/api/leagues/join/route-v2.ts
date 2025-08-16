import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID, Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to safely get attribute value
function safeGet(obj: any, path: string, defaultValue: any = null) {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  return result ?? defaultValue;
}

// Helper to validate and normalize league data
function normalizeLeague(league: any) {
  return {
    id: league.$id,
    name: league.name || 'Unnamed League',
    commissioner: league.commissioner || league.commissionerId || 'Unknown',
    commissionerId: league.commissionerId || league.commissioner || '',
    maxTeams: Number(league.maxTeams) || 16,  // Default for college football
    currentTeams: Number(league.currentTeams) || (Array.isArray(league.members) ? league.members.length : 0),
    members: Array.isArray(league.members) ? league.members : [],
    draftType: league.draftType || 'snake',
    entryFee: Number(league.entryFee) || 0,
    scoringType: league.scoringType || 'standard',
    draftDate: league.draftDate || null,
    draftTime: league.draftTime || null,
    status: league.status || 'draft',
    isPublic: league.isPublic !== false,
    password: league.password || null,
    inviteCode: league.inviteCode || null,
    inviteToken: league.inviteToken || null,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const errors: string[] = [];
  
  try {
    // Step 1: Authenticate user
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: 'No session cookie found. Please log in first.'
      }, { status: 401 });
    }
    
    // Get user details from Appwrite
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: 'Session is invalid or expired. Please log in again.'
      }, { status: 401 });
    }
    
    const user = await userRes.json();
    console.log(`User ${user.email} attempting to join league`);
    
    // Step 2: Parse and validate request
    const body = await request.json();
    const { leagueId, password, teamName, inviteCode } = body;
    
    if (!leagueId) {
      return NextResponse.json({ 
        error: 'League ID is required',
        details: 'Please provide a valid league ID'
      }, { status: 400 });
    }
    
    // Step 3: Get league details with error handling
    let league;
    try {
      league = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
    } catch (error: any) {
      if (error.code === 404) {
        return NextResponse.json({ 
          error: 'League not found',
          details: `No league exists with ID: ${leagueId}`
        }, { status: 404 });
      }
      throw error;
    }
    
    const normalizedLeague = normalizeLeague(league);
    
    // Step 4: Check league capacity
    if (normalizedLeague.currentTeams >= normalizedLeague.maxTeams) {
      return NextResponse.json({ 
        error: 'League is full',
        details: `This league already has ${normalizedLeague.maxTeams} teams (maximum capacity)`
      }, { status: 400 });
    }
    
    // Step 5: Check if user is already in the league
    try {
      const existingRosters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [
          Query.equal('leagueId', leagueId),
          Query.equal('userId', user.$id)
        ]
      );
      
      if (existingRosters.documents.length > 0) {
        return NextResponse.json({ 
          error: 'Already in league',
          details: 'You already have a team in this league'
        }, { status: 400 });
      }
    } catch (error: any) {
      console.warn('Failed to check existing rosters:', error.message);
      // Continue anyway - worst case they'll get an error when creating duplicate
    }
    
    // Step 6: Verify access (password/invite code)
    const isPrivate = !normalizedLeague.isPublic || !!normalizedLeague.password;
    
    if (isPrivate) {
      let hasAccess = false;
      
      // Check invite code
      if (inviteCode && normalizedLeague.inviteCode) {
        hasAccess = inviteCode === normalizedLeague.inviteCode;
      }
      
      // Check password
      if (!hasAccess && password && normalizedLeague.password) {
        hasAccess = password === normalizedLeague.password;
      }
      
      if (!hasAccess) {
        return NextResponse.json({ 
          error: 'Access denied',
          details: 'Invalid password or invite code for this private league'
        }, { status: 403 });
      }
    }
    
    // Step 7: Create roster with minimal required fields
    const rosterName = teamName || `${user.name || user.email.split('@')[0]}'s Team`;
    const rosterData: Record<string, any> = {
      teamName: rosterName,
      userId: user.$id,
      userName: user.name || user.email.split('@')[0],
      email: user.email,
      leagueId: leagueId,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      players: '[]', // JSON string for player array
    };
    
    // Add optional fields only if they exist in schema
    try {
      const rostersCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.ROSTERS);
      const attributes = (rostersCollection as any).attributes || [];
      const attributeKeys = attributes.map((a: any) => a.key);
      
      // Only add optional fields if they exist in the schema
      if (attributeKeys.includes('abbreviation')) {
        rosterData.abbreviation = rosterName.substring(0, 3).toUpperCase();
      }
      if (attributeKeys.includes('draftPosition')) {
        rosterData.draftPosition = normalizedLeague.currentTeams + 1;
      }
      if (attributeKeys.includes('waiverPriority')) {
        rosterData.waiverPriority = normalizedLeague.currentTeams + 1;
      }
      if (attributeKeys.includes('faabBalance')) {
        rosterData.faabBalance = 100;
      }
      if (attributeKeys.includes('isActive')) {
        rosterData.isActive = true;
      }
      if (attributeKeys.includes('lastActive')) {
        rosterData.lastActive = new Date().toISOString();
      }
    } catch (schemaError) {
      console.warn('Could not check roster schema, using minimal fields:', schemaError);
    }
    
    let roster;
    try {
      roster = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        ID.unique(),
        rosterData
      );
      console.log(`Created roster ${roster.$id} for user ${user.email}`);
    } catch (error: any) {
      console.error('Failed to create roster:', error);
      return NextResponse.json({ 
        error: 'Failed to create team',
        details: error.message || 'Could not create your team in the league'
      }, { status: 500 });
    }
    
    // Step 8: Update league members and count
    const updatedMembers = [...normalizedLeague.members, user.$id];
    const updateData: Record<string, any> = {};
    
    try {
      const leaguesCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.LEAGUES);
      const attributes = (leaguesCollection as any).attributes || [];
      const attributeKeys = attributes.map((a: any) => a.key);
      
      // Only update fields that exist in the schema
      if (attributeKeys.includes('members')) {
        updateData.members = updatedMembers;
      }
      if (attributeKeys.includes('currentTeams')) {
        updateData.currentTeams = normalizedLeague.currentTeams + 1;
      }
      
      // Update status if league is now full
      if (attributeKeys.includes('status')) {
        const newTeamCount = normalizedLeague.currentTeams + 1;
        if (newTeamCount >= normalizedLeague.maxTeams) {
          updateData.status = 'full';
        } else if (normalizedLeague.status === 'full') {
          updateData.status = 'open';
        }
      }
    } catch (schemaError) {
      console.warn('Could not check league schema, using minimal update:', schemaError);
      // Fallback to just updating members
      updateData.members = updatedMembers;
    }
    
    if (Object.keys(updateData).length > 0) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          leagueId,
          updateData
        );
        console.log(`Updated league ${leagueId} with new member`);
      } catch (error: any) {
        console.error('Failed to update league:', error);
        // This is not critical - the user is already in the league
        errors.push(`Warning: Could not update league member count: ${error.message}`);
      }
    }
    
    // Step 9: Log activity (optional, non-critical)
    try {
      // Check if activity log collection exists
      const activityData: Record<string, any> = {
        type: 'league_join',
        userId: user.$id,
        leagueId: leagueId,
        teamId: roster.$id,
        description: `${user.name || user.email} joined ${normalizedLeague.name}`,
        createdAt: new Date().toISOString(),
      };
      
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOG || 'activity_log',
        ID.unique(),
        activityData
      );
    } catch (error) {
      console.warn('Failed to log activity (non-critical):', error);
      // Don't fail the join operation for this
    }
    
    // Step 10: Return success
    const duration = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      message: `Successfully joined ${normalizedLeague.name}`,
      rosterId: roster.$id,
      leagueId: leagueId,
      teamName: rosterData.teamName,
      warnings: errors.length > 0 ? errors : undefined,
      debug: {
        duration: `${duration}ms`,
        currentTeams: normalizedLeague.currentTeams + 1,
        maxTeams: normalizedLeague.maxTeams,
      }
    });
    
  } catch (error: any) {
    console.error('Join league error:', error);
    
    // Provide detailed error information
    const errorResponse = {
      error: 'Failed to join league',
      details: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString(),
    };
    
    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).stack = error.stack;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}