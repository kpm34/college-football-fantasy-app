/**
 * Report Generator
 * Creates comprehensive markdown reports for projection evaluation
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { EvaluationReport, TierEvaluation } from './types';
import { TierAnalyzer } from './tier-analysis';

export class ReportGenerator {
  
  /**
   * Generate comprehensive markdown report
   */
  static generateMarkdownReport(
    report: EvaluationReport,
    outputPath: string
  ): void {
    console.log(`📄 Generating markdown report: ${outputPath}`);
    
    // Ensure output directory exists
    mkdirSync(dirname(outputPath), { recursive: true });
    
    const markdown = this.buildMarkdownContent(report);
    writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`✅ Report saved: ${outputPath}`);
  }

  /**
   * Generate Parquet file for detailed analysis
   */
  static generateParquetReport(
    report: EvaluationReport,
    outputPath: string
  ): void {
    console.log(`📊 Generating parquet report: ${outputPath}`);
    
    // For now, we'll generate a JSON file that can be converted to Parquet
    // In a production system, you'd use a proper Parquet library
    const jsonOutputPath = outputPath.replace('.parquet', '.json');
    
    const detailedData = {
      metadata: {
        evaluation_date: report.evaluation_date,
        week_range: report.week_range,
        model_version: report.model_version
      },
      overall_metrics: report.overall_metrics,
      by_position: report.by_position,
      tier_details: report.by_tier.map(tier => ({
        position: tier.tier.position,
        tier_name: tier.tier.tier,
        tier_range: `${tier.tier.min_rank}-${tier.tier.max_rank}`,
        metrics: tier.metrics,
        predictions: tier.predictions
      })),
      calibration: report.calibration_curves,
      time_series: report.by_week
    };
    
    mkdirSync(dirname(jsonOutputPath), { recursive: true });
    writeFileSync(jsonOutputPath, JSON.stringify(detailedData, null, 2), 'utf8');
    
    console.log(`✅ Detailed data saved: ${jsonOutputPath}`);
    console.log(`💡 Convert to Parquet using: pandas.read_json('${jsonOutputPath}').to_parquet('${outputPath}')`);
  }

  /**
   * Build the complete markdown content
   */
  private static buildMarkdownContent(report: EvaluationReport): string {
    const sections = [
      this.generateHeader(report),
      this.generateExecutiveSummary(report),
      this.generateOverallMetrics(report),
      this.generatePositionBreakdown(report),
      this.generateTierAnalysis(report),
      this.generateCalibrationAnalysis(report),
      this.generateTimeSeriesAnalysis(report),
      this.generateRecommendations(report),
      this.generateFooter(report)
    ];

    return sections.join('\n\n');
  }

  private static generateHeader(report: EvaluationReport): string {
    const startDate = `${report.week_range.startSeason}W${report.week_range.startWeek}`;
    const endDate = `${report.week_range.endSeason}W${report.week_range.endWeek}`;
    
    return `# Projection Model Evaluation Report

**Evaluation Period:** ${startDate} to ${endDate}  
**Generated:** ${report.evaluation_date}  
**Model Version:** ${report.model_version || 'Current'}  

---`;
  }

  private static generateExecutiveSummary(report: EvaluationReport): string {
    const overallMAE = report.overall_metrics.mae.toFixed(2);
    const overallSMAPE = report.overall_metrics.smape.toFixed(1);
    const overallR2 = report.overall_metrics.r2.toFixed(3);
    
    // Find best and worst performing positions
    const positionMetrics = Object.entries(report.by_position);
    let bestPosition = null;
    let worstPosition = null;
    
    if (positionMetrics.length > 0) {
      bestPosition = positionMetrics.reduce((best, [pos, metrics]) => 
        !best || metrics.mae < best.metrics.mae ? { position: pos, metrics } : best
      , null);
      worstPosition = positionMetrics.reduce((worst, [pos, metrics]) => 
        !worst || metrics.mae > worst.metrics.mae ? { position: pos, metrics } : worst
      , null);
    }

    return `## Executive Summary

### Key Metrics
- **Overall MAE:** ${overallMAE} fantasy points
- **Overall sMAPE:** ${overallSMAPE}%
- **Overall R²:** ${overallR2}
- **Total Predictions:** ${report.overall_metrics.n_predictions.toLocaleString()}
- **Unique Players:** ${report.overall_metrics.n_players.toLocaleString()}

### Position Performance
${bestPosition && worstPosition ? 
  `- **Best Performing:** ${bestPosition.position} (MAE: ${bestPosition.metrics.mae.toFixed(2)})
- **Worst Performing:** ${worstPosition.position} (MAE: ${worstPosition.metrics.mae.toFixed(2)})` :
  '- Position analysis not available (no data)'
}

### Calibration
${report.overall_metrics.calibration_slope !== undefined ? 
  `- **Calibration Slope:** ${report.overall_metrics.calibration_slope.toFixed(3)} (ideal: 1.000)
- **Reliability Score:** ${report.overall_metrics.reliability_score?.toFixed(3) || 'N/A'}` :
  '- Calibration analysis not available'
}`;
  }

  private static generateOverallMetrics(report: EvaluationReport): string {
    return `## Overall Model Performance

| Metric | Value | Interpretation |
|--------|-------|----------------|
| Mean Absolute Error (MAE) | ${report.overall_metrics.mae.toFixed(2)} | Average prediction error |
| Symmetric MAPE (sMAPE) | ${report.overall_metrics.smape.toFixed(1)}% | Percentage error |
| R-squared (R²) | ${report.overall_metrics.r2.toFixed(3)} | Correlation strength |
| Root MSE (RMSE) | ${report.overall_metrics.rmse.toFixed(2)} | Prediction variability |
| Sample Size | ${report.overall_metrics.n_predictions.toLocaleString()} | Total predictions |`;
  }

  private static generatePositionBreakdown(report: EvaluationReport): string {
    let table = `## Performance by Position

| Position | MAE | sMAPE | R² | Sample Size | Avg Error |
|----------|-----|-------|----|-----------|-----------|\n`;

    const sortedPositions = Object.entries(report.by_position)
      .sort(([,a], [,b]) => a.mae - b.mae);

    for (const [position, metrics] of sortedPositions) {
      const mae = metrics.mae.toFixed(2);
      const smape = metrics.smape.toFixed(1);
      const r2 = metrics.r2.toFixed(3);
      const sampleSize = metrics.n_predictions.toLocaleString();
      const avgError = 'N/A'; // Could calculate if needed
      
      table += `| ${position} | ${mae} | ${smape}% | ${r2} | ${sampleSize} | ${avgError} |\n`;
    }

    return table;
  }

  private static generateTierAnalysis(report: EvaluationReport): string {
    if (!report.by_tier || report.by_tier.length === 0) {
      return `## Tier Analysis

*No tier analysis available.*`;
    }

    const tierComparison = TierAnalyzer.generateTierComparison(report.by_tier);
    
    let section = `## Fantasy Tier Analysis

### Overall Tier Performance

| Position | Tier | Players | MAE | sMAPE | R² | Avg Pred | Avg Actual | Bias |
|----------|------|---------|-----|-------|-------|----------|------------|------|
`;

    tierComparison.forEach(tier => {
      const mae = tier.mae.toFixed(2);
      const smape = tier.smape.toFixed(1);
      const r2 = tier.r2.toFixed(3);
      const avgPred = tier.avg_predicted.toFixed(1);
      const avgActual = tier.avg_actual.toFixed(1);
      const bias = tier.bias.toFixed(2);
      
      section += `| ${tier.position} | ${tier.tier} | ${tier.n_players} | ${mae} | ${smape}% | ${r2} | ${avgPred} | ${avgActual} | ${bias} |\n`;
    });

    // Add worst performing tiers
    const worstMAE = TierAnalyzer.identifyWorstPerformingTiers(report.by_tier, 'mae', 3);
    const worstR2 = TierAnalyzer.identifyWorstPerformingTiers(report.by_tier, 'r2', 3);

    section += `\n### Areas for Improvement

**Highest MAE (Worst Accuracy):**
`;
    worstMAE.forEach((item, index) => {
      section += `${index + 1}. ${item.tier.position} ${item.tier.tier}: ${item.metric_value.toFixed(2)} MAE\n`;
    });

    section += `\n**Lowest R² (Worst Correlation):**
`;
    worstR2.forEach((item, index) => {
      section += `${index + 1}. ${item.tier.position} ${item.tier.tier}: ${item.metric_value.toFixed(3)} R²\n`;
    });

    return section;
  }

  private static generateCalibrationAnalysis(report: EvaluationReport): string {
    if (!report.calibration_curves || report.calibration_curves.length === 0) {
      return `## Calibration Analysis

*Calibration analysis not available.*`;
    }

    let section = `## Calibration Analysis

Calibration measures how well predicted values match actual values across different ranges.

### Calibration by Position

| Position | Slope | Intercept | Quality |
|----------|-------|-----------|---------|
`;

    report.calibration_curves.forEach(curve => {
      // This is simplified - in practice you'd calculate slope/intercept from the data
      section += `| ${curve.position} | - | - | - |\n`;
    });

    section += `\n**Interpretation:**
- Slope close to 1.0 = good calibration
- Intercept close to 0.0 = no systematic bias
- Quality score combines both metrics`;

    return section;
  }

  private static generateTimeSeriesAnalysis(report: EvaluationReport): string {
    if (!report.by_week || report.by_week.length === 0) {
      return `## Time Series Analysis

*Time series analysis not available.*`;
    }

    let section = `## Performance Over Time

| Week | MAE | sMAPE | R² | Sample Size |
|------|-----|-------|----|-----------|\n`;

    report.by_week.slice(-8).forEach(week => { // Show last 8 weeks
      const mae = week.metrics.mae.toFixed(2);
      const smape = week.metrics.smape.toFixed(1);
      const r2 = week.metrics.r2.toFixed(3);
      const size = week.metrics.n_predictions.toLocaleString();
      
      section += `| ${week.season}W${week.week} | ${mae} | ${smape}% | ${r2} | ${size} |\n`;
    });

    return section;
  }

  private static generateRecommendations(report: EvaluationReport): string {
    const recommendations: string[] = [];
    
    // MAE-based recommendations
    if (report.overall_metrics.mae > 15) {
      recommendations.push("🎯 **High Priority:** Overall MAE > 15 points suggests significant prediction errors. Focus on model recalibration.");
    }
    
    // R² based recommendations  
    if (report.overall_metrics.r2 < 0.3) {
      recommendations.push("📈 **Model Correlation:** R² < 0.3 indicates weak predictive power. Consider feature engineering or model architecture changes.");
    }

    // Position-specific recommendations
    const positionMetrics = Object.entries(report.by_position);
    const highErrorPositions = positionMetrics.filter(([, metrics]) => metrics.mae > 20);
    
    if (highErrorPositions.length > 0) {
      const positions = highErrorPositions.map(([pos]) => pos).join(', ');
      recommendations.push(`⚠️ **Position Focus:** High error in ${positions}. Review position-specific features and modeling approach.`);
    }

    // Tier-based recommendations
    if (report.by_tier) {
      const improvement = TierAnalyzer.calculateImprovementNeeded(report.by_tier, 0.10);
      const needImprovement = improvement.filter(t => !t.meets_target);
      
      if (needImprovement.length > 0) {
        recommendations.push(`🎖️ **Tier Improvement:** ${needImprovement.length} tiers need >10% MAE improvement to meet targets.`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Model performance is within acceptable ranges. Consider minor optimizations for continued improvement.");
    }

    return `## Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

### Target Metrics for Next Iteration
- **MAE Target:** Reduce overall MAE by ≥10%
- **Focus Areas:** RB and WR tiers showing highest errors
- **Calibration:** Maintain current calibration quality while improving accuracy`;
  }

  private static generateFooter(report: EvaluationReport): string {
    return `---

*This report was automatically generated by the Projection Evaluation System.*  
*For technical details, see the evaluation configuration and methodology documentation.*`;
  }

  /**
   * Generate a quick summary for command line output
   */
  static generateConsoleSummary(report: EvaluationReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PROJECTION EVALUATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Period: ${report.week_range.startSeason}W${report.week_range.startWeek} to ${report.week_range.endSeason}W${report.week_range.endWeek}`);
    console.log(`Total Predictions: ${report.overall_metrics.n_predictions.toLocaleString()}`);
    console.log(`Unique Players: ${report.overall_metrics.n_players.toLocaleString()}`);
    console.log('');
    
    console.log('🎯 OVERALL METRICS:');
    console.log(`  MAE:   ${report.overall_metrics.mae.toFixed(2)} points`);
    console.log(`  sMAPE: ${report.overall_metrics.smape.toFixed(1)}%`);
    console.log(`  R²:    ${report.overall_metrics.r2.toFixed(3)}`);
    console.log('');
    
    if (Object.keys(report.by_position).length > 0) {
      console.log('📈 BY POSITION:');
      const sortedPositions = Object.entries(report.by_position)
        .sort(([,a], [,b]) => a.mae - b.mae);
      
      sortedPositions.forEach(([position, metrics]) => {
        console.log(`  ${position.padEnd(4)}: MAE ${metrics.mae.toFixed(2)}, R² ${metrics.r2.toFixed(3)}`);
      });
      console.log('');
    }
    
    if (report.by_tier && report.by_tier.length > 0) {
      const worstTiers = TierAnalyzer.identifyWorstPerformingTiers(report.by_tier, 'mae', 3);
      console.log('⚠️  WORST PERFORMING TIERS:');
      worstTiers.forEach((tier, index) => {
        console.log(`  ${index + 1}. ${tier.tier.position} ${tier.tier.tier}: ${tier.metric_value.toFixed(2)} MAE`);
      });
    }
    
    console.log('='.repeat(60));
  }
}