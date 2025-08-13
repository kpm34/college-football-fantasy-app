import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionId = request.cookies.get('appwrite-session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user info
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionId}`;
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

    // First, get all teams for this user
    const teamsResponse = await fetch(
      `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/teams/documents?queries[]=equal("userId","${user.$id}")`,
      {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
      }
    );

    if (!teamsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    const teamsData = await teamsResponse.json();
    const leagueIds = teamsData.documents.map((team: any) => team.leagueId);

    if (leagueIds.length === 0) {
      return NextResponse.json({ leagues: [] });
    }

    // Get all leagues where user has a team
    const leaguesPromises = leagueIds.map((leagueId: string) =>
      fetch(
        `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/leagues/documents/${leagueId}`,
        {
          headers: {
            'X-Appwrite-Project': 'college-football-fantasy-app',
            'X-Appwrite-Response-Format': '1.4.0',
            'Cookie': cookieHeader,
          },
        }
      ).then(res => res.json())
    );

    const leagues = await Promise.all(leaguesPromises);

    // Also get leagues where user is commissioner (in case team wasn't created)
    const commissionerLeaguesResponse = await fetch(
      `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/leagues/documents?queries[]=equal("commissionerId","${user.$id}")`,
      {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
      }
    );

    if (commissionerLeaguesResponse.ok) {
      const commissionerData = await commissionerLeaguesResponse.json();
      const commissionerLeagues = commissionerData.documents;
      
      // Merge and deduplicate
      const allLeagues = [...leagues, ...commissionerLeagues];
      const uniqueLeagues = Array.from(
        new Map(allLeagues.map((league) => [league.$id, league])).values()
      );

      return NextResponse.json({ 
        leagues: uniqueLeagues,
        teams: teamsData.documents 
      });
    }

    return NextResponse.json({ 
      leagues,
      teams: teamsData.documents 
    });
  } catch (error) {
    console.error('Fetch leagues error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues', details: error },
      { status: 500 }
    );
  }
}
