import { NextRequest, NextResponse } from 'next/server';

// Mock Big 12 Service for now (will be replaced with real service when API key is available)
class MockBig12Service {
  getTeams() {
    return {
      teams: [
        { school: "Arizona Wildcats", mascot: "Wildcats", abbreviation: "ARIZ", conference: "Big 12", color: "#CC0033", altColor: "#003366" },
        { school: "Arizona State Sun Devils", mascot: "Sun Devils", abbreviation: "ASU", conference: "Big 12", color: "#8C1D40", altColor: "#FFC627" },
        { school: "Baylor Bears", mascot: "Bears", abbreviation: "BAYL", conference: "Big 12", color: "#1F4E79", altColor: "#C8102E" },
        { school: "BYU Cougars", mascot: "Cougars", abbreviation: "BYU", conference: "Big 12", color: "#002E5D", altColor: "#FFFFFF" },
        { school: "Cincinnati Bearcats", mascot: "Bearcats", abbreviation: "CIN", conference: "Big 12", color: "#E00122", altColor: "#000000" },
        { school: "Colorado Buffaloes", mascot: "Buffaloes", abbreviation: "COLO", conference: "Big 12", color: "#CFB87C", altColor: "#000000" },
        { school: "Houston Cougars", mascot: "Cougars", abbreviation: "HOU", conference: "Big 12", color: "#C8102E", altColor: "#FFFFFF" },
        { school: "Iowa State Cyclones", mascot: "Cyclones", abbreviation: "ISU", conference: "Big 12", color: "#C8102E", altColor: "#FDBB30" },
        { school: "Kansas Jayhawks", mascot: "Jayhawks", abbreviation: "KU", conference: "Big 12", color: "#0051BA", altColor: "#E8000D" },
        { school: "Kansas State Wildcats", mascot: "Wildcats", abbreviation: "KSU", conference: "Big 12", color: "#512888", altColor: "#FFFFFF" },
        { school: "Oklahoma State Cowboys", mascot: "Cowboys", abbreviation: "OKST", conference: "Big 12", color: "#FF7300", altColor: "#000000" },
        { school: "TCU Horned Frogs", mascot: "Horned Frogs", abbreviation: "TCU", conference: "Big 12", color: "#4D1979", altColor: "#FFFFFF" },
        { school: "Texas Longhorns", mascot: "Longhorns", abbreviation: "TEX", conference: "Big 12", color: "#BF5700", altColor: "#FFFFFF" },
        { school: "Texas Tech Red Raiders", mascot: "Red Raiders", abbreviation: "TTU", conference: "Big 12", color: "#CC0000", altColor: "#000000" },
        { school: "UCF Knights", mascot: "Knights", abbreviation: "UCF", conference: "Big 12", color: "#000000", altColor: "#FFC904" },
        { school: "Utah Utes", mascot: "Utes", abbreviation: "UTAH", conference: "Big 12", color: "#CC0000", altColor: "#FFFFFF" }
      ]
    };
  }

  getPlayers() {
    return {
      players: [
        { name: "Quinn Ewers", position: "QB", team: "Texas", rating: 94, conference: "Big 12" },
        { name: "Ollie Gordon II", position: "RB", team: "Oklahoma State", rating: 93, conference: "Big 12" },
        { name: "Shedeur Sanders", position: "QB", team: "Colorado", rating: 92, conference: "Big 12" },
        { name: "Travis Hunter", position: "WR", team: "Colorado", rating: 91, conference: "Big 12" },
        { name: "CJ Baxter", position: "RB", team: "Texas", rating: 92, conference: "Big 12" },
        { name: "Xavier Worthy", position: "WR", team: "Texas", rating: 93, conference: "Big 12" },
        { name: "Avery Johnson", position: "QB", team: "Kansas State", rating: 89, conference: "Big 12" },
        { name: "DJ Giddens", position: "RB", team: "Kansas State", rating: 90, conference: "Big 12" },
        { name: "Chandler Morris", position: "QB", team: "TCU", rating: 87, conference: "Big 12" },
        { name: "Emani Bailey", position: "RB", team: "TCU", rating: 88, conference: "Big 12" }
      ]
    };
  }

  getGames() {
    return {
      games: [
        { homeTeam: "Texas", awayTeam: "Oklahoma State", week: 12, date: "2024-11-16" },
        { homeTeam: "Oklahoma State", awayTeam: "Kansas State", week: 11, date: "2024-11-09" },
        { homeTeam: "TCU", awayTeam: "Baylor", week: 14, date: "2024-11-30" },
        { homeTeam: "Colorado", awayTeam: "Utah", week: 14, date: "2024-11-30" },
        { homeTeam: "Kansas State", awayTeam: "Iowa State", week: 13, date: "2024-11-23" }
      ]
    };
  }

  getStats() {
    return {
      stats: {
        totalTeams: 16,
        totalPlayers: 30,
        conferenceGames: 5,
        topTeam: "Texas Longhorns",
        topPlayer: "Quinn Ewers"
      }
    };
  }

  getDraftBoard() {
    return {
      draftBoard: [
        { rank: 1, name: "Quinn Ewers", position: "QB", team: "Texas", rating: 94 },
        { rank: 2, name: "Ollie Gordon II", position: "RB", team: "Oklahoma State", rating: 93 },
        { rank: 3, name: "Shedeur Sanders", position: "QB", team: "Colorado", rating: 92 },
        { rank: 4, name: "Travis Hunter", position: "WR", team: "Colorado", rating: 91 },
        { rank: 5, name: "CJ Baxter", position: "RB", team: "Texas", rating: 92 }
      ]
    };
  }
}

const big12Service = new MockBig12Service();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'teams';

  try {
    let data;
    
    switch (type) {
      case 'teams':
        data = big12Service.getTeams();
        break;
      case 'players':
        data = big12Service.getPlayers();
        break;
      case 'games':
        data = big12Service.getGames();
        break;
      case 'stats':
        data = big12Service.getStats();
        break;
      case 'draft-board':
        data = big12Service.getDraftBoard();
        break;
      default:
        data = big12Service.getTeams();
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Big 12 API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Big 12 data' },
      { status: 500 }
    );
  }
} 