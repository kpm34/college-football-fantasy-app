#!/usr/bin/env tsx

/**
 * CFB Fantasy Projection Error Audit Script
 * 
 * Analyzes projection accuracy and categorizes errors using heuristics
 * to identify systematic issues in the projections algorithm.
 * 
 * Usage: tsx scripts/audit-projection-errors.ts --in examples.json --out audits.parquet
 */

import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

// Types for input data
interface ProjectionDataPoint {
  player_id: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K';
  team: string;
  opp: string;
  week: number;
  season: number;
  projected_fp: number;
  actual_fp: number;
  minutes?: number;
  snaps?: number;
  touches?: number;
  targets?: number;
  depth_chart_rank_at_pred_time?: number;
  // Additional fields for analysis
  player_name?: string;
  home_away?: 'H' | 'A' | 'N';
  game_script?: 'positive' | 'negative' | 'neutral';
  weather_conditions?: 'indoor' | 'fair' | 'rain' | 'wind' | 'snow';
  injury_status?: 'healthy' | 'questionable' | 'doubtful';
  opponent_def_rank?: number;
  spread?: number;
  total?: number;
  team_run_rate?: number;
  team_pass_rate?: number;
}

interface ErrorAnalysis {
  player_id: string;
  player_name?: string;
  position: string;
  team: string;
  week: number;
  season: number;
  projected_fp: number;
  actual_fp: number;
  absolute_error: number;
  pct_error: number;
  smape: number; // Symmetric Mean Absolute Percentage Error
  reason_tag: string;
  confidence_score: number; // 0-1, how confident we are in the reason
  details: string;
}

interface AuditSummary {
  total_predictions: number;
  avg_absolute_error: number;
  avg_pct_error: number;
  avg_smape: number;
  by_position: Record<string, {
    count: number;
    avg_absolute_error: number;
    avg_pct_error: number;
    avg_smape: number;
  }>;
  by_reason: Record<string, {
    count: number;
    avg_absolute_error: number;
    pct_of_total: number;
  }>;
  worst_predictions: ErrorAnalysis[];
}

class ProjectionErrorAuditor {
  private data: ProjectionDataPoint[] = [];
  private historicalData: Map<string, ProjectionDataPoint[]> = new Map();
  
  constructor(data: ProjectionDataPoint[]) {
    this.data = data;
    this.buildHistoricalIndex();
  }

  private buildHistoricalIndex() {
    // Group data by player for trailing mean calculations
    for (const point of this.data) {
      const key = `${point.player_id}_${point.position}`;
      if (!this.historicalData.has(key)) {
        this.historicalData.set(key, []);
      }
      this.historicalData.get(key)!.push(point);
    }
    
    // Sort each player's data by week for trailing calculations
    for (const playerData of this.historicalData.values()) {
      playerData.sort((a, b) => a.week - b.week);
    }
  }

  private calculateTrailingMean(
    playerId: string,
    position: string,
    currentWeek: number,
    field: keyof ProjectionDataPoint,
    windowSize: number = 4
  ): number | null {
    const key = `${playerId}_${position}`;
    const playerData = this.historicalData.get(key);
    
    if (!playerData) return null;
    
    // Get previous weeks' data
    const previousWeeks = playerData
      .filter(p => p.week < currentWeek && p.week >= currentWeek - windowSize)
      .map(p => p[field] as number)
      .filter(v => v !== undefined && v !== null);
    
    if (previousWeeks.length === 0) return null;
    
    return previousWeeks.reduce((sum, val) => sum + val, 0) / previousWeeks.length;
  }

