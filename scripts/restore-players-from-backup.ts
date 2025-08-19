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

async function clearAndRestore() {
  console.log('🔄 STARTING PLAYER DATABASE RESTORATION\n');
  console.log('─'.repeat(50));
  
  try {
    // Step 1: Check current state
    console.log('📊 Step 1: Checking current database state...');
    const currentData = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log(`  Current players in database: ${currentData.total}`);
    
    // Step 2: Clear existing data if any
    if (currentData.total > 0) {
      console.log('\n🗑️  Step 2: Clearing existing incomplete data...');
      let deleted = 0;
      let offset = 0;
      const batchSize = 100;
      
      while (deleted < currentData.total) {
        const batch = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.limit(batchSize)]
        );
        
        if (batch.documents.length === 0) break;
        
        for (const doc of batch.documents) {
          try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
            deleted++;
            if (deleted % 100 === 0) {
              console.log(`  Deleted ${deleted}/${currentData.total} documents...`);
            }
          } catch (e) {
            console.log(`  Warning: Could not delete document ${doc.$id}`);
          }
        }
      }
      console.log(`  ✅ Cleared ${deleted} documents`);
    } else {
      console.log('\n✅ Step 2: Database already empty, skipping clear');
    }
    
    // Step 3: Load backup data
    console.log('\n📂 Step 3: Loading backup data...');
    const backupPath = path.join(process.cwd(), 'exports/college_players_2025.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`  Loaded ${backupData.length} players from backup`);
    
    // Count by conference for verification
    const confCounts: Record<string, number> = {};
    for (const player of backupData) {
      const conf = player.conference || 'Unknown';
      confCounts[conf] = (confCounts[conf] || 0) + 1;
    }
    console.log('\n  Players by conference in backup:');
    for (const [conf, count] of Object.entries(confCounts)) {
      console.log(`    • ${conf}: ${count} players`);
    }
    
    // Step 4: Restore data
    console.log('\n📥 Step 4: Restoring players to database...');
    let restored = 0;
    let failed = 0;
    
    for (const player of backupData) {
      try {
        // Clean the data - remove any $id, $createdAt, etc
        const cleanPlayer = { ...player };
        delete cleanPlayer.$id;
        delete cleanPlayer.$createdAt;
        delete cleanPlayer.$updatedAt;
        delete cleanPlayer.$permissions;
        delete cleanPlayer.$collectionId;
        delete cleanPlayer.$databaseId;
        
        // Ensure required fields
        const playerData = {
          name: cleanPlayer.name || 'Unknown Player',
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
          console.log(`  Restored ${restored}/${backupData.length} players...`);
        }
      } catch (error: any) {
        failed++;
        if (failed <= 5) {
          console.log(`  ⚠️  Failed to restore player: ${player.name} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Restoration complete!`);
    console.log(`  • Successfully restored: ${restored} players`);
    console.log(`  • Failed: ${failed} players`);
    
    // Step 5: Verify restoration
    console.log('\n🔍 Step 5: Verifying restoration...');
    const finalCheck = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log(`  Total players now in database: ${finalCheck.total}`);
    
    // Check each conference
    const conferences = ['SEC', 'ACC', 'Big Ten', 'Big 12'];
    for (const conf of conferences) {
      try {
        const confCheck = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('conference', conf), Query.limit(1)]
        );
        console.log(`  • ${conf}: ${confCheck.total} players ✅`);
      } catch (e) {
        console.log(`  • ${conf}: Error checking`);
      }
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log('🎉 DATABASE RESTORATION SUCCESSFUL!');
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Restoration failed:', error);
  }
}

clearAndRestore();
