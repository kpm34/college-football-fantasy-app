#!/usr/bin/env ts-node
/**
 * Check Database Content
 * See what data is actually in the database
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function checkDatabaseContent() {
  console.log('🔍 Checking Database Content...');
  console.log('=' .repeat(60));

  try {
    const databaseId = 'college-football-fantasy';

    // Check teams
    console.log('\n🏈 Teams in Database:');
    console.log('-'.repeat(40));
    try {
      const teams = await databases.listDocuments(databaseId, 'teams');
      console.log(`Found ${teams.total} teams:`);
      
      // Group by conference
      const teamsByConference: { [key: string]: any[] } = {};
      teams.documents.forEach((team: any) => {
        const conference = team.conference || 'Unknown';
        if (!teamsByConference[conference]) {
          teamsByConference[conference] = [];
        }
        teamsByConference[conference].push(team);
      });

      Object.keys(teamsByConference).forEach(conference => {
        console.log(`\n  ${conference} (${teamsByConference[conference].length} teams):`);
        teamsByConference[conference].forEach(team => {
          console.log(`    - ${team.school} (${team.abbreviation})`);
        });
      });
    } catch (error: any) {
      console.error(`❌ Error checking teams:`, error.message);
    }

    // Check players
    console.log('\n👥 Players in Database:');
    console.log('-'.repeat(40));
    try {
      const players = await databases.listDocuments(databaseId, 'college_players');
      console.log(`Found ${players.total} players:`);
      
      // Group by conference
      const playersByConference: { [key: string]: any[] } = {};
      players.documents.forEach((player: any) => {
        const conference = player.conference || 'Unknown';
        if (!playersByConference[conference]) {
          playersByConference[conference] = [];
        }
        playersByConference[conference].push(player);
      });

      Object.keys(playersByConference).forEach(conference => {
        console.log(`\n  ${conference} (${playersByConference[conference].length} players):`);
        playersByConference[conference].slice(0, 5).forEach(player => {
          console.log(`    - ${player.name} (${player.position}) - ${player.team} - Rating: ${player.rating}`);
        });
        if (playersByConference[conference].length > 5) {
          console.log(`    ... and ${playersByConference[conference].length - 5} more`);
        }
      });
    } catch (error: any) {
      console.error(`❌ Error checking players:`, error.message);
    }

    // Check games
    console.log('\n🏟️ Games in Database:');
    console.log('-'.repeat(40));
    try {
      const games = await databases.listDocuments(databaseId, 'games');
      console.log(`Found ${games.total} games:`);
      
      games.documents.slice(0, 10).forEach((game: any) => {
        console.log(`  - ${game.awayTeam} @ ${game.homeTeam} (Week ${game.week})`);
      });
      
      if (games.total > 10) {
        console.log(`  ... and ${games.total - 10} more games`);
      }
    } catch (error: any) {
      console.error(`❌ Error checking games:`, error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('-'.repeat(40));
    console.log('✅ Database is working and has data!');
    console.log('📊 Check the output above to see what conferences and data are available.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabaseContent(); 