#!/usr/bin/env tsx

import { Client, Databases, Query } from 'node-appwrite';
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

async function fixKashyapTeams() {
  console.log('🔧 Fixing Kashyap\'s fantasy teams...\n');
  
  const WRONG_ID = '68aa1f09001547b92a17'; // Old/wrong ID
  const CORRECT_ID = '689728660623e03830fc'; // Your actual Auth ID
  
  try {
    // Find teams with the wrong owner_client_id
    const teamsToFix = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [Query.equal('owner_client_id', WRONG_ID)]
    );
    
    console.log(`Found ${teamsToFix.documents.length} teams to fix:`);
    
    for (const team of teamsToFix.documents) {
      console.log(`\nFixing team: ${team.name} (${team.$id})`);
      console.log(`  League: ${team.league_id}`);
      console.log(`  Old owner_client_id: ${team.owner_client_id}`);
      console.log(`  New owner_client_id: ${CORRECT_ID}`);
      
      // Update the team
      await databases.updateDocument(
        DATABASE_ID,
        'fantasy_teams',
        team.$id,
        {
          owner_client_id: CORRECT_ID
        }
      );
      
      console.log(`  ✅ Updated!`);
    }
    
    // Verify the fix
    console.log('\n\n📊 Verifying the fix...');
    const fixedTeams = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [Query.equal('owner_client_id', CORRECT_ID)]
    );
    
    console.log(`\nKashyap now has ${fixedTeams.documents.length} teams:`);
    for (const team of fixedTeams.documents) {
      console.log(`  - ${team.name} in league ${team.league_id}`);
    }
    
  } catch (error) {
    console.error('Error fixing teams:', error);
  }
}

fixKashyapTeams();
