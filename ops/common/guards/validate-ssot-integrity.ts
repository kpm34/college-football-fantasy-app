#!/usr/bin/env tsx

/**
 * SSOT Integrity Validation Guard
 * Validates the Single Source of Truth schema structure and exports
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SSOT_PATH = join(process.cwd(), 'schema', 'zod-schema.ts');
const REQUIRED_EXPORTS = [
  'COLLECTIONS',
  'SCHEMA_REGISTRY', 
  'CollegePlayers',
  'Leagues',
  'Rosters',
  'Games',
  'Rankings',
  'Teams'
];

export function validateSSOTIntegrity(): void {
  console.log('🛡️ SSOT Integrity Validation Guard');
  console.log('=====================================\n');

  // 1. Check if SSOT file exists
  if (!existsSync(SSOT_PATH)) {
    console.error('❌ SSOT file not found at:', SSOT_PATH);
    process.exit(1);
  }

  // 2. Read SSOT content
  let ssotContent: string;
  try {
    ssotContent = readFileSync(SSOT_PATH, 'utf-8');
  } catch (error) {
    console.error('❌ Failed to read SSOT file:', error);
    process.exit(1);
  }

  // 3. Validate required exports
  const missingExports: string[] = [];
  for (const exportName of REQUIRED_EXPORTS) {
    if (!ssotContent.includes(`export const ${exportName}`) && 
        !ssotContent.includes(`export { ${exportName}`)) {
      missingExports.push(exportName);
    }
  }

  if (missingExports.length > 0) {
    console.error('❌ Missing required exports from SSOT:', missingExports);
    process.exit(1);
  }

  // 4. Validate COLLECTIONS object structure
  if (!ssotContent.includes('export const COLLECTIONS = {')) {
    console.error('❌ COLLECTIONS object not found in SSOT');
    process.exit(1);
  }

  // 5. Count collections defined in SSOT (COLLECTIONS object only)
  const collectionsBlockMatch = ssotContent.match(/export\s+const\s+COLLECTIONS\s*=\s*\{([\s\S]*?)\}\s*as\s*const;/);
  let ssotCollectionsCount = 0;
  const ssotCollections = new Set<string>();
  if (collectionsBlockMatch) {
    const block = collectionsBlockMatch[1];
    const pairs = block.match(/[A-Z_]+:\s*['"][a-z0-9_]+['"]/gi) || [];
    for (const pair of pairs) {
      const m = pair.match(/([A-Z_]+):\s*['"]([a-z0-9_]+)['"]/i);
      if (m) ssotCollections.add(m[2]);
    }
    ssotCollectionsCount = ssotCollections.size;
  }

  // 6. Count SCHEMA_REGISTRY entries
  const schemaRegistryBlockMatch = ssotContent.match(/export\s+const\s+SCHEMA_REGISTRY\s*=\s*\{([\s\S]*?)\}\s*as\s*const;/);
  let registryCount = 0;
  if (schemaRegistryBlockMatch) {
    const block = schemaRegistryBlockMatch[1];
    const entries = block.match(/\[COLLECTIONS\.[A-Z_]+\]\s*:/g) || [];
    registryCount = entries.length;
  }

  // 7. Optionally read generated collections (for visibility only)
  const generatedPath = join(process.cwd(), 'lib', 'appwrite-generated.ts');
  let generatedCollectionsCount = 0;
  const generatedCollections = new Set<string>();
  if (existsSync(generatedPath)) {
    try {
      const gen = readFileSync(generatedPath, 'utf-8');
      const genBlockMatch = gen.match(/export\s+const\s+COLLECTIONS\s*=\s*\{([\s\S]*?)\}\s*as\s*const;/);
      if (genBlockMatch) {
        const block = genBlockMatch[1];
        const pairs = block.match(/[A-Z_]+:\s*['"][a-z0-9_]+['"]/gi) || [];
        for (const pair of pairs) {
          const m = pair.match(/([A-Z_]+):\s*['"]([a-z0-9_]+)['"]/i);
          if (m) generatedCollections.add(m[2]);
        }
        generatedCollectionsCount = generatedCollections.size;
      }
    } catch {}
  }

  if (ssotCollectionsCount < 10) {
    console.error(`❌ Insufficient collections defined in SSOT (found ${ssotCollectionsCount}, expected at least 10)`);
    process.exit(1);
  }

  // 8. Cross-validate SSOT COLLECTIONS and SCHEMA_REGISTRY sizes
  if (registryCount !== ssotCollectionsCount) {
    console.warn(`⚠️ Registry count (${registryCount}) does not match SSOT COLLECTIONS (${ssotCollectionsCount}).`);
  }

  // 9. Print union visibility (helps reconcile toward expected 42)
  const union = new Set([...ssotCollections, ...generatedCollections]);

  console.log('✅ SSOT Integrity Validation Passed');
  console.log(`📍 Schema location: ${SSOT_PATH}`);
  console.log(`🔍 SSOT COLLECTIONS: ${ssotCollectionsCount}`);
  console.log(`📚 SCHEMA_REGISTRY entries: ${registryCount}`);
  if (generatedCollectionsCount) {
    console.log(`🧩 Generated collections (lib/appwrite-generated): ${generatedCollectionsCount}`);
    console.log(`🧮 Union (SSOT ∪ Generated): ${union.size}`);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSSOTIntegrity();
}