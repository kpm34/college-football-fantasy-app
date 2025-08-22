// Barrel exports for per-collection schemas
export * from './zod/leagues'
export * from './zod/fantasy_teams'
export * from './zod/college_players'
export * from './zod/games'
export * from './zod/player_stats'
export * from './zod/rankings'
export * from './zod/rosters'
export * from './zod/lineups'
export * from './zod/drafts'
export * from './zod/draft_picks'
/**
 * ZOD-FIRST SINGLE SOURCE OF TRUTH
 * 
 * All database schemas, TypeScript types, and validation rules 
 * are defined here using Zod. Everything else is inferred.
 */

import { z } from "zod";

/**
 * CORE COLLECTIONS - Zod Schemas
 */

export const CollegePlayers = z.object({
  name: z.string().min(2).max(100),
  position: z.enum(['QB', 'RB', 'WR', 'TE', 'K', 'DEF']),
  team: z.string().min(2).max(50),
  conference: z.enum(['SEC', 'ACC', 'Big 12', 'Big Ten']),
  jerseyNumber: z.number().int().min(0).max(99).optional(),
  height: z.string().max(10).optional(),
  weight: z.number().int().min(150).max(400).optional(),
  year: z.enum(['FR', 'SO', 'JR', 'SR']).optional(),
  eligible: z.boolean().default(true),
  fantasy_points: z.number().default(0),
  season_fantasy_points: z.number().default(0),
  depth_chart_order: z.number().int().optional(),
  last_projection_update: z.date().optional(),
  external_id: z.string().max(50).optional(),
  image_url: z.string().url().optional(),
  stats: z.string().max(5000).optional() // JSON string
});

export const Teams = z.object({
  name: z.string().min(1).max(100),
  abbreviation: z.string().min(2).max(10),
  conference: z.enum(['SEC', 'ACC', 'Big 12', 'Big Ten']),
  mascot: z.string().max(50).optional(),
  logo_url: z.string().url().optional(),
  primary_color: z.string().max(7).optional(), // hex color
  secondary_color: z.string().max(7).optional(),
  venue: z.string().max(100).optional(),
  founded: z.number().int().min(1800).max(2100).optional(),
  external_id: z.string().max(50).optional()
});

export const Games = z.object({
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  season_type: z.enum(['regular', 'postseason']),
  home_team: z.string().min(2).max(50),
  away_team: z.string().min(2).max(50),
  home_score: z.number().int().min(0).optional(),
  away_score: z.number().int().min(0).optional(),
  start_date: z.date(),
  completed: z.boolean().default(false),
  venue: z.string().max(100).optional(),
  tv_network: z.string().max(20).optional(),
  weather: z.string().max(200).optional(),
  external_id: z.string().max(50).optional()
});

export const Rankings = z.object({
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  poll_type: z.enum(['AP Top 25', 'Coaches Poll']),
  team: z.string().min(2).max(50),
  rank: z.number().int().min(1).max(25),
  points: z.number().int().min(0).optional(),
  first_place_votes: z.number().int().min(0).optional()
});

export const Leagues = z.object({
  name: z.string().min(1).max(100),
  commissioner: z.string().min(1).max(50), // User ID
  season: z.number().int().min(2020).max(2030),
  maxTeams: z.number().int().min(2).max(32),
  currentTeams: z.number().int().min(0).max(32).default(0),
  draftType: z.enum(['snake', 'auction']),
  gameMode: z.enum(['power4', 'sec', 'acc', 'big12', 'bigten']),
  selectedConference: z.string().max(50).optional(),
  status: z.enum(['open', 'full', 'drafting', 'active', 'complete']).default('open'),
  isPublic: z.boolean().default(true),
  pickTimeSeconds: z.number().int().min(30).max(600).default(90),
  scoringRules: z.string().max(2000).optional(), // JSON string
  draftDate: z.date().optional(),
  seasonStartWeek: z.number().int().min(1).max(20).optional(),
  playoffTeams: z.number().int().min(0).max(20).optional(),
  playoffStartWeek: z.number().int().min(1).max(20).optional(),
  waiverType: z.string().max(20).optional(),
  waiverBudget: z.number().int().min(0).max(1000).optional(),
  password: z.string().max(50).optional()
});

