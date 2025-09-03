/**
 * Appwrite Database Schema Definition
 * Generated from live database: college-football-fantasy
 * 
 * This file defines the complete schema for all collections in the database.
 * It serves as a reference for TypeScript types and Appwrite collection structure.
 */

export interface SchemaAttribute {
  key: string;
  type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'email' | 'enum' | 'url' | 'ip';
  required: boolean;
  array?: boolean;
  size?: number;
  min?: number;
  max?: number;
  default?: any;
  elements?: string[];
}

export interface SchemaIndex {
  key: string;
  type: 'key' | 'unique' | 'fulltext';
  attributes: string[];
  orders?: ('ASC' | 'DESC')[];
}

export interface SchemaCollection {
  id: string;
  name: string;
  attributes: SchemaAttribute[];
  indexes: SchemaIndex[];
  documentSecurity?: boolean;
  enabled?: boolean;
}

/**
 * Complete Database Schema
 * Based on live Appwrite database snapshot
 */
export const SCHEMA: Record<string, SchemaCollection> = {
  // Fantasy Teams (formerly user_teams/rosters)
  fantasy_teams: {
    id: 'fantasy_teams',
    name: 'Fantasy Teams',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true, size: 64 },
      { key: 'leagueName', type: 'string', required: false, size: 100 },
      { key: 'teamName', type: 'string', required: true, size: 128 },
      { key: 'ownerAuthUserId', type: 'string', required: false, size: 64 },
      { key: 'displayName', type: 'string', required: false, size: 255 },
      { key: 'abbrev', type: 'string', required: false, size: 8 },
      { key: 'logoUrl', type: 'string', required: false, size: 512 },
      { key: 'wins', type: 'integer', required: false, min: 0, max: 25 },
      { key: 'losses', type: 'integer', required: false, min: 0, max: 25 },
      { key: 'ties', type: 'integer', required: false, min: 0, max: 25 },
      { key: 'pointsFor', type: 'double', required: false },
      { key: 'pointsAgainst', type: 'double', required: false },
      { key: 'draftPosition', type: 'integer', required: false, min: 1, max: 32 },
      { key: 'auctionBudgetTotal', type: 'double', required: false, min: 0 },
      { key: 'auctionBudgetRemaining', type: 'double', required: false, min: 0 },
      { key: 'players', type: 'string', required: false, size: 65535 },
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
      { key: 'owner_idx', type: 'key', attributes: ['ownerAuthUserId'] },
      { key: 'league_owner_idx', type: 'key', attributes: ['leagueId', 'ownerAuthUserId'] },
    ]
  },

  // Leagues
  leagues: {
    id: 'leagues',
    name: 'Leagues',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueName', type: 'string', required: true, size: 100 },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030 },
      { key: 'maxTeams', type: 'integer', required: false, min: 2, max: 32 },
      { key: 'currentTeams', type: 'integer', required: false, min: 0, max: 32, default: 0 },
      { key: 'leagueStatus', type: 'string', required: false, size: 20, default: 'open' },
      { key: 'gameMode', type: 'string', required: false, size: 20 },
      { key: 'draftType', type: 'string', required: false, size: 20 },
      { key: 'isPublic', type: 'boolean', required: false, default: true },
      { key: 'pickTimeSeconds', type: 'integer', required: false, min: 30, max: 600, default: 90 },
      { key: 'draftDate', type: 'datetime', required: false },
      { key: 'selectedConference', type: 'string', required: false, size: 50 },
      { key: 'seasonStartWeek', type: 'integer', required: false, min: 1, max: 20 },
      { key: 'playoffTeams', type: 'integer', required: false, min: 0, max: 20 },
      { key: 'playoffStartWeek', type: 'integer', required: false, min: 1, max: 20 },
      { key: 'waiverType', type: 'string', required: false, size: 20 },
      { key: 'waiverBudget', type: 'integer', required: false, min: 0, max: 1000 },
      { key: 'password', type: 'string', required: false, size: 50 },
      { key: 'commissionerAuthUserId', type: 'string', required: false, size: 64 },
      { key: 'scoringRules', type: 'string', required: false, size: 65535 },
      { key: 'draftOrder', type: 'string', required: false, size: 65535 },
    ],
    indexes: [
      { key: 'status_idx', type: 'key', attributes: ['leagueStatus'] },
      { key: 'public_idx', type: 'key', attributes: ['isPublic'] },
      { key: 'season_idx', type: 'key', attributes: ['season'] },
    ]
  },

  // College Players
  college_players: {
    id: 'college_players',
    name: 'College Players',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'name', type: 'string', required: true, size: 100 },
      { key: 'position', type: 'string', required: true, size: 10 },
      { key: 'team', type: 'string', required: true, size: 50 },
      { key: 'conference', type: 'string', required: true, size: 20 },
      { key: 'schoolId', type: 'string', required: true, size: 50 },
      { key: 'year', type: 'string', required: false, size: 10 },
      { key: 'classYear', type: 'string', required: false, size: 10 },
      { key: 'jerseyNumber', type: 'integer', required: false, min: 0, max: 99 },
      { key: 'height', type: 'string', required: false, size: 10 },
      { key: 'weight', type: 'integer', required: false, min: 150, max: 400 },
      { key: 'eligible', type: 'boolean', required: false, default: true },
      { key: 'fantasyPoints', type: 'double', required: false, default: 0 },
      { key: 'seasonFantasyPoints', type: 'double', required: false, default: 0 },
      { key: 'depthChartOrder', type: 'integer', required: false },
      { key: 'cfbdId', type: 'string', required: false, size: 50 },
      { key: 'espnId', type: 'string', required: false, size: 50 },
    ],
    indexes: [
      { key: 'position_idx', type: 'key', attributes: ['position'] },
      { key: 'team_idx', type: 'key', attributes: ['team'] },
      { key: 'points_idx', type: 'key', attributes: ['fantasyPoints'] },
      { key: 'name_search', type: 'fulltext', attributes: ['name'] },
      { key: 'school_idx', type: 'key', attributes: ['schoolId'] },
      { key: 'cfbd_idx', type: 'key', attributes: ['cfbdId'] },
      { key: 'espn_idx', type: 'key', attributes: ['espnId'] },
    ]
  },

  // Games
  games: {
    id: 'games',
    name: 'Games',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'week', type: 'integer', required: true, min: 1, max: 20 },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2035 },
      { key: 'seasonType', type: 'string', required: true, size: 20 },
      { key: 'date', type: 'datetime', required: true },
      { key: 'kickoffAt', type: 'datetime', required: true },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'homeTeam', type: 'string', required: true, size: 50 },
      { key: 'awayTeam', type: 'string', required: true, size: 50 },
      { key: 'homeSchoolId', type: 'string', required: true, size: 50 },
      { key: 'awaySchoolId', type: 'string', required: true, size: 50 },
      { key: 'homeScore', type: 'integer', required: false, min: 0 },
      { key: 'awayScore', type: 'integer', required: false, min: 0 },
      { key: 'status', type: 'string', required: false, size: 20 },
      { key: 'eligible', type: 'boolean', required: false },
      { key: 'eligibleGame', type: 'boolean', required: true },
      { key: 'completed', type: 'boolean', required: true, default: false },
    ],
    indexes: [
      { key: 'week_idx', type: 'key', attributes: ['week', 'season'] },
      { key: 'eligible_idx', type: 'key', attributes: ['eligibleGame'] },
      { key: 'season_week', type: 'key', attributes: ['season', 'week'] },
      { key: 'home_idx', type: 'key', attributes: ['homeSchoolId'] },
      { key: 'away_idx', type: 'key', attributes: ['awaySchoolId'] },
    ]
  },

  // Rankings
  rankings: {
    id: 'rankings',
    name: 'AP Rankings',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'week', type: 'integer', required: true, min: 1, max: 20 },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030 },
      { key: 'pollType', type: 'string', required: true, size: 50 },
      { key: 'team', type: 'string', required: true, size: 50 },
      { key: 'schoolId', type: 'string', required: true, size: 50 },
      { key: 'rank', type: 'integer', required: true, min: 1, max: 25 },
      { key: 'points', type: 'integer', required: false, min: 0 },
      { key: 'firstPlaceVotes', type: 'integer', required: false, min: 0 },
      { key: 'source', type: 'string', required: true, size: 50 },
    ],
    indexes: [
      { key: 'ranking_week', type: 'key', attributes: ['week', 'season'] },
      { key: 'ranking_season', type: 'key', attributes: ['season'] },
      { key: 'ranking_team', type: 'key', attributes: ['team'] },
      { key: 'ranking_ap', type: 'key', attributes: ['pollType'] },
      { key: 'ranking_order', type: 'key', attributes: ['rank'] },
      { key: 'by_source', type: 'key', attributes: ['season', 'week', 'source'] },
      { key: 'by_school', type: 'key', attributes: ['season', 'week', 'schoolId'] },
    ]
  },

  // Draft Events
  draft_events: {
    id: 'draft_events',
    name: 'Draft Events',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'draftId', type: 'string', required: true, size: 64 },
      { key: 'type', type: 'string', required: true, size: 24 },
      { key: 'round', type: 'integer', required: false, min: 1 },
      { key: 'overall', type: 'integer', required: false, min: 1 },
      { key: 'fantasyTeamId', type: 'string', required: false, size: 64 },
      { key: 'playerId', type: 'string', required: false, size: 64 },
      { key: 'ts', type: 'datetime', required: false },
      { key: 'payloadJson', type: 'string', required: false, size: 5000 },
    ],
    indexes: [
      { key: 'by_overall', type: 'key', attributes: ['draftId', 'overall'] },
      { key: 'by_ts', type: 'key', attributes: ['draftId', 'ts'] },
    ]
  },

  // Draft States
  draft_states: {
    id: 'draft_states',
    name: 'Draft States',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'draftId', type: 'string', required: true, size: 255 },
      { key: 'onClockTeamId', type: 'string', required: true, size: 255 },
      { key: 'deadlineAt', type: 'datetime', required: false },
      { key: 'round', type: 'integer', required: true, min: 1 },
      { key: 'pickIndex', type: 'integer', required: true, min: 1 },
      { key: 'draftStatus', type: 'string', required: false, size: 20, default: 'pre-draft', elements: ['pre-draft','drafting','post-draft','predraft','postdraft'] },
    ],
    indexes: [
      { key: 'draft_unique_idx', type: 'unique', attributes: ['draftId'] },
    ]
  },

  // Roster Slots
  roster_slots: {
    id: 'roster_slots',
    name: 'Roster Slots',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'fantasyTeamId', type: 'string', required: true, size: 64 },
      { key: 'playerId', type: 'string', required: true, size: 64 },
      { key: 'position', type: 'string', required: true, size: 8 },
      { key: 'acquiredVia', type: 'string', required: false, size: 16 },
      { key: 'acquiredAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'team_idx', type: 'key', attributes: ['fantasyTeamId'] },
      { key: 'team_player_idx', type: 'key', attributes: ['fantasyTeamId', 'playerId'] },
    ]
  },

  // Schools
  schools: {
    id: 'schools',
    name: 'Schools',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'name', type: 'string', required: true },
      { key: 'conference', type: 'string', required: true },
      { key: 'slug', type: 'string', required: false },
      { key: 'abbreviation', type: 'string', required: false },
      { key: 'logoUrl', type: 'string', required: false },
      { key: 'primaryColor', type: 'string', required: false },
      { key: 'secondaryColor', type: 'string', required: false },
      { key: 'mascot', type: 'string', required: false },
    ],
    indexes: [
      { key: 'slug_unique', type: 'unique', attributes: ['slug'] },
      { key: 'conference_idx', type: 'key', attributes: ['conference'] },
    ]
  },

  // Clients (user profile)
  clients: {
    id: 'clients',
    name: 'clients',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'authUserId', type: 'string', required: true },
      { key: 'displayName', type: 'string', required: false },
      { key: 'email', type: 'string', required: false },
      { key: 'avatarUrl', type: 'string', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'lastLogin', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'auth_user_id_unique', type: 'unique', attributes: ['authUserId'] },
      { key: 'email_idx', type: 'key', attributes: ['email'] },
    ]
  },

  // League Memberships
  league_memberships: {
    id: 'league_memberships',
    name: 'league_memberships',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true },
      { key: 'authUserId', type: 'string', required: true },
      { key: 'role', type: 'string', required: true },
      { key: 'status', type: 'string', required: true },
      { key: 'joinedAt', type: 'datetime', required: false },
      { key: 'displayName', type: 'string', required: false },
      { key: 'leagueName', type: 'string', required: false },
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
      { key: 'member_idx', type: 'key', attributes: ['authUserId'] },
      { key: 'league_member_unique', type: 'unique', attributes: ['leagueId', 'authUserId'] },
    ]
  },

  // Lineups
  lineups: {
    id: 'lineups',
    name: 'Lineups',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'rosterId', type: 'string', required: true },
      { key: 'fantasyTeamId', type: 'string', required: true },
      { key: 'week', type: 'integer', required: true },
      { key: 'season', type: 'integer', required: true },
      { key: 'lineup', type: 'string', required: false },
      { key: 'bench', type: 'string', required: false },
      { key: 'points', type: 'double', required: false },
      { key: 'locked', type: 'boolean', required: false },
    ],
    indexes: [
      { key: 'team_season_week_unique', type: 'unique', attributes: ['fantasyTeamId', 'season', 'week'] },
    ]
  },

  // Matchups
  matchups: {
    id: 'matchups',
    name: 'Matchups',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true },
      { key: 'season', type: 'integer', required: true },
      { key: 'week', type: 'integer', required: true },
      { key: 'homeTeamId', type: 'string', required: true },
      { key: 'awayTeamId', type: 'string', required: true },
      { key: 'homePoints', type: 'double', required: false },
      { key: 'awayPoints', type: 'double', required: false },
      { key: 'status', type: 'string', required: false },
    ],
    indexes: [
      { key: 'league_season_week', type: 'key', attributes: ['leagueId', 'season', 'week'] },
    ]
  },

  // Player Stats
  player_stats: {
    id: 'player_stats',
    name: 'Player Stats',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'playerId', type: 'string', required: true },
      { key: 'gameId', type: 'string', required: true },
      { key: 'week', type: 'integer', required: true },
      { key: 'season', type: 'integer', required: true },
      { key: 'stats', type: 'string', required: true },
      { key: 'opponent', type: 'string', required: false },
      { key: 'eligible', type: 'boolean', required: false },
      { key: 'fantasyPoints', type: 'double', required: false },
      { key: 'statlineJson', type: 'string', required: false },
    ],
    indexes: [
      { key: 'stats_player', type: 'key', attributes: ['playerId'] },
      { key: 'stats_game', type: 'key', attributes: ['gameId'] },
      { key: 'stats_week', type: 'key', attributes: ['week', 'season'] },
      { key: 'stats_player_week', type: 'unique', attributes: ['playerId', 'week', 'season'] },
      { key: 'player_season_week', type: 'key', attributes: ['season', 'week'] },
    ]
  },

  // Projections
  projections: {
    id: 'projections',
    name: 'projections',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'playerId', type: 'string', required: true },
      { key: 'season', type: 'integer', required: true },
      { key: 'week', type: 'integer', required: false },
      { key: 'period', type: 'string', required: true },
      { key: 'version', type: 'integer', required: true },
      { key: 'model', type: 'string', required: false },
      { key: 'source', type: 'string', required: false },
      { key: 'clientId', type: 'string', required: false },
      { key: 'fantasyPoints', type: 'double', required: false },
      { key: 'componentsJson', type: 'string', required: false },
      { key: 'boomProb', type: 'double', required: false },
      { key: 'bustProb', type: 'double', required: false },
      { key: 'homeAway', type: 'string', required: false },
      { key: 'injuryStatus', type: 'string', required: false },
      { key: 'opponentSchoolId', type: 'string', required: false },
      { key: 'rankPro', type: 'integer', required: false },
      { key: 'startSit_color', type: 'string', required: false },
      { key: 'utilizationTrend', type: 'string', required: false },
      { key: 'defenseVsPosGrade', type: 'double', required: false },
      { key: 'startSitColor', type: 'string', required: false },
      { key: 'teamTotalEst', type: 'double', required: false },
    ],
    indexes: [
      { key: 'season_week_version', type: 'key', attributes: ['season', 'week', 'version'] },
    ]
  },

  // Model Runs
  model_runs: {
    id: 'model_runs',
    name: 'model_runs',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'season', type: 'integer', required: true },
      { key: 'week', type: 'integer', required: false },
      { key: 'scope', type: 'string', required: true },
      { key: 'sources', type: 'string', required: false },
      { key: 'status', type: 'string', required: true },
      { key: 'runId', type: 'string', required: false },
      { key: 'modelVersionId', type: 'string', required: false },
      { key: 'startedAt', type: 'datetime', required: false },
      { key: 'finishedAt', type: 'datetime', required: false },
      { key: 'inputsJson', type: 'string', required: false },
      { key: 'metricsJson', type: 'string', required: false },
      { key: 'weightsJson', type: 'string', required: false },
    ],
    indexes: [
      { key: 'season_week', type: 'key', attributes: ['season', 'week'] },
    ]
  },

  // Transactions
  transactions: {
    id: 'transactions',
    name: 'Transactions',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true },
      { key: 'fantasyTeamId', type: 'string', required: true },
      { key: 'type', type: 'string', required: true },
      { key: 'payloadJson', type: 'string', required: false },
      { key: 'season', type: 'integer', required: false },
      { key: 'week', type: 'integer', required: false },
      { key: 'ts', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
      { key: 'league_season_week', type: 'key', attributes: ['leagueId', 'season', 'week'] },
      { key: 'team_idx', type: 'key', attributes: ['fantasyTeamId'] },
    ]
  },

  // Auctions
  auctions: {
    id: 'auctions',
    name: 'Auctions',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true },
      { key: 'draftId', type: 'string', required: true },
      { key: 'playerId', type: 'string', required: true },
      { key: 'status', type: 'string', required: true },
      { key: 'winnerTeamId', type: 'string', required: false },
      { key: 'winningBid', type: 'double', required: false },
    ],
    indexes: [
      { key: 'auction_league', type: 'key', attributes: ['leagueId'] },
      { key: 'draft_idx', type: 'key', attributes: ['draftId'] },
      { key: 'lot_unique', type: 'unique', attributes: ['draftId', 'playerId'] },
    ]
  },

  // Bids
  bids: {
    id: 'bids',
    name: 'Bids',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'auctionId', type: 'string', required: true },
      { key: 'playerId', type: 'string', required: true },
      { key: 'teamId', type: 'string', required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'timestamp', type: 'datetime', required: true },
      { key: 'isWinning', type: 'boolean', required: false },
      { key: 'fantasyTeamId', type: 'string', required: true },
    ],
    indexes: [
      { key: 'bid_auction', type: 'key', attributes: ['auctionId'] },
      { key: 'bid_player', type: 'key', attributes: ['playerId'] },
      { key: 'auction_amount', type: 'key', attributes: ['amount'] },
    ]
  },

  // Activity Log
  activity_log: {
    id: 'activity_log',
    name: 'activity_log',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'userId', type: 'string', required: false },
      { key: 'action', type: 'string', required: true },
      { key: 'details', type: 'string', required: false },
      { key: 'timestamp', type: 'datetime', required: true },
      { key: 'type', type: 'string', required: true },
      { key: 'teamId', type: 'string', required: false },
      { key: 'description', type: 'string', required: true },
      { key: 'data', type: 'string', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'inviteToken', type: 'string', required: false },
      { key: 'status', type: 'string', required: false },
      { key: 'expiresAt', type: 'datetime', required: false },
      { key: 'ipAddress', type: 'string', required: false },
      { key: 'userAgent', type: 'string', required: false },
      { key: 'actorClientId', type: 'string', required: false },
      { key: 'objectType', type: 'string', required: false },
      { key: 'objectId', type: 'string', required: false },
      { key: 'leagueId', type: 'string', required: false },
      { key: 'ts', type: 'datetime', required: true },
      { key: 'payloadJson', type: 'string', required: false },
    ],
    indexes: [
      { key: 'idx_type', type: 'key', attributes: ['type'] },
      { key: 'idx_user', type: 'key', attributes: ['userId'] },
      { key: 'idx_created', type: 'key', attributes: ['createdAt'] },
      { key: 'idx_invite_token', type: 'unique', attributes: ['inviteToken'] },
      { key: 'idx_status', type: 'key', attributes: ['status'] },
      { key: 'actor_idx', type: 'key', attributes: ['actorClientId'] },
      { key: 'object_idx', type: 'key', attributes: ['objectType', 'objectId'] },
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
    ]
  },

  // Invites
  invites: {
    id: 'invites',
    name: 'invites',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true },
      { key: 'email', type: 'string', required: false },
      { key: 'inviteCode', type: 'string', required: true },
      { key: 'token', type: 'string', required: false },
      { key: 'status', type: 'string', required: false },
      { key: 'expiresAt', type: 'datetime', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'acceptedAt', type: 'datetime', required: false },
      { key: 'invitedByAuthUserId', type: 'string', required: false },
    ],
    indexes: [
      { key: 'league_email', type: 'key', attributes: ['email'] },
      { key: 'token_unique', type: 'unique', attributes: ['token'] },
    ]
  },

  // Meshy Jobs
  meshy_jobs: {
    id: 'meshy_jobs',
    name: 'meshy_jobs',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'resultUrl', type: 'string', required: false },
      { key: 'mode', type: 'string', required: false },
      { key: 'prompt', type: 'string', required: false },
      { key: 'userId', type: 'string', required: false },
      { key: 'error', type: 'string', required: false },
      { key: 'webhookSecret', type: 'string', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'imageUrl', type: 'string', required: false },
      { key: 'baseModelUrl', type: 'string', required: false },
      { key: 'status', type: 'string', required: false },
      { key: 'updatedAt', type: 'datetime', required: false },
    ],
    indexes: []
  },

  // Model Versions
  model_versions: {
    id: 'model_versions',
    name: 'Model Versions',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'versionId', type: 'string', required: true },
      { key: 'modelPath', type: 'string', required: true },
      { key: 'version', type: 'integer', required: true },
      { key: 'changes', type: 'string', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'createdBy', type: 'string', required: true },
      { key: 'description', type: 'string', required: true },
      { key: 'glbUrl', type: 'string', required: false },
      { key: 'thumbnailUrl', type: 'string', required: false },
      { key: 'bucketFileId', type: 'string', required: false },
      { key: 'artifactUri', type: 'string', required: false },
    ],
    indexes: [
      { key: 'versionId_idx', type: 'key', attributes: ['versionId'] },
      { key: 'version_idx', type: 'key', attributes: ['version'] },
      { key: 'createdAt_idx', type: 'key', attributes: ['createdAt'] },
      { key: 'createdBy_idx', type: 'key', attributes: ['createdBy'] },
    ]
  },

  // Database Migrations
  migrations: {
    id: 'migrations',
    name: 'migrations',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'migrationId', type: 'string', required: true },
      { key: 'name', type: 'string', required: true },
      { key: 'appliedAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'migration_id_unique', type: 'unique', attributes: ['migrationId'] },
    ]
  },

  // Drafts
  drafts: {
    id: 'drafts',
    name: 'drafts',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: false },
      { key: 'draftStatus', type: 'string', required: false },
      { key: 'currentRound', type: 'integer', required: false },
      { key: 'currentPick', type: 'integer', required: false },
      { key: 'maxRounds', type: 'integer', required: false },
      { key: 'draftOrder', type: 'string', required: false },
      { key: 'startTime', type: 'datetime', required: false },
      { key: 'endTime', type: 'datetime', required: false },
      { key: 'type', type: 'string', required: false },
      { key: 'clockSeconds', type: 'integer', required: false },
      { key: 'orderJson', type: 'string', required: false },
      { key: 'isMock', type: 'boolean', required: false },
      { key: 'leagueName', type: 'string', required: false },
      { key: 'gameMode', type: 'string', required: false },
      { key: 'selectedConference', type: 'string', required: false },
      { key: 'maxTeams', type: 'integer', required: false },
      { key: 'scoringRules', type: 'string', required: false },
      { key: 'stateJson', type: 'string', required: false },
      { key: 'eventsJson', type: 'string', required: false },
      { key: 'picksJson', type: 'string', required: false },
      { key: 'onTheClock', type: 'string', required: false },
      { key: 'lastPickTime', type: 'datetime', required: false },
    ],
    indexes: []
  },

  // Draft Picks (UI feed for picks)
  draft_picks: {
    id: 'draft_picks',
    name: 'draft_picks',
    documentSecurity: false,
    enabled: true,
    attributes: [
      { key: 'leagueId', type: 'string', required: true },
      { key: 'userId', type: 'string', required: true },
      { key: 'authUserId', type: 'string', required: false },
      { key: 'teamId', type: 'string', required: false },
      { key: 'playerId', type: 'string', required: true },
      { key: 'playerName', type: 'string', required: false },
      { key: 'playerPosition', type: 'string', required: false },
      { key: 'playerTeam', type: 'string', required: false },
      { key: 'round', type: 'integer', required: true },
      { key: 'pick', type: 'integer', required: true },
      { key: 'timestamp', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'league_pick_idx', type: 'key', attributes: ['leagueId', 'pick'] },
    ]
  },

  // Additional collections follow the same pattern...
  // Including: schools, clients, league_memberships, lineups, matchups, 
  // player_stats, projections, model_runs, transactions, auctions, bids,
  // activity_log, invites, meshy_jobs, migrations
};

// Export collection IDs for easy reference
export const COLLECTION_IDS = Object.keys(SCHEMA);

// Export helper to get collection by ID
export function getCollection(id: string): SchemaCollection | undefined {
  return SCHEMA[id];
}

// Export helper to validate collection exists
export function collectionExists(id: string): boolean {
  return id in SCHEMA;
}
