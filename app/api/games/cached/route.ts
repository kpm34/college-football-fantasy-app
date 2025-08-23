import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';
import { Query } from 'appwrite';
import { cache, CACHE_DURATIONS } from '@lib/cache';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get('week') || '1');
    const conference = searchParams.get('conference');
    const team = searchParams.get('team');

    const games = await cache.games.get(
      week,
      async () => {
        // Build queries
        const queries: string[] = [
          Query.equal('week', week),
          Query.orderAsc('startTime'),
        ];

        if (conference) {
          queries.push(Query.equal('conference', conference));
        }

        if (team) {
          queries.push(Query.or([
            Query.equal('homeTeam', team),
            Query.equal('awayTeam', team),
          ]));
        }

        // Fetch from Appwrite
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.GAMES,
          queries
        );

        // Process games to add eligibility info
        const processedGames = response.documents.map(game => ({
          $id: game.$id,
          week: game.week,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeScore: game.homeScore || 0,
          awayScore: game.awayScore || 0,
          startTime: game.startTime,
          status: game.status || 'scheduled',
          isConferenceGame: game.isConferenceGame || false,
          homeTeamRanked: game.homeTeamRanked || false,
          awayTeamRanked: game.awayTeamRanked || false,
          // Players are eligible if it's a conference game OR if either team is ranked
          eligibleGame: game.isConferenceGame || game.homeTeamRanked || game.awayTeamRanked,
        }));

        return {
          week,
          games: processedGames,
          total: response.total,
          eligibleGames: processedGames.filter(g => g.eligibleGame).length,
        };
      }
    );

    // Add cache headers
    return NextResponse.json(games, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': games ? 'HIT' : 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// Cache warmer - preload all weeks
export async function POST(request: NextRequest) {
  try {
    // Verify admin/cron authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } = await request.json();

    // Warm cache for all specified weeks
    const results = await Promise.allSettled(
      weeks.map(async (week: number) => {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.GAMES,
          [Query.equal('week', week)]
        );
        
        // Cache the data
        await cache.games.get(week, async () => response.documents);
        
        return { week, count: response.total };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      message: `Warmed cache for ${successful}/${weeks.length} weeks`,
      details: results,
    });
  } catch (error) {
    console.error('Error warming games cache:', error);
    return NextResponse.json(
      { error: 'Failed to warm cache' },
      { status: 500 }
    );
  }
}
