import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '@domain/repositories';
import { withErrorHandler } from '@lib/utils/error-handler';
import { ValidationError } from '@domain/errors/app-error';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Check if user is authenticated
  const sessionCookie = request.cookies.get('appwrite-session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get user info
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
  const requestData = await request.json();

  // Normalize incoming fields from Create League page
  const name: string | undefined = requestData.name || requestData.leagueName;
  const rawGameMode: string | undefined = requestData.gameMode;
  const selectedConference: string | undefined = requestData.selectedConference;
  const maxTeams: number | undefined = typeof requestData.maxTeams === 'number'
    ? requestData.maxTeams
    : parseInt(requestData.maxTeams);
  const draftType: string = requestData.draftType || 'snake';
  const isPrivate: boolean = Boolean(requestData.isPrivate);
  const pickTimeSeconds: number = typeof requestData.pickTimeSeconds === 'number'
    ? requestData.pickTimeSeconds
    : parseInt(requestData.pickTimeSeconds) || 90;

  // Map Create League UI game mode to repository-expected values
  const normalizeConference = (conf?: string): 'sec' | 'acc' | 'big12' | 'bigten' | undefined => {
    const c = String(conf || '').toLowerCase();
    if (c === 'sec') return 'sec';
    if (c === 'acc') return 'acc';
    if (c === 'big_12' || c === 'big12') return 'big12';
    if (c === 'big_ten' || c === 'bigten' || c === 'big10') return 'bigten';
    return undefined;
  };

  const normalizeGameMode = (mode?: string, conf?: string): 'power4' | 'sec' | 'acc' | 'big12' | 'bigten' | undefined => {
    const m = String(mode || '').toLowerCase();
    if (m === 'power4' || m === 'power-4') return 'power4';
    if (m === 'conference') {
      return normalizeConference(conf);
    }
    if (m === 'sec' || m === 'acc' || m === 'big12' || m === 'bigten') return m as any;
    return undefined;
  };

  const gameMode = normalizeGameMode(rawGameMode, selectedConference);

  // Validate required fields
  if (!name || !maxTeams || !gameMode) {
    throw new ValidationError('Missing required fields: name, maxTeams, gameMode');
  }

  // Use repositories
  const { leagues, rosters } = serverRepositories;

  // Create the league using repository
  const league = await leagues.createLeague({
    name,
    maxTeams,
    draftType: draftType as any,
    gameMode,
    isPublic: !isPrivate,
    pickTimeSeconds,
    commissionerId: user.$id,
    scoringRules: requestData.scoringRules,
    draftDate: requestData.draftDate,
    season: requestData.season || new Date().getFullYear(),
    // Save selectedConference when in conference mode
    selectedConference: rawGameMode?.toLowerCase() === 'conference' ? selectedConference : undefined,
  });

  // Automatically join the commissioner to the league
  const { fantasy_team_id } = await leagues.joinLeague(
    league.$id,
    user.$id,
    requestData.teamName || `${user.name || user.email}'s Team`,
    requestData.teamAbbreviation
  );

  return NextResponse.json({
    success: true,
    league,
    fantasy_team_id,
    message: 'League created successfully!'
  });
});