// Single Source of Truth: all schemas defined in this file
/**
 * ZOD-FIRST SINGLE SOURCE OF TRUTH
 * 
 * All database schemas, TypeScript types, and validation rules 
 * are defined here using Zod. Everything else is inferred.
 * 
 * Generated from live Appwrite schema on 2025-09-03T09:36:22.858Z
 */

import { z } from "zod";

/**
 * LIVE APPWRITE COLLECTIONS - Zod Schemas
 * Total Collections: 25
 */

// Collection: activity_log (ID: activity_log)
export const ActivityLog = z.object({
  userId: z.string().max(100).optional(),
  action: z.string().max(100),
  details: z.string().max(100).optional(),
  timestamp: z.date(),
  type: z.string().max(50),
  teamId: z.string().max(255).optional(),
  description: z.string().max(1000),
  data: z.string().max(5000).optional(),
  createdAt: z.date(),
  inviteToken: z.string().max(255).optional(),
  status: z.string().max(50).default('pending').optional(),
  expiresAt: z.date().optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
  actorClientId: z.string().max(64).optional(),
  objectType: z.string().max(24).optional(),
  objectId: z.string().max(64).optional(),
  leagueId: z.string().max(64).optional(),
  ts: z.date(),
  payloadJson: z.string().max(16384).optional(),
});

// Collection: AP Rankings (ID: rankings)
export const Rankings = z.object({
  week: z.number().int(),
  season: z.number().int(),
  pollType: z.string().max(20),
  team: z.string().max(50),
  rank: z.number().int(),
  points: z.number().int().optional(),
  firstPlaceVotes: z.number().int().optional(),
  source: z.string().max(24),
  schoolId: z.string().max(64),
});

// Collection: Auctions (ID: auctions)
export const Auctions = z.object({
  leagueId: z.string().max(50),
  draftId: z.string().max(64),
  playerId: z.string().max(64),
  status: z.string().max(16),
  winnerTeamId: z.string().max(64).optional(),
  winningBid: z.number().optional(),
});

// Collection: Bids (ID: bids)
export const Bids = z.object({
  auctionId: z.string().max(50),
  playerId: z.string().max(50),
  teamId: z.string().max(50),
  amount: z.number(),
  timestamp: z.date(),
  isWinning: z.boolean().default(false).optional(),
  fantasyTeamId: z.string().max(64),
  leagueId: z.string().max(64),
  sessionId: z.string().max(64),
  userId: z.string().max(64),
  bidAmount: z.number().int().min(1),
});

// Collection: clients (ID: clients)
export const Clients = z.object({
  authUserId: z.string().max(64),
  displayName: z.string().max(128).optional(),
  email: z.string().max(256).optional(),
  avatarUrl: z.string().max(512).optional(),
  createdAt: z.date(),
  lastLogin: z.date().optional(),
});

// Collection: College Players (ID: college_players)
export const CollegePlayers = z.object({
  name: z.string().max(100),
  position: z.string().max(10),
  team: z.string().max(50),
  conference: z.string().max(20),
  year: z.string().max(10).optional(),
  jerseyNumber: z.number().int().min(0).max(99).optional(),
  height: z.string().max(10).optional(),
  weight: z.number().int().min(150).max(400).optional(),
  eligible: z.boolean().optional(),
  fantasyPoints: z.number().optional(),
  seasonFantasyPoints: z.number().optional(),
  depthChartOrder: z.number().int().optional(),
  schoolId: z.string().max(64),
  classYear: z.string().max(16).optional(),
  cfbdId: z.string().max(32).optional(),
  espnId: z.string().max(32).optional(),
});

// Collection: Database Migrations (ID: migrations)
export const Migrations = z.object({
  migrationId: z.string().max(255),
  name: z.string().max(255),
  appliedAt: z.date(),
  version: z.string().max(100),
  applied: z.date(),
  checksum: z.string().max(200),
});

// Collection: Draft States (ID: draft_states)
export const DraftStates = z.object({
  draftId: z.string().max(255),
  onClockTeamId: z.string().max(255),
  deadlineAt: z.date().optional(),
  round: z.number().int(),
  pickIndex: z.number().int(),
  draftStatus: z.string().default('pre-draft').optional(),
});

// Collection: draft_events (ID: draft_events)
export const DraftEvents = z.object({
  draftId: z.string().max(64),
  type: z.string().max(24),
  round: z.number().int().optional(),
  overall: z.number().int().optional(),
  fantasyTeamId: z.string().max(64).optional(),
  playerId: z.string().max(64).optional(),
  ts: z.date().optional(),
  payloadJson: z.string().max(8192).optional(),
});

