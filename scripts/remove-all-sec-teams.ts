#!/usr/bin/env tsx
/**
 * Remove ALL SEC Players - Comprehensive Removal
 * 
 * This script will find and remove ALL players from the specified teams,
 * using multiple matching strategies to ensure complete removal
 */

import { Client, Databases } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

// All team variations to match (case-insensitive)
const TEAMS_TO_REMOVE = [
  // Georgia variations
  'Georgia', 'Georgia Bulldogs', 'UGA',
  
  // LSU variations
  'LSU', 'LSU Tigers', 'Louisiana State',
  
  // Ole Miss variations
  'Ole Miss', 'Ole Miss Rebels', 'Mississippi', 'Miss',
  
  // Vanderbilt variations
  'Vanderbilt', 'Vanderbilt Commodores', 'Vandy',
  
  // Alabama variations (already removed but include for completeness)
  'Alabama', 'Alabama Crimson Tide', 'Bama',
  
  // Texas variations
  'Texas', 'Texas Longhorns', 'UT',
  
  // Oklahoma variations
  'Oklahoma', 'Oklahoma Sooners', 'OU',
  
  // Texas A&M variations
  'Texas A&M', 'Texas A&M Aggies', 'TAMU', 'A&M',
  
  // Florida variations
  'Florida', 'Florida Gators', 'UF',
  
  // Arkansas variations
  'Arkansas', 'Arkansas Razorbacks', 'Hogs',
  
  // Kentucky variations
  'Kentucky', 'Kentucky Wildcats', 'UK',
  
  // Mississippi State variations
  'Mississippi State', 'Mississippi State Bulldogs', 'Miss St', 'MSST', 'Miss State',
  
  // Auburn variations
  'Auburn', 'Auburn Tigers',
  
  // Missouri variations
  'Missouri', 'Missouri Tigers', 'Mizzou',
  
  // Tennessee variations
  'Tennessee', 'Tennessee Volunteers', 'Vols',
  
  // South Carolina variations
  'South Carolina', 'South Carolina Gamecocks', 'USC', 'SC'
];

function shouldRemovePlayer(playerTeam: string): boolean {
  if (!playerTeam) return false;
  
  const normalizedPlayerTeam = playerTeam.toLowerCase().trim();
  
  return TEAMS_TO_REMOVE.some(teamToRemove => {
    const normalizedTeamToRemove = teamToRemove.toLowerCase().trim();
    
    // Exact match
    if (normalizedPlayerTeam === normalizedTeamToRemove) return true;
    
    // Contains match (for cases like "Oklahoma Sooners" containing "Oklahoma")
    if (normalizedPlayerTeam.includes(normalizedTeamToRemove) || 
        normalizedTeamToRemove.includes(normalizedPlayerTeam)) return true;
    
    return false;
  });
}

async function removeAllSECPlayers(): Promise<void> {
  console.log('🏈 Comprehensive SEC Player Removal');
  console.log('===================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get all players
    console.log('🔍 Fetching all players from database...');
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

    console.log(`📊 Found ${allPlayers.length} total players in database`);

    // Find players to remove
    const playersToRemove = allPlayers.filter(player => shouldRemovePlayer(player.team));
    
    if (playersToRemove.length === 0) {
      console.log('✅ No players found from specified teams to remove');
      return;
    }

    // Group by team for display
    const playersByTeam = playersToRemove.reduce((acc, player) => {
      const team = player.team || 'Unknown';
      if (!acc[team]) acc[team] = [];
      acc[team].push(player);
      return acc;
    }, {} as Record<string, any[]>);

    console.log(`\n📋 Players found by team:`);
    for (const [team, players] of Object.entries(playersByTeam)) {
      console.log(`  ${team}: ${players.length} players`);
    }
    console.log(`\n🎯 Total players to remove: ${playersToRemove.length}`);

    console.log('\n⚠️ WARNING: This will permanently delete these players!');
    console.log('Proceeding with removal in 3 seconds... (Press Ctrl+C to cancel)');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Remove all players
    console.log('\n🗑️ Removing players...');
    let removedCount = 0;
    let failedCount = 0;

    for (const player of playersToRemove) {
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
        failedCount++;
      }
    }

    // Final summary
    console.log('\n📊 Final Summary:');
    console.log('=================');
    console.log(`🎯 Players targeted: ${playersToRemove.length}`);
    console.log(`✅ Successfully removed: ${removedCount}`);
    console.log(`❌ Failed to remove: ${failedCount}`);
    console.log(`📈 Success rate: ${Math.round((removedCount / playersToRemove.length) * 100)}%`);

    // Show remaining player count
    const remainingResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COLLEGE_PLAYERS,
      [],
      1,
      0
    );
    
    console.log(`\n📊 Remaining players in database: ${remainingResponse.total}`);

    if (removedCount > 0) {
      console.log('\n💡 Removal completed successfully!');
      console.log('💾 Consider running a database export to backup remaining data');
    }

  } catch (error: any) {
    console.error('❌ Removal failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🎯 This will remove players from ALL of these teams:');
    const uniqueTeams = [...new Set([
      'Georgia', 'LSU', 'Ole Miss', 'Vanderbilt', 'Alabama', 'Texas',
      'Oklahoma', 'Texas A&M', 'Florida', 'Arkansas', 'Kentucky', 
      'Mississippi State', 'Auburn', 'Missouri', 'Tennessee', 'South Carolina'
    ])];
    
    uniqueTeams.forEach((team, i) => {
      console.log(`  ${i + 1}. ${team}`);
    });
    console.log();

    await removeAllSECPlayers();
    
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { removeAllSECPlayers };