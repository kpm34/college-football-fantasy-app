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
  status: z.enum(['open', 'full', 'drafting', 'active', 'complete']).default('open'),
  isPublic: z.boolean().default(true),
  pickTimeSeconds: z.number().int().min(30).max(600).default(90),
  scoringRules: z.string().max(2000).optional(), // JSON string
  draftDate: z.date().optional(),
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
  currentPlayer: z.string().max(50).optional(),
  currentBid: z.number().min(0).default(0),
  currentBidder: z.string().max(50).optional(),
  timeRemaining: z.number().int().min(0).default(0),
  status: z.enum(['waiting', 'active', 'complete']).default('waiting'),
  completedPlayers: z.string().max(10000).default('[]'), // JSON array
  nominatingTeam: z.string().max(50).optional()
});

export const Bids = z.object({
  auctionId: z.string().min(1).max(50),
  playerId: z.string().min(1).max(50),
  bidderId: z.string().min(1).max(50),
  amount: z.number().min(1).max(1000),
  timestamp: z.date().default(() => new Date())
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

export const Users = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  emailVerification: z.boolean().default(false),
  preferences: z.string().max(2000).optional(), // JSON preferences
  created: z.date().default(() => new Date()),
  lastLogin: z.date().optional()
});

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
  fantasy_points: z.number().optional(),
  data: z.string().max(10000).optional() // JSON payload
});

export const ProjectionsYearly = z.object({
  playerId: z.string().min(1).max(50),
  season: z.number().int().min(2020).max(2035),
  fantasy_points: z.number().optional()
});

export const ProjectionsWeekly = z.object({
  playerId: z.string().min(1).max(50),
  season: z.number().int().min(2020).max(2035),
  week: z.number().int().min(1).max(20),
  fantasy_points: z.number().optional()
});

export const ModelInputs = z.object({
  season: z.number().int().min(2020).max(2035),
  depth_chart_json: z.string().optional(),
  team_pace_json: z.string().optional(),
  pass_rush_rates_json: z.string().optional(),
  opponent_grades_by_pos_json: z.string().optional(),
  injury_reports_json: z.string().optional(),
  vegas_json: z.string().optional(),
  manual_overrides_json: z.string().optional()
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
 * Matchups (weekly head-to-head)
 */
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
export type User = z.infer<typeof Users>;
export type ActivityLogEntry = z.infer<typeof ActivityLog>;

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
  BIDS: 'bids',
  PLAYER_STATS: 'player_stats',
  USERS: 'users',
  ACTIVITY_LOG: 'activity_log',
  DRAFT_PICKS: 'draft_picks',
  MOCK_DRAFTS: 'mock_drafts',
  MOCK_DRAFT_PICKS: 'mock_draft_picks',
  MOCK_DRAFT_PARTICIPANTS: 'mock_draft_participants',
  MATCHUPS: 'matchups',
  PLAYER_PROJECTIONS: 'player_projections',
  PROJECTIONS_YEARLY: 'projections_yearly',
  PROJECTIONS_WEEKLY: 'projections_weekly',
  MODEL_INPUTS: 'model_inputs',
  USER_CUSTOM_PROJECTIONS: 'user_custom_projections',
  DRAFT_EVENTS: 'draft_events',
  DRAFT_STATES: 'draft_states',
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
  [COLLECTIONS.BIDS]: Bids,
  [COLLECTIONS.PLAYER_STATS]: PlayerStats,
  [COLLECTIONS.USERS]: Users,
  [COLLECTIONS.ACTIVITY_LOG]: ActivityLog,
  [COLLECTIONS.DRAFT_PICKS]: DraftPicks,
  [COLLECTIONS.MOCK_DRAFTS]: MockDrafts,
  [COLLECTIONS.MOCK_DRAFT_PICKS]: MockDraftPicks,
  [COLLECTIONS.MOCK_DRAFT_PARTICIPANTS]: MockDraftParticipants,
  [COLLECTIONS.MATCHUPS]: Matchups,
  [COLLECTIONS.PLAYER_PROJECTIONS]: PlayerProjections,
  [COLLECTIONS.PROJECTIONS_YEARLY]: ProjectionsYearly,
  [COLLECTIONS.PROJECTIONS_WEEKLY]: ProjectionsWeekly,
  [COLLECTIONS.MODEL_INPUTS]: ModelInputs,
  [COLLECTIONS.USER_CUSTOM_PROJECTIONS]: UserCustomProjections,
  [COLLECTIONS.DRAFT_EVENTS]: DraftEvents,
  [COLLECTIONS.DRAFT_STATES]: DraftStates,
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