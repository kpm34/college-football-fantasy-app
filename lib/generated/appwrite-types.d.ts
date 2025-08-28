// AUTO-GENERATED. Do not edit by hand.
export type CollectionId = 'fantasy_teams' | 'leagues' | 'college_players' | 'games' | 'rankings' | 'draft_events' | 'draft_states' | 'roster_slots' | 'schools' | 'clients' | 'league_memberships' | 'lineups' | 'matchups' | 'player_stats' | 'projections' | 'model_runs' | 'transactions' | 'auctions' | 'bids' | 'activity_log' | 'invites' | 'meshy_jobs' | 'model_versions' | 'migrations' | 'drafts'

export interface FantasyTeamsDoc {
  leagueId: string
  leagueName?: string
  teamName: string
  ownerAuthUserId?: string
  displayName?: string
  abbrev?: string
  logoUrl?: string
  wins?: number
  losses?: number
  ties?: number
  pointsFor?: number
  pointsAgainst?: number
  draftPosition?: number
  auctionBudgetTotal?: number
  auctionBudgetRemaining?: number
  players?: string
}

export interface LeaguesDoc {
  leagueName: string
  season: number
  maxTeams?: number
  currentTeams?: number
  leagueStatus?: string
  gameMode?: string
  draftType?: string
  isPublic?: boolean
  pickTimeSeconds?: number
  draftDate?: string
  selectedConference?: string
  seasonStartWeek?: number
  playoffTeams?: number
  playoffStartWeek?: number
  waiverType?: string
  waiverBudget?: number
  password?: string
  commissionerAuthUserId?: string
  scoringRules?: string
  draftOrder?: string
}

export interface CollegePlayersDoc {
  name: string
  position: string
  team: string
  conference: string
  schoolId: string
  year?: string
  classYear?: string
  jerseyNumber?: number
  height?: string
  weight?: number
  eligible?: boolean
  fantasyPoints?: number
  seasonFantasyPoints?: number
  depthChartOrder?: number
  cfbdId?: string
  espnId?: string
}

export interface GamesDoc {
  week: number
  season: number
  seasonType: string
  date: string
  kickoffAt: string
  startDate: string
  homeTeam: string
  awayTeam: string
  homeSchoolId: string
  awaySchoolId: string
  homeScore?: number
  awayScore?: number
  status?: string
  eligible?: boolean
  eligibleGame: boolean
  completed: boolean
}

export interface RankingsDoc {
  week: number
  season: number
  pollType: string
  team: string
  schoolId: string
  rank: number
  points?: number
  firstPlaceVotes?: number
  source: string
}

export interface DraftEventsDoc {
  draftId: string
  type: string
  round?: number
  overall?: number
  fantasyTeamId?: string
  playerId?: string
  ts?: string
  payloadJson?: string
}

export interface DraftStatesDoc {
  draftId: string
  onClockTeamId: string
  deadlineAt?: string
  round: number
  pickIndex: number
  draftStatus?: string
}

export interface RosterSlotsDoc {
  fantasyTeamId: string
  playerId: string
  position: string
  acquiredVia?: string
  acquiredAt?: string
}

export interface SchoolsDoc {
  name: string
  conference: string
  slug?: string
  abbreviation?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  mascot?: string
}

export interface ClientsDoc {
  authUserId: string
  displayName?: string
  email?: string
  avatarUrl?: string
  createdAt: string
  lastLogin?: string
}

export interface LeagueMembershipsDoc {
  leagueId: string
  authUserId: string
  role: string
  status: string
  joinedAt?: string
  displayName?: string
  leagueName?: string
}

export interface LineupsDoc {
  rosterId: string
  fantasyTeamId: string
  week: number
  season: number
  lineup?: string
  bench?: string
  points?: number
  locked?: boolean
}

export interface MatchupsDoc {
  leagueId: string
  season: number
  week: number
  homeTeamId: string
  awayTeamId: string
  homePoints?: number
  awayPoints?: number
  status?: string
}

export interface PlayerStatsDoc {
  playerId: string
  gameId: string
  week: number
  season: number
  stats: string
  opponent?: string
  eligible?: boolean
  fantasyPoints?: number
  statlineJson?: string
}

export interface ProjectionsDoc {
  playerId: string
  season: number
  week?: number
  period: string
  version: number
  model?: string
  source?: string
  clientId?: string
  fantasyPoints?: number
  componentsJson?: string
  boomProb?: number
  bustProb?: number
  homeAway?: string
  injuryStatus?: string
  opponentSchoolId?: string
  rankPro?: number
  startSit_color?: string
  utilizationTrend?: string
  defenseVsPosGrade?: number
  startSitColor?: string
  teamTotalEst?: number
}

export interface ModelRunsDoc {
  season: number
  week?: number
  scope: string
  sources?: string
  status: string
  runId?: string
  modelVersionId?: string
  startedAt?: string
  finishedAt?: string
  inputsJson?: string
  metricsJson?: string
  weightsJson?: string
}

export interface TransactionsDoc {
  leagueId: string
  fantasyTeamId: string
  type: string
  payloadJson?: string
  season?: number
  week?: number
  ts?: string
}

export interface AuctionsDoc {
  leagueId: string
  draftId: string
  playerId: string
  status: string
  winnerTeamId?: string
  winningBid?: number
}

export interface BidsDoc {
  auctionId: string
  playerId: string
  teamId: string
  amount: number
  timestamp: string
  isWinning?: boolean
  fantasyTeamId: string
}

export interface ActivityLogDoc {
  userId?: string
  action: string
  details?: string
  timestamp: string
  type: string
  teamId?: string
  description: string
  data?: string
  createdAt: string
  inviteToken?: string
  status?: string
  expiresAt?: string
  ipAddress?: string
  userAgent?: string
  actorClientId?: string
  objectType?: string
  objectId?: string
  leagueId?: string
  ts: string
  payloadJson?: string
}

export interface InvitesDoc {
  leagueId: string
  email?: string
  inviteCode: string
  token?: string
  status?: string
  expiresAt?: string
  createdAt: string
  acceptedAt?: string
  invitedByAuthUserId?: string
}

export interface MeshyJobsDoc {
  resultUrl?: string
  mode?: string
  prompt?: string
  userId?: string
  error?: string
  webhookSecret?: string
  createdAt: string
  imageUrl?: string
  baseModelUrl?: string
  status?: string
  updatedAt?: string
}

export interface ModelVersionsDoc {
  versionId: string
  modelPath: string
  version: number
  changes?: string
  createdAt: string
  createdBy: string
  description: string
  glbUrl?: string
  thumbnailUrl?: string
  bucketFileId?: string
  artifactUri?: string
}

export interface MigrationsDoc {
  migrationId: string
  name: string
  appliedAt: string
}

export interface DraftsDoc {
  leagueId?: string
  draftStatus?: string
  currentRound?: number
  currentPick?: number
  maxRounds?: number
  draftOrder?: string
  startTime?: string
  endTime?: string
  type?: string
  clockSeconds?: number
  orderJson?: string
  isMock?: boolean
  leagueName?: string
  gameMode?: string
  selectedConference?: string
  maxTeams?: number
  scoringRules?: string
  stateJson?: string
  eventsJson?: string
  picksJson?: string
  onTheClock?: string
  lastPickTime?: string
}
