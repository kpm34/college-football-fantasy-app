#!/usr/bin/env ts-node

/**
 * Restore User-League Relationships Script
 * 
 * This script recreates the missing roster records that link users to their leagues.
 * During database cleanup, these relationships were lost, causing users to not see
 * their leagues in the dashboard or sidebar navigation.
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-generated';
import { ID, Query } from 'node-appwrite';

interface League {
  $id: string;
  name: string;
  commissioner: string;
  maxTeams: number;
  currentTeams: number;
}

interface User {
  $id: string;
  email: string;
  name?: string;
}

interface RosterRecord {
  leagueId: string;
  userId: string;
  teamName: string;
  abbreviation?: string;
  draftPosition?: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  players: string; // JSON array
}

async function restoreUserLeagueRelationships() {
  console.log('🔄 Starting User-League Relationship Restoration...');
  
  try {
    // Step 1: Get all existing leagues
    console.log('\n📋 Fetching existing leagues...');
    const leaguesResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(100)]
    );
    
    const leagues = leaguesResponse.documents as unknown as League[];
    console.log(`Found ${leagues.length} leagues:`);
    leagues.forEach(league => {
      console.log(`  - ${league.name} (${league.$id}) - Commissioner: ${league.commissioner}`);
    });

    // Step 2: Get all existing users  
    console.log('\n👥 Fetching existing users...');
    const usersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.limit(100)]
    );
    
    const users = usersResponse.documents as unknown as User[];
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name || 'No name'} (${user.email}) - ID: ${user.$id}`);
    });

    // Step 3: Check existing rosters to avoid duplicates
    console.log('\n🔍 Checking existing rosters...');
    const existingRostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.limit(100)]
    );
    
    const existingRosters = existingRostersResponse.documents;
    console.log(`Found ${existingRosters.length} existing rosters`);
    
    const existingRosterKeys = new Set(
      existingRosters.map(r => `${r.leagueId}-${r.userId}`)
    );

    // Step 4: Create roster records based on known relationships
    console.log('\n🏗️  Creating roster records...');
    
    // Known relationships to restore (you'll need to specify these)
    const knownRelationships = [
      {
        leagueId: '6894db4a0001ad84e4b0', // Jawn League ID
        userEmail: 'kashpm2002@gmail.com', // Your email
        teamName: 'Team Kashyap',
        isCommissioner: true
      },
      // Add more known relationships here as needed
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const relationship of knownRelationships) {
      const league = leagues.find(l => l.$id === relationship.leagueId);
      const user = users.find(u => u.email === relationship.userEmail);
      
      if (!league) {
        console.log(`  ⚠️  League ${relationship.leagueId} not found, skipping`);
        continue;
      }
      
      if (!user) {
        console.log(`  ⚠️  User ${relationship.userEmail} not found, skipping`);
        continue;
      }

      const rosterKey = `${league.$id}-${user.$id}`;
      
      if (existingRosterKeys.has(rosterKey)) {
        console.log(`  ⏭️  Roster already exists for ${user.email} in ${league.name}, skipping`);
        skippedCount++;
        continue;
      }

      // Create the roster record
      const rosterData: RosterRecord = {
        leagueId: league.$id,
        userId: user.$id,
        teamName: relationship.teamName,
        abbreviation: relationship.teamName.substring(0, 4).toUpperCase(),
        draftPosition: 1, // Default value
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        players: JSON.stringify([]) // Empty roster initially
      };

      try {
        const newRoster = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          ID.unique(),
          rosterData
        );
        
        console.log(`  ✅ Created roster for ${user.email} in ${league.name} (${newRoster.$id})`);
        createdCount++;

        // Update league member count if this is a new member
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          league.$id,
          {
            currentTeams: league.currentTeams + 1
          }
        );
        
      } catch (error: any) {
        console.log(`  ❌ Failed to create roster for ${user.email} in ${league.name}: ${error.message}`);
      }
    }

    // Step 5: Summary
    console.log('\n📊 Restoration Complete!');
    console.log(`✅ Created: ${createdCount} new roster records`);
    console.log(`⏭️  Skipped: ${skippedCount} existing records`);
    console.log(`📋 Total leagues: ${leagues.length}`);
    console.log(`👥 Total users: ${users.length}`);
    
    if (createdCount > 0) {
      console.log('\n🎉 User-league relationships restored!');
      console.log('Users should now see their leagues in the dashboard and sidebar navigation.');
    } else {
      console.log('\n⚠️  No new relationships were created.');
      console.log('Please check the knownRelationships array and ensure users/leagues exist.');
    }

  } catch (error: any) {
    console.error('❌ Error restoring relationships:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  restoreUserLeagueRelationships()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { restoreUserLeagueRelationships };