import { NextRequest, NextResponse } from 'next/server';

// Mock SEC Service
class MockSECService {
  async getSECTeams() {
    return [
      // East Division
      { name: "Georgia Bulldogs", abbreviation: "UGA", conference: "SEC", division: "East", location: "Athens, GA", stadium: "Sanford Stadium", capacity: 92746, colors: ["#BA0C2F", "#000000"], mascot: "Bulldogs", coach: "Kirby Smart", established: 1785, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Florida Gators", abbreviation: "UF", conference: "SEC", division: "East", location: "Gainesville, FL", stadium: "Ben Hill Griffin Stadium", capacity: 88548, colors: ["#0021A5", "#FA4616"], mascot: "Gators", coach: "Billy Napier", established: 1853, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Tennessee Volunteers", abbreviation: "TENN", conference: "SEC", division: "East", location: "Knoxville, TN", stadium: "Neyland Stadium", capacity: 101915, colors: ["#FF8200", "#FFFFFF"], mascot: "Volunteers", coach: "Josh Heupel", established: 1794, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Kentucky Wildcats", abbreviation: "UK", conference: "SEC", division: "East", location: "Lexington, KY", stadium: "Kroger Field", capacity: 61000, colors: ["#003DA5", "#FFFFFF"], mascot: "Wildcats", coach: "Mark Stoops", established: 1865, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "South Carolina Gamecocks", abbreviation: "SC", conference: "SEC", division: "East", location: "Columbia, SC", stadium: "Williams-Brice Stadium", capacity: 77559, colors: ["#73000A", "#000000"], mascot: "Gamecocks", coach: "Shane Beamer", established: 1801, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Missouri Tigers", abbreviation: "MIZ", conference: "SEC", division: "East", location: "Columbia, MO", stadium: "Memorial Stadium", capacity: 62000, colors: ["#000000", "#F1B82D"], mascot: "Tigers", coach: "Eli Drinkwitz", established: 1839, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Vanderbilt Commodores", abbreviation: "VAN", conference: "SEC", division: "East", location: "Nashville, TN", stadium: "FirstBank Stadium", capacity: 40350, colors: ["#000000", "#B8860B"], mascot: "Commodores", coach: "Clark Lea", established: 1873, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      
      // West Division
      { name: "Alabama Crimson Tide", abbreviation: "ALA", conference: "SEC", division: "West", location: "Tuscaloosa, AL", stadium: "Bryant-Denny Stadium", capacity: 100077, colors: ["#9E1B32", "#FFFFFF"], mascot: "Crimson Tide", coach: "Kalen DeBoer", established: 1831, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "LSU Tigers", abbreviation: "LSU", conference: "SEC", division: "West", location: "Baton Rouge, LA", stadium: "Tiger Stadium", capacity: 102321, colors: ["#461D7C", "#FDB927"], mascot: "Tigers", coach: "Brian Kelly", established: 1860, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Texas A&M Aggies", abbreviation: "TAMU", conference: "SEC", division: "West", location: "College Station, TX", stadium: "Kyle Field", capacity: 102733, colors: ["#500000", "#FFFFFF"], mascot: "Aggies", coach: "Mike Elko", established: 1876, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Ole Miss Rebels", abbreviation: "MISS", conference: "SEC", division: "West", location: "Oxford, MS", stadium: "Vaught-Hemingway Stadium", capacity: 64038, colors: ["#002147", "#C41E3A"], mascot: "Rebels", coach: "Lane Kiffin", established: 1848, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Mississippi State Bulldogs", abbreviation: "MSST", conference: "SEC", division: "West", location: "Starkville, MS", stadium: "Davis Wade Stadium", capacity: 61337, colors: ["#660000", "#FFFFFF"], mascot: "Bulldogs", coach: "Jeff Lebby", established: 1878, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Arkansas Razorbacks", abbreviation: "ARK", conference: "SEC", division: "West", location: "Fayetteville, AR", stadium: "Donald W. Reynolds Razorback Stadium", capacity: 76412, colors: ["#9D2235", "#FFFFFF"], mascot: "Razorbacks", coach: "Sam Pittman", established: 1871, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Auburn Tigers", abbreviation: "AUB", conference: "SEC", division: "West", location: "Auburn, AL", stadium: "Jordan-Hare Stadium", capacity: 87451, colors: ["#0C2340", "#E31837"], mascot: "Tigers", coach: "Hugh Freeze", established: 1856, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Oklahoma Sooners", abbreviation: "OU", conference: "SEC", division: "West", location: "Norman, OK", stadium: "Gaylord Family Oklahoma Memorial Stadium", capacity: 86312, colors: ["#841617", "#FFFFFF"], mascot: "Sooners", coach: "Brent Venables", established: 1890, conference_id: "sec", power_4: true, created_at: new Date().toISOString() },
      { name: "Texas Longhorns", abbreviation: "TEX", conference: "SEC", division: "West", location: "Austin, TX", stadium: "Darrell K Royal-Texas Memorial Stadium", capacity: 100119, colors: ["#BF5700", "#FFFFFF"], mascot: "Longhorns", coach: "Steve Sarkisian", established: 1883, conference_id: "sec", power_4: true, created_at: new Date().toISOString() }
    ];
  }

  async getSECPlayers() {
    return [
      { name: "Carson Beck", position: "QB", team: "Georgia", rating: 94, conference: "SEC" },
      { name: "Quinn Ewers", position: "QB", team: "Texas", rating: 93, conference: "SEC" },
      { name: "Jaxson Dart", position: "QB", team: "Ole Miss", rating: 91, conference: "SEC" },
      { name: "Jalen Milroe", position: "QB", team: "Alabama", rating: 90, conference: "SEC" },
      { name: "Brady Cook", position: "QB", team: "Missouri", rating: 89, conference: "SEC" },
      { name: "Trevor Etienne", position: "RB", team: "Georgia", rating: 92, conference: "SEC" },
      { name: "Judd Haynes", position: "RB", team: "Texas A&M", rating: 91, conference: "SEC" },
      { name: "Raheim Sanders", position: "RB", team: "Arkansas", rating: 90, conference: "SEC" },
      { name: "Luther Burden III", position: "WR", team: "Missouri", rating: 95, conference: "SEC" },
      { name: "Evan Stewart", position: "WR", team: "Texas A&M", rating: 93, conference: "SEC" },
      { name: "Tre Harris", position: "WR", team: "Ole Miss", rating: 92, conference: "SEC" },
      { name: "Bru McCoy", position: "WR", team: "Tennessee", rating: 91, conference: "SEC" }
    ];
  }

  async getSECGames() {
    return [
      { homeTeam: "Georgia", awayTeam: "Florida", week: 9, date: "2024-11-02", isConferenceGame: true },
      { homeTeam: "Alabama", awayTeam: "Auburn", week: 13, date: "2024-11-30", isConferenceGame: true },
      { homeTeam: "LSU", awayTeam: "Texas A&M", week: 13, date: "2024-11-30", isConferenceGame: true },
      { homeTeam: "Texas", awayTeam: "Oklahoma", week: 7, date: "2024-10-19", isConferenceGame: true },
      { homeTeam: "Tennessee", awayTeam: "Kentucky", week: 10, date: "2024-11-09", isConferenceGame: true }
    ];
  }

  async getSECStats() {
    return {
      totalTeams: 16,
      totalPlayers: 30,
      conferenceGames: 5,
      topTeam: "Georgia Bulldogs",
      topPlayer: "Carson Beck"
    };
  }
}

const secService = new MockSECService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'teams';

    let data: any;

    switch (type) {
      case 'teams':
        data = await secService.getSECTeams();
        break;
      case 'players':
        data = await secService.getSECPlayers();
        break;
      case 'games':
        data = await secService.getSECGames();
        break;
      case 'stats':
        data = await secService.getSECStats();
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
      conference: 'SEC',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SEC API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEC data' },
      { status: 500 }
    );
  }
} 