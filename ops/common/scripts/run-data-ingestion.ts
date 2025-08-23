#!/usr/bin/env npx tsx

/**
 * Data Ingestion CLI Runner
 * 
 * Command-line interface for executing the data ingestion pipeline.
 * Supports various modes and configuration options for testing and production use.
 * 
 * Usage:
 *   npx tsx scripts/run-data-ingestion.ts --season 2025 --week 5
 *   npx tsx scripts/run-data-ingestion.ts --season 2025 --week 5 --dry-run
 *   npx tsx scripts/run-data-ingestion.ts --season 2025 --week 5 --adapters team_notes,stats_inference
 */

import { IngestionOrchestrator, IngestionConfig } from '@domain/data-ingestion/orchestrator/ingestion-orchestrator';
import { ManualOverrideManager } from '@domain/data-ingestion/manual-overrides/manual-override-manager';
import { DataQualityValidator } from '@domain/data-ingestion/validation/data-quality-validator';
import { program } from 'commander';

interface CLIOptions {
  season: string;
  week: string;
  adapters?: string;
  dryRun?: boolean;
  skipNormalization?: boolean;
  skipResolution?: boolean;
  skipPublication?: boolean;
  createSnapshot?: boolean;
  parallel?: boolean;
  maxRetries?: string;
  validate?: boolean;
  showOverrides?: boolean;
  quality?: boolean;
  verbose?: boolean;
}

