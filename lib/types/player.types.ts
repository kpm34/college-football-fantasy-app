// Core Player Types
export interface Player {
  $id: string;
  playerId: number;
  name: string;
  pos: string;
  team: string;
  conference: string;
  draft_tier: number;
  bye_week: number;
  eligibility: boolean;
  stats?: PlayerStats;
  season_projection?: SeasonProjection;
  weekly_projections?: WeeklyProjection[];
  risk_assessment?: RiskAssessment;
  last_updated: Date;
}

// Player Statistics
export interface PlayerStats {
  games: number;
  passing?: {
    attempts: number;
    completions: number;
    yards: number;
    touchdowns: number;
    interceptions: number;
    rating: number;
  };
  rushing?: {
    attempts: number;
    yards: number;
    touchdowns: number;
    yardsPerCarry: number;
  };
  receiving?: {
    targets: number;
    receptions: number;
    yards: number;
    touchdowns: number;
    yardsPerReception: number;
  };
  defense?: {
    tackles: number;
    sacks: number;
    interceptions: number;
    passesDefended: number;
  };
  kicking?: {
    fieldGoals: number;
    fieldGoalAttempts: number;
    extraPoints: number;
    extraPointAttempts: number;
  };
}

// Season Projection
export interface SeasonProjection {
  playerId: number;
  proj_pts_total: number;
  ceiling: number;
  floor: number;
  risk: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  notes: string;
  last_updated: Date;
}

// Weekly Projection
export interface WeeklyProjection {
  playerId: number;
  week: number;
  opponent: string;
  is_conf_game: boolean;
  is_top25_opp: boolean;
  proj_fantasy_pts: number;
  pace: number; // plays_per_game(team)
  share: number; // usage_rate(player,pos)
  ppa: number; // predicted_points * multiplier[pos]
  confidence: number;
  notes: string;
  last_updated: Date;
}

// Risk Assessment
export interface RiskAssessment {
  injury_risk: 'low' | 'medium' | 'high';
  depth_chart_risk: 'low' | 'medium' | 'high';
  schedule_risk: 'low' | 'medium' | 'high';
  overall_risk: 'low' | 'medium' | 'high';
  risk_factors: string[];
}

// Draft Helper Types
export interface DraftablePlayer extends Player {
  adp?: number; // Average Draft Position
  tier_rank: number;
  position_rank: number;
  overall_rank: number;
  value_pick: boolean;
  sleeper_potential: boolean;
  bust_risk: boolean;
}

// Player Filters
export interface PlayerFilters {
  position?: string;
  team?: string;
  conference?: string;
  draft_tier?: number;
  risk_level?: 'low' | 'medium' | 'high';
  min_projection?: number;
  max_projection?: number;
  eligible_only?: boolean;
  search?: string;
}

// Player Comparison
export interface PlayerComparison {
  player1: Player;
  player2: Player;
  comparison_metrics: {
    season_projection_diff: number;
    weekly_avg_diff: number;
    risk_diff: string;
    value_rating: number;
  };
}

// Draft Board State
export interface DraftBoardState {
  available_players: DraftablePlayer[];
  drafted_players: DraftedPlayer[];
  currentPick: number;
  currentRound: number;
  time_remaining: number;
  is_user_turn: boolean;
  filters: PlayerFilters;
  sort_by: 'projection' | 'adp' | 'risk' | 'position' | 'team';
  sort_order: 'asc' | 'desc';
}

// Drafted Player
export interface DraftedPlayer {
  player: Player;
  pick_number: number;
  round: number;
  teamId: string;
  teamName: string;
  timestamp: Date;
}

// Team Needs Analysis
export interface TeamNeeds {
  teamId: string;
  current_roster: Player[];
  needs: {
    position: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    recommended_players: Player[];
  }[];
  best_available: Player[];
  next_picks: number[];
}

// Projection Calculation Types
export interface ProjectionInputs {
  pace: number; // plays_per_game(team)
  share: number; // usage_rate(player,pos)
  ppa: number; // predicted_points * multiplier[pos]
  opponent_adjustment: number;
  conference_bonus: number;
  injury_adjustment: number;
}

export interface ProjectionMultipliers {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  K: number;
  DEF: number;
}

// Meta Information
export interface ProjectionMeta {
  generated_at: string;
  source_sha: string;
  data_sources: string[];
  confidence_score: number;
} 