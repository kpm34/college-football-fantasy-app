import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

interface WeeklyScoringRequest {
  week?: number;
  seasonYear?: number;
  force?: boolean;
}

interface PlayerStats {
  player_id: string;
  week: number;
  season: number;
  passing_yards: number;
  passing_tds: number;
  interceptions: number;
  rushing_yards: number;
  rushing_tds: number;
  receiving_yards: number;
  receiving_tds: number;
  receptions: number;
  field_goals: number;
  extra_points: number;
  fantasy_points: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: WeeklyScoringRequest = await request.json();
    const { week, seasonYear = 2025, force = false } = body;

    console.log(`🏈 Starting weekly scoring calculation for week ${week || 'auto'}...`);

    // Determine which week to process
    let targetWeek = week;
    if (!targetWeek) {
      targetWeek = await determineCompletedWeek(seasonYear);
    }

    if (!targetWeek) {
      return NextResponse.json({
        success: false,
        message: 'No completed week found to process'
      });
    }

    console.log(`📊 Processing week ${targetWeek} for season ${seasonYear}`);

    // Get all leagues for this season
    const leaguesResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.equal('season_year', seasonYear)]
    );

    const leagues = leaguesResponse.documents;
    console.log(`🏆 Found ${leagues.length} leagues to process`);

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const league of leagues) {
      try {
        const result = await processLeagueWeek(league.$id, targetWeek, seasonYear);
        totalProcessed += result.processed;
        totalErrors += result.errors;
      } catch (error) {
        console.error(`Error processing league ${league.$id}:`, error);
        totalErrors++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        week: targetWeek,
        season: seasonYear,
        leagues_processed: leagues.length,
        total_matchups_processed: totalProcessed,
        errors: totalErrors
      },
      message: `Successfully processed week ${targetWeek} scoring`
    });

  } catch (error) {
    console.error('Error in weekly scoring:', error);
    return NextResponse.json(
      { error: 'Failed to process weekly scoring', details: error.message },
      { status: 500 }
    );
  }
}

async function determineCompletedWeek(seasonYear: number): Promise<number | null> {
  try {
    // Get all games for the season
    const gamesResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GAMES,
      [
        Query.equal('season', seasonYear),
        Query.equal('status', 'final')
      ]
    );

    if (gamesResponse.documents.length === 0) {
      return null;
    }

    // Find the highest week with completed games
    const completedWeeks = gamesResponse.documents.map(game => game.week);
    const maxWeek = Math.max(...completedWeeks);

    return maxWeek;
  } catch (error) {
    console.error('Error determining completed week:', error);
    return null;
  }
}

async function processLeagueWeek(leagueId: string, week: number, seasonYear: number) {
  console.log(`🏈 Processing league ${leagueId} week ${week}`);

  // Get all matchups for this league and week
  const matchupsResponse = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.MATCHUPS,
    [
      Query.equal('league_id', leagueId),
      Query.equal('week', week)
    ]
  );

  const matchups = matchupsResponse.documents;
  let processed = 0;
  let errors = 0;

  for (const matchup of matchups) {
    try {
      await processMatchup(matchup, week, seasonYear);
      processed++;
    } catch (error) {
      console.error(`Error processing matchup ${matchup.$id}:`, error);
      errors++;
    }
  }

  // Update league standings
  await updateLeagueStandings(leagueId);

  return { processed, errors };
}

async function processMatchup(matchup: any, week: number, seasonYear: number) {
  const homeTeamId = matchup.home_team_id;
  const awayTeamId = matchup.away_team_id;

  // Calculate scores for both teams
  const homeScore = await calculateTeamScore(homeTeamId, week, seasonYear);
  const awayScore = await calculateTeamScore(awayTeamId, week, seasonYear);

  // Update matchup with scores
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.MATCHUPS,
    matchup.$id,
    {
      home_score: homeScore,
      away_score: awayScore,
      status: 'final',
      updated_at: new Date().toISOString()
    }
  );

  // Update team records
  await updateTeamRecord(homeTeamId, homeScore, awayScore);
  await updateTeamRecord(awayTeamId, awayScore, homeScore);
}