// Collection: drafts (ID: drafts)
export const Drafts = z.object({
  leagueId: z.string().max(100).optional(),
  draftStatus: z.string().max(100).optional(),
  currentRound: z.number().int().optional(),
  currentPick: z.number().int().optional(),
  maxRounds: z.number().int().optional(),
  draftOrder: z.string().max(100).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  type: z.string().max(16).optional(),
  clockSeconds: z.number().int().optional(),
  orderJson: z.string().max(8192).optional(),
  isMock: z.boolean().optional(),
  leagueName: z.string().max(255).optional(),
  gameMode: z.string().max(50).optional(),
  selectedConference: z.string().max(50).optional(),
  maxTeams: z.number().int().min(4).max(24).optional(),
  scoringRules: z.string().max(65535).optional(),
  stateJson: z.string().max(1000000).optional(),
  eventsJson: z.string().max(1000000).optional(),
  picksJson: z.string().max(1000000).optional(),
  onTheClock: z.string().max(255).optional(),
  lastPickTime: z.date().optional(),
});

// Collection: fantasy_teams (ID: fantasy_teams)
export const FantasyTeams = z.object({
  leagueId: z.string().max(64),
  teamName: z.string().max(128),
  abbrev: z.string().max(8).optional(),
  logoUrl: z.string().max(512).optional(),
  wins: z.number().int().min(0).max(25).optional(),
  losses: z.number().int().min(0).max(25).optional(),
  ties: z.number().int().optional(),
  pointsFor: z.number().optional(),
  pointsAgainst: z.number().optional(),
  draftPosition: z.number().int().optional(),
  auctionBudgetTotal: z.number().optional(),
  auctionBudgetRemaining: z.number().optional(),
  displayName: z.string().max(255).optional(),
  ownerAuthUserId: z.string().max(64).optional(),
  leagueName: z.string().max(100).optional(),
  players: z.string().max(64).optional(),
});

// Collection: Games (ID: games)
export const Games = z.object({
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  seasonType: z.string().max(20),
  date: z.date(),
  homeTeam: z.string().max(50),
  awayTeam: z.string().max(50),
  homeScore: z.number().int().min(0).max(200).optional(),
  awayScore: z.number().int().min(0).max(200).optional(),
  status: z.string().max(20).optional(),
  eligible: z.boolean().optional(),
  startDate: z.date(),
  completed: z.boolean(),
  eligibleGame: z.boolean(),
  homeSchoolId: z.string().max(64),
  awaySchoolId: z.string().max(64),
  kickoffAt: z.date(),
});

// Collection: invites (ID: invites)
export const Invites = z.object({
  leagueId: z.string().max(100),
  email: z.string().max(100).optional(),
  inviteCode: z.string().max(100),
  token: z.string().max(100).optional(),
  status: z.string().max(100).optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  acceptedAt: z.date().optional(),
  invitedByAuthUserId: z.string().max(255).optional(),
});

// Collection: league_memberships (ID: league_memberships)
export const LeagueMemberships = z.object({
  leagueId: z.string().max(64),
  authUserId: z.string().max(64),
  role: z.string().max(16),
  status: z.string().max(16),
  joinedAt: z.date().optional(),
  displayName: z.string().max(255).optional(),
  leagueName: z.string().max(100).optional(),
});

// Collection: Leagues (ID: leagues)
export const Leagues = z.object({
  leagueName: z.string().max(100),
  season: z.number().int().min(2020).max(2030),
  maxTeams: z.number().int().min(2).max(32).optional(),
  leagueStatus: z.string().max(20).optional(),
  gameMode: z.string().max(20).optional(),
  draftType: z.string().max(20).optional(),
  isPublic: z.boolean().optional(),
  currentTeams: z.number().int().min(0).max(20).optional(),
  pickTimeSeconds: z.number().int().min(30).max(600).optional(),
  draftDate: z.date().optional(),
  selectedConference: z.string().max(50).optional(),
  seasonStartWeek: z.number().int().min(1).max(20).optional(),
  playoffTeams: z.number().int().min(0).max(20).optional(),
  playoffStartWeek: z.number().int().min(1).max(20).optional(),
  waiverType: z.string().max(20).optional(),
  waiverBudget: z.number().int().min(0).max(1000).optional(),
  password: z.string().max(50).optional(),
  commissionerAuthUserId: z.string().max(64).optional(),
  scoringRules: z.string().max(65535).optional(),
  draftOrder: z.string().max(65535).optional(),
  phase: z.string().max(16).default('scheduled').optional(),
  engineVersion: z.string().max(3).default('v2').optional(),
});

