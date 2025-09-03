/**
 * Zod Schema Definitions
 * Auto-generated from live Appwrite schema
 * Generated: 2025-09-03T10:03:13.519Z
 * Total Collections: 29
 */

import { z } from 'zod'

// Collection: activity_log (ID: activity_log)
export const ActivityLog = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
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
  status: z.string().max(50).default("pending"),
  expiresAt: z.date().optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
  actorClientId: z.string().max(64).optional(),
  objectType: z.string().max(24).optional(),
  objectId: z.string().max(64).optional(),
  leagueId: z.string().max(64).optional(),
  ts: z.date(),
  payloadJson: z.string().max(16384).optional(),
})
export type ActivityLogType = z.infer<typeof ActivityLog>

// Collection: Auctions (ID: auctions)
export const Auctions = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(50),
  draftId: z.string().max(64),
  playerId: z.string().max(64),
  status: z.string().max(16),
  winnerTeamId: z.string().max(64).optional(),
  winningBid: z.number().optional(),
})
export type AuctionsType = z.infer<typeof Auctions>

// Collection: Bids (ID: bids)
export const Bids = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  auctionId: z.string().max(50),
  playerId: z.string().max(50),
  teamId: z.string().max(50),
  amount: z.number(),
  timestamp: z.date(),
  isWinning: z.boolean().default(false),
  fantasyTeamId: z.string().max(64),
  leagueId: z.string().max(64),
  sessionId: z.string().max(64),
  userId: z.string().max(64),
  bidAmount: z.number().int().min(1).max(9223372036854776000),
})
export type BidsType = z.infer<typeof Bids>

// Collection: clients (ID: clients)
export const Clients = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  authUserId: z.string().max(64),
  displayName: z.string().max(128).optional(),
  email: z.string().max(256).optional(),
  avatarUrl: z.string().max(512).optional(),
  createdAt: z.date(),
  lastLogin: z.date().optional(),
})
export type ClientsType = z.infer<typeof Clients>

// Collection: College Players (ID: college_players)
export const CollegePlayers = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
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
  depthChartOrder: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  schoolId: z.string().max(64),
  classYear: z.string().max(16).optional(),
  cfbdId: z.string().max(32).optional(),
  espnId: z.string().max(32).optional(),
})
export type CollegePlayersType = z.infer<typeof CollegePlayers>

// Collection: draft_events (ID: draft_events)
export const DraftEvents = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  draftId: z.string().max(64),
  type: z.string().max(24),
  round: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  overall: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  fantasyTeamId: z.string().max(64).optional(),
  playerId: z.string().max(64).optional(),
  ts: z.date().optional(),
  payloadJson: z.string().max(8192).optional(),
})
export type DraftEventsType = z.infer<typeof DraftEvents>

// Collection: Draft Picks (ID: draft_picks)
export const DraftPicks = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(64),
  draftId: z.string().max(64),
  playerId: z.string().max(64),
  authUserId: z.string().max(64),
  fantasyTeamId: z.string().max(64).optional(),
  round: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  pick: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  overallPick: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  timestamp: z.date(),
  playerName: z.string().max(100),
  playerPosition: z.string().max(10),
  playerTeam: z.string().max(50),
  playerConference: z.string().max(50).optional(),
  teamName: z.string().max(100),
  ownerDisplayName: z.string().max(100).optional(),
  adp: z.number().optional(),
  projectedPoints: z.number().optional(),
  actualPoints: z.number().optional(),
  isKeeper: z.boolean().default(false),
  onRoster: z.boolean().default(true),
})
export type DraftPicksType = z.infer<typeof DraftPicks>

// Collection: Draft States (ID: draft_states)
export const DraftStates = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  draftId: z.string().max(255),
  onClockTeamId: z.string().max(255),
  deadlineAt: z.date().optional(),
  round: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  pickIndex: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  draftStatus: z.string().default("pre-draft"),
})
export type DraftStatesType = z.infer<typeof DraftStates>

// Collection: drafts (ID: drafts)
export const Drafts = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(100).optional(),
  draftStatus: z.string().max(100).optional(),
  currentRound: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  currentPick: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  maxRounds: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  draftOrder: z.string().max(100).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  type: z.string().max(16).optional(),
  clockSeconds: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
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
})
export type DraftsType = z.infer<typeof Drafts>

// Collection: fantasy_teams (ID: fantasy_teams)
export const FantasyTeams = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(64),
  teamName: z.string().max(128),
  abbrev: z.string().max(8).optional(),
  logoUrl: z.string().max(512).optional(),
  wins: z.number().int().min(0).max(25).optional(),
  losses: z.number().int().min(0).max(25).optional(),
  ties: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  pointsFor: z.number().optional(),
  pointsAgainst: z.number().optional(),
  draftPosition: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  auctionBudgetTotal: z.number().optional(),
  auctionBudgetRemaining: z.number().optional(),
  displayName: z.string().max(255).optional(),
  ownerAuthUserId: z.string().max(64).optional(),
  leagueName: z.string().max(100).optional(),
  players: z.string().max(64).optional(),
})
export type FantasyTeamsType = z.infer<typeof FantasyTeams>

