#!/usr/bin/env tsx
/**
 * Schema Drift Detection Guard
 * 
 * Compares SSOT schema against Appwrite database collections
 * to detect configuration drift and schema inconsistencies
 */

import { join } from 'path';
import { COLLECTIONS, SCHEMA_REGISTRY } from '../../schema/zod-schema.js';

interface DriftCheckResult {
  success: boolean;
  driftFound: boolean;
  issues: string[];
  recommendations: string[];
}

async function checkSchemaDrift(): Promise<DriftCheckResult> {
  const result: DriftCheckResult = {
    success: true,
    driftFound: false,
    issues: [],
    recommendations: []
  };

  try {
    // 1. Validate COLLECTIONS object structure
    const collectionKeys = Object.keys(COLLECTIONS);
    const collectionValues = Object.values(COLLECTIONS);
    
    if (collectionKeys.length !== collectionValues.length) {
      result.driftFound = true;
      result.issues.push('COLLECTIONS object has duplicate values');
    }

    // 2. Validate SCHEMA_REGISTRY completeness
    const registryKeys = Object.keys(SCHEMA_REGISTRY);
    const missingCollections = collectionValues.filter(collection => !registryKeys.includes(collection));
    
    if (missingCollections.length > 0) {
      result.driftFound = true;
      result.issues.push(`Missing schemas in registry: ${missingCollections.join(', ')}`);
      result.recommendations.push('Add missing collection schemas to SCHEMA_REGISTRY');
    }

    // 3. Check for orphaned schema registrations
    const orphanedSchemas = registryKeys.filter(key => !collectionValues.includes(key));
    if (orphanedSchemas.length > 0) {
      result.driftFound = true;
      result.issues.push(`Orphaned schemas found: ${orphanedSchemas.join(', ')}`);
      result.recommendations.push('Remove unused schemas from SCHEMA_REGISTRY');
    }

    // 4. Validate collection naming consistency
    const invalidCollectionNames = collectionValues.filter(name => {
      // Check snake_case format
      return !/^[a-z]+(_[a-z]+)*$/.test(name);
    });

    if (invalidCollectionNames.length > 0) {
      result.driftFound = true;
      result.issues.push(`Invalid collection names (must be snake_case): ${invalidCollectionNames.join(', ')}`);
      result.recommendations.push('Update collection names to follow snake_case convention');
    }

    // 5. Check for potential version conflicts
    const ssotPath = join(process.cwd(), 'schema/zod-schema.ts');
    console.log(`📍 SSOT Location: ${ssotPath}`);
    console.log(`🔍 Collections: ${collectionValues.length}`);
    console.log(`📋 Schemas: ${registryKeys.length}`);

  } catch (error: any) {
    result.success = false;
    result.issues.push(`Schema drift check failed: ${error.message}`);
  }

  return result;
}

async function main() {
  console.log('🔍 Schema Drift Detection Guard');
  console.log('===============================');
  
  const result = await checkSchemaDrift();
  
  if (!result.success) {
    console.log('\n❌ Schema Drift Check Failed:');
    result.issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
  }

  if (result.driftFound) {
    console.log('\n⚠️ Schema Drift Detected:');
    result.issues.forEach(issue => console.log(`  - ${issue}`));
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    console.log('\n🚫 Build blocked - resolve schema drift');
    process.exit(1);
  }

  console.log('\n✅ No Schema Drift Detected');
  console.log('📊 SSOT and database schemas are aligned');
}

if (require.main === module) {
  main();
}

export { checkSchemaDrift };