export const Rosters = z.object({
  leagueId: z.string().min(1).max(50),
  userId: z.string().min(1).max(50),
  teamName: z.string().min(1).max(100),
  abbreviation: z.string().max(10).optional(),
  draftPosition: z.number().int().min(1).optional(),
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  ties: z.number().int().min(0).default(0),
  pointsFor: z.number().min(0).default(0),
  pointsAgainst: z.number().min(0).default(0),
  players: z.string().max(5000).default('[]'), // JSON array of player IDs
  lineup: z.string().max(5000).optional(), // JSON lineup
  bench: z.string().max(5000).optional() // JSON bench players
});

export const Lineups = z.object({
  rosterId: z.string().min(1).max(50),
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  lineup: z.string().max(5000).optional(), // JSON starting lineup
  bench: z.string().max(5000).optional(), // JSON bench players
  points: z.number().min(0).default(0),
  locked: z.boolean().default(false)
});

export const Auctions = z.object({
  leagueId: z.string().min(1).max(50),
  status: z.string().min(1).max(20),
  currentPlayerId: z.string().min(1).max(50).optional(),
  currentBid: z.number().min(0).optional(),
  currentBidder: z.string().min(1).max(50).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional()
});

export const Bids = z.object({
  leagueId: z.string().min(1).max(50),
  sessionId: z.string().min(1).max(50),
  userId: z.string().min(1).max(50),
  playerId: z.string().min(1).max(50),
  bidAmount: z.number().min(1),
  timestamp: z.date()
});

export const PlayerStats = z.object({
  playerId: z.string().min(1).max(50),
  gameId: z.string().min(1).max(50),
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  stats: z.string().max(2000), // JSON stats object
  fantasy_points: z.number().default(0),
  updated: z.date().default(() => new Date())
});

// Users collection deprecated - use Appwrite Auth Users instead

export const ActivityLog = z.object({
  userId: z.string().max(50).optional(),
  action: z.string().min(1).max(100),
  details: z.string().max(1000).optional(),
  timestamp: z.date().default(() => new Date()),
  ip_address: z.string().max(45).optional(),
  user_agent: z.string().max(500).optional()
});

/**
 * Draft & Mock Draft Collections (in use but missing from SSOT)
 */
export const DraftPicks = z.object({
  leagueId: z.string().min(1).max(50),
  teamId: z.string().min(1).max(50),
  rosterId: z.string().min(1).max(50).optional(),
  playerId: z.string().min(1).max(50),
  playerName: z.string().min(1).max(120),
  position: z.enum(['QB', 'RB', 'WR', 'TE', 'K']),
  round: z.number().int().min(1),
  pick: z.number().int().min(1),
  overallPick: z.number().int().min(1),
  timestamp: z.string().optional()
});

export const MockDrafts = z.object({
  title: z.string().min(1).max(100).optional(),
  numTeams: z.number().int().min(2).max(24),
  status: z.enum(['waiting', 'active', 'complete']).default('waiting'),
  settings: z.string().max(5000).optional() // JSON settings
});

export const MockDraftParticipants = z.object({
  draftId: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  slot: z.number().int().min(1).max(24)
});

export const MockDraftPicks = z.object({
  draftId: z.string().min(1).max(50),
  participantId: z.string().min(1).max(50),
  playerId: z.string().min(1).max(50),
  round: z.number().int().min(1),
  pick: z.number().int().min(1)
});

/**
 * Draft Event Log & Persisted State (for recovery)
 */
export const DraftEvents = z.object({
  draftId: z.string().min(1).max(50),
  ts: z.date(),
  type: z.enum(['pick', 'autopick', 'undo', 'pause', 'resume']),
  teamId: z.string().min(1).max(50),
  playerId: z.string().min(1).max(50).optional(),
  round: z.number().int().min(1),
  overall: z.number().int().min(1),
  by: z.string().min(1).max(50).optional(),
});

export const DraftStates = z.object({
  draftId: z.string().min(1).max(50),
  onClockTeamId: z.string().min(1).max(50),
  deadlineAt: z.date(),
  round: z.number().int().min(1),
  pickIndex: z.number().int().min(1),
  status: z.enum(['active', 'paused', 'complete']).default('active'),
});

