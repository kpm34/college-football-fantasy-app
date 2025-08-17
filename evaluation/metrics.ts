/**
 * Metrics Calculation Engine
 * Implements MAE, sMAPE, R^2, calibration, and other evaluation metrics
 */

import { EvaluationMetrics } from './types';

export interface DataPoint {
  predicted: number;
  actual: number;
  player_id?: string;
  week?: number;
}

export class MetricsCalculator {
  
  /**
   * Calculate all standard metrics for a set of predictions
   */
  static calculateMetrics(predictions: DataPoint[]): EvaluationMetrics {
    if (predictions.length === 0) {
      return {
        mae: 0,
        smape: 0,
        r2: 0,
        rmse: 0,
        n_predictions: 0,
        n_players: 0
      };
    }

    const predicted = predictions.map(p => p.predicted);
    const actual = predictions.map(p => p.actual);
    
    return {
      mae: this.calculateMAE(predicted, actual),
      smape: this.calculateSMAPE(predicted, actual),
      r2: this.calculateR2(predicted, actual),
      rmse: this.calculateRMSE(predicted, actual),
      n_predictions: predictions.length,
      n_players: new Set(predictions.map(p => p.player_id).filter(Boolean)).size
    };
  }

  /**
   * Mean Absolute Error
   */
  static calculateMAE(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length || predicted.length === 0) {
      return 0;
    }

    const sumAbsError = predicted.reduce((sum, pred, i) => {
      return sum + Math.abs(pred - actual[i]);
    }, 0);

