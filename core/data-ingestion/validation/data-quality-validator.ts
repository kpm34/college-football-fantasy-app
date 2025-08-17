/**
 * Data Quality Validator
 * 
 * Comprehensive validation system that ensures data integrity and
 * quality throughout the ingestion pipeline. Includes:
 * - Schema validation
 * - Business rule validation  
 * - Data consistency checks
 * - Anomaly detection
 * - Quality scoring and reporting
 */

import { ResolvedRecord } from '../resolver/conflict-resolver';
import { serverDatabases as databases, DATABASE_ID } from '../../../lib/appwrite-server';
import { Query } from 'node-appwrite';

export interface ValidationRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'schema' | 'business' | 'consistency' | 'anomaly';
  severity: 'critical' | 'error' | 'warning' | 'info';
  description: string;
  validator: (record: ResolvedRecord, context?: ValidationContext) => ValidationResult;
}

export interface ValidationContext {
  season: number;
  week: number;
  team_context?: any;
  historical_data?: ResolvedRecord[];
  league_averages?: Record<string, number>;
  position_benchmarks?: Record<string, Record<string, number>>;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0.0-1.0
  message: string;
  details?: any;
  suggested_fix?: string;
}

export interface RecordQualityReport {
  record_id: string;
  player_id: string;
  overall_score: number;
  validation_results: Array<{
    rule_id: string;
    rule_name: string;
    severity: string;
    passed: boolean;
    score: number;
    message: string;
    suggested_fix?: string;
  }>;
  quality_flags: string[];
  confidence_adjustment: number; // How much to adjust final confidence
}

export interface DatasetQualityReport {
  dataset_id: string;
  season: number;
  week: number;
  total_records: number;
  validated_records: number;
  overall_quality_score: number;
  quality_distribution: {
    excellent: number; // 0.9+
    good: number;      // 0.7-0.89
    fair: number;      // 0.5-0.69
    poor: number;      // 0.3-0.49
    critical: number;  // <0.3
  };
  rule_violations: Record<string, number>;
  common_issues: Array<{
    issue_type: string;
    count: number;
    severity: string;
    example_message: string;
  }>;
  recommendations: string[];
  created_at: string;
}

export class DataQualityValidator {
  private validationRules: Map<string, ValidationRule> = new Map();
  private context: ValidationContext | null = null;

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Initialize validation context with historical data and benchmarks
   */
  async initializeContext(season: number, week: number): Promise<void> {
    console.log(`[DataQualityValidator] Initializing validation context for ${season}W${week}...`);
    
    try {
      // Load historical data for trend analysis
      const historicalData = await this.loadHistoricalData(season, week);
      
      // Calculate league-wide averages
      const leagueAverages = this.calculateLeagueAverages(historicalData);
      
      // Calculate position-specific benchmarks
      const positionBenchmarks = this.calculatePositionBenchmarks(historicalData);
      
      this.context = {
        season,
        week,
        historical_data: historicalData,
        league_averages: leagueAverages,
        position_benchmarks: positionBenchmarks
      };
      
      console.log(`[DataQualityValidator] Context initialized with ${historicalData.length} historical records`);
      
    } catch (error) {
      console.warn('[DataQualityValidator] Failed to initialize full context:', error);
      this.context = { season, week }; // Minimal context
    }
  }

