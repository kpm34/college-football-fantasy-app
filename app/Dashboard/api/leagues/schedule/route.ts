import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';
import { ID } from 'node-appwrite';
import { Query } from 'node-appwrite';

interface ScheduleRequest {
  leagueId: string;
  seasonYear?: number;
  startWeek?: number;
  endWeek?: number;
}

interface Matchup {
  league_id: string;
  week: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'in_progress' | 'final';
  game_time?: string;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScheduleRequest = await request.json();
    const { leagueId, seasonYear = 2025, startWeek = 1, endWeek = 12 } = body;

    console.log(`🏈 Generating schedule for league ${leagueId}...`);

    // Get all teams in the league
    const teamsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SCHOOLS,
      [Query.equal('league_id', leagueId)]
    );

    const teams = teamsResponse.documents;
    const teamCount = teams.length;

    if (teamCount < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 teams to generate schedule' },
        { status: 400 }
      );
    }

    console.log(`📋 Found ${teamCount} teams in league`);

    // Generate schedule based on team count
    const schedule = generateSchedule(teams, startWeek, endWeek);
    
    // Create matchups in database
    let createdCount = 0;
    let errorCount = 0;

    for (const matchup of schedule) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.MATCHUPS,
          ID.unique(),
          {
            league_id: leagueId,
            week: matchup.week,
            home_team_id: matchup.home_team_id,
            away_team_id: matchup.away_team_id,
            home_score: 0,
            away_score: 0,
            status: 'scheduled',
            season_year: seasonYear,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        createdCount++;
      } catch (error) {
        console.error(`Error creating matchup for week ${matchup.week}:`, error);
        errorCount++;
      }
    }

    // Update league with schedule info
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      {
        schedule_generated: true,
        season_start_week: startWeek,
        season_end_week: endWeek,
        total_weeks: endWeek - startWeek + 1,
        updated_at: new Date().toISOString()
      }
    );

    return NextResponse.json({
      success: true,
      summary: {
        league_id: leagueId,
        teams: teamCount,
        weeks: endWeek - startWeek + 1,
        matchups_created: createdCount,
        errors: errorCount
      },
      schedule: schedule,
      message: `Successfully generated schedule with ${createdCount} matchups`
    });

  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedule', details: error.message },
      { status: 500 }
    );
  }
}

function generateSchedule(teams: any[], startWeek: number, endWeek: number): Matchup[] {
  const fantasy_team_ids = teams.map(team => team.$id);
  const teamCount = fantasy_team_ids.length;
  const schedule: Matchup[] = [];

  // For odd number of teams, add a "BYE" team
  const teamsWithBye = teamCount % 2 === 1 ? [...fantasy_team_ids, 'BYE'] : [...fantasy_team_ids];
  const adjustedTeamCount = teamsWithBye.length;

  // Generate round-robin schedule
  for (let week = startWeek; week <= endWeek; week++) {
    const weekMatchups = generateWeekMatchups(teamsWithBye, week);
    schedule.push(...weekMatchups);
  }

  return schedule;
}

function generateWeekMatchups(fantasy_team_ids: string[], week: number): Matchup[] {
  const matchups: Matchup[] = [];
  const teamCount = fantasy_team_ids.length;
  
  // Rotate teams for round-robin (except first team stays in place)
  const rotatedTeams = [...fantasy_team_ids];
  if (week > 1) {
    // Rotate all teams except the first one
    const firstTeam = rotatedTeams[0];
    const otherTeams = rotatedTeams.slice(1);
    const rotation = (week - 1) % (teamCount - 1);
    const rotatedOtherTeams = [
      ...otherTeams.slice(rotation),
      ...otherTeams.slice(0, rotation)
    ];
    rotatedTeams.splice(0, teamCount, firstTeam, ...rotatedOtherTeams);
  }

  // Create matchups for this week
  for (let i = 0; i < teamCount / 2; i++) {
    const homeTeam = rotatedTeams[i];
    const awayTeam = rotatedTeams[teamCount - 1 - i];

    // Skip if either team is BYE
    if (homeTeam === 'BYE' || awayTeam === 'BYE') {
      continue;
    }

    matchups.push({
      league_id: '', // Will be set by caller
      week,
      home_team_id: homeTeam,
      away_team_id: awayTeam,
      home_score: 0,
      away_score: 0,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return matchups;
}

// GET endpoint to retrieve schedule
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const week = searchParams.get('week');

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    let queries = [Query.equal('league_id', leagueId)];
    if (week) {
      queries.push(Query.equal('week', parseInt(week)));
    }

    const matchupsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MATCHUPS,
      queries
    );

    return NextResponse.json({
      success: true,
      matchups: matchupsResponse.documents,
      total: matchupsResponse.total
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule', details: error.message },
      { status: 500 }
    );
  }
} 