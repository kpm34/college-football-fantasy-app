#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';

async function restoreJawnLeague() {
  try {
    console.log('🏈 RESTORING ORIGINAL JAWN LEAGUE');
    console.log('=================================');
    
    const fs = await import('fs');
    const jawnLeagueBackup = JSON.parse(await fs.promises.readFile('leagues-final-backup.json', 'utf-8'));
    const originalLeague = jawnLeagueBackup[0];
    
    console.log(`📋 Original Jawn League data:`);
    console.log(`   Name: ${originalLeague.name}`);
    console.log(`   Commissioner: ${originalLeague.commissioner}`);
    console.log(`   Teams: ${originalLeague.currentTeams}/${originalLeague.maxTeams}`);
    console.log(`   Status: ${originalLeague.status}`);
    console.log(`   Original ID: ${originalLeague.$id}`);
    
    // Create the restored league with cleaned data
    const cleanedLeagueData = {
      name: originalLeague.name,
      commissioner: originalLeague.commissioner,
      season: originalLeague.season,
      maxTeams: originalLeague.maxTeams,
      currentTeams: originalLeague.currentTeams,
      draftType: originalLeague.draftType,
      gameMode: originalLeague.gameMode,
      status: originalLeague.status,
      isPublic: originalLeague.isPublic,
      pickTimeSeconds: originalLeague.pickTimeSeconds,
      scoringRules: originalLeague.scoringRules
    };
    
    console.log('\n🔄 Creating restored Jawn League...');
    const restoredLeague = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      originalLeague.$id, // Try to use the original ID
      cleanedLeagueData
    );
    
    console.log(`✅ Successfully restored Jawn League!`);
    console.log(`   New ID: ${restoredLeague.$id}`);
    console.log(`   Name: ${restoredLeague.name}`);
    console.log(`   Status: ${restoredLeague.status}`);
    
    // Now restore the user teams for this league
    console.log('\n👥 RESTORING USER TEAMS FOR JAWN LEAGUE');
    console.log('=======================================');
    
    const userTeamsBackup = JSON.parse(await fs.promises.readFile('master-backup-1755637950927.json', 'utf-8'));
    const userTeamsData = userTeamsBackup.find((b: any) => b.id === 'user_teams');
    
    if (userTeamsData && userTeamsData.documents.length > 0) {
      // Filter teams that belonged to the original Jawn League
      const jawnTeams = userTeamsData.documents.filter((team: any) => 
        team.leagueId === originalLeague.$id
      );
      
      console.log(`Found ${jawnTeams.length} teams for Jawn League`);
      
      for (const team of jawnTeams) {
        try {
          const cleanedTeamData = {
            leagueId: restoredLeague.$id, // Use the restored league ID
            userId: team.userId || team.owner,
            teamName: team.teamName || team.name || 'Team',
            abbreviation: team.abbreviation || team.teamName?.substring(0, 3) || 'TM',
            wins: team.wins || 0,
            losses: team.losses || 0,
            ties: team.ties || 0,
            pointsFor: team.pointsFor || team.points || 0,
            pointsAgainst: team.pointsAgainst || 0,
            players: JSON.stringify(team.players || []),
            draftPosition: team.draftPosition || 1
          };
          
          const restoredTeam = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USER_TEAMS,
            team.$id, // Try to use original team ID
            cleanedTeamData
          );
          
          console.log(`   ✅ Restored team: ${restoredTeam.teamName}`);
          
        } catch (teamError: any) {
          console.log(`   ❌ Failed to restore team ${team.teamName}: ${teamError.message}`);
          // Try with auto-generated ID if original ID fails
          try {
            const cleanedTeamData = {
              leagueId: restoredLeague.$id,
              userId: team.userId || team.owner,
              teamName: team.teamName || team.name || 'Team',
              abbreviation: team.abbreviation || team.teamName?.substring(0, 3) || 'TM',
              wins: team.wins || 0,
              losses: team.losses || 0,
              ties: team.ties || 0,
              pointsFor: team.pointsFor || team.points || 0,
              pointsAgainst: team.pointsAgainst || 0,
              players: JSON.stringify(team.players || []),
              draftPosition: team.draftPosition || 1
            };
            
            const restoredTeam = await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.USER_TEAMS,
              'unique()', // Let Appwrite generate ID
              cleanedTeamData
            );
            
            console.log(`   ✅ Restored team with new ID: ${restoredTeam.teamName}`);
          } catch (retryError: any) {
            console.log(`   ❌ Failed retry for team ${team.teamName}: ${retryError.message}`);
          }
        }
      }
    }
    
    // Final verification
    console.log('\n📊 RESTORATION VERIFICATION');
    console.log('===========================');
    
    const finalLeagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, []);
    const finalTeams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USER_TEAMS, []);
    
    console.log(`✅ Total leagues: ${finalLeagues.total}`);
    for (const league of finalLeagues.documents) {
      console.log(`   - ${league.name} (${league.maxTeams} max teams)`);
    }
    
    console.log(`✅ Total teams: ${finalTeams.total}`);
    for (const team of finalTeams.documents) {
      console.log(`   - ${team.teamName} (League: ${team.leagueId})`);
    }
    
    console.log('\n🎉 JAWN LEAGUE RESTORATION COMPLETE!');
    console.log('The original Jawn League and its teams have been restored.');
    
  } catch (error: any) {
    console.error('❌ Jawn League restoration failed:', error.message);
  }
}

restoreJawnLeague().catch(console.error);