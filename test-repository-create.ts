#!/usr/bin/env tsx

import { LeagueRepository } from './core/repositories/league.repository.js';

async function testRepositoryCreate() {
  try {
    console.log('🔧 Testing league creation through repository layer...');
    
    const leagueRepo = new LeagueRepository(true); // server-side
    
    const testLeagueData = {
      name: 'Repository Test League',
      maxTeams: 8,
      draftType: 'snake' as const,
      gameMode: 'power4' as const,
      isPublic: true,
      pickTimeSeconds: 90,
      commissionerId: '689728660623e03830fc',
      season: 2025
    };
    
    console.log('🎯 Creating league through repository:', testLeagueData);
    
    const createdLeague = await leagueRepo.createLeague(testLeagueData);
    console.log('✅ Successfully created league through repository:', createdLeague.$id);
    
    // Clean up - try to delete it
    try {
      // Use the raw database connection to delete since we don't have a delete method in repo
      const { serverDatabases: databases, DATABASE_ID, COLLECTIONS } = await import('./lib/appwrite-server.js');
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUES, createdLeague.$id);
      console.log('🗑️ Cleaned up test league');
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test league:', cleanupError);
    }
    
  } catch (error: any) {
    console.error('❌ Repository creation error:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Full error:', error);
  }
}

testRepositoryCreate().catch(console.error);