    return sumAbsError / predicted.length;
  }

  /**
   * Symmetric Mean Absolute Percentage Error
   * sMAPE = (1/n) * Σ(2 * |predicted - actual| / (|predicted| + |actual|)) * 100
   */
  static calculateSMAPE(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length || predicted.length === 0) {
      return 0;
    }

    const sumSMAPE = predicted.reduce((sum, pred, i) => {
      const act = actual[i];
      const denominator = Math.abs(pred) + Math.abs(act);
      
      if (denominator === 0) {
        return sum; // Skip when both predicted and actual are 0
      }
      
      return sum + (2 * Math.abs(pred - act)) / denominator;
    }, 0);

    return (sumSMAPE / predicted.length) * 100;
  }

  /**
   * R-squared (coefficient of determination)
   */
  static calculateR2(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length || predicted.length === 0) {
      return 0;
    }

    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    
    const totalSumSquares = actual.reduce((sum, val) => {
      return sum + Math.pow(val - actualMean, 2);
    }, 0);

    const residualSumSquares = predicted.reduce((sum, pred, i) => {
      return sum + Math.pow(actual[i] - pred, 2);
    }, 0);

    if (totalSumSquares === 0) {
      return 0; // Perfect prediction when no variance in actual
    }

    return 1 - (residualSumSquares / totalSumSquares);
  }

  /**
   * Root Mean Squared Error
   */
  static calculateRMSE(predicted: number[], actual: number[]): number {
    if (predicted.length !== actual.length || predicted.length === 0) {
      return 0;
    }

    const sumSquaredError = predicted.reduce((sum, pred, i) => {
      return sum + Math.pow(pred - actual[i], 2);
    }, 0);

    return Math.sqrt(sumSquaredError / predicted.length);
  }

  /**
   * Calculate calibration metrics
   * Returns slope and intercept of predicted vs actual percentiles
   */
  static calculateCalibration(predictions: DataPoint[]): {
    slope: number;
    intercept: number;
    reliability: number;
    predicted_percentiles: number[];
    actual_percentiles: number[];
  } {
    if (predictions.length < 10) {
      return {
        slope: 1,
        intercept: 0,
        reliability: 0,
        predicted_percentiles: [],
        actual_percentiles: []
      };
    }

    // Sort predictions by predicted value to create percentiles
    const sorted = [...predictions].sort((a, b) => a.predicted - b.predicted);
    
    const numBins = Math.min(10, Math.floor(predictions.length / 5));
    const binSize = Math.floor(sorted.length / numBins);
    
    const predictedPercentiles: number[] = [];
    const actualPercentiles: number[] = [];
    
    for (let i = 0; i < numBins; i++) {
      const start = i * binSize;
      const end = i === numBins - 1 ? sorted.length : (i + 1) * binSize;
      const bin = sorted.slice(start, end);
      
      const predictedMean = bin.reduce((sum, p) => sum + p.predicted, 0) / bin.length;
      const actualMean = bin.reduce((sum, p) => sum + p.actual, 0) / bin.length;
      
      predictedPercentiles.push(predictedMean);
      actualPercentiles.push(actualMean);
    }

    // Calculate linear regression for calibration line
    const { slope, intercept } = this.linearRegression(predictedPercentiles, actualPercentiles);
    
    // Calculate reliability (how close to perfect calibration)
    const perfectSlope = 1;
    const perfectIntercept = 0;
    const reliability = 1 - Math.abs(slope - perfectSlope) - Math.abs(intercept - perfectIntercept);

    return {
      slope,
      intercept,
      reliability: Math.max(0, reliability), // Ensure non-negative
      predicted_percentiles: predictedPercentiles,
      actual_percentiles: actualPercentiles
    };
  }

  /**
   * Calculate percentile-based metrics for better understanding of model performance
   */
  static calculatePercentileMetrics(predictions: DataPoint[]): {
    p50_error: number;
    p75_error: number;
    p90_error: number;
    p95_error: number;
  } {
    if (predictions.length === 0) {
      return { p50_error: 0, p75_error: 0, p90_error: 0, p95_error: 0 };
    }

    const errors = predictions.map(p => Math.abs(p.predicted - p.actual));
    errors.sort((a, b) => a - b);

    return {
      p50_error: this.percentile(errors, 50),
      p75_error: this.percentile(errors, 75),
      p90_error: this.percentile(errors, 90),
      p95_error: this.percentile(errors, 95)
    };
  }

  /**
   * Calculate metrics by week for time series analysis
   */
  static calculateMetricsByWeek(predictions: DataPoint[]): Array<{
    week: number;
    metrics: EvaluationMetrics;
    count: number;
  }> {
    // Group predictions by week
    const byWeek = new Map<number, DataPoint[]>();
    
    predictions.forEach(p => {
      if (p.week !== undefined) {
        if (!byWeek.has(p.week)) {
          byWeek.set(p.week, []);
        }
        byWeek.get(p.week)!.push(p);
      }
    });

    const weeklyMetrics: Array<{ week: number; metrics: EvaluationMetrics; count: number }> = [];
    
    for (const [week, weekPredictions] of byWeek.entries()) {
      weeklyMetrics.push({
        week,
        metrics: this.calculateMetrics(weekPredictions),
        count: weekPredictions.length
      });
    }

    return weeklyMetrics.sort((a, b) => a.week - b.week);
  }

  /**
   * Helper functions
   */
  private static linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    if (x.length !== y.length || x.length === 0) {
      return { slope: 1, intercept: 0 };
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope: isFinite(slope) ? slope : 1, intercept: isFinite(intercept) ? intercept : 0 };
  }

  private static percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = (p / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Compare two sets of metrics and determine improvement
   */
  static compareMetrics(current: EvaluationMetrics, baseline: EvaluationMetrics): {
    mae_improvement: number;
    smape_improvement: number;
    r2_improvement: number;
    overall_improvement: number;
    better_mae: boolean;
    better_smape: boolean;
    better_r2: boolean;
  } {
    const mae_improvement = baseline.mae > 0 ? (baseline.mae - current.mae) / baseline.mae : 0;
    const smape_improvement = baseline.smape > 0 ? (baseline.smape - current.smape) / baseline.smape : 0;
    const r2_improvement = current.r2 - baseline.r2; // Higher R2 is better
    
    const overall_improvement = (mae_improvement + smape_improvement + r2_improvement) / 3;

    return {
      mae_improvement,
      smape_improvement,
      r2_improvement,
      overall_improvement,
      better_mae: mae_improvement > 0,
      better_smape: smape_improvement > 0,
      better_r2: r2_improvement > 0
    };
  }
}