  /**
   * Validate a single record
   */
  async validateRecord(record: ResolvedRecord): Promise<RecordQualityReport> {
    const validationResults: RecordQualityReport['validation_results'] = [];
    const qualityFlags: string[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // Run all validation rules
    for (const rule of this.validationRules.values()) {
      try {
        const result = rule.validator(record, this.context || undefined);
        
        validationResults.push({
          rule_id: rule.rule_id,
          rule_name: rule.rule_name,
          severity: rule.severity,
          passed: result.passed,
          score: result.score,
          message: result.message,
          suggested_fix: result.suggested_fix
        });

        // Weight scores by severity
        const severityWeight = this.getSeverityWeight(rule.severity);
        totalScore += result.score * severityWeight;
        maxPossibleScore += severityWeight;

        // Add quality flags for failed critical/error rules
        if (!result.passed && (rule.severity === 'critical' || rule.severity === 'error')) {
          qualityFlags.push(rule.rule_id);
        }

      } catch (error) {
        console.warn(`[DataQualityValidator] Rule ${rule.rule_id} failed to execute:`, error);
        
        validationResults.push({
          rule_id: rule.rule_id,
          rule_name: rule.rule_name,
          severity: 'error',
          passed: false,
          score: 0,
          message: `Validation rule execution failed: ${error instanceof Error ? error.message : String(error)}`
        });
        
        qualityFlags.push(`rule_execution_failed_${rule.rule_id}`);
      }
    }

    const overallScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
    const confidenceAdjustment = this.calculateConfidenceAdjustment(overallScore, qualityFlags);

    return {
      record_id: record.player_id,
      player_id: record.player_id,
      overall_score: overallScore,
      validation_results: validationResults,
      quality_flags: qualityFlags,
      confidence_adjustment: confidenceAdjustment
    };
  }

  /**
   * Validate a dataset of records
   */
  async validateDataset(records: ResolvedRecord[], datasetId: string): Promise<DatasetQualityReport> {
    console.log(`[DataQualityValidator] Validating dataset ${datasetId} with ${records.length} records...`);
    
    const startTime = Date.now();
    const recordReports: RecordQualityReport[] = [];
    const ruleViolations: Record<string, number> = {};
    
    // Validate each record
    for (const record of records) {
      const report = await this.validateRecord(record);
      recordReports.push(report);
      
      // Count rule violations
      for (const result of report.validation_results) {
        if (!result.passed) {
          ruleViolations[result.rule_id] = (ruleViolations[result.rule_id] || 0) + 1;
        }
      }
    }

    // Calculate overall statistics
    const qualityDistribution = this.calculateQualityDistribution(recordReports);
    const overallQualityScore = recordReports.reduce((sum, r) => sum + r.overall_score, 0) / recordReports.length;
    const commonIssues = this.identifyCommonIssues(recordReports);
    const recommendations = this.generateRecommendations(recordReports, ruleViolations);

    const report: DatasetQualityReport = {
      dataset_id: datasetId,
      season: this.context?.season || 0,
      week: this.context?.week || 0,
      total_records: records.length,
      validated_records: recordReports.length,
      overall_quality_score: overallQualityScore,
      quality_distribution: qualityDistribution,
      rule_violations: ruleViolations,
      common_issues: commonIssues,
      recommendations,
      created_at: new Date().toISOString()
    };

    const duration = Date.now() - startTime;
    console.log(`[DataQualityValidator] Dataset validation completed in ${duration}ms: ${overallQualityScore.toFixed(3)} score`);

    return report;
  }

  /**
   * Get validation rules summary
   */
  getValidationRules(): Array<{
    rule_id: string;
    rule_name: string;
    rule_type: string;
    severity: string;
    description: string;
  }> {
    return Array.from(this.validationRules.values()).map(rule => ({
      rule_id: rule.rule_id,
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      severity: rule.severity,
      description: rule.description
    }));
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.rule_id, rule);
    console.log(`[DataQualityValidator] Added custom rule: ${rule.rule_id}`);
  }

