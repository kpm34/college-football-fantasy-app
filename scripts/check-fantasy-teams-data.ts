#!/usr/bin/env tsx

import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function checkFantasyTeamsData() {
  console.log('🔍 Checking fantasy_teams data...\n');
  
  try {
    // Get some sample data from fantasy_teams
    const fantasyTeams = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [Query.limit(10)]
    );
    
    console.log(`Found ${fantasyTeams.total} total fantasy teams`);
    console.log('\nSample fantasy_teams records:');
    console.log('================================');
    
    for (const team of fantasyTeams.documents) {
      console.log(`\nTeam: ${team.name}`);
      console.log(`  ID: ${team.$id}`);
      console.log(`  League ID: ${team.leagueId}`);
      console.log(`  Owner Client ID: ${team.ownerClientId}`);
      console.log(`  Created: ${team.$createdAt}`);
    }
    
    // Check leagues too
    console.log('\n\n🏆 Checking leagues data...');
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.limit(10)]
    );
    
    console.log(`Found ${leagues.total} total leagues`);
    console.log('\nSample leagues:');
    console.log('================================');
    
    for (const league of leagues.documents) {
      console.log(`\nLeague: ${league.name}`);
      console.log(`  ID: ${league.$id}`);
      console.log(`  Commissioner: ${league.commissioner}`);
      console.log(`  Owner Client ID: ${league.ownerClientId}`);
      console.log(`  Season: ${league.season}`);
      console.log(`  Status: ${league.status}`);
      
      // Check how many teams in this league
      const teams = await databases.listDocuments(
        DATABASE_ID,
        'fantasy_teams',
        [Query.equal('leagueId', league.$id)]
      );
      console.log(`  Teams in league: ${teams.total}`);
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkFantasyTeamsData();
