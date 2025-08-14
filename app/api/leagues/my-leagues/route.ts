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

    // Helper to fetch documents by field match
    const fetchBy = async (collection: string, field: string, value: string) => {
      if (!value) return [] as any[];
      const url = `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/${collection}/documents?queries[]=equal("${field}","${value}")`;
      const res = await fetch(url, {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
      });
      if (!res.ok) return [] as any[];
      const data = await res.json();
      return data.documents || [];
    };

    // Gather teams across possible identifiers (handles legacy/alternate fields)
    const teamsDocs: any[] = [];
    const pushUnique = (arr: any[], doc: any, key = '$id') => {
      if (!arr.find((d) => d[key] === doc[key])) arr.push(doc);
    };

    for (const doc of await fetchBy('teams', 'userId', user.$id)) pushUnique(teamsDocs, doc);
    for (const doc of await fetchBy('teams', 'owner', user.$id)) pushUnique(teamsDocs, doc);
    for (const doc of await fetchBy('teams', 'email', user.email || '')) pushUnique(teamsDocs, doc);
    for (const doc of await fetchBy('teams', 'userName', user.name || '')) pushUnique(teamsDocs, doc);

    // Also read legacy rosters collection and adapt to team shape
    const rosterDocs: any[] = [];
    for (const doc of await fetchBy('rosters', 'userId', user.$id)) pushUnique(rosterDocs, doc);
    for (const doc of await fetchBy('rosters', 'owner', user.$id)) pushUnique(rosterDocs, doc);
    for (const doc of await fetchBy('rosters', 'email', user.email || '')) pushUnique(rosterDocs, doc);
    for (const doc of await fetchBy('rosters', 'userName', user.name || '')) pushUnique(rosterDocs, doc);

    const adaptedFromRosters = rosterDocs.map((r: any) => ({
      $id: r.$id,
      leagueId: r.leagueId || r.league_id,
      name: r.teamName || r.name || 'Team',
      wins: r.wins ?? 0,
      losses: r.losses ?? 0,
      pointsFor: r.pointsFor ?? r.points ?? 0,
    }));

    // Build unified teams list
    const normalizedTeams = teamsDocs.map((t: any) => ({
      $id: t.$id,
      leagueId: t.leagueId || t.league_id,
      name: t.name || t.teamName || 'Team',
      wins: t.wins ?? 0,
      losses: t.losses ?? 0,
      pointsFor: t.pointsFor ?? t.points ?? 0,
    }));

    const teamsCombined: any[] = [];
    for (const t of [...normalizedTeams, ...adaptedFromRosters]) pushUnique(teamsCombined, t, 'leagueId');

    const leagueIds = teamsCombined.map((team: any) => team.leagueId).filter(Boolean);

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
        teams: teamsCombined
      });
    }

    return NextResponse.json({ 
      leagues,
      teams: teamsCombined
    });
  } catch (error) {
    console.error('Fetch leagues error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues', details: error },
      { status: 500 }
    );
  }
}
