import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const conference = searchParams.get('conference');
    const team = searchParams.get('team');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '500', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build queries
    const queries: any[] = [
      Query.limit(limit),
      Query.offset(offset)
    ];

    // Only add Power 4 conferences
    const power4Conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    if (conference && power4Conferences.includes(conference)) {
      queries.push(Query.equal('conference', conference));
    } else if (!conference) {
      // Default to Power 4 by conference membership rather than a boolean flag
      queries.push(Query.equal('conference', power4Conferences as any));
    }

    if (position && position !== 'ALL') {
      queries.push(Query.equal('position', position));
    }

    if (team) {
      queries.push(Query.equal('team', team));
    }

    if (search) {
      queries.push(Query.search('name', search));
    }

    // Sort by rating (fallback to projection if rating missing)
    queries.push(Query.orderDesc('rating'));

    // Fetch players from Appwrite
    const response = await databases.listDocuments(DATABASE_ID, 'college_players', queries);

    // Transform players for draft UI
    const players = response.documents.map((player, index) => {
      // Calculate basic projections based on position and rating
      const baseProjection = calculateBaseProjection(player.position, player.rating ?? 80);
      
      return {
        id: player.$id,
        name: player.name,
        position: player.position,
        team: player.team,
        team_abbreviation: player.team_abbreviation,
        conference: player.conference,
        year: player.year || 'JR',
        height: player.height || '6-0',
        weight: typeof player.weight === 'string' ? parseInt(player.weight, 10) : (player.weight ?? 200),
        rating: player.rating ?? 80,
        // Calculate ADP based on rating and position
        adp: calculateADP(player.position, player.rating ?? 80, index),
        projectedPoints: baseProjection.points,
        projectedStats: baseProjection.stats,
        draftable: player.draftable,
        power_4: player.power_4
      };
    });

    return NextResponse.json({
      success: true,
      players,
      total: response.total,
      hasMore: offset + limit < response.total
    });

  } catch (error) {
    console.error('Error fetching draft players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

function calculateBaseProjection(position: string, rating: number) {
  // Base projections scaled by rating (60-99 scale)
  const ratingMultiplier = rating / 80; // 80 is average
  
  switch (position) {
    case 'QB':
      return {
        points: Math.round(250 * ratingMultiplier),
        stats: {
          passingYards: Math.round(3000 * ratingMultiplier),
          passingTDs: Math.round(25 * ratingMultiplier),
          interceptions: Math.round(10 / ratingMultiplier),
          rushingYards: Math.round(200 * ratingMultiplier),
          rushingTDs: Math.round(3 * ratingMultiplier)
        }
      };
    
    case 'RB':
      return {
        points: Math.round(200 * ratingMultiplier),
        stats: {
          rushingYards: Math.round(1000 * ratingMultiplier),
          rushingTDs: Math.round(10 * ratingMultiplier),
          receptions: Math.round(30 * ratingMultiplier),
          receivingYards: Math.round(250 * ratingMultiplier),
          receivingTDs: Math.round(2 * ratingMultiplier)
        }
      };
    
    case 'WR':
      return {
        points: Math.round(180 * ratingMultiplier),
        stats: {
          receptions: Math.round(60 * ratingMultiplier),
          receivingYards: Math.round(900 * ratingMultiplier),
          receivingTDs: Math.round(7 * ratingMultiplier),
          rushingYards: Math.round(50 * ratingMultiplier),
          rushingTDs: Math.round(0.5 * ratingMultiplier)
        }
      };
    
    case 'TE':
      return {
        points: Math.round(140 * ratingMultiplier),
        stats: {
          receptions: Math.round(40 * ratingMultiplier),
          receivingYards: Math.round(500 * ratingMultiplier),
          receivingTDs: Math.round(5 * ratingMultiplier)
        }
      };
    
    case 'K':
      return {
        points: Math.round(120 * ratingMultiplier),
        stats: {
          fieldGoalsMade: Math.round(20 * ratingMultiplier),
          fieldGoalAttempts: Math.round(25 * ratingMultiplier),
          extraPointsMade: Math.round(35 * ratingMultiplier),
          extraPointAttempts: Math.round(37 * ratingMultiplier)
        }
      };
    
    default:
      return {
        points: Math.round(100 * ratingMultiplier),
        stats: {}
      };
  }
}

function calculateADP(position: string, rating: number, index: number): number {
  // Position value multipliers (QBs typically go later in CFB)
  const positionMultipliers: Record<string, number> = {
    'RB': 1.0,
    'WR': 1.1,
    'QB': 1.3,
    'TE': 1.5,
    'K': 2.0
  };
  
  const multiplier = positionMultipliers[position] || 1.5;
  const ratingFactor = (99 - rating) / 20; // Higher rating = lower ADP
  
  // Base ADP on index, then adjust by position and rating
  return Math.round((index + 1) * multiplier + ratingFactor * 10);
}
