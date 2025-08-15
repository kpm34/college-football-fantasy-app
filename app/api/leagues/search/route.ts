import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { APPWRITE_CONFIG } from '@/lib/config/appwrite.config';
import { COLLECTIONS } from '@/core/config/environment';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setKey(APPWRITE_CONFIG.apiKey);

const databases = new Databases(client);
const databaseId = APPWRITE_CONFIG.databaseId;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queries = [] as string[];
    
    // Add search query if provided
    if (search) {
      queries.push(Query.search('name', search));
    }
    
    // Add mode filter if provided
    if (mode) {
      queries.push(Query.equal('mode', mode));
    }

    try {
      // Append pagination and ordering using Query helpers
      const paginatedQueries = [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('created_at')
      ];

      const leagues = await databases.listDocuments(
        databaseId,
        COLLECTIONS.leagues,
        paginatedQueries
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
      const status = appwriteError?.code === 401 ? 401 : 500;
      return NextResponse.json({ success: false, error: 'Search failed' }, { status });
    }

  } catch (error) {
    console.error('Error searching leagues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 