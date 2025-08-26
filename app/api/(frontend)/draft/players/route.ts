import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

function cleanName(name: string): string {
  return name.replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const conference = searchParams.get('conference');
    const team = searchParams.get('team');
    const school = searchParams.get('school');
    const search = searchParams.get('search');
    const top200 = searchParams.get('top200') === 'true'; // New: Top 200 players
    const orderBy = searchParams.get('orderBy') || 'projection'; // Default to projection ordering
    const seasonParam = searchParams.get('season');
    const season = seasonParam ? parseInt(seasonParam, 10) : new Date().getFullYear();
    const prevSeason = season - 1;
    const maxCount = top200 ? 200 : 10000; // Allow up to 10,000 players (all players)
    const requestedLimit = parseInt(searchParams.get('limit') || `${maxCount}`, 10);
    const limit = Math.min(requestedLimit, maxCount);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const leagueId = searchParams.get('leagueId');

    // If a leagueId is provided and the league is conference-mode, force conference filter
    let enforcedConference: string | null = null;
    if (!conference && leagueId) {
      try {
        const league = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          leagueId
        );
        const mode = (league as any).gameMode || (league as any).mode;
        const selectedConf = (league as any).selectedConference || (league as any).conf;
        if (String(mode).toLowerCase() === 'conference' && selectedConf) {
          enforcedConference = String(selectedConf);
        }
      } catch (e) {
        // Best-effort; continue without enforcement on failure
        console.warn('Failed to load league for conference enforcement', e);
      }
    }

    // Build queries based on search type
    const queries: any[] = [
      Query.limit(limit), 
      Query.offset(offset)
    ];

    // Note: 'draftable' attribute doesn't exist in schema, so we skip this filter
    // queries.push(Query.equal('draftable', true));
    
    // Only add conference filter if not searching for ALL or specific conference
    if (!conference && !enforcedConference) {
      const power4 = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
      queries.push(Query.equal('conference', power4 as any));
    }

    // Add position filter
    const allowedPositions = ['QB', 'RB', 'WR', 'TE', 'K'];
    if (position && position !== 'ALL') {
      queries.push(Query.equal('position', position));
    } else if (top200) {
      // For top 200, limit to fantasy positions only
      queries.push(Query.equal('position', allowedPositions as any));
    }

    // Add conference filter if specified
    if (conference || enforcedConference) {
      queries.push(Query.equal('conference', (conference || enforcedConference)!));
    }

    // Add team/school filter if specified (prefer team; fallback to school)
    if (team) {
      queries.push(Query.equal('team', team));
    } else if (school) {
      queries.push(Query.equal('team', school));
    }

    // Add search filter if specified
    if (search) {
      queries.push(Query.search('name', search));
    }

    // Handle ordering based on search type
    // Always default to projection-based ordering for consistency
    if (orderBy === 'name') {
      queries.push(Query.orderAsc('name'));
    } else {
      // Default: Order by fantasyPoints descending (highest projections first)
      queries.push(Query.orderDesc('fantasyPoints'));
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
      } else if (school) {
        // Try school field in fallback
        fallbackQueries.push(Query.equal('school', school));
      }
      
      // Simple ordering for fallback
      fallbackQueries.push(Query.orderDesc('fantasyPoints'));
      
      response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        fallbackQueries
      );
    }

    // Debug: Check what conferences and teams we actually have
    const uniqueTeams = new Set(response.documents?.map((p: any) => p.team || p.school) || []);
    const uniqueConferences = new Set(response.documents?.map((p: any) => p.conference) || []);
    
    // If a school was specified, defensively filter results client-side to that school/team name
    if (school) {
      const schoolLc = school.toLowerCase();
      response.documents = (response.documents as any[]).filter((p: any) => {
        const t = (p.team || '').toString().toLowerCase();
        const s = (p.school || '').toString().toLowerCase();
        return t === schoolLc || s === schoolLc;
      });
      response.total = response.documents.length;
    }
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
    let fantasyTeamIdToName: Record<string, string> = {};
    let depth: any = null; // Declare depth in outer scope
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
      depth = doc?.depth_chart_json;
      if (typeof depth === 'string') {
        try { 
          depth = JSON.parse(depth);
          // Convert compact format back to full format if needed
          if (depth && typeof depth === 'object') {
            for (const [fantasyTeamId, positions] of Object.entries(depth)) {
              for (const [pos, players] of Object.entries(positions as any)) {
                if (Array.isArray(players) && players.length > 0 && typeof players[0] === 'string') {
                  // Convert "name:rank" format back to object format
                  (depth[fantasyTeamId] as any)[pos] = players.map((p: string) => {
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
        // Load team map to translate teamId -> team name
        try {
          const file = path.join(process.cwd(), 'data/teams_map.json');
          if (fs.existsSync(file)) {
            const map = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
            // invert
            for (const [name, id] of Object.entries(map)) {
              fantasyTeamIdToName[id] = name;
            }
          }
        } catch {}
        for (const [fantasyTeamId, posMap] of Object.entries(depth)) {
          for (const pos of Object.keys(posMap as any)) {
            const arr = (posMap as any)[pos] as Array<any>;
            if (!Array.isArray(arr)) continue;
            for (const entry of arr) {
              const key = `${(entry.player_name || '').toString().trim().toLowerCase()}|${pos}`;
              depthIndex.set(key, fantasyTeamId);
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

    // Enhanced player transformation - uses pipeline-calculated projections
    let players = response.documents.map((player: any, index: number) => {
      const position = player.position || 'RB';
      const conference = player.conference || 'Other';
      const rating = player.fantasyPoints ? Math.min(99, Math.round(60 + (player.fantasyPoints / 10))) : 80;
      
      // Use fantasyPoints from database (calculated by comprehensive pipeline)
      // Pipeline includes: pace, efficiency, depth charts, usage priors, injury risk, NFL draft capital
      const fantasyPoints = player.fantasyPoints || 0;
      
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
        // Comprehensive projections from database
        projections: (() => {
          // Parse statline from projection pipeline if available
          let statline: any = {};
          try {
            if (player.statline_simple_json) {
              statline = JSON.parse(player.statline_simple_json);
            }
          } catch {}
          
          // If no detailed statline, generate reasonable estimates based on position and points
          if (!statline.pass_yards && !statline.rush_yards && !statline.rec_yards && fantasyPoints > 0) {
            if (position === 'QB') {
              const passYards = Math.round(fantasyPoints * 6.25); // ~250 pass yards per 40 pts
              const passTDs = Math.round(fantasyPoints / 20); // ~1 TD per 20 pts
              const rushYards = Math.round(fantasyPoints * 0.5); // Some rushing yards
              statline = {
                pass_yards: passYards,
                pass_tds: passTDs,
                rush_yards: rushYards,
                rush_tds: Math.round(passTDs * 0.2),
                rec_yards: 0,
                rec_tds: 0,
                receptions: 0
              };
            } else if (position === 'RB') {
              const rushYards = Math.round(fantasyPoints * 5); // ~100 rush yards per 20 pts
              const rushTDs = Math.round(fantasyPoints / 30); // ~1 TD per 30 pts
              statline = {
                pass_yards: 0,
                pass_tds: 0,
                rush_yards: rushYards,
                rush_tds: rushTDs,
                rec_yards: Math.round(fantasyPoints * 2),
                rec_tds: Math.round(rushTDs * 0.3),
                receptions: Math.round(fantasyPoints / 8)
              };
            } else if (position === 'WR' || position === 'TE') {
              const recYards = Math.round(fantasyPoints * 4); // ~80 rec yards per 20 pts
              const receptions = Math.round(fantasyPoints / 3); // ~6-7 catches per 20 pts
              statline = {
                pass_yards: 0,
                pass_tds: 0,
                rush_yards: position === 'WR' ? Math.round(fantasyPoints * 0.2) : 0,
                rush_tds: 0,
                rec_yards: recYards,
                rec_tds: Math.round(fantasyPoints / 35),
                receptions: receptions
              };
            }
          }
          
          return {
            season: {
              total: fantasyPoints,
              passing: statline.pass_yards || 0,
              rushing: statline.rush_yards || 0,
              receiving: statline.rec_yards || 0,
              touchdowns: (statline.pass_tds || 0) + (statline.rush_tds || 0) + (statline.rec_tds || 0),
              fieldGoals: 0,
              extraPoints: 0
            },
            perGame: {
              points: (fantasyPoints / 12).toFixed(1)
            }
          };
        })(),
        // Additional stats for better context
        prevSeasonStats: {
          games: player.games_played || 0,
          touchdowns: player.touchdowns || 0,
          yards: player.total_yards || 0,
          passingYards: player.passing_yards || 0,
          rushingYards: player.rushing_yards || 0,
          receivingYards: player.receiving_yards || 0
        }
      };
    });

    // Dedupe by name+position keeping the most recent season/team variant
    const byKey = new Map<string, any>();
    for (const p of players) {
      const key = `${(p.name || '').toLowerCase()}|${(p.position || '').toUpperCase()}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, p);
        continue;
      }
      // Transfer portal preference: known current teams take priority
      const knownTransfers: Record<string, string> = {
        'carson beck': 'Miami',
        'jackson arnold': 'Auburn',
        'trevor etienne': 'Florida',
        'gavin sawchuk': 'Florida State',
        'squirrel white': 'Florida State',
        'evan stewart': 'Oregon',
        'nico iamaleava': 'UCLA'
      };
      
      const playerNameLower = (p.name || '').toLowerCase();
      const preferredTeam = knownTransfers[playerNameLower];
      
      let better = existing;
      if (preferredTeam) {
        // If we know the correct team, prefer that one
        if (p.team === preferredTeam) better = p;
        else if (existing.team === preferredTeam) better = existing;
      } else {
        // Fallback: prefer higher projected points, or newer entry if tied
        if ((p.projectedPoints || 0) > (existing.projectedPoints || 0)) {
          better = p;
        } else if ((p.projectedPoints || 0) === (existing.projectedPoints || 0)) {
          // If tied, prefer the one with more recent season or non-SEC (likely more up to date)
          better = p; // Default to newer entry
        }
      }
      byKey.set(key, better);
    }
    players = Array.from(byKey.values());

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      message: errorMessage,
      database: DATABASE_ID,
      collection: COLLECTIONS.PLAYERS || 'college_players',
      error: error
    };
    console.error('Draft players API error details:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch players',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

// PROJECTIONS: Now handled entirely by comprehensive pipeline scripts
// Data flow: functions/project-yearly-simple/ → college_players.fantasyPoints → API → UI
// Pipeline includes: team pace, efficiency, depth charts, usage priors, injury risk, NFL draft capital

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

