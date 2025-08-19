#!/usr/bin/env npx tsx
/**
 * Import cleaned player data directly to Appwrite
 * This script uses local environment variables and handles rate limits
 */

import { Client, Databases, ID } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS || 'college_players';

if (!API_KEY) {
  console.error('❌ APPWRITE_API_KEY not found in .env.local');
  console.log('Please add: APPWRITE_API_KEY=your-api-key to .env.local');
  process.exit(1);
}

// Initialize Appwrite
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Load cleaned player data
const dataPath = path.join(process.cwd(), 'exports/college_players_2025_cleaned.json');
const players = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('============================================================');
console.log('College Football Fantasy - Player Import');
console.log('============================================================');
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`Project: ${PROJECT_ID}`);
console.log(`Database: ${DATABASE_ID}`);
console.log(`Collection: ${COLLECTION_ID}`);
console.log(`Total players to import: ${players.length}`);
console.log('');

async function checkCurrentCount() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, []);
    return response.total;
  } catch (error) {
    console.error('Error checking current count:', error);
    return 0;
  }
}

async function clearExistingPlayers() {
  console.log('📋 Clearing existing players...');
  let deleted = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        COLLECTION_ID,
        []
      );
      
      if (response.documents.length === 0) {
        hasMore = false;
        break;
      }
      
      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
          deleted++;
          if (deleted % 10 === 0) {
            process.stdout.write(`\r  Deleted: ${deleted} players...`);
          }
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`\n  Error deleting ${doc.$id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('\n  Error fetching documents:', error.message);
      break;
    }
  }
  
  console.log(`\n✅ Cleared ${deleted} existing players`);
  return deleted;
}

async function importPlayers() {
  console.log('\n📤 Importing cleaned players...');
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const player of players) {
    try {
      // Clean the player data
      const cleanPlayer = { ...player };
      delete cleanPlayer.$id;
      delete cleanPlayer.$createdAt;
      delete cleanPlayer.$updatedAt;
      delete cleanPlayer.$permissions;
      delete cleanPlayer.$collectionId;
      delete cleanPlayer.$databaseId;
      
      // Map fields according to schema
      const dataToSave = {
        name: cleanPlayer.name || 'Unknown',
        position: cleanPlayer.position || 'RB',
        team: cleanPlayer.team || cleanPlayer.school || 'Unknown',
        conference: cleanPlayer.conference || 'SEC',
        jerseyNumber: cleanPlayer.jerseyNumber || cleanPlayer.jersey_number || undefined,
        height: cleanPlayer.height || undefined,
        weight: cleanPlayer.weight || undefined,
        year: cleanPlayer.year || undefined,
        eligible: true,
        fantasy_points: cleanPlayer.fantasy_points || 0,
        season_fantasy_points: cleanPlayer.season_fantasy_points || 0,
        depth_chart_order: cleanPlayer.depth_chart_order || undefined,
        external_id: cleanPlayer.cfbd_id || cleanPlayer.external_id || undefined,
        image_url: cleanPlayer.image_url || undefined,
        stats: cleanPlayer.statline_simple_json || cleanPlayer.stats || undefined
      };
      
      // Remove undefined values
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });
      
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        dataToSave
      );
      
      imported++;
      
      if (imported % 10 === 0) {
        process.stdout.write(`\r  Imported: ${imported}/${players.length} players...`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error: any) {
      failed++;
      const errorMsg = `Failed ${player.name}: ${error.message}`;
      errors.push(errorMsg);
      if (errors.length <= 5) {
        console.error(`\n  ${errorMsg}`);
      }
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported} players`);
  console.log(`   Failed: ${failed} players`);
  
  if (errors.length > 5) {
    console.log(`\n⚠️  First 5 errors shown. Total errors: ${errors.length}`);
  }
  
  return { imported, failed };
}

async function main() {
  try {
    // Check current count
    const currentCount = await checkCurrentCount();
    console.log(`\n📊 Current players in database: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('\n⚠️  Database contains existing players.');
      console.log('   Clearing before import to avoid duplicates...\n');
      await clearExistingPlayers();
    }
    
    // Import the cleaned players
    const result = await importPlayers();
    
    // Verify final count
    const finalCount = await checkCurrentCount();
    console.log(`\n📊 Final player count: ${finalCount}`);
    
    if (finalCount === players.length) {
      console.log('\n✅ SUCCESS: All players imported successfully!');
    } else {
      console.log(`\n⚠️  WARNING: Expected ${players.length} but have ${finalCount} players`);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
main();
