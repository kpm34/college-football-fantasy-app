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

async function restorePlayersFromBackup() {
  console.log('🔄 RESTORING PLAYER DATABASE FROM BACKUP\n');
  console.log('─'.repeat(50));
  
  try {
    // Step 1: Check current state
    console.log('📊 Current database state:');
    const currentData = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log(`  Players currently in database: ${currentData.total}`);
    console.log('  Note: We cannot delete due to permissions, will create new documents');
    
    // Step 2: Load backup data
    console.log('\n📂 Loading backup data...');
    const backupPath = path.join(process.cwd(), 'exports/college_players_2025.json');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found at ${backupPath}`);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    console.log(`  ✅ Loaded ${backupData.length} players from backup`);
    
    // Count by conference for verification
    const confCounts: Record<string, number> = {};
    for (const player of backupData) {
      const conf = player.conference || 'Unknown';
      confCounts[conf] = (confCounts[conf] || 0) + 1;
    }
    console.log('\n  Players by conference in backup:');
    for (const [conf, count] of Object.entries(confCounts).sort()) {
      console.log(`    • ${conf}: ${count} players`);
    }
    
    // Step 3: Restore data
    console.log('\n📥 Restoring players to database...');
    console.log('  This will create new documents for all players');
    let restored = 0;
    let failed = 0;
    const failedPlayers: string[] = [];
    
    for (let i = 0; i < backupData.length; i++) {
      const player = backupData[i];
      
      try {
        // Clean the data - remove any Appwrite metadata
        const cleanPlayer = { ...player };
        delete cleanPlayer.$id;
        delete cleanPlayer.$createdAt;
        delete cleanPlayer.$updatedAt;
        delete cleanPlayer.$permissions;
        delete cleanPlayer.$collectionId;
        delete cleanPlayer.$databaseId;
        
        // Prepare player data with all required fields
        const playerData: any = {
          name: cleanPlayer.name || `Unknown Player ${i}`,
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
        
        // Create document with unique ID
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          playerData
        );
        
        restored++;
        
        // Progress indicator
        if (restored % 100 === 0) {
          process.stdout.write(`\r  Progress: ${restored}/${backupData.length} players restored...`);
        }
        
      } catch (error: any) {
        failed++;
        failedPlayers.push(`${player.name} (${player.team}): ${error.message}`);
        
        // Show first few errors
        if (failed <= 3) {
          console.log(`\n  ⚠️  Failed: ${player.name} - ${error.message}`);
        }
      }
    }
    
    console.log('\n');
    console.log('─'.repeat(50));
    console.log(`✅ Restoration complete!`);
    console.log(`  • Successfully restored: ${restored} players`);
    console.log(`  • Failed: ${failed} players`);
    
    if (failed > 0 && failed <= 10) {
      console.log('\n  Failed players:');
      failedPlayers.forEach(p => console.log(`    - ${p}`));
    }
    
    // Step 4: Verify restoration
    console.log('\n🔍 Verifying restoration...');
    const finalCheck = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log(`  Total players now in database: ${finalCheck.total}`);
    
    // Check each conference
    console.log('\n  Checking Power 4 conferences:');
    const conferences = ['SEC', 'ACC', 'Big Ten', 'Big 12'];
    for (const conf of conferences) {
      try {
        const confCheck = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('conference', conf), Query.limit(1)]
        );
        const status = confCheck.total > 0 ? '✅' : '❌';
        console.log(`    • ${conf}: ${confCheck.total} players ${status}`);
      } catch (e) {
        console.log(`    • ${conf}: Error checking`);
      }
    }
    
    console.log('\n' + '═'.repeat(50));
    if (restored > 2000) {
      console.log('🎉 DATABASE RESTORATION SUCCESSFUL!');
      console.log('   All Power 4 conferences have been restored');
    } else {
      console.log('⚠️  Partial restoration - some players may have failed');
      console.log('   You may need to run this again or check permissions');
    }
    console.log('═'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Restoration failed:', error);
  }
}

restorePlayersFromBackup();