/**
 * Projections & Inputs (present in env and services)
 */
export const PlayerProjections = z.object({
  playerId: z.string().min(1).max(50),
  season: z.number().int().min(2020).max(2035),
  week: z.number().int().min(1).max(20).optional(),
  version: z.number().int().min(1).default(1),
  points: z.number().optional(),
  components: z.string().max(10000).optional(), // JSON payload with base, multipliers, etc.
  fantasy_points: z.number().optional(),
  data: z.string().max(10000).optional() // legacy JSON payload
});

export const ProjectionsYearly = z.object({
  // Live DB: projections_yearly
  player_id: z.string().min(1).max(64),
  season: z.number().int().min(2020).max(2035),
  team_id: z.string().max(64).optional(),
  position: z.enum(['QB', 'RB', 'WR', 'TE']),
  model_version: z.string().min(1).max(50),
  games_played_est: z.number().optional(),
  usage_rate: z.number().optional(),
  pace_adj: z.number().optional(),
  fantasy_points_simple: z.number().optional(),
  range_floor: z.number().optional(),
  range_median: z.number().optional(),
  range_ceiling: z.number().optional(),
  injury_risk: z.number().optional(),
  volatility_score: z.number().optional(),
  replacement_value: z.number().optional(),
  adp_est: z.number().optional(),
  ecr_rank: z.number().int().optional(),
  statline_simple_json: z.string().optional()
});

export const ProjectionsWeekly = z.object({
  // Live DB: projections_weekly
  player_id: z.string().min(1).max(64),
  season: z.number().int().min(2020).max(2035),
  week: z.number().int().min(1).max(20),
  opponent_team_id: z.string().max(64).optional(),
  home_away: z.enum(['H', 'A', 'N']).optional(),
  team_total_est: z.number().optional(),
  pace_matchup_adj: z.number().optional(),
  fantasy_points_simple: z.number().optional(),
  boom_prob: z.number().optional(),
  bust_prob: z.number().optional(),
  defense_vs_pos_grade: z.number().optional(),
  injury_status: z.enum(['Healthy', 'Questionable', 'Doubtful', 'Out']).optional(),
  utilization_trend: z.enum(['+', '=', '-']).optional(),
  rank_pro: z.number().int().optional(),
  start_sit_color: z.enum(['Green', 'Yellow', 'Red']).optional()
});

export const ModelInputs = z.object({
  // Live DB: model_inputs
  season: z.number().int().min(2020).max(2035),
  week: z.number().int().min(1).max(20).optional(),
  depth_chart: z.string().optional(),
  team_pace: z.string().optional(),
  pass_rate: z.string().optional(),
  rush_rate: z.string().optional(),
  depth_chart_json: z.string().optional(),
  usage_priors_json: z.string().optional(),
  team_efficiency_json: z.string().optional(),
  pace_estimates_json: z.string().optional(),
  opponent_grades_by_pos_json: z.string().optional(),
  manual_overrides_json: z.string().optional(),
  ea_ratings_json: z.string().optional(),
  nfl_draft_capital_json: z.string().optional()
});

export const UserCustomProjections = z.object({
  userId: z.string().min(1).max(50),
  playerId: z.string().min(1).max(50),
  season: z.number().int().min(2020).max(2035),
  week: z.number().int().min(1).max(20).optional(),
  fantasy_points: z.number().optional(),
  notes: z.string().max(2000).optional()
});

/**
 * League Memberships (normalized user membership with role)
 */
export const LeagueMemberships = z.object({
  leagueId: z.string().min(1).max(50),
  userId: z.string().min(1).max(50),
  role: z.enum(['commissioner', 'member', 'viewer']).default('member'),
});

/**
 * Projection Run Records (versioning/reproducibility)
 */
export const ProjectionRuns = z.object({
  runId: z.string().min(1).max(64),
  version: z.number().int().min(1),
  scope: z.enum(['season', 'week']),
  season: z.number().int().min(2020).max(2035),
  week: z.number().int().min(1).max(20).optional(),
  sources: z.string().max(20000).optional(), // JSON: checksums/urls/timestamps
  weights: z.string().max(10000).optional(),
  metrics: z.string().max(10000).optional(), // JSON: MAE/MAPE
  status: z.enum(['running', 'success', 'failed']).default('running'),
  startedAt: z.date(),
  finishedAt: z.date().optional(),
});

