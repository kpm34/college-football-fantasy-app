import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

// GET commissioner settings and members
export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await userRes.json();
    
    // Get league
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId
    );
    
    // Check if user is commissioner (support multiple field variants)
    const commissionerId = (league as any).commissioner || (league as any).commissionerId || (league as any).commissioner_id;
    if (commissionerId !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can access these settings' },
        { status: 403 }
      );
    }
    
    // Get members
    const [rosters, teams] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.userTeams,
        [Query.equal('leagueId', params.leagueId)]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('leagueId', params.leagueId)]
      ).catch(() => ({ documents: [] }))
    ]);
    
    // Format league response to ensure camelCase fields
    const formattedLeague = {
      ...league,
      maxTeams: league.maxTeams || 12,
      pickTimeSeconds: league.pickTimeSeconds || 90,
      draftDate: league.draftDate,
      gameMode: league.gameMode || league.mode || 'power4',
      selectedConference: league.selectedConference || league.conf,
      seasonStartWeek: league.seasonStartWeek || 1,
      playoffTeams: league.playoffTeams || 4,
      playoffStartWeek: league.playoffStartWeek || 13,
      primaryColor: league.primaryColor || '#8C1818',
      secondaryColor: league.secondaryColor || '#DAA520',
      leagueTrophyName: league.leagueTrophyName || 'Championship Trophy',
      scoringRules: league.scoringRules,
      isPublic: league.isPublic ?? true
    };

    return NextResponse.json({
      success: true,
      league: formattedLeague,
      members: [...rosters.documents, ...teams.documents]
    });
  } catch (error: any) {
    console.error('Get commissioner settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get commissioner settings' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}

// PUT update all league settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await userRes.json();
    
    // Verify user is commissioner
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId
    );
    
    const commissionerId = (league as any).commissioner || (league as any).commissionerId || (league as any).commissioner_id;
    if (commissionerId !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can update league settings' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();

    // Map and sanitize: allow only known fields; ignore others (e.g., selectedConference in power4 mode)
    const mapped: Record<string, any> = {};
    const setIfPresent = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        // Allow empty strings for certain fields like scoringRules (which could be "{}")
        if (key === 'scoringRules' || value !== '') {
          mapped[key] = value;
        }
      }
    };
    setIfPresent('name', updates.name);
    if ('maxTeams' in updates) setIfPresent('maxTeams', Number(updates.maxTeams));
    if ('pickTimeSeconds' in updates) setIfPresent('pickTimeSeconds', Number(updates.pickTimeSeconds));
    if ('draftDate' in updates) setIfPresent('draftDate', updates.draftDate); // ISO string
    if ('orderMode' in updates) setIfPresent('orderMode', updates.orderMode);
    if ('gameMode' in updates) setIfPresent('gameMode', updates.gameMode); // power4|sec|acc|big12|bigten
    if (updates.gameMode === 'conference' && 'selectedConference' in updates) {
      setIfPresent('selectedConference', updates.selectedConference);
    }
    if ('scoringRules' in updates) setIfPresent('scoringRules', updates.scoringRules); // stringified JSON from UI
    if ('seasonStartWeek' in updates) setIfPresent('seasonStartWeek', Number(updates.seasonStartWeek));
    if ('playoffTeams' in updates) setIfPresent('playoffTeams', Number(updates.playoffTeams));
    if ('playoffStartWeek' in updates) setIfPresent('playoffStartWeek', Number(updates.playoffStartWeek));
    if ('primaryColor' in updates) setIfPresent('primaryColor', updates.primaryColor);
    if ('secondaryColor' in updates) setIfPresent('secondaryColor', updates.secondaryColor);
    if ('leagueTrophyName' in updates) setIfPresent('leagueTrophyName', updates.leagueTrophyName);
    if ('draftType' in updates) setIfPresent('draftType', updates.draftType);
    if ('isPublic' in updates) setIfPresent('isPublic', Boolean(updates.isPublic));

    // Fallback: if no mapped keys found, pass original (for backwards compatibility)
    const payload = Object.keys(mapped).length > 0 ? mapped : updates;

    console.log('Commissioner settings update payload:', JSON.stringify(payload, null, 2));

    // Update league with provided settings
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId,
      payload
    );
    
    return NextResponse.json({ success: true, league: result });
  } catch (error: any) {
    console.error('Update commissioner settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update commissioner settings' },
      { status: error.code === 401 ? 401 : 500 }
    );
  }
}
