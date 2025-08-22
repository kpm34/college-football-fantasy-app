#!/usr/bin/env node
import 'dotenv/config';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';
import { Query } from 'node-appwrite';

async function consolidateCommissionerFields() {
  console.log('Starting commissioner field consolidation...');
  
  try {
    // Fetch all leagues
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(100)]
    );
    
    console.log(`Found ${leagues.total} leagues to process`);
    
    let updated = 0;
    let errors = 0;
    
    for (const league of leagues.documents) {
      try {
        // Check if we need to consolidate fields
        const hasCommissioner = !!league.commissioner;
        
        // Determine the correct commissioner ID
        // Check various possible fields where commissioner might be stored
        let commissionerId = league.commissioner || league.commissionerId || league.commissioner_id || league.ownerId || league.createdBy || league.userId;
        
        if (!commissionerId) {
          console.log(`Warning: League ${league.$id} (${league.name}) has no commissioner information`);
          continue;
        }
        
        // Update to ensure commissioner field is populated
        const updateData: any = {};
        
        // Ensure commissioner is set (this is the only field Appwrite has)
        if (!hasCommissioner || league.commissioner !== commissionerId) {
          updateData.commissioner = commissionerId;
        }
        
        if (Object.keys(updateData).length > 0) {
          console.log(`Updating league ${league.$id} (${league.name}):`, updateData);
          
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.LEAGUES,
            league.$id,
            updateData
          );
          
          updated++;
        } else {
          console.log(`League ${league.$id} (${league.name}) already has correct commissioner fields`);
        }
        
      } catch (error) {
        console.error(`Error updating league ${league.$id}:`, error);
        errors++;
      }
    }
    
    console.log(`\nConsolidation complete:`);
    console.log(`- Total leagues: ${leagues.total}`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Errors: ${errors}`);
    console.log(`- Skipped: ${leagues.total - updated - errors}`);
    
  } catch (error) {
    console.error('Error consolidating commissioner fields:', error);
    process.exit(1);
  }
}

// Run the consolidation
consolidateCommissionerFields().catch(console.error);