  /**
   * Initialize built-in validation rules
   */
  private initializeValidationRules(): void {
    // Schema validation rules
    this.validationRules.set('schema_required_fields', {
      rule_id: 'schema_required_fields',
      rule_name: 'Required Fields Present',
      rule_type: 'schema',
      severity: 'critical',
      description: 'Validates that all required fields are present and non-null',
      validator: (record) => {
        const requiredFields = ['player_id', 'team_id', 'position', 'depth_chart_rank'];
        const missing = requiredFields.filter(field => !record[field as keyof ResolvedRecord]);
        
        return {
          passed: missing.length === 0,
          score: missing.length === 0 ? 1.0 : 0.0,
          message: missing.length === 0 
            ? 'All required fields present' 
            : `Missing required fields: ${missing.join(', ')}`,
          suggested_fix: missing.length > 0 ? `Add missing fields: ${missing.join(', ')}` : undefined
        };
      }
    });

    this.validationRules.set('schema_value_ranges', {
      rule_id: 'schema_value_ranges',
      rule_name: 'Value Ranges Valid',
      rule_type: 'schema',
      severity: 'error',
      description: 'Validates that numeric values are within expected ranges',
      validator: (record) => {
        const issues: string[] = [];
        
        if (record.depth_chart_rank < 1 || record.depth_chart_rank > 10) {
          issues.push(`depth_chart_rank: ${record.depth_chart_rank}`);
        }
        
        if (record.starter_prob < 0 || record.starter_prob > 1) {
          issues.push(`starter_prob: ${record.starter_prob}`);
        }
        
        if (record.usage_1w_snap_pct < 0 || record.usage_1w_snap_pct > 1) {
          issues.push(`usage_1w_snap_pct: ${record.usage_1w_snap_pct}`);
        }
        
        return {
          passed: issues.length === 0,
          score: issues.length === 0 ? 1.0 : Math.max(0, 1.0 - issues.length * 0.2),
          message: issues.length === 0 
            ? 'All values within valid ranges' 
            : `Invalid ranges: ${issues.join(', ')}`,
          suggested_fix: issues.length > 0 ? 'Check data source for out-of-range values' : undefined
        };
      }
    });

    // Business rule validations
    this.validationRules.set('business_starter_logic', {
      rule_id: 'business_starter_logic',
      rule_name: 'Starter Logic Consistency',
      rule_type: 'business',
      severity: 'warning',
      description: 'Validates that starter probability aligns with depth chart rank',
      validator: (record) => {
        const { depth_chart_rank, starter_prob } = record;
        
        // Expected starter probability ranges by depth chart rank
        const expectedRanges: Record<number, [number, number]> = {
          1: [0.7, 1.0],    // Starters should have high probability
          2: [0.15, 0.5],   // Backups moderate probability
          3: [0.05, 0.25],  // Third string low probability
        };
        
        const range = expectedRanges[depth_chart_rank] || [0, 0.1];
        const inRange = starter_prob >= range[0] && starter_prob <= range[1];
        
        return {
          passed: inRange,
          score: inRange ? 1.0 : Math.max(0.3, 1.0 - Math.abs(starter_prob - (range[0] + range[1]) / 2)),
          message: inRange 
            ? 'Starter probability aligns with depth rank'
            : `Starter prob ${starter_prob.toFixed(2)} unexpected for depth rank ${depth_chart_rank}`,
          suggested_fix: !inRange ? 'Review depth chart or starter probability calculation' : undefined
        };
      }
    });

    this.validationRules.set('business_injury_consistency', {
      rule_id: 'business_injury_consistency',
      rule_name: 'Injury Status Consistency',
      rule_type: 'business',
      severity: 'warning',
      description: 'Validates that injury status aligns with usage projections',
      validator: (record) => {
        const { injury_status, usage_1w_snap_pct } = record;
        
        // Players listed as OUT should have very low usage projections
        if (injury_status === 'OUT' && usage_1w_snap_pct > 0.1) {
          return {
            passed: false,
            score: 0.5,
            message: `Player marked OUT but projected for ${(usage_1w_snap_pct * 100).toFixed(1)}% snaps`,
            suggested_fix: 'Review injury status or adjust usage projections'
          };
        }
        
        // Questionable players should have reduced usage
        if (injury_status === 'QUESTIONABLE' && usage_1w_snap_pct > 0.8) {
          return {
            passed: false,
            score: 0.7,
            message: `Questionable player projected for high usage (${(usage_1w_snap_pct * 100).toFixed(1)}%)`,
            suggested_fix: 'Consider reducing usage projection for injured player'
          };
        }
        
        return {
          passed: true,
          score: 1.0,
          message: 'Injury status consistent with usage projections'
        };
      }
    });

    // Consistency validation rules
    this.validationRules.set('consistency_usage_trends', {
      rule_id: 'consistency_usage_trends',
      rule_name: 'Usage Trend Consistency',
      rule_type: 'consistency',
      severity: 'info',
      description: 'Validates that usage trends are internally consistent',
      validator: (record) => {
        const { usage_1w_snap_pct, usage_4w_snap_pct } = record;
        
        // 1-week and 4-week usage should be reasonably close unless there's a trend
        const difference = Math.abs(usage_1w_snap_pct - usage_4w_snap_pct);
        const maxExpectedDiff = 0.3; // 30% difference is acceptable
        
        const consistent = difference <= maxExpectedDiff;
        
        return {
          passed: consistent,
          score: consistent ? 1.0 : Math.max(0.5, 1.0 - (difference - maxExpectedDiff) * 2),
          message: consistent 
            ? 'Usage trends are consistent'
            : `Large variance between 1w (${(usage_1w_snap_pct * 100).toFixed(1)}%) and 4w (${(usage_4w_snap_pct * 100).toFixed(1)}%) usage`,
          details: { usage_difference: difference },
          suggested_fix: !consistent ? 'Review for recent usage pattern changes' : undefined
        };
      }
    });

    // Anomaly detection rules
    this.validationRules.set('anomaly_extreme_values', {
      rule_id: 'anomaly_extreme_values',
      rule_name: 'Extreme Value Detection',
      rule_type: 'anomaly',
      severity: 'warning',
      description: 'Detects statistically unusual values that may indicate data issues',
      validator: (record, context) => {
        if (!context?.position_benchmarks) {
          return {
            passed: true,
            score: 1.0,
            message: 'No benchmarks available for anomaly detection'
          };
        }
        
        const positionBenchmarks = context.position_benchmarks[record.position];
        if (!positionBenchmarks) {
          return {
            passed: true,
            score: 1.0,
            message: `No benchmarks available for position ${record.position}`
          };
        }
        
        const anomalies: string[] = [];
        
        // Check for extreme starter probabilities
        const avgStarterProb = positionBenchmarks.avg_starter_prob || 0.3;
        const starterProbDeviation = Math.abs(record.starter_prob - avgStarterProb) / avgStarterProb;
        
        if (starterProbDeviation > 2.0 && record.starter_prob > 0.1) { // Only flag if not clearly a bench player
          anomalies.push(`starter_prob: ${record.starter_prob.toFixed(2)} vs avg ${avgStarterProb.toFixed(2)}`);
        }
        
        return {
          passed: anomalies.length === 0,
          score: anomalies.length === 0 ? 1.0 : 0.7,
          message: anomalies.length === 0 
            ? 'No statistical anomalies detected'
            : `Potential anomalies: ${anomalies.join('; ')}`,
          suggested_fix: anomalies.length > 0 ? 'Verify data source accuracy for unusual values' : undefined
        };
      }
    });

    console.log(`[DataQualityValidator] Initialized ${this.validationRules.size} validation rules`);
  }

