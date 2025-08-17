#!/usr/bin/env tsx

/**
 * Migration Script: Rosters → User Teams
 * Migrates all data from the old 'rosters' collection to the new 'user_teams' collection
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

interface RosterDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  leagueId: string;
  userId: string;
  teamName: string;
  draftPosition: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  players: string;
  [key: string]: any;
}

async function migrateRostersToUserTeams() {
  console.log('🔄 Starting migration: rosters → user_teams');
  console.log('═══════════════════════════════════════════');

  try {
    // Step 1: Check if rosters collection exists
    let rostersCollection;
    try {
      rostersCollection = await databases.getCollection(DATABASE_ID, 'rosters');
      console.log(`✅ Found 'rosters' collection`);
    } catch (error) {
      console.log('ℹ️  No rosters collection found - migration not needed');
      return;
    }

    // Step 2: Check if user_teams collection exists
    let userTeamsCollection;
    try {
      userTeamsCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
      console.log(`✅ Found 'user_teams' collection`);
    } catch (error) {
      console.error('❌ user_teams collection does not exist - run schema sync first');
      console.error('   Run: npm run schema:sync-simple');
      process.exit(1);
    }

    // Step 3: Get all documents from rosters
    console.log('\n📋 Fetching all roster documents...');
    
    let allRosters: RosterDocument[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'rosters',
        undefined, // queries
        limit,
        offset
      );
      
      allRosters.push(...response.documents as RosterDocument[]);
      offset += limit;
      hasMore = response.documents.length === limit;
      
      console.log(`   Fetched ${response.documents.length} documents (total: ${allRosters.length})`);
    }

    if (allRosters.length === 0) {
      console.log('ℹ️  No roster documents found - nothing to migrate');
      return;
    }

    console.log(`\n📊 Found ${allRosters.length} roster documents to migrate`);

    // Step 4: Migrate each document
    let successCount = 0;
    let errorCount = 0;

    for (const roster of allRosters) {
      try {
        // Create document in user_teams collection with null handling
        const migratedDocument: any = {
          leagueId: roster.leagueId,
          userId: roster.userId,
          teamName: roster.teamName,
          wins: roster.wins || 0,
          losses: roster.losses || 0,
          pointsFor: roster.pointsFor || 0,
          pointsAgainst: roster.pointsAgainst || 0,
          players: roster.players || '[]'
        };

        // Only include draftPosition if it's a valid number (draftPosition is optional)
        if (roster.draftPosition !== null && roster.draftPosition !== undefined && !isNaN(Number(roster.draftPosition))) {
          migratedDocument.draftPosition = Number(roster.draftPosition);
        }

        // Use the same document ID to maintain references
        await databases.createDocument(
          DATABASE_ID,
          'user_teams',
          roster.$id,
          migratedDocument
        );

        successCount++;
        console.log(`   ✅ Migrated roster ${roster.$id} (${roster.teamName})`);
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Failed to migrate roster ${roster.$id}:`, error);
      }
    }

    // Step 5: Summary
    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} documents`);
    console.log(`   ❌ Failed migrations: ${errorCount} documents`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Migration completed with errors');
      console.log('   Review failed migrations before proceeding');
      process.exit(1);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the application with new user_teams collection');
    console.log('   2. Once confirmed working, remove old rosters collection');
    console.log('   3. Run: npx tsx scripts/remove-old-rosters-collection.ts');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await migrateRostersToUserTeams();
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { migrateRostersToUserTeams };