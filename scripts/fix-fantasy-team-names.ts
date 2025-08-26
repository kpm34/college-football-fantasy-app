#!/usr/bin/env tsx
/**
 * Fix team names in fantasy_teams collection
 * Ensures teamName is properly set instead of defaulting to display name
 */

import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const FANTASY_TEAMS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS || 'fantasy_teams';

async function fixFantasyTeamNames() {
  try {
    console.log('🔍 Fetching all fantasy teams...');
    
    // Fetch all fantasy teams
    let allTeams: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FANTASY_TEAMS_COLLECTION,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allTeams = [...allTeams, ...response.documents];
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    console.log(`Found ${allTeams.length} fantasy teams to review`);

    // Process each team
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const team of allTeams) {
      try {
        const currentTeamName = team.teamName || team.name;
        const displayName = team.displayName;
        const ownerAuthUserId = team.ownerAuthUserId || team.userId || team.clientId;

        console.log(`\n📋 Processing team: ${team.$id}`);
        console.log(`   Current teamName: ${currentTeamName}`);
        console.log(`   Display name: ${displayName}`);
        console.log(`   Owner: ${ownerAuthUserId}`);

        // Check if teamName needs to be fixed
        // If teamName is the same as displayName, it likely needs a proper team name
        const needsUpdate = !currentTeamName || 
                          currentTeamName === displayName || 
                          currentTeamName === `${displayName}'s Team`;

        if (needsUpdate) {
          // Generate a proper team name
          let newTeamName = '';
          
          // If there's a custom team name stored elsewhere, use it
          if (team.customTeamName) {
            newTeamName = team.customTeamName;
          } else {
            // Generate a proper team name based on the owner's name
            const ownerName = displayName || 'Player';
            
            // Create more creative team names
            const teamPrefixes = [
              'Team', 'FC', 'United', 'City', 'Athletic', 'Sporting', 'Real', 'Inter'
            ];
            
            const teamSuffixes = [
              'Dynasty', 'Elite', 'Squad', 'Crew', 'United', 
              'FC', 'Athletics', 'Stars', 'Warriors', 'Champions',
              'Legends', 'Titans', 'Thunder', 'Lightning', 'Storm'
            ];
            
            // Use a deterministic prefix/suffix based on the user ID to keep it consistent
            if (ownerAuthUserId) {
              const charCode = ownerAuthUserId.charCodeAt(0) + ownerAuthUserId.charCodeAt(1);
              const prefixIndex = charCode % teamPrefixes.length;
              const suffixIndex = (charCode + 1) % teamSuffixes.length;
              
              // Create variations
              const variations = [
                `${teamPrefixes[prefixIndex]} ${ownerName}`,
                `${ownerName} ${teamSuffixes[suffixIndex]}`,
                `${ownerName}'s ${teamSuffixes[suffixIndex]}`,
                `The ${ownerName} ${teamSuffixes[suffixIndex]}`
              ];
              
              // Pick a variation based on another char
              const variationIndex = (ownerAuthUserId.charCodeAt(2) || 0) % variations.length;
              newTeamName = variations[variationIndex];
            } else {
              // Fallback to simple format
              newTeamName = `${ownerName} FC`;
            }
          }

          // Update the team document - only update teamName since name doesn't exist
          const updateData: any = {
            teamName: newTeamName
          };

          await databases.updateDocument(
            DATABASE_ID,
            FANTASY_TEAMS_COLLECTION,
            team.$id,
            updateData
          );

          console.log(`   ✅ Updated team name to: ${updateData.teamName}`);
          updatedCount++;
        } else {
          console.log(`   ⏭️  Team name looks good, skipping`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing team ${team.$id}:`, error);
        errorCount++;
      }
    }

    console.log('\n✨ Team name fix complete!');
    console.log(`   Updated: ${updatedCount} teams`);
    console.log(`   Skipped: ${skippedCount} teams`);
    console.log(`   Errors: ${errorCount} teams`);

    // Show a sample of the updated teams
    if (updatedCount > 0) {
      console.log('\n📊 Sample of updated teams:');
      const sampleTeams = await databases.listDocuments(
        DATABASE_ID,
        FANTASY_TEAMS_COLLECTION,
        [Query.limit(10)]
      );

      sampleTeams.documents.forEach(team => {
        console.log(`   - ${team.teamName || team.name} (Owner: ${team.displayName})`);
      });
    }

  } catch (error) {
    console.error('❌ Team name fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
console.log('🚀 Starting fantasy team name fix...\n');
fixFantasyTeamNames()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
