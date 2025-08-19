#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';
import { ID } from 'node-appwrite';

async function testOtherCollections() {
  try {
    console.log('🔧 Testing document creation in other collections...');
    
    // Test creating in activity_log collection (should be simpler)
    const activityLogId = ID.unique();
    console.log(`Testing activity_log with ID: ${activityLogId}`);
    
    const activityLog = {
      userId: '689728660623e03830fc',
      action: 'test_action',
      details: 'Testing document creation',
      timestamp: new Date().toISOString()
    };
    
    const createdLog = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACTIVITY_LOG,
      activityLogId,
      activityLog
    );
    
    console.log('✅ Successfully created activity log:', createdLog.$id);
    
    // Clean up
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ACTIVITY_LOG, createdLog.$id);
    console.log('🗑️ Cleaned up activity log');
    
    // Now let's also check if there are actually hidden documents in the leagues collection
    console.log('\n🔍 Checking if there are any documents we can delete...');
    const allLeagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, []);
    console.log(`Found ${allLeagues.total} leagues visible in normal query`);
    
    // Let's also try querying with different parameters
    console.log('Trying raw list without any filters...');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', {
      code: error.code,
      type: error.type,
      message: error.message
    });
  }
}

testOtherCollections().catch(console.error);