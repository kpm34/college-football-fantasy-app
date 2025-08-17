#!/usr/bin/env tsx

/**
 * Cleanup Script: Remove Old Rosters Collection
 * Safely removes the old 'rosters' collection after successful migration
 */

import { Client, Databases } from 'node-appwrite';
import { env } from '../core/config/environment';
import readline from 'readline';

const client = new Client();
client
  .setEndpoint(env.server.appwrite.endpoint)
  .setProject(env.server.appwrite.projectId)
  .setKey(env.server.appwrite.apiKey);

const databases = new Databases(client);
const DATABASE_ID = env.server.appwrite.databaseId;

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function removeOldRostersCollection() {
  console.log('🗑️  Removing old rosters collection');
  console.log('═══════════════════════════════════════');

  try {
    // Step 1: Verify rosters collection exists
    let rostersCollection;
    try {
      rostersCollection = await databases.getCollection(DATABASE_ID, 'rosters');
      console.log(`✅ Found 'rosters' collection with ${rostersCollection.total} documents`);
    } catch (error) {
      console.log('ℹ️  No rosters collection found - already removed');
      return;
    }

    // Step 2: Verify user_teams collection has data
    try {
      const userTeamsCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
      const userTeamsDocuments = await databases.listDocuments(DATABASE_ID, 'user_teams', undefined, 10);
      
      console.log(`✅ Found 'user_teams' collection with ${userTeamsCollection.total} documents`);
      
      if (userTeamsDocuments.total === 0) {
        console.error('❌ user_teams collection is empty - migration may not have completed');
        console.error('   Please run migration script first: npx tsx scripts/migrate-rosters-to-user-teams.ts');
        process.exit(1);
      }
      
      if (userTeamsDocuments.total < rostersCollection.total) {
        console.warn('⚠️  user_teams has fewer documents than rosters');
        console.warn(`   rosters: ${rostersCollection.total}, user_teams: ${userTeamsDocuments.total}`);
      }
      
    } catch (error) {
      console.error('❌ user_teams collection not found - migration not completed');
      console.error('   Please run migration script first: npx tsx scripts/migrate-rosters-to-user-teams.ts');
      process.exit(1);
    }

    // Step 3: Safety confirmation
    console.log('\n⚠️  WARNING: This action cannot be undone!');
    console.log('   This will permanently delete the old rosters collection');
    console.log('   Make sure:');
    console.log('   1. Migration completed successfully');
    console.log('   2. Application is working with user_teams collection');
    console.log('   3. You have backups if needed');
    
    const confirm = await askQuestion('\nType "DELETE" to confirm removal: ');
    
    if (confirm !== 'DELETE') {
      console.log('❌ Removal cancelled');
      return;
    }

    // Step 4: Delete the old collection
    console.log('\n🗑️  Removing rosters collection...');
    await databases.deleteCollection(DATABASE_ID, 'rosters');
    
    console.log('✅ Successfully removed old rosters collection');
    console.log('\n🎉 Cleanup completed!');
    console.log('\n📋 Collection migration summary:');
    console.log('   ❌ Old: rosters (removed)');
    console.log('   ✅ New: user_teams (active)');

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