  private categorizeError(dataPoint: ProjectionDataPoint): {
    reason: string;
    confidence: number;
    details: string;
  } {
    const { 
      player_id, position, projected_fp, actual_fp, touches = 0, targets = 0,
      depth_chart_rank_at_pred_time, opponent_def_rank, spread = 0,
      team_run_rate, team_pass_rate, week, injury_status = 'healthy'
    } = dataPoint;

    const absoluteError = Math.abs(projected_fp - actual_fp);
    const pctError = projected_fp > 0 ? Math.abs(actual_fp - projected_fp) / projected_fp * 100 : 100;

    // Only apply heuristics if error is significant (>15% or >5 points)
    if (pctError < 15 && absoluteError < 5) {
      return { reason: 'minor_variance', confidence: 0.9, details: 'Small error within expected range' };
    }

    // 1. Usage shift detection
    const trailingTouches = this.calculateTrailingMean(player_id, position, week, 'touches');
    const trailingTargets = this.calculateTrailingMean(player_id, position, week, 'targets');
    
    if (trailingTouches && touches > 0) {
      const touchesChange = Math.abs(touches - trailingTouches) / trailingTouches;
      if (touchesChange > 0.4) {
        const direction = touches > trailingTouches ? 'increased' : 'decreased';
        return {
          reason: 'usage_shift',
          confidence: 0.8,
          details: `Touches ${direction} ${(touchesChange * 100).toFixed(1)}% vs 4-week mean (${trailingTouches.toFixed(1)} to ${touches})`
        };
      }
    }

    if (['WR', 'TE', 'RB'].includes(position) && trailingTargets && targets > 0) {
      const targetsChange = Math.abs(targets - trailingTargets) / trailingTargets;
      if (targetsChange > 0.4) {
        const direction = targets > trailingTargets ? 'increased' : 'decreased';
        return {
          reason: 'usage_shift',
          confidence: 0.8,
          details: `Targets ${direction} ${(targetsChange * 100).toFixed(1)}% vs 4-week mean (${trailingTargets.toFixed(1)} to ${targets})`
        };
      }
    }

    // 2. Role change detection via depth chart
    if (depth_chart_rank_at_pred_time) {
      // Check if player was expected to be starter but wasn't (or vice versa)
      const wasExpectedStarter = depth_chart_rank_at_pred_time === 1;
      const performedLikeStarter = actual_fp > (position === 'QB' ? 15 : position === 'RB' ? 12 : 8);
      
      if (wasExpectedStarter && !performedLikeStarter && actual_fp < projected_fp * 0.3) {
        return {
          reason: 'role_change_depth',
          confidence: 0.85,
          details: `Expected starter (depth rank 1) but low production (${actual_fp.toFixed(1)} pts vs ${projected_fp.toFixed(1)} projected)`
        };
      }
      
      if (!wasExpectedStarter && performedLikeStarter && actual_fp > projected_fp * 2) {
        return {
          reason: 'role_change_depth',
          confidence: 0.85,
          details: `Backup (depth rank ${depth_chart_rank_at_pred_time}) outperformed projection significantly`
        };
      }
    }

    // 3. Opponent misrating
    if (opponent_def_rank) {
      // Convert rank to decile (1-10, where 1 = top 10%, 10 = bottom 10%)
      const oppDecile = Math.ceil(opponent_def_rank / 13); // Assuming ~130 FBS teams
      
      // Our stored defensive ratings would ideally be here, but we'll simulate
      // A simple heuristic: if opponent was supposed to be tough (decile 1-3) but player scored well
      if (oppDecile <= 3 && actual_fp > projected_fp * 1.5) {
        return {
          reason: 'opponent_misrate',
          confidence: 0.7,
          details: `Strong performance vs top-tier defense (rank ${opponent_def_rank}, decile ${oppDecile})`
        };
      }
      
      if (oppDecile >= 8 && actual_fp < projected_fp * 0.6) {
        return {
          reason: 'opponent_misrate',
          confidence: 0.7,
          details: `Poor performance vs weak defense (rank ${opponent_def_rank}, decile ${oppDecile})`
        };
      }
    }

    // 4. Game script / garbage time detection
    if (spread && Math.abs(spread) >= 21) {
      const teamFavored = spread < 0;
      
      if (team_run_rate && team_pass_rate) {
        // Get expected rates based on position
        const expectedRunRate = position === 'RB' ? 0.45 : 0.45; // baseline
        const expectedPassRate = ['QB', 'WR', 'TE'].includes(position) ? 0.55 : 0.55;
        
        const runRateDeviation = Math.abs(team_run_rate - expectedRunRate) / expectedRunRate;
        const passRateDeviation = Math.abs(team_pass_rate - expectedPassRate) / expectedPassRate;
        
        if (runRateDeviation > 0.25 || passRateDeviation > 0.25) {
          const scriptType = team_run_rate > expectedRunRate ? 'run-heavy' : 'pass-heavy';
          return {
            reason: 'garbage_time_script',
            confidence: 0.75,
            details: `Large spread (${spread}) led to ${scriptType} script, affecting ${position} usage`
          };
        }
      }
    }

    // 5. Data gaps
    const missingCriticalData = [
      !touches && ['RB', 'WR', 'TE'].includes(position) ? 'touches' : null,
      !targets && ['WR', 'TE', 'RB'].includes(position) ? 'targets' : null,
      injury_status === undefined ? 'injury_status' : null,
      !dataPoint.weather_conditions ? 'weather' : null,
      !depth_chart_rank_at_pred_time ? 'depth_chart' : null
    ].filter(Boolean);

    if (missingCriticalData.length > 1) {
      return {
        reason: 'data_gap',
        confidence: 0.6,
        details: `Missing critical data: ${missingCriticalData.join(', ')}`
      };
    }

    // 6. Injury impact
    if (injury_status !== 'healthy' && actual_fp < projected_fp * 0.7) {
      return {
        reason: 'injury_impact',
        confidence: 0.8,
        details: `Player listed as ${injury_status}, underperformed projection by ${((1 - actual_fp / projected_fp) * 100).toFixed(1)}%`
      };
    }

    // Default to "other" if no clear pattern
    return {
      reason: 'other',
      confidence: 0.3,
      details: `No clear pattern identified. Error: ${pctError.toFixed(1)}%, ${absoluteError.toFixed(1)} points`
    };
  }

