import { NextRequest, NextResponse } from 'next/server';

// Mock Big Ten Service for now (will be replaced with real service when Appwrite is connected)
class MockBigTenService {
  async getBigTenTeams() {
    return [
      {
        name: "Michigan Wolverines",
        abbreviation: "MICH",
        conference: "Big Ten",
        division: "East",
        location: "Ann Arbor, MI",
        stadium: "Michigan Stadium",
        capacity: 107601,
        colors: ["#00274C", "#FFCB05"],
        mascot: "Wolverines",
        coach: "Sherrone Moore",
        established: 1879,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "Ohio State Buckeyes",
        abbreviation: "OSU",
        conference: "Big Ten",
        division: "East",
        location: "Columbus, OH",
        stadium: "Ohio Stadium",
        capacity: 102780,
        colors: ["#BB0000", "#666666"],
        mascot: "Buckeyes",
        coach: "Ryan Day",
        established: 1890,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "Penn State Nittany Lions",
        abbreviation: "PSU",
        conference: "Big Ten",
        division: "East",
        location: "University Park, PA",
        stadium: "Beaver Stadium",
        capacity: 106572,
        colors: ["#041E42", "#FFFFFF"],
        mascot: "Nittany Lions",
        coach: "James Franklin",
        established: 1887,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "Oregon Ducks",
        abbreviation: "ORE",
        conference: "Big Ten",
        division: "West",
        location: "Eugene, OR",
        stadium: "Autzen Stadium",
        capacity: 54000,
        colors: ["#154733", "#FEE123"],
        mascot: "Ducks",
        coach: "Dan Lanning",
        established: 1894,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "USC Trojans",
        abbreviation: "USC",
        conference: "Big Ten",
        division: "West",
        location: "Los Angeles, CA",
        stadium: "Los Angeles Memorial Coliseum",
        capacity: 77500,
        colors: ["#990000", "#FFC72A"],
        mascot: "Trojans",
        coach: "Lincoln Riley",
        established: 1888,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  async getBigTenPlayers() {
    return [
      {
        name: "J.J. McCarthy",
        position: "QB",
        team: "Michigan",
        team_abbreviation: "MICH",
        conference: "Big Ten",
        year: "Junior",
        rating: 95,
        draftable: true,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "Blake Corum",
        position: "RB",
        team: "Michigan",
        team_abbreviation: "MICH",
        conference: "Big Ten",
        year: "Senior",
        rating: 94,
        draftable: true,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "Marvin Harrison Jr.",
        position: "WR",
        team: "Ohio State",
        team_abbreviation: "OSU",
        conference: "Big Ten",
        year: "Junior",
        rating: 96,
        draftable: true,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "TreVeyon Henderson",
        position: "RB",
        team: "Ohio State",
        team_abbreviation: "OSU",
        conference: "Big Ten",
        year: "Junior",
        rating: 94,
        draftable: true,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      },
      {
        name: "Drew Allar",
        position: "QB",
        team: "Penn State",
        team_abbreviation: "PSU",
        conference: "Big Ten",
        year: "Sophomore",
        rating: 91,
        draftable: true,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  async getBigTenGames() {
    return [
      {
        home_team: "Michigan",
        away_team: "Ohio State",
        date: "2024-11-30",
        time: "15:30",
        venue: "Ohio Stadium",
        conference_game: true,
        rivalry: true,
        week: 14,
        season: 2024,
        conference: "Big Ten",
        status: "scheduled",
        created_at: new Date().toISOString()
      },
      {
        home_team: "Penn State",
        away_team: "Michigan",
        date: "2024-11-09",
        time: "19:30",
        venue: "Beaver Stadium",
        conference_game: true,
        rivalry: true,
        week: 12,
        season: 2024,
        conference: "Big Ten",
        status: "scheduled",
        created_at: new Date().toISOString()
      },
      {
        home_team: "Oregon",
        away_team: "Washington",
        date: "2024-11-30",
        time: "16:30",
        venue: "Autzen Stadium",
        conference_game: true,
        rivalry: true,
        week: 14,
        season: 2024,
        conference: "Big Ten",
        status: "scheduled",
        created_at: new Date().toISOString()
      }
    ];
  }

  async getBigTenStats() {
    return {
      totalTeams: 18,
      totalPlayers: 40,
      totalGames: 3,
      eastTeams: 9,
      westTeams: 9,
      topRatedPlayer: {
        name: "Marvin Harrison Jr.",
        position: "WR",
        team: "Ohio State",
        team_abbreviation: "OSU",
        conference: "Big Ten",
        year: "Junior",
        rating: 96,
        draftable: true,
        conference_id: "big_ten",
        power_4: true,
        created_at: new Date().toISOString()
      }
    };
  }
}

const bigTenService = new MockBigTenService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'teams';
    const division = searchParams.get('division');
    const team = searchParams.get('team');
    const position = searchParams.get('position');
    const week = searchParams.get('week');

    let data: any;

    switch (type) {
      case 'teams':
        if (division) {
          // Filter by division (mock implementation)
          const allTeams = await bigTenService.getBigTenTeams();
          data = allTeams.filter(team => team.division === division);
        } else {
          data = await bigTenService.getBigTenTeams();
        }
        break;

      case 'players':
        if (team) {
          // Filter by team (mock implementation)
          const allPlayers = await bigTenService.getBigTenPlayers();
          data = allPlayers.filter(player => player.team === team);
        } else if (position) {
          // Filter by position (mock implementation)
          const allPlayers = await bigTenService.getBigTenPlayers();
          data = allPlayers.filter(player => player.position === position);
        } else {
          data = await bigTenService.getBigTenPlayers();
        }
        break;

      case 'games':
        if (week) {
          // Filter by week (mock implementation)
          const allGames = await bigTenService.getBigTenGames();
          data = allGames.filter(game => game.week === parseInt(week));
        } else {
          data = await bigTenService.getBigTenGames();
        }
        break;

      case 'stats':
        data = await bigTenService.getBigTenStats();
        break;

      case 'draft-board':
        // Get players sorted by rating (mock implementation)
        const allPlayers = await bigTenService.getBigTenPlayers();
        data = allPlayers.sort((a, b) => b.rating - a.rating);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use: teams, players, games, stats, or draft-board' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      conference: 'Big Ten',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Big Ten API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Big Ten data' },
      { status: 500 }
    );
  }
} 