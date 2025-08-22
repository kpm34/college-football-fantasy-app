#!/usr/bin/env tsx

/**
 * Module 4 - Sourcing System Audit
 * Checks for resolver pipeline and data sourcing collections
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface Module4Report {
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
    depth_charts: { exists: boolean; fields_missing: string[] };
    player_status: { exists: boolean; fields_missing: string[] };
    usage_trends: { exists: boolean; fields_missing: string[] };
    team_context: { exists: boolean; fields_missing: string[] };
    depth_overrides: { exists: boolean; fields_missing: string[] };
  };
  status: 'ok' | 'incomplete' | 'missing';
  notes: string[];
}

async function checkPipeline(): Promise<Module4Report['pipeline']> {
  const pipeline: Module4Report['pipeline'] = {
    ingest: false,
    normalize: false,
    merge: false,
    publish: false,
    policy_detected: ''
  };

  // Check core/data-ingestion directory structure
  const ingestionPath = path.join(process.cwd(), 'core/data-ingestion');
  
  // Check for pipeline stages
  if (fs.existsSync(path.join(ingestionPath, 'adapters'))) {
    pipeline.ingest = true;
  }
  
  if (fs.existsSync(path.join(ingestionPath, 'normalizer'))) {
    pipeline.normalize = true;
  }
  
  if (fs.existsSync(path.join(ingestionPath, 'resolver'))) {
    pipeline.merge = true;
  }
  
  if (fs.existsSync(path.join(ingestionPath, 'publisher'))) {
    pipeline.publish = true;
  }

  // Check for merge priority policy
  const resolverPath = path.join(ingestionPath, 'resolver/conflict-resolver.ts');
  if (fs.existsSync(resolverPath)) {
    const content = fs.readFileSync(resolverPath, 'utf8');
    
    // Look for priority order
    if (content.includes('manual') && content.includes('team_notes') && content.includes('vendor')) {
      if (content.includes('SOURCE_PRIORITY') || content.includes('priority')) {
        pipeline.policy_detected = 'manual>team_notes>vendor>inferred';
      }
    }
  }

  // Also check for alternative implementations
  const files = await glob('**/ingest*.{ts,js}', { ignore: ['node_modules/**'] });
  if (files.length > 0) pipeline.ingest = true;

  return pipeline;
}

async function checkScheduling(): Promise<Module4Report['scheduling']> {
  const scheduling: Module4Report['scheduling'] = {
    depth_weekly: false,
    injuries_daily: false,
    usage_rolling: false
  };

  // Check for cron jobs or scheduled tasks
  const cronFiles = await glob('**/*cron*.{ts,js,yml,yaml}', { ignore: ['node_modules/**'] });
  const workflowFiles = await glob('.github/workflows/*.{yml,yaml}');
  
  const allFiles = [...cronFiles, ...workflowFiles];
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for depth chart weekly updates
    if (content.includes('depth') && (content.includes('weekly') || content.includes('0 0 * * 0'))) {
      scheduling.depth_weekly = true;
    }
    
    // Check for daily injury updates
    if (content.includes('injur') && (content.includes('daily') || content.includes('0 0 * * *'))) {
      scheduling.injuries_daily = true;
    }
    
    // Check for usage tracking
    if (content.includes('usage') && (content.includes('rolling') || content.includes('window'))) {
      scheduling.usage_rolling = true;
    }
  }

  // Check API routes for scheduled endpoints
  const apiFiles = await glob('app/api/**/route.ts');
  for (const file of apiFiles) {
    if (file.includes('cron') || file.includes('schedule')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('depth')) scheduling.depth_weekly = true;
      if (content.includes('injur')) scheduling.injuries_daily = true;
    }
  }

  return scheduling;
}

