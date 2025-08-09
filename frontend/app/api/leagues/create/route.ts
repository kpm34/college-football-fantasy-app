import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';
import { APPWRITE_CONFIG } from '@/lib/appwrite-config';

// Initialize Appwrite client with API key for server-side operations
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setKey(APPWRITE_CONFIG.apiKey);

const databases = new Databases(client);
const DATABASE_ID = APPWRITE_CONFIG.databaseId;

const COLLECTIONS = {
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  ROSTERS: 'rosters',
  MATCHUPS: 'matchups',
  USERS: 'users',
  USER_TEAMS: 'user_teams'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leagueName,
      gameMode,
      selectedConference,
      scoringType,
      maxTeams,
      seasonStartWeek,
      draftDate,
      commissionerId // This would come from auth
    } = body;

    console.log('Creating league with data:', { leagueName, gameMode, maxTeams, commissionerId });

    // Validate required fields
    if (!leagueName || !commissionerId) {
      return NextResponse.json(
        { error: 'League name and commissioner ID are required' },
        { status: 400 }
      );
    }

    // Create league document with all required data
    const leagueData = {
      name: leagueName,
      commissioner: commissionerId,
      commissionerId: commissionerId,
      season: new Date().getFullYear(),
      scoringType: scoringType || 'PPR',
      maxTeams: maxTeams || 12,
      draftDate: draftDate || null,
      status: 'pre-draft',
      inviteCode: ID.unique().substring(0, 8).toUpperCase(),
      gameMode: gameMode || 'standard',
      selectedConference: selectedConference || null,
      schedule_generated: false,
      draftType: 'snake',
      pickTimeSeconds: 90,
      orderMode: 'random'
    };

    console.log('Creating league document...');
    const league = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      ID.unique(),
      leagueData
    );

    console.log('League created:', league.$id);

    // Create a user_team entry for the commissioner
    const userTeamData = {
      userId: commissionerId,
      leagueId: league.$id,
      teamName: `${leagueName} Team 1`,
      leagueName: leagueName
    };

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      ID.unique(),
      userTeamData
    );

    // Update the user's leagues array
    try {
      const userDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, commissionerId);
      const currentLeagues = (userDoc as any).leagues || [];
      const currentLeagueNames = (userDoc as any).leagueNames || [];
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        commissionerId,
        {
          leagues: [...currentLeagues, league.$id],
          leagueNames: [...currentLeagueNames, leagueName]
        }
      );
    } catch (e) {
      console.error('Failed to update user leagues array:', e);
      // Continue anyway - the league was created successfully
    }

    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: leagueName,
        status: 'pre-draft',
        inviteCode: leagueData.inviteCode
      },
      message: 'League created successfully!'
    });

  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Failed to create league', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 