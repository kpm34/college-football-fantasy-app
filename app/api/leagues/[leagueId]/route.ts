import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';
import { APPWRITE_CONFIG } from '@/lib/appwrite-config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setKey(APPWRITE_CONFIG.apiKey);

const databases = new Databases(client);
const databaseId = APPWRITE_CONFIG.databaseId;

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;

    try {
      const league = await databases.getDocument(
        databaseId,
        'leagues',
        leagueId
      );

      // Get lineup profile details
      let lineupProfile = null;
      try {
        lineupProfile = await databases.getDocument(
          databaseId,
          'lineup_profiles',
          league.lineup_profile_id
        );
      } catch (error) {
        console.log('Lineup profile not found, using default');
      }

      // Get scoring profile details
      let scoringProfile = null;
      try {
        scoringProfile = await databases.getDocument(
          databaseId,
          'scoring_profiles',
          league.scoring_profile_id
        );
      } catch (error) {
        console.log('Scoring profile not found, using default');
      }

      return NextResponse.json({
        success: true,
        league: {
          id: league.$id,
          name: league.name,
          mode: league.mode,
          conf: league.conf,
          maxTeams: league.max_teams,
          currentTeams: league.members?.length || 0,
          members: league.members || [],
          status: league.status,
          commissionerId: league.commissioner_id,
          lineupProfileId: league.lineup_profile_id,
          scoringProfileId: league.scoring_profile_id,
          draftDate: league.draft_date,
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
      });

    } catch (appwriteError: any) {
      console.error('Appwrite error:', appwriteError);
      
      // Return mock data for development
      if (leagueId.startsWith('demo-')) {
        return NextResponse.json({
          success: true,
          league: {
            id: leagueId,
            name: leagueId.includes('1') ? 'Big Ten Showdown' : 'Power 4 Elite',
            mode: leagueId.includes('1') ? 'CONFERENCE' : 'POWER4',
            conf: leagueId.includes('1') ? 'big_ten' : null,
            maxTeams: leagueId.includes('1') ? 12 : 16,
            currentTeams: leagueId.includes('1') ? 8 : 12,
            members: ['demo-user-123', 'demo-user-456', 'demo-user-789'],
            status: leagueId.includes('1') ? 'DRAFTING' : 'ACTIVE',
            commissionerId: 'demo-user-123',
            lineupProfileId: leagueId.includes('1') ? 'lp_conference' : 'lp_power4',
            scoringProfileId: 'sp_standard',
            draftDate: '2024-08-15T20:00:00Z',
            seasonStartWeek: 1,
            createdAt: '2024-08-03T10:00:00Z',
            updatedAt: '2024-08-03T10:00:00Z',
            lineupProfile: {
              name: leagueId.includes('1') ? 'Conference Mode Lineup' : 'Power-4 Mode Lineup',
              description: leagueId.includes('1') ? 'Standard lineup for single-conference leagues' : 'Enhanced lineup for Power-4 leagues with defense',
              slots: leagueId.includes('1') ? { QB: 1, RB: 1, WR: 2, TE: 1, K: 1 } : { QB: 1, RB: 2, WR: 2, FLEX: 1, TE: 1, K: 1, DEF: 1 },
              mode: leagueId.includes('1') ? 'CONFERENCE' : 'POWER4'
            },
            scoringProfile: {
              name: 'Standard Scoring',
              description: 'Half-PPR scoring with standard defense rules',
              offenseRules: {
                passing_yards: { points: 0.04, description: '1 point per 25 yards' },
                passing_td: { points: 4, description: '4 points per passing TD' },
                interception: { points: -2, description: '-2 points per interception' },
                rushing_yards: { points: 0.1, description: '1 point per 10 yards' },
                receiving_yards: { points: 0.1, description: '1 point per 10 yards' },
                rushing_td: { points: 6, description: '6 points per rushing TD' },
                receiving_td: { points: 6, description: '6 points per receiving TD' },
                reception: { points: 0.5, description: '0.5 points per reception (half-PPR)' },
                fumble_lost: { points: -2, description: '-2 points per fumble lost' }
              },
              defenseRules: {
                sack: { points: 1, description: '1 point per sack' },
                interception: { points: 2, description: '2 points per interception' },
                fumble_recovery: { points: 2, description: '2 points per fumble recovery' },
                td: { points: 6, description: '6 points per defensive TD' },
                safety: { points: 2, description: '2 points per safety' },
                two_pt_return: { points: 2, description: '2 points per 2-point return' },
                block_kick_td: { points: 6, description: '6 points per blocked kick TD' },
                points_allowed: {
                  '0': { points: 10, description: '10 points for 0 points allowed' },
                  '1-6': { points: 7, description: '7 points for 1-6 points allowed' },
                  '7-13': { points: 4, description: '4 points for 7-13 points allowed' },
                  '14-20': { points: 1, description: '1 point for 14-20 points allowed' },
                  '21-34': { points: 0, description: '0 points for 21-34 points allowed' },
                  '35-45': { points: -3, description: '-3 points for 35-45 points allowed' },
                  '46+': { points: -5, description: '-5 points for 46+ points allowed' }
                }
              },
              kickerRules: {
                'fg_0_39': { points: 3, description: '3 points for FG 0-39 yards' },
                'fg_40_49': { points: 4, description: '4 points for FG 40-49 yards' },
                'fg_50_plus': { points: 5, description: '5 points for FG 50+ yards' },
                'xp': { points: 1, description: '1 point for extra point' },
                'missed_fg': { points: -1, description: '-1 point for missed FG' },
                'missed_xp': { points: -1, description: '-1 point for missed XP' }
              }
            }
          }
        });
      }

      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error getting league details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
    const { teamId, name } = body;
    if (!teamId || !name) {
      return NextResponse.json({ error: 'teamId and name required' }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId)
      .setKey(APPWRITE_CONFIG.apiKey);
    const databases = new Databases(client);
    await databases.updateDocument(databaseId, 'teams', teamId, { name, updated_at: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team name:', error);
    return NextResponse.json({ error: 'Failed to update team name' }, { status: 500 });
  }
}