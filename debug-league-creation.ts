#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';
import { ID } from 'node-appwrite';

async function debugLeagueCreation() {
  try {
    console.log('🔧 Testing league creation manually...');
    
    const testLeague = {
      name: 'Debug Test League',
      maxTeams: 8,
      draftType: 'snake',
      gameMode: 'power4',
      isPublic: true,
      pickTimeSeconds: 90,
      commissioner: '689728660623e03830fc', // Use existing user ID from the database
      status: 'open',
      currentTeams: 0,
      season: 2025,
      scoringRules: JSON.stringify({})
    };
    
    console.log('🎯 Attempting to create league with data:', testLeague);
    
    // Try multiple times with different ID generation strategies
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      let testId: string;
      
      if (attempts === 1) {
        // First attempt: use ID.unique()
        testId = ID.unique();
        console.log(`Attempt ${attempts}: Using ID.unique() - ${testId}`);
      } else {
        // Subsequent attempts: use timestamp + random
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        testId = `${timestamp}_${random}`;
        console.log(`Attempt ${attempts}: Using manual ID - ${testId}`);
      }
      
      try {
        const createdLeague = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          testId,
          testLeague
        );
        
        console.log('✅ Successfully created league:', createdLeague.$id);
        success = true;
        
        // Clean up - delete the test league
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUES, createdLeague.$id);
        console.log('🗑️ Cleaned up test league');
        
      } catch (err: any) {
        console.error(`❌ Attempt ${attempts} failed:`, err.message);
        if (!err.message.includes('already exists') || attempts >= maxAttempts) {
          throw err; // Re-throw if it's not a duplicate ID error or we've exhausted retries
        }
      }
    }
    
    if (!success) {
      console.error('❌ All attempts failed due to ID collisions');
    }
    
  } catch (error: any) {
    console.error('❌ Final error during manual league creation:', error.message);
    console.error('Full error details:', {
      code: error.code,
      type: error.type,
      message: error.message,
      response: error.response
    });
  }
}

debugLeagueCreation().catch(console.error);