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
  leagueId: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'in_progress' | 'final';
  game_time?: string;
  createdAt: string;
  updatedAt: string;
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
      [Query.equal('leagueId', leagueId)]
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
            leagueId: leagueId,
            week: matchup.week,
            homeTeamId: matchup.homeTeamId,
            awayTeamId: matchup.awayTeamId,
            homeScore: 0,
            awayScore: 0,
            status: 'scheduled',
            season_year: seasonYear,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
        seasonStartWeek: startWeek,
        season_end_week: endWeek,
        total_weeks: endWeek - startWeek + 1,
        updatedAt: new Date().toISOString()
      }
    );

    return NextResponse.json({
      success: true,
      summary: {
        leagueId: leagueId,
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
  const fantasyTeamIds = teams.map(team => team.$id);
  const teamCount = fantasyTeamIds.length;
  const schedule: Matchup[] = [];

  // For odd number of teams, add a "BYE" team
  const teamsWithBye = teamCount % 2 === 1 ? [...fantasyTeamIds, 'BYE'] : [...fantasyTeamIds];
  const adjustedTeamCount = teamsWithBye.length;

  // Generate round-robin schedule
  for (let week = startWeek; week <= endWeek; week++) {
    const weekMatchups = generateWeekMatchups(teamsWithBye, week);
    schedule.push(...weekMatchups);
  }

  return schedule;
}

function generateWeekMatchups(fantasyTeamIds: string[], week: number): Matchup[] {
  const matchups: Matchup[] = [];
  const teamCount = fantasyTeamIds.length;
  
  // Rotate teams for round-robin (except first team stays in place)
  const rotatedTeams = [...fantasyTeamIds];
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
      leagueId: '', // Will be set by caller
      week,
      homeTeamId: homeTeam,
      awayTeamId: awayTeam,
      homeScore: 0,
      awayScore: 0,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

    let queries = [Query.equal('leagueId', leagueId)];
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