/**
 * Projection Run Metrics (separate to avoid attribute limits)
 */
export const ProjectionRunMetrics = z.object({
  runId: z.string().min(1).max(64),
  metrics: z.string().max(10000), // JSON string of metrics (e.g., MAE/MAPE)
});

/**
 * Matchups (weekly head-to-head)
 */
export const Drafts = z.object({
  leagueId: z.string().min(1).max(50),
  status: z.string().min(1).max(20),
  currentRound: z.number().int().min(1).optional(),
  currentPick: z.number().int().min(1).optional(),
  maxRounds: z.number().int().min(1).optional(),
  draftOrder: z.string().max(1000).optional(), // JSON array of team IDs
  startTime: z.date().optional(),
  endTime: z.date().optional()
});

export const Matchups = z.object({
  leagueId: z.string().min(1).max(50),
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2035),
  homeRosterId: z.string().min(1).max(50),
  awayRosterId: z.string().min(1).max(50),
  homePoints: z.number().optional(),
  awayPoints: z.number().optional(),
  status: z.enum(['scheduled', 'active', 'final']).default('scheduled')
});

/**
 * Scores (weekly scoring results)
 */
export const Scores = z.object({
  leagueId: z.string().min(1).max(50),
  week: z.number().int().min(1).max(20),
  rosterId: z.string().min(1).max(50),
  points: z.number().min(0),
  opponentId: z.string().min(1).max(50).optional(),
  result: z.string().max(20).optional() // 'win', 'loss', 'tie'
});

/**
 * Team Budgets (auction draft budgets)
 */
export const TeamBudgets = z.object({
  leagueId: z.string().min(1).max(50),
  userId: z.string().min(1).max(50),
  budget: z.number().min(0),
  spent: z.number().min(0).optional(),
  remaining: z.number().min(0).optional()
});

/**
 * INFERRED TYPESCRIPT TYPES
 */
export type CollegePlayer = z.infer<typeof CollegePlayers>;
export type Team = z.infer<typeof Teams>;
export type Game = z.infer<typeof Games>;
export type Ranking = z.infer<typeof Rankings>;
export type League = z.infer<typeof Leagues>;
export type Roster = z.infer<typeof Rosters>;
export type Lineup = z.infer<typeof Lineups>;
export type Auction = z.infer<typeof Auctions>;
export type Bid = z.infer<typeof Bids>;
export type PlayerStat = z.infer<typeof PlayerStats>;
// User type deprecated - use Appwrite User type instead
export type ActivityLogEntry = z.infer<typeof ActivityLog>;
export type Draft = z.infer<typeof Drafts>;
export type Score = z.infer<typeof Scores>;
export type TeamBudget = z.infer<typeof TeamBudgets>;

/**
 * COLLECTION REGISTRY
 */
export const COLLECTIONS = {
  COLLEGE_PLAYERS: 'college_players',
  TEAMS: 'teams', 
  GAMES: 'games',
  RANKINGS: 'rankings',
  LEAGUES: 'leagues',
  USER_TEAMS: 'user_teams',  // Updated from 'rosters'
  LINEUPS: 'lineups',
  AUCTIONS: 'auctions',
  AUCTION_SESSIONS: 'auction_sessions',
  BIDS: 'bids',
  AUCTION_BIDS: 'auction_bids',
  PLAYER_STATS: 'player_stats',
  USERS: 'users',
  ACTIVITY_LOG: 'activity_log',
  DRAFT_PICKS: 'draft_picks',
  MOCK_DRAFTS: 'mock_drafts',
  MOCK_DRAFT_PICKS: 'mock_draft_picks',
  MOCK_DRAFT_PARTICIPANTS: 'mock_draft_participants',
  DRAFTS: 'drafts',
  MATCHUPS: 'matchups',
  SCORES: 'scores',
  PLAYER_PROJECTIONS: 'player_projections',
  PROJECTIONS_YEARLY: 'projections_yearly',
  PROJECTIONS_WEEKLY: 'projections_weekly',
  MODEL_INPUTS: 'model_inputs',
  USER_CUSTOM_PROJECTIONS: 'user_custom_projections',
  DRAFT_EVENTS: 'draft_events',
  DRAFT_STATES: 'draft_states',
  LEAGUE_MEMBERSHIPS: 'league_memberships',
  PROJECTION_RUNS: 'projection_runs',
  PROJECTION_RUN_METRICS: 'projection_run_metrics',
  TEAM_BUDGETS: 'team_budgets',
} as const;

