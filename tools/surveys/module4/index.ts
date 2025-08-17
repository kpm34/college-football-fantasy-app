#!/usr/bin/env tsx

/**
 * Module 4 - Sourcing System Audit
 * Verifies the resolver pipeline and data sourcing collections
 */

import { Client, Databases } from 'appwrite';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface SourcingSystemReport {
  pipeline: {
    ingest: boolean;
    normalize: boolean;
    merge: boolean;
    publish: boolean;
    policy_detected: string;
  };
  scheduling: {
    depth_weekly: boolean;
    injuries_daily: boolean;
    usage_rolling: boolean;
  };
  db: {
    [key: string]: { exists: boolean; fields_missing: string[] };
  };
  status: 'ok' | 'incomplete' | 'missing';
  notes: string[];
}

const PIPELINE_STAGES = {
  ingest: ['ingest', 'fetch', 'import', 'sync', 'collect'],
  normalize: ['normalize', 'clean', 'transform', 'standardize'],
  merge: ['merge', 'combine', 'consolidate', 'resolve'],
  publish: ['publish', 'export', 'deploy', 'update']
};

const EXPECTED_COLLECTIONS = {
  depth_charts: ['depth_chart_rank', 'starter_prob', 'player_name', 'position'],
  player_status: ['injury_status', 'report_time', 'player_id'],
  usage_trends: ['usage_pct', 'window', 'player_id'],
  team_context: ['pace', 'run_pass_rate', 'team_id'],
  depth_overrides: ['source', 'note', 'expires_at', 'player_id']
};

const MERGE_PRIORITY_PATTERNS = [
  'manual>team_notes>vendor>inferred',
  'manual > team_notes > vendor > inferred',
  'priority.*manual.*team.*vendor.*inferred',
  'override.*manual.*team.*vendor'
];

async function auditPipeline() {
  const pipeline = {
    ingest: false,
    normalize: false,
    merge: false,
    publish: false,
    policy_detected: ''
  };

  // Search for pipeline files
  const allFiles = await glob('**/*.{ts,js}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**'] 
  });

  for (const file of allFiles) {
    const fileName = path.basename(file).toLowerCase();
    const content = fs.readFileSync(file, 'utf8').toLowerCase();

    // Check for pipeline stages
    for (const [stage, keywords] of Object.entries(PIPELINE_STAGES)) {
      if (keywords.some(keyword => 
        fileName.includes(keyword) || 
        content.includes(keyword) && (content.includes('projection') || content.includes('data'))
      )) {
        pipeline[stage as keyof typeof pipeline] = true;
      }
    }

    // Check for merge priority policy
    for (const pattern of MERGE_PRIORITY_PATTERNS) {
      if (content.includes(pattern) || 
          (content.includes('manual') && content.includes('vendor') && content.includes('priority'))) {
        pipeline.policy_detected = pattern;
        break;
      }
    }
  }

  if (!pipeline.policy_detected) {
    pipeline.policy_detected = 'Not detected';
  }

  return pipeline;
}

