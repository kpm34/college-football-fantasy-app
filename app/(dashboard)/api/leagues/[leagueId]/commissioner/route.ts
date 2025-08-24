import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, serverUsers, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const dynamic = 'force-dynamic';
// GET commissioner settings and members
export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    // Get user from session (support both proxy cookie and native Appwrite cookie)
    let sessionCookie = request.cookies.get('appwrite-session')?.value as string | undefined;
    if (!sessionCookie) {
      const native = request.cookies.get('a_session_college-football-fantasy-app')?.value as string | undefined;
      if (native) sessionCookie = native;
    }
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
    const commissionerId = (league as any).owner_client_id || (league as any).commissioner || (league as any).commissionerId || (league as any).commissioner_id;
    if (commissionerId !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can access these settings' },
        { status: 403 }
      );
    }
    
    // Get members from fantasy_teams with correct schema fields
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [Query.equal('league_id', params.leagueId), Query.limit(200)]
    );

    // Optionally fetch league_memberships for display names
    let memberships: any = { documents: [] };
    try {
      memberships = await databases.listDocuments(
        DATABASE_ID,
        'league_memberships',
        [Query.equal('league_id', params.leagueId), Query.equal('status', 'active'), Query.limit(200)]
      );
    } catch {}
    
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

    // Build display name maps
    const membershipName = new Map<string, string>();
    const idToName = new Map<string, string>();
    try {
      for (const m of memberships.documents || []) {
        if (m?.client_id && m?.display_name) {
          membershipName.set(String(m.client_id), String(m.display_name));
        }
      }
    } catch {}

    // Resolve owner IDs from rosters
    const ownerIds = Array.from(new Set((rosters.documents || []).map((d: any) => d.owner_client_id || d.client_id || d.owner).filter(Boolean)));
    // Resolve from Auth Users first
    // Prefer clients collection by auth_user_id; fallback to Auth Users
    try {
      if (ownerIds.length > 0) {
        const clientsRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CLIENTS,
          [Query.equal('auth_user_id', ownerIds as string[]), Query.limit(200)]
        );
        for (const c of (clientsRes.documents || [])) {
          if ((c as any)?.auth_user_id) {
            idToName.set(String((c as any).auth_user_id), String((c as any).display_name || (c as any).email || 'Unknown'));
          }
        }
      }
    } catch {}
    await Promise.all(ownerIds.map(async (uid) => {
      if (idToName.has(String(uid))) return;
      try {
        const u: any = await serverUsers.get(String(uid));
        idToName.set(String(uid), u.name || u.email || 'Unknown');
      } catch {}
    }));

    // Map roster docs to a consistent member shape expected by UI
    const members = (rosters.documents || []).map((doc: any) => {
      const ownerId = doc.owner_client_id || doc.client_id || doc.owner;
      const resolvedName = membershipName.get(ownerId) || idToName.get(ownerId) || doc.display_name || undefined;
      return {
      $id: doc.$id,
      teamName: doc.name || doc.teamName || 'Team',
      name: resolvedName,
      owner: ownerId,
      email: doc.email,
      wins: doc.wins ?? 0,
      losses: doc.losses ?? 0,
      client_id: ownerId // back-compat for UI lookups
    }});

    return NextResponse.json({ success: true, league: formattedLeague, members });
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
    // Get user from session (support both proxy cookie and native Appwrite cookie)
    let sessionCookie = request.cookies.get('appwrite-session')?.value as string | undefined;
    if (!sessionCookie) {
      const native = request.cookies.get('a_session_college-football-fantasy-app')?.value as string | undefined;
      if (native) sessionCookie = native;
    }
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

    // Validate scoring rules JSON if present
    if (payload.scoringRules) {
      try {
        JSON.parse(payload.scoringRules);
      } catch (jsonError) {
        console.error('Invalid scoring rules JSON:', payload.scoringRules);
        return NextResponse.json(
          { error: 'Invalid scoring rules format' },
          { status: 400 }
        );
      }
    }

    // Filter payload to only attributes that exist on the document (or are known safe)
    const knownSafeKeys = new Set([
      'name', 'maxTeams', 'isPublic', 'draftDate', 'pickTimeSeconds',
      'orderMode', 'draftOrder', 'gameMode', 'selectedConference', 'scoringRules',
      'draftType', 'seasonStartWeek', 'playoffTeams', 'playoffStartWeek',
      'waiverType', 'waiverBudget', 'primaryColor', 'secondaryColor',
      'leagueTrophyName', 'scoringType', 'tradeDeadline', 'rosterSize'
    ]);
    const leagueKeys = new Set(Object.keys(league as any));
    const safePayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (knownSafeKeys.has(k) || leagueKeys.has(k)) {
        safePayload[k] = v;
      }
    }

    console.log('Updating league with payload:', JSON.stringify(safePayload, null, 2));

    // Update league with filtered settings
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      params.leagueId,
      safePayload
    );
    
    return NextResponse.json({ success: true, league: result });
  } catch (error: any) {
    console.error('Update commissioner settings error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
      leagueId: params.leagueId
    });
    
    // Return more specific error messages based on error type
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json(
        { error: 'Authentication failed or insufficient permissions' },
        { status: 401 }
      );
    }
    
    if (error.code === 400) {
      return NextResponse.json(
        { error: 'Invalid data provided: ' + (error.message || 'Unknown validation error') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update commissioner settings' },
      { status: 500 }
    );
  }
}
