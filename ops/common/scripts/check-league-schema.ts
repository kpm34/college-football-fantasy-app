#!/usr/bin/env tsx
/**
 * Check League Schema - See commissioner fields in database
 */

import { Client, Databases } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function checkLeagueSchema(): Promise<void> {
  console.log('🔍 Checking League Schema & Commissioner Fields');
  console.log('===============================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get collection schema
    const collection = await databases.getCollection(
      DATABASE_ID,
      COLLECTIONS.LEAGUES
    );

    console.log(`📋 Collection: ${collection.name}`);
    console.log(`🆔 ID: ${collection.$id}`);
    console.log(`📊 Total Attributes: ${collection.attributes.length}`);
    console.log('\n📝 Attributes (focusing on commissioner fields):');
    console.log('================================================');

    collection.attributes.forEach((attr: any) => {
      const isCommissioner = attr.key.toLowerCase().includes('commission');
      const marker = isCommissioner ? ' 🎯' : '';
      console.log(`  • ${attr.key} (${attr.type})${attr.required ? ' *required*' : ''}${marker}`);
      if (attr.default !== undefined) console.log(`    └─ Default: ${attr.default}`);
      if (attr.size) console.log(`    └─ Size: ${attr.size}`);
    });

    // Get sample leagues to see actual data
    console.log('\n📄 Sample League Data:');
    console.log('=======================');
    
    const sampleLeagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [],
      3,
      0
    );

    if (sampleLeagues.documents.length > 0) {
      sampleLeagues.documents.forEach((league, index) => {
        console.log(`\nLeague ${index + 1}: ${league.name}`);
        
        // Show all commissioner-related fields
        Object.keys(league).forEach(key => {
          if (key.toLowerCase().includes('commission') || key === 'creator') {
            console.log(`  ${key}: ${JSON.stringify(league[key])}`);
          }
        });
      });
    } else {
      console.log('No leagues found in database');
    }

  } catch (error: any) {
    console.error('❌ Failed to check schema:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await checkLeagueSchema();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkLeagueSchema };