import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, serverUsers, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export const dynamic = 'force-dynamic';
// GET commissioner settings and members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  const { leagueId } = await params;
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
      leagueId
    );
    
    // Check if user is commissioner (support multiple field variants)
    // Use the actual DB field name: commissionerAuthUserId (now camelCase!)
    const commissionerId = (league as any).commissionerAuthUserId;
    if (!commissionerId || commissionerId !== user.$id) {
      return NextResponse.json(
        { error: 'Only the commissioner can access these settings' },
        { status: 403 }
      );
    }
    
    // Get league_memberships - primary source of truth for members
    let memberships: any = { documents: [] };
    try {
      memberships = await databases.listDocuments(
        DATABASE_ID,
        'league_memberships',
        [Query.equal('leagueId', resolvedParams.leagueId), Query.equal('status', 'active'), Query.limit(200)]
      );
      console.log(`Found ${memberships.documents.length} league memberships`);
    } catch (e) {
      console.error('Error fetching league_memberships:', e);
    }
    
    // Get fantasy_teams for team names and stats
    const fantasyTeams = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [Query.equal('leagueId', resolvedParams.leagueId), Query.limit(200)]
    );
    console.log(`Found ${fantasyTeams.documents.length} fantasy teams`);
    
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

    // Build member map from league_memberships (uses authUserId as per schema)
    const authUserToName = new Map<string, string>();
    const authUserToMembership = new Map<string, any>();
    
    for (const membership of memberships.documents || []) {
      const authUserId = membership.authUserId; // Now camelCase!
      if (authUserId) {
        authUserToName.set(authUserId, membership.displayName || 'Unknown Member');
        authUserToMembership.set(authUserId, membership);
        console.log(`Membership: authUserId=${authUserId}, displayName=${membership.displayName}`);
      }
    }

    // Get additional display names from clients collection if needed
    const authUserIds = Array.from(authUserToName.keys());
    if (authUserIds.length > 0) {
      try {
        const clientsRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CLIENTS,
          [Query.equal('authUserId', authUserIds), Query.limit(200)]
        );
        
        for (const client of clientsRes.documents || []) {
          const authUserId = client.authUserId;
          // Only override if membership didn't have a displayName
          if (!authUserToName.get(authUserId) || authUserToName.get(authUserId) === 'Unknown Member') {
            authUserToName.set(authUserId, client.displayName || client.email || 'Unknown');
          }
        }
      } catch (e) {
        console.error('Error fetching clients:', e);
      }
    }

    // Create members list with consistent naming
    const memberMap = new Map();
    
    // Add all members from league_memberships (primary source)
    for (const membership of memberships.documents || []) {
      const authUserId = membership.authUserId; // Now camelCase!
      if (authUserId) {
        const displayName = authUserToName.get(authUserId) || membership.displayName || 'Unknown Member';
        console.log(`Adding member: authUserId=${authUserId}, name=${displayName}`);
        
        memberMap.set(authUserId, {
          $id: authUserId,  // Use authUserId as the primary ID
          authUserId: authUserId,  // Keep the actual field name
          clientId: authUserId,  // Keep for backwards compatibility (frontend may still use this)
          name: displayName,
          teamName: `${displayName}'s Team`,  // Default team name format
          owner: authUserId,
          email: '',
          wins: 0,
          losses: 0
        });
      }
    }
    
    // Update with fantasy_teams data if available
    console.log('Processing fantasy teams:', fantasyTeams.documents?.length || 0);
    for (const team of fantasyTeams.documents || []) {
      const authUserId = team.ownerAuthUserId; // Now using camelCase!
      if (authUserId) {
        console.log(`Updating member from fantasy team: ownerAuthUserId=${authUserId}, teamName=${team.teamName}`);
        const existing = memberMap.get(authUserId) || {};
        memberMap.set(authUserId, {
          ...existing,
          $id: authUserId,
          authUserId: authUserId,
          clientId: authUserId,  // Keep for backwards compatibility
          teamName: team.teamName || team.displayName || existing.teamName || 'Team',
          name: existing.name || authUserToName.get(authUserId) || team.displayName || 'Unknown',
          owner: authUserId,
          email: existing.email || '',
          wins: team.wins ?? 0,
          losses: team.losses ?? 0
        });
      }
    }
    
    // If no members found from memberships or fantasy_teams, try to get from league.members array
    if (memberMap.size === 0 && Array.isArray(league.members)) {
      console.log('No members from collections, using league.members:', league.members);
      for (const authUserId of league.members) {
        if (authUserId) {
          // Try to get display name from auth user map
          let displayName = authUserToName.get(authUserId) || authUserId;
          
          // If it's a BOT, keep the BOT name
          if (authUserId.startsWith('BOT-')) {
            displayName = authUserId;
          }
          
          memberMap.set(authUserId, {
            $id: authUserId,
            authUserId: authUserId,
            clientId: authUserId,  // Keep for backwards compatibility
            name: displayName,
            teamName: '',
            owner: authUserId,
            email: '',
            wins: 0,
            losses: 0
          });
        }
      }
    }
    
    const members = Array.from(memberMap.values());
    console.log('Final members list:', members.length, 'members:', members.map(m => ({ id: m.authUserId, name: m.name })));

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
  { params }: { params: Promise<{ leagueId: string }> }
) {
  const { leagueId } = await params;
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
      leagueId
    );
    
    // Use the actual DB field name: commissionerAuthUserId (now camelCase!)
    const commissionerId = (league as any).commissionerAuthUserId;
    if (!commissionerId || commissionerId !== user.$id) {
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
    // Normalize incoming league name to `leagueName`
    const incomingLeagueName = updates.leagueName ?? updates.name;
    if (incomingLeagueName !== undefined) {
      setIfPresent('leagueName', String(incomingLeagueName));
    }
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
    // Capture incoming draftOrder but do NOT persist it to leagues (canonical lives in drafts.orderJson)
    let draftOrderToApply: string | string[] | undefined = undefined;
    if ('draftOrder' in updates) {
      draftOrderToApply = updates.draftOrder;
      if (typeof draftOrderToApply !== 'string') {
        try { draftOrderToApply = JSON.stringify(draftOrderToApply); } catch {}
      }
      if (typeof draftOrderToApply === 'string' && draftOrderToApply.length > 65535) {
        console.warn('[Commissioner] Draft order too long, truncating to 65535 chars for draft document');
        draftOrderToApply = draftOrderToApply.slice(0, 65535);
      }
    }
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
      'leagueName', 'maxTeams', 'isPublic', 'draftDate', 'pickTimeSeconds',
      'orderMode', 'gameMode', 'selectedConference', 'scoringRules',
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

    // Ensure required attributes from schema are preserved (Appwrite strict update)
    if ((league as any).ownerClientId && !('owner_client_id' in safePayload)) {
      safePayload['ownerClientId'] = (league as any).ownerClientId;
    }
    if ((league as any).season && !('season' in safePayload)) {
      safePayload['season'] = (league as any).season;
    }

    console.log('Updating league with payload:', JSON.stringify(safePayload, null, 2));

    // Update league with filtered settings
    const result = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      safePayload
    );
    
    // Also update the draft document if it exists
    try {
      // Find the draft document for this league
      const drafts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', resolvedParams.leagueId), Query.limit(1)]
      );
      
      if (drafts.documents.length > 0) {
        const draftDoc = drafts.documents[0];
        const draftUpdates: Record<string, any> = {};
        
        // Update draft-related fields
        if ('draftDate' in safePayload) {
          draftUpdates.startTime = safePayload.draftDate;
        }
        if ('pickTimeSeconds' in safePayload) {
          draftUpdates.clockSeconds = safePayload.pickTimeSeconds;
        }
        if ('draftType' in safePayload) {
          draftUpdates.type = safePayload.draftType;
        }
        
        // Update orderJson with new settings
        let orderJson: any = {};
        try {
          orderJson = draftDoc.orderJson ? JSON.parse(draftDoc.orderJson) : {};
        } catch {}
        
        if (draftOrderToApply !== undefined) {
          let draftOrderData: any = draftOrderToApply;
          if (typeof draftOrderData === 'string') {
            try { draftOrderData = JSON.parse(draftOrderData); } catch {}
          }
          orderJson.draftOrder = draftOrderData;
        }
        if ('pickTimeSeconds' in safePayload) {
          orderJson.pickTimeSeconds = safePayload.pickTimeSeconds;
        }
        if ('maxTeams' in safePayload) {
          orderJson.totalTeams = safePayload.maxTeams;
        }
        if ('draftType' in safePayload) {
          orderJson.draftType = safePayload.draftType;
        }
        
        draftUpdates.orderJson = JSON.stringify(orderJson);
        
        // Add league name and game mode to draft updates
        draftUpdates.leagueName = result.leagueName || league.leagueName;
        draftUpdates.gameMode = result.gameMode || league.gameMode;
        draftUpdates.selectedConference = result.selectedConference || league.selectedConference;
        draftUpdates.maxTeams = result.maxTeams || league.maxTeams;
        
        // Update draft document
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          draftDoc.$id,
          draftUpdates
        );
        console.log('Draft document updated:', draftDoc.$id);
      } else {
        // Create draft document if it doesn't exist
        const draftOrder = (() => {
          if (draftOrderToApply !== undefined) {
            if (typeof draftOrderToApply === 'string') {
              try { return JSON.parse(draftOrderToApply); } catch { return [user.$id]; }
            }
            return draftOrderToApply;
          }
          return [user.$id];
        })();
        const draftDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          ID.unique(),
          {
            leagueId: resolvedParams.leagueId,
            leagueName: result.leagueName || league.leagueName,
            gameMode: result.gameMode || league.gameMode,
            selectedConference: result.selectedConference || league.selectedConference,
            maxTeams: result.maxTeams || league.maxTeams,
            draftStatus: 'pre-draft',
            type: safePayload.draftType || 'snake',
            currentRound: 0,
            currentPick: 0,
            maxRounds: 15,
            startTime: safePayload.draftDate || null,
            isMock: false,
            clockSeconds: safePayload.pickTimeSeconds || 90,
            orderJson: JSON.stringify({
              draftOrder,
              draftType: safePayload.draftType || 'snake',
              totalTeams: safePayload.maxTeams || 12,
              pickTimeSeconds: safePayload.pickTimeSeconds || 90,
            }),
          }
        );
        console.log('Draft document created:', draftDoc.$id);
      }
    } catch (draftError) {
      // Log but don't fail the update if draft sync fails
      console.error('Failed to sync draft document:', draftError);
    }
    
    return NextResponse.json({ success: true, league: result });
  } catch (error: any) {
    console.error('Update commissioner settings error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
      leagueId: resolvedParams.leagueId
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

