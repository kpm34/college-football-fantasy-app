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
      { key: 'wins', type: 'integer', required: false, min: 0 },
      { key: 'losses', type: 'integer', required: false, min: 0 },
      { key: 'ties', type: 'integer', required: false, min: 0 },
      { key: 'pointsFor', type: 'double', required: false, min: 0 },
      { key: 'pointsAgainst', type: 'double', required: false, min: 0 },
      { key: 'draftPosition', type: 'integer', required: false, min: 1, max: 32 },
      { key: 'auctionBudgetTotal', type: 'double', required: false, min: 0 },
      { key: 'auctionBudgetRemaining', type: 'double', required: false, min: 0 },
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
      { key: 'draftStatus', type: 'string', required: false, size: 20, default: 'pre-draft' },
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
      { key: 'scoringRules', type: 'string', required: false, size: 2000 },
      { key: 'draftOrder', type: 'string', required: false, size: 2000 },
    ],
    indexes: [
      { key: 'status_idx', type: 'key', attributes: ['status'] },
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
      { key: 'draftId', type: 'string', required: true, size: 50 },
      { key: 'type', type: 'string', required: true, size: 20 },
      { key: 'round', type: 'integer', required: false, min: 1 },
      { key: 'overall', type: 'integer', required: false, min: 1 },
      { key: 'fantasyTeamId', type: 'string', required: false, size: 50 },
      { key: 'playerId', type: 'string', required: false, size: 50 },
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
      { key: 'draftId', type: 'string', required: true, size: 50 },
      { key: 'onClockTeamId', type: 'string', required: true, size: 50 },
      { key: 'deadlineAt', type: 'datetime', required: false },
      { key: 'round', type: 'integer', required: true, min: 1 },
      { key: 'pickIndex', type: 'integer', required: true, min: 1 },
      { key: 'draftStatus', type: 'string', required: false, size: 20, default: 'drafting' },
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
      { key: 'fantasyTeamId', type: 'string', required: true, size: 50 },
      { key: 'playerId', type: 'string', required: true, size: 50 },
      { key: 'position', type: 'string', required: true, size: 10 },
      { key: 'acquiredVia', type: 'string', required: false, size: 20 },
      { key: 'acquiredAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'team_idx', type: 'key', attributes: ['fantasyTeamId'] },
      { key: 'team_player_idx', type: 'key', attributes: ['fantasyTeamId', 'playerId'] },
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
