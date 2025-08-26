#!/usr/bin/env tsx

import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

// Read the CSV
const csvContent = fs.readFileSync('schema/Schema Table.csv', 'utf-8');
const records = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

// Collections that still have snake_case fields
const collectionsToUpdate: Record<string, string[]> = {};

for (const record of records) {
  const collection = record.collection;
  const attributes = record.attributes || '';
  const indexes = record.indexes || '';
  
  // Parse attributes
  const attrList = attributes.split('; ').filter(Boolean);
  const snakeCaseFields: string[] = [];
  
  for (const attr of attrList) {
    const [fieldDef] = attr.split('|');
    const fieldName = fieldDef.split(':')[0];
    
    // Check if field name contains underscore (snake_case)
    if (fieldName && fieldName.includes('_')) {
      snakeCaseFields.push(fieldName);
    }
  }
  
  // Parse indexes for snake_case references
  const indexList = indexes.split('; ').filter(Boolean);
  const snakeCaseIndexFields: string[] = [];
  
  for (const idx of indexList) {
    const match = idx.match(/\[([^\]]+)\]/);
    if (match) {
      const fields = match[1].split('|');
      for (const field of fields) {
        if (field.includes('_')) {
          snakeCaseIndexFields.push(field);
        }
      }
    }
  }
  
  if (snakeCaseFields.length > 0 || snakeCaseIndexFields.length > 0) {
    collectionsToUpdate[collection] = [...new Set([...snakeCaseFields, ...snakeCaseIndexFields])];
  }
}

// Collections that are already fully camelCase
const fullyUpdated: string[] = [];
const partiallyUpdated: Record<string, string[]> = {};
const needsFullUpdate: Record<string, string[]> = {};

for (const record of records) {
  const collection = record.collection;
  const attributes = record.attributes || '';
  
  const attrList = attributes.split('; ').filter(Boolean);
  const hasSnakeCase = attrList.some(attr => {
    const [fieldDef] = attr.split('|');
    const fieldName = fieldDef.split(':')[0];
    return fieldName && fieldName.includes('_');
  });
  
  const hasCamelCase = attrList.some(attr => {
    const [fieldDef] = attr.split('|');
    const fieldName = fieldDef.split(':')[0];
    return fieldName && /[a-z][A-Z]/.test(fieldName);
  });
  
  if (!hasSnakeCase && hasCamelCase) {
    fullyUpdated.push(collection);
  } else if (hasSnakeCase && hasCamelCase) {
    partiallyUpdated[collection] = collectionsToUpdate[collection] || [];
  } else if (hasSnakeCase && !hasCamelCase) {
    needsFullUpdate[collection] = collectionsToUpdate[collection] || [];
  }
}

console.log('📊 APPWRITE SCHEMA UPDATE ANALYSIS\n');
console.log('=' .repeat(60));

console.log('\n✅ FULLY UPDATED TO CAMELCASE (' + fullyUpdated.length + ' collections):');
console.log('-'.repeat(40));
for (const coll of fullyUpdated.sort()) {
  console.log(`  ✓ ${coll}`);
}

console.log('\n⚠️  PARTIALLY UPDATED (' + Object.keys(partiallyUpdated).length + ' collections):');
console.log('-'.repeat(40));
for (const [coll, fields] of Object.entries(partiallyUpdated).sort()) {
  console.log(`  • ${coll}:`);
  console.log(`    Still snake_case: ${fields.join(', ')}`);
}

console.log('\n❌ NEEDS FULL UPDATE (' + Object.keys(needsFullUpdate).length + ' collections):');
console.log('-'.repeat(40));
for (const [coll, fields] of Object.entries(needsFullUpdate).sort()) {
  console.log(`  • ${coll}:`);
  if (fields.length <= 5) {
    console.log(`    Fields: ${fields.join(', ')}`);
  } else {
    console.log(`    Fields (${fields.length} total): ${fields.slice(0, 5).join(', ')}...`);
  }
}

console.log('\n📝 SUMMARY:');
console.log('-'.repeat(40));
console.log(`  Total collections: ${records.length}`);
console.log(`  Fully updated: ${fullyUpdated.length}`);
console.log(`  Partially updated: ${Object.keys(partiallyUpdated).length}`);
console.log(`  Needs full update: ${Object.keys(needsFullUpdate).length}`);

// Specific recommendations
console.log('\n🔧 KEY COLLECTIONS TO UPDATE NEXT:');
console.log('-'.repeat(40));
const priority = ['invites', 'games', 'player_stats', 'projections', 'model_runs', 'model_versions', 'meshy_jobs'];
for (const coll of priority) {
  if (collectionsToUpdate[coll]) {
    console.log(`  ${coll}: ${collectionsToUpdate[coll].slice(0, 3).join(', ')}${collectionsToUpdate[coll].length > 3 ? '...' : ''}`);
  }
}

console.log('\n');
