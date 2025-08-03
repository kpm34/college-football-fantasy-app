export interface CollegePlayer {
  id: string;
  espnId?: string;
  cfbdId?: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  displayName: string;
  jersey?: string;
  position: PlayerPosition;
  team: string;
  teamId: string;
  conference: string;
  
  // Physical Attributes
  height?: string;
  weight?: number;
  class?: string; // Freshman, Sophomore, etc.
  
  // Depth Chart
  depthChartPosition?: number;
  isStarter?: boolean;
  
  // Eligibility
  eligibleForWeek?: boolean;
  injuryStatus?: 'healthy' | 'questionable' | 'doubtful' | 'out';
  injuryNotes?: string;
  
  // Stats & Projections
  seasonStats?: PlayerSeasonStats;
  weeklyProjections?: WeeklyProjection[];
  fantasyPoints?: number;
  
  // Metadata
  lastUpdated: Date;
  dataSource: string;
}

export interface PlayerPosition {
  id: string;
  name: string;
  abbreviation: string;
  fantasyCategory: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
}

export interface PlayerSeasonStats {
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

export interface WeeklyProjection {
  week: number;
  opponent: string;
  projectedPoints: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface PlayerFilters {
  position?: string;
  conference?: string;
  minPoints?: number;
  maxPoints?: number;
  team?: string;
  injuryStatus?: string;
}

export interface DraftablePlayer extends CollegePlayer {
  rank?: number;
  tier?: string;
  adp?: number; // Average Draft Position
  expertRank?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  upside?: string;
  concerns?: string;
}

export interface PlayerComparison {
  player1: CollegePlayer;
  player2: CollegePlayer;
  comparison: {
    fantasyPoints: { player1: number; player2: number };
    games: { player1: number; player2: number };
    consistency: { player1: number; player2: number };
    upside: { player1: string; player2: string };
    risk: { player1: string; player2: string };
  };
}

export interface PlayerNews {
  playerId: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface DepthChartPosition {
  position: string;
  depth: number;
  playerId: string;
  playerName: string;
  status: 'starter' | 'backup' | 'injured' | 'suspended';
}

export interface TeamDepthChart {
  teamId: string;
  teamName: string;
  positions: DepthChartPosition[];
  lastUpdated: Date;
} 