  private async loadHistoricalData(season: number, week: number): Promise<ResolvedRecord[]> {
    try {
      // Load previous 4 weeks of data for trend analysis
      const startWeek = Math.max(1, week - 4);
      const queries = [
        Query.equal('season', season),
        Query.greaterThanEqual('week', startWeek),
        Query.lessThan('week', week),
        Query.limit(5000)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        'player_depth_charts',
        queries
      );

      return response.documents as ResolvedRecord[];

    } catch (error) {
      console.warn('[DataQualityValidator] Failed to load historical data:', error);
      return [];
    }
  }

  private calculateLeagueAverages(historicalData: ResolvedRecord[]): Record<string, number> {
    if (historicalData.length === 0) return {};

    const averages: Record<string, number> = {};
    const fields = ['starter_prob', 'usage_1w_snap_pct', 'usage_4w_snap_pct'];
    
    for (const field of fields) {
      const values = historicalData.map(record => record[field as keyof ResolvedRecord] as number).filter(v => v != null);
      if (values.length > 0) {
        averages[`avg_${field}`] = values.reduce((sum, v) => sum + v, 0) / values.length;
        averages[`std_${field}`] = Math.sqrt(
          values.reduce((sum, v) => sum + Math.pow(v - averages[`avg_${field}`], 2), 0) / values.length
        );
      }
    }

    return averages;
  }

