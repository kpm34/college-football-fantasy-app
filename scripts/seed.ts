#!/usr/bin/env tsx

/**
 * Database Seeder
 * 
 * Seeds database with sample data for development and preview environments.
 * Only runs on PR environments - never production.
 */

import 'dotenv/config';
import { Client, Databases, ID } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || "college-football-fantasy";

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

// Safety check - only run on preview environments
const isPreview = project.includes('preview') || project.includes('test') || process.env.NODE_ENV === 'test';

if (!isPreview && process.env.FORCE_SEED !== 'true') {
  console.log('🛡️ Seed skipped - not a preview environment');
  console.log('Use FORCE_SEED=true to override');
  process.exit(0);
}

const SAMPLE_TEAMS = [
  { name: 'Alabama Crimson Tide', abbreviation: 'ALA', conference: 'SEC', color: '#9E1B32' },
  { name: 'Georgia Bulldogs', abbreviation: 'UGA', conference: 'SEC', color: '#BA0C2F' },
  { name: 'Clemson Tigers', abbreviation: 'CLEM', conference: 'ACC', color: '#F56600' },
  { name: 'Florida State Seminoles', abbreviation: 'FSU', conference: 'ACC', color: '#782F40' },
  { name: 'Ohio State Buckeyes', abbreviation: 'OSU', conference: 'Big Ten', color: '#BB0000' },
  { name: 'Michigan Wolverines', abbreviation: 'MICH', conference: 'Big Ten', color: '#00274C' },
  { name: 'Texas Longhorns', abbreviation: 'TEX', conference: 'SEC', color: '#BF5700' },
  { name: 'Oklahoma Sooners', abbreviation: 'OU', conference: 'SEC', color: '#841617' },
];

const SAMPLE_PLAYERS = [
  // QBs
  { name: 'Carson Beck', position: 'QB', team: 'UGA', conference: 'SEC', fantasy_points: 285, depth_chart_order: 1 },
  { name: 'Quinn Ewers', position: 'QB', team: 'TEX', conference: 'SEC', fantasy_points: 278, depth_chart_order: 1 },
  { name: 'Will Howard', position: 'QB', team: 'OSU', conference: 'Big Ten', fantasy_points: 265, depth_chart_order: 1 },
  { name: 'DJ Uiagalelei', position: 'QB', team: 'FSU', conference: 'ACC', fantasy_points: 245, depth_chart_order: 1 },
  
  // RBs  
  { name: 'Trevor Etienne', position: 'RB', team: 'UGA', conference: 'SEC', fantasy_points: 198, depth_chart_order: 1 },
  { name: 'CJ Donaldson', position: 'RB', team: 'TEX', conference: 'SEC', fantasy_points: 185, depth_chart_order: 1 },
  { name: 'TreVeyon Henderson', position: 'RB', team: 'OSU', conference: 'Big Ten', fantasy_points: 175, depth_chart_order: 1 },
  { name: 'Lawrance Toafili', position: 'RB', team: 'FSU', conference: 'ACC', fantasy_points: 165, depth_chart_order: 1 },
  
  // WRs
  { name: 'Arian Smith', position: 'WR', team: 'UGA', conference: 'SEC', fantasy_points: 145, depth_chart_order: 1 },
  { name: 'Jordan Whittington', position: 'WR', team: 'TEX', conference: 'SEC', fantasy_points: 142, depth_chart_order: 1 },
  { name: 'Emeka Egbuka', position: 'WR', team: 'OSU', conference: 'Big Ten', fantasy_points: 138, depth_chart_order: 1 },
  { name: 'Keon Coleman', position: 'WR', team: 'FSU', conference: 'ACC', fantasy_points: 135, depth_chart_order: 1 },
];

const SAMPLE_LEAGUES = [
  {
    name: 'Power 4 Championship',
    commissioner: 'demo-user-1',
    season: 2025,
    maxTeams: 12,
    draftType: 'snake',
    gameMode: 'power4',
    status: 'open',
    isPublic: true,
    description: 'Competitive league for serious fantasy players'
  },
  {
    name: 'SEC Supremacy',
    commissioner: 'demo-user-2', 
    season: 2025,
    maxTeams: 10,
    draftType: 'auction',
    gameMode: 'sec',
    status: 'drafting',
    isPublic: true,
    description: 'SEC-only fantasy league'
  }
];

