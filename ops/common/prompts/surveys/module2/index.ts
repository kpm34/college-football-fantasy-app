#!/usr/bin/env tsx

/**
 * Module 2 - Projections Algorithm Audit
 * Verifies projections pipeline and algorithm components
 */

import { Client, Databases } from 'appwrite';
import fs from 'fs';
import path from 'path';
import { findFiles, FilePatterns, ProjectFileSearcher } from '../../../lib/utils/glob-helpers';

interface ProjectionsAlgoReport {
  files: {
    [key: string]: { present: boolean; mentions: string[] };
    tests_present: boolean;
  };
  db: {
    [key: string]: { exists: boolean; fields_missing: string[] };
  };
  gaps: string[];
  status: 'ok' | 'incomplete' | 'missing';
  notes: string[];
}

const EXPECTED_FILES = {
  'depthWeights.ts': ['starter_prob', 'depth_chart_rank', 'multiplier'],
  'usageAdjust.ts': ['usage', 'returning', 'prior', 'trend'],
  'normalize.ts': ['scale', 'floor', 'normalize', 'uncertainty'],
  'caps.ts': ['cap', 'ceiling', 'floor', 'limit'],
  'allocatePosition.ts': ['QB', 'RB', 'WR', 'TE', 'position']
};

const EXPECTED_COLLECTIONS = {
  depth_charts: ['depth_chart_rank', 'starter_prob', 'player_name', 'position'],
  usage_trends: ['usage_pct', 'window', 'player_id', 'season'],
  player_status: ['injury_status', 'report_time', 'player_id'],
  team_context: ['pace', 'run_pass_rate', 'team_id'],
  model_inputs: ['depth_chart_json', 'manual_overrides_json'] // Current implementation
};

async function auditAlgoFiles() {
  const result: ProjectionsAlgoReport['files'] = {
    tests_present: false
  };
  const searcher = new ProjectFileSearcher();

  try {
    // Search for expected algorithm files
    const allFiles = await findFiles(FilePatterns.typescript, {
      ignore: FilePatterns.ignorePatterns
    });
    
    for (const [expectedFile, keywords] of Object.entries(EXPECTED_FILES)) {
      const baseName = expectedFile.replace('.ts', '');
      const foundFile = allFiles.find(f => 
        f.includes(baseName) || 
        path.basename(f) === expectedFile ||
        f.includes(baseName.toLowerCase())
      );

      if (foundFile) {
        const content = fs.readFileSync(foundFile, 'utf8');
        const mentions = keywords.filter(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        result[expectedFile] = { present: true, mentions };
      } else {
        result[expectedFile] = { present: false, mentions: [] };
      }
    }

    // Check for test files using optimized content search
    const searchTerms = ['projection', 'depth', 'usage'];
    let testsFound = false;

    for (const term of searchTerms) {
      const matches = await searcher.searchByContent(
        FilePatterns.tests,
        term,
        { ignoreCase: true }
      );
      
      if (matches.length > 0) {
        testsFound = true;
        break;
      }
    }

    // Also check if any algorithm file names are mentioned in tests
    if (!testsFound) {
      for (const expectedFile of Object.keys(EXPECTED_FILES)) {
        const baseName = expectedFile.replace('.ts', '');
        const matches = await searcher.searchByContent(
          FilePatterns.tests,
          baseName,
          { ignoreCase: true }
        );
        
        if (matches.length > 0) {
          testsFound = true;
          break;
        }
      }
    }

    result.tests_present = testsFound;

  } catch (error) {
    console.warn('[auditAlgoFiles] Error during file search:', error);
  }

  return result;
}

async function auditDbCollections() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';

  const collectionsResponse = await databases.listCollections(databaseId);
  const collections = collectionsResponse.collections;
  
  const result: ProjectionsAlgoReport['db'] = {};

  for (const [expectedCollection, requiredFields] of Object.entries(EXPECTED_COLLECTIONS)) {
    const collection = collections.find(c => 
      c.$id === expectedCollection || 
      c.name.toLowerCase() === expectedCollection.toLowerCase()
    );

    if (collection) {
      try {
        const attributes = await databases.listAttributes(databaseId, collection.$id);
        const existingFields = attributes.attributes.map(a => a.key);
        const fieldsMissing = requiredFields.filter(field => !existingFields.includes(field));
        
        result[expectedCollection] = {
          exists: true,
          fields_missing: fieldsMissing
        };
      } catch (error) {
        result[expectedCollection] = {
          exists: true,
          fields_missing: requiredFields // Assume all missing if can't list attributes
        };
      }
    } else {
      result[expectedCollection] = {
        exists: false,
        fields_missing: requiredFields
      };
    }
  }

  return result;
}

async function main() {
  try {
    console.log('🔍 Auditing Module 2 - Projections Algorithm...');
    
    const files = await auditAlgoFiles();
    const db = await auditDbCollections();
    
    const gaps: string[] = [];
    const notes: string[] = [];

    // Identify gaps
    for (const [file, info] of Object.entries(files)) {
      if (file !== 'tests_present' && !info.present) {
        gaps.push(`${file} missing`);
      }
    }

    for (const [collection, info] of Object.entries(db)) {
      if (!info.exists) {
        gaps.push(`${collection} collection missing`);
      } else if (info.fields_missing.length > 0) {
        gaps.push(`${collection}.${info.fields_missing.join(', ')} missing`);
      }
    }

    if (!files.tests_present) {
      gaps.push('Algorithm tests missing');
    }

    // Add notes
    const presentFiles = Object.entries(files).filter(([k, v]) => k !== 'tests_present' && v.present).length;
    notes.push(`${presentFiles}/${Object.keys(EXPECTED_FILES).length} algorithm files found`);
    
    const presentCollections = Object.values(db).filter(c => c.exists).length;
    notes.push(`${presentCollections}/${Object.keys(EXPECTED_COLLECTIONS).length} required collections found`);

    // Determine status
    let status: 'ok' | 'incomplete' | 'missing' = 'ok';
    if (presentFiles === 0 || presentCollections === 0) status = 'missing';
    else if (gaps.length > 0) status = 'incomplete';

    const report: ProjectionsAlgoReport = {
      files,
      db,
      gaps,
      status,
      notes
    };

    // Write to temp file
    const outputPath = '/tmp/projections_algo_report.json';
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Module 2 Report:');
    console.log(JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error auditing Module 2:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
