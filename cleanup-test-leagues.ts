#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';

async function cleanupTestLeagues() {
  try {
    console.log('🧹 CLEANING UP TEST LEAGUES');
    console.log('===========================');
    console.log('Keeping only: "Jawn League"');
    console.log('Deleting all test leagues...\n');
    
    // Get all leagues
    const leagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, []);
    console.log(`Found ${leagues.total} leagues total:`);
    
    for (const league of leagues.documents) {
      console.log(`- ID: ${league.$id}, Name: "${league.name}"`);
    }
    
    // Filter leagues to delete (everything except "Jawn League")
    const leaguesToDelete = leagues.documents.filter(league => 
      league.name !== 'Jawn League'
    );
    
    console.log(`\n🗑️  Leagues to delete: ${leaguesToDelete.length}`);
    console.log(`✅ Leagues to keep: ${leagues.total - leaguesToDelete.length}`);
    
    if (leaguesToDelete.length === 0) {
      console.log('\n✅ No test leagues found to delete. Only Jawn League exists.');
      return;
    }
    
    // Delete test leagues and their associated user teams
    for (const league of leaguesToDelete) {
      try {
        console.log(`\n🗑️  Deleting: "${league.name}" (${league.$id})`);
        
        // First, find and delete associated user teams
        const userTeams = await databases.listDocuments(
          DATABASE_ID, 
          COLLECTIONS.USER_TEAMS, 
          []
        );
        
        const teamsToDelete = userTeams.documents.filter(team => 
          team.leagueId === league.$id
        );
        
        console.log(`   📋 Found ${teamsToDelete.length} associated teams to delete`);
        
        for (const team of teamsToDelete) {
          try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USER_TEAMS, team.$id);
            console.log(`   ✅ Deleted team: ${team.teamName}`);
          } catch (teamError: any) {
            console.log(`   ❌ Failed to delete team ${team.teamName}: ${teamError.message}`);
          }
        }
        
        // Then delete the league itself
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUES, league.$id);
        console.log(`   ✅ Deleted league: "${league.name}"`);
        
      } catch (error: any) {
        console.log(`   ❌ Failed to delete league "${league.name}": ${error.message}`);
      }
    }
    
    // Verify cleanup
    console.log('\n📊 CLEANUP VERIFICATION');
    console.log('=======================');
    
    const remainingLeagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, []);
    const remainingTeams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USER_TEAMS, []);
    
    console.log(`\n✅ Remaining leagues: ${remainingLeagues.total}`);
    for (const league of remainingLeagues.documents) {
      console.log(`   - ${league.name} (${league.$id})`);
    }
    
    console.log(`\n✅ Remaining user teams: ${remainingTeams.total}`);
    const jawnLeagueTeams = remainingTeams.documents.filter(team => 
      remainingLeagues.documents.some(league => league.$id === team.leagueId)
    );
    
    for (const team of jawnLeagueTeams) {
      console.log(`   - ${team.teamName} (League: ${team.leagueId})`);
    }
    
    // Clean up orphaned teams (teams without a valid league)
    const orphanedTeams = remainingTeams.documents.filter(team => 
      !remainingLeagues.documents.some(league => league.$id === team.leagueId)
    );
    
    if (orphanedTeams.length > 0) {
      console.log(`\n🗑️  Found ${orphanedTeams.length} orphaned teams to clean up:`);
      for (const team of orphanedTeams) {
        try {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USER_TEAMS, team.$id);
          console.log(`   ✅ Deleted orphaned team: ${team.teamName}`);
        } catch (error: any) {
          console.log(`   ❌ Failed to delete orphaned team: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 CLEANUP COMPLETE!');
    console.log('Only "Jawn League" and its teams remain.');
    
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

cleanupTestLeagues().catch(console.error);