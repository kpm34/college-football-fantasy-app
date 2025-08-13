import { NextRequest, NextResponse } from 'next/server';

// Mock ACC Service
class MockACCService {
  async getACCTeams() {
    return [
      // Atlantic Division
      { name: "Florida State Seminoles", abbreviation: "FSU", conference: "ACC", division: "Atlantic", location: "Tallahassee, FL", stadium: "Doak Campbell Stadium", capacity: 79560, colors: ["#782F40", "#CEB888"], mascot: "Seminoles", coach: "Mike Norvell", established: 1851, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Clemson Tigers", abbreviation: "CLEM", conference: "ACC", division: "Atlantic", location: "Clemson, SC", stadium: "Memorial Stadium", capacity: 81500, colors: ["#F56600", "#522D80"], mascot: "Tigers", coach: "Dabo Swinney", established: 1889, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Louisville Cardinals", abbreviation: "LOU", conference: "ACC", division: "Atlantic", location: "Louisville, KY", stadium: "L&N Federal Credit Union Stadium", capacity: 60000, colors: ["#AD0000", "#000000"], mascot: "Cardinals", coach: "Jeff Brohm", established: 1798, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "NC State Wolfpack", abbreviation: "NCST", conference: "ACC", division: "Atlantic", location: "Raleigh, NC", stadium: "Carter-Finley Stadium", capacity: 57400, colors: ["#CC0000", "#000000"], mascot: "Wolfpack", coach: "Dave Doeren", established: 1887, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Boston College Eagles", abbreviation: "BC", conference: "ACC", division: "Atlantic", location: "Chestnut Hill, MA", stadium: "Alumni Stadium", capacity: 44500, colors: ["#880000", "#B8860B"], mascot: "Eagles", coach: "Bill O'Brien", established: 1863, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Syracuse Orange", abbreviation: "SYR", conference: "ACC", division: "Atlantic", location: "Syracuse, NY", stadium: "JMA Wireless Dome", capacity: 49057, colors: ["#FF4500", "#000000"], mascot: "Orange", coach: "Fran Brown", established: 1870, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Wake Forest Demon Deacons", abbreviation: "WAKE", conference: "ACC", division: "Atlantic", location: "Winston-Salem, NC", stadium: "Truist Field", capacity: 31500, colors: ["#9D2235", "#000000"], mascot: "Demon Deacons", coach: "Dave Clawson", established: 1834, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      
      // Coastal Division
      { name: "Miami Hurricanes", abbreviation: "MIA", conference: "ACC", division: "Coastal", location: "Coral Gables, FL", stadium: "Hard Rock Stadium", capacity: 65326, colors: ["#00A3E0", "#00A651"], mascot: "Hurricanes", coach: "Mario Cristobal", established: 1925, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Virginia Tech Hokies", abbreviation: "VT", conference: "ACC", division: "Coastal", location: "Blacksburg, VA", stadium: "Lane Stadium", capacity: 66233, colors: ["#862633", "#FF6600"], mascot: "Hokies", coach: "Brent Pry", established: 1872, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "North Carolina Tar Heels", abbreviation: "UNC", conference: "ACC", division: "Coastal", location: "Chapel Hill, NC", stadium: "Kenan Memorial Stadium", capacity: 50900, colors: ["#7BA7BC", "#FFFFFF"], mascot: "Tar Heels", coach: "Mack Brown", established: 1789, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Duke Blue Devils", abbreviation: "DUKE", conference: "ACC", division: "Coastal", location: "Durham, NC", stadium: "Wallace Wade Stadium", capacity: 40004, colors: ["#003087", "#FFFFFF"], mascot: "Blue Devils", coach: "Manny Diaz", established: 1838, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Georgia Tech Yellow Jackets", abbreviation: "GT", conference: "ACC", division: "Coastal", location: "Atlanta, GA", stadium: "Bobby Dodd Stadium", capacity: 55000, colors: ["#B3A369", "#003057"], mascot: "Yellow Jackets", coach: "Brent Key", established: 1885, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Pittsburgh Panthers", abbreviation: "PITT", conference: "ACC", division: "Coastal", location: "Pittsburgh, PA", stadium: "Acrisure Stadium", capacity: 68400, colors: ["#FFB81C", "#003263"], mascot: "Panthers", coach: "Pat Narduzzi", established: 1787, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Virginia Cavaliers", abbreviation: "UVA", conference: "ACC", division: "Coastal", location: "Charlottesville, VA", stadium: "Scott Stadium", capacity: 61500, colors: ["#232D4B", "#E57200"], mascot: "Cavaliers", coach: "Tony Elliott", established: 1819, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      
      // New Additions (SMU, Cal, Stanford)
      { name: "SMU Mustangs", abbreviation: "SMU", conference: "ACC", division: "Atlantic", location: "Dallas, TX", stadium: "Gerald J. Ford Stadium", capacity: 32000, colors: ["#C8102E", "#000000"], mascot: "Mustangs", coach: "Rhett Lashlee", established: 1911, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "California Golden Bears", abbreviation: "CAL", conference: "ACC", division: "Coastal", location: "Berkeley, CA", stadium: "California Memorial Stadium", capacity: 63000, colors: ["#C4820E", "#003262"], mascot: "Golden Bears", coach: "Justin Wilcox", established: 1868, conference_id: "acc", power_4: true, created_at: new Date().toISOString() },
      { name: "Stanford Cardinal", abbreviation: "STAN", conference: "ACC", division: "Coastal", location: "Stanford, CA", stadium: "Stanford Stadium", capacity: 50424, colors: ["#8C1515", "#FFFFFF"], mascot: "Cardinal", coach: "Troy Taylor", established: 1885, conference_id: "acc", power_4: true, created_at: new Date().toISOString() }
    ];
  }

  async getACCPlayers() {
    return [
      { name: "DJ Uiagalelei", position: "QB", team: "Florida State", rating: 92, conference: "ACC" },
      { name: "Cade Klubnik", position: "QB", team: "Clemson", rating: 90, conference: "ACC" },
      { name: "Tyler Van Dyke", position: "QB", team: "Miami", rating: 89, conference: "ACC" },
      { name: "Jack Plummer", position: "QB", team: "Louisville", rating: 88, conference: "ACC" },
      { name: "Brennan Armstrong", position: "QB", team: "NC State", rating: 87, conference: "ACC" },
      { name: "Trey Benson", position: "RB", team: "Florida State", rating: 93, conference: "ACC" },
      { name: "Will Shipley", position: "RB", team: "Clemson", rating: 91, conference: "ACC" },
      { name: "Jahmyr Gibbs", position: "RB", team: "Georgia Tech", rating: 90, conference: "ACC" },
      { name: "Xavier Restrepo", position: "WR", team: "Miami", rating: 92, conference: "ACC" },
      { name: "Keon Coleman", position: "WR", team: "Florida State", rating: 94, conference: "ACC" },
      { name: "Antonio Williams", position: "WR", team: "Clemson", rating: 89, conference: "ACC" },
      { name: "Tez Walker", position: "WR", team: "North Carolina", rating: 88, conference: "ACC" }
    ];
  }

  async getACCGames() {
    return [
      { homeTeam: "Florida State", awayTeam: "Clemson", week: 4, date: "2024-09-21", isConferenceGame: true },
      { homeTeam: "Miami", awayTeam: "Florida State", week: 12, date: "2024-11-16", isConferenceGame: true },
      { homeTeam: "Virginia Tech", awayTeam: "Virginia", week: 13, date: "2024-11-30", isConferenceGame: true },
      { homeTeam: "North Carolina", awayTeam: "NC State", week: 13, date: "2024-11-30", isConferenceGame: true },
      { homeTeam: "Louisville", awayTeam: "Kentucky", week: 13, date: "2024-11-30", isConferenceGame: false }
    ];
  }

  async getACCStats() {
    return {
      totalTeams: 17,
      totalPlayers: 30,
      conferenceGames: 4,
      topTeam: "Florida State Seminoles",
      topPlayer: "DJ Uiagalelei"
    };
  }
}

const accService = new MockACCService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'teams';

    let data: any;

    switch (type) {
      case 'teams':
        data = await accService.getACCTeams();
        break;
      case 'players':
        data = await accService.getACCPlayers();
        break;
      case 'games':
        data = await accService.getACCGames();
        break;
      case 'stats':
        data = await accService.getACCStats();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use: teams, players, games, or stats' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      conference: 'ACC',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ACC API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ACC data' },
      { status: 500 }
    );
  }
} 