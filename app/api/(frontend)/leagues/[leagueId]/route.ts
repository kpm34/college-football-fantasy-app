import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { serverDatabases as databases, serverUsers, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';

const databaseId = DATABASE_ID;

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;

    // Resolve current user from cookie session header if present (optional)
    const client_id = request.headers.get('x-user-id') || request.headers.get('x-app-user') || '';

    // Read league via server key (documentSecurity-safe)
    const league = await databases.getDocument(
      databaseId,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Validate membership if client_id provided
    if (client_id) {
      try {
        const rosters = await databases.listDocuments(
          databaseId,
          COLLECTIONS.FANTASY_TEAMS,
          [
            Query.equal('leagueId', leagueId),
            Query.equal('ownerAuthUserId', client_id),
            Query.limit(1)
          ]
        );

        // Commissioner can always access even if their roster hasn't materialized yet
        const commissionerId = (league as any).commissionerAuthUserId || (league as any).commissioner;
        const isCommissioner = commissionerId && String(commissionerId) === String(client_id);

        if (rosters.total === 0 && !isCommissioner) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } catch {}
    }

    // Optional related docs
    let lineupProfile = null;
    try {
      lineupProfile = await databases.getDocument(
        databaseId,
        'lineup_profiles',
        league.lineup_profile_id
      );
    } catch {}

    let scoringProfile = null;
    try {
      scoringProfile = await databases.getDocument(
        databaseId,
        'scoring_profiles',
        league.scoring_profile_id
      );
    } catch {}

    const etag = `W/"${(league as any).$updatedAt || (league as any).updatedAt || league.$id}-${(league as any).members?.length || 0}"`;
    const ifNoneMatch = request.headers.get('if-none-match') || '';
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }

    // Commissioner id (canonical)
    const commissionerId = (league as any).commissionerAuthUserId || (league as any).commissioner;
    let commissionerName = 'Unknown Commissioner';
    try {
      if (commissionerId) {
        try {
          const cu: any = await serverUsers.get(String(commissionerId));
          commissionerName = cu.name || cu.email || commissionerName;
        } catch {
          // Fallback via clients collection (authUserId or $id)
          try {
            const clients = await databases.listDocuments(
              databaseId,
              'clients',
              [Query.equal('authUserId', [String(commissionerId)]), Query.limit(1)]
            );
            const c = clients.documents?.[0];
            if (c) commissionerName = (c as any).displayName || (c as any).email || commissionerName;
            else {
              try {
                const c2 = await databases.getDocument(databaseId, 'clients', String(commissionerId));
                if (c2) commissionerName = (c2 as any).displayName || (c2 as any).email || commissionerName;
              } catch {}
            }
          } catch {}
        }
      }
    } catch {}

    // Derive members and team count from fantasy_teams (canonical)
    let derivedMembers: string[] = []
    let teamCount = 0
    try {
      const rosterDocs = await databases.listDocuments(
        databaseId,
        COLLECTIONS.FANTASY_TEAMS,
        [Query.equal('leagueId', leagueId), Query.limit(500)]
      )
      const docs = rosterDocs.documents as any[]
      teamCount = docs.length
      derivedMembers = Array.from(new Set(docs.map(d => d.ownerAuthUserId).filter(Boolean)))
    } catch {}

    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: league.leagueName,
        mode: league.mode,
        conf: league.conf,
        maxTeams: league.maxTeams,
        currentTeams: teamCount,
        members: derivedMembers,
        status: league.status,
        commissioner: commissionerId,
        commissionerName,
        lineupProfileId: league.lineup_profile_id,
        scoringProfileId: league.scoring_profile_id,
        // Support both legacy snake_case and current camelCase field names
        draftDate: (league as any).draftDate,
        seasonStartWeek: (league as any).seasonStartWeek,
        createdAt: league.createdAt,
        updatedAt: league.updatedAt,
        lineupProfile: lineupProfile ? {
          name: lineupProfile.name,
          description: lineupProfile.description,
          slots: JSON.parse(lineupProfile.slots),
          mode: lineupProfile.mode
        } : null,
        scoringProfile: scoringProfile ? {
          name: scoringProfile.name,
          description: scoringProfile.description,
          offenseRules: JSON.parse(scoringProfile.offense_rules),
          defenseRules: scoringProfile.defense_rules ? JSON.parse(scoringProfile.defense_rules) : null,
          kickerRules: JSON.parse(scoringProfile.kicker_rules)
        } : null
      }
    }, { headers: { ETag: etag } });

  } catch (appwriteError: any) {
    console.error('League API error:', appwriteError);
    return NextResponse.json(
      { error: 'League not found or unauthorized' },
      { status: appwriteError?.code === 404 ? 404 : 401 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;
    const body = await request.json();
    const { fantasyTeamId, name } = body;
    if (!fantasyTeamId || !name) {
      return NextResponse.json({ error: 'fantasyTeamId and name required' }, { status: 400 });
    }

    await databases.updateDocument(databaseId, COLLECTIONS.SCHOOLS, fantasyTeamId, { name, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team name:', error);
    return NextResponse.json({ error: 'Failed to update team name' }, { status: 500 });
  }
}