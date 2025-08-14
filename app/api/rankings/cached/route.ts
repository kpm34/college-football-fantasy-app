import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { cache, CACHE_DURATIONS } from '@/lib/cache';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get('week') || '1');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const rankings = await cache.rankings.get(
      week,
      async () => {
        // Fetch from Appwrite
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.RANKINGS,
          [
            Query.equal('week', week),
            Query.equal('year', year),
            Query.orderAsc('rank'),
            Query.limit(25), // AP Top 25
          ]
        );

        // Transform data
        const rankingsData = response.documents.map(doc => ({
          rank: doc.rank,
          team: doc.team,
          conference: doc.conference,
          record: doc.record,
          points: doc.points,
          previousRank: doc.previousRank,
        }));

        return {
          week,
          year,
          rankings: rankingsData,
          lastUpdated: new Date().toISOString(),
        };
      }
    );

    // Add cache headers - rankings are very cacheable
    return NextResponse.json(rankings, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache-Status': rankings ? 'HIT' : 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}

// Invalidate cache when rankings are updated
export async function POST(request: NextRequest) {
  try {
    // Verify admin/cron authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Invalidate all rankings cache
    await cache.rankings.invalidate();

    return NextResponse.json({ 
      success: true, 
      message: 'Rankings cache invalidated' 
    });
  } catch (error) {
    console.error('Error invalidating rankings cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}