async function auditScheduling() {
  const scheduling = {
    depth_weekly: false,
    injuries_daily: false,
    usage_rolling: false
  };

  // Search for scheduled jobs/cron files
  const scheduleFiles = await glob('**/*.{ts,js,yml,yaml,json}', { 
    ignore: ['node_modules/**', '.next/**', 'dist/**'] 
  });

  for (const file of scheduleFiles) {
    const content = fs.readFileSync(file, 'utf8').toLowerCase();

    // Check for depth chart weekly updates
    if ((content.includes('depth') && content.includes('weekly')) ||
        (content.includes('cron') && content.includes('0 0 * * 0')) || // Sunday weekly
        content.includes('depth.*weekly') ||
        content.includes('weekly.*depth')) {
      scheduling.depth_weekly = true;
    }

    // Check for daily injury updates
    if ((content.includes('injur') && content.includes('daily')) ||
        (content.includes('cron') && content.includes('0 0 * * *')) || // Daily
        content.includes('daily.*injur') ||
        content.includes('injur.*daily')) {
      scheduling.injuries_daily = true;
    }

    // Check for rolling usage updates
    if ((content.includes('usage') && content.includes('rolling')) ||
        (content.includes('usage') && content.includes('window')) ||
        content.includes('rolling.*usage') ||
        content.includes('usage.*trend')) {
      scheduling.usage_rolling = true;
    }
  }

  return scheduling;
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
  
  const result: SourcingSystemReport['db'] = {};

  for (const [expectedCollection, requiredFields] of Object.entries(EXPECTED_COLLECTIONS)) {
    const collection = collections.find(c => 
      c.$id === expectedCollection || 
      c.name.toLowerCase().replace(' ', '_') === expectedCollection.toLowerCase()
    );

    if (collection) {
      try {
        const attributes = await databases.listAttributes(databaseId, collection.$id);
        const existingFields = attributes.attributes.map(a => a.key);
        const fieldsMapping = new Map([
          ['depth_chart_rank', ['depth_chart_rank', 'pos_rank', 'depth_rank']],
          ['starter_prob', ['starter_prob', 'starter_probability', 'prob']],
          ['injury_status', ['injury_status', 'status', 'injury_report']],
          ['usage_pct', ['usage_pct', 'usage_rate', 'usage_percentage']],
          ['run_pass_rate', ['run_pass_rate', 'run_rate', 'pass_rate']]
        ]);

        const fieldsMapping2 = new Map([
          ['depth_chart_rank', ['depth_chart_rank', 'pos_rank', 'depth_rank']],
          ['starter_prob', ['starter_prob', 'starter_probability', 'prob']],
          ['injury_status', ['injury_status', 'status', 'injury_report']],
          ['usage_pct', ['usage_pct', 'usage_rate', 'usage_percentage']],
          ['run_pass_rate', ['run_pass_rate', 'run_rate', 'pass_rate']]
        ]);
        
        const fieldsMapping3 = new Map([
          ['depth_chart_rank', ['depth_chart_rank', 'pos_rank', 'depth_rank']],
          ['starter_prob', ['starter_prob', 'starter_probability', 'prob']],
          ['injury_status', ['injury_status', 'status', 'injury_report']],
          ['usage_pct', ['usage_pct', 'usage_rate', 'usage_percentage']],
          ['run_pass_rate', ['run_pass_rate', 'run_rate', 'pass_rate']]
        ]);
        
        const fieldsMapping4 = new Map([
          ['depth_chart_rank', ['depth_chart_rank', 'pos_rank', 'depth_rank']],
          ['starter_prob', ['starter_prob', 'starter_probability', 'prob']],
          ['injury_status', ['injury_status', 'status', 'injury_report']],
          ['usage_pct', ['usage_pct', 'usage_rate', 'usage_percentage']],
          ['run_pass_rate', ['run_pass_rate', 'run_rate', 'pass_rate']]
        ]);
        
        const fieldsMapping5 = new Map([
          ['depth_chart_rank', ['depth_chart_rank', 'pos_rank', 'depth_rank']],
          ['starter_prob', ['starter_prob', 'starter_probability', 'prob']],
          ['injury_status', ['injury_status', 'status', 'injury_report']],
          ['usage_pct', ['usage_pct', 'usage_rate', 'usage_percentage']],
          ['run_pass_rate', ['run_pass_rate', 'run_rate', 'pass_rate']]
        ]);
        
        const fieldsMissing = requiredFields.filter(field => {
          const possibleNames = fieldsMapping.get(field) || [field];
          return !possibleNames.some(name => existingFields.includes(name));
        });
        
        result[expectedCollection] = {
          exists: true,
          fields_missing: fieldsMissing
        };
      } catch (error) {
        result[expectedCollection] = {
          exists: true,
          fields_missing: requiredFields
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
    console.log('🔍 Auditing Module 4 - Sourcing System...');
    
    const pipeline = await auditPipeline();
    const scheduling = await auditScheduling();
    const db = await auditDbCollections();
    
    const notes: string[] = [];

    // Pipeline status
    const pipelineStages = Object.entries(pipeline).filter(([k, v]) => k !== 'policy_detected' && v === true).length;
    notes.push(`${pipelineStages}/4 pipeline stages found`);
    
    if (pipeline.policy_detected === 'Not detected') {
      notes.push('Merge priority policy not found');
    }

    // Scheduling status
    const scheduleTypes = Object.values(scheduling).filter(s => s === true).length;
    notes.push(`${scheduleTypes}/3 scheduling patterns found`);

    // Database status
    const existingCollections = Object.values(db).filter(c => c.exists).length;
    notes.push(`${existingCollections}/${Object.keys(EXPECTED_COLLECTIONS).length} sourcing collections found`);

    // Add specific missing items
    for (const [stage, present] of Object.entries(pipeline)) {
      if (stage !== 'policy_detected' && !present) {
        notes.push(`${stage} stage not found`);
      }
    }

    for (const [schedule, present] of Object.entries(scheduling)) {
      if (!present) {
        notes.push(`${schedule} scheduling not found`);
      }
    }

    // Determine status
    let status: 'ok' | 'incomplete' | 'missing' = 'ok';
    if (pipelineStages === 0 || existingCollections === 0) status = 'missing';
    else if (pipelineStages < 4 || existingCollections < Object.keys(EXPECTED_COLLECTIONS).length) status = 'incomplete';

    const report: SourcingSystemReport = {
      pipeline,
      scheduling,
      db,
      status,
      notes
    };

    // Write to temp file
    const outputPath = '/tmp/sourcing_system_report.json';
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Module 4 Report:');
    console.log(JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error auditing Module 4:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
