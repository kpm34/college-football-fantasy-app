#!/usr/bin/env ts-node

/**
 * Sync Enhanced Projections to Database
 * Updates player_projections collection with depth chart logic applied
 */

import { ProjectionsService } from '@/lib/services/projections.service';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

async function syncEnhancedProjections() {
  console.log('🔄 Starting enhanced projections sync...');
  
  try {
    // Get enhanced projections for all Power 4 conferences
    const conferences = ['SEC', 'ACC', 'Big 12', 'Big Ten'];
    let totalSynced = 0;
    
    for (const conference of conferences) {
      console.log(`\n📊 Processing ${conference} projections...`);
      
      // Get enhanced projections with depth chart logic
      const projections = await ProjectionsService.getEnhancedSeasonProjections(conference);
      
      console.log(`Found ${projections.length} ${conference} projections`);
      
      for (const projection of projections) {
        try {
          // Check if projection already exists
          const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYER_PROJECTIONS,
            [Query.equal('playerId', projection.playerId), Query.limit(1)]
          );
          
          if (existing.documents.length > 0) {
            // Update existing projection
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYER_PROJECTIONS,
              existing.documents[0].$id,
              projection
            );
            console.log(`✅ Updated ${projection.playerName} (${projection.position}, ${projection.team})`);
          } else {
            // Create new projection
            await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYER_PROJECTIONS,
              'unique()',
              projection
            );
            console.log(`🆕 Created ${projection.playerName} (${projection.position}, ${projection.team})`);
          }
          
          totalSynced++;
          
          // Rate limiting - avoid overwhelming Appwrite
          if (totalSynced % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (error) {
          console.error(`❌ Failed to sync ${projection.playerName}:`, error);
        }
      }
    }
    
    console.log(`\n✅ Sync complete! Updated ${totalSynced} projections`);
    
    // Log some sample QB projections to verify depth chart logic
    console.log('\n📋 Sample QB projections:');
    const sampleQBs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYER_PROJECTIONS,
      [
        Query.equal('position', 'QB'),
        Query.equal('team', 'Louisville'),
        Query.orderDesc('projections.fantasyPoints'),
        Query.limit(3)
      ]
    );
    
    for (const qb of sampleQBs.documents) {
      const proj = qb.projections as any;
      console.log(`  ${qb.playerName}: ${proj.fantasyPoints} pts (${proj.passingYards} pass yds, ${proj.passingTDs} TDs)`);
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncEnhancedProjections().catch(console.error);
}

export { syncEnhancedProjections };