/**
 * Position-Tier Analysis System
 * Analyzes prediction performance by position and fantasy ranking tiers
 */

import { PositionTier, TierEvaluation, PlayerProjection, ActualPerformance } from './types';
import { MetricsCalculator, DataPoint } from './metrics';

export interface PlayerPerformance {
  player_id: string;
  position: string;
  predicted_avg: number;
  actual_avg: number;
  games_played: number;
  fantasy_rank?: number; // Within position
}

export class TierAnalyzer {
  
  /**
   * Define standard fantasy tiers by position
   */
  static getStandardTiers(): PositionTier[] {
    return [
      // Quarterback tiers
      { position: 'QB', tier: 'Top-12', min_rank: 1, max_rank: 12 },
      { position: 'QB', tier: 'QB13-24', min_rank: 13, max_rank: 24 },
      { position: 'QB', tier: 'Others', min_rank: 25, max_rank: 999 },
      
      // Running Back tiers  
      { position: 'RB', tier: 'Top-12', min_rank: 1, max_rank: 12 },
      { position: 'RB', tier: 'RB13-24', min_rank: 13, max_rank: 24 },
      { position: 'RB', tier: 'RB25-36', min_rank: 25, max_rank: 36 },
      { position: 'RB', tier: 'Others', min_rank: 37, max_rank: 999 },
      
      // Wide Receiver tiers
      { position: 'WR', tier: 'Top-12', min_rank: 1, max_rank: 12 },
      { position: 'WR', tier: 'WR13-24', min_rank: 13, max_rank: 24 },
      { position: 'WR', tier: 'WR25-36', min_rank: 25, max_rank: 36 },
      { position: 'WR', tier: 'WR37-48', min_rank: 37, max_rank: 48 },
      { position: 'WR', tier: 'Others', min_rank: 49, max_rank: 999 },
      
      // Tight End tiers
      { position: 'TE', tier: 'Top-12', min_rank: 1, max_rank: 12 },
      { position: 'TE', tier: 'Others', min_rank: 13, max_rank: 999 },
      
      // Kicker tiers
      { position: 'K', tier: 'Top-12', min_rank: 1, max_rank: 12 },
      { position: 'K', tier: 'Others', min_rank: 13, max_rank: 999 },
      
      // Defense tiers
      { position: 'DST', tier: 'Top-12', min_rank: 1, max_rank: 12 },
      { position: 'DST', tier: 'Others', min_rank: 13, max_rank: 999 }
    ];
  }

  /**
   * Match predictions with actual performance and calculate per-player averages
   */
  static matchPredictionsWithActuals(
    predictions: PlayerProjection[],
    actuals: ActualPerformance[]
  ): PlayerPerformance[] {
    
    // Group by player_id
    const playerPredictions = new Map<string, PlayerProjection[]>();
    const playerActuals = new Map<string, ActualPerformance[]>();
    
    predictions.forEach(p => {
      if (!playerPredictions.has(p.player_id)) {
        playerPredictions.set(p.player_id, []);
      }
      playerPredictions.get(p.player_id)!.push(p);
    });
    
    actuals.forEach(a => {
      if (!playerActuals.has(a.player_id)) {
        playerActuals.set(a.player_id, []);
      }
      playerActuals.get(a.player_id)!.push(a);
    });
    
    const playerPerformances: PlayerPerformance[] = [];
    
    // Calculate averages for each player
    for (const [playerId, playerPreds] of playerPredictions.entries()) {
      const playerActs = playerActuals.get(playerId);
      
      if (!playerActs || playerActs.length === 0) {
        continue; // Skip players without actual performance data
      }
      
      const position = this.inferPosition(playerPreds, playerActs);
      const predictedAvg = playerPreds.reduce((sum, p) => sum + p.fantasy_points_simple, 0) / playerPreds.length;
      const actualAvg = playerActs.reduce((sum, a) => sum + a.actual_fantasy_points, 0) / playerActs.length;
      
      playerPerformances.push({
        player_id: playerId,
        position,
        predicted_avg: predictedAvg,
        actual_avg: actualAvg,
        games_played: playerActs.length
      });
    }
    
    return playerPerformances;
  }

  /**
   * Rank players within each position and assign fantasy ranks
   */
  static assignFantasyRanks(players: PlayerPerformance[]): PlayerPerformance[] {
    const byPosition = new Map<string, PlayerPerformance[]>();
    
    // Group by position
    players.forEach(p => {
      if (!byPosition.has(p.position)) {
        byPosition.set(p.position, []);
      }
      byPosition.get(p.position)!.push(p);
    });
    
    const rankedPlayers: PlayerPerformance[] = [];
    
    // Rank within each position by actual average fantasy points
    for (const [position, positionPlayers] of byPosition.entries()) {
      const sorted = positionPlayers.sort((a, b) => b.actual_avg - a.actual_avg);
      
      sorted.forEach((player, index) => {
        rankedPlayers.push({
          ...player,
          fantasy_rank: index + 1
        });
      });
    }
    
    return rankedPlayers;
  }