  private calculatePositionBenchmarks(historicalData: ResolvedRecord[]): Record<string, Record<string, number>> {
    const benchmarks: Record<string, Record<string, number>> = {};
    
    const positions = Array.from(new Set(historicalData.map(r => r.position)));
    
    for (const position of positions) {
      const positionRecords = historicalData.filter(r => r.position === position);
      
      if (positionRecords.length > 0) {
        benchmarks[position] = {
          avg_starter_prob: positionRecords.reduce((sum, r) => sum + r.starter_prob, 0) / positionRecords.length,
          avg_usage_1w: positionRecords.reduce((sum, r) => sum + r.usage_1w_snap_pct, 0) / positionRecords.length,
          avg_depth_rank: positionRecords.reduce((sum, r) => sum + r.depth_chart_rank, 0) / positionRecords.length
        };
      }
    }

    return benchmarks;
  }

  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 10;
      case 'error': return 5;
      case 'warning': return 2;
      case 'info': return 1;
      default: return 1;
    }
  }

  private calculateConfidenceAdjustment(qualityScore: number, qualityFlags: string[]): number {
    // Base adjustment on quality score
    let adjustment = (qualityScore - 0.5) * 0.2; // -0.1 to +0.1 range
    
    // Additional penalties for specific quality flags
    const criticalFlags = qualityFlags.filter(flag => 
      flag.includes('schema_required_fields') || 
      flag.includes('schema_value_ranges')
    );
    
    if (criticalFlags.length > 0) {
      adjustment -= 0.2; // Significant penalty for schema issues
    }
    
    return Math.max(-0.3, Math.min(0.2, adjustment)); // Clamp to reasonable range
  }

  private calculateQualityDistribution(reports: RecordQualityReport[]): DatasetQualityReport['quality_distribution'] {
    const distribution = {
      excellent: 0,
      good: 0, 
      fair: 0,
      poor: 0,
      critical: 0
    };

    for (const report of reports) {
      const score = report.overall_score;
      
      if (score >= 0.9) distribution.excellent++;
      else if (score >= 0.7) distribution.good++;
      else if (score >= 0.5) distribution.fair++;
      else if (score >= 0.3) distribution.poor++;
      else distribution.critical++;
    }

    return distribution;
  }

  private identifyCommonIssues(reports: RecordQualityReport[]): DatasetQualityReport['common_issues'] {
    const issueMap = new Map<string, { count: number; severity: string; example: string }>();

    for (const report of reports) {
      for (const result of report.validation_results) {
        if (!result.passed) {
          const key = `${result.rule_id}:${result.severity}`;
          const existing = issueMap.get(key);
          
          if (existing) {
            existing.count++;
          } else {
            issueMap.set(key, {
              count: 1,
              severity: result.severity,
              example: result.message
            });
          }
        }
      }
    }

    return Array.from(issueMap.entries())
      .map(([key, data]) => ({
        issue_type: key.split(':')[0],
        count: data.count,
        severity: data.severity,
        example_message: data.example
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 most common issues
  }

  private generateRecommendations(reports: RecordQualityReport[], ruleViolations: Record<string, number>): string[] {
    const recommendations: string[] = [];
    const totalRecords = reports.length;

    // Check for high error rates
    for (const [ruleId, violationCount] of Object.entries(ruleViolations)) {
      const violationRate = violationCount / totalRecords;
      
      if (violationRate > 0.1) { // More than 10% violation rate
        const rule = this.validationRules.get(ruleId);
        if (rule) {
          recommendations.push(
            `High violation rate for "${rule.rule_name}" (${(violationRate * 100).toFixed(1)}% of records). ` +
            `Consider reviewing ${rule.rule_type} validation logic or data source quality.`
          );
        }
      }
    }

    // Check overall quality distribution
    const qualityDist = this.calculateQualityDistribution(reports);
    const lowQualityRate = (qualityDist.poor + qualityDist.critical) / totalRecords;
    
    if (lowQualityRate > 0.2) {
      recommendations.push(
        `${(lowQualityRate * 100).toFixed(1)}% of records have low quality scores. ` +
        'Consider implementing additional data cleaning steps or improving source data quality.'
      );
    }

    // Generic recommendations
    if (recommendations.length === 0) {
      recommendations.push('Data quality is within acceptable ranges. Continue monitoring for trends.');
    }

    return recommendations;
  }
}