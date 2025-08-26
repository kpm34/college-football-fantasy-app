#!/usr/bin/env tsx
import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function createDraftPicksCollection() {
  console.log('🎯 Creating draft_picks collection\n');
  
  try {
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      'draft_picks',
      'Draft Picks',
      [
        // Read permissions for all users
        'read("any")',
        // Write permissions for authenticated users
        'write("users")',
        // Delete permissions for authenticated users
        'delete("users")'
      ]
    );
    
    console.log('✅ Collection created:', collection.name);
    
    // Add attributes
    console.log('\n📝 Adding attributes...\n');
    
    // Core attributes
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'draftId', 64, true);
    console.log('  ✓ draftId');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'leagueId', 64, true);
    console.log('  ✓ leagueId');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerId', 64, true);
    console.log('  ✓ playerId');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'teamId', 64, true);
    console.log('  ✓ teamId');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'teamName', 100, false);
    console.log('  ✓ teamName');
    
    await databases.createIntegerAttribute(DATABASE_ID, 'draft_picks', 'round', true);
    console.log('  ✓ round');
    
    await databases.createIntegerAttribute(DATABASE_ID, 'draft_picks', 'pick', true);
    console.log('  ✓ pick');
    
    await databases.createIntegerAttribute(DATABASE_ID, 'draft_picks', 'overallPick', true);
    console.log('  ✓ overallPick');
    
    await databases.createDatetimeAttribute(DATABASE_ID, 'draft_picks', 'timestamp', true);
    console.log('  ✓ timestamp');
    
    // Player info (denormalized for performance)
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerName', 100, false);
    console.log('  ✓ playerName');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerPosition', 10, false);
    console.log('  ✓ playerPosition');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerTeam', 50, false);
    console.log('  ✓ playerTeam');
    
    await databases.createFloatAttribute(DATABASE_ID, 'draft_picks', 'adp', false);
    console.log('  ✓ adp');
    
    await databases.createFloatAttribute(DATABASE_ID, 'draft_picks', 'projectedPoints', false);
    console.log('  ✓ projectedPoints');
    
    // Create indexes
    console.log('\n🔍 Creating indexes...\n');
    
    await databases.createIndex(
      DATABASE_ID,
      'draft_picks',
      'key' as any,  // Type assertion for the SDK
      'index_draftId',
      ['draftId'],
      ['asc']
    );
    console.log('  ✓ Index on draftId');
    
    await databases.createIndex(
      DATABASE_ID,
      'draft_picks',
      'key' as any,
      'index_leagueId',
      ['leagueId'],
      ['asc']
    );
    console.log('  ✓ Index on leagueId');
    
    await databases.createIndex(
      DATABASE_ID,
      'draft_picks',
      'key' as any,
      'index_teamId',
      ['teamId'],
      ['asc']
    );
    console.log('  ✓ Index on teamId');
    
    await databases.createIndex(
      DATABASE_ID,
      'draft_picks',
      'key' as any,
      'index_overallPick',
      ['overallPick'],
      ['asc']
    );
    console.log('  ✓ Index on overallPick');
    
    console.log('\n✅ draft_picks collection created successfully!');
    
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Collection already exists');
      console.log('   Run with --force to recreate');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createDraftPicksCollection();
