#!/usr/bin/env npx tsx
import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

const COLLECTIONS = {
  LEAGUES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues',
  LEAGUE_MEMBERSHIPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS || 'league_memberships',
};

async function fixLeagueStatus() {
  console.log('🔧 Fixing "test xl" league status...\n');
  
  try {
    // Find the test xl league
    const leaguesRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [
        Query.equal('name', 'test xl'),
        Query.limit(1)
      ]
    );
    
    if (leaguesRes.documents.length === 0) {
      console.error('❌ League "test xl" not found');
      return;
    }
    
    const league = leaguesRes.documents[0];
    
    // Check actual member count
    const membershipsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUE_MEMBERSHIPS,
      [
        Query.equal('leagueId', league.$id),
        Query.equal('status', 'active'),
        Query.limit(100)
      ]
    );
    
    const activeMemberCount = membershipsRes.documents.length;
    const maxTeams = league.maxTeams || 12;
    
    console.log('📊 Current Status:');
    console.log(`  - League status: ${league.status}`);
    console.log(`  - Active members: ${activeMemberCount}`);
    console.log(`  - Max teams: ${maxTeams}`);
    
    // Determine correct status
    let correctStatus = 'open';
    if (activeMemberCount >= maxTeams) {
      correctStatus = 'full';
    } else if (league.draftDate && new Date(league.draftDate).getTime() < Date.now()) {
      correctStatus = 'drafting';
    }
    
    console.log(`\n  - Correct status should be: ${correctStatus}`);
    
    // For testing purposes, you want it to be "full" to trigger draft
    // So let's keep it as "full" if you want to test with bots
    console.log('\n🤖 For draft testing with bots:');
    console.log('  - Keeping status as "full" allows the draft to start');
    console.log('  - The draft will use the draft order you set (including BOT entries)');
    console.log('  - Only 2 real members, but draft order can include bots');
    
    // Update only if you want to change it
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\nDo you want to change the status? (y/n): ', async (answer: string) => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Enter new status (open/full/drafting): ', async (newStatus: string) => {
          if (['open', 'full', 'drafting'].includes(newStatus)) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.LEAGUES,
              league.$id,
              { status: newStatus }
            );
            console.log(`✅ Updated status to: ${newStatus}`);
          } else {
            console.log('❌ Invalid status. Must be: open, full, or drafting');
          }
          rl.close();
        });
      } else {
        console.log('✅ Keeping current status: ' + league.status);
        rl.close();
      }
    });
    
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixLeagueStatus().catch(console.error);
