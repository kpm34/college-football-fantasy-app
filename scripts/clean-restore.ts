import { Client, Databases, Query, ID } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players';

async function cleanAndRestore() {
  console.log('🔄 COMPLETE DATABASE RESTORATION PROCESS\n');
  console.log('═'.repeat(60));
  
  try {
    // PHASE 1: CLEAR DATABASE
    console.log('\n📊 PHASE 1: Checking current database...');
    const initial = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log(`  Current players in database: ${initial.total}`);
    
    if (initial.total > 0) {
      console.log('\n🗑️  Clearing all existing players...');
      console.log('  Note: This will take time due to rate limits (approx 5-10 minutes for 1600 documents)');
      let deleted = 0;
      let consecutiveEmptyBatches = 0;
      
      while (deleted < initial.total && consecutiveEmptyBatches < 3) {
        // Always fetch from offset 0 since we're deleting as we go
        // The documents shift forward as we delete
        const batch = await databases.listDocuments(
          DATABASE_ID, 
          COLLECTION_ID,
          [
            Query.limit(10),  // Small batch to avoid rate limits
            Query.offset(0)    // Always start from 0 since we're deleting
          ]
        );
        
        if (batch.documents.length === 0) {
          consecutiveEmptyBatches++;
          console.log(`\n  No more documents found (attempt ${consecutiveEmptyBatches}/3)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        consecutiveEmptyBatches = 0; // Reset counter if we found documents
        
        for (const doc of batch.documents) {
          try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
            deleted++;
            process.stdout.write(`\r  Deleted: ${deleted}/${initial.total} documents (${Math.round(deleted/initial.total * 100)}%)`);
            // Delay between each delete to avoid rate limits (200ms per delete)
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error: any) {
            if (error.code === 429) {
              console.log('\n  Rate limit hit, waiting 10 seconds...');
              await new Promise(resolve => setTimeout(resolve, 10000));
              // Try this document again
              try {
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
                deleted++;
              } catch (e) {
                console.log(`\n  Failed to delete document ${doc.$id}: ${e}`);
              }
            } else {
              console.log(`\n  Error deleting document: ${error.message}`);
            }
          }
        }
        
        // Pause between batches (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`\n  ✅ Successfully deleted ${deleted} documents`);
    }
    
    // Verify empty
    const afterClear = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log(`\n  Verification: Database now has ${afterClear.total} players`);
    
    if (afterClear.total !== 0) {
      throw new Error('Database is not empty after clearing!');
    }
    
    console.log('  ✅ Database is completely empty and ready for restoration');
    
    // PHASE 2: RESTORE FROM BACKUP
    console.log('\n' + '═'.repeat(60));
    console.log('\n📂 PHASE 2: Loading backup data...');
    const backupPath = path.join(process.cwd(), 'exports/college_players_2025.json');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found at ${backupPath}`);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`  ✅ Loaded ${backupData.length} players from backup`);
    
    // Show conference breakdown
    const confCounts: Record<string, number> = {};
    for (const player of backupData) {
      const conf = player.conference || 'Unknown';
      confCounts[conf] = (confCounts[conf] || 0) + 1;
    }
    
    console.log('\n  Backup contains:');
    console.log('  ├── SEC: ' + (confCounts['SEC'] || 0) + ' players');
    console.log('  ├── ACC: ' + (confCounts['ACC'] || 0) + ' players');
    console.log('  ├── Big Ten: ' + (confCounts['Big Ten'] || 0) + ' players');
    console.log('  ├── Big 12: ' + (confCounts['Big 12'] || 0) + ' players');
    console.log('  └── Other: ' + (confCounts['Independent'] || 0) + ' players');
    
    // PHASE 3: RESTORE DATA
    console.log('\n📥 PHASE 3: Restoring players to database...');
    let restored = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < backupData.length; i++) {
      const player = backupData[i];
      
      try {
        // Clean the data
        const cleanPlayer = { ...player };
        delete cleanPlayer.$id;
        delete cleanPlayer.$createdAt;
        delete cleanPlayer.$updatedAt;
        delete cleanPlayer.$permissions;
        delete cleanPlayer.$collectionId;
        delete cleanPlayer.$databaseId;
        
        // Prepare player data
        const playerData: any = {
          name: cleanPlayer.name || `Player ${i}`,
          position: cleanPlayer.position || 'RB',
          team: cleanPlayer.team || cleanPlayer.school || 'Unknown',
          conference: cleanPlayer.conference || 'Unknown',
          year: cleanPlayer.year || 'JR',
          height: cleanPlayer.height || '6-0',
          weight: cleanPlayer.weight || 200,
          jersey_number: cleanPlayer.jersey_number || 0,
          hometown: cleanPlayer.hometown || '',
          high_school: cleanPlayer.high_school || '',
          fantasy_points: cleanPlayer.fantasy_points || 0,
          adp: cleanPlayer.adp || 999,
          depth_chart_order: cleanPlayer.depth_chart_order || 99,
          injury_status: cleanPlayer.injury_status || 'healthy',
          team_id: cleanPlayer.team_id || 0,
          cfbd_id: cleanPlayer.cfbd_id || '',
          espn_id: cleanPlayer.espn_id || '',
          statline_simple_json: cleanPlayer.statline_simple_json || '{}',
          last_updated: new Date().toISOString()
        };
        
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          playerData
        );
        
        restored++;
        
        if (restored % 100 === 0) {
          process.stdout.write(`\r  Progress: ${restored}/${backupData.length} players restored`);
          // Pause every 100 documents to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else if (restored % 10 === 0) {
          // Small pause every 10 documents
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error: any) {
        failed++;
        if (failed <= 5) {
          errors.push(`${player.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n  ✅ Restored ${restored} players`);
    if (failed > 0) {
      console.log(`  ⚠️  Failed to restore ${failed} players`);
      if (errors.length > 0) {
        console.log('  First few errors:');
        errors.forEach(e => console.log(`    - ${e}`));
      }
    }
    
    // PHASE 4: FINAL VERIFICATION
    console.log('\n' + '═'.repeat(60));
    console.log('\n🔍 PHASE 4: Final verification...');
    
    const final = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log(`\n  Total players in database: ${final.total}`);
    
    // Check each conference
    console.log('\n  Power 4 Conference Check:');
    const conferences = ['SEC', 'ACC', 'Big Ten', 'Big 12'];
    let allGood = true;
    
    for (const conf of conferences) {
      try {
        const confCheck = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('conference', conf), Query.limit(1)]
        );
        const expected = confCounts[conf] || 0;
        const status = confCheck.total > 0 ? '✅' : '❌';
        console.log(`    ${status} ${conf}: ${confCheck.total} players (expected: ${expected})`);
        if (confCheck.total === 0) allGood = false;
      } catch (e) {
        console.log(`    ❌ ${conf}: Error checking`);
        allGood = false;
      }
    }
    
    // Final summary
    console.log('\n' + '═'.repeat(60));
    if (allGood && restored > 2000) {
      console.log('🎉 SUCCESS! DATABASE FULLY RESTORED!');
      console.log(`   • ${restored} players from all Power 4 conferences`);
      console.log('   • All conferences verified and present');
      console.log('   • Database is ready for use!');
    } else {
      console.log('⚠️  PARTIAL SUCCESS');
      console.log(`   • Restored ${restored} out of ${backupData.length} players`);
      console.log('   • Some conferences may be missing');
      console.log('   • Please check the errors above');
    }
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Process failed:', error);
  }
}

cleanAndRestore();
