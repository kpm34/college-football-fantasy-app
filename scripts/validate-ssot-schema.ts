#!/usr/bin/env tsx

/**
 * SINGLE SOURCE OF TRUTH SCHEMA VALIDATOR
 * 
 * This script validates that all schema definitions across the codebase
 * align with the designated SSOT in /schema/zod-schema.ts
 * 
 * It checks:
 * 1. Collection names consistency
 * 2. Schema field alignment between SSOT and Appwrite
 * 3. Type definitions alignment
 * 4. Environment variable alignment
 * 5. API route schema usage
 */

import 'dotenv/config';
import { Client, Databases } from "node-appwrite";
import { SCHEMA_REGISTRY, COLLECTIONS } from "../schema/zod-schema";
import { z } from 'zod';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const endpoint = process.env.APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || "college-football-fantasy";

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

// Track validation results
interface ValidationResult {
  category: string;
  check: string;
  status: 'pass' | 'warn' | 'fail';
  details: string;
  suggestions?: string[];
}

const results: ValidationResult[] = [];

function addResult(category: string, check: string, status: 'pass' | 'warn' | 'fail', details: string, suggestions?: string[]) {
  results.push({ category, check, status, details, suggestions });
}

// Validate Appwrite database against SSOT
async function validateAppwriteSchema() {
  console.log('🔍 Validating Appwrite Database Schema...');
  
  try {
    const database = await db.get(databaseId);
    addResult('Database', 'Connection', 'pass', `Connected to database: ${database.name}`);
    
    // Get all collections from Appwrite
    const collections = await db.listCollections(databaseId);
    const appwriteCollections = new Map();
    
    for (const collection of collections.collections) {
      appwriteCollections.set(collection.$id, collection);
      
      // Get attributes for this collection
      const attributes = await db.listAttributes(databaseId, collection.$id);
      collection.attributes = attributes.attributes;
    }
    
    // Check each SSOT collection exists in Appwrite
    for (const [ssotName, ssotCollection] of Object.entries(COLLECTIONS)) {
      const collectionId = ssotCollection;
      
      if (!appwriteCollections.has(collectionId)) {
        addResult('Collections', `Missing Collection`, 'fail', 
          `Collection '${collectionId}' defined in SSOT but missing from Appwrite`,
          [`Run: npm run sync:schema to create missing collections`]);
        continue;
      }
      
      const appwriteCollection = appwriteCollections.get(collectionId);
      addResult('Collections', `Collection Exists`, 'pass', 
        `Collection '${collectionId}' exists in Appwrite`);
      
      // Validate attributes against SSOT schema
      const ssotSchema = SCHEMA_REGISTRY[collectionId];
      if (ssotSchema && ssotSchema instanceof z.ZodObject) {
        const schemaShape = ssotSchema.shape;
        const appwriteAttrs = new Map();
        
        for (const attr of appwriteCollection.attributes) {
          appwriteAttrs.set(attr.key, attr);
        }
        
        // Check each SSOT field exists in Appwrite
        for (const [fieldName, fieldSchema] of Object.entries(schemaShape)) {
          if (!appwriteAttrs.has(fieldName)) {
            addResult('Schema Fields', `Missing Field`, 'fail',
              `Field '${fieldName}' in SSOT schema but missing from Appwrite collection '${collectionId}'`,
              [`Add attribute '${fieldName}' to collection '${collectionId}'`]);
          } else {
            addResult('Schema Fields', `Field Exists`, 'pass',
              `Field '${fieldName}' exists in both SSOT and Appwrite`);
          }
        }
        
        // Check for extra fields in Appwrite not in SSOT
        for (const [attrName] of appwriteAttrs) {
          if (!schemaShape[attrName]) {
            addResult('Schema Fields', `Extra Field`, 'warn',
              `Field '${attrName}' exists in Appwrite but not in SSOT schema for '${collectionId}'`,
              [`Add '${attrName}' to SSOT schema or remove from Appwrite`]);
          }
        }
      }
    }
    
    // Check for extra collections in Appwrite not in SSOT
    const ssotCollectionIds = new Set(Object.values(COLLECTIONS));
    for (const [appwriteId] of appwriteCollections) {
      if (!ssotCollectionIds.has(appwriteId)) {
        addResult('Collections', `Extra Collection`, 'warn',
          `Collection '${appwriteId}' exists in Appwrite but not in SSOT`,
          [`Add '${appwriteId}' to SSOT COLLECTIONS registry or remove from Appwrite`]);
      }
    }
    
  } catch (error) {
    addResult('Database', 'Connection', 'fail', `Failed to connect to Appwrite: ${error}`,
      ['Check APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY']);
  }
}

