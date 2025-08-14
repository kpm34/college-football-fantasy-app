import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      const query = encodeURIComponent(`equal("${field}","${value}")`);
      const url = `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/${collection}/documents?queries[]=${query}`;
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
    // owner may be stored as user's name OR email; do not use $id
    if (user.name) {
      for (const doc of await fetchBy('teams', 'owner', user.name)) pushUnique(teamsDocs, doc);
    }
    if (user.email) {
      for (const doc of await fetchBy('teams', 'owner', user.email)) pushUnique(teamsDocs, doc);
      for (const doc of await fetchBy('teams', 'email', user.email)) pushUnique(teamsDocs, doc);
    }
    if (user.name) {
      for (const doc of await fetchBy('teams', 'userName', user.name)) pushUnique(teamsDocs, doc);
    }

    // Also read legacy rosters collection and adapt to team shape
    const rosterDocs: any[] = [];
    for (const doc of await fetchBy('rosters', 'userId', user.$id)) pushUnique(rosterDocs, doc);
    if (user.name) {
      for (const doc of await fetchBy('rosters', 'owner', user.name)) pushUnique(rosterDocs, doc);
    }
    if (user.email) {
      for (const doc of await fetchBy('rosters', 'owner', user.email)) pushUnique(rosterDocs, doc);
      for (const doc of await fetchBy('rosters', 'email', user.email)) pushUnique(rosterDocs, doc);
    }
    if (user.name) {
      for (const doc of await fetchBy('rosters', 'userName', user.name)) pushUnique(rosterDocs, doc);
    }

    const adaptedFromRosters = rosterDocs.map((r: any) => ({
      $id: r.$id,
      leagueId: r.leagueId || r.league_id,
      name: r.teamName || r.name || 'Team',
      wins: r.wins ?? 0,
      losses: r.losses ?? 0,
      pointsFor: r.pointsFor ?? r.points ?? 0,
    }));

    // Build unified teams list
    const normalizedTeams = teamsDocs.map((t: any) => {
      let wins = t.wins ?? 0;
      let losses = t.losses ?? 0;
      if ((wins === 0 && losses === 0) && typeof t.record === 'string') {
        const parts = t.record.split('-').map((p: string) => parseInt(p, 10));
        if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
          wins = parts[0];
          losses = parts[1];
        }
      }
      return {
        $id: t.$id,
        leagueId: t.leagueId || t.league_id,
        name: t.name || t.teamName || 'Team',
        wins,
        losses,
        pointsFor: t.pointsFor ?? t.points ?? 0,
      };
    });

    const teamsCombined: any[] = [];
    for (const t of [...normalizedTeams, ...adaptedFromRosters]) pushUnique(teamsCombined, t, 'leagueId');

    const leagueIds = teamsCombined.map((team: any) => team.leagueId).filter(Boolean);

    // Get all leagues where user has a team (if any)
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
    const commissionerLeaguesAgg: any[] = [];
    const commissionerIdQuery = encodeURIComponent(`equal("commissionerId","${user.$id}")`);
    const commissionerIdRes = await fetch(
      `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/leagues/documents?queries[]=${commissionerIdQuery}`,
      {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
      }
    );
    if (commissionerIdRes.ok) {
      const data = await commissionerIdRes.json();
      (data.documents || []).forEach((d: any) => commissionerLeaguesAgg.push(d));
    }

    // Legacy: commissioner stored as name/email
    if (user.name) {
      const q = encodeURIComponent(`equal("commissioner","${user.name}")`);
      const res = await fetch(
        `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/leagues/documents?queries[]=${q}`,
        { headers: { 'X-Appwrite-Project': 'college-football-fantasy-app', 'X-Appwrite-Response-Format': '1.4.0', 'Cookie': cookieHeader } }
      );
      if (res.ok) {
        const data = await res.json();
        (data.documents || []).forEach((d: any) => commissionerLeaguesAgg.push(d));
      }
    }
    if (user.email) {
      const q = encodeURIComponent(`equal("commissioner","${user.email}")`);
      const res = await fetch(
        `https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections/leagues/documents?queries[]=${q}`,
        { headers: { 'X-Appwrite-Project': 'college-football-fantasy-app', 'X-Appwrite-Response-Format': '1.4.0', 'Cookie': cookieHeader } }
      );
      if (res.ok) {
        const data = await res.json();
        (data.documents || []).forEach((d: any) => commissionerLeaguesAgg.push(d));
      }
    }

    // Merge and deduplicate
    const allLeagues = [...leagues, ...commissionerLeaguesAgg];
    const uniqueLeagues = Array.from(
      new Map(allLeagues.map((league) => [league.$id, league])).values()
    );

    return NextResponse.json({ 
      leagues: uniqueLeagues,
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
