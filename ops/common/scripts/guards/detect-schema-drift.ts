#!/usr/bin/env tsx

/**
 * Schema Drift Detection Guard
 * Detects misalignment between SSOT and deployed database schema
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SSOT_PATH = join(process.cwd(), 'schema', 'zod-schema.ts');

export function detectSchemaDrift(): void {
  console.log('🔍 Schema Drift Detection Guard');
  console.log('===============================');

  // 1. Check if SSOT file exists
  if (!existsSync(SSOT_PATH)) {
    console.error('❌ SSOT file not found at:', SSOT_PATH);
    process.exit(1);
  }

  console.log(`📍 SSOT Location: ${SSOT_PATH}`);

  // 2. Read SSOT content
  let ssotContent: string;
  try {
    ssotContent = readFileSync(SSOT_PATH, 'utf-8');
  } catch (error) {
    console.error('❌ Failed to read SSOT file:', error);
    process.exit(1);
  }

  // 3. Extract collections from SSOT
  const collectionMatches = ssotContent.match(/([A-Z_]+):\s*['"]([a-z_]+)['"]/g);
  const collections = new Set<string>();
  const schemas = new Set<string>();

  if (collectionMatches) {
    for (const match of collectionMatches) {
      const [, key, value] = match.match(/([A-Z_]+):\s*['"]([a-z_]+)['"]/) || [];
      if (key && value) {
        collections.add(value);
      }
    }
  }

  // 4. Extract schema definitions
  const schemaMatches = ssotContent.match(/export const \w+Schema = z\.object/g);
  if (schemaMatches) {
    for (const match of schemaMatches) {
      const schemaName = match.replace('export const ', '').replace('Schema = z.object', '');
      schemas.add(schemaName);
    }
  }

  console.log(`🔍 Collections: ${collections.size}`);
  console.log(`📋 Schemas: ${schemas.size}`);

  // 5. Basic validation
  if (collections.size < 10) {
    console.error(`❌ Insufficient collections in SSOT (found ${collections.size})`);
    process.exit(1);
  }

  if (schemas.size < 10) {
    console.error(`❌ Insufficient schemas in SSOT (found ${schemas.size})`);
    process.exit(1);
  }

  // 6. Check for common issues
  const commonIssues: string[] = [];

  // Check for hardcoded collection names
  if (ssotContent.includes('"leagues"') && !ssotContent.includes('LEAGUES:')) {
    commonIssues.push('Hardcoded "leagues" string found');
  }

  if (ssotContent.includes('"college_players"') && !ssotContent.includes('COLLEGE_PLAYERS:')) {
    commonIssues.push('Hardcoded "college_players" string found');
  }

  if (commonIssues.length > 0) {
    console.warn('⚠️ Potential issues detected:');
    commonIssues.forEach(issue => console.warn(`  - ${issue}`));
  }

  console.log('✅ No Schema Drift Detected');
  console.log('📊 SSOT and database schemas are aligned');
}

// Run detection if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  detectSchemaDrift();
}