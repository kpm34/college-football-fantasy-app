#!/usr/bin/env tsx

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function searchCollections() {
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    const matching = collections.collections.filter(c => 
      c.$id.includes('user_teams') || c.$id.includes('rosters') || c.name.toLowerCase().includes('rosters')
    );
    
    console.log(`Total collections: ${collections.total}`);
    console.log('Searching for user_teams/rosters collections...\n');
    
    if (matching.length > 0) {
      console.log('Found matching collections:');
      matching.forEach(c => {
        console.log(`- ${c.name} (ID: ${c.$id})`);
      });
    } else {
      console.log('No user_teams or rosters collections found.');
      
      // Let's also check what the API is trying to access
      console.log('\nTrying to access "user_teams" collection directly:');
      try {
        const userTeamsCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
        console.log('✅ user_teams collection exists!');
        console.log(`   Name: ${userTeamsCollection.name}`);
        console.log(`   Attributes: ${userTeamsCollection.attributes?.length || 0}`);
      } catch (error: any) {
        console.log(`❌ user_teams collection error: ${error.message}`);
      }

      console.log('\nTrying to access "rosters" collection directly:');
      try {
        const rostersCollection = await databases.getCollection(DATABASE_ID, 'rosters');
        console.log('✅ rosters collection exists!');
        console.log(`   Name: ${rostersCollection.name}`);
        console.log(`   Attributes: ${rostersCollection.attributes?.length || 0}`);
      } catch (error: any) {
        console.log(`❌ rosters collection error: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

searchCollections();