// Collection: Lineups (ID: lineups)
export const Lineups = z.object({
  rosterId: z.string().max(50),
  week: z.number().int(),
  season: z.number().int(),
  lineup: z.string().max(5000).optional(),
  bench: z.string().max(5000).optional(),
  points: z.number().default(0).optional(),
  locked: z.boolean().default(false).optional(),
  fantasyTeamId: z.string().max(64),
});

// Collection: Matchups (ID: matchups)
export const Matchups = z.object({
  leagueId: z.string().max(64),
  season: z.number().int(),
  week: z.number().int(),
  homeTeamId: z.string().max(64),
  awayTeamId: z.string().max(64),
  homePoints: z.number().optional(),
  awayPoints: z.number().optional(),
  status: z.string().max(16).optional(),
  homeRosterId: z.string().max(64),
  awayRosterId: z.string().max(64),
});

// Collection: meshy_jobs (ID: meshy_jobs)
export const MeshyJobs = z.object({
  resultUrl: z.string().max(1024).optional(),
  mode: z.string().max(32).optional(),
  prompt: z.string().max(2048).optional(),
  userId: z.string().max(128).optional(),
  error: z.string().max(1024).optional(),
  webhookSecret: z.string().max(256).optional(),
  createdAt: z.date(),
  imageUrl: z.string().max(1024).optional(),
  baseModelUrl: z.string().max(1024).optional(),
  status: z.string().max(16).optional(),
  updatedAt: z.date().optional(),
});

// Collection: Model Versions (ID: model_versions)
export const ModelVersions = z.object({
  versionId: z.string().max(100),
  modelPath: z.string().max(1000),
  version: z.number().int(),
  changes: z.string().max(65536).array().optional(),
  createdAt: z.date(),
  createdBy: z.string().max(100),
  description: z.string().max(1000),
  glbUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  bucketFileId: z.string().max(100).optional(),
  artifactUri: z.string().max(512).optional(),
});

// Collection: model_runs (ID: model_runs)
export const ModelRuns = z.object({
  season: z.number().int(),
  week: z.number().int().optional(),
  scope: z.string().max(32),
  sources: z.string().max(512).optional(),
  status: z.string().max(16),
  runId: z.string().max(255).optional(),
  modelVersionId: z.string().max(255).optional(),
  startedAt: z.date().optional(),
  finishedAt: z.date().optional(),
  inputsJson: z.string().max(65535).optional(),
  metricsJson: z.string().max(65535).optional(),
  weightsJson: z.string().max(65535).optional(),
  version: z.number().int().min(1),
});

// Collection: Player Stats (ID: player_stats)
export const PlayerStats = z.object({
  playerId: z.string().max(50),
  gameId: z.string().max(50),
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  stats: z.string().max(2000),
  opponent: z.string().max(50).optional(),
  eligible: z.boolean().default(true).optional(),
  fantasyPoints: z.number().optional(),
  statlineJson: z.string().max(65535).optional(),
});

// Collection: projections (ID: projections)
export const Projections = z.object({
  playerId: z.string().max(64),
  season: z.number().int(),
  week: z.number().int().optional(),
  period: z.string().max(16),
  version: z.number().int(),
  model: z.string().max(32).optional(),
  source: z.string().max(16).optional(),
  clientId: z.string().max(64).optional(),
  fantasyPoints: z.number().optional(),
  componentsJson: z.string().max(16384).optional(),
  boomProb: z.number().optional(),
  bustProb: z.number().optional(),
  homeAway: z.string().max(8).optional(),
  injuryStatus: z.string().max(16).optional(),
  opponentSchoolId: z.string().max(64).optional(),
  rankPro: z.number().int().optional(),
  startSit_color: z.string().max(8).optional(),
  utilizationTrend: z.string().max(16).optional(),
  defenseVsPosGrade: z.number().optional(),
  startSitColor: z.string().max(20).optional(),
  teamTotalEst: z.number().optional(),
});

// Collection: roster_slots (ID: roster_slots)
export const RosterSlots = z.object({
  fantasyTeamId: z.string().max(64),
  playerId: z.string().max(64),
  position: z.string().max(8),
  acquiredVia: z.string().max(16).optional(),
  acquiredAt: z.date().optional(),
});

