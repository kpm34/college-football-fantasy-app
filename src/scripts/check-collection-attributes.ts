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
  .setProject(process.env.NEW_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.NEW_APPWRITE_API_KEY || '996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3');

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