#!/usr/bin/env tsx

/**
 * Cleanup Redundant Attributes Script
 * 
 * Removes redundant attributes to make room for schema standardization:
 * - conference_id (redundant with conference)
 * - school (identical to team)  
 * - jerseyNumber (unused, jersey string works)
 * - team_abbreviation (can be derived)
 */

import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "college-football-fantasy";

if (!endpoint || !project || !apiKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(apiKey);

const db = new Databases(client);

// Attributes to remove and their reasons
const REDUNDANT_ATTRIBUTES = {
  college_players: [
    { key: 'conference_id', reason: 'Redundant with conference (just lowercase)' },
    { key: 'school', reason: 'Identical to team field' },
    { key: 'jerseyNumber', reason: 'Unused (jersey string works fine)' },
    { key: 'team_abbreviation', reason: 'Can be derived from team lookup' }
  ]
};

async function removeAttribute(collectionId: string, attributeKey: string, reason: string): Promise<boolean> {
  try {
    console.log(`    🗑️  Removing '${attributeKey}' - ${reason}`);
    await db.deleteAttribute(databaseId, collectionId, attributeKey);
    
    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`    ✅ Removed '${attributeKey}'`);
    return true;
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`    ⏭️  Attribute '${attributeKey}' doesn't exist (already removed)`);
      return true;
    } else {
      console.error(`    ❌ Failed to remove '${attributeKey}': ${error.message}`);
      return false;
    }
  }
}

async function cleanupCollection(collectionId: string): Promise<void> {
  console.log(`  📦 Cleaning up collection: ${collectionId}`);
  
  const attributesToRemove = REDUNDANT_ATTRIBUTES[collectionId as keyof typeof REDUNDANT_ATTRIBUTES] || [];
  
  if (attributesToRemove.length === 0) {
    console.log(`    ✅ No cleanup needed for ${collectionId}`);
    return;
  }

  // Check current collection state first
  try {
    const collection = await db.getCollection(databaseId, collectionId);
    const existingAttributes = collection.attributes.map((attr: any) => attr.key);
    
    console.log(`    📊 Current attributes: ${collection.attributes.length}`);
    console.log(`    🎯 Removing: ${attributesToRemove.length} redundant attributes`);
    
    for (const { key, reason } of attributesToRemove) {
      if (existingAttributes.includes(key)) {
        const success = await removeAttribute(collectionId, key, reason);
        if (!success) {
          console.warn(`    ⚠️  Failed to remove ${key}, continuing...`);
        }
      } else {
        console.log(`    ⏭️  Attribute '${key}' not found (may already be removed)`);
      }
    }
    
    // Check final state
    const updatedCollection = await db.getCollection(databaseId, collectionId);
    console.log(`    🎉 Final attribute count: ${updatedCollection.attributes.length} (saved ${collection.attributes.length - updatedCollection.attributes.length} slots)`);
    
  } catch (error: any) {
    console.error(`    ❌ Error cleaning up ${collectionId}: ${error.message}`);
  }
}

async function main(): Promise<void> {
  console.log('🧹 Starting Redundant Attribute Cleanup');
  console.log('═'.repeat(50));
  
  try {
    // Cleanup each collection
    for (const collectionId of Object.keys(REDUNDANT_ATTRIBUTES)) {
      await cleanupCollection(collectionId);
      console.log(''); // Add spacing
    }
    
    console.log('✨ Cleanup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. Run schema sync: npx tsx scripts/sync-appwrite-schema.ts');
    console.log('  2. Update codebase references to removed fields');
    console.log('  3. Test application functionality');
    
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  main();
}

export { main as cleanupRedundantAttributes };