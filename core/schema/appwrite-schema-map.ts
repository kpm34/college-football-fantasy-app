/**
 * Comprehensive Appwrite Schema Mapping System
 * 
 * This file provides the complete data pipeline mapping between:
 * 1. TypeScript types and Appwrite collections
 * 2. Environment variables and collection configurations  
 * 3. API routes and data transformations
 * 4. Frontend components and data requirements
 * 
 * Purpose: Single source of truth for all data flow and schema management
 */

export interface CollectionAttribute {
  key: string;
  type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'json' | 'email' | 'url';
  required: boolean;
  array?: boolean;
  size?: number;
  min?: number;
  max?: number;
  default?: any;
  description: string;
  mappedFrom?: string; // External API field mapping
  transformTo?: string; // Frontend display format
}

export interface CollectionConfig {
  id: string;
  name: string;
  description: string;
  documentSecurity: boolean;
  permission: 'read' | 'write' | 'admin';
  attributes: CollectionAttribute[];
  indexes: {
    key: string;
    type: 'fulltext' | 'unique' | 'key';
    attributes: string[];
    orders?: string[];
  }[];
  relationships: {
    collection: string;
    field: string;
    type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  }[];
  dataSources: {
    primary: string; // CFBD, ESPN, Manual
    secondary?: string[];
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  };
  frontendUsage: string[]; // Which pages/components use this
  apiEndpoints: string[]; // Which API routes serve this data
}

/**
 * Complete Appwrite Database Schema Map
 */
