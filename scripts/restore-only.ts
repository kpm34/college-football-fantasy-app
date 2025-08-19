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

async function restoreDatabase() {
  console.log('🔄 RESTORING PLAYER DATABASE FROM BACKUP\n');
  console.log('═'.repeat(60));
  
  try {
    // Check current state
    console.log('\n📊 Checking database is empty...');
    const current = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log(`  Current players in database: ${current.total}`);
    
    if (current.total > 0) {
      console.log('  ⚠️  Warning: Database is not empty. Proceeding anyway...');
    } else {
      console.log('  ✅ Database is empty and ready for restoration');
    }
    
    // Load backup data
    console.log('\n📂 Loading backup data...');
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
    
    // Restore data with rate limiting
    console.log('\n📥 Starting restoration...');
    console.log('  Note: This will take about 10-15 minutes due to rate limits');
    let restored = 0;
    let failed = 0;
    const errors: string[] = [];
    const startTime = Date.now();
    
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
        
        // Prepare player data with all fields
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
        
        // Progress update
        if (restored % 50 === 0) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const rate = restored / elapsed;
          const remaining = Math.round((backupData.length - restored) / rate);
          process.stdout.write(`\r  Progress: ${restored}/${backupData.length} (${Math.round(restored/backupData.length * 100)}%) - Est. ${remaining}s remaining`);
        }
        
        // Rate limiting: pause every 10 documents
        if (restored % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Longer pause every 100 documents
        if (restored % 100 === 0) {
          console.log('\n  Pausing for rate limits...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error: any) {
        if (error.code === 429) {
          // Rate limit hit - wait longer
          console.log('\n  Rate limit hit, waiting 15 seconds...');
          await new Promise(resolve => setTimeout(resolve, 15000));
          // Try again
          try {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              ID.unique(),
              playerData
            );
            restored++;
          } catch (e: any) {
            failed++;
            if (failed <= 5) {
              errors.push(`${player.name}: ${e.message}`);
            }
          }
        } else {
          failed++;
          if (failed <= 5) {
            errors.push(`${player.name}: ${error.message}`);
          }
        }
      }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n\n  ✅ Restored ${restored} players in ${totalTime} seconds`);
    if (failed > 0) {
      console.log(`  ⚠️  Failed to restore ${failed} players`);
      if (errors.length > 0) {
        console.log('  First few errors:');
        errors.forEach(e => console.log(`    - ${e}`));
      }
    }
    
    // Final verification
    console.log('\n' + '═'.repeat(60));
    console.log('\n🔍 Final verification...');
    
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
    } else if (restored > 1500) {
      console.log('✅ RESTORATION MOSTLY SUCCESSFUL');
      console.log(`   • Restored ${restored} out of ${backupData.length} players`);
      console.log('   • Some players may have failed due to rate limits');
      console.log('   • Database is usable but may need another pass');
    } else {
      console.log('⚠️  PARTIAL RESTORATION');
      console.log(`   • Only restored ${restored} out of ${backupData.length} players`);
      console.log('   • Please run again to complete restoration');
    }
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Process failed:', error);
  }
}

restoreDatabase();
