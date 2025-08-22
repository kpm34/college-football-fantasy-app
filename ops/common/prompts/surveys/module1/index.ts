#!/usr/bin/env tsx

/**
 * Module 1 - Projections Collections Audit
 * Audits Appwrite collections and repo for projections infrastructure
 */

import fs from 'fs';
import path from 'path';
import { findFiles, FilePatterns, ProjectFileSearcher } from '../../../lib/utils/glob-helpers';

interface ProjectionsCollectionsReport {
  collections: {
    yearly_projections: { exists: boolean; fields_missing: string[]; indexes_missing: string[] };
    weekly_projections: { exists: boolean; fields_missing: string[]; indexes_missing: string[] };
  };
  repo: {
    endpoints: string[];
    tests_present: boolean;
  };
  status: 'ok' | 'incomplete' | 'missing';
  notes: string[];
}

const REQUIRED_FIELDS = {
  yearly: ['player_id', 'season', 'team', 'position', 'projection_type', 'stats', 'model_version', 'updated_at'],
  weekly: ['player_id', 'season', 'week', 'team', 'position', 'projection_type', 'stats', 'model_version', 'updated_at']
};

const REQUIRED_INDEXES = {
  yearly: [['season', 'player_id'], ['team', 'position']],
  weekly: [['season', 'week', 'player_id'], ['team', 'position', 'week']]
};

