#!/usr/bin/env tsx
/**
 * Check Actual Appwrite Schema - See what attributes exist in database
 */

import { Client, Databases } from 'node-appwrite';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function checkActualSchema(): Promise<void> {
  console.log('🔍 Checking Actual Appwrite Database Schema');
  console.log('===========================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get collection info
    const collection = await databases.getCollection(
      DATABASE_ID,
      COLLECTIONS.COLLEGE_PLAYERS
    );

    console.log(`📋 Collection: ${collection.name}`);
    console.log(`🆔 ID: ${collection.$id}`);
    console.log(`📊 Total Attributes: ${collection.attributes.length}`);
    console.log('\n📝 Attributes:');
    console.log('==============');

    collection.attributes.forEach((attr: any) => {
      console.log(`  • ${attr.key} (${attr.type})${attr.required ? ' *required*' : ''}`);
      if (attr.array) console.log(`    └─ Array: true`);
      if (attr.default !== undefined) console.log(`    └─ Default: ${attr.default}`);
      if (attr.size) console.log(`    └─ Size: ${attr.size}`);
      if (attr.min !== undefined) console.log(`    └─ Min: ${attr.min}`);
      if (attr.max !== undefined) console.log(`    └─ Max: ${attr.max}`);
      if (attr.elements) console.log(`    └─ Elements: [${attr.elements.join(', ')}]`);
    });

    // Also get a sample document to see the actual structure
    console.log('\n📄 Sample Document Structure:');
    console.log('==============================');
    
    const sampleDocs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COLLEGE_PLAYERS,
      [],
      1,
      0
    );

    if (sampleDocs.documents.length > 0) {
      const sample = sampleDocs.documents[0];
      console.log('Sample document attributes:');
      Object.keys(sample).forEach(key => {
        if (!key.startsWith('$')) {
          console.log(`  • ${key}: ${typeof sample[key]} = ${JSON.stringify(sample[key])}`);
        }
      });
    } else {
      console.log('No documents found in collection');
    }

  } catch (error: any) {
    console.error('❌ Failed to check schema:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await checkActualSchema();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkActualSchema };