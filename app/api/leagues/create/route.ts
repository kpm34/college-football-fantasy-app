import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '../../../../core/repositories';
import { withErrorHandler } from '../../../../core/utils/error-handler';
import { ValidationError } from '../../../../core/errors/app-error';

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

  // Validate required fields
  if (!requestData.name || !requestData.maxTeams || !requestData.gameMode) {
    throw new ValidationError('Missing required fields: name, maxTeams, gameMode');
  }

  // Use repositories
  const { leagues, rosters } = serverRepositories;

  // Create the league using repository
  const league = await leagues.createLeague({
    name: requestData.name,
    maxTeams: parseInt(requestData.maxTeams),
    draftType: requestData.draftType || 'snake',
    gameMode: requestData.gameMode,
    isPublic: !requestData.isPrivate,
    pickTimeSeconds: parseInt(requestData.pickTimeSeconds) || 90,
    commissionerId: user.$id,
    scoringRules: requestData.scoringRules,
    draftDate: requestData.draftDate,
    season: requestData.season || new Date().getFullYear(),
  });

  // Automatically join the commissioner to the league
  const { rosterId } = await leagues.joinLeague(
    league.$id,
    user.$id,
    requestData.teamName || `${user.name || user.email}'s Team`,
    requestData.teamAbbreviation
  );

  return NextResponse.json({
    success: true,
    league,
    rosterId,
    message: 'League created successfully!'
  });
});