async function clearCollection(collectionId: string): Promise<void> {
  try {
    const result = await db.listDocuments(databaseId, collectionId);
    
    for (const doc of result.documents) {
      await db.deleteDocument(databaseId, collectionId, doc.$id);
    }
    
    console.log(`  🗑️  Cleared ${result.documents.length} documents from ${collectionId}`);
  } catch (error) {
    console.warn(`  ⚠️ Could not clear ${collectionId}:`, error);
  }
}

async function seedTeams(): Promise<void> {
  console.log('\n🏈 Seeding Teams...');
  
  for (const team of SAMPLE_TEAMS) {
    try {
      await db.createDocument(databaseId, 'teams', ID.unique(), team);
      console.log(`  ➕ Added ${team.name}`);
    } catch (error) {
      console.warn(`  ⚠️ Could not add ${team.name}:`, error);
    }
  }
}

async function seedPlayers(): Promise<void> {
  console.log('\n⭐ Seeding Players...');
  
  for (const player of SAMPLE_PLAYERS) {
    try {
      await db.createDocument(databaseId, 'college_players', ID.unique(), {
        ...player,
        eligible: true
      });
      console.log(`  ➕ Added ${player.name} (${player.position})`);
    } catch (error) {
      console.warn(`  ⚠️ Could not add ${player.name}:`, error);
    }
  }
}

async function seedLeagues(): Promise<void> {
  console.log('\n🏆 Seeding Leagues...');
  
  for (const league of SAMPLE_LEAGUES) {
    try {
      await db.createDocument(databaseId, 'leagues', ID.unique(), {
        ...league,
        currentTeams: 0,
        created_at: new Date().toISOString()
      });
      console.log(`  ➕ Added "${league.name}"`);
    } catch (error) {
      console.warn(`  ⚠️ Could not add "${league.name}":`, error);
    }
  }
}

async function seedGames(): Promise<void> {
  console.log('\n🎮 Seeding Sample Games...');
  
  const sampleGames = [
    {
      week: 1,
      season: 2025,
      home_team: 'UGA',
      away_team: 'ALA', 
      start_date: new Date('2025-08-30T19:00:00Z').toISOString(),
      completed: false,
      eligible_game: true
    },
    {
      week: 1,
      season: 2025,
      home_team: 'TEX',
      away_team: 'OU',
      start_date: new Date('2025-08-30T15:30:00Z').toISOString(), 
      completed: false,
      eligible_game: true
    },
    {
      week: 1,
      season: 2025,
      home_team: 'OSU',
      away_team: 'MICH',
      start_date: new Date('2025-08-30T12:00:00Z').toISOString(),
      completed: false,
      eligible_game: true
    }
  ];
  
  for (const game of sampleGames) {
    try {
      await db.createDocument(databaseId, 'games', ID.unique(), game);
      console.log(`  ➕ Added ${game.away_team} @ ${game.home_team}`);
    } catch (error) {
      console.warn(`  ⚠️ Could not add game:`, error);
    }
  }
}

async function seed(): Promise<void> {
  console.log('🌱 Seeding Preview Database...');
  console.log('════════════════════════════════');
  console.log(`📊 Database: ${databaseId}`);
  console.log(`🔧 Project: ${project}`);
  
  try {
    // Clear existing data (preview only!)
    console.log('\n🗑️  Clearing existing data...');
    await clearCollection('games');
    await clearCollection('rosters');
    await clearCollection('leagues');
    await clearCollection('college_players');
    await clearCollection('teams');
    
    // Seed fresh data
    await seedTeams();
    await seedPlayers();
    await seedLeagues();
    await seedGames();
    
    console.log('\n🎉 Database seeded successfully!');
    console.log(`✅ Teams: ${SAMPLE_TEAMS.length}`);
    console.log(`✅ Players: ${SAMPLE_PLAYERS.length}`);
    console.log(`✅ Leagues: ${SAMPLE_LEAGUES.length}`);
    console.log(`✅ Games: 3`);
    
  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  seed();
}

export { seed };