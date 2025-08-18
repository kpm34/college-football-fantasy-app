#!/usr/bin/env tsx
/**
 * Remove SEC Players from Database
 * 
 * Removes all players from specified SEC teams from the Appwrite database
 */

import { Client, Databases, Query } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

// Teams to remove (normalized names)
const TEAMS_TO_REMOVE = [
  'Georgia',
  'LSU', 
  'Ole Miss',
  'Vanderbilt',
  'Alabama',
  'Texas',
  'Oklahoma', 
  'Texas A&M',
  'Florida',
  'Arkansas',
  'Kentucky',
  'Mississippi State',
  'Auburn',
  'Missouri',
  'Tennessee',
  'South Carolina'
];

// Alternative team name mappings
const TEAM_ALIASES: Record<string, string[]> = {
  'Georgia': ['Georgia', 'Georgia Bulldogs', 'UGA'],
  'LSU': ['LSU', 'LSU Tigers'],
  'Ole Miss': ['Ole Miss', 'Ole Miss Rebels', 'Mississippi'],
  'Vanderbilt': ['Vanderbilt', 'Vanderbilt Commodores'],
  'Alabama': ['Alabama', 'Alabama Crimson Tide'],
  'Texas': ['Texas', 'Texas Longhorns'],
  'Oklahoma': ['Oklahoma', 'Oklahoma Sooners'],
  'Texas A&M': ['Texas A&M', 'Texas A&M Aggies', 'TAMU'],
  'Florida': ['Florida', 'Florida Gators'],
  'Arkansas': ['Arkansas', 'Arkansas Razorbacks'],
  'Kentucky': ['Kentucky', 'Kentucky Wildcats'],
  'Mississippi State': ['Mississippi State', 'Mississippi State Bulldogs', 'Miss St', 'MSST'],
  'Auburn': ['Auburn', 'Auburn Tigers'],
  'Missouri': ['Missouri', 'Missouri Tigers'],
  'Tennessee': ['Tennessee', 'Tennessee Volunteers'],
  'South Carolina': ['South Carolina', 'South Carolina Gamecocks']
};

interface RemovalResult {
  teamName: string;
  playersFound: number;
  playersRemoved: number;
  players: string[];
}

async function findPlayersToRemove(databases: Databases): Promise<Map<string, any[]>> {
  console.log('🔍 Finding players from specified teams...');
  
  const teamPlayers = new Map<string, any[]>();
  
  // Get all players first
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

  // Group players by team
  for (const player of allPlayers) {
    const playerTeam = player.team;
    
    // Check if player's team matches any team we want to remove
    for (const [targetTeam, aliases] of Object.entries(TEAM_ALIASES)) {
      if (aliases.some(alias => 
        alias.toLowerCase() === playerTeam?.toLowerCase() ||
        playerTeam?.toLowerCase().includes(alias.toLowerCase())
      )) {
        if (!teamPlayers.has(targetTeam)) {
          teamPlayers.set(targetTeam, []);
        }
        teamPlayers.get(targetTeam)!.push(player);
        break;
      }
    }
  }

  return teamPlayers;
}

async function removePlayersFromTeam(databases: Databases, teamName: string, players: any[]): Promise<RemovalResult> {
  console.log(`\n🗑️ Removing ${players.length} players from ${teamName}...`);
  
  const playerNames: string[] = [];
  let removedCount = 0;

  for (const player of players) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.COLLEGE_PLAYERS,
        player.$id
      );
      playerNames.push(player.name);
      removedCount++;
      console.log(`  ✅ Removed: ${player.name} (${player.position})`);
    } catch (error: any) {
      console.log(`  ❌ Failed to remove: ${player.name} - ${error.message}`);
    }
  }

  return {
    teamName,
    playersFound: players.length,
    playersRemoved: removedCount,
    players: playerNames
  };
}

async function removeSECPlayers(): Promise<void> {
  console.log('🏈 Removing SEC Players from Database');
  console.log('====================================');

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
    // Find all players from teams to remove
    const teamPlayers = await findPlayersToRemove(databases);
    
    if (teamPlayers.size === 0) {
      console.log('✅ No players found from specified teams to remove');
      return;
    }

    console.log(`\n📋 Players found by team:`);
    let totalToRemove = 0;
    for (const [team, players] of teamPlayers) {
      console.log(`  ${team}: ${players.length} players`);
      totalToRemove += players.length;
    }
    console.log(`\n🎯 Total players to remove: ${totalToRemove}`);

    // Ask for confirmation (in production, you might want to skip this)
    console.log('\n⚠️ WARNING: This will permanently delete players from the database!');
    console.log('Proceeding with removal in 3 seconds... (Press Ctrl+C to cancel)');
    
    // 3 second delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Remove players team by team
    const results: RemovalResult[] = [];
    
    for (const [teamName, players] of teamPlayers) {
      const result = await removePlayersFromTeam(databases, teamName, players);
      results.push(result);
    }

    // Summary
    console.log('\n📊 Removal Summary:');
    console.log('===================');
    
    let totalFound = 0;
    let totalRemoved = 0;
    
    for (const result of results) {
      totalFound += result.playersFound;
      totalRemoved += result.playersRemoved;
      
      const status = result.playersRemoved === result.playersFound ? '✅' : '⚠️';
      console.log(`${status} ${result.teamName}: ${result.playersRemoved}/${result.playersFound} removed`);
    }

    console.log(`\n🎯 Overall Result:`);
    console.log(`📊 Players found: ${totalFound}`);
    console.log(`🗑️ Players removed: ${totalRemoved}`);
    console.log(`${totalRemoved === totalFound ? '✅' : '❌'} Success rate: ${Math.round((totalRemoved/totalFound) * 100)}%`);

    if (totalRemoved > 0) {
      console.log('\n💡 Next steps:');
      console.log('- Run database export to backup remaining data');
      console.log('- Update any related draft/league data as needed');
      console.log('- Consider running data validation checks');
    }

  } catch (error: any) {
    console.error('❌ Removal failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('Teams to be removed:');
    TEAMS_TO_REMOVE.forEach((team, i) => {
      console.log(`  ${i + 1}. ${team}`);
    });
    console.log();

    await removeSECPlayers();
    console.log('\n🎉 SEC player removal completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { removeSECPlayers };