export const APPWRITE_SCHEMA: Record<string, CollectionConfig> = {
  // CORE COLLECTIONS
  leagues: {
    id: 'leagues',
    name: 'Leagues',
    description: 'Fantasy league configurations and settings',
    documentSecurity: false,
    permission: 'write',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 100, description: 'League name', transformTo: 'display' },
      { key: 'commissioner', type: 'string', required: true, size: 50, description: 'Commissioner user ID' },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030, description: 'Fantasy season year' },
      { key: 'maxTeams', type: 'integer', required: true, min: 4, max: 20, description: 'Maximum teams allowed' },
      { key: 'currentTeams', type: 'integer', required: true, default: 0, description: 'Current number of teams' },
      { key: 'draftType', type: 'string', required: true, size: 20, description: 'Draft type: snake or auction' },
      { key: 'gameMode', type: 'string', required: true, size: 20, description: 'Conference restriction mode' },
      { key: 'status', type: 'string', required: true, size: 20, description: 'League status lifecycle' },
      { key: 'isPublic', type: 'boolean', required: true, default: false, description: 'Public joinability' },
      { key: 'inviteCode', type: 'string', required: false, size: 50, description: 'Invite code for private leagues' },
      { key: 'pickTimeSeconds', type: 'integer', required: true, default: 90, description: 'Draft pick time limit' },
      { key: 'scoringRules', type: 'json', required: true, description: 'Fantasy scoring configuration' },
      { key: 'draftDate', type: 'datetime', required: false, description: 'Scheduled draft start time' },
      { key: 'draftStartedAt', type: 'datetime', required: false, description: 'Actual draft start time' },
      { key: 'settings', type: 'json', required: true, description: 'League-specific settings object' }
    ],
    indexes: [
      { key: 'league_status', type: 'key', attributes: ['status'] },
      { key: 'league_commissioner', type: 'key', attributes: ['commissioner'] },
      { key: 'league_public', type: 'key', attributes: ['isPublic'] },
      { key: 'league_search', type: 'fulltext', attributes: ['name'] }
    ],
    relationships: [
      { collection: 'rosters', field: 'leagueId', type: 'oneToMany' },
      { collection: 'auctions', field: 'leagueId', type: 'oneToOne' },
      { collection: 'draft_picks', field: 'leagueId', type: 'oneToMany' }
    ],
    dataSources: {
      primary: 'Manual',
      syncFrequency: 'manual'
    },
    frontendUsage: ['league/create', 'league/[leagueId]', 'dashboard'],
    apiEndpoints: ['/api/leagues/create', '/api/leagues/my-leagues', '/api/leagues/search']
  },

  rosters: {
    id: 'rosters',
    name: 'Rosters',
    description: 'Team rosters within leagues',
    documentSecurity: false,
    permission: 'write',
    attributes: [
      { key: 'leagueId', type: 'string', required: true, size: 50, description: 'Parent league ID' },
      { key: 'userId', type: 'string', required: true, size: 50, description: 'Team owner user ID' },
      { key: 'teamName', type: 'string', required: true, size: 100, description: 'Team display name' },
      { key: 'abbreviation', type: 'string', required: true, size: 5, description: 'Team abbreviation' },
      { key: 'logoUrl', type: 'url', required: false, description: 'Team logo image URL' },
      { key: 'draftPosition', type: 'integer', required: true, min: 1, description: 'Draft order position' },
      { key: 'wins', type: 'integer', required: true, default: 0, description: 'Season wins' },
      { key: 'losses', type: 'integer', required: true, default: 0, description: 'Season losses' },
      { key: 'ties', type: 'integer', required: true, default: 0, description: 'Season ties' },
      { key: 'pointsFor', type: 'double', required: true, default: 0, description: 'Total points scored' },
      { key: 'pointsAgainst', type: 'double', required: true, default: 0, description: 'Total points allowed' },
      { key: 'players', type: 'json', required: true, array: true, description: 'Roster players array' },
      { key: 'lineup', type: 'json', required: true, description: 'Starting lineup positions' },
      { key: 'bench', type: 'json', required: true, array: true, description: 'Bench player IDs' }
    ],
    indexes: [
      { key: 'roster_league', type: 'key', attributes: ['leagueId'] },
      { key: 'roster_user', type: 'key', attributes: ['userId'] },
      { key: 'roster_league_user', type: 'unique', attributes: ['leagueId', 'userId'] },
      { key: 'roster_standings', type: 'key', attributes: ['leagueId', 'wins'], orders: ['DESC'] }
    ],
    relationships: [
      { collection: 'leagues', field: 'leagueId', type: 'oneToOne' },
      { collection: 'college_players', field: 'players.playerId', type: 'manyToMany' }
    ],
    dataSources: {
      primary: 'Manual',
      secondary: ['college_players'],
      syncFrequency: 'realtime'
    },
    frontendUsage: ['league/[leagueId]/standings', 'draft/[leagueId]', 'league/[leagueId]/locker-room'],
    apiEndpoints: ['/api/leagues/join', '/api/leagues/[leagueId]/teams']
  },

  college_players: {
    id: 'college_players',
    name: 'College Players',
    description: 'Player database from CFBD with projections',
    documentSecurity: false,
    permission: 'read',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 100, description: 'Player full name', mappedFrom: 'cfbd.name' },
      { key: 'position', type: 'string', required: true, size: 10, description: 'Position abbreviation', mappedFrom: 'cfbd.position' },
      { key: 'team', type: 'string', required: true, size: 50, description: 'College team name', mappedFrom: 'cfbd.team' },
      { key: 'conference', type: 'string', required: true, size: 20, description: 'Conference abbreviation', mappedFrom: 'cfbd.conference' },
      { key: 'jerseyNumber', type: 'string', required: false, size: 5, description: 'Jersey number', mappedFrom: 'cfbd.jersey' },
      { key: 'height', type: 'string', required: false, size: 10, description: 'Height in feet-inches', mappedFrom: 'cfbd.height' },
      { key: 'weight', type: 'integer', required: false, min: 150, max: 400, description: 'Weight in pounds', mappedFrom: 'cfbd.weight' },
      { key: 'year', type: 'string', required: false, size: 20, description: 'Class year', mappedFrom: 'cfbd.year' },
      { key: 'eligible', type: 'boolean', required: true, default: false, description: 'Eligible vs Top 25 teams' },
      { key: 'fantasy_points', type: 'double', required: true, default: 0, description: 'Projected fantasy points' },
      { key: 'season_fantasy_points', type: 'double', required: true, default: 0, description: 'Season total points' },
      { key: 'depth_chart_order', type: 'integer', required: false, min: 1, max: 5, description: 'Depth chart position' },
      { key: 'last_projection_update', type: 'datetime', required: false, description: 'Last projection sync time' },
      { key: 'external_id', type: 'string', required: false, size: 50, description: 'CFBD athlete ID', mappedFrom: 'cfbd.id' },
      { key: 'image_url', type: 'url', required: false, description: 'Player headshot URL', mappedFrom: 'cfbd.headshot_url' },
      { key: 'stats', type: 'json', required: false, description: 'Season statistics object', mappedFrom: 'cfbd.season_stats' }
    ],
    indexes: [
      { key: 'player_name', type: 'fulltext', attributes: ['name'] },
      { key: 'player_team', type: 'key', attributes: ['team'] },
      { key: 'player_position', type: 'key', attributes: ['position'] },
      { key: 'player_conference', type: 'key', attributes: ['conference'] },
      { key: 'player_eligible', type: 'key', attributes: ['eligible'] },
      { key: 'player_projections', type: 'key', attributes: ['fantasy_points'], orders: ['DESC'] },
      { key: 'player_external', type: 'unique', attributes: ['external_id'] }
    ],
    relationships: [
      { collection: 'rosters', field: 'players', type: 'manyToMany' },
      { collection: 'teams', field: 'team', type: 'oneToMany' },
      { collection: 'player_stats', field: 'playerId', type: 'oneToMany' }
    ],
    dataSources: {
      primary: 'CFBD',
      secondary: ['ESPN', 'Manual'],
      syncFrequency: 'daily'
    },
    frontendUsage: ['draft/[leagueId]', 'auction/[leagueId]', '/api/players/cached'],
    apiEndpoints: ['/api/players/cached', '/api/players/search', '/api/projections']
  },

  teams: {
    id: 'teams',
    name: 'Teams',
    description: 'College football teams from Power 4 conferences',
    documentSecurity: false,
    permission: 'read',
    attributes: [
      { key: 'name', type: 'string', required: true, size: 100, description: 'Team full name', mappedFrom: 'cfbd.school' },
      { key: 'abbreviation', type: 'string', required: true, size: 10, description: 'Team abbreviation', mappedFrom: 'cfbd.abbreviation' },
      { key: 'conference', type: 'string', required: true, size: 20, description: 'Conference name', mappedFrom: 'cfbd.conference' },
      { key: 'division', type: 'string', required: false, size: 20, description: 'Division within conference', mappedFrom: 'cfbd.division' },
      { key: 'color', type: 'string', required: false, size: 10, description: 'Primary team color hex', mappedFrom: 'cfbd.color' },
      { key: 'alt_color', type: 'string', required: false, size: 10, description: 'Secondary team color hex', mappedFrom: 'cfbd.alt_color' },
      { key: 'logo', type: 'url', required: false, description: 'Team logo URL', mappedFrom: 'cfbd.logos' },
      { key: 'mascot', type: 'string', required: false, size: 50, description: 'Team mascot name', mappedFrom: 'cfbd.mascot' },
      { key: 'venue', type: 'string', required: false, size: 100, description: 'Home stadium name' },
      { key: 'location', type: 'string', required: false, size: 100, description: 'City, State location' }
    ],
    indexes: [
      { key: 'team_name', type: 'fulltext', attributes: ['name'] },
      { key: 'team_conference', type: 'key', attributes: ['conference'] },
      { key: 'team_abbreviation', type: 'unique', attributes: ['abbreviation'] }
    ],
    relationships: [
      { collection: 'college_players', field: 'team', type: 'oneToMany' },
      { collection: 'games', field: 'home_team', type: 'oneToMany' },
      { collection: 'games', field: 'away_team', type: 'oneToMany' }
    ],
    dataSources: {
      primary: 'CFBD',
      secondary: ['ESPN'],
      syncFrequency: 'weekly'
    },
    frontendUsage: ['conference-showcase', '/api/teams'],
    apiEndpoints: ['/api/teams', '/api/acc', '/api/sec', '/api/big12', '/api/bigten']
  },

  games: {
    id: 'games',
    name: 'Games',
    description: 'College football game schedule and scores',
    documentSecurity: false,
    permission: 'read',
    attributes: [
      { key: 'week', type: 'integer', required: true, min: 1, max: 20, description: 'Season week number', mappedFrom: 'cfbd.week' },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030, description: 'Season year', mappedFrom: 'cfbd.season' },
      { key: 'season_type', type: 'string', required: true, size: 20, description: 'Regular/Postseason', mappedFrom: 'cfbd.season_type' },
      { key: 'home_team', type: 'string', required: true, size: 50, description: 'Home team name', mappedFrom: 'cfbd.home_team' },
      { key: 'away_team', type: 'string', required: true, size: 50, description: 'Away team name', mappedFrom: 'cfbd.away_team' },
      { key: 'home_score', type: 'integer', required: false, min: 0, description: 'Home team final score', mappedFrom: 'cfbd.home_points' },
      { key: 'away_score', type: 'integer', required: false, min: 0, description: 'Away team final score', mappedFrom: 'cfbd.away_points' },
      { key: 'start_date', type: 'datetime', required: true, description: 'Game kickoff time', mappedFrom: 'cfbd.start_date' },
      { key: 'completed', type: 'boolean', required: true, default: false, description: 'Game completion status', mappedFrom: 'cfbd.completed' },
      { key: 'conference_game', type: 'boolean', required: true, default: false, description: 'Conference matchup flag' },
      { key: 'eligible_game', type: 'boolean', required: true, default: false, description: 'Fantasy eligible game flag' },
      { key: 'venue', type: 'string', required: false, size: 100, description: 'Game location', mappedFrom: 'cfbd.venue' },
      { key: 'tv_coverage', type: 'string', required: false, size: 20, description: 'TV broadcast network', mappedFrom: 'cfbd.media' },
      { key: 'external_id', type: 'string', required: false, size: 50, description: 'CFBD game ID', mappedFrom: 'cfbd.id' }
    ],
    indexes: [
      { key: 'game_week', type: 'key', attributes: ['week'] },
      { key: 'game_season', type: 'key', attributes: ['season'] },
      { key: 'game_teams', type: 'key', attributes: ['home_team', 'away_team'] },
      { key: 'game_eligible', type: 'key', attributes: ['eligible_game'] },
      { key: 'game_completed', type: 'key', attributes: ['completed'] },
      { key: 'game_date', type: 'key', attributes: ['start_date'] }
    ],
    relationships: [
      { collection: 'teams', field: 'home_team', type: 'oneToOne' },
      { collection: 'teams', field: 'away_team', type: 'oneToOne' },
      { collection: 'player_stats', field: 'gameId', type: 'oneToMany' }
    ],
    dataSources: {
      primary: 'CFBD',
      secondary: ['ESPN'],
      syncFrequency: 'hourly'
    },
    frontendUsage: ['scoreboard', '/api/games', 'league/[leagueId]/schedule'],
    apiEndpoints: ['/api/games', '/api/games/week/[week]', '/api/games/eligible']
  },

  rankings: {
    id: 'rankings',
    name: 'Rankings',
    description: 'AP Top 25 weekly rankings for eligibility',
    documentSecurity: false,
    permission: 'read',
    attributes: [
      { key: 'week', type: 'integer', required: true, min: 0, max: 20, description: 'Poll week number', mappedFrom: 'cfbd.week' },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030, description: 'Season year', mappedFrom: 'cfbd.season' },
      { key: 'poll_type', type: 'string', required: true, size: 20, description: 'Poll name (AP, Coaches)', mappedFrom: 'cfbd.poll' },
      { key: 'team', type: 'string', required: true, size: 50, description: 'Ranked team name', mappedFrom: 'cfbd.school' },
      { key: 'rank', type: 'integer', required: true, min: 1, max: 25, description: 'Ranking position', mappedFrom: 'cfbd.rank' },
      { key: 'points', type: 'integer', required: false, min: 0, description: 'Poll points received', mappedFrom: 'cfbd.points' },
      { key: 'first_place_votes', type: 'integer', required: false, min: 0, description: 'First place votes', mappedFrom: 'cfbd.firstPlaceVotes' }
    ],
    indexes: [
      { key: 'ranking_week', type: 'key', attributes: ['week'] },
      { key: 'ranking_season', type: 'key', attributes: ['season'] },
      { key: 'ranking_team', type: 'key', attributes: ['team'] },
      { key: 'ranking_ap', type: 'key', attributes: ['poll_type', 'week', 'season'] },
      { key: 'ranking_order', type: 'key', attributes: ['rank'] }
    ],
    relationships: [
      { collection: 'teams', field: 'team', type: 'oneToOne' }
    ],
    dataSources: {
      primary: 'CFBD',
      secondary: ['ESPN'],
      syncFrequency: 'weekly'
    },
    frontendUsage: ['standings', '/api/rankings'],
    apiEndpoints: ['/api/rankings', '/api/rankings/cached']
  },

  // DRAFT & AUCTION COLLECTIONS
  auctions: {
    id: 'auctions',
    name: 'Auctions',
    description: 'Auction draft sessions',
    documentSecurity: false,
    permission: 'write',
    attributes: [
      { key: 'leagueId', type: 'string', required: true, size: 50, description: 'Parent league ID' },
      { key: 'status', type: 'string', required: true, size: 20, description: 'Draft status' },
      { key: 'currentNomination', type: 'string', required: false, size: 50, description: 'Current nominated player ID' },
      { key: 'nominatingTeam', type: 'string', required: false, size: 50, description: 'Team making nomination' },
      { key: 'currentBid', type: 'integer', required: false, min: 1, description: 'Current highest bid amount' },
      { key: 'biddingTeam', type: 'string', required: false, size: 50, description: 'Team with highest bid' },
      { key: 'auctionEndTime', type: 'datetime', required: false, description: 'Bidding deadline' },
      { key: 'settings', type: 'json', required: true, description: 'Auction configuration' }
    ],
    indexes: [
      { key: 'auction_league', type: 'unique', attributes: ['leagueId'] },
      { key: 'auction_status', type: 'key', attributes: ['status'] }
    ],
    relationships: [
      { collection: 'leagues', field: 'leagueId', type: 'oneToOne' },
      { collection: 'bids', field: 'auctionId', type: 'oneToMany' }
    ],
    dataSources: {
      primary: 'Manual',
      syncFrequency: 'realtime'
    },
    frontendUsage: ['auction/[leagueId]'],
    apiEndpoints: ['/api/draft/[leagueId]/auction']
  },

  bids: {
    id: 'bids',
    name: 'Bids',
    description: 'Auction bid history',
    documentSecurity: false,
    permission: 'write',
    attributes: [
      { key: 'auctionId', type: 'string', required: true, size: 50, description: 'Parent auction ID' },
      { key: 'playerId', type: 'string', required: true, size: 50, description: 'Bid player ID' },
      { key: 'teamId', type: 'string', required: true, size: 50, description: 'Bidding team roster ID' },
      { key: 'amount', type: 'integer', required: true, min: 1, description: 'Bid amount' },
      { key: 'timestamp', type: 'datetime', required: true, description: 'Bid submission time' },
      { key: 'isWinning', type: 'boolean', required: true, default: false, description: 'Final winning bid flag' }
    ],
    indexes: [
      { key: 'bid_auction', type: 'key', attributes: ['auctionId'] },
      { key: 'bid_player', type: 'key', attributes: ['playerId'] },
      { key: 'bid_team', type: 'key', attributes: ['teamId'] },
      { key: 'bid_timestamp', type: 'key', attributes: ['timestamp'] }
    ],
    relationships: [
      { collection: 'auctions', field: 'auctionId', type: 'oneToOne' },
      { collection: 'college_players', field: 'playerId', type: 'oneToOne' },
      { collection: 'rosters', field: 'teamId', type: 'oneToOne' }
    ],
    dataSources: {
      primary: 'Manual',
      syncFrequency: 'realtime'
    },
    frontendUsage: ['auction/[leagueId]'],
    apiEndpoints: ['/api/draft/[leagueId]/bid']
  },

  // STATS & PERFORMANCE COLLECTIONS  
  player_stats: {
    id: 'player_stats',
    name: 'Player Stats',
    description: 'Weekly player performance statistics',
    documentSecurity: false,
    permission: 'read',
    attributes: [
      { key: 'playerId', type: 'string', required: true, size: 50, description: 'Player document ID' },
      { key: 'gameId', type: 'string', required: true, size: 50, description: 'Game document ID' },
      { key: 'week', type: 'integer', required: true, min: 1, max: 20, description: 'Season week' },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030, description: 'Season year' },
      { key: 'opponent', type: 'string', required: true, size: 50, description: 'Opponent team name' },
      { key: 'fantasy_points', type: 'double', required: true, default: 0, description: 'Fantasy points earned' },
      { key: 'stats', type: 'json', required: true, description: 'Raw statistical performance' },
      { key: 'eligible', type: 'boolean', required: true, default: false, description: 'Counts toward fantasy total' }
    ],
    indexes: [
      { key: 'stats_player', type: 'key', attributes: ['playerId'] },
      { key: 'stats_game', type: 'key', attributes: ['gameId'] },
      { key: 'stats_week', type: 'key', attributes: ['week', 'season'] },
      { key: 'stats_player_week', type: 'unique', attributes: ['playerId', 'gameId'] }
    ],
    relationships: [
      { collection: 'college_players', field: 'playerId', type: 'oneToOne' },
      { collection: 'games', field: 'gameId', type: 'oneToOne' }
    ],
    dataSources: {
      primary: 'CFBD',
      secondary: ['ESPN'],
      syncFrequency: 'hourly'
    },
    frontendUsage: ['league/[leagueId]/scoreboard', 'player profiles'],
    apiEndpoints: ['/api/players/stats', '/api/scoring']
  },

  lineups: {
    id: 'lineups',
    name: 'Lineups',
    description: 'Weekly fantasy lineups and matchups',
    documentSecurity: false,
    permission: 'write',
    attributes: [
      { key: 'rosterId', type: 'string', required: true, size: 50, description: 'Team roster ID' },
      { key: 'week', type: 'integer', required: true, min: 1, max: 20, description: 'Fantasy week' },
      { key: 'season', type: 'integer', required: true, min: 2020, max: 2030, description: 'Fantasy season' },
      { key: 'lineup', type: 'json', required: true, description: 'Starting lineup positions' },
      { key: 'bench', type: 'json', required: true, array: true, description: 'Bench player IDs' },
      { key: 'points', type: 'double', required: true, default: 0, description: 'Weekly points total' },
      { key: 'locked', type: 'boolean', required: true, default: false, description: 'Lineup lock status' }
    ],
    indexes: [
      { key: 'lineup_roster', type: 'key', attributes: ['rosterId'] },
      { key: 'lineup_week', type: 'key', attributes: ['week', 'season'] },
      { key: 'lineup_roster_week', type: 'unique', attributes: ['rosterId', 'week', 'season'] }
    ],
    relationships: [
      { collection: 'rosters', field: 'rosterId', type: 'oneToOne' },
      { collection: 'college_players', field: 'lineup', type: 'manyToMany' }
    ],
    dataSources: {
      primary: 'Manual',
      syncFrequency: 'realtime'
    },
    frontendUsage: ['league/[leagueId]/locker-room', 'league/[leagueId]/scoreboard'],
    apiEndpoints: ['/api/lineups/set', '/api/lineups/week/[week]']
  },

  // USER & ACTIVITY COLLECTIONS
  users: {
    id: 'users',
    name: 'Users',
    description: 'Extended user profiles and preferences',
    documentSecurity: true,
    permission: 'write',
    attributes: [
      { key: 'authId', type: 'string', required: true, size: 50, description: 'Appwrite Auth user ID' },
      { key: 'email', type: 'email', required: true, size: 100, description: 'User email address' },
      { key: 'displayName', type: 'string', required: true, size: 100, description: 'Public display name' },
      { key: 'avatarUrl', type: 'url', required: false, description: 'Profile picture URL' },
      { key: 'preferences', type: 'json', required: true, description: 'User preferences object' },
      { key: 'stats', type: 'json', required: true, description: 'User performance statistics' },
      { key: 'lastActive', type: 'datetime', required: false, description: 'Last login timestamp' }
    ],
    indexes: [
      { key: 'user_auth', type: 'unique', attributes: ['authId'] },
      { key: 'user_email', type: 'unique', attributes: ['email'] },
      { key: 'user_name', type: 'fulltext', attributes: ['displayName'] }
    ],
    relationships: [
      { collection: 'rosters', field: 'userId', type: 'oneToMany' },
      { collection: 'leagues', field: 'commissioner', type: 'oneToMany' }
    ],
    dataSources: {
      primary: 'Manual',
      syncFrequency: 'realtime'
    },
    frontendUsage: ['dashboard', 'login', 'signup'],
    apiEndpoints: ['/api/auth/me', '/api/users/profile']
  },

  activity_log: {
    id: 'activity_log',
    name: 'Activity Log',
    description: 'User and system activity tracking',
    documentSecurity: false,
    permission: 'write',
    attributes: [
      { key: 'userId', type: 'string', required: false, size: 50, description: 'User performing action' },
      { key: 'leagueId', type: 'string', required: false, size: 50, description: 'Related league ID' },
      { key: 'action', type: 'string', required: true, size: 50, description: 'Action type' },
      { key: 'details', type: 'json', required: true, description: 'Action details object' },
      { key: 'timestamp', type: 'datetime', required: true, description: 'Action timestamp' },
      { key: 'ip_address', type: 'string', required: false, size: 50, description: 'User IP address' },
      { key: 'user_agent', type: 'string', required: false, size: 500, description: 'Browser user agent' }
    ],
    indexes: [
      { key: 'log_user', type: 'key', attributes: ['userId'] },
      { key: 'log_league', type: 'key', attributes: ['leagueId'] },
      { key: 'log_action', type: 'key', attributes: ['action'] },
      { key: 'log_timestamp', type: 'key', attributes: ['timestamp'] }
    ],
    relationships: [
      { collection: 'users', field: 'userId', type: 'oneToOne' },
      { collection: 'leagues', field: 'leagueId', type: 'oneToOne' }
    ],
    dataSources: {
      primary: 'Manual',
      syncFrequency: 'realtime'
    },
    frontendUsage: ['league/[leagueId]/commissioner', 'admin dashboards'],
    apiEndpoints: ['/api/activity/log', '/api/activity/league/[leagueId]']
  }
};

