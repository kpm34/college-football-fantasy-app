#!/usr/bin/env tsx
/**
 * Script to migrate remaining snake_case attributes to camelCase in Appwrite
 * This will:
 * 1. Create new camelCase attributes
 * 2. Copy data from snake_case to camelCase
 * 3. Delete old snake_case attributes (after confirmation)
 */

import { Client, Databases, Query, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Define the migrations needed based on our verification
const migrations = [
  {
    collection: 'player_stats',
    attributes: [
      { old: 'fantasy_points', new: 'fantasyPoints', type: 'double' as const, required: false, default: null },
      { old: 'statline_json', new: 'statlineJson', type: 'string' as const, size: 65535, required: false, default: null },
    ]
  },
  {
    collection: 'invites',
    attributes: [
      { old: 'invited_by_auth_user_id', new: 'invitedByAuthUserId', type: 'string' as const, size: 255, required: false, default: null },
    ]
  },
  {
    collection: 'meshy_jobs',
    attributes: [
      { old: 'updated_at', new: 'updatedAt', type: 'datetime' as const, required: false, default: null },
    ]
  },
  {
    collection: 'projections',
    attributes: [
      { old: 'defense_vs_pos_grade', new: 'defenseVsPosGrade', type: 'double' as const, required: false, default: null },
      { old: 'home_away', new: 'homeAway', type: 'string' as const, size: 10, required: false, default: null },
      { old: 'start_sit_color', new: 'startSitColor', type: 'string' as const, size: 20, required: false, default: null },
      { old: 'team_total_est', new: 'teamTotalEst', type: 'double' as const, required: false, default: null },
      { old: 'utilization_trend', new: 'utilizationTrend', type: 'string' as const, size: 20, required: false, default: null },
    ]
  },
  {
    collection: 'model_runs',
    attributes: [
      { old: 'run_id', new: 'runId', type: 'string' as const, size: 255, required: false, default: null },
      { old: 'model_version_id', new: 'modelVersionId', type: 'string' as const, size: 255, required: false, default: null },
      { old: 'started_at', new: 'startedAt', type: 'datetime' as const, required: false, default: null },
      { old: 'finished_at', new: 'finishedAt', type: 'datetime' as const, required: false, default: null },
      { old: 'inputs_json', new: 'inputsJson', type: 'string' as const, size: 65535, required: false, default: null },
      { old: 'metrics_json', new: 'metricsJson', type: 'string' as const, size: 65535, required: false, default: null },
      { old: 'weights_json', new: 'weightsJson', type: 'string' as const, size: 65535, required: false, default: null },
    ]
  }
];

async function createAttribute(collectionId: string, attr: any) {
  try {
    switch (attr.type) {
      case 'string':
        await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          attr.new,
          attr.size || 255,
          attr.required || false,
          attr.default
        );
        break;
      case 'double':
        await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          attr.new,
          attr.required || false,
          null, // min
          null, // max
          attr.default
        );
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          collectionId,
          attr.new,
          attr.required || false,
          attr.default
        );
        break;
      default:
        console.log(`  ⚠️  Unknown type: ${attr.type} for ${attr.new}`);
        return false;
    }
    console.log(`  ✅ Created attribute: ${attr.new}`);
    return true;
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`  ℹ️  Attribute ${attr.new} already exists`);
      return true;
    }
    console.error(`  ❌ Failed to create ${attr.new}: ${error.message}`);
    return false;
  }
}

async function migrateData(collectionId: string, attributes: any[]) {
  console.log(`  📋 Migrating data...`);
  
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  let totalMigrated = 0;
  
  while (hasMore) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      
      for (const doc of response.documents) {
        const updates: any = {};
        let needsUpdate = false;
        
        for (const attr of attributes) {
          if (doc[attr.old] !== undefined && doc[attr.old] !== null) {
            updates[attr.new] = doc[attr.old];
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              collectionId,
              doc.$id,
              updates
            );
            totalMigrated++;
          } catch (error: any) {
            console.error(`    ❌ Failed to update document ${doc.$id}: ${error.message}`);
          }
        }
      }
      
      offset += limit;
      hasMore = response.documents.length === limit;
      
      if (totalMigrated > 0 && totalMigrated % 100 === 0) {
        console.log(`    Migrated ${totalMigrated} documents...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error fetching documents: ${error.message}`);
      break;
    }
  }
  
  console.log(`  ✅ Migrated ${totalMigrated} documents`);
}

async function deleteAttribute(collectionId: string, attributeKey: string) {
  try {
    await databases.deleteAttribute(DATABASE_ID, collectionId, attributeKey);
    console.log(`  ✅ Deleted old attribute: ${attributeKey}`);
    return true;
  } catch (error: any) {
    console.error(`  ❌ Failed to delete ${attributeKey}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting attribute migration from snake_case to camelCase\n');
  console.log('Database:', DATABASE_ID);
  console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  console.log('=' .repeat(60));
  
  for (const migration of migrations) {
    console.log(`\n📦 Processing collection: ${migration.collection}`);
    console.log('-'.repeat(40));
    
    // Step 1: Create new attributes
    console.log('Step 1: Creating new camelCase attributes...');
    for (const attr of migration.attributes) {
      await createAttribute(migration.collection, attr);
      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 2: Migrate data
    console.log('\nStep 2: Migrating data...');
    await migrateData(migration.collection, migration.attributes);
    
    // Step 3: Optionally delete old attributes (commented out for safety)
    console.log('\nStep 3: Old attributes (NOT deleted for safety):');
    for (const attr of migration.attributes) {
      console.log(`  ⚠️  To delete: ${attr.old} (run with --delete flag to remove)`);
    }
    
    // Delete old attributes if --delete flag is provided
    if (process.argv.includes('--delete')) {
      console.log('\nStep 3: Deleting old snake_case attributes...');
      for (const attr of migration.attributes) {
        await deleteAttribute(migration.collection, attr.old);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  console.log('\n\n✅ Migration complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Update all code references to use camelCase');
  console.log('2. Test your application thoroughly');
  console.log('3. Once confirmed working, run with --delete flag to remove old attributes');
  console.log('   npx tsx scripts/migrate-remaining-attributes.ts --delete');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