async function calculateTeamScore(teamId: string, week: number, seasonYear: number): Promise<number> {
  try {
    // Get team's roster for this week
    const rosterResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('team_id', teamId)]
    );

    if (rosterResponse.documents.length === 0) {
      return 0;
    }

    const roster = rosterResponse.documents[0];
    const starterPlayerIds = roster.starters || [];

    let totalScore = 0;

    // Calculate fantasy points for each starter
    for (const playerId of starterPlayerIds) {
      const playerScore = await calculatePlayerScore(playerId, week, seasonYear);
      totalScore += playerScore;
    }

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error(`Error calculating team score for ${teamId}:`, error);
    return 0;
  }
}

async function calculatePlayerScore(playerId: string, week: number, seasonYear: number): Promise<number> {
  try {
    // Get player stats for this week
    const statsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYER_STATS,
      [
        Query.equal('player_id', playerId),
        Query.equal('week', week),
        Query.equal('season', seasonYear)
      ]
    );

    if (statsResponse.documents.length === 0) {
      return 0;
    }

    const stats = statsResponse.documents[0];
    
    // Calculate fantasy points based on scoring settings
    // This would use the league's scoring settings
    const fantasyPoints = calculateFantasyPoints(stats);
    
    return fantasyPoints;
  } catch (error) {
    console.error(`Error calculating player score for ${playerId}:`, error);
    return 0;
  }
}

function calculateFantasyPoints(stats: any): number {
  // Default scoring (can be overridden by league settings)
  const scoring = {
    pass_yd: 0.04,
    pass_td: 4,
    int: -2,
    rush_yd: 0.1,
    rush_td: 6,
    rec_yd: 0.1,
    rec_td: 6,
    rec: 1, // PPR
    fg_0_19: 3,
    fg_20_29: 3,
    fg_30_39: 3,
    fg_40_49: 4,
    fg_50_plus: 5,
    xp: 1
  };

  let points = 0;

  // Passing points
  points += (stats.passing_yards || 0) * scoring.pass_yd;
  points += (stats.passing_tds || 0) * scoring.pass_td;
  points += (stats.interceptions || 0) * scoring.int;

  // Rushing points
  points += (stats.rushing_yards || 0) * scoring.rush_yd;
  points += (stats.rushing_tds || 0) * scoring.rush_td;

  // Receiving points
  points += (stats.receiving_yards || 0) * scoring.rec_yd;
  points += (stats.receiving_tds || 0) * scoring.rec_td;
  points += (stats.receptions || 0) * scoring.rec;

  // Kicking points
  points += (stats.field_goals || 0) * scoring.fg_30_39; // Simplified
  points += (stats.extra_points || 0) * scoring.xp;

  return Math.round(points * 100) / 100;
}

async function updateTeamRecord(teamId: string, pointsFor: number, pointsAgainst: number) {
  try {
    const teamResponse = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.TEAMS,
      teamId
    );

    const currentRecord = teamResponse.record || { wins: 0, losses: 0, ties: 0 };
    const currentPointsFor = teamResponse.points_for || 0;
    const currentPointsAgainst = teamResponse.points_against || 0;

    // Update points
    const newPointsFor = currentPointsFor + pointsFor;
    const newPointsAgainst = currentPointsAgainst + pointsAgainst;

    // Update record (this would need to be determined by matchup result)
    // For now, just update points
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TEAMS,
      teamId,
      {
        points_for: newPointsFor,
        points_against: newPointsAgainst,
        updated_at: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error(`Error updating team record for ${teamId}:`, error);
  }
}

async function updateLeagueStandings(leagueId: string) {
  try {
    // Get all teams in the league
    const teamsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TEAMS,
      [Query.equal('league_id', leagueId)]
    );

    const teams = teamsResponse.documents;

    // Sort teams by points for (descending)
    const sortedTeams = teams.sort((a, b) => (b.points_for || 0) - (a.points_for || 0));

    // Create standings cache
    const standingsCache = sortedTeams.map((team, index) => ({
      rank: index + 1,
      team_id: team.$id,
      team_name: team.name,
      record: team.record,
      points_for: team.points_for,
      points_against: team.points_against
    }));

    // Update league with standings cache
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      {
        standings_cache: standingsCache,
        updated_at: new Date().toISOString()
      }
    );

    console.log(`📊 Updated standings for league ${leagueId}`);
  } catch (error) {
    console.error(`Error updating standings for league ${leagueId}:`, error);
  }
} 