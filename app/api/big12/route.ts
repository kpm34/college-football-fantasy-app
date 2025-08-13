import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

// Big 12 teams data
const BIG12_TEAMS = [
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
  { school: "Utah Utes", mascot: "Utes", abbreviation: "UTAH", conference: "Big 12", color: "#CC0000", altColor: "#FFFFFF" },
  { school: "West Virginia Mountaineers", mascot: "Mountaineers", abbreviation: "WVU", conference: "Big 12", color: "#002855", altColor: "#EAAA00" }
];

class Big12Service {
  getTeams() {
    return { teams: BIG12_TEAMS };
  }

  async getPlayers() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'college_players',
        [
          Query.equal('conference', 'Big 12'),
          Query.equal('draftable', true),
          Query.orderDesc('rating'),
          Query.limit(100)
        ]
      );

      return { 
        players: response.documents,
        total: response.total 
      };
    } catch (error) {
      console.error('Error fetching Big 12 players:', error);
      // Fallback to mock data
      return {
        players: [
          { name: "Quinn Ewers", position: "QB", team: "Texas", rating: 94, conference: "Big 12" },
          { name: "Ollie Gordon II", position: "RB", team: "Oklahoma State", rating: 93, conference: "Big 12" },
          { name: "Avery Johnson", position: "QB", team: "Kansas State", rating: 89, conference: "Big 12" },
          { name: "DJ Giddens", position: "RB", team: "Kansas State", rating: 90, conference: "Big 12" }
        ],
        total: 4
      };
    }
  }

  async getGames() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'games',
        [
          Query.equal('homeConference', 'Big 12'),
          Query.orderDesc('startDate'),
          Query.limit(20)
        ]
      );

      return { 
        games: response.documents,
        total: response.total 
      };
    } catch (error) {
      console.error('Error fetching Big 12 games:', error);
      // Fallback to mock data
      return {
        games: [
          { homeTeam: "Texas", awayTeam: "Oklahoma State", week: 12, date: "2024-11-16" },
          { homeTeam: "Oklahoma State", awayTeam: "Kansas State", week: 11, date: "2024-11-09" }
        ],
        total: 2
      };
    }
  }

  async getStats() {
    try {
      const [players, teams, games] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'college_players', [
          Query.equal('conference', 'Big 12'),
          Query.limit(1)
        ]),
        databases.listDocuments(DATABASE_ID, 'teams', [
          Query.equal('conference', 'Big 12'),
          Query.limit(1)
        ]),
        databases.listDocuments(DATABASE_ID, 'games', [
          Query.equal('homeConference', 'Big 12'),
          Query.limit(1)
        ])
      ]);

      return {
        stats: {
          totalTeams: BIG12_TEAMS.length,
          totalPlayers: players.total,
          conferenceGames: games.total,
          topTeam: "Texas Longhorns",
          topPlayer: players.documents[0]?.name || "Quinn Ewers"
        }
      };
    } catch (error) {
      console.error('Error fetching Big 12 stats:', error);
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
  }

  async getDraftBoard() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'college_players',
        [
          Query.equal('conference', 'Big 12'),
          Query.equal('draftable', true),
          Query.orderDesc('rating'),
          Query.limit(20)
        ]
      );

      const draftBoard = response.documents.map((player, index) => ({
        rank: index + 1,
        name: player.name,
        position: player.position,
        team: player.team,
        rating: player.rating,
        year: player.year
      }));

      return { draftBoard };
    } catch (error) {
      console.error('Error fetching Big 12 draft board:', error);
      // Fallback to mock data
      return {
        draftBoard: [
          { rank: 1, name: "Quinn Ewers", position: "QB", team: "Texas", rating: 94 },
          { rank: 2, name: "Ollie Gordon II", position: "RB", team: "Oklahoma State", rating: 93 }
        ]
      };
    }
  }
}

const big12Service = new Big12Service();

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
        data = await big12Service.getPlayers();
        break;
      case 'games':
        data = await big12Service.getGames();
        break;
      case 'stats':
        data = await big12Service.getStats();
        break;
      case 'draft-board':
        data = await big12Service.getDraftBoard();
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