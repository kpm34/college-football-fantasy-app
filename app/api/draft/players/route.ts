import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const conference = searchParams.get('conference');
    const team = searchParams.get('team');
    const search = searchParams.get('search');
    const top200 = searchParams.get('top200') === 'true'; // New: Top 200 players
    const orderBy = searchParams.get('orderBy') || 'rating'; // New: projection, rating, name
    const seasonParam = searchParams.get('season');
    const season = seasonParam ? parseInt(seasonParam, 10) : new Date().getFullYear();
    const prevSeason = season - 1;
    const maxCount = top200 ? 200 : 1000; // Limit to 200 for top players
    const requestedLimit = parseInt(searchParams.get('limit') || `${maxCount}`, 10);
    const limit = Math.min(requestedLimit, maxCount);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build queries based on search type
    const queries: any[] = [
      Query.limit(limit), 
      Query.offset(offset)
    ];

    // Add position filter
    const allowedPositions = ['QB', 'RB', 'WR', 'TE', 'K'];
    if (position && position !== 'ALL') {
      queries.push(Query.equal('position', position));
    } else if (top200) {
      // For top 200, limit to fantasy positions only
      queries.push(Query.equal('position', allowedPositions as any));
    }

    // Add conference filter if specified
    if (conference) {
      queries.push(Query.equal('conference', conference));
    }

    // Add team filter if specified
    if (team) {
      queries.push(Query.equal('team', team));
    }

    // Add search filter if specified
    if (search) {
      queries.push(Query.search('name', search));
    }

    // Handle ordering based on search type
    if (top200 || orderBy === 'projection') {
      // For top 200 or projection ordering, try fantasy_points first
      try {
        queries.push(Query.orderDesc('fantasy_points'));
      } catch {
        // Fallback to rating if fantasy_points doesn't exist
        queries.push(Query.orderDesc('rating'));
      }
    } else if (orderBy === 'rating') {
      queries.push(Query.orderDesc('rating'));
    } else if (orderBy === 'name') {
      queries.push(Query.orderAsc('name'));
    } else {
      // Default: Use randomized offset for variety (existing behavior)
      const randomOffset = Math.floor(Date.now() / 1000 / 60) % 500;
      const adjustedOffset = offset + randomOffset;
      queries[1] = Query.offset(adjustedOffset);
      queries.push(Query.orderAsc('name'));
    }

    console.log('Draft players API - Simplified queries:', queries.map(q => q.toString()));

    // Fetch players from Appwrite with minimal filtering
    let response;
    try {
      response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        queries
      );
    } catch (error) {
      console.warn('Primary query failed, trying with simpler fallback:', error);
      // Fallback to simpler query if indexes don't exist
      const fallbackQueries = [
        Query.limit(limit), 
        Query.offset(offset)
      ];
      
      // Add basic filters in fallback
      if (position && position !== 'ALL') {
        fallbackQueries.push(Query.equal('position', position));
      } else if (top200) {
        fallbackQueries.push(Query.equal('position', allowedPositions as any));
      }
      
      if (conference) {
        fallbackQueries.push(Query.equal('conference', conference));
      }
      
      if (team) {
        fallbackQueries.push(Query.equal('team', team));
      }
      
      // Simple ordering for fallback
      fallbackQueries.push(Query.orderDesc('rating'));
      
      response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        fallbackQueries
      );
    }

    // Debug: Check what conferences and teams we actually have
    const uniqueTeams = new Set(response.documents?.map((p: any) => p.team || p.school) || []);
    const uniqueConferences = new Set(response.documents?.map((p: any) => p.conference) || []);
    
    console.log('Draft players API - Response:', {
      total: response.total,
      documentsLength: response.documents?.length,
      firstPlayer: response.documents?.[0]?.name || 'none',
      firstPlayerTeam: response.documents?.[0]?.team || 'none',
      firstPlayerPosition: response.documents?.[0]?.position || 'none',
      collection: COLLECTIONS.PLAYERS || 'college_players',
      database: DATABASE_ID,
      uniqueTeamsCount: uniqueTeams.size,
      uniqueConferencesCount: uniqueConferences.size,
      conferences: Array.from(uniqueConferences),
      sampleTeams: Array.from(uniqueTeams).slice(0, 10)
    });

    // Return early if we have no documents to debug the issue
    if (!response.documents || response.documents.length === 0) {
      console.error('No players found in database');
      return NextResponse.json({
        success: false,
        error: 'No players found in database',
        debug: {
          total: response.total,
          collection: COLLECTIONS.PLAYERS || 'college_players',
          database: DATABASE_ID
        }
      });
    }

    // Optional: load manual overrides from model_inputs to correct teams/draftable flags
    let overrides: Record<string, any> | null = null;
    let depthIndex: Map<string, string> | null = null; // name|pos -> team_id
    let teamIdToName: Record<string, string> = {};
    // Note: do not use CFBD here; rely solely on our database (depth_chart_json + overrides)
    try {
      const mi = await databases.listDocuments(
        DATABASE_ID,
        (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs',
        [Query.equal('season', season), Query.limit(1)]
      );
      const doc = mi.documents?.[0];
      overrides = (doc?.manual_overrides_json as any) || null;
      // Build depth index for additional correction
      let depth: any = doc?.depth_chart_json;
      if (typeof depth === 'string') {
        try { 
          depth = JSON.parse(depth);
          // Convert compact format back to full format if needed
          if (depth && typeof depth === 'object') {
            for (const [teamId, positions] of Object.entries(depth)) {
              for (const [pos, players] of Object.entries(positions as any)) {
                if (Array.isArray(players) && players.length > 0 && typeof players[0] === 'string') {
                  // Convert "name:rank" format back to object format
                  (depth[teamId] as any)[pos] = players.map((p: string) => {
                    const [name, rank] = p.split(':');
                    return { player_name: name, pos_rank: parseInt(rank) || 1 };
                  });
                }
              }
            }
          }
        } catch {}
      }
      if (depth && typeof depth === 'object') {
        depthIndex = new Map<string, string>();
        // Load team map to translate team_id -> team name
        try {
          const file = path.join(process.cwd(), 'data/teams_map.json');
          if (fs.existsSync(file)) {
            const map = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
            // invert
            for (const [name, id] of Object.entries(map)) {
              teamIdToName[id] = name;
            }
          }
        } catch {}
        for (const [teamId, posMap] of Object.entries(depth)) {
          for (const pos of Object.keys(posMap as any)) {
            const arr = (posMap as any)[pos] as Array<any>;
            if (!Array.isArray(arr)) continue;
            for (const entry of arr) {
              const key = `${(entry.player_name || '').toString().trim().toLowerCase()}|${pos}`;
              depthIndex.set(key, teamId);
            }
          }
        }
      }
    } catch {
      // best-effort only
    }

    // (Removed CFBD roster supplement.)

    // Known quick-fix overrides for urgent corrections without waiting on DB sync
    function getKnownFixes(y: number) {
      const lower = (s: string) => (s || '').toLowerCase();
      const byNamePosTeam: Record<string, string> = {};
      const nonDraftableByNamePos = new Set<string>();
      if (y === 2025) {
        // User-reported corrections
        nonDraftableByNamePos.add('quinn ewers|qb'); // graduated / not in pool
        byNamePosTeam['carson beck|qb'] = 'Miami'; // transferred per user
      }
      return { byNamePosTeam, nonDraftableByNamePos };
    }
    const known = getKnownFixes(season);

    // Enhanced player transformation with better projections
    let players = response.documents.map((player: any, index: number) => {
      // Use existing projection field first, then calculate if needed
      const position = player.position || 'RB';
      const conference = player.conference || 'Other';
      const rating = player.rating || player.ea_rating || 80;
      
      // Priority order for projections:
      // 1. Existing projection field (most accurate)
      // 2. Fantasy_points field 
      // 3. Calculated projection
      let fantasyPoints = player.projection || player.fantasy_points;
      if (!fantasyPoints || fantasyPoints <= 0) {
        fantasyPoints = calculateProjection(position, rating);
      }
      
      return {
        id: player.$id,
        name: player.name || 'Unknown Player',
        position: position,
        team: player.team || player.school || 'Unknown Team',
        conference: player.conference || 'Unknown',
        year: player.year || 'JR',
        height: player.height || '6-0',
        weight: player.weight || 200,
        projectedPoints: Math.round(fantasyPoints),
        adp: calculateADP(position, rating, index),
        draftable: player.draftable !== false,
        rating: rating,
        // Additional stats for better projections
        prevSeasonStats: {
          games: player.games_played || 0,
          touchdowns: player.touchdowns || 0,
          yards: player.total_yards || 0
        }
      };
    });

    // If this is a top 200 or projection-ordered search, sort by projections
    if (top200 || orderBy === 'projection') {
      players.sort((a, b) => b.projectedPoints - a.projectedPoints);
      // Limit to exactly 200 for top200 searches
      if (top200) {
        players = players.slice(0, 200);
      }
    }

    return NextResponse.json({
      success: true,
      players: players,
      total: players.length,
      debug: {
        originalTotal: response.total,
        filteredCount: players.length
      }
    });

  } catch (error) {
    console.error('Error fetching draft players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// Helper function to calculate fantasy point projections for the API
function calculateProjection(position: string, rating: number): number {
  // Use existing projection if available, otherwise calculate
  const ratingMultiplier = Math.max(0.5, (rating || 80) / 80); // Minimum 50% of base
  
  const baseProjections: Record<string, number> = {
    'QB': 280,  // Top QBs: 320+ pts (Arch Manning, Quinn Ewers)
    'RB': 220,  // Top RBs: 260+ pts (Top conference RBs)
    'WR': 200,  // Top WRs: 240+ pts (Ryan Williams, etc.)
    'TE': 160,  // Top TEs: 190+ pts (College TEs less fantasy relevant)
    'K': 140    // Kickers: 120-160 pts range
  };
  
  const baseProjection = baseProjections[position] || 180;
  
  // Add position-specific variance based on conference strength
  const conferenceMultipliers: Record<string, number> = {
    'SEC': 1.15,      // SEC gets 15% boost
    'Big Ten': 1.10,  // Big Ten gets 10% boost  
    'Big 12': 1.05,   // Big 12 gets 5% boost
    'ACC': 1.02       // ACC gets 2% boost
  };
  
  return Math.round(baseProjection * ratingMultiplier);
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

// Heuristic depth multipliers so only likely starters project as full volume
function depthMultiplier(position: string, rank: number): number {
  const r = Math.max(1, rank);
  switch (position) {
    case 'QB':
      // Only one starter; backups have negligible projection
      return [1.0, 0.25, 0.08, 0.03, 0.01][r - 1] ?? 0.01;
    case 'RB':
      // Committees are common
      return [1.0, 0.6, 0.4, 0.25, 0.15][r - 1] ?? 0.1;
    case 'WR':
      // 3 WR sets
      return [1.0, 0.8, 0.6, 0.35, 0.2][r - 1] ?? 0.15;
    case 'TE':
      return [1.0, 0.35, 0.15][r - 1] ?? 0.1;
    case 'K':
      return [1.0, 0.2][r - 1] ?? 0.1;
    default:
      return 1.0;
  }
}
