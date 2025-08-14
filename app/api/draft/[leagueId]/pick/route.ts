import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '../../../../../core/repositories';
import { withErrorHandler } from '../../../../../core/utils/error-handler';
import { ValidationError, ForbiddenError } from '../../../../../core/errors/app-error';
import { ID } from 'appwrite';
import { env } from '../../../../../core/config/environment';

interface DraftPickRequest {
  playerId: string;
  teamId: string;
}

export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) => {
  // Resolve params
  const { leagueId } = await params;
  
  // Check authentication
  const sessionCookie = request.cookies.get('appwrite-session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get user
  const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
  const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
    headers: {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0',
      'Cookie': cookieHeader,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const user = await userResponse.json();
  const { playerId, teamId }: DraftPickRequest = await request.json();

  // Validate request
  if (!playerId || !teamId) {
    throw new ValidationError('Missing required fields: playerId and teamId');
  }

  // Use repositories
  const { leagues, rosters, players } = serverRepositories;

  // Get league and validate draft status
  const league = await leagues.findById(leagueId);
  if (!league) {
    throw new ValidationError('League not found');
  }

  if (league.status !== 'drafting') {
    throw new ValidationError('Draft is not active');
  }

  // Get user's roster
  const roster = await rosters.findById(teamId);
  if (!roster) {
    throw new ValidationError('Team not found');
  }

  if (roster.userId !== user.$id) {
    throw new ForbiddenError('Not your team');
  }

  if (roster.leagueId !== leagueId) {
    throw new ValidationError('Team not in this league');
  }

  // Verify player is available
  const player = await players.findById(playerId);
  if (!player) {
    throw new ValidationError('Player not found');
  }

  // Check if player is already drafted (using repository method)
  const draftedPlayers = await getDraftedPlayers(leagueId);
  if (draftedPlayers.has(playerId)) {
    throw new ValidationError('Player already drafted');
  }

  // Get draft state from Vercel KV (if available)
  let draftState = null;
  if (env.features.caching) {
    try {
      const { kv } = await import('@vercel/kv');
      draftState = await kv.hgetall(`draft:${leagueId}`);
    } catch (error) {
      console.warn('Failed to get draft state from KV:', error);
    }
  }

  // Verify it's this team's turn
  if (draftState) {
    const currentTeamId = draftState.draftOrder[draftState.currentPick - 1];
    if (currentTeamId !== teamId) {
      throw new ValidationError('Not your turn to pick');
    }

    // Check pick timer
    const pickDeadline = new Date(draftState.pickDeadline as string);
    if (new Date() > pickDeadline) {
      // Auto-pick would happen here in production
      console.warn('Pick time exceeded, but allowing pick anyway');
    }
  }

  // Create draft pick document using raw Appwrite for now
  // (In future, create DraftPickRepository)
  const { Client, Databases } = await import('node-appwrite');
  const client = new Client()
    .setEndpoint(env.server.appwrite.endpoint)
    .setProject(env.server.appwrite.projectId)
    .setKey(env.server.appwrite.apiKey);
  const databases = new Databases(client);

  const draftPick = await databases.createDocument(
    env.server.appwrite.databaseId,
    'draft_picks',
    ID.unique(),
    {
      leagueId,
      teamId,
      rosterId: roster.$id,
      playerId,
      playerName: player.name,
      position: player.position,
      round: draftState?.currentRound || 1,
      pick: draftState?.currentPick || 1,
      overallPick: draftState?.totalPicks ? draftState.totalPicks + 1 : 1,
      timestamp: new Date().toISOString()
    }
  );

  // Add player to roster
  await rosters.addPlayer(roster.$id, {
    playerId,
    position: player.position,
    acquisitionType: 'draft',
    acquisitionDate: new Date().toISOString()
  });

  // Update draft state in KV
  if (env.features.caching && draftState) {
    try {
      const { kv } = await import('@vercel/kv');
      const totalPicks = (draftState.totalPicks as number) + 1;
      const totalTeams = draftState.draftOrder.length;
      const isSnakeDraft = league.draftType === 'snake';
      
      // Calculate next pick
      let nextPick = (draftState.currentPick as number) + 1;
      let nextRound = draftState.currentRound as number;
      
      if (nextPick > totalTeams) {
        nextPick = isSnakeDraft && nextRound % 2 === 0 ? totalTeams : 1;
        nextRound++;
      }

      // Update state
      await kv.hset(`draft:${leagueId}`, {
        currentRound: nextRound,
        currentPick: nextPick,
        totalPicks,
        lastPickTime: new Date().toISOString(),
        pickDeadline: new Date(Date.now() + league.pickTimeSeconds * 1000).toISOString()
      });

      // Set expiry on draft state (24 hours)
      await kv.expire(`draft:${leagueId}`, 86400);
    } catch (error) {
      console.error('Failed to update draft state in KV:', error);
    }
  }

  // Return success with pick details
  return NextResponse.json({
    success: true,
    pick: {
      id: draftPick.$id,
      playerId,
      playerName: player.name,
      position: player.position,
      round: draftPick.round,
      pick: draftPick.pick,
      overallPick: draftPick.overallPick
    },
    nextUp: draftState ? {
      round: draftState.currentRound,
      pick: (draftState.currentPick as number) + 1,
      teamId: draftState.draftOrder[(draftState.currentPick as number) % draftState.draftOrder.length]
    } : null
  });
});

// Helper to get drafted players in a league
async function getDraftedPlayers(leagueId: string): Promise<Set<string>> {
  const { rosters } = serverRepositories;
  const { rosters: leagueRosters } = await rosters.findByLeague(leagueId);
  
  const draftedPlayerIds = new Set<string>();
  leagueRosters.forEach(roster => {
    roster.players.forEach(player => {
      draftedPlayerIds.add(player.playerId);
    });
  });
  
  return draftedPlayerIds;
}