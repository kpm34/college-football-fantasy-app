#!/usr/bin/env ts-node
/**
 * Debug Players - Raw Data Check
 * See exactly what's in the players collection
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

async function debugPlayers() {
  console.log('🔍 Debugging Players Collection...');
  console.log('=' .repeat(60));

  try {
    const databaseId = 'college-football-fantasy';

    // Get all players
    const players = await databases.listDocuments(databaseId, 'college_players');
    console.log(`Found ${players.total} total players`);
    
    // Show first few players with all their data
    console.log('\n📋 First 10 Players (Raw Data):');
    console.log('-'.repeat(40));
    
    players.documents.slice(0, 10).forEach((player: any, index: number) => {
      console.log(`\nPlayer ${index + 1}:`);
      console.log(`  Name: ${player.name}`);
      console.log(`  Team: ${player.team}`);
      console.log(`  Conference: ${player.conference}`);
      console.log(`  Position: ${player.position}`);
      console.log(`  Rating: ${player.rating}`);
      console.log(`  Document ID: ${player.$id}`);
      console.log(`  All fields:`, JSON.stringify(player, null, 2));
    });

    // Check for Big 12 specifically
    console.log('\n🔍 Looking for Big 12 players...');
    console.log('-'.repeat(40));
    
    const big12Players = players.documents.filter((player: any) => 
      player.conference === 'Big 12' || 
      player.conference === 'big_12' ||
      player.conference === 'Big12'
    );
    
    console.log(`Found ${big12Players.length} Big 12 players:`);
    big12Players.forEach((player: any) => {
      console.log(`  - ${player.name} (${player.position}) - ${player.team} - Conference: ${player.conference}`);
    });

    // Check all unique conferences
    const conferences = [...new Set(players.documents.map((p: any) => p.conference))];
    console.log('\n📊 All conferences found:');
    console.log('-'.repeat(40));
    conferences.forEach(conf => {
      const count = players.documents.filter((p: any) => p.conference === conf).length;
      console.log(`  ${conf}: ${count} players`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

debugPlayers(); 