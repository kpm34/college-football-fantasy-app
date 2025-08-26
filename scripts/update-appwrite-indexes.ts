#!/usr/bin/env tsx
/**
 * Script to update all Appwrite indexes from snake_case to camelCase
 * This will drop old indexes and create new ones with camelCase field names
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Mapping of snake_case to camelCase for index fields
const fieldMappings: Record<string, string> = {
  'authUserId': 'authUserId',
  'displayName': 'displayName',
  'leagueId': 'leagueId',
  'clientId': 'clientId',
  'ownerAuthUserId': 'ownerAuthUserId',
  'fantasyTeamId': 'fantasyTeamId',
  'playerId': 'playerId',
  'teamId': 'teamId',
  'joinedAt': 'joinedAt',
  'commissionerAuthUserId': 'commissionerAuthUserId',
  'isPublic': 'isPublic',
  'invitedByAuthUserId': 'invitedByAuthUserId',
  'homeSchoolId': 'homeSchoolId',
  'awaySchoolId': 'awaySchoolId',
  'eligibleGame': 'eligibleGame',
  'pollType': 'pollType',
  'schoolId': 'schoolId',
  'fantasyPoints': 'fantasyPoints',
  'cfbdId': 'cfbdId',
  'espnId': 'espnId',
  'depthChartOrder': 'depthChartOrder',
  'actorClientId': 'actorClientId',
  'objectId': 'objectId',
  'objectType': 'objectType',
  'invite_token': 'inviteToken',
  'draftId': 'draftId',
  'onClockTeamId': 'onClockTeamId',
  'auctionId': 'auctionId',
  'awayTeamId': 'awayTeamId',
  'homeTeamId': 'homeTeamId',
  'modelVersionId': 'modelVersionId',
  'runId': 'runId',
  'versionId': 'versionId',
  'createdBy': 'createdBy',
  'gameId': 'gameId',
  'statlineJson': 'statlineJson',
};

interface IndexUpdate {
  collectionId: string;
  oldIndexKey: string;
  newIndexKey: string;
  type: string;
  attributes: string[];
  orders?: string[];
}

async function getIndexesToUpdate(): Promise<IndexUpdate[]> {
  const updates: IndexUpdate[] = [];
  
  try {
    // Get all collections
    const collections = await databases.listCollections(DATABASE_ID);
    
    for (const collection of collections.collections) {
      console.log(`\nChecking collection: ${collection.name}`);
      
      // Get indexes for this collection
      const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
      
      for (const index of indexes.indexes) {
        let needsUpdate = false;
        const newAttributes: string[] = [];
        
        // Check each attribute in the index
        for (const attr of index.attributes) {
          if (fieldMappings[attr]) {
            needsUpdate = true;
            newAttributes.push(fieldMappings[attr]);
            console.log(`  Found snake_case field in index ${index.key}: ${attr} → ${fieldMappings[attr]}`);
          } else {
            newAttributes.push(attr);
          }
        }
        
        if (needsUpdate) {
          updates.push({
            collectionId: collection.$id,
            oldIndexKey: index.key,
            newIndexKey: index.key, // Keep same key name for now
            type: index.type,
            attributes: newAttributes,
            orders: index.orders
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching indexes:', error);
  }
  
  return updates;
}

async function updateIndexes(updates: IndexUpdate[]) {
  console.log(`\n📋 Found ${updates.length} indexes to update\n`);
  
  for (const update of updates) {
    console.log(`\n🔄 Updating index in collection ${update.collectionId}:`);
    console.log(`   Index: ${update.oldIndexKey}`);
    console.log(`   Fields: ${update.attributes.join(', ')}`);
    console.log(`   Type: ${update.type}`);
    
    try {
      // First, try to delete the old index
      try {
        await databases.deleteIndex(DATABASE_ID, update.collectionId, update.oldIndexKey);
        console.log(`   ✅ Deleted old index: ${update.oldIndexKey}`);
        
        // Wait a bit for Appwrite to process the deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (deleteError: any) {
        if (deleteError.code === 404) {
          console.log(`   ℹ️  Index ${update.oldIndexKey} not found (might already be deleted)`);
        } else {
          console.log(`   ⚠️  Could not delete old index: ${deleteError.message}`);
        }
      }
      
      // Create the new index with camelCase fields
      // Map the type to the correct enum value
      let indexType: 'key' | 'fulltext' | 'unique' = 'key';
      if (update.type === 'unique') indexType = 'unique';
      else if (update.type === 'fulltext') indexType = 'fulltext';
      
      const newIndex = await databases.createIndex(
        DATABASE_ID,
        update.collectionId,
        indexType,
        update.newIndexKey,
        update.attributes,
        update.orders
      );
      
      console.log(`   ✅ Created new index with camelCase fields`);
      
      // Wait a bit between operations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error: any) {
      console.error(`   ❌ Error updating index: ${error.message}`);
      
      // If the error is because the index already exists with the same key,
      // we might need to create it with a temporary different key
      if (error.code === 409) {
        console.log(`   🔄 Trying with temporary key...`);
        try {
          const tempKey = `${update.newIndexKey}_temp`;
          
          // Create with temp key
          let tempIndexType: 'key' | 'fulltext' | 'unique' = 'key';
          if (update.type === 'unique') tempIndexType = 'unique';
          else if (update.type === 'fulltext') tempIndexType = 'fulltext';
          
          await databases.createIndex(
            DATABASE_ID,
            update.collectionId,
            tempIndexType,
            tempKey,
            update.attributes,
            update.orders
          );
          console.log(`   ✅ Created index with temp key: ${tempKey}`);
          
          // Delete the old one
          await databases.deleteIndex(DATABASE_ID, update.collectionId, update.oldIndexKey);
          console.log(`   ✅ Deleted old index: ${update.oldIndexKey}`);
          
          // Wait a bit
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Delete temp and recreate with original key
          await databases.deleteIndex(DATABASE_ID, update.collectionId, tempKey);
          
          let finalIndexType: 'key' | 'fulltext' | 'unique' = 'key';
          if (update.type === 'unique') finalIndexType = 'unique';
          else if (update.type === 'fulltext') finalIndexType = 'fulltext';
          
          await databases.createIndex(
            DATABASE_ID,
            update.collectionId,
            finalIndexType,
            update.newIndexKey,
            update.attributes,
            update.orders
          );
          console.log(`   ✅ Recreated with original key: ${update.newIndexKey}`);
          
        } catch (tempError: any) {
          console.error(`   ❌ Failed even with temp key: ${tempError.message}`);
        }
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting Appwrite index update from snake_case to camelCase\n');
  console.log('Database:', DATABASE_ID);
  console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  console.log('=' .repeat(60));
  
  // Get all indexes that need updating
  const updates = await getIndexesToUpdate();
  
  if (updates.length === 0) {
    console.log('\n✨ No indexes need updating! All indexes are already using camelCase fields.');
    return;
  }
  
  // Show summary
  console.log('\n📊 Summary of indexes to update:');
  console.log('-'.repeat(40));
  const collectionCounts: Record<string, number> = {};
  for (const update of updates) {
    collectionCounts[update.collectionId] = (collectionCounts[update.collectionId] || 0) + 1;
  }
  for (const [collectionId, count] of Object.entries(collectionCounts)) {
    console.log(`  ${collectionId}: ${count} indexes`);
  }
  
  // Ask for confirmation
  console.log('\n⚠️  This will DELETE and RECREATE indexes.');
  console.log('Make sure you have a backup and low traffic before proceeding.');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Update the indexes
  await updateIndexes(updates);
  
  console.log('\n✅ Index update complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify indexes in Appwrite console');
  console.log('2. Test your application to ensure queries work');
  console.log('3. Deploy the updated code that uses camelCase field names');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
