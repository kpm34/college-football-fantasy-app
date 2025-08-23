import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';

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
          [Query.equal('leagueId', leagueId), Query.equal('client_id', client_id), Query.limit(1)]
        );
        if (rosters.total === 0 && league.commissioner !== client_id) {
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

    const etag = `W/"${(league as any).$updatedAt || (league as any).updated_at || league.$id}-${(league as any).members?.length || 0}"`;
    const ifNoneMatch = request.headers.get('if-none-match') || '';
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }

    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: league.name,
        mode: league.mode,
        conf: league.conf,
        maxTeams: league.maxTeams,
        currentTeams: league.members?.length || 0,
        members: league.members || [],
        status: league.status,
        commissioner: league.commissioner,
        lineupProfileId: league.lineup_profile_id,
        scoringProfileId: league.scoring_profile_id,
        // Support both legacy snake_case and current camelCase field names
        draftDate: (league as any).draftDate || (league as any).draft_date,
        seasonStartWeek: league.season_start_week,
        createdAt: league.created_at,
        updatedAt: league.updated_at,
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
    const { fantasy_team_id, name } = body;
    if (!fantasy_team_id || !name) {
      return NextResponse.json({ error: 'fantasy_team_id and name required' }, { status: 400 });
    }

    await databases.updateDocument(databaseId, COLLECTIONS.SCHOOLS, fantasy_team_id, { name, updated_at: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team name:', error);
    return NextResponse.json({ error: 'Failed to update team name' }, { status: 500 });
  }
}