// Collection: Games (ID: games)
export const Games = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
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
})
export type GamesType = z.infer<typeof Games>

// Collection: invites (ID: invites)
export const Invites = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(100),
  email: z.string().max(100).optional(),
  inviteCode: z.string().max(100),
  token: z.string().max(100).optional(),
  status: z.string().max(100).optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  acceptedAt: z.date().optional(),
  invitedByAuthUserId: z.string().max(255).optional(),
})
export type InvitesType = z.infer<typeof Invites>

// Collection: league_memberships (ID: league_memberships)
export const LeagueMemberships = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(64),
  authUserId: z.string().max(64),
  role: z.string().max(16),
  status: z.string().max(16),
  joinedAt: z.date().optional(),
  displayName: z.string().max(255).optional(),
  leagueName: z.string().max(100).optional(),
})
export type LeagueMembershipsType = z.infer<typeof LeagueMemberships>

// Collection: Leagues (ID: leagues)
export const Leagues = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
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
  phase: z.string().max(16).default("scheduled"),
  engineVersion: z.string().max(3).default("v2"),
})
export type LeaguesType = z.infer<typeof Leagues>

// Collection: Lineups (ID: lineups)
export const Lineups = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  rosterId: z.string().max(50),
  week: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  season: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  lineup: z.string().max(5000).optional(),
  bench: z.string().max(5000).optional(),
  points: z.number().default(0),
  locked: z.boolean().default(false),
  fantasyTeamId: z.string().max(64),
})
export type LineupsType = z.infer<typeof Lineups>

// Collection: Mascot Download Tasks (ID: mascot_download_tasks)
export const MascotDownloadTasks = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  jobId: z.string().max(255),
  taskType: z.string().max(50),
  meshTaskId: z.string().max(255),
  status: z.string().max(50).default("pending"),
  modelUrls: z.string().max(2000).optional(),
  thumbnailUrl: z.string().max(500).optional(),
  createdAt: z.string().max(50).optional(),
})
export type MascotDownloadTasksType = z.infer<typeof MascotDownloadTasks>

// Collection: Mascot Jobs (ID: mascot_jobs)
export const MascotJobs = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  userId: z.string().max(255),
  state: z.string().max(50),
  category: z.string().max(50).optional(),
  subtype: z.string().max(100),
  palette: z.string().max(1000).optional(),
  previewTaskId: z.string().max(255).optional(),
  refineTaskId: z.string().max(255).optional(),
  rigTaskId: z.string().max(255).optional(),
  meshTaskType: z.string().max(50).optional(),
  meshTaskId: z.string().max(255).optional(),
  glbFileId: z.string().max(255).optional(),
  fbxFileId: z.string().max(255).optional(),
  usdzFileId: z.string().max(255).optional(),
  thumbnailUrl: z.string().max(500).optional(),
  error: z.string().max(1000).optional(),
  progress: z.number().int().min(0).max(100).default(0),
  createdAt: z.string().max(50).optional(),
  updatedAt: z.string().max(50).optional(),
  tempModelUrls: z.string().max(2000).optional(),
})
export type MascotJobsType = z.infer<typeof MascotJobs>

// Collection: Mascot Presets (ID: mascot_presets)
export const MascotPresets = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  category: z.string().max(50),
  subtype: z.string().max(100),
  promptTemplate: z.string().max(1000),
  negativePrompt: z.string().max(500).optional(),
  style: z.string().max(50),
  isHumanoid: z.boolean().default(false),
  defaults: z.string().max(1000).optional(),
  thumbnailUrl: z.string().max(500).optional(),
  previewUrl: z.string().max(500).optional(),
  popularity: z.number().int().min(0).max(100).default(0),
  tags: z.string().max(500).optional(),
})
export type MascotPresetsType = z.infer<typeof MascotPresets>

// Collection: Matchups (ID: matchups)
export const Matchups = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(64),
  season: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  week: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  homeTeamId: z.string().max(64),
  awayTeamId: z.string().max(64),
  homePoints: z.number().optional(),
  awayPoints: z.number().optional(),
  status: z.string().max(16).optional(),
  homeRosterId: z.string().max(64),
  awayRosterId: z.string().max(64),
})
export type MatchupsType = z.infer<typeof Matchups>

// Collection: meshy_jobs (ID: meshy_jobs)
export const MeshyJobs = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
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
})
export type MeshyJobsType = z.infer<typeof MeshyJobs>

