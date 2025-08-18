#!/usr/bin/env tsx
/**
 * Remove Remaining SEC Players - Final Cleanup
 * 
 * This will remove ALL remaining SEC players by checking each player individually
 * and removing any that match the target teams
 */

import { Client, Databases } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

// All SEC team names to remove - being very comprehensive
const SEC_TEAMS = [
  'georgia', 'lsu', 'ole miss', 'vanderbilt', 'alabama', 'texas', 'oklahoma', 
  'texas a&m', 'florida', 'arkansas', 'kentucky', 'mississippi state', 
  'auburn', 'missouri', 'tennessee', 'south carolina',
  // Variations
  'georgia bulldogs', 'lsu tigers', 'ole miss rebels', 'mississippi', 'vandy',
  'vanderbilt commodores', 'alabama crimson tide', 'bama', 'texas longhorns',
  'oklahoma sooners', 'texas a&m aggies', 'tamu', 'florida gators', 
  'arkansas razorbacks', 'kentucky wildcats', 'mississippi state bulldogs',
  'miss st', 'msst', 'auburn tigers', 'missouri tigers', 'mizzou',
  'tennessee volunteers', 'vols', 'south carolina gamecocks'
];

function isSecTeam(teamName: string): boolean {
  if (!teamName) return false;
  
  const normalized = teamName.toLowerCase().trim();
  
  return SEC_TEAMS.some(secTeam => {
    const normalizedSec = secTeam.toLowerCase().trim();
    // Check exact match or if one contains the other
    return normalized === normalizedSec || 
           normalized.includes(normalizedSec) || 
           normalizedSec.includes(normalized);
  });
}

async function removeRemainingSECPlayers(): Promise<void> {
  console.log('🏈 Final SEC Player Cleanup');
  console.log('===========================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get ALL players
    console.log('🔍 Scanning entire database for SEC players...');
    const allPlayers: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COLLEGE_PLAYERS,
        [],
        limit,
        offset
      );

      allPlayers.push(...response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    console.log(`📊 Scanning ${allPlayers.length} total players...`);

    // Find SEC players
    const secPlayersToRemove = allPlayers.filter(player => isSecTeam(player.team));

    if (secPlayersToRemove.length === 0) {
      console.log('✅ No SEC players found! Database is clean.');
      return;
    }

    // Group by team
    const playersByTeam: Record<string, any[]> = {};
    secPlayersToRemove.forEach(player => {
      const team = player.team || 'Unknown';
      if (!playersByTeam[team]) playersByTeam[team] = [];
      playersByTeam[team].push(player);
    });

    console.log(`\n📋 SEC Players found:`);
    Object.entries(playersByTeam).forEach(([team, players]) => {
      console.log(`  ${team}: ${players.length} players`);
      players.forEach(player => {
        console.log(`    - ${player.name} (${player.position})`);
      });
    });

    console.log(`\n🎯 Total SEC players to remove: ${secPlayersToRemove.length}`);
    console.log('\n⚠️ Removing all SEC players in 3 seconds... (Press Ctrl+C to cancel)');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Remove each player
    console.log('\n🗑️ Removing SEC players...');
    let removedCount = 0;
    
    for (const player of secPlayersToRemove) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.COLLEGE_PLAYERS,
          player.$id
        );
        console.log(`  ✅ Removed: ${player.name} (${player.position} - ${player.team})`);
        removedCount++;
      } catch (error: any) {
        console.log(`  ❌ Failed: ${player.name} - ${error.message}`);
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COLLEGE_PLAYERS,
      [],
      100,
      0
    );

    const remainingSECPlayers = finalResponse.documents.filter(player => isSecTeam(player.team));

    console.log('\n📊 Final Results:');
    console.log('=================');
    console.log(`🗑️ Players removed: ${removedCount}`);
    console.log(`📊 Total players remaining: ${finalResponse.total}`);
    console.log(`🏈 SEC players remaining: ${remainingSECPlayers.length}`);

    if (remainingSECPlayers.length === 0) {
      console.log('🎉 SUCCESS: All SEC players have been removed!');
    } else {
      console.log('⚠️ Some SEC players may still remain:');
      remainingSECPlayers.forEach(player => {
        console.log(`  - ${player.name} (${player.team})`);
      });
    }

  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await removeRemainingSECPlayers();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { removeRemainingSECPlayers };