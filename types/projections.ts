export interface PlayerProjection {
  $id: string;
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  conference: string;
  school: string;
  year: string;
  
  // Previous year stats from ESPN
  prevYearStats: {
    gamesPlayed: number;
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receivingYards?: number;
    receivingTDs?: number;
    receptions?: number;
    fantasyPoints: number;
  };
  
  // Ratings and rankings
  ratings: {
    ncaaRating?: number;
    spPlusRating?: number;
    pffGrade?: number;
    composite: number;
  };
  
  // Projections
  projections: {
    gamesPlayed: number;
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receivingYards?: number;
    receivingTDs?: number;
    receptions?: number;
    fantasyPoints: number;
    confidence: number; // 0-100 confidence score
    floor?: number; // 10th percentile projection
    ceiling?: number; // 90th percentile projection
    consistency?: number; // Consistency score (0-1)
  };
  
  // Rankings
  rankings: {
    overall: number;
    position: number;
    adp: number; // Average Draft Position
    tier: number;
    vorp?: number; // Value Over Replacement Player
  };
  
  // Meta data for projection sources
  sources: {
    espn: boolean;
    ncaa: boolean;
    spPlus: boolean;
    mockDrafts: string[];
    socialMediaBuzz: number; // 0-100 buzz score
    articles: string[];
  };
  
  // Injury and risk factors
  risk: {
    injuryHistory: string[];
    suspensions: string[];
    riskScore: number; // 0-100, higher is riskier
  };
  
  updatedAt: string;
}

export interface DraftPlayer extends PlayerProjection {
  isDrafted: boolean;
  draftedBy?: string;
  draftPosition?: number;
  draftRound?: number;
}

// New typed shapes for projections_yearly and projections_weekly collections
export interface ProjectionsYearly {
  $id: string;
  player_id: string;
  season: number;
  team_id?: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  model_version: string;
  // Simple
  games_played_est?: number;
  usage_rate?: number;
  pace_adj?: number;
  statline_simple?: Record<string, number>;
  fantasy_points_simple?: number;
  // Pro
  range_floor?: number;
  range_median?: number;
  range_ceiling?: number;
  percentiles?: { p10?: number; p25?: number; p50?: number; p75?: number; p90?: number };
  injury_risk?: number; // 0-1
  volatility_score?: number; // 0-100
  notes?: string;
  sim_runs?: number;
  sim_seed?: number;
  tier?: 'S' | 'A' | 'B' | 'C';
  replacement_value?: number;
  adp_est?: number;
  ecr_rank?: number;
  updatedAt?: string;
}

export interface ProjectionsWeekly {
  $id: string;
  player_id: string;
  season: number;
  week: number;
  opponent_team_id?: string;
  home_away?: 'H' | 'A' | 'N';
  team_total_est?: number;
  pace_matchup_adj?: number;
  // Simple
  statline_simple?: Record<string, number>;
  fantasy_points_simple?: number;
  // Pro
  statline_median?: Record<string, number>;
  statline_floor?: Record<string, number>;
  statline_ceiling?: Record<string, number>;
  boom_prob?: number;
  bust_prob?: number;
  defense_vs_pos_grade?: number; // 0-100
  injury_status?: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out';
  utilization_trend?: '+' | '=' | '-';
  rank_pro?: number;
  start_sit_color?: 'Green' | 'Yellow' | 'Red';
  updatedAt?: string;
}
