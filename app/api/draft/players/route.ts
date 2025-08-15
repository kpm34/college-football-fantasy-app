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
    const seasonParam = searchParams.get('season');
    const season = seasonParam ? parseInt(seasonParam, 10) : new Date().getFullYear();
    const prevSeason = season - 1;
    const maxCount = 1000;
    const requestedLimit = parseInt(searchParams.get('limit') || `${maxCount}`, 10);
    const limit = Math.min(requestedLimit, maxCount);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build queries
    const queries: any[] = [Query.limit(limit), Query.offset(offset)];
    const allowedPositions = ['QB', 'RB', 'WR', 'TE', 'K'];

    // Only add Power 4 conferences, but avoid strict dependency if index is missing
    const power4Conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    if (conference && power4Conferences.includes(conference)) {
      queries.push(Query.equal('conference', conference));
    } else if (!conference) {
      // Prefer Power 4 but we will gracefully fallback to all on empty result
      try { queries.push(Query.equal('conference', power4Conferences as any)); } catch {}
    }

    // Filter to fantasy positions by default
    if (position && position !== 'ALL') {
      queries.push(Query.equal('position', position));
    } else {
      queries.push(Query.equal('position', allowedPositions as any));
    }

    if (team) {
      queries.push(Query.equal('team', team));
    }

    if (search) {
      // name search requires fulltext index; attempt but tolerate failures
      queries.push(Query.search('name', search));
    }

    // Power 4 and current season when available (we'll decide draftable from roster/depth later)
    try { queries.push(Query.equal('power_4', true)); } catch {}
    try { queries.push(Query.equal('season', season)); } catch {}

    // Fetch players from Appwrite
    let response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYERS || 'college_players',
      queries
    );

    // If no data returned (or minimal), try a relaxed query without conference filter/search/sort
    if (!response.documents || response.documents.length < 5) {
      const relaxed = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [Query.limit(limit), Query.offset(offset)]
      );
      if (relaxed.documents && relaxed.documents.length > response.documents.length) {
        response = relaxed;
      }
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
        try { depth = JSON.parse(depth); } catch {}
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

    // Transform players for draft UI
    // Build a team-position depth map to apply depth-based projection multipliers
    const depthMap = new Map<string, number>();
    const makeKey = (team: string, pos: string) => `${(team || '').toLowerCase()}|${(pos || '').toLowerCase()}`;

    let players = response.documents.map((player: any, index: number) => {
      // Calculate basic projections based on position and rating
      const positionValue = player.position || player.pos || 'WR';
      const ratingValue = player.rating ?? player.ea_rating ?? 80;
      const baseProjection = calculateBaseProjection(positionValue, ratingValue);
      
      // Apply manual override if present for this player id
      const override = overrides ? overrides[player.$id] : null;
      const teamOverride = override?.team || override?.team_name || override?.team_id;
      const draftableOverride = typeof override?.draftable === 'boolean' ? override?.draftable : undefined;
      // Depth-based correction if available and no explicit override
      let correctedTeam = teamOverride || player.team || player.school;
      if (!teamOverride && depthIndex) {
        const key = `${(player.name || `${player.firstName ?? ''} ${player.lastName ?? ''}`.trim()).toLowerCase()}|${positionValue}`;
        const teamId = depthIndex.get(key);
        if (teamId) {
          const name = teamIdToName[teamId];
          if (name) correctedTeam = name;
        }
      }
      // Only manual overrides + depth corrections are used

      return {
        id: player.$id,
        cfbd_id: player.cfbd_id || player.cfbdId,
        name: player.name || `${player.firstName ?? ''} ${player.lastName ?? ''}`.trim(),
        position: positionValue,
        team: correctedTeam,
        team_abbreviation: player.team_abbreviation || player.abbreviation,
        conference: player.conference || player.conf || 'ALL',
        year: player.year || 'JR',
        height: player.height || '6-0',
        weight: typeof player.weight === 'string' ? parseInt(player.weight, 10) : (player.weight ?? 200),
        rating: ratingValue,
        // Calculate ADP based on rating and position
        adp: calculateADP(positionValue, ratingValue, index),
        projectedPoints: baseProjection.points,
        projectedStats: baseProjection.stats,
        draftable: (draftableOverride !== undefined ? draftableOverride : player.draftable),
        power_4: player.power_4
      };
    });

    // Enforce final filters client-side as safety net
    const localNormalize = (s: string | undefined | null) => (s || '').trim().toLowerCase();
    const onDepth = (p: any) => {
      if (!depthIndex) return false;
      const key = `${localNormalize(p.name)}|${p.position}`;
      return depthIndex.has(key);
    };
    // Keep players explicitly draftable OR present on current depth chart
    players = players.filter((p: any) => p.draftable === true || onDepth(p));
    players = players.filter((p: any) => allowedPositions.includes(p.position));
    players = players.filter((p: any) => !conference || power4Conferences.includes(p.conference));

    // Sort by rating desc and cap to top N to limit compute
    players.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    players = players.slice(0, maxCount);

    // Apply depth multiplier per team/position
    for (const p of players) {
      const key = makeKey(p.team, p.position);
      const depth = (depthMap.get(key) ?? 0) + 1;
      depthMap.set(key, depth);
      const mult = depthMultiplier(p.position, depth);
      p.projectedPoints = Math.round(p.projectedPoints * mult);
      // Optionally scale select stats if present
      if (p.projectedStats) {
        Object.keys(p.projectedStats).forEach((k) => {
          const val = (p.projectedStats as any)[k];
          if (typeof val === 'number') (p.projectedStats as any)[k] = Math.round(val * mult);
        });
      }
    }

    // Strength of Schedule multiplier per team using games collection
    try {
      const gamesRes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES || 'games',
        [Query.limit(1000)]
      );
      const teamDifficulty = new Map<string, number>();
      const teamGames = new Map<string, number>();
      for (const g of gamesRes.documents || []) {
        const homeTeam = g.homeTeam || g.home_team;
        const awayTeam = g.awayTeam || g.away_team;
        const homeRanked = Boolean(g.homeTeamRanked || g.home_ranked || false);
        const awayRanked = Boolean(g.awayTeamRanked || g.away_ranked || false);
        const isConf = Boolean(g.isConferenceGame || g.conferenceGame || false);
        if (homeTeam && awayTeam) {
          // Home team faces away opponent
          const inc = (awayRanked ? 1 : 0) + (isConf ? 0.3 : 0);
          teamDifficulty.set(homeTeam, (teamDifficulty.get(homeTeam) || 0) + inc);
          teamGames.set(homeTeam, (teamGames.get(homeTeam) || 0) + 1);
          // Away team faces home opponent
          const inc2 = (homeRanked ? 1 : 0) + (isConf ? 0.3 : 0);
          teamDifficulty.set(awayTeam, (teamDifficulty.get(awayTeam) || 0) + inc2);
          teamGames.set(awayTeam, (teamGames.get(awayTeam) || 0) + 1);
        }
      }
      // Normalize to [0.9, 1.1] multiplier range
      let minD = Infinity, maxD = -Infinity;
      const avgPerGame: Map<string, number> = new Map();
      for (const [teamName, dTotal] of teamDifficulty.entries()) {
        const games = teamGames.get(teamName) || 1;
        const perGame = dTotal / games;
        avgPerGame.set(teamName, perGame);
        if (perGame < minD) minD = perGame;
        if (perGame > maxD) maxD = perGame;
      }
      const spread = Math.max(0.0001, maxD - minD);
      for (const p of players) {
        const perGame = avgPerGame.get(p.team);
        if (perGame !== undefined) {
          const normalized = (perGame - minD) / spread; // 0..1
          const sosMult = 0.9 + normalized * 0.2; // 0.9..1.1
          p.projectedPoints = Math.round(p.projectedPoints * sosMult);
          if (p.projectedStats) {
            Object.keys(p.projectedStats).forEach((k) => {
              const val = (p.projectedStats as any)[k];
              if (typeof val === 'number') (p.projectedStats as any)[k] = Math.round(val * sosMult);
            });
          }
        }
      }
    } catch {
      // If games not available, skip SoS adjustment
    }

    // Previous-year stats multiplier using player_stats (batched)
    try {
      const ids = players.map((p) => p.id);
      // Appwrite supports array values in equal
      const statsRes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYER_STATS || 'player_stats',
        [Query.equal('season', prevSeason), Query.equal('player_id', ids), Query.limit(10000)]
      );
      const agg: Map<string, { passY: number; passTD: number; passINT: number; rushY: number; rushTD: number; rec: number; recY: number; recTD: number }>
        = new Map();
      for (const s of statsRes.documents || []) {
        const pid = s.player_id || s.playerId || s.playerID || s.player; // tolerate variants
        if (!pid) continue;
        const cur = agg.get(pid) || { passY: 0, passTD: 0, passINT: 0, rushY: 0, rushTD: 0, rec: 0, recY: 0, recTD: 0 };
        cur.passY += Number(s.passing_yards || s.passingYards || 0);
        cur.passTD += Number(s.passing_tds || s.passingTDs || 0);
        cur.passINT += Number(s.interceptions || s.passing_ints || s.interceptionsThrown || 0);
        cur.rushY += Number(s.rushing_yards || s.rushingYards || 0);
        cur.rushTD += Number(s.rushing_tds || s.rushingTDs || 0);
        cur.rec += Number(s.receptions || s.catches || 0);
        cur.recY += Number(s.receiving_yards || s.receivingYards || 0);
        cur.recTD += Number(s.receiving_tds || s.receivingTDs || 0);
        agg.set(pid, cur);
      }
      // Compute fantasy-ish points and normalize by position baselines
      for (const p of players) {
        const a = agg.get(p.id);
        if (!a) continue;
        // Simple scoring: 1/25 passY, 4 passTD, -2 INT, 1/10 rushY, 6 rushTD, 1 rec, 1/10 recY, 6 recTD
        const prevPts = (a.passY / 25) + (a.passTD * 4) - (a.passINT * 2)
          + (a.rushY / 10) + (a.rushTD * 6)
          + (a.rec * 1) + (a.recY / 10) + (a.recTD * 6);
        const baseline = basePointsForPosition(p.position);
        const ratio = baseline > 0 ? prevPts / baseline : 1;
        const prevMult = clamp(0.7, 1.3, ratio);
        p.projectedPoints = Math.round(p.projectedPoints * prevMult);
        if (p.projectedStats) {
          Object.keys(p.projectedStats).forEach((k) => {
            const val = (p.projectedStats as any)[k];
            if (typeof val === 'number') (p.projectedStats as any)[k] = Math.round(val * prevMult);
          });
        }
      }
    } catch {
      // If stats not available, skip previous-year adjustment
    }

    // Deduplicate by cfbd_id when available, else by normalized (name + team + position)
    const normalize = (s: string | undefined | null) => (s || '').trim().toLowerCase();
    const buildKey = (p: any) => p.cfbd_id ? `cfbd:${p.cfbd_id}` : `${normalize(p.name)}|${normalize(p.team)}|${normalize(p.position)}`;
    const dedupedMap = new Map<string, any>();
    for (const p of players) {
      const key = buildKey(p);
      const existing = dedupedMap.get(key);
      if (!existing) {
        dedupedMap.set(key, p);
      } else {
        // Keep the better candidate (higher rating, then higher projectedPoints)
        const better = (p.rating ?? 0) > (existing.rating ?? 0)
          ? p
          : (p.rating ?? 0) < (existing.rating ?? 0)
          ? existing
          : (p.projectedPoints ?? 0) >= (existing.projectedPoints ?? 0)
          ? p
          : existing;
        dedupedMap.set(key, better);
      }
    }
    // Final cap after dedupe
    let dedupedPlayers = Array.from(dedupedMap.values())
      .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, maxCount);

    // Enrich with projections_yearly when available so draft uses synced projections
    try {
      const ids: string[] = dedupedPlayers.map((p: any) => p.id).filter(Boolean);
      const chunkSize = 100;
      const projMap = new Map<string, any>();
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const projRes = await databases.listDocuments(
          DATABASE_ID,
          (COLLECTIONS as any).PROJECTIONS_YEARLY || 'projections_yearly',
          [Query.equal('season', season), Query.equal('player_id', chunk), Query.limit(1000)]
        );
        for (const d of projRes.documents || []) {
          projMap.set(d.player_id || d.playerId, d);
        }
      }
      dedupedPlayers = dedupedPlayers.map((p: any) => {
        const proj = projMap.get(p.id);
        if (!proj) return p;
        const fp = Number(proj.fantasy_points_simple || proj.range_median || p.projectedPoints || 0);
        return {
          ...p,
          projectedPoints: Math.round(fp),
          projectedStats: proj.statline_simple_json || p.projectedStats,
        };
      });
    } catch {
      // Projections might be missing early on; keep baseline
    }

    return NextResponse.json({
      success: true,
      players: dedupedPlayers,
      total: dedupedPlayers.length,
      hasMore: offset + limit < response.total // underlying total before dedupe
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