/**
 * Environment Variable Mapping
 */
export const ENV_COLLECTION_MAP: Record<string, string> = {
  'NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES': 'games',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS': 'rankings',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS': 'teams',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES': 'leagues',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS': 'rosters',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS': 'college_players',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS': 'rosters',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS': 'lineups',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS': 'auctions',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS': 'bids',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS': 'player_stats',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_USERS': 'users',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG': 'activity_log'
};

/**
 * Data Pipeline Routes
 */
export const DATA_PIPELINE_MAP = {
  // External API to Appwrite sync routes
  sync: {
    '/api/sync': ['college_players', 'teams', 'games', 'rankings'],
    '/api/players/cleanup': ['college_players'],
    '/api/cfbd/sync': ['college_players', 'teams', 'games']
  },
  
  // Frontend to Appwrite write routes  
  write: {
    '/api/leagues/create': ['leagues', 'rosters'],
    '/api/leagues/join': ['rosters'],
    '/api/draft/[leagueId]/pick': ['rosters'],
    '/api/auction/[leagueId]/bid': ['bids', 'auctions']
  },
  
  // Appwrite to Frontend read routes
  read: {
    '/api/players/cached': ['college_players'],
    '/api/games': ['games', 'teams'],
    '/api/leagues/my-leagues': ['leagues', 'rosters'],
    '/api/rankings': ['rankings']
  }
};

