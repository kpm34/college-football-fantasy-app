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
      // Preferred: server-side indexed search
      const paginatedQueries = [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
      ];

      const leagues = await databases.listDocuments(
        databaseId,
        COLLECTIONS.leagues,
        paginatedQueries
      );

      return NextResponse.json({
        success: true,
        leagues: leagues.documents.map((league: any) => ({
          id: league.$id,
          name: league.name,
          mode: league.mode,
          conf: league.conf,
          maxTeams: league.maxTeams ?? league.max_teams ?? 12,
          currentTeams: league.currentTeams ?? league.members?.length ?? 0,
          status: league.status,
          commissionerId: league.commissioner ?? league.commissioner_id,
          createdAt: league.created_at ?? league.$createdAt,
          updatedAt: league.updated_at ?? league.$updatedAt
        })),
        total: leagues.total
      });

    } catch (appwriteError: any) {
      // Fallback: fetch a reasonable page and filter in memory (for collections lacking full-text index)
      console.warn('Search index not available; falling back to filtered list:', appwriteError?.message || appwriteError);
      const fallback = await databases.listDocuments(
        databaseId,
        COLLECTIONS.leagues,
        [Query.limit(Math.max(50, limit + offset))]
      );

      const term = (search || '').trim().toLowerCase();
      const filtered = fallback.documents.filter((doc: any) => {
        const matchesName = term ? String(doc.name || '').toLowerCase().includes(term) : true;
        const matchesMode = mode ? String(doc.mode || '').toLowerCase() === mode.toLowerCase() : true;
        return matchesName && matchesMode;
      });

      return NextResponse.json({
        success: true,
        leagues: filtered.slice(0, limit).map((league: any) => ({
          id: league.$id,
          name: league.name,
          mode: league.mode,
          conf: league.conf,
          maxTeams: league.maxTeams ?? league.max_teams ?? 12,
          currentTeams: league.currentTeams ?? league.members?.length ?? 0,
          status: league.status,
          commissionerId: league.commissioner ?? league.commissioner_id,
          createdAt: league.created_at ?? league.$createdAt,
          updatedAt: league.updated_at ?? league.$updatedAt
        })),
        total: filtered.length
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