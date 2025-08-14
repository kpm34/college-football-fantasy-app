import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '../../../../core/repositories';
import { withErrorHandler } from '../../../../core/utils/error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request: NextRequest) => {
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

  // Use repositories to get user's leagues and teams
  const { leagues, rosters } = serverRepositories;

  // Get all leagues the user is part of (either as player or commissioner)
  const [userLeagues, commissionerLeagues] = await Promise.all([
    // Get leagues where user has a roster
    leagues.findUserLeagues(user.$id),
    
    // Get leagues where user is commissioner
    leagues.find({
      filters: {
        commissioner: user.$id  // Database uses 'commissioner' not 'commissionerId'
      },
      cache: {
        key: `league:commissioner:${user.$id}`,
        ttl: 300
      }
    })
  ]);

  // Merge and deduplicate leagues
  const allLeagues = [...userLeagues.leagues, ...commissionerLeagues.documents];
  const uniqueLeagues = Array.from(
    new Map(allLeagues.map(league => [league.$id, league])).values()
  );

  // Get user's rosters/teams
  const userRosters = await rosters.find({
    filters: {
      userId: user.$id
    },
    cache: {
      key: `roster:user:${user.$id}:all`,
      ttl: 300
    }
  });

  // Transform rosters to teams format for backward compatibility
  const teams = userRosters.documents.map(roster => ({
    $id: roster.$id,
    leagueId: roster.leagueId,
    name: roster.teamName,
    abbreviation: roster.abbreviation,
    wins: roster.wins || 0,
    losses: roster.losses || 0,
    ties: roster.ties || 0,
    pointsFor: roster.pointsFor || 0,
    pointsAgainst: roster.pointsAgainst || 0,
    logoUrl: roster.logoUrl
  }));

  return NextResponse.json({ 
    leagues: uniqueLeagues,
    teams
  });
});