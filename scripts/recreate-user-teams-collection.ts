#!/usr/bin/env tsx

/**
 * Recreate User Teams Collection
 * Deletes the existing user_teams collection and recreates it with correct schema
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

async function recreateUserTeamsCollection() {
  console.log('🔄 Recreating user_teams collection with correct schema');
  console.log('═════════════════════════════════════════════════════');

  try {
    // Step 1: Delete existing user_teams collection if it exists
    try {
      const existingCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
      console.log('🗑️  Deleting existing user_teams collection...');
      await databases.deleteCollection(DATABASE_ID, 'user_teams');
      console.log('✅ Deleted existing user_teams collection');
      
      // Wait for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('ℹ️  No existing user_teams collection found');
    }

    // Step 2: Run the schema sync to recreate with correct structure
    console.log('🚀 Running schema sync to recreate collection...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npm run schema:sync-simple', { stdio: 'inherit', cwd: process.cwd() });
      console.log('✅ Schema sync completed');
    } catch (error) {
      console.error('❌ Schema sync failed:', error);
      throw error;
    }

    // Step 3: Verify the new collection has correct structure
    console.log('🔍 Verifying new collection structure...');
    const newCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
    
    console.log(`✅ Collection recreated: ${newCollection.name}`);
    console.log('📋 Attributes:');
    
    const attributes = newCollection.attributes || [];
    attributes.forEach((attr: any) => {
      console.log(`   ${attr.key}: ${attr.type} (required: ${attr.required})`);
    });

    // Step 4: Check for expected attributes
    const expectedAttrs = ['leagueId', 'userId', 'teamName', 'draftPosition', 'wins', 'losses', 'pointsFor', 'pointsAgainst', 'players'];
    const actualAttrs = attributes.map((attr: any) => attr.key);
    
    const missingAttrs = expectedAttrs.filter(attr => !actualAttrs.includes(attr));
    const extraAttrs = actualAttrs.filter(attr => !expectedAttrs.includes(attr));
    
    if (missingAttrs.length > 0) {
      console.warn('⚠️  Missing expected attributes:', missingAttrs);
    }
    
    if (extraAttrs.length > 0) {
      console.warn('⚠️  Extra attributes found:', extraAttrs);
    }

    if (missingAttrs.length === 0 && extraAttrs.length === 0) {
      console.log('✅ Collection structure matches expectations');
    }

    console.log('\n🎉 user_teams collection recreation completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run migration: npx tsx scripts/migrate-rosters-to-user-teams.ts');
    console.log('   2. Test the application');
    console.log('   3. Remove old rosters collection when confirmed working');

  } catch (error) {
    console.error('❌ Recreation failed:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await recreateUserTeamsCollection();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { recreateUserTeamsCollection };