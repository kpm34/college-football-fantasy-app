import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = 'college-football-fantasy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queries = [];
    
    // Add search query if provided
    if (search) {
      queries.push(Query.search('name', search));
    }
    
    // Add mode filter if provided
    if (mode) {
      queries.push(Query.equal('mode', mode));
    }

    try {
      const leagues = await databases.listDocuments(
        databaseId,
        'leagues',
        queries,
        limit,
        offset,
        'created_at',
        'DESC'
      );

      return NextResponse.json({
        success: true,
        leagues: leagues.documents.map(league => ({
          id: league.$id,
          name: league.name,
          mode: league.mode,
          conf: league.conf,
          maxTeams: league.max_teams,
          currentTeams: league.members?.length || 0,
          status: league.status,
          commissionerId: league.commissioner_id,
          createdAt: league.created_at,
          updatedAt: league.updated_at
        })),
        total: leagues.total
      });

    } catch (appwriteError: any) {
      console.error('Appwrite error:', appwriteError);
      
      // Return mock data for development
      return NextResponse.json({
        success: true,
        leagues: [
          {
            id: 'demo-league-1',
            name: 'Big Ten Showdown',
            mode: 'CONFERENCE',
            conf: 'big_ten',
            maxTeams: 12,
            currentTeams: 8,
            status: 'DRAFTING',
            commissionerId: 'demo-user-123',
            createdAt: '2024-08-03T10:00:00Z',
            updatedAt: '2024-08-03T10:00:00Z'
          },
          {
            id: 'demo-league-2',
            name: 'Power 4 Elite',
            mode: 'POWER4',
            conf: null,
            maxTeams: 16,
            currentTeams: 12,
            status: 'ACTIVE',
            commissionerId: 'demo-user-456',
            createdAt: '2024-08-02T15:30:00Z',
            updatedAt: '2024-08-03T09:15:00Z'
          }
        ],
        total: 2
      });
    }

  } catch (error) {
    console.error('Error searching leagues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 