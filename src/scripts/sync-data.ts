import * as dotenv from 'dotenv';
import { dataSyncService } from '../utils/sync-data';

dotenv.config();

async function main() {
  console.log('🏈 Starting College Football Fantasy Data Sync\n');

  // Check if Appwrite is configured
  if (!process.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID === 'your_project_id_here') {
    console.error('❌ Appwrite not configured!');
    console.error('Please update your .env file with:');
    console.error('  APPWRITE_PROJECT_ID=your_actual_project_id');
    console.error('  APPWRITE_API_KEY=your_actual_api_key');
    process.exit(1);
  }

  try {
    // Run full sync
    await dataSyncService.syncAll();
    
    console.log('\n📅 Setting up scheduled syncs...');
    dataSyncService.setupScheduledSyncs();
    
    console.log('\n✅ Data sync complete!');
    console.log('The app will continue syncing:');
    console.log('  - Games: Every 5 min on game days');
    console.log('  - Rankings: Tuesdays at 2 PM');
    console.log('  - Full sync: Daily at 3 AM');
    
    // Keep the process running for scheduled syncs
    console.log('\nPress Ctrl+C to stop scheduled syncs');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

main();