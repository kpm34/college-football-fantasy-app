#!/usr/bin/env tsx

/**
 * Projection Evaluation CLI
 * Command-line interface for running projection evaluations
 * 
 * Usage:
 *   eval_proj --weeks 2023W1-2024W14 --out reports/weekly_eval.md
 *   eval_proj --weeks 2024W1-2024W14 --positions QB,RB,WR --format markdown,json
 */

import 'dotenv/config';
import { Command } from 'commander';
import { ProjectionEvaluator } from '../evaluation/evaluator';
import { EvaluationConfig, WeekRange } from '../evaluation/types';
import { join } from 'path';

interface CLIOptions {
  weeks: string;
  out: string;
  positions?: string;
  format?: string;
  leagueId?: string;
  calibration?: boolean;
  timeSeries?: boolean;
  minTierSize?: string;
}

/**
 * Parse week range string (e.g., "2023W1-2024W14")
 */
function parseWeekRange(weekString: string): WeekRange {
  const match = weekString.match(/^(\d{4})W(\d+)-(\d{4})W(\d+)$/);
  
  if (!match) {
    throw new Error(`Invalid week range format: ${weekString}. Expected format: 2023W1-2024W14`);
  }
  
  const [, startYear, startWeek, endYear, endWeek] = match;
  
  return {
    startSeason: parseInt(startYear, 10),
    startWeek: parseInt(startWeek, 10),
    endSeason: parseInt(endYear, 10),
    endWeek: parseInt(endWeek, 10)
  };
}

/**
 * Parse positions string (e.g., "QB,RB,WR")
 */
function parsePositions(positionsString?: string): string[] {
  if (!positionsString) {
    return []; // Empty array means all positions
  }
  
  return positionsString.split(',').map(pos => pos.trim().toUpperCase());
}

/**
 * Parse output formats (e.g., "markdown,json,parquet")
 */