// Collection: Database Migrations (ID: migrations)
export const Migrations = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  migrationId: z.string().max(255),
  name: z.string().max(255),
  appliedAt: z.date(),
  version: z.string().max(100),
  applied: z.date(),
  checksum: z.string().max(200),
})
export type MigrationsType = z.infer<typeof Migrations>

// Collection: model_runs (ID: model_runs)
export const ModelRuns = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  season: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  week: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
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
  version: z.number().int().min(1).max(9223372036854776000),
})
export type ModelRunsType = z.infer<typeof ModelRuns>

// Collection: Model Versions (ID: model_versions)
export const ModelVersions = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  versionId: z.string().max(100),
  modelPath: z.string().max(1000),
  version: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  changes: z.array(z.string().max(65536)),
  createdAt: z.date(),
  createdBy: z.string().max(100),
  description: z.string().max(1000),
  glbUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  bucketFileId: z.string().max(100).optional(),
  artifactUri: z.string().max(512).optional(),
})
export type ModelVersionsType = z.infer<typeof ModelVersions>

// Collection: Player Stats (ID: player_stats)
export const PlayerStats = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  playerId: z.string().max(50),
  gameId: z.string().max(50),
  week: z.number().int().min(1).max(20),
  season: z.number().int().min(2020).max(2030),
  stats: z.string().max(2000),
  opponent: z.string().max(50).optional(),
  eligible: z.boolean().default(true),
  fantasyPoints: z.number().optional(),
  statlineJson: z.string().max(65535).optional(),
})
export type PlayerStatsType = z.infer<typeof PlayerStats>

// Collection: projections (ID: projections)
export const Projections = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  playerId: z.string().max(64),
  season: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  week: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  period: z.string().max(16),
  version: z.number().int().min(-9223372036854776000).max(9223372036854776000),
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
  rankPro: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  startSit_color: z.string().max(8).optional(),
  utilizationTrend: z.string().max(16).optional(),
  defenseVsPosGrade: z.number().optional(),
  startSitColor: z.string().max(20).optional(),
  teamTotalEst: z.number().optional(),
})
export type ProjectionsType = z.infer<typeof Projections>

// Collection: AP Rankings (ID: rankings)
export const Rankings = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  week: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  season: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  pollType: z.string().max(20),
  team: z.string().max(50),
  rank: z.number().int().min(-9223372036854776000).max(9223372036854776000),
  points: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  firstPlaceVotes: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  source: z.string().max(24),
  schoolId: z.string().max(64),
})
export type RankingsType = z.infer<typeof Rankings>

// Collection: roster_slots (ID: roster_slots)
export const RosterSlots = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  fantasyTeamId: z.string().max(64),
  playerId: z.string().max(64),
  position: z.string().max(8),
  acquiredVia: z.string().max(16).optional(),
  acquiredAt: z.date().optional(),
})
export type RosterSlotsType = z.infer<typeof RosterSlots>

// Collection: schools (ID: schools)
export const Schools = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  name: z.string().max(128),
  conference: z.string().max(16),
  slug: z.string().max(64).optional(),
  abbreviation: z.string().max(16).optional(),
  logoUrl: z.string().max(512).optional(),
  primaryColor: z.string().max(16).optional(),
  secondaryColor: z.string().max(16).optional(),
  mascot: z.string().max(64).optional(),
})
export type SchoolsType = z.infer<typeof Schools>

// Collection: Transactions (ID: transactions)
export const Transactions = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
  leagueId: z.string().max(64),
  fantasyTeamId: z.string().max(64),
  type: z.string().max(24),
  payloadJson: z.string().max(8192).optional(),
  season: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  week: z.number().int().min(-9223372036854776000).max(9223372036854776000).optional(),
  ts: z.date().optional(),
})
export type TransactionsType = z.infer<typeof Transactions>


// Export all schemas
export const schemas = {
  activity_log: ActivityLog,
  auctions: Auctions,
  bids: Bids,
  clients: Clients,
  college_players: CollegePlayers,
  draft_events: DraftEvents,
  draft_picks: DraftPicks,
  draft_states: DraftStates,
  drafts: Drafts,
  fantasy_teams: FantasyTeams,
  games: Games,
  invites: Invites,
  league_memberships: LeagueMemberships,
  leagues: Leagues,
  lineups: Lineups,
  mascot_download_tasks: MascotDownloadTasks,
  mascot_jobs: MascotJobs,
  mascot_presets: MascotPresets,
  matchups: Matchups,
  meshy_jobs: MeshyJobs,
  migrations: Migrations,
  model_runs: ModelRuns,
  model_versions: ModelVersions,
  player_stats: PlayerStats,
  projections: Projections,
  rankings: Rankings,
  roster_slots: RosterSlots,
  schools: Schools,
  transactions: Transactions,
} as const

// Export type for all schemas
export type Schemas = typeof schemas