  public auditErrors(): ErrorAnalysis[] {
    return this.data.map(dataPoint => {
      const { projected_fp, actual_fp } = dataPoint;
      const absoluteError = Math.abs(projected_fp - actual_fp);
      const pctError = projected_fp > 0 ? (Math.abs(actual_fp - projected_fp) / projected_fp) * 100 : 100;
      
      // SMAPE calculation (0-200 scale, lower is better)
      const smape = projected_fp + actual_fp > 0 
        ? (Math.abs(actual_fp - projected_fp) / ((Math.abs(actual_fp) + Math.abs(projected_fp)) / 2)) * 100
        : 0;

      const errorCategory = this.categorizeError(dataPoint);

      return {
        player_id: dataPoint.player_id,
        player_name: dataPoint.player_name,
        position: dataPoint.position,
        team: dataPoint.team,
        week: dataPoint.week,
        season: dataPoint.season,
        projected_fp: projected_fp,
        actual_fp: actual_fp,
        absolute_error: absoluteError,
        pct_error: pctError,
        smape: smape,
        reason_tag: errorCategory.reason,
        confidence_score: errorCategory.confidence,
        details: errorCategory.details
      };
    });
  }

  public generateSummary(analyses: ErrorAnalysis[]): AuditSummary {
    const totalPredictions = analyses.length;
    const avgAbsoluteError = analyses.reduce((sum, a) => sum + a.absolute_error, 0) / totalPredictions;
    const avgPctError = analyses.reduce((sum, a) => sum + a.pct_error, 0) / totalPredictions;
    const avgSmape = analyses.reduce((sum, a) => sum + a.smape, 0) / totalPredictions;

    // By position summary
    const byPosition: Record<string, any> = {};
    const positions = [...new Set(analyses.map(a => a.position))];
    
    for (const pos of positions) {
      const posAnalyses = analyses.filter(a => a.position === pos);
      byPosition[pos] = {
        count: posAnalyses.length,
        avg_absolute_error: posAnalyses.reduce((sum, a) => sum + a.absolute_error, 0) / posAnalyses.length,
        avg_pct_error: posAnalyses.reduce((sum, a) => sum + a.pct_error, 0) / posAnalyses.length,
        avg_smape: posAnalyses.reduce((sum, a) => sum + a.smape, 0) / posAnalyses.length
      };
    }

    // By reason summary
    const byReason: Record<string, any> = {};
    const reasons = [...new Set(analyses.map(a => a.reason_tag))];
    
    for (const reason of reasons) {
      const reasonAnalyses = analyses.filter(a => a.reason_tag === reason);
      byReason[reason] = {
        count: reasonAnalyses.length,
        avg_absolute_error: reasonAnalyses.reduce((sum, a) => sum + a.absolute_error, 0) / reasonAnalyses.length,
        pct_of_total: (reasonAnalyses.length / totalPredictions) * 100
      };
    }

    // Worst 20 predictions by percentage error
    const worstPredictions = analyses
      .sort((a, b) => b.pct_error - a.pct_error)
      .slice(0, 20);

    return {
      total_predictions: totalPredictions,
      avg_absolute_error: avgAbsoluteError,
      avg_pct_error: avgPctError,
      avg_smape: avgSmape,
      by_position: byPosition,
      by_reason: byReason,
      worst_predictions: worstPredictions
    };
  }
}

