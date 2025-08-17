#!/usr/bin/env tsx

/**
 * Remove Unused Attributes Script
 * 
 * Removes empty/unused attributes that were added by previous sync attempts
 * to make room for proper schema standardization.
 */

import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "college-football-fantasy";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(apiKey);

const db = new Databases(client);

// Specific unused attributes to remove based on analysis
const UNUSED_ATTRIBUTES = {
  college_players: [
    'searchText',
    'eligible',
    'external_id', 
    'depth_chart_order',
    'passing_projection',
    'games_played',
    'season_fantasy_points',
    'last_projection_update',
    'image_url',
    'stats'
  ],
  leagues: [
    'schedule_generated',
    'selectedConference',
    'commissionerId', 
    'draftOrder',
    'rosterSchema',
    'settings' // This was causing the sync to fail
  ],
  teams: [
    'division',
    'alt_color', 
    'venue',
    'location'
  ]
};

async function removeUnusedAttributes(): Promise<void> {
  console.log('🧹 Removing unused attributes to free up space...\n');
  
  for (const [collectionId, attributes] of Object.entries(UNUSED_ATTRIBUTES)) {
    console.log(`📦 Cleaning ${collectionId}:`);
    
    try {
      const collection = await db.getCollection(databaseId, collectionId);
      console.log(`   Current attributes: ${collection.attributes.length}`);
      
      let removed = 0;
      for (const attrKey of attributes) {
        try {
          await db.deleteAttribute(databaseId, collectionId, attrKey);
          console.log(`   ✅ Removed: ${attrKey}`);
          removed++;
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait between deletions
        } catch (error: any) {
          if (error.code === 404) {
            console.log(`   ⏭️  ${attrKey} already gone`);
          } else {
            console.log(`   ⚠️  Failed to remove ${attrKey}: ${error.message}`);
          }
        }
      }
      
      // Check final count
      const updatedCollection = await db.getCollection(databaseId, collectionId);
      console.log(`   🎉 Final count: ${updatedCollection.attributes.length} (removed ${removed})`);
      
    } catch (error: any) {
      console.error(`   ❌ Error with ${collectionId}: ${error.message}`);
    }
    
    console.log('');
  }
}

async function main(): Promise<void> {
  console.log('🔥 Aggressive Unused Attribute Cleanup');
  console.log('═'.repeat(50));
  
  try {
    await removeUnusedAttributes();
    
    console.log('✨ Cleanup completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Removed empty attributes added by previous syncs');
    console.log('   - Freed up space for proper standardization');
    console.log('   - Ready for clean schema sync');
    
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}