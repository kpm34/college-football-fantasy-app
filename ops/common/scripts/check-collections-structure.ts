#!/usr/bin/env tsx

/**
 * Check Collections Structure
 * Inspects the actual structure of both rosters and user_teams collections
 */

import { Client, Databases } from 'node-appwrite';
import { env } from '@lib/config/environment';

const client = new Client();
client
  .setEndpoint(env.server.appwrite.endpoint)
  .setProject(env.server.appwrite.projectId)
  .setKey(env.server.appwrite.apiKey);

const databases = new Databases(client);
const DATABASE_ID = env.server.appwrite.databaseId;

async function checkCollectionStructure() {
  console.log('🔍 Checking collection structures...');
  console.log('═══════════════════════════════════════');

  try {
    // Check rosters collection
    console.log('\n📋 ROSTERS COLLECTION:');
    try {
      const rostersCollection = await databases.getCollection(DATABASE_ID, 'rosters');
      console.log(`   Name: ${rostersCollection.name}`);
      console.log(`   Total Documents: ${rostersCollection.total || 0}`);
      
      // Get a sample document to see structure
      const rosterDocs = await databases.listDocuments(DATABASE_ID, 'rosters', undefined, 1);
      if (rosterDocs.documents.length > 0) {
        console.log('   Sample Document Structure:');
        const sample = rosterDocs.documents[0];
        Object.keys(sample).forEach(key => {
          if (!key.startsWith('$')) {
            console.log(`     ${key}: ${typeof sample[key]} = ${JSON.stringify(sample[key]).substring(0, 50)}`);
          }
        });
      }
    } catch (error) {
      console.log('   ❌ Rosters collection not found');
    }

    // Check user_teams collection
    console.log('\n👥 USER_TEAMS COLLECTION:');
    try {
      const userTeamsCollection = await databases.getCollection(DATABASE_ID, 'user_teams');
      console.log(`   Name: ${userTeamsCollection.name}`);
      console.log(`   Total Documents: ${userTeamsCollection.total || 0}`);
      
      // List attributes
      console.log('   Attributes:');
      const attributes = userTeamsCollection.attributes || [];
      attributes.forEach((attr: any) => {
        console.log(`     ${attr.key}: ${attr.type} (required: ${attr.required})`);
      });
      
      // Get a sample document if any exist
      const userTeamDocs = await databases.listDocuments(DATABASE_ID, 'user_teams', undefined, 1);
      if (userTeamDocs.documents.length > 0) {
        console.log('   Sample Document Structure:');
        const sample = userTeamDocs.documents[0];
        Object.keys(sample).forEach(key => {
          if (!key.startsWith('$')) {
            console.log(`     ${key}: ${typeof sample[key]} = ${JSON.stringify(sample[key]).substring(0, 50)}`);
          }
        });
      }
    } catch (error: any) {
      console.log(`   ❌ User_teams collection error: ${error.message}`);
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('   1. If user_teams has wrong structure, delete it and re-run schema sync');
    console.log('   2. If rosters has more/different fields, update migration script');
    console.log('   3. Check if collection was created with different schema');

  } catch (error) {
    console.error('❌ Structure check failed:', error);
  }
}

async function main() {
  try {
    await checkCollectionStructure();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

if (require.main === module) {
  main();
}

export { checkCollectionStructure };