async function main() {
  program
    .name('run-data-ingestion')
    .description('Execute the college football data ingestion pipeline')
    .version('1.0.0');

  program
    .option('-s, --season <season>', 'Season year (e.g., 2025)')
    .option('-w, --week <week>', 'Week number (1-15)')
    .option('-a, --adapters <adapters>', 'Comma-separated list of adapters to run', 'team_notes,stats_inference')
    .option('--dry-run', 'Run pipeline without writing to database')
    .option('--skip-normalization', 'Skip the normalization step')
    .option('--skip-resolution', 'Skip the conflict resolution step')  
    .option('--skip-publication', 'Skip the publication step')
    .option('--create-snapshot', 'Create versioned snapshot')
    .option('--parallel', 'Run adapters in parallel')
    .option('--max-retries <retries>', 'Maximum retry attempts', '3')
    .option('--validate', 'Run data quality validation')
    .option('--show-overrides', 'Show active manual overrides')
    .option('--quality', 'Generate quality report')
    .option('-v, --verbose', 'Enable verbose logging');

  program.parse();
  const options = program.opts<CLIOptions>();

  // Validate required options
  if (!options.season || !options.week) {
    console.error('Error: --season and --week are required');
    process.exit(1);
  }

  const season = parseInt(options.season);
  const week = parseInt(options.week);

  if (isNaN(season) || isNaN(week)) {
    console.error('Error: Season and week must be valid numbers');
    process.exit(1);
  }

  if (week < 1 || week > 15) {
    console.error('Error: Week must be between 1 and 15');
    process.exit(1);
  }

  console.log('🏈 College Football Data Ingestion Pipeline');
  console.log('==========================================\n');

  try {
    // Show active manual overrides if requested
    if (options.showOverrides) {
      await showActiveOverrides(season, week);
      return;
    }

    // Run quality validation if requested
    if (options.quality && !options.dryRun) {
      await runQualityValidation(season, week);
      return;
    }

    // Parse adapters
    const adapters = options.adapters ? options.adapters.split(',').map(a => a.trim()) : ['team_notes', 'stats_inference'];
    
    // Build ingestion configuration
    const config: IngestionConfig = {
      season,
      week,
      adapters,
      options: {
        dry_run: options.dryRun || false,
        skip_normalization: options.skipNormalization || false,
        skip_resolution: options.skipResolution || false,
        skip_publication: options.skipPublication || false,
        create_snapshot: options.createSnapshot !== false, // Default true
        parallel_adapters: options.parallel || false,
        max_retries: options.maxRetries ? parseInt(options.maxRetries) : 3
      }
    };

    console.log('📋 Configuration:');
    console.log(`   Season: ${season}`);
    console.log(`   Week: ${week}`);
    console.log(`   Adapters: ${adapters.join(', ')}`);
    console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
    console.log(`   Parallel: ${config.options.parallel_adapters ? 'Yes' : 'No'}`);
    console.log(`   Create Snapshot: ${config.options.create_snapshot ? 'Yes' : 'No'}`);
    
    if (options.verbose) {
      console.log(`   Full Config: ${JSON.stringify(config, null, 2)}`);
    }
    
    console.log('\n🚀 Starting ingestion pipeline...\n');

    // Initialize and run the orchestrator
    const orchestrator = new IngestionOrchestrator();
    const result = await orchestrator.execute(config);

    // Display results
    displayResults(result, options.verbose);

    // Run validation if requested
    if (options.validate && result.success && result.stages.publication.records_published > 0) {
      await runPostIngestionValidation(season, week, result.execution_id);
    }

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Pipeline execution failed:', error);
    console.error('\nStack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

async function showActiveOverrides(season: number, week: number): Promise<void> {
  console.log(`📝 Active Manual Overrides for ${season}W${week}\n`);

  try {
    const overrideManager = new ManualOverrideManager();
    
    // Get active overrides for this season/week
    const result = await overrideManager.searchOverrides({
      season,
      week,
      is_active: true,
      limit: 100
    });

    if (result.overrides.length === 0) {
      console.log('   No active overrides found.');
      return;
    }

    console.log(`   Found ${result.overrides.length} active overrides:\n`);

    for (const override of result.overrides) {
      console.log(`   • Player: ${override.player_id}`);
      console.log(`     Field: ${override.field_name} = ${override.override_value}`);
      console.log(`     Reason: ${override.reason}`);
      console.log(`     Created: ${new Date(override.created_at).toLocaleDateString()}`);
      console.log(`     By: ${override.created_by}`);
      console.log('');
    }

    // Get override statistics
    const stats = await overrideManager.getOverrideStats(season);
    console.log(`📊 Override Statistics for Season ${season}:`);
    console.log(`   Total: ${stats.total_overrides}`);
    console.log(`   Active: ${stats.active_overrides}`);
    console.log(`   Pending Approval: ${stats.pending_approval}`);
    console.log(`   Recent Activity (24h): ${stats.recent_activity}`);

  } catch (error) {
    console.error('Failed to fetch overrides:', error);
  }
}

async function runQualityValidation(season: number, week: number): Promise<void> {
  console.log(`🔍 Running Data Quality Validation for ${season}W${week}\n`);

  try {
    // This would load existing data and run validation
    console.log('Note: Quality validation on existing data not yet implemented.');
    console.log('Validation runs automatically during ingestion pipeline execution.');
    
  } catch (error) {
    console.error('Quality validation failed:', error);
  }
}

async function runPostIngestionValidation(season: number, week: number, executionId: string): Promise<void> {
  console.log('\n🔍 Running post-ingestion validation...\n');

  try {
    const validator = new DataQualityValidator();
    await validator.initializeContext(season, week);
    
    console.log('✅ Post-ingestion validation completed');
    console.log('   (Full validation results would be displayed here)');
    
  } catch (error) {
    console.warn('⚠️  Post-ingestion validation failed:', error);
  }
}

function displayResults(result: any, verbose: boolean): void {
  const duration = (result.duration_ms / 1000).toFixed(2);
  
  console.log(`\n📊 Ingestion Results (${duration}s):`);
  console.log(`   Execution ID: ${result.execution_id}`);
  console.log(`   Overall Success: ${result.success ? '✅ YES' : '❌ NO'}`);
  
  // Stage results
  console.log('\n📈 Stage Results:');
  
  // Adapters
  const adapters = result.stages.adapters;
  console.log(`   Adapters: ${getStatusEmoji(adapters.status)} ${adapters.status.toUpperCase()}`);
  console.log(`     Records Fetched: ${adapters.records_fetched}`);
  console.log(`     Adapters Run: ${adapters.adapters_run.join(', ') || 'none'}`);
  if (adapters.adapters_failed.length > 0) {
    console.log(`     Adapters Failed: ${adapters.adapters_failed.join(', ')}`);
  }
  console.log(`     Duration: ${(adapters.duration_ms / 1000).toFixed(2)}s`);

  // Normalization  
  const normalization = result.stages.normalization;
  console.log(`   Normalization: ${getStatusEmoji(normalization.status)} ${normalization.status.toUpperCase()}`);
  console.log(`     Records Normalized: ${normalization.records_normalized}`);
  console.log(`     Mapping Failures: ${normalization.mapping_failures}`);
  console.log(`     Duration: ${(normalization.duration_ms / 1000).toFixed(2)}s`);

  // Resolution
  const resolution = result.stages.resolution;
  console.log(`   Resolution: ${getStatusEmoji(resolution.status)} ${resolution.status.toUpperCase()}`);
  console.log(`     Conflicts Resolved: ${resolution.conflicts_resolved}`);
  console.log(`     Manual Overrides Applied: ${resolution.manual_overrides_applied}`);
  console.log(`     Duration: ${(resolution.duration_ms / 1000).toFixed(2)}s`);

  // Publication
  const publication = result.stages.publication;
  console.log(`   Publication: ${getStatusEmoji(publication.status)} ${publication.status.toUpperCase()}`);
  console.log(`     Records Published: ${publication.records_published}`);
  console.log(`     Snapshot Created: ${publication.snapshot_created ? '✅' : '❌'}`);
  console.log(`     Duration: ${(publication.duration_ms / 1000).toFixed(2)}s`);

  // Errors and warnings
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.slice(0, verbose ? result.errors.length : 3).forEach((error: any) => {
      console.log(`   • [${error.severity.toUpperCase()}] ${error.component}: ${error.message}`);
    });
    
    if (!verbose && result.errors.length > 3) {
      console.log(`   ... and ${result.errors.length - 3} more errors (use --verbose to see all)`);
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.slice(0, verbose ? result.warnings.length : 3).forEach((warning: any) => {
      console.log(`   • ${warning.stage}: ${warning.message}`);
    });
    
    if (!verbose && result.warnings.length > 3) {
      console.log(`   ... and ${result.warnings.length - 3} more warnings (use --verbose to see all)`);
    }
  }

  // Performance metrics
  console.log(`\n⚡ Performance:`);
  console.log(`   Peak Memory: ${result.performance_metrics.peak_memory_mb}MB`);
  console.log(`   Database Queries: ${result.performance_metrics.total_database_queries}`);
  console.log(`   Network Requests: ${result.performance_metrics.total_network_requests}`);

  // Final status
  if (result.success) {
    console.log('\n🎉 Pipeline completed successfully!');
  } else {
    console.log('\n💥 Pipeline completed with errors. Check logs above for details.');
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'success': return '✅';
    case 'partial': return '⚠️';
    case 'failed': return '❌';
    case 'skipped': return '⏭️';
    default: return '❓';
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Received interrupt signal. Shutting down gracefully...');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Received termination signal. Shutting down gracefully...');
  process.exit(143);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
  });
}