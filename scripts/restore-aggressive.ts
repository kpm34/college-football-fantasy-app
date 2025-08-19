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

async function restore() {
  console.log('🚀 AGGRESSIVE RESTORATION - Will retry on failures\n');
  
  // Load backup
  const backupPath = path.join(process.cwd(), 'exports/college_players_2025.json');
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  console.log(`Loaded ${backupData.length} players\n`);
  
  let restored = 0;
  let failed = 0;
  
  // Process in small batches with long delays
  const BATCH_SIZE = 5; // Very small batches
  const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches
  const DELAY_ON_RATE_LIMIT = 30000; // 30 seconds on rate limit
  
  for (let i = 0; i < backupData.length; i += BATCH_SIZE) {
    const batch = backupData.slice(i, i + BATCH_SIZE);
    console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(backupData.length/BATCH_SIZE)}`);
    
    for (const player of batch) {
      const cleanPlayer = { ...player };
      delete cleanPlayer.$id;
      delete cleanPlayer.$createdAt;
      delete cleanPlayer.$updatedAt;
      delete cleanPlayer.$permissions;
      delete cleanPlayer.$collectionId;
      delete cleanPlayer.$databaseId;
      
      // Only include fields that exist in the CollegePlayers schema
      const playerData: any = {
        name: cleanPlayer.name || 'Unknown',
        position: cleanPlayer.position || 'RB', // Must be QB, RB, WR, TE, K, or DEF
        team: cleanPlayer.team || cleanPlayer.school || 'Unknown',
        conference: cleanPlayer.conference || 'SEC', // Must be SEC, ACC, Big 12, or Big Ten
        jerseyNumber: cleanPlayer.jersey_number || cleanPlayer.jerseyNumber || undefined, // Optional
        height: cleanPlayer.height || undefined, // Optional string
        weight: cleanPlayer.weight || undefined, // Optional number
        year: cleanPlayer.year || undefined, // Optional: FR, SO, JR, SR
        eligible: true, // Default true
        fantasy_points: cleanPlayer.fantasy_points || 0,
        season_fantasy_points: cleanPlayer.season_fantasy_points || 0,
        depth_chart_order: cleanPlayer.depth_chart_order || undefined,
        external_id: cleanPlayer.cfbd_id || cleanPlayer.external_id || undefined,
        image_url: cleanPlayer.image_url || undefined,
        stats: cleanPlayer.statline_simple_json || cleanPlayer.stats || undefined
      };
      
      // Remove undefined values
      Object.keys(playerData).forEach(key => {
        if (playerData[key] === undefined) {
          delete playerData[key];
        }
      });
      
      let success = false;
      let retries = 0;
      const MAX_RETRIES = 3;
      
      while (!success && retries < MAX_RETRIES) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            playerData
          );
          restored++;
          console.log(`  ✅ ${player.name} (${restored}/${backupData.length})`);
          success = true;
        } catch (error: any) {
          retries++;
          if (error.message?.includes('Rate limit')) {
            console.log(`  ⏳ Rate limit hit, waiting 30s... (retry ${retries}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, DELAY_ON_RATE_LIMIT));
          } else {
            console.log(`  ❌ Failed: ${player.name} - ${error.message}`);
            failed++;
            break; // Don't retry non-rate-limit errors
          }
        }
      }
      
      if (!success) {
        failed++;
      }
      
      // Small delay between documents
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Batch complete. Total restored: ${restored}, Failed: ${failed}`);
    console.log(`Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Restoration complete!`);
  console.log(`  Restored: ${restored} players`);
  console.log(`  Failed: ${failed} players`);
  console.log(`  Success rate: ${(restored/(restored+failed)*100).toFixed(1)}%`);
  
  // Verify
  const final = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
  console.log(`\n📊 Total in database: ${final.total} players`);
}

restore().catch(console.error);
