#!/usr/bin/env tsx

/**
 * Auto Cleanup Script: Remove Old Rosters Collection
 * Safely removes the old 'rosters' collection after successful migration (non-interactive)
 */

import { Client, Databases } from 'node-appwrite';
import { env } from '../core/config/environment';

const client = new Client();
client
  .setEndpoint(env.server.appwrite.endpoint)
  .setProject(env.server.appwrite.projectId)
  .setKey(env.server.appwrite.apiKey);

const databases = new Databases(client);
const DATABASE_ID = env.server.appwrite.databaseId;

async function removeOldRostersCollection() {
  console.log('🗑️  Auto-removing old rosters collection');
  console.log('═══════════════════════════════════════');

  try {
    // Step 1: Verify rosters collection exists
    let rostersCollection;
    try {
      rostersCollection = await databases.getCollection(DATABASE_ID, 'rosters');
      console.log(`✅ Found 'rosters' collection`);
    } catch (error) {
      console.log('ℹ️  No rosters collection found - already removed');
      return;
    }

    // Step 2: Verify user_teams collection has data
    try {
      const userTeamsCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
      const userTeamsDocuments = await databases.listDocuments(DATABASE_ID, 'user_teams', undefined, 50);
      
      console.log(`✅ Found 'user_teams' collection with ${userTeamsDocuments.total} documents`);
      
      if (userTeamsDocuments.total === 0) {
        console.error('❌ user_teams collection is empty - migration not completed');
        process.exit(1);
      }
      
      console.log(`✅ Migration successful: ${userTeamsDocuments.total} documents in user_teams`);
      
    } catch (error) {
      console.error('❌ user_teams collection not found - migration not completed');
      process.exit(1);
    }

    // Step 3: Auto-delete the old collection (since migration is confirmed successful)
    console.log('\n🗑️  Removing rosters collection...');
    await databases.deleteCollection(DATABASE_ID, 'rosters');
    
    console.log('✅ Successfully removed old rosters collection');
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\n📋 Collection migration summary:');
    console.log('   ❌ Old: rosters (removed)');
    console.log('   ✅ New: user_teams (active)');
    console.log('\n🔧 Next steps:');
    console.log('   1. Update all code references from COLLECTIONS.rosters to COLLECTIONS.userTeams');
    console.log('   2. Test the application thoroughly');
    console.log('   3. Deploy the changes');

  } catch (error) {
    console.error('❌ Removal failed:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await removeOldRostersCollection();
  } catch (error) {
    console.error('❌ Cleanup script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { removeOldRostersCollection };