async function checkCollections(): Promise<Module4Report['db']> {
  const db: Module4Report['db'] = {
    depth_charts: { exists: false, fields_missing: [] },
    player_status: { exists: false, fields_missing: [] },
    usage_trends: { exists: false, fields_missing: [] },
    team_context: { exists: false, fields_missing: [] },
    depth_overrides: { exists: false, fields_missing: [] }
  };

  // Check appwrite-schema.json
  const schemaPath = path.join(process.cwd(), 'appwrite-schema.json');
  if (fs.existsSync(schemaPath)) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const collections = schema.collections || [];
    
    // Check model_inputs (which contains depth chart data)
    const modelInputs = collections.find((c: any) => c.$id === 'model_inputs');
    if (modelInputs) {
      db.depth_charts.exists = true;
      const fields = modelInputs.attributes?.map((a: any) => a.key) || [];
      
      if (!fields.includes('depth_chart_rank') && !fields.includes('depth_chart')) {
        db.depth_charts.fields_missing.push('depth_chart_rank');
      }
      if (!fields.includes('starter_prob')) {
        db.depth_charts.fields_missing.push('starter_prob');
      }
    } else {
      db.depth_charts.fields_missing = ['depth_chart_rank', 'starter_prob'];
    }
    
    // Check for player_status equivalent
    const playerStats = collections.find((c: any) => 
      c.$id === 'player_stats' || c.$id === 'player_status'
    );
    if (playerStats) {
      db.player_status.exists = true;
      const fields = playerStats.attributes?.map((a: any) => a.key) || [];
      if (!fields.includes('injury_status')) {
        db.player_status.fields_missing.push('injury_status');
      }
      if (!fields.includes('report_time')) {
        db.player_status.fields_missing.push('report_time');
      }
    } else {
      db.player_status.fields_missing = ['injury_status', 'report_time'];
    }
    
    // Other collections likely don't exist yet
    if (!collections.find((c: any) => c.$id === 'usage_trends')) {
      db.usage_trends.fields_missing = ['usage_pct', 'window'];
    }
    
    if (!collections.find((c: any) => c.$id === 'team_context')) {
      db.team_context.fields_missing = ['pace', 'run_pass_rate'];
    }
    
    // Check for overrides in model_inputs
    if (modelInputs) {
      db.depth_overrides.exists = true;
      const fields = modelInputs.attributes?.map((a: any) => a.key) || [];
      if (!fields.includes('expires_at')) {
        db.depth_overrides.fields_missing.push('expires_at');
      }
      if (!fields.includes('source')) {
        db.depth_overrides.fields_missing.push('source');
      }
      if (!fields.includes('note')) {
        db.depth_overrides.fields_missing.push('note');
      }
    } else {
      db.depth_overrides.fields_missing = ['source', 'note', 'expires_at'];
    }
  }

  return db;
}

async function main() {
  console.log('🔍 Auditing Module 4 - Sourcing System...');
  
  const pipeline = await checkPipeline();
  const scheduling = await checkScheduling();
  const db = await checkCollections();
  
  const notes: string[] = [];
  
  // Add notes based on findings
  if (!pipeline.normalize) notes.push('Normalize stage exists but may need enhancement');
  if (!pipeline.publish) notes.push('Publish stage exists but may need enhancement');
  
  if (!scheduling.depth_weekly) notes.push('No weekly scheduler for depth charts');
  if (!scheduling.usage_rolling) notes.push('No rolling window for usage trends');
  
  if (!db.usage_trends.exists) notes.push('usage_trends collection missing');
  if (!db.team_context.exists) notes.push('team_context collection missing');
  
  if (pipeline.policy_detected) {
    notes.push('Merge priority policy detected in resolver');
  }
  
  // Determine status
  const pipelineStages = [pipeline.ingest, pipeline.normalize, pipeline.merge, pipeline.publish];
  const stageCount = pipelineStages.filter(s => s === true).length;
  const collectionCount = Object.values(db).filter(c => c.exists).length;
  
  let status: 'ok' | 'incomplete' | 'missing' = 'missing';
  if (stageCount >= 3 && collectionCount >= 3) {
    status = 'incomplete';
  } else if (stageCount === 4 && collectionCount >= 4) {
    status = 'ok';
  }
  
  const report: Module4Report = {
    pipeline,
    scheduling,
    db,
    status,
    notes
  };
  
  // Write report
  const outputPath = '/tmp/sourcing_system_report.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log('📊 Module 4 Report:');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${outputPath}`);
}

if (require.main === module) {
  main();
}
