#!/usr/bin/env tsx
/**
 * Create User Teams Collection - Manually create the missing collection
 */

import { Client, Databases, ID } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function createUserTeamsCollection(): Promise<void> {
  console.log('🔧 Creating User Teams Collection');
  console.log('=================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Check if collection already exists
    try {
      const existingCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.USER_TEAMS);
      console.log(`✅ Collection '${COLLECTIONS.USER_TEAMS}' already exists`);
      console.log(`   Name: ${existingCollection.name}`);
      console.log(`   Attributes: ${existingCollection.attributes?.length || 0}`);
      return;
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
      console.log(`📋 Collection '${COLLECTIONS.USER_TEAMS}' does not exist. Creating...`);
    }

    // Create the collection
    console.log('🔨 Creating collection...');
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      'User Teams',
      undefined, // permissions - will inherit from database
      false, // documentSecurity - use collection security
      true   // enabled
    );

    console.log(`✅ Created collection: ${collection.name} (${collection.$id})`);

    // Create required attributes
    console.log('📝 Adding attributes...');

    // Required string attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'leagueId', 50, true);
    console.log('  ✅ Added: leagueId (string, required)');

    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'userId', 50, true);
    console.log('  ✅ Added: userId (string, required)');

    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'teamName', 100, true);
    console.log('  ✅ Added: teamName (string, required)');

    // Optional attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'abbreviation', 10, false);
    console.log('  ✅ Added: abbreviation (string, optional)');

    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'draftPosition', false);
    console.log('  ✅ Added: draftPosition (integer, optional)');

    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'wins', false, 0);
    console.log('  ✅ Added: wins (integer, default 0)');

    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'losses', false, 0);
    console.log('  ✅ Added: losses (integer, default 0)');

    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'ties', false, 0);
    console.log('  ✅ Added: ties (integer, default 0)');

    await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'pointsFor', false, 0);
    console.log('  ✅ Added: pointsFor (float, default 0)');

    await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'pointsAgainst', false, 0);
    console.log('  ✅ Added: pointsAgainst (float, default 0)');

    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'players', 5000, false, '[]');
    console.log('  ✅ Added: players (string, JSON array)');

    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'lineup', 5000, false);
    console.log('  ✅ Added: lineup (string, JSON optional)');

    // Create indexes
    console.log('🔍 Adding indexes...');

    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'league_idx', 'key', ['leagueId']);
    console.log('  ✅ Added index: league_idx');

    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'user_idx', 'key', ['userId']);  
    console.log('  ✅ Added index: user_idx');

    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_TEAMS, 'league_user_idx', 'unique', ['leagueId', 'userId']);
    console.log('  ✅ Added index: league_user_idx (unique)');

    console.log('\n🎉 User Teams collection created successfully!');
    console.log('📊 Summary:');
    console.log(`   Collection: ${COLLECTIONS.USER_TEAMS}`);
    console.log(`   Attributes: 12`);
    console.log(`   Indexes: 3`);

  } catch (error: any) {
    console.error('❌ Failed to create collection:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

async function main() {
  try {
    await createUserTeamsCollection();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { createUserTeamsCollection };