/**
 * SCHEMA REGISTRY - Maps collection IDs to Zod schemas
 */
export const SCHEMA_REGISTRY = {
  [COLLECTIONS.COLLEGE_PLAYERS]: CollegePlayers,
  [COLLECTIONS.TEAMS]: Teams,
  [COLLECTIONS.GAMES]: Games, 
  [COLLECTIONS.RANKINGS]: Rankings,
  [COLLECTIONS.LEAGUES]: Leagues,
  [COLLECTIONS.USER_TEAMS]: Rosters,  // Updated key to use user_teams
  [COLLECTIONS.LINEUPS]: Lineups,
  [COLLECTIONS.AUCTIONS]: Auctions,
  [COLLECTIONS.AUCTION_SESSIONS]: Auctions, // Same schema as auctions
  [COLLECTIONS.BIDS]: Bids,
  [COLLECTIONS.AUCTION_BIDS]: Bids, // Same schema as bids
  [COLLECTIONS.PLAYER_STATS]: PlayerStats,
  // [COLLECTIONS.USERS]: Users, // Deprecated - use Appwrite Auth Users
  [COLLECTIONS.ACTIVITY_LOG]: ActivityLog,
  [COLLECTIONS.DRAFT_PICKS]: DraftPicks,
  [COLLECTIONS.MOCK_DRAFTS]: MockDrafts,
  [COLLECTIONS.MOCK_DRAFT_PICKS]: MockDraftPicks,
  [COLLECTIONS.MOCK_DRAFT_PARTICIPANTS]: MockDraftParticipants,
  [COLLECTIONS.DRAFTS]: Drafts,
  [COLLECTIONS.MATCHUPS]: Matchups,
  [COLLECTIONS.SCORES]: Scores,
  [COLLECTIONS.PLAYER_PROJECTIONS]: PlayerProjections,
  [COLLECTIONS.PROJECTIONS_YEARLY]: ProjectionsYearly,
  [COLLECTIONS.PROJECTIONS_WEEKLY]: ProjectionsWeekly,
  [COLLECTIONS.MODEL_INPUTS]: ModelInputs,
  [COLLECTIONS.USER_CUSTOM_PROJECTIONS]: UserCustomProjections,
  [COLLECTIONS.DRAFT_EVENTS]: DraftEvents,
  [COLLECTIONS.DRAFT_STATES]: DraftStates,
  [COLLECTIONS.LEAGUE_MEMBERSHIPS]: LeagueMemberships,
  [COLLECTIONS.PROJECTION_RUNS]: ProjectionRuns,
  [COLLECTIONS.PROJECTION_RUN_METRICS]: ProjectionRunMetrics,
  [COLLECTIONS.TEAM_BUDGETS]: TeamBudgets,
} as const;

/**
 * VALIDATION UTILITIES
 */
export function validateData<T>(collectionId: keyof typeof SCHEMA_REGISTRY, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const schema = SCHEMA_REGISTRY[collectionId];
  if (!schema) {
    return { success: false, errors: [`Unknown collection: ${collectionId}`] };
  }

  try {
    const validated = schema.parse(data);
    return { success: true, data: validated as T };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: [error.message || 'Unknown validation error'] };
  }
}

/**
 * TYPE-SAFE REPOSITORY BASE
 */
export abstract class ZodRepository<T> {
  constructor(
    protected collectionId: keyof typeof SCHEMA_REGISTRY,
    protected schema: z.ZodSchema<T>
  ) {}

  protected validate(data: unknown): T {
    const result = this.schema.parse(data);
    return result;
  }

  protected safeValidate(data: unknown): { success: boolean; data?: T; errors?: string[] } {
    return validateData<T>(this.collectionId, data);
  }
}