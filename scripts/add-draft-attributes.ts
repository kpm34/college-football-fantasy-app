#!/usr/bin/env npx tsx
import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Appwrite client with admin privileges
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const DRAFTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS || 'drafts';

async function addDraftAttributes() {
  console.log('🔄 Adding new attributes to drafts collection...\n');
  
  try {
    // List of attributes to add/ensure exist
    const attributesToAdd = [
      {
        key: 'leagueName',
        type: 'string',
        size: 255,
        required: false,
        description: 'Name of the league this draft belongs to'
      },
      {
        key: 'gameMode', 
        type: 'string',
        size: 50,
        required: false,
        description: 'Game mode: power4, sec, acc, big12, bigten'
      },
      {
        key: 'selectedConference',
        type: 'string', 
        size: 50,
        required: false,
        description: 'Selected conference for conference mode leagues'
      },
      {
        key: 'maxTeams',
        type: 'integer',
        required: false,
        min: 4,
        max: 24,
        description: 'Maximum number of teams in the league'
      }
    ];

    // Get existing attributes to check what already exists
    console.log('📋 Checking existing attributes...');
    const collection = await databases.getCollection(DATABASE_ID, DRAFTS_COLLECTION);
    const existingAttributes = collection.attributes || [];
    const existingKeys = existingAttributes.map((attr: any) => attr.key);
    
    console.log(`  Found ${existingAttributes.length} existing attributes`);
    console.log(`  Existing: ${existingKeys.join(', ')}\n`);

    // Add each attribute if it doesn't exist
    for (const attr of attributesToAdd) {
      if (existingKeys.includes(attr.key)) {
        console.log(`  ✓ Attribute '${attr.key}' already exists`);
      } else {
        try {
          console.log(`  📝 Creating attribute '${attr.key}'...`);
          
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              DATABASE_ID,
              DRAFTS_COLLECTION,
              attr.key,
              attr.size || 255,
              attr.required || false,
              undefined, // default value
              false // array
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              DATABASE_ID,
              DRAFTS_COLLECTION,
              attr.key,
              attr.required || false,
              attr.min,
              attr.max,
              undefined, // default value
              false // array
            );
          }
          
          console.log(`  ✅ Created attribute '${attr.key}'`);
        } catch (error: any) {
          if (error.code === 409) {
            console.log(`  ℹ️ Attribute '${attr.key}' already exists (race condition)`);
          } else {
            console.error(`  ❌ Failed to create '${attr.key}':`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Attribute creation complete!');
    console.log('\nNext step: Run the update script to populate these fields:');
    console.log('  npx tsx scripts/update-draft-league-names.ts');
    
  } catch (error: any) {
    console.error('❌ Failed to add attributes:', error);
    process.exit(1);
  }
}

// Run the attribute creation
addDraftAttributes().catch(console.error);