// Collection: schools (ID: schools)
export const Schools = z.object({
  name: z.string().max(128),
  conference: z.string().max(16),
  slug: z.string().max(64).optional(),
  abbreviation: z.string().max(16).optional(),
  logoUrl: z.string().max(512).optional(),
  primaryColor: z.string().max(16).optional(),
  secondaryColor: z.string().max(16).optional(),
  mascot: z.string().max(64).optional(),
});

// Collection: Transactions (ID: transactions)
export const Transactions = z.object({
  leagueId: z.string().max(64),
  fantasyTeamId: z.string().max(64),
  type: z.string().max(24),
  payloadJson: z.string().max(8192).optional(),
  season: z.number().int().optional(),
  week: z.number().int().optional(),
  ts: z.date().optional(),
});

/**
 * TYPESCRIPT TYPE EXPORTS
 */

export type ActivityLogType = z.infer<typeof ActivityLog>;
export type RankingsType = z.infer<typeof Rankings>;
export type AuctionsType = z.infer<typeof Auctions>;
export type BidsType = z.infer<typeof Bids>;
export type ClientsType = z.infer<typeof Clients>;
export type CollegePlayersType = z.infer<typeof CollegePlayers>;
export type MigrationsType = z.infer<typeof Migrations>;
export type DraftStatesType = z.infer<typeof DraftStates>;
export type DraftEventsType = z.infer<typeof DraftEvents>;
export type DraftsType = z.infer<typeof Drafts>;
export type FantasyTeamsType = z.infer<typeof FantasyTeams>;
export type GamesType = z.infer<typeof Games>;
export type InvitesType = z.infer<typeof Invites>;
export type LeagueMembershipsType = z.infer<typeof LeagueMemberships>;
export type LeaguesType = z.infer<typeof Leagues>;
export type LineupsType = z.infer<typeof Lineups>;
export type MatchupsType = z.infer<typeof Matchups>;
export type MeshyJobsType = z.infer<typeof MeshyJobs>;
export type ModelVersionsType = z.infer<typeof ModelVersions>;
export type ModelRunsType = z.infer<typeof ModelRuns>;
export type PlayerStatsType = z.infer<typeof PlayerStats>;
export type ProjectionsType = z.infer<typeof Projections>;
export type RosterSlotsType = z.infer<typeof RosterSlots>;
export type SchoolsType = z.infer<typeof Schools>;
export type TransactionsType = z.infer<typeof Transactions>;

/**
 * COLLECTION ID MAPPINGS
 */

export const COLLECTIONS = {
  ACTIVITYLOG: 'activity_log',
  RANKINGS: 'rankings',
  AUCTIONS: 'auctions',
  BIDS: 'bids',
  CLIENTS: 'clients',
  COLLEGEPLAYERS: 'college_players',
  MIGRATIONS: 'migrations',
  DRAFTSTATES: 'draft_states',
  DRAFTEVENTS: 'draft_events',
  DRAFTS: 'drafts',
  FANTASYTEAMS: 'fantasy_teams',
  GAMES: 'games',
  INVITES: 'invites',
  LEAGUEMEMBERSHIPS: 'league_memberships',
  LEAGUES: 'leagues',
  LINEUPS: 'lineups',
  MATCHUPS: 'matchups',
  MESHYJOBS: 'meshy_jobs',
  MODELVERSIONS: 'model_versions',
  MODELRUNS: 'model_runs',
  PLAYERSTATS: 'player_stats',
  PROJECTIONS: 'projections',
  ROSTERSLOTS: 'roster_slots',
  SCHOOLS: 'schools',
  TRANSACTIONS: 'transactions',
} as const;

export const COLLECTION_NAMES = {
  'activity_log': 'activity_log',
  'rankings': 'AP Rankings',
  'auctions': 'Auctions',
  'bids': 'Bids',
  'clients': 'clients',
  'college_players': 'College Players',
  'migrations': 'Database Migrations',
  'draft_states': 'Draft States',
  'draft_events': 'draft_events',
  'drafts': 'drafts',
  'fantasy_teams': 'fantasy_teams',
  'games': 'Games',
  'invites': 'invites',
  'league_memberships': 'league_memberships',
  'leagues': 'Leagues',
  'lineups': 'Lineups',
  'matchups': 'Matchups',
  'meshy_jobs': 'meshy_jobs',
  'model_versions': 'Model Versions',
  'model_runs': 'model_runs',
  'player_stats': 'Player Stats',
  'projections': 'projections',
  'roster_slots': 'roster_slots',
  'schools': 'schools',
  'transactions': 'Transactions',
} as const;
