import { NextRequest, NextResponse } from 'next/server';

// Mock Big Ten Service for now (will be replaced with real service when Appwrite is connected)
class MockBigTenService {
  async getBigTenTeams() {
    return [
      // East Division
      { name: "Michigan Wolverines", abbreviation: "MICH", conference: "Big Ten", division: "East", location: "Ann Arbor, MI", stadium: "Michigan Stadium", capacity: 107601, colors: ["#00274C", "#FFCB05"], mascot: "Wolverines", coach: "Sherrone Moore", established: 1879, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Ohio State Buckeyes", abbreviation: "OSU", conference: "Big Ten", division: "East", location: "Columbus, OH", stadium: "Ohio Stadium", capacity: 102780, colors: ["#BB0000", "#666666"], mascot: "Buckeyes", coach: "Ryan Day", established: 1890, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Penn State Nittany Lions", abbreviation: "PSU", conference: "Big Ten", division: "East", location: "University Park, PA", stadium: "Beaver Stadium", capacity: 106572, colors: ["#041E42", "#FFFFFF"], mascot: "Nittany Lions", coach: "James Franklin", established: 1887, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Michigan State Spartans", abbreviation: "MSU", conference: "Big Ten", division: "East", location: "East Lansing, MI", stadium: "Spartan Stadium", capacity: 75005, colors: ["#18453B", "#FFFFFF"], mascot: "Spartans", coach: "Jonathan Smith", established: 1855, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Indiana Hoosiers", abbreviation: "IND", conference: "Big Ten", division: "East", location: "Bloomington, IN", stadium: "Memorial Stadium", capacity: 52656, colors: ["#990000", "#FFFFFF"], mascot: "Hoosiers", coach: "Curt Cignetti", established: 1867, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Maryland Terrapins", abbreviation: "MD", conference: "Big Ten", division: "East", location: "College Park, MD", stadium: "SECU Stadium", capacity: 54000, colors: ["#E03A3E", "#FFD520"], mascot: "Terrapins", coach: "Mike Locksley", established: 1856, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Rutgers Scarlet Knights", abbreviation: "RUTG", conference: "Big Ten", division: "East", location: "Piscataway, NJ", stadium: "SHI Stadium", capacity: 52172, colors: ["#CC0033", "#000000"], mascot: "Scarlet Knights", coach: "Greg Schiano", established: 1869, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "UCLA Bruins", abbreviation: "UCLA", conference: "Big Ten", division: "East", location: "Los Angeles, CA", stadium: "Rose Bowl", capacity: 88700, colors: ["#2774AE", "#FFD100"], mascot: "Bruins", coach: "DeShaun Foster", established: 1919, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Washington Huskies", abbreviation: "WASH", conference: "Big Ten", division: "East", location: "Seattle, WA", stadium: "Husky Stadium", capacity: 70138, colors: ["#4B2E83", "#B7A57A"], mascot: "Huskies", coach: "Jedd Fisch", established: 1861, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      
      // West Division
      { name: "Oregon Ducks", abbreviation: "ORE", conference: "Big Ten", division: "West", location: "Eugene, OR", stadium: "Autzen Stadium", capacity: 54000, colors: ["#154733", "#FEE123"], mascot: "Ducks", coach: "Dan Lanning", established: 1894, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "USC Trojans", abbreviation: "USC", conference: "Big Ten", division: "West", location: "Los Angeles, CA", stadium: "Los Angeles Memorial Coliseum", capacity: 77500, colors: ["#990000", "#FFC72A"], mascot: "Trojans", coach: "Lincoln Riley", established: 1888, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Wisconsin Badgers", abbreviation: "WIS", conference: "Big Ten", division: "West", location: "Madison, WI", stadium: "Camp Randall Stadium", capacity: 80321, colors: ["#C5050C", "#FFFFFF"], mascot: "Badgers", coach: "Luke Fickell", established: 1849, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Iowa Hawkeyes", abbreviation: "IOWA", conference: "Big Ten", division: "West", location: "Iowa City, IA", stadium: "Kinnick Stadium", capacity: 69250, colors: ["#000000", "#FFCD00"], mascot: "Hawkeyes", coach: "Kirk Ferentz", established: 1847, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Minnesota Golden Gophers", abbreviation: "MINN", conference: "Big Ten", division: "West", location: "Minneapolis, MN", stadium: "Huntington Bank Stadium", capacity: 50805, colors: ["#7A0019", "#FFC62F"], mascot: "Golden Gophers", coach: "P.J. Fleck", established: 1851, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Nebraska Cornhuskers", abbreviation: "NEB", conference: "Big Ten", division: "West", location: "Lincoln, NE", stadium: "Memorial Stadium", capacity: 85458, colors: ["#E31837", "#FFFFFF"], mascot: "Cornhuskers", coach: "Matt Rhule", established: 1869, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Illinois Fighting Illini", abbreviation: "ILL", conference: "Big Ten", division: "West", location: "Champaign, IL", stadium: "Memorial Stadium", capacity: 60670, colors: ["#E84A27", "#13294B"], mascot: "Fighting Illini", coach: "Bret Bielema", established: 1867, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Northwestern Wildcats", abbreviation: "NU", conference: "Big Ten", division: "West", location: "Evanston, IL", stadium: "Ryan Field", capacity: 47130, colors: ["#4E2A84", "#FFFFFF"], mascot: "Wildcats", coach: "David Braun", established: 1851, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() },
      { name: "Purdue Boilermakers", abbreviation: "PUR", conference: "Big Ten", division: "West", location: "West Lafayette, IN", stadium: "Ross-Ade Stadium", capacity: 57236, colors: ["#CEB888", "#000000"], mascot: "Boilermakers", coach: "Ryan Walters", established: 1869, conference_id: "big_ten", power_4: true, created_at: new Date().toISOString() }
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