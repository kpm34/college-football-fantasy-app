#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';
import { ID } from 'node-appwrite';

async function emergencyFixLeagues() {
  try {
    console.log('🚨 Emergency fix for leagues collection issue...');
    
    // First, let's export all existing leagues to backup them
    console.log('1. Backing up existing leagues...');
    const existingLeagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, []);
    console.log(`Found ${existingLeagues.total} leagues to backup`);
    
    if (existingLeagues.total > 0) {
      console.log('Existing leagues:');
      for (const league of existingLeagues.documents) {
        console.log(`- ${league.$id}: "${league.name}" (${league.status})`);
      }
    }
    
    // Try to create a document with a very simple structure first
    console.log('\n2. Testing with minimal document structure...');
    const minimalLeague = {
      name: 'Minimal Test',
      commissioner: '689728660623e03830fc',
      season: 2025
    };
    
    let testSuccess = false;
    for (let i = 0; i < 3; i++) {
      try {
        const testId = `test_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        console.log(`Attempt ${i + 1} with ID: ${testId}`);
        
        const created = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          testId,
          minimalLeague
        );
        
        console.log('✅ Success with minimal structure:', created.$id);
        
        // Clean up immediately
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUES, created.$id);
        console.log('🗑️ Cleaned up test document');
        
        testSuccess = true;
        break;
      } catch (error: any) {
        console.log(`❌ Attempt ${i + 1} failed:`, error.message);
      }
    }
    
    if (!testSuccess) {
      console.log('\n🔧 Attempting to recreate the collection...');
      console.log('⚠️  This is a drastic measure - backing up data first!');
      
      // Save the backup data to a file before attempting anything drastic
      const fs = await import('fs');
      await fs.promises.writeFile(
        'leagues-backup.json',
        JSON.stringify(existingLeagues.documents, null, 2)
      );
      console.log('💾 Backup saved to leagues-backup.json');
      
      console.log('❌ Unable to resolve the issue automatically.');
      console.log('🔧 Manual intervention required in Appwrite Console.');
      console.log('Recommendations:');
      console.log('1. Check Appwrite Console for any stuck/corrupted documents');
      console.log('2. Verify collection permissions and schema');
      console.log('3. Consider deleting and recreating the leagues collection');
      console.log('4. Restore data from leagues-backup.json after recreation');
    }
    
  } catch (error: any) {
    console.error('❌ Emergency fix failed:', error.message);
  }
}

emergencyFixLeagues().catch(console.error);