function parseFormats(formatString?: string): ('markdown' | 'json' | 'parquet')[] {
  if (!formatString) {
    return ['markdown']; // Default to markdown
  }
  
  const formats = formatString.split(',').map(fmt => fmt.trim().toLowerCase());
  const validFormats = ['markdown', 'json', 'parquet'];
  
  for (const format of formats) {
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format: ${format}. Valid formats: ${validFormats.join(', ')}`);
    }
  }
  
  return formats as ('markdown' | 'json' | 'parquet')[];
}

/**
 * Validate configuration
 */
function validateConfig(config: EvaluationConfig): void {
  // Validate week range
  if (config.week_range.startSeason > config.week_range.endSeason) {
    throw new Error('Start season cannot be after end season');
  }
  
  if (config.week_range.startSeason === config.week_range.endSeason &&
      config.week_range.startWeek > config.week_range.endWeek) {
    throw new Error('Start week cannot be after end week in the same season');
  }
  
  // Validate positions
  const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  for (const position of config.positions) {
    if (!validPositions.includes(position)) {
      console.warn(`⚠️ Warning: Position '${position}' may not be recognized. Valid positions: ${validPositions.join(', ')}`);
    }
  }
  
  // Validate output path
  if (!config.output_path) {
    throw new Error('Output path is required');
  }
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const program = new Command();
  
  program
    .name('eval_proj')
    .description('Evaluate projection model performance')
    .version('1.0.0')
    .requiredOption('--weeks <range>', 'Week range (e.g., 2023W1-2024W14)')
    .requiredOption('--out <path>', 'Output file path')
    .option('--positions <list>', 'Comma-separated positions to analyze (e.g., QB,RB,WR). Default: all positions')
    .option('--format <formats>', 'Output formats: markdown,json,parquet (default: markdown)')
    .option('--league-id <id>', 'League ID for scoring rules (uses default PPR if not specified)')
    .option('--calibration', 'Include calibration analysis', false)
    .option('--time-series', 'Include time series analysis', false)
    .option('--min-tier-size <n>', 'Minimum players per tier for analysis (default: 3)', '3')
    .parse();
  
  const options = program.opts<CLIOptions>();
  
  try {
    console.log('🚀 College Football Projection Evaluator');
    console.log('========================================');
    
    // Parse and validate inputs
    const weekRange = parseWeekRange(options.weeks);
    const positions = parsePositions(options.positions);
    const formats = parseFormats(options.format);
    const minTierSize = parseInt(options.minTierSize || '3', 10);
    
    // Build configuration
    const config: EvaluationConfig = {
      week_range: weekRange,
      positions,
      output_formats: formats,
      output_path: options.out,
      include_calibration: options.calibration || false,
      include_time_series: options.timeSeries || false,
      min_predictions_per_tier: minTierSize
    };
    
    // Validate configuration
    validateConfig(config);
    
    console.log(`📅 Evaluation Period: ${options.weeks}`);
    console.log(`📊 Positions: ${positions.length > 0 ? positions.join(', ') : 'All'}`);
    console.log(`📄 Output Formats: ${formats.join(', ')}`);
    console.log(`📂 Output Path: ${options.out}`);
    console.log('');
    
    // Create evaluator and run evaluation
    const evaluator = await ProjectionEvaluator.createFromEnvironment();
    const report = await evaluator.evaluate(config);
    
    // Success summary
    console.log('\n🎉 Evaluation completed successfully!');
    console.log(`📊 Analyzed ${report.overall_metrics.n_predictions.toLocaleString()} predictions`);
    console.log(`👥 Covered ${report.overall_metrics.n_players.toLocaleString()} unique players`);
    console.log(`🎯 Overall MAE: ${report.overall_metrics.mae.toFixed(2)} fantasy points`);
    
    if (report.by_tier && report.by_tier.length > 0) {
      console.log(`📈 Analyzed ${report.by_tier.length} fantasy tiers`);
    }
    
    console.log(`\n📄 Reports generated at: ${options.out}`);
    
  } catch (error: any) {
    console.error('❌ Evaluation failed:', error.message);
    
    if (error.message.includes('No prediction data')) {
      console.error('\n💡 Troubleshooting:');
      console.error('  - Ensure projections_weekly or projections_yearly collection has data');
      console.error('  - Check that the week range matches available data');
      console.error('  - Verify database connection and permissions');
    } else if (error.message.includes('No actual performance data')) {
      console.error('\n💡 Troubleshooting:');
      console.error('  - Ensure scoring or player_stats collection has data');
      console.error('  - Check that actual performance data exists for the evaluation period');
      console.error('  - Consider populating the scoring collection with game results');
    } else if (error.message.includes('No matching')) {
      console.error('\n💡 Troubleshooting:');
      console.error('  - Check that player_id values match between prediction and actual data');
      console.error('  - Verify that evaluation period overlaps with available data');
      console.error('  - Ensure position filtering is not too restrictive');
    }
    
    process.exit(1);
  }
}

/**
 * Example usage help
 */
function showExamples(): void {
  console.log('📚 Example Usage:');
  console.log('');
  console.log('# Evaluate all positions for recent weeks:');
  console.log('eval_proj --weeks 2024W1-2024W14 --out reports/season_eval.md');
  console.log('');
  console.log('# Focus on skill positions with detailed analysis:');
  console.log('eval_proj --weeks 2024W10-2024W14 --positions QB,RB,WR --out reports/skill_positions.md --calibration --time-series');
  console.log('');
  console.log('# Generate multiple output formats:');
  console.log('eval_proj --weeks 2023W1-2024W14 --format markdown,json,parquet --out reports/full_analysis');
  console.log('');
  console.log('# Use specific league scoring:');
  console.log('eval_proj --weeks 2024W1-2024W14 --league-id 67890 --out reports/league_specific.md');
}

// CLI execution
if (require.main === module) {
  // Add help for examples
  if (process.argv.includes('--examples')) {
    showExamples();
    process.exit(0);
  }
  
  main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { parseWeekRange, parsePositions, parseFormats, validateConfig };