#!/usr/bin/env tsx
/**
 * Complete SEC Removal - Remove ALL SEC Players at Once
 * 
 * This script will continue removing SEC players until none remain
 */

import { Client, Databases, Query } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

const SEC_TEAMS = [
  'georgia', 'lsu', 'ole miss', 'vanderbilt', 'alabama', 'texas', 'oklahoma', 
  'texas a&m', 'florida', 'arkansas', 'kentucky', 'mississippi state', 
  'auburn', 'missouri', 'tennessee', 'south carolina', 'mississippi'
];

function isSecTeam(teamName: string): boolean {
  if (!teamName) return false;
  const normalized = teamName.toLowerCase().trim();
  return SEC_TEAMS.some(secTeam => 
    normalized.includes(secTeam) || secTeam.includes(normalized)
  );
}

async function completeSecRemoval(): Promise<void> {
  console.log('🏈 Complete SEC Player Removal');
  console.log('==============================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  let totalRemoved = 0;
  let round = 1;

  while (true) {
    console.log(`\n🔄 Round ${round} - Scanning for SEC players...`);

    // Get all players
    const allPlayers: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
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
      } catch (error) {
        console.log('Error fetching players, ending scan');
        hasMore = false;
      }
    }

    // Find SEC players
    const secPlayersToRemove = allPlayers.filter(player => isSecTeam(player.team));

    if (secPlayersToRemove.length === 0) {
      console.log(`✅ No more SEC players found! Removal complete.`);
      break;
    }

    console.log(`📊 Found ${secPlayersToRemove.length} SEC players to remove`);

    // Remove all SEC players in this batch
    let removedThisRound = 0;
    for (const player of secPlayersToRemove) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.COLLEGE_PLAYERS,
          player.$id
        );
        removedThisRound++;
        totalRemoved++;
        
        if (removedThisRound % 50 === 0) {
          console.log(`  🗑️ Removed ${removedThisRound}/${secPlayersToRemove.length} (total: ${totalRemoved})`);
        }
      } catch (error: any) {
        console.log(`  ❌ Failed: ${player.name} - ${error.message}`);
      }
    }

    console.log(`✅ Round ${round} complete: ${removedThisRound} players removed`);
    round++;

    // Prevent infinite loop
    if (round > 50) {
      console.log('⚠️ Too many rounds, stopping to prevent infinite loop');
      break;
    }
  }

  // Final check
  const finalCheck = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.COLLEGE_PLAYERS,
    [Query.limit(100)]
  );

  const remainingSECPlayers = finalCheck.documents.filter(player => isSecTeam(player.team));

  console.log('\n📊 Final Results:');
  console.log('==================');
  console.log(`🗑️ Total players removed: ${totalRemoved}`);
  console.log(`📊 Total players remaining: ${finalCheck.total}`);
  console.log(`🏈 SEC players remaining: ${remainingSECPlayers.length}`);

  if (remainingSECPlayers.length === 0) {
    console.log('🎉 SUCCESS: All SEC players have been completely removed!');
  } else {
    console.log('⚠️ Some SEC players still remain:');
    remainingSECPlayers.slice(0, 10).forEach(player => {
      console.log(`  - ${player.name} (${player.team})`);
    });
    if (remainingSECPlayers.length > 10) {
      console.log(`  ... and ${remainingSECPlayers.length - 10} more`);
    }
  }
}

async function main() {
  try {
    await completeSecRemoval();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { completeSecRemoval };