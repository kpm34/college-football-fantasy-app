#!/usr/bin/env tsx

/**
 * Module 2 - Projections Algorithm Audit
 * Checks for algorithm files and data dependency collections
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface Module2Report {
  files: {
    'depthWeights.ts': { present: boolean; mentions: string[] };
    'usageAdjust.ts': { present: boolean; mentions: string[] };
    'normalize.ts': { present: boolean; mentions: string[] };
    'caps.ts': { present: boolean; mentions: string[] };
    'allocatePosition.ts': { present: boolean; mentions: string[] };
    tests_present: boolean;
  };
  db: {
    depth_charts: { exists: boolean; fields_missing: string[] };
    usage_trends: { exists: boolean; fields_missing: string[] };
    player_status: { exists: boolean; fields_missing: string[] };
    team_context: { exists: boolean; fields_missing: string[] };
  };
  gaps: string[];
  status: 'ok' | 'incomplete' | 'missing';
  notes: string[];
}

const EXPECTED_FILES = [
  'depthWeights.ts',
  'usageAdjust.ts', 
  'normalize.ts',
  'caps.ts',
  'allocatePosition.ts'
];

const SEARCH_TERMS: Record<string, string[]> = {
  'depthWeights.ts': ['starter_prob', 'depth_chart_rank', 'depthMultiplier', 'depth'],
  'usageAdjust.ts': ['usage', 'returning', 'usage_pct', 'usage_rate'],
  'normalize.ts': ['normalize', 'scale', 'floor', 'ceiling'],
  'caps.ts': ['cap', 'enforce_caps', 'maximum', 'minimum'],
  'allocatePosition.ts': ['QB', 'RB', 'WR', 'TE', 'allocate']
};

async function auditAlgorithmFiles() {
  const result: Module2Report['files'] = {
    'depthWeights.ts': { present: false, mentions: [] },
    'usageAdjust.ts': { present: false, mentions: [] },
    'normalize.ts': { present: false, mentions: [] },
    'caps.ts': { present: false, mentions: [] },
    'allocatePosition.ts': { present: false, mentions: [] },
    tests_present: false
  };

  // Check for exact file names
  for (const fileName of EXPECTED_FILES) {
    const files = await glob(`**/${fileName}`, { ignore: ['node_modules/**'] });
    if (files.length > 0) {
      result[fileName as keyof typeof result]['present'] = true;
    }
  }

  // Search for functionality in /api/draft/players/route.ts (where it's implemented)
  const draftPlayersPath = path.join(process.cwd(), 'app/api/draft/players/route.ts');
  if (fs.existsSync(draftPlayersPath)) {
    const content = fs.readFileSync(draftPlayersPath, 'utf8');
    
    // Check for depth weights logic
    if (content.includes('depthMultiplier')) {
      result['depthWeights.ts'].mentions.push('depthMultiplier');
    }
    if (content.includes('depth_chart_rank') || content.includes('pos_rank')) {
      result['depthWeights.ts'].mentions.push('depth_chart_rank');
    }
    
    // Check for position allocation
    if (content.includes('QB') && content.includes('RB') && content.includes('WR')) {
      result['allocatePosition.ts'].mentions.push('QB', 'RB', 'WR', 'TE');
    }
  }

  // Check for tests
  const testFiles = await glob('**/*.test.ts', { ignore: ['node_modules/**'] });
  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('projection') || content.includes('depth')) {
      result.tests_present = true;
      break;
    }
  }

  return result;
}

async function auditCollections() {
  const result: Module2Report['db'] = {
    depth_charts: { exists: false, fields_missing: [] },
    usage_trends: { exists: false, fields_missing: [] },
    player_status: { exists: false, fields_missing: [] },
    team_context: { exists: false, fields_missing: [] }
  };

  // Check appwrite-schema.json
  const schemaPath = path.join(process.cwd(), 'appwrite-schema.json');
  if (fs.existsSync(schemaPath)) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    // Check model_inputs collection (which contains depth charts)
    const modelInputs = schema.collections?.find((c: any) => c.$id === 'model_inputs');
    if (modelInputs) {
      result.depth_charts.exists = true;
      const fields = modelInputs.attributes?.map((a: any) => a.key) || [];
      if (!fields.includes('depth_chart_rank')) {
        result.depth_charts.fields_missing.push('depth_chart_rank');
      }
      if (!fields.includes('starter_prob')) {
        result.depth_charts.fields_missing.push('starter_prob');
      }
    } else {
      result.depth_charts.fields_missing = ['depth_chart_rank', 'starter_prob'];
    }
    
    // Other collections don't exist yet
    result.usage_trends.fields_missing = ['usage_pct', 'window', 'player_id'];
    result.player_status.fields_missing = ['injury_status', 'report_time'];
    result.team_context.fields_missing = ['pace', 'run_pass_rate'];
  }

  return result;
}

async function main() {
  console.log('🔍 Auditing Module 2 - Projections Algorithm...');
  
  const files = await auditAlgorithmFiles();
  const db = await auditCollections();
  
  const gaps: string[] = [];
  const notes: string[] = [];
  
  // Identify gaps
  for (const [fileName, info] of Object.entries(files)) {
    if (fileName !== 'tests_present' && !info.present && info.mentions.length === 0) {
      gaps.push(`${fileName} missing`);
    }
  }
  
  for (const [collection, info] of Object.entries(db)) {
    if (!info.exists) {
      gaps.push(`${collection} collection missing`);
    } else if (info.fields_missing.length > 0) {
      gaps.push(`${collection}.${info.fields_missing[0]} missing`);
    }
  }
  
  // Add notes
  if (files['depthWeights.ts'].mentions.length > 0) {
    notes.push('Depth logic exists in /api/draft/players/route.ts');
  }
  notes.push('Algorithm is monolithic, not modular');
  notes.push('Using model_inputs collection for depth data');
  
  const status: 'ok' | 'incomplete' | 'missing' = 
    gaps.length === 0 ? 'ok' : gaps.length > 3 ? 'missing' : 'incomplete';
  
  const report: Module2Report = {
    files,
    db,
    gaps,
    status,
    notes
  };
  
  // Write report
  const outputPath = '/tmp/projections_algo_report.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log('📊 Module 2 Report:');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${outputPath}`);
}

if (require.main === module) {
  main();
}
