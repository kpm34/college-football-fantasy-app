#!/usr/bin/env ts-node
/**
 * Check Players by Conference
 * Detailed breakdown of players in the database by conference
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

async function checkPlayersByConference() {
  console.log('🔍 Checking Players by Conference...');
  console.log('=' .repeat(60));

  try {
    const databaseId = 'college-football-fantasy';

    // Get all players
    console.log('\n👥 All Players in Database:');
    console.log('-'.repeat(40));
    
    const players = await databases.listDocuments(databaseId, 'college_players');
    console.log(`Found ${players.total} total players:`);
    
    // Group by conference
    const playersByConference: { [key: string]: any[] } = {};
    players.documents.forEach((player: any) => {
      const conference = player.conference || 'Unknown';
      if (!playersByConference[conference]) {
        playersByConference[conference] = [];
      }
      playersByConference[conference].push(player);
    });

    // Display by conference
    Object.keys(playersByConference).forEach(conference => {
      console.log(`\n  ${conference} (${playersByConference[conference].length} players):`);
      playersByConference[conference].forEach(player => {
        console.log(`    - ${player.name} (${player.position}) - ${player.team} - Rating: ${player.rating}`);
      });
    });

    // Summary by conference
    console.log('\n📊 Summary by Conference:');
    console.log('-'.repeat(40));
    Object.keys(playersByConference).forEach(conference => {
      const players = playersByConference[conference];
      const positions = players.reduce((acc: any, player: any) => {
        acc[player.position] = (acc[player.position] || 0) + 1;
        return acc;
      }, {});
      
      console.log(`\n  ${conference}:`);
      console.log(`    Total Players: ${players.length}`);
      console.log(`    Positions: ${Object.entries(positions).map(([pos, count]) => `${pos}: ${count}`).join(', ')}`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkPlayersByConference(); 