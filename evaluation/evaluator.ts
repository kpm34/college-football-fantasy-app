/**
 * Main Projection Evaluator
 * Coordinates data loading, analysis, and report generation
 */

import { ProjectionDataLoader } from './data-loader';
import { TierAnalyzer } from './tier-analysis';
import { MetricsCalculator } from './metrics';
import { ReportGenerator } from './report-generator';
import { 
  EvaluationConfig, 
  EvaluationReport, 
  WeekRange, 
  PlayerProjection, 
  ActualPerformance 
} from './types';
import { Databases } from 'node-appwrite';

export class ProjectionEvaluator {
  private dataLoader: ProjectionDataLoader;

  constructor(
    private databases: Databases,
    private databaseId: string
  ) {
    this.dataLoader = new ProjectionDataLoader(databases, databaseId);
  }

  /**
   * Run complete evaluation workflow
   */
  async evaluate(config: EvaluationConfig): Promise<EvaluationReport> {
    console.log('🚀 Starting projection evaluation...');
    console.log(`📅 Period: ${config.week_range.startSeason}W${config.week_range.startWeek} to ${config.week_range.endSeason}W${config.week_range.endWeek}`);
    console.log(`📍 Positions: ${config.positions.join(', ')}`);
    
    // Step 1: Load data
    console.log('\n📊 Loading data...');
    const predictions = await this.loadPredictions(config.week_range);
    const actuals = await this.loadActuals(config.week_range);
    
    if (predictions.length === 0) {
      throw new Error('No prediction data found for the specified period');
    }
    
    if (actuals.length === 0) {
      throw new Error('No actual performance data found for the specified period');
    }

    // Step 2: Match predictions with actuals
    console.log('🔗 Matching predictions with actual performance...');
    const playerPerformances = TierAnalyzer.matchPredictionsWithActuals(predictions, actuals);
    
    if (playerPerformances.length === 0) {
      throw new Error('No matching prediction-actual pairs found');
    }

    // Filter by requested positions
    const filteredPerformances = playerPerformances.filter(p => 
      config.positions.length === 0 || config.positions.includes(p.position)
    );

    console.log(`✅ Matched ${filteredPerformances.length} player performances`);

    // Step 3: Rank players and assign tiers
    console.log('🏆 Ranking players and assigning fantasy tiers...');
    const rankedPlayers = TierAnalyzer.assignFantasyRanks(filteredPerformances);

    // Step 4: Calculate overall metrics
    console.log('📈 Calculating overall metrics...');
    const overallDataPoints = rankedPlayers.map(p => ({
      predicted: p.predicted_avg,
      actual: p.actual_avg,
      player_id: p.player_id
    }));
    
    const overallMetrics = MetricsCalculator.calculateMetrics(overallDataPoints);

    // Step 5: Calculate position-specific metrics
    console.log('📊 Analyzing by position...');
    const byPosition: Record<string, any> = {};
    
    for (const position of [...new Set(rankedPlayers.map(p => p.position))]) {
      const positionPlayers = rankedPlayers.filter(p => p.position === position);
      const positionDataPoints = positionPlayers.map(p => ({
        predicted: p.predicted_avg,
        actual: p.actual_avg,
        player_id: p.player_id
      }));
      
      byPosition[position] = MetricsCalculator.calculateMetrics(positionDataPoints);
    }

    // Step 6: Analyze by tier
    console.log('🎯 Performing tier analysis...');
    const tierEvaluations = TierAnalyzer.analyzeByTier(
      rankedPlayers,
      TierAnalyzer.getStandardTiers(),
      config.min_predictions_per_tier
    );

    // Step 7: Time series analysis (if requested)
    let byWeek: any[] | undefined;
    if (config.include_time_series) {
      console.log('📈 Performing time series analysis...');
      byWeek = await this.performTimeSeriesAnalysis(config.week_range, predictions, actuals);
    }

    // Step 8: Calibration analysis (if requested)
    let calibrationCurves: any[] | undefined;
    if (config.include_calibration) {
      console.log('🎚️ Performing calibration analysis...');
      calibrationCurves = this.performCalibrationAnalysis(rankedPlayers);
    }

    // Step 9: Generate report
    const report: EvaluationReport = {
      evaluation_date: new Date().toISOString(),
      week_range: config.week_range,
      model_version: 'Current',
      overall_metrics: overallMetrics,
      by_position: byPosition,
      by_tier: tierEvaluations,
      by_week: byWeek,
      calibration_curves: calibrationCurves
    };

    // Step 10: Output reports
    console.log('📄 Generating reports...');
    await this.generateReports(report, config);

    console.log('✅ Evaluation completed successfully!');
    return report;
  }

  /**
   * Load predictions based on evaluation period
   */
  private async loadPredictions(weekRange: WeekRange): Promise<PlayerProjection[]> {
    // For weekly evaluation, load weekly projections
    if (this.isWeeklyEvaluation(weekRange)) {
      return await this.dataLoader.loadWeeklyProjections(weekRange);
    }
    
    // For season-long evaluation, load yearly projections
    const seasons = this.extractSeasonsFromRange(weekRange);
    return await this.dataLoader.loadYearlyProjections(seasons);
  }

