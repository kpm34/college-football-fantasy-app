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
  FANTASY_TEAMS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS || 'fantasy_teams',
  USER_TEAMS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS || 'user_teams',
};

async function checkLeagueStatus() {
  console.log('🔍 Checking "test xl" league status...\n');
  
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
    console.log('📋 League Details:');
    console.log(`  - ID: ${league.$id}`);
    console.log(`  - Name: ${league.name}`);
    console.log(`  - Status: ${league.status}`);
    console.log(`  - Max Teams: ${league.maxTeams}`);
    console.log(`  - Game Mode: ${league.gameMode}`);
    console.log(`  - Draft Date: ${league.draftDate}`);
    console.log(`  - Commissioner: ${league.commissioner || league.commissionerAuthUserId}`);
    
    // Check actual members in league_memberships
    console.log('\n👥 Checking League Memberships:');
    const membershipsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUE_MEMBERSHIPS,
      [
        Query.equal('leagueId', league.$id),
        Query.limit(100)
      ]
    );
    
    console.log(`  - Total memberships: ${membershipsRes.documents.length}`);
    console.log(`  - Active memberships: ${membershipsRes.documents.filter((m: any) => m.status === 'active').length}`);
    
    console.log('\n  Members list:');
    membershipsRes.documents.forEach((member: any, idx: number) => {
      console.log(`    ${idx + 1}. ${member.displayName || member.clientId} (${member.status})`);
    });
    
    // Check fantasy teams (fantasy_teams collection)
    console.log('\n🏈 Checking Fantasy Teams:');
    const teamsRes = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [
        Query.equal('leagueId', league.$id),
        Query.limit(100)
      ]
    );
    
    console.log(`  - Total teams: ${teamsRes.documents.length}`);
    console.log('\n  Teams list:');
    teamsRes.documents.forEach((team: any, idx: number) => {
      console.log(`    ${idx + 1}. ${team.teamName || team.name} (Owner: ${team.ownerClientId || team.userId})`);
    });
    
    // Check draft order
    console.log('\n📝 Draft Order:');
    if (league.draftOrder) {
      const draftOrder = Array.isArray(league.draftOrder) 
        ? league.draftOrder 
        : JSON.parse(league.draftOrder);
      console.log(`  - Total in draft order: ${draftOrder.length}`);
      console.log(`  - Order: ${JSON.stringify(draftOrder, null, 2)}`);
    } else {
      console.log('  - No draft order set');
    }
    
    // Determine why it's showing as full
    console.log('\n📊 Status Analysis:');
    const activeMemberships = membershipsRes.documents.filter((m: any) => m.status === 'active').length;
    const maxTeams = league.maxTeams || 12;
    
    if (league.status === 'full') {
      if (activeMemberships >= maxTeams) {
        console.log(`  ✅ Status "full" is correct: ${activeMemberships} active members >= ${maxTeams} max teams`);
      } else {
        console.log(`  ⚠️  Status is "full" but only ${activeMemberships} active members < ${maxTeams} max teams`);
        console.log(`     This might be manually set or from draft order including bots`);
      }
    } else {
      console.log(`  ℹ️  Status is "${league.status}" with ${activeMemberships}/${maxTeams} slots filled`);
    }
    
  } catch (error: any) {
    console.error('❌ Failed to check league status:', error);
    process.exit(1);
  }
}

// Run the check
checkLeagueStatus().catch(console.error);
