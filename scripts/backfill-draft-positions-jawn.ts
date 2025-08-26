#!/usr/bin/env tsx
/**
 * Backfill draftPosition attribute for fantasy_teams in Jawn League
 * This will set the draft position based on the current draft order
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
const LEAGUES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues';
const FANTASY_TEAMS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS || 'fantasy_teams';
const DRAFTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS || 'drafts';

async function backfillDraftPositions() {
  try {
    console.log('🔍 Looking for Jawn League...');
    
    // Step 1: Find the Jawn League
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      LEAGUES_COLLECTION,
      [
        Query.equal('name', 'Jawn League'),
        Query.limit(1)
      ]
    );

    if (leagues.documents.length === 0) {
      console.error('❌ Jawn League not found');
      process.exit(1);
    }

    const league = leagues.documents[0];
    const leagueId = league.$id;
    console.log(`✅ Found Jawn League: ${leagueId}`);
    console.log(`   Name: ${league.name}`);
    console.log(`   Max Teams: ${league.maxTeams}`);
    console.log(`   Current Teams: ${league.currentTeams}`);
    console.log(`   Draft Type: ${league.draftType || 'snake'}`);

    // Step 2: Get the draft order from the league or draft document
    let draftOrder: string[] = [];
    
    // First, try to get from the league's draftOrder field
    if (league.draftOrder) {
      try {
        if (typeof league.draftOrder === 'string') {
          draftOrder = JSON.parse(league.draftOrder);
        } else if (Array.isArray(league.draftOrder)) {
          draftOrder = league.draftOrder;
        }
        console.log(`📋 Found draft order in league document: ${draftOrder.length} teams`);
      } catch (e) {
        console.log('⚠️  Could not parse draftOrder from league document');
      }
    }

    // If no draft order in league, check the drafts collection
    if (draftOrder.length === 0) {
      console.log('🔍 Checking drafts collection for draft order...');
      const drafts = await databases.listDocuments(
        DATABASE_ID,
        DRAFTS_COLLECTION,
        [
          Query.equal('leagueId', leagueId),
          Query.limit(1)
        ]
      );

      if (drafts.documents.length > 0) {
        const draft = drafts.documents[0];
        console.log(`   Found draft document: ${draft.$id}`);
        
        // Try to parse orderJson field
        if (draft.orderJson) {
          try {
            const orderData = JSON.parse(draft.orderJson);
            if (orderData.draftOrder && Array.isArray(orderData.draftOrder)) {
              draftOrder = orderData.draftOrder;
              console.log(`📋 Found draft order in draft document: ${draftOrder.length} teams`);
            }
          } catch (e) {
            console.log('⚠️  Could not parse orderJson from draft document');
          }
        }

        // Fallback to draftOrder field in draft document
        if (draftOrder.length === 0 && draft.draftOrder) {
          try {
            if (typeof draft.draftOrder === 'string') {
              draftOrder = JSON.parse(draft.draftOrder);
            } else if (Array.isArray(draft.draftOrder)) {
              draftOrder = draft.draftOrder;
            }
            console.log(`📋 Found draft order in draft.draftOrder: ${draftOrder.length} teams`);
          } catch (e) {
            console.log('⚠️  Could not parse draftOrder from draft document');
          }
        }
      }
    }

    // Step 3: Get all fantasy teams in the league
    console.log('\n📊 Fetching fantasy teams...');
    const fantasyTeams = await databases.listDocuments(
      DATABASE_ID,
      FANTASY_TEAMS_COLLECTION,
      [
        Query.equal('leagueId', leagueId),
        Query.limit(100)
      ]
    );

    console.log(`   Found ${fantasyTeams.documents.length} fantasy teams`);

    // Step 4: Create a mapping of authUserId to draft position
    const positionMap = new Map<string, number>();
    
    if (draftOrder.length > 0) {
      console.log('\n📍 Draft order:');
      draftOrder.forEach((authUserId, index) => {
        const position = index + 1;
        positionMap.set(authUserId, position);
        console.log(`   ${position}. ${authUserId}`);
      });
    } else {
      console.log('\n⚠️  No draft order found, assigning positions based on join order');
      // If no draft order exists, assign positions based on document creation order
      const sortedTeams = fantasyTeams.documents.sort((a, b) => {
        const dateA = new Date(a.$createdAt || 0).getTime();
        const dateB = new Date(b.$createdAt || 0).getTime();
        return dateA - dateB;
      });

      sortedTeams.forEach((team, index) => {
        const authUserId = team.ownerAuthUserId || team.userId || team.clientId;
        if (authUserId) {
          const position = index + 1;
          positionMap.set(authUserId, position);
          console.log(`   ${position}. ${authUserId} (${team.name || team.teamName})`);
        }
      });
    }

    // Step 5: Update each fantasy team with their draft position
    console.log('\n🔄 Updating fantasy teams with draft positions...');
    let successCount = 0;
    let errorCount = 0;

    for (const team of fantasyTeams.documents) {
      const authUserId = team.ownerAuthUserId || team.userId || team.clientId;
      
      if (!authUserId) {
        console.warn(`⚠️  Team ${team.$id} has no owner ID`);
        errorCount++;
        continue;
      }

      const position = positionMap.get(authUserId);
      
      if (!position) {
        console.warn(`⚠️  No draft position found for ${authUserId} (Team: ${team.name || team.teamName})`);
        errorCount++;
        continue;
      }

      try {
        // Check if draftPosition attribute exists in the collection
        const updateData: any = {};
        
        // Try both field names to ensure compatibility
        updateData.draftPosition = position;
        
        await databases.updateDocument(
          DATABASE_ID,
          FANTASY_TEAMS_COLLECTION,
          team.$id,
          updateData
        );
        
        successCount++;
        console.log(`   ✅ Updated ${team.name || team.teamName || 'Unknown Team'} - Position: ${position}`);
      } catch (error: any) {
        if (error.code === 400 && error.message?.includes('Unknown attribute')) {
          console.log('   ℹ️  draftPosition attribute does not exist, attempting to create it...');
          
          // Try to create the attribute
          try {
            await databases.createIntegerAttribute(
              DATABASE_ID,
              FANTASY_TEAMS_COLLECTION,
              'draftPosition',
              false, // not required
              undefined, // no default
              1, // min value
              32 // max value (reasonable max for draft positions)
            );
            console.log('   ✅ Created draftPosition attribute');
            
            // Wait for attribute to be ready
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Retry the update
            await databases.updateDocument(
              DATABASE_ID,
              FANTASY_TEAMS_COLLECTION,
              team.$id,
              { draftPosition: position }
            );
            successCount++;
            console.log(`   ✅ Updated ${team.name || team.teamName || 'Unknown Team'} - Position: ${position}`);
          } catch (createError) {
            console.error(`   ❌ Failed to create attribute or update ${team.name}: ${createError}`);
            errorCount++;
          }
        } else {
          console.error(`   ❌ Failed to update ${team.name}: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n✨ Backfill complete!');
    console.log(`   Successfully updated: ${successCount} teams`);
    console.log(`   Errors: ${errorCount} teams`);

    // Step 6: Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedTeams = await databases.listDocuments(
      DATABASE_ID,
      FANTASY_TEAMS_COLLECTION,
      [
        Query.equal('leagueId', leagueId),
        Query.orderAsc('draftPosition'),
        Query.limit(100)
      ]
    );

    console.log('📋 Final draft order:');
    updatedTeams.documents.forEach((team) => {
      const position = team.draftPosition || '?';
      const name = team.name || team.teamName || 'Unknown Team';
      const owner = team.displayName || team.ownerAuthUserId || 'Unknown Owner';
      console.log(`   ${position}. ${name} (${owner})`);
    });

  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
}

// Run the backfill
console.log('🚀 Starting draft position backfill for Jawn League...\n');
backfillDraftPositions()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
