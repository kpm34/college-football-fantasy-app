#!/usr/bin/env tsx

/**
 * Compare SSOT schema with live Appwrite database
 */

import { COLLECTIONS, SCHEMA_REGISTRY } from '../schema/zod-schema';
import * as fs from 'fs';
import * as path from 'path';

// Load the live schema we just fetched
const liveSchemaPath = path.join(process.cwd(), 'schema', 'appwrite-live-schema.json');
const liveSchema = JSON.parse(fs.readFileSync(liveSchemaPath, 'utf-8'));

console.log('📊 Comparing SSOT with Live Appwrite Database\n');
console.log('='.repeat(60) + '\n');

// Create maps for easier comparison
const liveCollectionMap = new Map(
  liveSchema.collections.map((c: any) => [c.id, c])
);

const ssotCollections = Object.entries(COLLECTIONS);

console.log('🔍 Collections Comparison:\n');

// Check SSOT collections against live
const missingInLive: string[] = [];
const presentInBoth: string[] = [];

for (const [key, collectionId] of ssotCollections) {
  if (liveCollectionMap.has(collectionId)) {
    presentInBoth.push(`✅ ${collectionId}`);
  } else {
    missingInLive.push(`❌ ${collectionId} (defined in SSOT but not in Appwrite)`);
  }
}

// Check live collections against SSOT
const ssotCollectionIds = new Set(Object.values(COLLECTIONS));
const missingInSSOT: string[] = [];

for (const liveCol of liveSchema.collections) {
  if (!ssotCollectionIds.has(liveCol.id)) {
    missingInSSOT.push(`⚠️  ${liveCol.id} (exists in Appwrite but not in SSOT)`);
  }
}

console.log('Collections in both SSOT and Appwrite:');
presentInBoth.forEach(c => console.log(`  ${c}`));

if (missingInLive.length > 0) {
  console.log('\nCollections missing in Appwrite:');
  missingInLive.forEach(c => console.log(`  ${c}`));
}

if (missingInSSOT.length > 0) {
  console.log('\nCollections missing in SSOT:');
  missingInSSOT.forEach(c => console.log(`  ${c}`));
}

// Special focus on fantasy_teams
console.log('\n' + '='.repeat(60));
console.log('\n🎯 Fantasy Teams Collection Analysis:\n');

const fantasyTeamsLive = liveCollectionMap.get('fantasy_teams');
if (fantasyTeamsLive) {
  console.log('✅ fantasy_teams exists in Appwrite');
  console.log(`  - Attributes: ${fantasyTeamsLive.attributes.length}`);
  console.log(`  - Indexes: ${fantasyTeamsLive.indexes.length}`);
  console.log(`  - Key fields: ${fantasyTeamsLive.attributes.map((a: any) => a.key).slice(0, 5).join(', ')}...`);
  
  // Check if SSOT has schema for it
  const ssotSchema = SCHEMA_REGISTRY[COLLECTIONS.FANTASY_TEAMS as keyof typeof SCHEMA_REGISTRY];
  if (ssotSchema) {
    console.log('✅ SSOT has FantasyTeams schema defined');
  } else {
    console.log('❌ SSOT missing schema definition for FANTASY_TEAMS');
  }
} else {
  console.log('❌ fantasy_teams NOT found in Appwrite');
  console.log('   This needs to be created or renamed from another collection');
}

console.log('\n' + '='.repeat(60));
console.log('\n📝 Summary:');
console.log(`  - SSOT Collections: ${ssotCollections.length}`);
console.log(`  - Live Collections: ${liveSchema.collections.length}`);
console.log(`  - Matched: ${presentInBoth.length}`);
console.log(`  - Missing in Live: ${missingInLive.length}`);
console.log(`  - Missing in SSOT: ${missingInSSOT.length}`);

// Save comparison report
const report = {
  timestamp: new Date().toISOString(),
  ssotCollections: ssotCollections.length,
  liveCollections: liveSchema.collections.length,
  matched: presentInBoth,
  missingInLive,
  missingInSSOT,
  fantasyTeamsStatus: fantasyTeamsLive ? 'exists' : 'missing'
};

const reportPath = path.join(process.cwd(), 'schema', 'schema-comparison-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Report saved to: ${reportPath}`);
