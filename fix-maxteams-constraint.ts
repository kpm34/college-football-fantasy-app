#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';

async function fixMaxTeamsConstraint() {
  try {
    console.log('🔧 Fixing maxTeams constraint to allow smaller leagues...');
    
    // Update the maxTeams attribute to allow 4-20 teams instead of 12-max
    await databases.updateIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      'maxTeams',
      false, // required
      4,     // min value (allow as low as 4 teams)
      20,    // max value (reasonable upper limit)
      null   // default value
    );
    
    console.log('✅ Successfully updated maxTeams constraint to allow 4-20 teams');
    
    // Verify the change
    const attributes = await databases.listAttributes(DATABASE_ID, COLLECTIONS.LEAGUES);
    const maxTeamsAttr = attributes.attributes.find(a => a.key === 'maxTeams');
    console.log('📊 Updated maxTeams attribute:', {
      min: maxTeamsAttr?.min,
      max: maxTeamsAttr?.max,
      required: maxTeamsAttr?.required
    });
    
  } catch (error: any) {
    console.error('❌ Error fixing maxTeams constraint:', error.message);
    console.error('Full error:', error);
  }
}

fixMaxTeamsConstraint().catch(console.error);