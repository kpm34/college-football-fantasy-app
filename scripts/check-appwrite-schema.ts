#!/usr/bin/env tsx

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function checkCollections() {
  console.log('🔍 Checking Appwrite Collections...\n');
  
  try {
    // List all collections
    const collectionsResponse = await databases.listCollections(DATABASE_ID);
    console.log(`Found ${collectionsResponse.collections.length} collections:\n`);
    
    for (const collection of collectionsResponse.collections) {
      console.log(`\n📦 Collection: ${collection.name} (${collection.$id})`);
      console.log('   Attributes:');
      
      // Get collection details with attributes
      const collectionDetails = await databases.getCollection(DATABASE_ID, collection.$id);
      
      if (collectionDetails.attributes && Array.isArray(collectionDetails.attributes)) {
        for (const attr of collectionDetails.attributes) {
          const required = attr.required ? '✓' : '✗';
          const defaultVal = attr.default !== undefined ? ` (default: ${attr.default})` : '';
          console.log(`     - ${attr.key}: ${attr.type} [Required: ${required}]${defaultVal}`);
        }
      }
      
      console.log('   Indexes:');
      if (collectionDetails.indexes && Array.isArray(collectionDetails.indexes)) {
        for (const index of collectionDetails.indexes) {
          console.log(`     - ${index.key}: [${index.attributes.join(', ')}] (${index.type})`);
        }
      }
    }
    
    // Specifically check fantasy_teams/rosters collection
    console.log('\n\n🎯 Checking specific collection for user teams...');
    const collectionNames = ['fantasy_teams', 'rosters', 'user_teams'];
    
    for (const name of collectionNames) {
      try {
        const collection = await databases.getCollection(DATABASE_ID, name);
        console.log(`\n✅ Found collection: ${name}`);
        console.log('Attributes that could store user/owner ID:');
        
        if (collection.attributes) {
          const userFields = collection.attributes.filter((attr: any) => 
            attr.key.includes('user') || 
            attr.key.includes('owner') || 
            attr.key.includes('client') ||
            attr.key === 'userId' ||
            attr.key === 'id'
          );
          
          for (const attr of userFields) {
            console.log(`  - ${attr.key}: ${attr.type} [Required: ${attr.required ? '✓' : '✗'}]`);
          }
        }
      } catch (e) {
        console.log(`❌ Collection '${name}' not found`);
      }
    }
    
  } catch (error) {
    console.error('Error checking collections:', error);
  }
}

checkCollections();
