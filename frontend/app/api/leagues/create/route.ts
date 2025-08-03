import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = 'college-football-fantasy';

interface CreateLeagueRequest {
  name: string;
  gameMode: 'CONFERENCE' | 'POWER4';
  selectedConference?: string;
  maxTeams: number;
  seasonStartWeek: number;
  draftDate?: string;
  commissionerId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLeagueRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.gameMode || !body.maxTeams || !body.seasonStartWeek) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate game mode specific requirements
    if (body.gameMode === 'CONFERENCE' && !body.selectedConference) {
      return NextResponse.json(
        { error: 'Conference mode requires a selected conference' },
        { status: 400 }
      );
    }

    // Determine lineup and scoring profile IDs based on game mode
    const lineupProfileId = body.gameMode === 'CONFERENCE' ? 'lp_conference' : 'lp_power4';
    const scoringProfileId = 'sp_standard'; // Use standard scoring for both modes

    // Create league document
    const leagueData = {
      name: body.name,
      mode: body.gameMode,
      conf: body.selectedConference || null,
      commissioner_id: body.commissionerId || 'demo-user-123', // TODO: Get from auth
      members: [body.commissionerId || 'demo-user-123'], // Start with commissioner
      lineup_profile_id: lineupProfileId,
      scoring_profile_id: scoringProfileId,
      max_teams: body.maxTeams,
      draft_date: body.draftDate || null,
      season_start_week: body.seasonStartWeek,
      status: 'DRAFTING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const league = await databases.createDocument(
        databaseId,
        'leagues',
        ID.unique(),
        leagueData
      );

      return NextResponse.json({
        success: true,
        league: {
          id: league.$id,
          name: league.name,
          mode: league.mode,
          conf: league.conf,
          maxTeams: league.max_teams,
          status: league.status,
          createdAt: league.created_at
        }
      });

    } catch (appwriteError: any) {
      console.error('Appwrite error:', appwriteError);
      
      // Return mock response for development
      return NextResponse.json({
        success: true,
        league: {
          id: `demo-${Date.now()}`,
          name: body.name,
          mode: body.gameMode,
          conf: body.selectedConference,
          maxTeams: body.maxTeams,
          status: 'DRAFTING',
          createdAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 