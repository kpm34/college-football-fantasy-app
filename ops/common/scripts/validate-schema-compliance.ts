#!/usr/bin/env tsx

/**
 * Schema Compliance Validation Script
 * 
 * This script validates that the entire system follows the single source of truth:
 * - Schema → Types → Repositories → APIs → Frontend
 * 
 * Prevents the architectural drift we experienced with the "players" field issue.
 */

import { validateSystemCompliance, SchemaValidator } from '@domain/validation/schema-enforcer';
import { SCHEMA } from '../schema/schema';
import fs from 'fs';
import path from 'path';

async function validateCompliance() {
  console.log('🔍 Validating Schema Compliance...');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Validate schema definitions
    console.log('\n📋 Validating Schema Definitions...');
    let schemaIssues = 0;
    
    for (const [collectionId, collection] of Object.entries(SCHEMA)) {
      try {
        const schema = SchemaValidator.getSchema(collectionId);
        console.log(`  ✅ ${collection.name} (${collectionId}) - Schema valid`);
      } catch (error: any) {
        console.log(`  ❌ ${collection.name} (${collectionId}) - ${error.message}`);
        schemaIssues++;
      }
    }
    
    // Step 2: Check repository compliance
    console.log('\n🏗️  Validating Repository Compliance...');
    const repositoryPath = path.join(__dirname, '../core/repositories');
    const repoFiles = fs.readdirSync(repositoryPath).filter(f => f.endsWith('.repository.ts'));
    
    let repoIssues = 0;
    for (const repoFile of repoFiles) {
      const repoContent = fs.readFileSync(path.join(repositoryPath, repoFile), 'utf8');
      
      // Check if repository imports schema validator
      if (repoContent.includes('SchemaValidator')) {
        console.log(`  ✅ ${repoFile} - Uses schema validation`);
      } else {
        console.log(`  ⚠️  ${repoFile} - Missing schema validation`);
        repoIssues++;
      }
      
      // Check for known anti-patterns
      if (repoContent.includes('players: []') && !repoContent.includes('JSON.stringify')) {
        console.log(`  ❌ ${repoFile} - Contains invalid players field (should be JSON string)`);
        repoIssues++;
      }
    }
    
    // Step 3: Check API endpoint coverage
    console.log('\n🔌 Validating API Endpoint Coverage...');
    const apiPath = path.join(__dirname, '../app/api');
    
    // Expected endpoints based on data flow
    const expectedEndpoints = [
      'leagues/mine/route.ts',
      'leagues/my-leagues/route.ts', 
      'leagues/search/route.ts',
      'leagues/create/route.ts',
      'players/search/route.ts',
    ];
    
    let apiIssues = 0;
    for (const endpoint of expectedEndpoints) {
      const fullPath = path.join(apiPath, endpoint);
      if (fs.existsSync(fullPath)) {
        console.log(`  ✅ /api/${endpoint.replace('/route.ts', '')} - Exists`);
      } else {
        console.log(`  ❌ /api/${endpoint.replace('/route.ts', '')} - Missing`);
        apiIssues++;
      }
    }
    
    // Step 4: Test sample data validation
    console.log('\n🧪 Testing Sample Data Validation...');
    let validationIssues = 0;
    
    // Test league data
    const sampleLeague = {
      name: 'Test League',
      maxTeams: 12,
      draftType: 'snake',
      gameMode: 'power4',
      isPublic: true,
      pickTimeSeconds: 90,
      commissioner: 'user123',
      status: 'open',
      currentTeams: 0,
      season: 2025,
      scoringRules: JSON.stringify({ passingTd: 6 })
    };
    
    const leagueValidation = SchemaValidator.validate('leagues', sampleLeague);
    if (leagueValidation.success) {
      console.log('  ✅ League validation - Sample data valid');
    } else {
      console.log(`  ❌ League validation - ${leagueValidation.errors?.join(', ')}`);
      validationIssues++;
    }
    
    // Test roster data  
    const sampleRoster = {
      leagueId: 'league123',
      userId: 'user123',
      teamName: 'My Team',
      abbreviation: 'MT',
      draftPosition: 1,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      players: JSON.stringify(['player1', 'player2'])  // Correct JSON string
    };
    
    const rosterValidation = SchemaValidator.validate('user_teams', sampleRoster);
    if (rosterValidation.success) {
      console.log('  ✅ Roster validation - Sample data valid');
    } else {
      console.log(`  ❌ Roster validation - ${rosterValidation.errors?.join(', ')}`);
      validationIssues++;
    }
    
    // Step 5: Summary
    console.log('\n📊 Compliance Report');
    console.log('═'.repeat(60));
    
    const totalIssues = schemaIssues + repoIssues + apiIssues + validationIssues;
    
    console.log(`Schema Issues: ${schemaIssues}`);
    console.log(`Repository Issues: ${repoIssues}`);
    console.log(`API Endpoint Issues: ${apiIssues}`);
    console.log(`Validation Issues: ${validationIssues}`);
    console.log(`Total Issues: ${totalIssues}`);
    
    if (totalIssues === 0) {
      console.log('\n🎉 System is fully compliant with single source of truth!');
      console.log('All repositories enforce schema validation.');
      console.log('All expected API endpoints exist.');
      console.log('All data formats follow canonical schema.');
      process.exit(0);
    } else {
      console.log('\n⚠️  System compliance issues detected.');
      console.log('Please fix the issues above to ensure single source of truth.');
      console.log('\nRecommended actions:');
      console.log('1. Add SchemaValidator imports to repositories missing them');
      console.log('2. Create missing API endpoints');
      console.log('3. Fix data format issues (e.g., JSON.stringify for large string fields)');
      console.log('4. Run this script again after fixes');
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ Compliance validation failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  validateCompliance();
}

export { validateCompliance };