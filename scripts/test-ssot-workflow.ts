#!/usr/bin/env tsx
/**
 * End-to-End SSOT Workflow Test
 * 
 * Comprehensive test of the Single Source of Truth implementation
 * Validates all components working together correctly
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { COLLECTIONS, SCHEMA_REGISTRY, validateData } from '../schema/zod-schema.js';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration: number;
}

interface WorkflowTestResults {
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

async function runTest(name: string, testFn: () => Promise<void> | void): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    await testFn();
    return {
      name,
      success: true,
      message: 'Passed',
      duration: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      name,
      success: false,
      message: error.message,
      duration: Date.now() - startTime
    };
  }
}

function executeCommand(command: string): string {
  return execSync(command, { encoding: 'utf-8', cwd: process.cwd() });
}

async function testSSOTWorkflow(): Promise<WorkflowTestResults> {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: SSOT Schema File Exists and Valid
  tests.push(await runTest('SSOT Schema File Validation', () => {
    const ssotPath = join(process.cwd(), 'schema/zod-schema.ts');
    if (!existsSync(ssotPath)) {
      throw new Error('SSOT schema file not found');
    }
    
    const content = readFileSync(ssotPath, 'utf-8');
    if (!content.includes('COLLECTIONS')) {
      throw new Error('COLLECTIONS export not found');
    }
    if (!content.includes('SCHEMA_REGISTRY')) {
      throw new Error('SCHEMA_REGISTRY export not found');
    }
    if (!content.includes('validateData')) {
      throw new Error('validateData function not found');
    }
  }));

  // Test 2: Build Guards Execute Successfully
  tests.push(await runTest('Build Guards Execution', () => {
    executeCommand('npm run validate:ssot');
    executeCommand('npm run detect:drift');
  }));

  // Test 3: Schema Documentation Generation
  tests.push(await runTest('Schema Documentation Generation', () => {
    executeCommand('npm run generate:docs');
    const docsPath = join(process.cwd(), 'docs/SCHEMA_DOCUMENTATION.md');
    if (!existsSync(docsPath)) {
      throw new Error('Schema documentation not generated');
    }
    
    const content = readFileSync(docsPath, 'utf-8');
    if (!content.includes('Generated from SSOT')) {
      throw new Error('Invalid documentation format');
    }
  }));

  // Test 4: Collections Registry Integrity
  tests.push(await runTest('Collections Registry Integrity', () => {
    const collectionCount = Object.keys(COLLECTIONS).length;
    const registryCount = Object.keys(SCHEMA_REGISTRY).length;
    
    if (collectionCount === 0) {
      throw new Error('No collections defined');
    }
    
    // Check that all collections have schemas (allowing for extra schemas)
    const collectionValues = Object.values(COLLECTIONS);
    const missingSchemas = collectionValues.filter(
      collection => !Object.keys(SCHEMA_REGISTRY).includes(collection)
    );
    
    if (missingSchemas.length > 0) {
      throw new Error(`Missing schemas for collections: ${missingSchemas.join(', ')}`);
    }
  }));

  // Test 5: Runtime Validation Functions
  tests.push(await runTest('Runtime Validation Functions', () => {
    // Test valid data
    const validLeague = {
      name: 'Test League',
      commissioner: 'user123',
      season: 2025,
      maxTeams: 10,
      draftType: 'snake',
      gameMode: 'power4',
      status: 'open',
      isPublic: true,
      pickTimeSeconds: 90
    };
    
    const result = validateData(COLLECTIONS.LEAGUES, validLeague);
    if (!result.success) {
      throw new Error(`Valid data validation failed: ${result.errors?.join(', ')}`);
    }
    
    // Test invalid data
    const invalidLeague = {
      name: '', // Too short
      maxTeams: 'invalid', // Wrong type
    };
    
    const invalidResult = validateData(COLLECTIONS.LEAGUES, invalidLeague);
    if (invalidResult.success) {
      throw new Error('Invalid data validation should have failed');
    }
  }));

  // Test 6: TypeScript Type Generation
  tests.push(await runTest('TypeScript Type Inference', () => {
    // Check that types are properly inferred from schemas
    const typesContent = readFileSync(join(process.cwd(), 'schema/zod-schema.ts'), 'utf-8');
    
    const expectedTypes = [
      'type CollegePlayer',
      'type League',
      'type Team',
      'type Game'
    ];
    
    expectedTypes.forEach(expectedType => {
      if (!typesContent.includes(expectedType)) {
        throw new Error(`Missing type export: ${expectedType}`);
      }
    });
  }));

  // Test 7: Collection Name Consistency
  tests.push(await runTest('Collection Name Consistency', () => {
    const collectionNames = Object.values(COLLECTIONS);
    const invalidNames = collectionNames.filter(name => {
      // Check snake_case format
      return !/^[a-z]+(_[a-z]+)*$/.test(name);
    });
    
    if (invalidNames.length > 0) {
      throw new Error(`Invalid collection names (must be snake_case): ${invalidNames.join(', ')}`);
    }
  }));

  // Test 8: Project Structure Validation
  tests.push(await runTest('Project Structure Validation', () => {
    const requiredFiles = [
      'PROJECT_MAP.md',
      'schema/zod-schema.ts',
      'lib/appwrite.ts',
      'lib/appwrite-server.ts',
      'scripts/guards/validate-ssot-integrity.ts',
      'scripts/guards/detect-schema-drift.ts',
      'scripts/generate-schema-docs.ts'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !existsSync(join(process.cwd(), file))
    );
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
  }));

  // Test 9: Package.json Scripts Validation
  tests.push(await runTest('Package.json Scripts Validation', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const requiredScripts = [
      'validate:ssot',
      'detect:drift',
      'generate:docs',
      'guard:all',
      'schema:sync-from-ssot'
    ];
    
    const missingScripts = requiredScripts.filter(script => 
      !packageJson.scripts[script]
    );
    
    if (missingScripts.length > 0) {
      throw new Error(`Missing package.json scripts: ${missingScripts.join(', ')}`);
    }
  }));

  // Test 10: End-to-End Workflow Integration
  tests.push(await runTest('End-to-End Workflow Integration', () => {
    // Simulate full workflow: guards + docs generation
    executeCommand('npm run guard:all');
    executeCommand('npm run generate:docs');
    
    // Verify all outputs exist and are valid
    const outputs = [
      'docs/SCHEMA_DOCUMENTATION.md'
    ];
    
    outputs.forEach(output => {
      if (!existsSync(join(process.cwd(), output))) {
        throw new Error(`Workflow output missing: ${output}`);
      }
    });
  }));

  const endTime = Date.now();
  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;

  return {
    tests,
    summary: {
      total: tests.length,
      passed,
      failed,
      duration: endTime - startTime
    }
  };
}

async function main() {
  console.log('🧪 End-to-End SSOT Workflow Test');
  console.log('==================================');
  console.log();

  const results = await testSSOTWorkflow();

  // Display individual test results
  console.log('📋 Test Results:');
  console.log('================');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    const duration = `${test.duration}ms`;
    console.log(`${status} ${index + 1}. ${test.name} (${duration})`);
    if (!test.success) {
      console.log(`   Error: ${test.message}`);
    }
  });

  // Display summary
  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Duration: ${results.summary.duration}ms`);
  console.log(`Success Rate: ${Math.round((results.summary.passed / results.summary.total) * 100)}%`);

  if (results.summary.failed > 0) {
    console.log('\n🚫 SSOT Workflow Test Failed');
    console.log('Some components are not working correctly');
    process.exit(1);
  } else {
    console.log('\n🎉 SSOT Workflow Test Passed');
    console.log('All components are working correctly!');
    console.log('\n🎯 Single Source of Truth Implementation Complete:');
    console.log('  ✅ Schema definitions consolidated');
    console.log('  ✅ Build guards active');
    console.log('  ✅ Documentation generation working');
    console.log('  ✅ Runtime validation functional');
    console.log('  ✅ Type safety enforced');
    console.log('  ✅ CI/CD integration ready');
  }
}

if (require.main === module) {
  main();
}

export { testSSOTWorkflow };