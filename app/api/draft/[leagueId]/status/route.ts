import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '../../../../../core/repositories';
import { withErrorHandler } from '../../../../../core/utils/error-handler';
import { env } from '../../../../../core/config/environment';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) => {
  // Resolve params
  const { leagueId } = await params;
  
  // Use repositories
  const { leagues, rosters } = serverRepositories;
  
  // Get league
  const league = await leagues.findById(leagueId);
  if (!league) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  // Get draft state from Vercel KV (real-time state)
  let draftState = null;
  if (env.features.caching) {
    try {
      const { kv } = await import('@vercel/kv');
      draftState = await kv.hgetall(`draft:${leagueId}`);
    } catch (error) {
      console.warn('Failed to get draft state from KV:', error);
    }
  }

  // Get rosters to build draft order
  const { rosters: leagueRosters } = await rosters.findByLeague(leagueId, {
    orderBy: 'draftPosition',
    orderDirection: 'asc'
  });

  // Get draft picks from database
  const { Client, Databases, Query } = await import('node-appwrite');
  const client = new Client()
    .setEndpoint(env.server.appwrite.endpoint)
    .setProject(env.server.appwrite.projectId)
    .setKey(env.server.appwrite.apiKey);
  const databases = new Databases(client);

  const draftPicks = await databases.listDocuments(
    env.server.appwrite.databaseId,
    'draft_picks',
    [
      Query.equal('leagueId', [leagueId]),
      Query.orderDesc('overallPick'),
      Query.limit(500) // Get all picks
    ]
  );

  // Calculate draft progress
  const totalTeams = league.maxTeams;
  const roundsPerDraft = 16; // Standard fantasy draft rounds
  const totalPicks = totalTeams * roundsPerDraft;
  const completedPicks = draftPicks.documents.length;

  // Build drafted players map
  const draftedPlayers = new Map();
  draftPicks.documents.forEach((pick: any) => {
    draftedPlayers.set(pick.playerId, {
      teamId: pick.teamId,
      round: pick.round,
      pick: pick.pick,
      overallPick: pick.overallPick,
      playerName: pick.playerName,
      position: pick.position
    });
  });

  // Determine current pick info
  let currentRound = 1;
  let currentPick = 1;
  let currentTeamId = null;
  let pickDeadline = null;
  let isSnakeDraft = league.draftType === 'snake';

  if (draftState) {
    // Use real-time state from KV
    currentRound = draftState.currentRound as number;
    currentPick = draftState.currentPick as number;
    pickDeadline = draftState.pickDeadline as string;
    
    // Determine current team based on snake draft logic
    const pickInRound = ((currentPick - 1) % totalTeams);
    const isEvenRound = currentRound % 2 === 0;
    const index = isSnakeDraft && isEvenRound 
      ? totalTeams - 1 - pickInRound 
      : pickInRound;
    currentTeamId = leagueRosters[index]?.$id;
  } else {
    // Calculate from completed picks
    if (completedPicks > 0) {
      currentRound = Math.floor(completedPicks / totalTeams) + 1;
      currentPick = (completedPicks % totalTeams) + 1;
    }
    
    // Set current team
    const pickInRound = ((currentPick - 1) % totalTeams);
    const isEvenRound = currentRound % 2 === 0;
    const index = isSnakeDraft && isEvenRound 
      ? totalTeams - 1 - pickInRound 
      : pickInRound;
    currentTeamId = leagueRosters[index]?.$id;
  }

  // Get recent picks for activity feed
  const recentPicks = draftPicks.documents.slice(0, 5).map((pick: any) => ({
    id: pick.$id,
    teamId: pick.teamId,
    playerId: pick.playerId,
    playerName: pick.playerName,
    position: pick.position,
    round: pick.round,
    pick: pick.pick,
    overallPick: pick.overallPick,
    timestamp: pick.timestamp
  }));

  // Build response
  const response = {
    league: {
      id: league.$id,
      name: league.name,
      status: league.status,
      draftType: league.draftType,
      maxTeams: league.maxTeams,
      currentTeams: league.currentTeams
    },
    draft: {
      status: league.status === 'drafting' ? 'active' : league.status,
      currentRound,
      currentPick,
      totalRounds: roundsPerDraft,
      totalPicks,
      completedPicks,
      progress: (completedPicks / totalPicks) * 100,
      isSnakeDraft,
      pickTimeSeconds: league.pickTimeSeconds
    },
    currentTurn: {
      teamId: currentTeamId,
      teamName: leagueRosters.find(r => r.$id === currentTeamId)?.teamName,
      pickDeadline,
      timeRemaining: pickDeadline 
        ? Math.max(0, Math.floor((new Date(pickDeadline).getTime() - Date.now()) / 1000))
        : league.pickTimeSeconds
    },
    teams: leagueRosters.map(roster => ({
      id: roster.$id,
      name: roster.teamName,
      abbreviation: roster.abbreviation,
      draftPosition: roster.draftPosition,
      picks: roster.players.length
    })),
    draftedPlayers: Array.from(draftedPlayers.entries()).map(([playerId, info]) => ({
      playerId,
      ...info
    })),
    recentPicks,
    lastUpdated: new Date().toISOString()
  };

  // Cache the response for 5 seconds
  const cacheControl = league.status === 'drafting' 
    ? 'public, max-age=5, s-maxage=5' 
    : 'public, max-age=60, s-maxage=60';

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': cacheControl
    }
  });
});