import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';
import { cache, CACHE_DURATIONS } from '@lib/cache';

export const runtime = 'edge'; // Use Edge Runtime for better performance

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const conference = searchParams.get('conference');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build cache key from parameters
    const cacheParams = {
      position,
      conference,
      limit,
      offset,
      search,
    };

    // Build queries
    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('fantasyPoints'),
    ];

    if (position && position !== 'ALL') {
      queries.push(Query.equal('position', position));
    }

    if (conference && conference !== 'ALL') {
      queries.push(Query.equal('conference', conference));
    }

    if (search) {
      queries.push(Query.search('name', search));
    }

    // Fetch from Appwrite using college_players collection
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYERS,
      queries
    );

    const players = {
      players: response.documents,
      total: response.total,
    };

    // Add cache headers
    return NextResponse.json(players, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': 'DIRECT',
      },
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}
