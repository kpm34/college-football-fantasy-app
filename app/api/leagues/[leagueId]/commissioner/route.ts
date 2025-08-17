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
        COLLECTIONS.ROSTERS,
        [Query.equal('leagueId', params.leagueId)]
      ),
      databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('leagueId', params.leagueId)]
      ).catch(() => ({ documents: [] }))
    ]);
    
    return NextResponse.json({
      success: true,
      league,
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
      if (value !== undefined && value !== null && value !== '') mapped[key] = value;
    };
    setIfPresent('name', updates.name);
    if ('maxTeams' in updates) setIfPresent('max_teams', Number(updates.maxTeams));
    if ('pickTimeSeconds' in updates) setIfPresent('pick_time_seconds', Number(updates.pickTimeSeconds));
    if ('draftDate' in updates) setIfPresent('draft_date', updates.draftDate); // ISO string
    if ('orderMode' in updates) setIfPresent('order_mode', updates.orderMode);
    if ('gameMode' in updates) setIfPresent('mode', updates.gameMode); // power4|sec|acc|big12|bigten
    if (updates.gameMode === 'conference' && 'selectedConference' in updates) {
      setIfPresent('conf', updates.selectedConference);
    }
    if ('scoringRules' in updates) setIfPresent('scoring_rules', updates.scoringRules); // stringified JSON from UI
    if ('seasonStartWeek' in updates) setIfPresent('season_start_week', Number(updates.seasonStartWeek));
    if ('playoffTeams' in updates) setIfPresent('playoff_teams', Number(updates.playoffTeams));
    if ('playoffStartWeek' in updates) setIfPresent('playoff_start_week', Number(updates.playoffStartWeek));
    if ('primaryColor' in updates) setIfPresent('primary_color', updates.primaryColor);
    if ('secondaryColor' in updates) setIfPresent('secondary_color', updates.secondaryColor);
    if ('leagueTrophyName' in updates) setIfPresent('league_trophy_name', updates.leagueTrophyName);
    if ('draftType' in updates) setIfPresent('draft_type', updates.draftType);

    // Fallback: if no mapped keys found, pass original (for backwards compatibility)
    const payload = Object.keys(mapped).length > 0 ? mapped : updates;

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