  /**
   * Analyze performance by tier
   */
  static analyzeByTier(
    playerPerformances: PlayerPerformance[],
    tiers: PositionTier[] = this.getStandardTiers(),
    minPlayersPerTier: number = 3
  ): TierEvaluation[] {
    
    const tierEvaluations: TierEvaluation[] = [];
    
    for (const tier of tiers) {
      const tierPlayers = playerPerformances.filter(p => 
        p.position === tier.position &&
        p.fantasy_rank !== undefined &&
        p.fantasy_rank >= tier.min_rank &&
        p.fantasy_rank <= tier.max_rank
      );
      
      if (tierPlayers.length < minPlayersPerTier) {
        console.warn(`⚠️ Tier ${tier.position} ${tier.tier} has only ${tierPlayers.length} players (min: ${minPlayersPerTier})`);
        continue;
      }
      
      // Convert to DataPoints for metrics calculation
      const dataPoints: DataPoint[] = tierPlayers.map(p => ({
        predicted: p.predicted_avg,
        actual: p.actual_avg,
        player_id: p.player_id
      }));
      
      const metrics = MetricsCalculator.calculateMetrics(dataPoints);
      
      // Create detailed predictions array
      const predictions = tierPlayers.map(p => ({
        player_id: p.player_id,
        predicted: p.predicted_avg,
        actual: p.actual_avg,
        error: p.predicted_avg - p.actual_avg,
        abs_error: Math.abs(p.predicted_avg - p.actual_avg),
        pct_error: p.actual_avg !== 0 ? 
          ((p.predicted_avg - p.actual_avg) / Math.abs(p.actual_avg)) * 100 : 0
      }));
      
      tierEvaluations.push({
        tier,
        metrics,
        predictions
      });
    }
    
    return tierEvaluations;
  }

  /**
   * Generate tier comparison table data
   */
  static generateTierComparison(tierEvaluations: TierEvaluation[]): Array<{
    position: string;
    tier: string;
    n_players: number;
    mae: number;
    smape: number;
    r2: number;
    avg_predicted: number;
    avg_actual: number;
    bias: number; // avg(predicted - actual)
  }> {
    
    return tierEvaluations.map(evaluation => {
      const predictions = evaluation.predictions;
      const avgPredicted = predictions.reduce((sum, p) => sum + p.predicted, 0) / predictions.length;
      const avgActual = predictions.reduce((sum, p) => sum + p.actual, 0) / predictions.length;
      const bias = predictions.reduce((sum, p) => sum + p.error, 0) / predictions.length;
      
      return {
        position: evaluation.tier.position,
        tier: evaluation.tier.tier,
        n_players: predictions.length,
        mae: evaluation.metrics.mae,
        smape: evaluation.metrics.smape,
        r2: evaluation.metrics.r2,
        avg_predicted: avgPredicted,
        avg_actual: avgActual,
        bias
      };
    });
  }

  /**
   * Identify the worst performing tiers for focused improvement
   */
  static identifyWorstPerformingTiers(
    tierEvaluations: TierEvaluation[],
    metric: 'mae' | 'smape' | 'r2' = 'mae',
    topN: number = 5
  ): Array<{
    tier: PositionTier;
    metric_value: number;
    rank: number;
  }> {
    
    const sortedTiers = tierEvaluations.map(evaluation => ({
      tier: evaluation.tier,
      metric_value: evaluation.metrics[metric],
      evaluation
    }));
    
    // Sort by metric (higher MAE/sMAPE is worse, lower R2 is worse)
    if (metric === 'r2') {
      sortedTiers.sort((a, b) => a.metric_value - b.metric_value); // Ascending for R2
    } else {
      sortedTiers.sort((a, b) => b.metric_value - a.metric_value); // Descending for MAE/sMAPE
    }
    
    return sortedTiers.slice(0, topN).map((item, index) => ({
      tier: item.tier,
      metric_value: item.metric_value,
      rank: index + 1
    }));
  }

  /**
   * Calculate improvement needed to meet target
   */
  static calculateImprovementNeeded(
    currentTiers: TierEvaluation[],
    targetImprovement: number = 0.10 // 10% improvement
  ): Array<{
    position: string;
    tier: string;
    current_mae: number;
    target_mae: number;
    improvement_needed: number;
    meets_target: boolean;
  }> {
    
    return currentTiers.map(evaluation => {
      const currentMAE = evaluation.metrics.mae;
      const targetMAE = currentMAE * (1 - targetImprovement);
      const improvementNeeded = (currentMAE - targetMAE) / currentMAE;
      
      return {
        position: evaluation.tier.position,
        tier: evaluation.tier.tier,
        current_mae: currentMAE,
        target_mae: targetMAE,
        improvement_needed: improvementNeeded,
        meets_target: improvementNeeded <= targetImprovement
      };
    });
  }

  /**
   * Helper method to infer player position from available data
   */
  private static inferPosition(
    predictions: PlayerProjection[],
    actuals: ActualPerformance[]
  ): string {
    // Try to get position from predictions first
    const predictionPositions = predictions.map(p => p.position).filter(p => p && p !== 'UNKNOWN');
    if (predictionPositions.length > 0) {
      return predictionPositions[0];
    }
    
    // Try to get position from actuals
    const actualPositions = actuals.map(a => a.position).filter(p => p && p !== 'UNKNOWN');
    if (actualPositions.length > 0) {
      return actualPositions[0];
    }
    
    return 'UNKNOWN';
  }

  /**
   * Filter tiers by position for focused analysis
   */
  static filterTiersByPosition(
    tierEvaluations: TierEvaluation[],
    positions: string[]
  ): TierEvaluation[] {
    return tierEvaluations.filter(evaluation => 
      positions.includes(evaluation.tier.position)
    );
  }
}