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

  // 5. Count collections defined
  const collectionMatches = ssotContent.match(/[A-Z_]+:\s*['"][a-z_]+['"]/g);
  const collectionCount = collectionMatches ? collectionMatches.length : 0;

  if (collectionCount < 10) {
    console.error(`❌ Insufficient collections defined in SSOT (found ${collectionCount}, expected at least 10)`);
    process.exit(1);
  }

  console.log('✅ SSOT Integrity Validation Passed');
  console.log(`📍 Schema location: ${SSOT_PATH}`);
  console.log(`🔍 Collections validated: ${collectionCount}`);
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSSOTIntegrity();
}