  /**
   * Load actual performance data
   */
  private async loadActuals(weekRange: WeekRange): Promise<ActualPerformance[]> {
    return await this.dataLoader.loadActualPerformance(weekRange);
  }

  /**
   * Perform time series analysis
   */
  private async performTimeSeriesAnalysis(
    weekRange: WeekRange,
    predictions: PlayerProjection[],
    actuals: ActualPerformance[]
  ): Promise<Array<{ season: number; week: number; metrics: any }>> {
    
    const weeklyResults: Array<{ season: number; week: number; metrics: any }> = [];
    
    // Group data by week
    const weeks = this.generateWeekList(weekRange);
    
    for (const { season, week } of weeks) {
      const weekPredictions = predictions.filter(p => 
        p.season === season && p.week === week
      );
      
      const weekActuals = actuals.filter(a => 
        a.season === season && a.week === week
      );
      
      if (weekPredictions.length > 0 && weekActuals.length > 0) {
        const weekPerformances = TierAnalyzer.matchPredictionsWithActuals(
          weekPredictions, 
          weekActuals
        );
        
        if (weekPerformances.length > 0) {
          const dataPoints = weekPerformances.map(p => ({
            predicted: p.predicted_avg,
            actual: p.actual_avg,
            player_id: p.player_id
          }));
          
          const weekMetrics = MetricsCalculator.calculateMetrics(dataPoints);
          
          weeklyResults.push({
            season,
            week,
            metrics: weekMetrics
          });
        }
      }
    }
    
    return weeklyResults;
  }

  /**
   * Perform calibration analysis
   */
  private performCalibrationAnalysis(
    playerPerformances: any[]
  ): Array<{ position: string; predicted_percentiles: number[]; actual_percentiles: number[] }> {
    
    const calibrationCurves: any[] = [];
    const positions = [...new Set(playerPerformances.map(p => p.position))];
    
    for (const position of positions) {
      const positionPlayers = playerPerformances.filter(p => p.position === position);
      
      if (positionPlayers.length >= 10) {
        const dataPoints = positionPlayers.map(p => ({
          predicted: p.predicted_avg,
          actual: p.actual_avg,
          player_id: p.player_id
        }));
        
        const calibration = MetricsCalculator.calculateCalibration(dataPoints);
        
        calibrationCurves.push({
          position,
          predicted_percentiles: calibration.predicted_percentiles,
          actual_percentiles: calibration.actual_percentiles
        });
      }
    }
    
    return calibrationCurves;
  }

  /**
   * Generate output reports in requested formats
   */
  private async generateReports(report: EvaluationReport, config: EvaluationConfig): Promise<void> {
    if (config.output_formats.includes('markdown')) {
      const mdPath = config.output_path.replace(/\.[^/.]+$/, '.md');
      ReportGenerator.generateMarkdownReport(report, mdPath);
    }
    
    if (config.output_formats.includes('parquet')) {
      const parquetPath = config.output_path.replace(/\.[^/.]+$/, '.parquet');
      ReportGenerator.generateParquetReport(report, parquetPath);
    }
    
    if (config.output_formats.includes('json')) {
      const jsonPath = config.output_path.replace(/\.[^/.]+$/, '.json');
      const fs = await import('fs');
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`✅ JSON report saved: ${jsonPath}`);
    }
    
    // Always show console summary
    ReportGenerator.generateConsoleSummary(report);
  }

  /**
   * Helper methods
   */
  private isWeeklyEvaluation(weekRange: WeekRange): boolean {
    // If evaluating multiple weeks, it's weekly evaluation
    return !(weekRange.startSeason === weekRange.endSeason && 
             weekRange.startWeek === 1 && weekRange.endWeek >= 15);
  }

  private extractSeasonsFromRange(weekRange: WeekRange): number[] {
    const seasons: number[] = [];
    for (let season = weekRange.startSeason; season <= weekRange.endSeason; season++) {
      seasons.push(season);
    }
    return seasons;
  }

  private generateWeekList(weekRange: WeekRange): Array<{ season: number; week: number }> {
    const weeks: Array<{ season: number; week: number }> = [];
    
    for (let season = weekRange.startSeason; season <= weekRange.endSeason; season++) {
      let startWeek = season === weekRange.startSeason ? weekRange.startWeek : 1;
      let endWeek = season === weekRange.endSeason ? weekRange.endWeek : 15;
      
      for (let week = startWeek; week <= endWeek; week++) {
        weeks.push({ season, week });
      }
    }
    
    return weeks;
  }

  /**
   * Static method to create evaluator from environment
   */
  static async createFromEnvironment(): Promise<ProjectionEvaluator> {
    const { serverDatabases, DATABASE_ID } = await import('../lib/appwrite-server');
    return new ProjectionEvaluator(serverDatabases, DATABASE_ID);
  }
}