async function auditAppwriteCollections() {
  // Use the health API endpoint to check collections
  try {
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    
    // Check appwrite-schema.json for detailed collection info
    const schemaPath = path.join(process.cwd(), 'appwrite-schema.json');
    let schemaData: any = null;
    
    if (fs.existsSync(schemaPath)) {
      schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    }
    
    const result: ProjectionsCollectionsReport['collections'] = {
      yearly_projections: { exists: false, fields_missing: [], indexes_missing: [] },
      weekly_projections: { exists: false, fields_missing: [], indexes_missing: [] }
    };
    
    // Check for collections in schema
    if (schemaData && schemaData.collections) {
      const yearlyCollection = schemaData.collections.find((c: any) => 
        c.$id === 'projections_yearly' || c.name === 'projections_yearly'
      );
      
      const weeklyCollection = schemaData.collections.find((c: any) => 
        c.$id === 'projections_weekly' || c.name === 'projections_weekly'
      );
      
      // Audit yearly projections
      if (yearlyCollection) {
        result.yearly_projections.exists = true;
        const existingFields = yearlyCollection.attributes?.map((a: any) => a.key) || [];
        const existingIndexes = yearlyCollection.indexes?.map((i: any) => i.attributes) || [];
        
        result.yearly_projections.fields_missing = REQUIRED_FIELDS.yearly.filter(f => !existingFields.includes(f));
        result.yearly_projections.indexes_missing = REQUIRED_INDEXES.yearly
          .filter(reqIndex => !existingIndexes.some((existing: string[]) => 
            reqIndex.every(attr => existing.includes(attr))
          ))
          .map(idx => idx.join(', '));
      } else {
        result.yearly_projections.fields_missing = REQUIRED_FIELDS.yearly;
        result.yearly_projections.indexes_missing = REQUIRED_INDEXES.yearly.map(idx => idx.join(', '));
      }
      
      // Audit weekly projections
      if (weeklyCollection) {
        result.weekly_projections.exists = true;
        const existingFields = weeklyCollection.attributes?.map((a: any) => a.key) || [];
        const existingIndexes = weeklyCollection.indexes?.map((i: any) => i.attributes) || [];
        
        result.weekly_projections.fields_missing = REQUIRED_FIELDS.weekly.filter(f => !existingFields.includes(f));
        result.weekly_projections.indexes_missing = REQUIRED_INDEXES.weekly
          .filter(reqIndex => !existingIndexes.some((existing: string[]) => 
            reqIndex.every(attr => existing.includes(attr))
          ))
          .map(idx => idx.join(', '));
      } else {
        result.weekly_projections.fields_missing = REQUIRED_FIELDS.weekly;
        result.weekly_projections.indexes_missing = REQUIRED_INDEXES.weekly.map(idx => idx.join(', '));
      }
    } else {
      // Fallback to health endpoint info if schema not found
      console.warn('⚠️ appwrite-schema.json not found, using health endpoint data');
      
      // Check if collections are mentioned in the health response
      if (healthData?.services?.appwrite?.collections) {
        const collections = Object.keys(healthData.services.appwrite.collections);
        
        if (!collections.includes('projections_yearly') && !collections.includes('yearly_projections')) {
          result.yearly_projections.fields_missing = REQUIRED_FIELDS.yearly;
          result.yearly_projections.indexes_missing = REQUIRED_INDEXES.yearly.map(idx => idx.join(', '));
        }
        
        if (!collections.includes('projections_weekly') && !collections.includes('weekly_projections')) {
          result.weekly_projections.fields_missing = REQUIRED_FIELDS.weekly;
          result.weekly_projections.indexes_missing = REQUIRED_INDEXES.weekly.map(idx => idx.join(', '));
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error auditing Appwrite collections:', error);
    return {
      yearly_projections: { exists: false, fields_missing: REQUIRED_FIELDS.yearly, indexes_missing: REQUIRED_INDEXES.yearly.map(idx => idx.join(', ')) },
      weekly_projections: { exists: false, fields_missing: REQUIRED_FIELDS.weekly, indexes_missing: REQUIRED_INDEXES.weekly.map(idx => idx.join(', ')) }
    };
  }
}

async function auditRepo() {
  const endpoints: string[] = [];
  const testFiles: string[] = [];
  const searcher = new ProjectFileSearcher();

  try {
    // Find API routes related to projections
    const apiFiles = await searcher.findApiRoutes();
    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('projection') || file.includes('projection')) {
        const routePath = file
          .replace('app/api', '')
          .replace('/route.ts', '')
          .replace('[', ':')
          .replace(']', '');
        
        if (content.includes('export async function GET')) endpoints.push(`GET ${routePath}`);
        if (content.includes('export async function POST')) endpoints.push(`POST ${routePath}`);
        if (content.includes('export async function PUT')) endpoints.push(`PUT ${routePath}`);
        if (content.includes('export async function DELETE')) endpoints.push(`DELETE ${routePath}`);
      }
    }

    // Find services/libs related to projections
    const libFiles = await findFiles('lib/**/*.ts', {
      ignore: FilePatterns.ignorePatterns
    });
    
    for (const file of libFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('projection') && (content.includes('getProjection') || content.includes('createProjection'))) {
        endpoints.push(`LIB ${file}`);
      }
    }

    // Find test files using optimized search
    const projectionTests = await searcher.searchByContent(
      FilePatterns.tests,
      'projection',
      { ignoreCase: true }
    );
    
    testFiles.push(...projectionTests.map(result => result.path));

  } catch (error) {
    console.warn('[auditRepo] Error during file search:', error);
  }

  return {
    endpoints: endpoints.length > 0 ? endpoints : ['No projection endpoints found'],
    tests_present: testFiles.length > 0
  };
}

async function main() {
  try {
    console.log('🔍 Auditing Module 1 - Projections Collections...');
    
    const collections = await auditAppwriteCollections();
    const repo = await auditRepo();
    
    const notes: string[] = [];
    if (!collections.yearly_projections.exists) notes.push('yearly_projections collection missing');
    if (!collections.weekly_projections.exists) notes.push('weekly_projections collection missing');
    if (collections.yearly_projections.fields_missing.length > 0) notes.push(`yearly: missing ${collections.yearly_projections.fields_missing.join(', ')}`);
    if (collections.weekly_projections.fields_missing.length > 0) notes.push(`weekly: missing ${collections.weekly_projections.fields_missing.join(', ')}`);
    if (!repo.tests_present) notes.push('No projection tests found');
    
    let status: 'ok' | 'incomplete' | 'missing' = 'ok';
    if (!collections.yearly_projections.exists || !collections.weekly_projections.exists) status = 'missing';
    else if (collections.yearly_projections.fields_missing.length > 0 || collections.weekly_projections.fields_missing.length > 0) status = 'incomplete';

    const report: ProjectionsCollectionsReport = {
      collections,
      repo,
      status,
      notes
    };

    // Write to temp file
    const outputPath = '/tmp/projections_collections_report.json';
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Module 1 Report:');
    console.log(JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error auditing Module 1:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
