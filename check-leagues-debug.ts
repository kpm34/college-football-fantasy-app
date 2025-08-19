#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';

async function checkLeagues() {
  try {
    console.log('🔍 Checking existing leagues...');
    const leagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, []);
    
    console.log(`Found ${leagues.total} leagues:`);
    for (const league of leagues.documents) {
      console.log(`- ID: ${league.$id}, Name: "${league.name}", Status: ${league.status}, Commissioner: ${league.commissioner}`);
    }
    
    // Also check for any problematic IDs that might be causing collisions
    const problemLeagues = leagues.documents.filter(l => 
      !l.$id || l.$id === 'unique()' || l.$id.startsWith('ID.unique')
    );
    
    if (problemLeagues.length > 0) {
      console.log('\n❌ Found problematic league IDs:');
      problemLeagues.forEach(l => console.log(`  - ${l.$id}: "${l.name}"`));
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching leagues:', error.message);
    console.error('Full error:', error);
  }
}

checkLeagues().catch(console.error);