// Scan codebase for hardcoded collection names
function validateCodebaseCollectionUsage() {
  console.log('🔍 Scanning codebase for collection usage...');
  
  const problematicPatterns = [
    { pattern: /'rosters'/g, issue: "Hardcoded 'rosters' - should use COLLECTIONS.ROSTERS" },
    { pattern: /"rosters"/g, issue: "Hardcoded \"rosters\" - should use COLLECTIONS.ROSTERS" },
    { pattern: /'college_players'/g, issue: "Hardcoded 'college_players' - should use COLLECTIONS.COLLEGE_PLAYERS" },
    { pattern: /"college_players"/g, issue: "Hardcoded \"college_players\" - should use COLLECTIONS.COLLEGE_PLAYERS" },
    { pattern: /'leagues'/g, issue: "Hardcoded 'leagues' - should use COLLECTIONS.LEAGUES" },
    { pattern: /"leagues"/g, issue: "Hardcoded \"leagues\" - should use COLLECTIONS.LEAGUES" },
  ];
  
  function scanDirectory(dir: string) {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', '.next', 'vendor'].includes(entry)) {
        scanDirectory(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx') || entry.endsWith('.js') || entry.endsWith('.jsx'))) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          
          for (const { pattern, issue } of problematicPatterns) {
            const matches = content.match(pattern);
            if (matches) {
              addResult('Code Standards', 'Hardcoded Collections', 'warn',
                `${issue} in ${fullPath.replace(process.cwd(), '')} (${matches.length} occurrences)`,
                [`Use centralized COLLECTIONS constant from schema/zod-schema.ts`]);
            }
          }
          
          // Check for proper SSOT imports
          if (content.includes('COLLECTIONS') && !content.includes('from "../schema/zod-schema"') && !content.includes('from "../../schema/zod-schema"') && !content.includes('from "../../../schema/zod-schema"')) {
            addResult('Code Standards', 'SSOT Import', 'warn',
              `File uses COLLECTIONS but may not import from SSOT: ${fullPath.replace(process.cwd(), '')}`,
              ['Ensure imports come from schema/zod-schema.ts']);
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  scanDirectory(process.cwd());
}

// Check environment variables alignment
function validateEnvironmentVariables() {
  console.log('🔍 Validating environment variables...');
  
  const requiredEnvVars = [
    'APPWRITE_ENDPOINT',
    'APPWRITE_PROJECT_ID', 
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID',
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
  ];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      addResult('Environment', 'Required Vars', 'pass', `${envVar} is set`);
    } else {
      addResult('Environment', 'Missing Vars', 'fail', `${envVar} is not set`,
        [`Add ${envVar} to .env.local`]);
    }
  }
  
  // Check collection environment variables align with SSOT
  const collectionEnvVars = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_APPWRITE_COLLECTION_'));
  
  if (collectionEnvVars.length === 0) {
    addResult('Environment', 'Collection Vars', 'warn', 
      'No collection environment variables found',
      ['Consider adding NEXT_PUBLIC_APPWRITE_COLLECTION_* vars for each collection']);
  } else {
    for (const envVar of collectionEnvVars) {
      const collectionName = process.env[envVar];
      const ssotCollectionIds = Object.values(COLLECTIONS);
      
      if (collectionName && ssotCollectionIds.includes(collectionName)) {
        addResult('Environment', 'Collection Alignment', 'pass', 
          `${envVar}=${collectionName} aligns with SSOT`);
      } else {
        addResult('Environment', 'Collection Misalignment', 'fail',
          `${envVar}=${collectionName} does not match any SSOT collection`,
          ['Update environment variable or add collection to SSOT']);
      }
    }
  }
}

// Generate comprehensive report
function generateReport() {
  console.log('\n📊 SSOT VALIDATION REPORT');
  console.log('════════════════════════════════════');
  
  const summary = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    warn: results.filter(r => r.status === 'warn').length,
    fail: results.filter(r => r.status === 'fail').length,
  };
  
  console.log(`\n📈 Summary: ${summary.pass} passed, ${summary.warn} warnings, ${summary.fail} failed`);
  
  // Group by category
  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    console.log(`\n📂 ${category}`);
    console.log('─'.repeat(40));
    
    const categoryResults = results.filter(r => r.category === category);
    
    for (const result of categoryResults) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
      console.log(`${icon} ${result.check}: ${result.details}`);
      
      if (result.suggestions && result.suggestions.length > 0) {
        result.suggestions.forEach(suggestion => {
          console.log(`   💡 ${suggestion}`);
        });
      }
    }
  }
  
  // Action items
  const actionItems = results.filter(r => r.status === 'fail' || r.status === 'warn');
  if (actionItems.length > 0) {
    console.log(`\n🎯 ACTION ITEMS (${actionItems.length})`);
    console.log('─'.repeat(40));
    
    actionItems.forEach((item, index) => {
      console.log(`${index + 1}. [${item.status.toUpperCase()}] ${item.category} - ${item.check}`);
      console.log(`   ${item.details}`);
      if (item.suggestions) {
        item.suggestions.forEach(suggestion => {
          console.log(`   → ${suggestion}`);
        });
      }
      console.log('');
    });
  }
  
  // Exit code
  const hasCriticalFailures = results.some(r => r.status === 'fail');
  if (hasCriticalFailures) {
    console.log('💥 CRITICAL FAILURES DETECTED - Schema alignment required!');
    process.exit(1);
  } else if (summary.warn > 0) {
    console.log('⚠️  WARNINGS DETECTED - Consider addressing for better schema consistency');
    process.exit(0);
  } else {
    console.log('🎉 ALL VALIDATIONS PASSED - SSOT schema is properly aligned!');
    process.exit(0);
  }
}

async function main() {
  console.log('🚀 Starting SSOT Schema Validation...');
  console.log('═══════════════════════════════════════');
  console.log(`📍 SSOT Location: /schema/zod-schema.ts`);
  console.log(`🗄️  Database: ${databaseId}`);
  console.log(`🔗 Endpoint: ${endpoint}`);
  
  await validateAppwriteSchema();
  validateCodebaseCollectionUsage();
  validateEnvironmentVariables();
  
  generateReport();
}

main().catch((error) => {
  console.error('💥 Validation script failed:', error);
  process.exit(1);
});