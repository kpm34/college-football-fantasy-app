#!/usr/bin/env ts-node
/**
 * Check Collection Attributes
 * See what attributes are required for each collection
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function checkAttributes() {
  console.log('🔍 Checking Collection Attributes...');
  console.log('=' .repeat(60));

  try {
    const databaseId = 'college-football-fantasy';
    const collections = ['teams', 'college_players', 'games', 'rankings'];

    for (const collectionId of collections) {
      console.log(`\n📊 Collection: ${collectionId}`);
      console.log('-'.repeat(40));
      
      try {
        const attributes = await databases.listAttributes(databaseId, collectionId);
        
        console.log(`Found ${attributes.total} attributes:`);
        attributes.attributes.forEach((attr: any) => {
          const required = attr.required ? '✅ Required' : '❌ Optional';
          const type = attr.array ? `${attr.type}[]` : attr.type;
          console.log(`  - ${attr.key}: ${type} (${required})`);
        });
        
      } catch (error: any) {
        console.error(`❌ Error checking ${collectionId}:`, error.message);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkAttributes(); 