// Utility functions
function loadInputData(filePath: string): ProjectionDataPoint[] {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');

  if (ext === '.json') {
    return JSON.parse(content);
  } else if (ext === '.csv') {
    // Simple CSV parser
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      
      headers.forEach((header, i) => {
        const value = values[i];
        
        // Type conversion
        if (['projected_fp', 'actual_fp', 'touches', 'targets', 'minutes', 'snaps', 'spread', 'total', 'team_run_rate', 'team_pass_rate', 'opponent_def_rank'].includes(header)) {
          obj[header] = parseFloat(value) || 0;
        } else if (['week', 'season', 'depth_chart_rank_at_pred_time'].includes(header)) {
          obj[header] = parseInt(value) || 0;
        } else {
          obj[header] = value;
        }
      });
      
      return obj;
    });
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json or .csv`);
  }
}

async function writeParquetOutput(data: any, outputPath: string): Promise<void> {
  // For now, write as JSON since parquet requires additional dependencies
  // In production, you'd use apache-arrow or similar
  const jsonPath = outputPath.replace(/\.parquet$/, '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`Note: Output written as JSON to ${jsonPath} (parquet support requires additional dependencies)`);
}

// CLI setup
const program = new Command();

program
  .name('audit-projection-errors')
  .description('Audit CFB fantasy projection errors and categorize them')
  .version('1.0.0')
  .requiredOption('-i, --in <path>', 'Input CSV or JSON file path')
  .requiredOption('-o, --out <path>', 'Output path for audit results')
  .option('--format <format>', 'Output format (json|csv)', 'json')
  .action(async (options) => {
    try {
      console.log('🏈 CFB Fantasy Projection Error Auditor');
      console.log('====================================');
      
      // Load input data
      console.log(`📊 Loading data from: ${options.in}`);
      const inputData = loadInputData(options.in);
      console.log(`✅ Loaded ${inputData.length} prediction records`);
      
      // Create auditor and analyze
      console.log('🔍 Analyzing prediction errors...');
      const auditor = new ProjectionErrorAuditor(inputData);
      const errorAnalyses = auditor.auditErrors();
      const summary = auditor.generateSummary(errorAnalyses);
      
      // Print summary to console
      console.log('\n📈 AUDIT SUMMARY');
      console.log('================');
      console.log(`Total Predictions: ${summary.total_predictions}`);
      console.log(`Average Absolute Error: ${summary.avg_absolute_error.toFixed(2)} points`);
      console.log(`Average Percentage Error: ${summary.avg_pct_error.toFixed(1)}%`);
      console.log(`Average SMAPE: ${summary.avg_smape.toFixed(1)}`);
      
      console.log('\n📊 BY POSITION:');
      for (const [pos, stats] of Object.entries(summary.by_position)) {
        console.log(`  ${pos}: ${stats.count} predictions, ${stats.avg_pct_error.toFixed(1)}% avg error`);
      }
      
      console.log('\n🏷️  BY REASON:');
      for (const [reason, stats] of Object.entries(summary.by_reason)) {
        console.log(`  ${reason}: ${stats.count} cases (${stats.pct_of_total.toFixed(1)}%), ${stats.avg_absolute_error.toFixed(1)}pt avg error`);
      }
      
      console.log('\n💥 TOP 10 WORST PREDICTIONS:');
      summary.worst_predictions.slice(0, 10).forEach((pred, i) => {
        console.log(`  ${i + 1}. ${pred.player_name || pred.player_id} (${pred.position}) - ${pred.pct_error.toFixed(1)}% error (${pred.reason_tag})`);
      });
      
      // Write output
      const output = {
        summary,
        detailed_analyses: errorAnalyses,
        metadata: {
          generated_at: new Date().toISOString(),
          input_file: options.in,
          total_records: inputData.length,
          version: '1.0.0'
        }
      };
      
      if (options.format === 'json') {
        fs.writeFileSync(options.out, JSON.stringify(output, null, 2));
        console.log(`\n✅ Results written to: ${options.out}`);
      } else {
        await writeParquetOutput(output, options.out);
      }
      
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Export for testing
export { ProjectionErrorAuditor, type ProjectionDataPoint, type ErrorAnalysis };

// Run CLI if called directly
if (require.main === module) {
  program.parse();
}
