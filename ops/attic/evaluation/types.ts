/**
 * Projection Evaluation Types
 * Core types for the projection evaluation system
 */

export interface WeekRange {
  startSeason: number;
  startWeek: number;
  endSeason: number;
  endWeek: number;
}

export interface PlayerProjection {
  player_id: string;
  season: number;
  week?: number; // undefined for yearly projections
  position: string;
  team_id?: string;
  
  // Prediction values
  fantasy_points_simple: number;
  range_floor?: number;
  range_median?: number;
  range_ceiling?: number;
  
  // Confidence metrics
  volatility_score?: number;
  injury_risk?: number;
}

export interface ActualPerformance {
  player_id: string;
  season: number;
  week: number;
  position: string;
  team: string;
  
  // Actual fantasy points (from scoring system)
  actual_fantasy_points: number;
  
  // Raw stats for validation
  passing_yards?: number;
  rushing_yards?: number;
  receiving_yards?: number;
  touchdowns?: number;
  interceptions?: number;
  
  // Game context
  opponent?: string;
  home_away?: 'H' | 'A';
  game_completed: boolean;
}

export interface EvaluationMetrics {
  // Core metrics
  mae: number; // Mean Absolute Error
  smape: number; // Symmetric Mean Absolute Percentage Error  
  r2: number; // R-squared correlation
  rmse: number; // Root Mean Squared Error
  
  // Sample size
  n_predictions: number;
  n_players: number;
  
  // Calibration metrics
  calibration_slope?: number;
  calibration_intercept?: number;
  reliability_score?: number;
}

export interface PositionTier {
  position: string;
  tier: string; // e.g., "Top-12", "RB13-24", "RB25-36", "Others"
  min_rank: number;
  max_rank: number;
}

export interface TierEvaluation {
  tier: PositionTier;
  metrics: EvaluationMetrics;
  predictions: Array<{
    player_id: string;
    predicted: number;
    actual: number;
    error: number;
    abs_error: number;
    pct_error: number;
  }>;
}

export interface EvaluationReport {
  // Metadata
  evaluation_date: string;
  week_range: WeekRange;
  model_version?: string;
  
  // Overall metrics
  overall_metrics: EvaluationMetrics;
  
  // Position-specific analysis
  by_position: Record<string, EvaluationMetrics>;
  
  // Tier-specific analysis
  by_tier: TierEvaluation[];
  
  // Time series (for rolling analysis)
  by_week?: Array<{
    season: number;
    week: number;
    metrics: EvaluationMetrics;
  }>;
  
  // Calibration data
  calibration_curves?: Array<{
    position: string;
    predicted_percentiles: number[];
    actual_percentiles: number[];
  }>;
}

export interface ScoringRules {
  passing_yards_per_point: number;
  rushing_yards_per_point: number;
  receiving_yards_per_point: number;
  passing_td: number;
  rushing_td: number;
  receiving_td: number;
  interception: number;
  fumble: number;
  field_goal: number;
  extra_point: number;
  // Add more as needed
}

export interface EvaluationConfig {
  week_range: WeekRange;
  positions: string[];
  scoring_rules?: ScoringRules;
  output_formats: ('parquet' | 'markdown' | 'json')[];
  output_path: string;
  
  // Analysis options
  include_calibration: boolean;
  include_time_series: boolean;
  min_predictions_per_tier: number;
}