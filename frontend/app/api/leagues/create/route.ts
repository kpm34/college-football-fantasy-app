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
  MATCHUPS: 'matchups'
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

    // Create league document with minimal data first
    const leagueData = {
      schedule_generated: false
    };

    console.log('Creating league document...');
    const league = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      ID.unique(),
      leagueData
    );

    console.log('League created:', league.$id);

    // For now, return success with the league ID
    // We'll add the other attributes later when we set up the collection properly
    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: leagueName, // Store in response for now
        status: 'draft'
      },
      message: 'League created successfully! Note: Additional attributes will be added when collection is fully configured.'
    });

  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Failed to create league', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 