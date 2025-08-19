#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';

async function checkSchemaConstraints() {
  try {
    console.log('🔍 Checking league collection schema constraints...');
    const attributes = await databases.listAttributes(DATABASE_ID, COLLECTIONS.LEAGUES);
    
    console.log('\nLeagues collection attributes:');
    for (const attr of attributes.attributes) {
      console.log(`- ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`);
      if (attr.type === 'integer' && (attr.min !== undefined || attr.max !== undefined)) {
        console.log(`  Range: ${attr.min || 'no min'} to ${attr.max || 'no max'}`);
      }
      if (attr.key === 'maxTeams') {
        console.log(`  ❗ maxTeams constraint: min=${attr.min}, max=${attr.max}`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error checking schema:', error.message);
  }
}

checkSchemaConstraints().catch(console.error);