#!/usr/bin/env tsx
/**
 * Count All Players - Get accurate count by conference and position
 */

import { Client, Databases, Query } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function countAllPlayers(): Promise<void> {
  console.log('📊 Counting All Players in Database');
  console.log('===================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get ALL players by fetching in batches
    const allPlayers: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COLLEGE_PLAYERS,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allPlayers.push(...response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;

      if (response.documents.length > 0) {
        console.log(`📄 Fetched batch at offset ${offset - limit}: ${response.documents.length} players`);
      }
    }

    console.log(`\n📊 Total Players Found: ${allPlayers.length}`);

    // Group by conference
    const conferenceBreakdown: Record<string, any[]> = {};
    const positionBreakdown: Record<string, number> = {};

    allPlayers.forEach(player => {
      const conference = player.conference || 'Unknown';
      const position = player.position || 'Unknown';
      
      if (!conferenceBreakdown[conference]) {
        conferenceBreakdown[conference] = [];
      }
      conferenceBreakdown[conference].push(player);
      
      positionBreakdown[position] = (positionBreakdown[position] || 0) + 1;
    });

    console.log('\n🏛️ By Conference:');
    console.log('==================');
    Object.entries(conferenceBreakdown).forEach(([conference, players]) => {
      console.log(`  ${conference}: ${players.length} players`);
      
      // Show teams within each conference
      const teams = [...new Set(players.map(p => p.team))].sort();
      if (teams.length <= 5) {
        console.log(`    Teams: ${teams.join(', ')}`);
      } else {
        console.log(`    Teams: ${teams.slice(0, 5).join(', ')}... (${teams.length} total)`);
      }
    });

    console.log('\n🏈 By Position:');
    console.log('================');
    Object.entries(positionBreakdown).forEach(([position, count]) => {
      console.log(`  ${position}: ${count} players`);
    });

    // Show SEC teams specifically
    if (conferenceBreakdown['SEC']) {
      const secPlayers = conferenceBreakdown['SEC'];
      const secTeams = [...new Set(secPlayers.map(p => p.team))].sort();
      
      console.log('\n🐯 SEC Teams Found:');
      console.log('==================');
      secTeams.forEach(team => {
        const teamPlayers = secPlayers.filter(p => p.team === team);
        const positions = [...new Set(teamPlayers.map(p => p.position))].sort();
        console.log(`  ${team}: ${teamPlayers.length} players (${positions.join(', ')})`);
      });
    }

  } catch (error: any) {
    console.error('❌ Count failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await countAllPlayers();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { countAllPlayers };