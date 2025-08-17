import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-generated';

const databaseId = DATABASE_ID;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includePrivate = searchParams.get('includePrivate') === 'true';
    // includeClosed=true means include FULL leagues; default false excludes full leagues
    const includeClosed = searchParams.get('includeClosed') === 'true';

    let queries = [] as string[];
    
    // Add search query if provided
    if (search) {
      queries.push(Query.search('name', search));
    }
    
    // Add mode filter if provided
    if (mode) {
      queries.push(Query.equal('mode', mode));
    }

    // Visibility filters (default to public/open only)
    if (!includePrivate) {
      queries.push(Query.equal('isPublic', true));
    }
    // Do NOT filter by status here; "closed" is derived solely from capacity (full slots)

    try {
      // Preferred: server-side indexed search
      // Fetch more than requested so we can filter by capacity and still return enough results
      const fetchLimit = Math.min(1000, Math.max(limit + offset + 100, 200));
      const paginatedQueries = [
        ...queries,
        Query.orderDesc('$createdAt'),
        Query.limit(fetchLimit),
      ];

      const leagues = await databases.listDocuments(
        databaseId,
        COLLECTIONS.LEAGUES,
        paginatedQueries
      );

      // Capacity-derived open/closed
      const docs = leagues.documents as any[];
      const filteredByCapacity = docs.filter((league: any) => {
        const maxTeams = league.maxTeams ?? league.max_teams ?? 12;
        const currentTeams = league.currentTeams ?? league.members?.length ?? 0;
        const isFull = currentTeams >= maxTeams;
        return includeClosed ? true : !isFull;
      });

      const paged = filteredByCapacity.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        leagues: paged.map((league: any) => {
          const maxTeams = league.maxTeams ?? league.max_teams ?? 12;
          const currentTeams = league.currentTeams ?? league.members?.length ?? 0;
          const isFull = currentTeams >= maxTeams;
          const computedStatus = isFull ? 'closed' : 'open';
          const hasPassword = Boolean(league.password);
          const isPrivate = (league.isPublic === false) || hasPassword;
          return {
            // Provide both id styles for compatibility with client code
            id: league.$id,
            $id: league.$id,
            name: league.name,
            mode: league.mode,
            conf: league.conf,
            maxTeams,
            currentTeams,
            // Common aliases used by UI
            teams: currentTeams,
            type: isPrivate ? 'private' : 'public',
            hasPassword,
            status: computedStatus,
            commissionerId: league.commissioner ?? league.commissioner_id,
            createdAt: league.created_at ?? league.$createdAt,
            updatedAt: league.updated_at ?? league.$updatedAt
          };
        }),
        total: filteredByCapacity.length
      });

    } catch (appwriteError: any) {
      // Fallback: fetch a reasonable page and filter in memory (for collections lacking full-text index)
      console.warn('Search index not available; falling back to filtered list:', appwriteError?.message || appwriteError);
      const fallback = await databases.listDocuments(
        databaseId,
        COLLECTIONS.LEAGUES,
        [
          // Keep visibility constraints consistent with the main path
          ...(includePrivate ? [] : [Query.equal('isPublic', true)]),
          Query.orderDesc('$createdAt'),
          // Expand scan size to improve match likelihood without indexes
          Query.limit(Math.max(200, Math.min(1000, limit + offset + 200)))
        ]
      );

      const term = (search || '').trim().toLowerCase();
      const filtered = fallback.documents.filter((doc: any) => {
        const matchesName = term ? String(doc.name || '').toLowerCase().includes(term) : true;
        const matchesMode = mode ? String(doc.mode || '').toLowerCase() === mode.toLowerCase() : true;
        // Capacity-derived open/closed
        const maxTeams = doc.maxTeams ?? doc.max_teams ?? 12;
        const currentTeams = doc.currentTeams ?? doc.members?.length ?? 0;
        const isFull = currentTeams >= maxTeams;
        const passesCapacity = includeClosed ? true : !isFull;
        return matchesName && matchesMode && passesCapacity;
      });

      return NextResponse.json({
        success: true,
        leagues: filtered.slice(0, limit).map((league: any) => {
          const maxTeams = league.maxTeams ?? league.max_teams ?? 12;
          const currentTeams = league.currentTeams ?? league.members?.length ?? 0;
          const hasPassword = Boolean(league.password);
          const isPrivate = (league.isPublic === false) || hasPassword;
          return {
            id: league.$id,
            $id: league.$id,
            name: league.name,
            mode: league.mode,
            conf: league.conf,
            maxTeams,
            currentTeams,
            teams: currentTeams,
            type: isPrivate ? 'private' : 'public',
            hasPassword,
            status: currentTeams >= maxTeams ? 'closed' : 'open',
            commissionerId: league.commissioner ?? league.commissioner_id,
            createdAt: league.created_at ?? league.$createdAt,
            updatedAt: league.updated_at ?? league.$updatedAt
          };
        }),
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