/**
 * Utility Functions
 */
export function getCollectionConfig(collectionId: string): CollectionConfig | undefined {
  return APPWRITE_SCHEMA[collectionId];
}

export function getCollectionAttributes(collectionId: string): CollectionAttribute[] {
  return APPWRITE_SCHEMA[collectionId]?.attributes || [];
}

export function getDataSources(collectionId: string): string[] {
  const config = APPWRITE_SCHEMA[collectionId];
  if (!config) return [];
  
  return [config.dataSources.primary, ...(config.dataSources.secondary || [])];
}

export function getFrontendUsage(collectionId: string): string[] {
  return APPWRITE_SCHEMA[collectionId]?.frontendUsage || [];
}

export function getApiEndpoints(collectionId: string): string[] {
  return APPWRITE_SCHEMA[collectionId]?.apiEndpoints || [];
}

export function validateCollectionData(collectionId: string, data: any): { valid: boolean; errors: string[] } {
  const config = getCollectionConfig(collectionId);
  if (!config) return { valid: false, errors: ['Collection not found'] };
  
  const errors: string[] = [];
  
  // Check required fields
  for (const attr of config.attributes) {
    if (attr.required && (data[attr.key] === undefined || data[attr.key] === null)) {
      errors.push(`Required field missing: ${attr.key}`);
    }
    
    // Type validation
    if (data[attr.key] !== undefined) {
      const value = data[attr.key];
      
      switch (attr.type) {
        case 'string':
          if (typeof value !== 'string') errors.push(`${attr.key} must be string`);
          if (attr.size && value.length > attr.size) errors.push(`${attr.key} exceeds max size ${attr.size}`);
          break;
        case 'integer':
          if (!Number.isInteger(value)) errors.push(`${attr.key} must be integer`);
          if (attr.min && value < attr.min) errors.push(`${attr.key} below minimum ${attr.min}`);
          if (attr.max && value > attr.max) errors.push(`${attr.key} above maximum ${attr.max}`);
          break;
        case 'double':
          if (typeof value !== 'number') errors.push(`${attr.key} must be number`);
          break;
        case 'boolean':
          if (typeof value !== 'boolean') errors.push(`${attr.key} must be boolean`);
          break;
        case 'email':
          if (typeof value !== 'string' || !/\S+@\S+\.\S+/.test(value)) {
            errors.push(`${attr.key} must be valid email`);
          }
          break;
        case 'url':
          if (typeof value !== 'string' || !/^https?:\/\//.test(value)) {
            errors.push(`${attr.key} must be valid URL`);
          }
          break;
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}