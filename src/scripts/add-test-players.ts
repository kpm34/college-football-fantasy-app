import { databases, DATABASE_ID } from '../config/appwrite.config';
import { ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

// Test players for Big 12 teams
const testPlayers = [
  {
    espnId: 'test-1',
    cfbdId: 'test-1',
    firstName: 'Dillon',
    lastName: 'Gabriel',
    displayName: 'Dillon Gabriel',
    jersey: '8',
    position: 'Quarterback',
    fantasyPosition: 'QB',
    team: 'Oklahoma State',
    teamId: 'okst',
    conference: 'Big 12',
    height: '5-11',
    weight: 200,
    class: 'Senior',
    depthChartPosition: 1,
    isStarter: true,
    eligibleForWeek: true,
    injuryStatus: 'healthy',
    seasonStats: JSON.stringify({
      games: 0,
      passing: {
        attempts: 0,
        completions: 0,
        yards: 0,
        touchdowns: 0,
        interceptions: 0,
        rating: 0
      }
    }),
    weeklyProjections: JSON.stringify([
      {
        week: 1,
        opponent: 'Central Arkansas',
        projectedPoints: 22.5,
        confidence: 'high',
        notes: 'Season opener against FCS opponent'
      }
    ]),
    fantasyPoints: 0,
    lastUpdated: new Date().toISOString(),
    dataSource: 'Manual Entry'
  },
  {
    espnId: 'test-2',
    cfbdId: 'test-2',
    firstName: 'Ollie',
    lastName: 'Gordon II',
    displayName: 'Ollie Gordon II',
    jersey: '0',
    position: 'Running Back',
    fantasyPosition: 'RB',
    team: 'Oklahoma State',
    teamId: 'okst',
    conference: 'Big 12',
    height: '6-1',
    weight: 225,
    class: 'Junior',
    depthChartPosition: 1,
    isStarter: true,
    eligibleForWeek: true,
    injuryStatus: 'healthy',
    seasonStats: JSON.stringify({
      games: 0,
      rushing: {
        attempts: 0,
        yards: 0,
        touchdowns: 0,
        yardsPerCarry: 0
      },
      receiving: {
        targets: 0,
        receptions: 0,
        yards: 0,
        touchdowns: 0,
        yardsPerReception: 0
      }
    }),
    weeklyProjections: JSON.stringify([
      {
        week: 1,
        opponent: 'Central Arkansas',
        projectedPoints: 18.5,
        confidence: 'high',
        notes: 'Doak Walker Award winner returns'
      }
    ]),
    fantasyPoints: 0,
    lastUpdated: new Date().toISOString(),
    dataSource: 'Manual Entry'
  },
  {
    espnId: 'test-3',
    cfbdId: 'test-3',
    firstName: 'Xavier',
    lastName: 'Worthy',
    displayName: 'Xavier Worthy',
    jersey: '1',
    position: 'Wide Receiver',
    fantasyPosition: 'WR',
    team: 'Texas',
    teamId: 'tex',
    conference: 'Big 12',
    height: '6-1',
    weight: 165,
    class: 'Junior',
    depthChartPosition: 1,
    isStarter: true,
    eligibleForWeek: true,
    injuryStatus: 'healthy',
    seasonStats: JSON.stringify({
      games: 0,
      receiving: {
        targets: 0,
        receptions: 0,
        yards: 0,
        touchdowns: 0,
        yardsPerReception: 0
      }
    }),
    weeklyProjections: JSON.stringify([
      {
        week: 1,
        opponent: 'Rice',
        projectedPoints: 16.2,
        confidence: 'high',
        notes: 'Elite speedster in high-powered offense'
      }
    ]),
    fantasyPoints: 0,
    lastUpdated: new Date().toISOString(),
    dataSource: 'Manual Entry'
  },
  {
    espnId: 'test-4',
    cfbdId: 'test-4',
    firstName: 'Ja\'Tavion',
    lastName: 'Sanders',
    displayName: 'Ja\'Tavion Sanders',
    jersey: '0',
    position: 'Tight End',
    fantasyPosition: 'TE',
    team: 'Texas',
    teamId: 'tex',
    conference: 'Big 12',
    height: '6-4',
    weight: 245,
    class: 'Junior',
    depthChartPosition: 1,
    isStarter: true,
    eligibleForWeek: true,
    injuryStatus: 'healthy',
    seasonStats: JSON.stringify({
      games: 0,
      receiving: {
        targets: 0,
        receptions: 0,
        yards: 0,
        touchdowns: 0,
        yardsPerReception: 0
      }
    }),
    weeklyProjections: JSON.stringify([
      {
        week: 1,
        opponent: 'Rice',
        projectedPoints: 10.5,
        confidence: 'medium',
        notes: 'Top tight end in the conference'
      }
    ]),
    fantasyPoints: 0,
    lastUpdated: new Date().toISOString(),
    dataSource: 'Manual Entry'
  },
  {
    espnId: 'test-5',
    cfbdId: 'test-5',
    firstName: 'Will',
    lastName: 'Ferrin',
    displayName: 'Will Ferrin',
    jersey: '44',
    position: 'Kicker',
    fantasyPosition: 'K',
    team: 'BYU',
    teamId: 'byu',
    conference: 'Big 12',
    height: '6-0',
    weight: 180,
    class: 'Sophomore',
    depthChartPosition: 1,
    isStarter: true,
    eligibleForWeek: true,
    injuryStatus: 'healthy',
    seasonStats: JSON.stringify({
      games: 0,
      kicking: {
        fieldGoals: 0,
        fieldGoalAttempts: 0,
        extraPoints: 0,
        extraPointAttempts: 0
      }
    }),
    weeklyProjections: JSON.stringify([
      {
        week: 1,
        opponent: 'Sam Houston State',
        projectedPoints: 8.0,
        confidence: 'medium',
        notes: 'Reliable kicker in conservative offense'
      }
    ]),
    fantasyPoints: 0,
    lastUpdated: new Date().toISOString(),
    dataSource: 'Manual Entry'
  }
];

async function addTestPlayers() {
  console.log('Adding test players to Appwrite...\n');
  
  for (const player of testPlayers) {
    try {
      const document = await databases.createDocument(
        DATABASE_ID,
        'college_players',
        ID.unique(),
        player
      );
      
      console.log(`✅ Added ${player.displayName} (${player.position}) - ${player.team}`);
    } catch (error: any) {
      console.error(`❌ Failed to add ${player.displayName}:`, error.message);
    }
  }
  
  console.log('\n✅ Test data added successfully!');
}

// Run the script
addTestPlayers().catch(console.error);