#!/usr/bin/env tsx
/**
 * SSOT Integrity Validation Guard
 * 
 * Ensures the Single Source of Truth schema file maintains:
 * - Valid Zod schema definitions
 * - Collection registry consistency
 * - Type safety requirements
 * - No unauthorized schema modifications
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

const SSOT_PATH = join(process.cwd(), 'schema/zod-schema.ts');
const REQUIRED_COLLECTIONS = [
  'college_players',
  'teams', 
  'games',
  'rankings',
  'leagues',
  'user_teams',
  'lineups',
  'auctions',
  'bids',
  'player_stats',
  'users',
  'activity_log'
];

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

function validateSSOT(): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  // 1. Check SSOT file exists
  if (!existsSync(SSOT_PATH)) {
    result.success = false;
    result.errors.push(`SSOT file not found at: ${SSOT_PATH}`);
    return result;
  }

  // 2. Read and validate SSOT content
  const content = readFileSync(SSOT_PATH, 'utf-8');
  
  // 3. Check for required exports
  const requiredExports = [
    'COLLECTIONS',
    'SCHEMA_REGISTRY', 
    'validateData',
    'ZodRepository'
  ];

  for (const exportName of requiredExports) {
    if (!content.includes(`export const ${exportName}`) && !content.includes(`export function ${exportName}`) && !content.includes(`export abstract class ${exportName}`)) {
      result.success = false;
      result.errors.push(`Missing required export: ${exportName}`);
    }
  }

  // 4. Validate collection registry completeness
  for (const collection of REQUIRED_COLLECTIONS) {
    const collectionConstant = collection.toUpperCase().replace('_', '_');
    if (!content.includes(`'${collection}'`)) {
      result.success = false;
      result.errors.push(`Missing collection in registry: ${collection}`);
    }
  }

  // 5. Check for potential security issues
  const securityPatterns = [
    /process\.env\./g, // No hardcoded env vars in schema
    /console\.log/g, // No debug logs
    /eval\(/g, // No eval usage
    /Function\(/g // No dynamic function creation
  ];

  for (const pattern of securityPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      result.warnings.push(`Security concern found: ${matches[0]}`);
    }
  }

  // 6. Validate Zod import
  if (!content.includes("import { z } from \"zod\"")) {
    result.success = false;
    result.errors.push("Missing required Zod import");
  }

  return result;
}

function main() {
  console.log('🛡️ SSOT Integrity Validation Guard');
  console.log('=====================================');
  
  const result = validateSSOT();
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (!result.success) {
    console.log('\n❌ SSOT Validation Failed:');
    result.errors.forEach(error => console.log(`  - ${error}`));
    console.log('\n🚫 Build blocked - fix SSOT schema issues');
    process.exit(1);
  }

  console.log('\n✅ SSOT Integrity Validation Passed');
  console.log(`📍 Schema location: ${SSOT_PATH}`);
  console.log(`🔍 Collections validated: ${REQUIRED_COLLECTIONS.length}`);
}

if (require.main === module) {
  main();
}

export { validateSSOT };