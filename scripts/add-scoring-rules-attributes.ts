#!/usr/bin/env tsx
import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function addScoringRulesAttributes() {
  try {
    console.log('Adding scoringRules attributes to collections...\n');
    
    // Collections to update
    const collections = ['leagues', 'drafts'];
    
    for (const collectionId of collections) {
      console.log(`\n=== Updating ${collectionId} collection ===`);
      
      try {
        // Add scoringRules attribute (JSON string to store all rules)
        await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          'scoringRules',
          65535,  // Large size for JSON
          false,  // not required
          null    // no default
        );
        console.log(`✅ Added scoringRules to ${collectionId}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`ℹ️  scoringRules already exists in ${collectionId}`);
        } else {
          console.error(`❌ Error adding scoringRules to ${collectionId}:`, error.message);
        }
      }
      
      // Add draftOrder attribute to leagues if it doesn't exist
      if (collectionId === 'leagues') {
        try {
          await databases.createStringAttribute(
            DATABASE_ID,
            collectionId,
            'draftOrder',
            65535,  // Large size for JSON array
            false,  // not required
            null    // no default
          );
          console.log(`✅ Added draftOrder to ${collectionId}`);
        } catch (error: any) {
          if (error.code === 409) {
            console.log(`ℹ️  draftOrder already exists in ${collectionId}`);
          } else {
            console.error(`❌ Error adding draftOrder to ${collectionId}:`, error.message);
          }
        }
      }
    }
    
    // Wait for attributes to be ready
    console.log('\nWaiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Set default scoring rules for existing leagues
    const defaultScoringRules = JSON.stringify({
      passingTD: 4,
      passingYard: 0.04,
      interception: -2,
      rushingTD: 6,
      rushingYard: 0.1,
      receivingTD: 6,
      receivingYard: 0.1,
      reception: 1,
      fumble: -2
    });
    
    console.log('\nUpdating existing leagues with default scoring rules...');
    const leagues = await databases.listDocuments(DATABASE_ID, 'leagues');
    
    for (const league of leagues.documents) {
      if (!league.scoringRules) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            'leagues',
            league.$id,
            {
              scoringRules: defaultScoringRules
            }
          );
          console.log(`✅ Updated ${league.name} with default scoring rules`);
        } catch (error: any) {
          console.error(`❌ Failed to update ${league.name}:`, error.message);
        }
      }
    }
    
    // Update existing drafts
    console.log('\nUpdating existing drafts with scoring rules...');
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts');
    
    for (const draft of drafts.documents) {
      if (!draft.scoringRules) {
        try {
          // Try to get scoring rules from the associated league
          const leagueId = draft.league_id || draft.leagueId;
          if (leagueId) {
            try {
              const league = await databases.getDocument(DATABASE_ID, 'leagues', leagueId);
              await databases.updateDocument(
                DATABASE_ID,
                'drafts',
                draft.$id,
                {
                  scoringRules: league.scoringRules || defaultScoringRules
                }
              );
              console.log(`✅ Updated draft ${draft.$id} with league scoring rules`);
            } catch {
              // If can't find league, use defaults
              await databases.updateDocument(
                DATABASE_ID,
                'drafts',
                draft.$id,
                {
                  scoringRules: defaultScoringRules
                }
              );
              console.log(`✅ Updated draft ${draft.$id} with default scoring rules`);
            }
          }
        } catch (error: any) {
          console.error(`❌ Failed to update draft ${draft.$id}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ All done! Scoring rules have been added.');
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

addScoringRulesAttributes();
