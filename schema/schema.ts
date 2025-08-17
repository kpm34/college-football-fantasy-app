/**
 * SINGLE SOURCE OF TRUTH - College Football Fantasy Schema
 * 
 * This file defines the complete database schema that drives:
 * - Appwrite collection creation & configuration
 * - TypeScript type generation
 * - Environment variable configuration
 * - Seeder scripts
 * - CI/CD validation
 * - API client configuration
 */

// Schema Version for migrations
export const SCHEMA_VERSION = '1.0.0';

// Base attribute types
export type AttributeType = 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'url' | 'ip' | 'email';

export interface SchemaAttribute {
  key: string;
  type: AttributeType;
  size?: number;
  required?: boolean;
  default?: any;
  array?: boolean;
  description?: string;
}

export interface SchemaIndex {
  key: string;
  type: 'key' | 'fulltext' | 'unique';
  attributes: string[];
  orders?: ('ASC' | 'DESC')[];
  description?: string;
}

export interface SchemaCollection {
  id: string;
  name: string;
  description: string;
  attributes: SchemaAttribute[];
  indexes: SchemaIndex[];
  permissions: {
    read: string[];
    write: string[];
    create: string[];
    update: string[];
    delete: string[];
  };
}

/**
 * CANONICAL SCHEMA DEFINITION
 * Everything else is generated from this single source of truth
 */
export const SCHEMA: Record<string, SchemaCollection> = {
  // Core Game Data
  college_players: {
    id: 'college_players',
    name: 'College Players',
    description: 'Player roster data from Power 4 conferences',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true, description: 'Player full name' },
      { key: 'position', type: 'string', size: 10, required: true, description: 'Playing position (QB, RB, WR, etc.)' },
      { key: 'team', type: 'string', size: 50, required: true, description: 'Team abbreviation' },
      { key: 'conference', type: 'string', size: 20, required: true, description: 'Conference (SEC, ACC, Big 12, Big Ten)' },
      { key: 'jerseyNumber', type: 'integer', description: 'Jersey number' },
      { key: 'height', type: 'string', size: 10, description: 'Height (e.g., 6-2)' },
      { key: 'weight', type: 'integer', description: 'Weight in pounds' },
      { key: 'year', type: 'string', size: 10, description: 'Academic year (FR, SO, JR, SR)' },
      { key: 'eligible', type: 'boolean', default: true, description: 'Fantasy eligibility status' },
      { key: 'fantasy_points', type: 'double', default: 0, description: 'Current season fantasy points' },
      { key: 'season_fantasy_points', type: 'double', default: 0, description: 'Total season points' },
      { key: 'depth_chart_order', type: 'integer', description: 'Position on depth chart' },
      { key: 'last_projection_update', type: 'datetime', description: 'Last projection calculation' },
      { key: 'external_id', type: 'string', size: 50, description: 'CFBD API player ID' },
      { key: 'image_url', type: 'url', description: 'Player headshot URL' },
      { key: 'stats', type: 'string', size: 5000, description: 'Season statistics JSON' }
    ],
    indexes: [
      { key: 'player_name', type: 'fulltext', attributes: ['name'], description: 'Full-text search on names' },
      { key: 'player_team', type: 'key', attributes: ['team'], description: 'Team roster queries' },
      { key: 'player_position', type: 'key', attributes: ['position'], description: 'Position-based queries' },
      { key: 'player_conference', type: 'key', attributes: ['conference'], description: 'Conference filtering' },
      { key: 'player_eligible', type: 'key', attributes: ['eligible'], description: 'Draft eligibility filter' },
      { key: 'player_projections', type: 'key', attributes: ['fantasy_points'], orders: ['DESC'], description: 'Projection rankings' },
      { key: 'player_external', type: 'unique', attributes: ['external_id'], description: 'CFBD API integration' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  teams: {
    id: 'teams',
    name: 'Teams',
    description: 'Power 4 conference team information',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true, description: 'Full team name' },
      { key: 'abbreviation', type: 'string', size: 10, required: true, description: 'Team abbreviation' },
      { key: 'conference', type: 'string', size: 20, required: true, description: 'Conference affiliation' },
      { key: 'division', type: 'string', size: 20, description: 'Division within conference' },
      { key: 'color', type: 'string', size: 7, description: 'Primary team color (hex)' },
      { key: 'alt_color', type: 'string', size: 7, description: 'Secondary team color (hex)' },
      { key: 'logo', type: 'url', description: 'Team logo URL' },
      { key: 'mascot', type: 'string', size: 50, description: 'Team mascot name' },
      { key: 'venue', type: 'string', size: 100, description: 'Home stadium name' },
      { key: 'location', type: 'string', size: 100, description: 'City, State' }
    ],
    indexes: [
      { key: 'team_name', type: 'fulltext', attributes: ['name'], description: 'Team name search' },
      { key: 'team_conference', type: 'key', attributes: ['conference'], description: 'Conference filtering' },
      { key: 'team_abbreviation', type: 'unique', attributes: ['abbreviation'], description: 'Unique team lookup' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  games: {
    id: 'games',
    name: 'Games',
    description: 'College football game schedule and results',
    attributes: [
      { key: 'week', type: 'integer', required: true, description: 'Season week number' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'season_type', type: 'string', size: 20, required: true, description: 'regular, postseason, etc.' },
      { key: 'home_team', type: 'string', size: 50, required: true, description: 'Home team abbreviation' },
      { key: 'away_team', type: 'string', size: 50, required: true, description: 'Away team abbreviation' },
      { key: 'home_score', type: 'integer', description: 'Home team final score' },
      { key: 'away_score', type: 'integer', description: 'Away team final score' },
      { key: 'start_date', type: 'datetime', required: true, description: 'Game start time' },
      { key: 'completed', type: 'boolean', default: false, description: 'Game completion status' },
      { key: 'conference_game', type: 'boolean', default: false, description: 'Both teams in same conference' },
      { key: 'eligible_game', type: 'boolean', default: false, description: 'Fantasy scoring eligibility' },
      { key: 'venue', type: 'string', size: 100, description: 'Stadium/venue name' },
      { key: 'tv_coverage', type: 'string', size: 50, description: 'TV network broadcasting' },
      { key: 'external_id', type: 'string', size: 50, description: 'CFBD/ESPN game ID' }
    ],
    indexes: [
      { key: 'game_week', type: 'key', attributes: ['week', 'season'], description: 'Weekly schedule' },
      { key: 'game_season', type: 'key', attributes: ['season'], description: 'Season filtering' },
      { key: 'game_teams', type: 'key', attributes: ['home_team'], description: 'Team schedule lookup' },
      { key: 'game_eligible', type: 'key', attributes: ['eligible_game'], description: 'Fantasy-eligible games' },
      { key: 'game_completed', type: 'key', attributes: ['completed'], description: 'Completed games filter' },
      { key: 'game_date', type: 'key', attributes: ['start_date'], orders: ['ASC'], description: 'Chronological ordering' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'], 
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  rankings: {
    id: 'rankings',
    name: 'Rankings',
    description: 'AP Top 25 and other poll rankings',
    attributes: [
      { key: 'week', type: 'integer', required: true, description: 'Poll week' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'poll_type', type: 'string', size: 20, required: true, description: 'AP, Coaches, CFP, etc.' },
      { key: 'team', type: 'string', size: 50, required: true, description: 'Team abbreviation' },
      { key: 'rank', type: 'integer', required: true, description: 'Ranking position' },
      { key: 'points', type: 'integer', description: 'Poll points received' },
      { key: 'first_place_votes', type: 'integer', description: 'Number of first place votes' }
    ],
    indexes: [
      { key: 'ranking_week', type: 'key', attributes: ['week', 'season'], description: 'Weekly rankings' },
      { key: 'ranking_season', type: 'key', attributes: ['season'], description: 'Season rankings' },
      { key: 'ranking_team', type: 'key', attributes: ['team'], description: 'Team ranking history' },
      { key: 'ranking_ap', type: 'key', attributes: ['poll_type'], description: 'Poll type filter' },
      { key: 'ranking_order', type: 'key', attributes: ['rank'], orders: ['ASC'], description: 'Rank ordering' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  // Fantasy League Management
  leagues: {
    id: 'leagues',
    name: 'Leagues',
    description: 'Fantasy football leagues',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true, description: 'League name' },
      { key: 'commissioner', type: 'string', size: 50, required: true, description: 'Commissioner user ID' },
      { key: 'season', type: 'integer', required: true, description: 'League season year' },
      { key: 'maxTeams', type: 'integer', required: true, default: 12, description: 'Maximum teams allowed' },
      { key: 'currentTeams', type: 'integer', default: 0, description: 'Current number of teams' },
      { key: 'draftType', type: 'string', size: 20, required: true, description: 'snake, auction, keeper' },
      { key: 'gameMode', type: 'string', size: 20, required: true, description: 'standard, ppr, superflex' },
      { key: 'status', type: 'string', size: 20, required: true, default: 'recruiting', description: 'recruiting, drafting, active, completed' },
      { key: 'isPublic', type: 'boolean', default: false, description: 'Public league (searchable)' },
      { key: 'pickTimeSeconds', type: 'integer', default: 90, description: 'Draft pick time limit' },
      { key: 'scoringRules', type: 'string', size: 5000, description: 'Scoring configuration JSON' },
      { key: 'draftDate', type: 'datetime', description: 'Scheduled draft date' },
      { key: 'draftStartedAt', type: 'datetime', description: 'Actual draft start time' },
      { key: 'settings', type: 'string', size: 5000, description: 'Additional league settings JSON' }
    ],
    indexes: [
      { key: 'league_status', type: 'key', attributes: ['status'], description: 'Status filtering' },
      { key: 'league_commissioner', type: 'key', attributes: ['commissioner'], description: 'Commissioner leagues' },
      { key: 'league_public', type: 'key', attributes: ['isPublic'], description: 'Public league search' },
      { key: 'league_search', type: 'fulltext', attributes: ['name'], description: 'League name search' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:user'],
      delete: ['role:admin']
    }
  },

  rosters: {
    id: 'rosters',
    name: 'Rosters',
    description: 'Fantasy team rosters within leagues',
    attributes: [
      { key: 'leagueId', type: 'string', size: 50, required: true, description: 'League document ID' },
      { key: 'userId', type: 'string', size: 50, required: true, description: 'Team owner user ID' },
      { key: 'teamName', type: 'string', size: 100, required: true, description: 'Fantasy team name' },
      { key: 'abbreviation', type: 'string', size: 10, description: 'Team abbreviation' },
      { key: 'draftPosition', type: 'integer', description: 'Draft order position' },
      { key: 'wins', type: 'integer', default: 0, description: 'Season wins' },
      { key: 'losses', type: 'integer', default: 0, description: 'Season losses' },
      { key: 'ties', type: 'integer', default: 0, description: 'Season ties' },
      { key: 'pointsFor', type: 'double', default: 0, description: 'Total points scored' },
      { key: 'pointsAgainst', type: 'double', default: 0, description: 'Total points allowed' },
      { key: 'players', type: 'string', size: 5000, description: 'Roster player IDs JSON array' },
      { key: 'lineup', type: 'string', size: 5000, description: 'Active lineup JSON' },
      { key: 'bench', type: 'string', size: 5000, description: 'Bench players JSON' }
    ],
    indexes: [
      { key: 'roster_league', type: 'key', attributes: ['leagueId'], description: 'League rosters' },
      { key: 'roster_user', type: 'key', attributes: ['userId'], description: 'User teams' },
      { key: 'roster_league_user', type: 'unique', attributes: ['leagueId', 'userId'], description: 'One team per user per league' },
      { key: 'roster_standings', type: 'key', attributes: ['wins'], orders: ['DESC'], description: 'League standings' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:user'],
      delete: ['role:user']
    }
  },

  lineups: {
    id: 'lineups', 
    name: 'Lineups',
    description: 'Weekly fantasy lineups',
    attributes: [
      { key: 'rosterId', type: 'string', size: 50, required: true, description: 'Roster document ID' },
      { key: 'week', type: 'integer', required: true, description: 'Week number' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'lineup', type: 'string', size: 5000, description: 'Starting lineup player IDs JSON' },
      { key: 'bench', type: 'string', size: 5000, description: 'Bench player IDs JSON' },
      { key: 'points', type: 'double', default: 0, description: 'Total lineup points scored' },
      { key: 'locked', type: 'boolean', default: false, description: 'Lineup locked for scoring' }
    ],
    indexes: [
      { key: 'lineup_roster', type: 'key', attributes: ['rosterId'], description: 'Team lineups' },
      { key: 'lineup_week', type: 'key', attributes: ['week', 'season'], description: 'Weekly lineups' },
      { key: 'lineup_roster_week', type: 'unique', attributes: ['rosterId', 'week', 'season'], description: 'One lineup per team per week' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:user'],
      delete: ['role:user']
    }
  },

  // Auction Draft System
  auctions: {
    id: 'auctions',
    name: 'Auctions',
    description: 'Auction draft sessions',
    attributes: [
      { key: 'leagueId', type: 'string', size: 50, required: true, description: 'League document ID' },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending', description: 'pending, active, paused, completed' },
      { key: 'currentNomination', type: 'string', size: 50, description: 'Current player being auctioned' },
      { key: 'nominatingTeam', type: 'string', size: 50, description: 'Team that nominated player' },
      { key: 'currentBid', type: 'double', default: 1, description: 'Current highest bid amount' },
      { key: 'biddingTeam', type: 'string', size: 50, description: 'Team with current high bid' },
      { key: 'auctionEndTime', type: 'datetime', description: 'When current auction expires' },
      { key: 'settings', type: 'string', size: 2000, description: 'Auction configuration JSON' }
    ],
    indexes: [
      { key: 'auction_league', type: 'key', attributes: ['leagueId'], description: 'League auctions' },
      { key: 'auction_status', type: 'key', attributes: ['status'], description: 'Active auctions' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:user'],
      delete: ['role:admin']
    }
  },

  bids: {
    id: 'bids',
    name: 'Bids',
    description: 'Auction bid history',
    attributes: [
      { key: 'auctionId', type: 'string', size: 50, required: true, description: 'Auction document ID' },
      { key: 'playerId', type: 'string', size: 50, required: true, description: 'Player being bid on' },
      { key: 'teamId', type: 'string', size: 50, required: true, description: 'Bidding team roster ID' },
      { key: 'amount', type: 'double', required: true, description: 'Bid amount' },
      { key: 'timestamp', type: 'datetime', required: true, description: 'When bid was placed' },
      { key: 'isWinning', type: 'boolean', default: false, description: 'Final winning bid flag' }
    ],
    indexes: [
      { key: 'bid_auction', type: 'key', attributes: ['auctionId'], description: 'Auction bid history' },
      { key: 'bid_player', type: 'key', attributes: ['playerId'], description: 'Player bid history' },
      { key: 'bid_team', type: 'key', attributes: ['teamId'], description: 'Team bid history' },
      { key: 'bid_timestamp', type: 'key', attributes: ['timestamp'], orders: ['DESC'], description: 'Chronological bid order' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  // Statistics and Performance
  player_stats: {
    id: 'player_stats',
    name: 'Player Stats',
    description: 'Game-by-game player statistics',
    attributes: [
      { key: 'playerId', type: 'string', size: 50, required: true, description: 'Player document ID' },
      { key: 'gameId', type: 'string', size: 50, required: true, description: 'Game document ID' },
      { key: 'week', type: 'integer', required: true, description: 'Week number' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'opponent', type: 'string', size: 50, description: 'Opponent team abbreviation' },
      { key: 'fantasy_points', type: 'double', default: 0, description: 'Fantasy points earned' },
      { key: 'stats', type: 'string', size: 5000, description: 'Detailed game statistics JSON' },
      { key: 'eligible', type: 'boolean', default: true, description: 'Counts toward fantasy scoring' }
    ],
    indexes: [
      { key: 'stats_player', type: 'key', attributes: ['playerId'], description: 'Player statistics' },
      { key: 'stats_game', type: 'key', attributes: ['gameId'], description: 'Game statistics' },
      { key: 'stats_week', type: 'key', attributes: ['week', 'season'], description: 'Weekly statistics' },
      { key: 'stats_player_week', type: 'unique', attributes: ['playerId', 'week', 'season'], description: 'One stat line per player per week' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  // User Management
  users: {
    id: 'users',
    name: 'Users',
    description: 'Application users',
    attributes: [
      { key: 'authId', type: 'string', size: 50, required: true, description: 'Appwrite Auth user ID' },
      { key: 'email', type: 'email', required: true, description: 'User email address' },
      { key: 'displayName', type: 'string', size: 100, description: 'Display name' },
      { key: 'avatarUrl', type: 'url', description: 'Profile picture URL' },
      { key: 'preferences', type: 'string', size: 2000, description: 'User preferences JSON' },
      { key: 'stats', type: 'string', size: 5000, description: 'User statistics JSON' },
      { key: 'lastActive', type: 'datetime', description: 'Last login/activity time' }
    ],
    indexes: [
      { key: 'user_auth', type: 'unique', attributes: ['authId'], description: 'Auth integration' },
      { key: 'user_email', type: 'unique', attributes: ['email'], description: 'Email lookup' },
      { key: 'user_name', type: 'fulltext', attributes: ['displayName'], description: 'Name search' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:user'],
      delete: ['role:admin']
    }
  },

  // System and Logging
  activity_log: {
    id: 'activity_log',
    name: 'Activity Log', 
    description: 'System activity and audit trail',
    attributes: [
      { key: 'userId', type: 'string', size: 50, description: 'Acting user ID' },
      { key: 'leagueId', type: 'string', size: 50, description: 'Related league ID' },
      { key: 'action', type: 'string', size: 50, required: true, description: 'Action performed' },
      { key: 'details', type: 'string', size: 2000, description: 'Action details JSON' },
      { key: 'timestamp', type: 'datetime', required: true, description: 'When action occurred' },
      { key: 'ip_address', type: 'ip', description: 'User IP address' },
      { key: 'user_agent', type: 'string', size: 500, description: 'User browser/client info' }
    ],
    indexes: [
      { key: 'log_user', type: 'key', attributes: ['userId'], description: 'User activity' },
      { key: 'log_league', type: 'key', attributes: ['leagueId'], description: 'League activity' },
      { key: 'log_action', type: 'key', attributes: ['action'], description: 'Action filtering' },
      { key: 'log_timestamp', type: 'key', attributes: ['timestamp'], orders: ['DESC'], description: 'Chronological log' }
    ],
    permissions: {
      read: ['role:admin'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  }
};

/**
 * DERIVED CONFIGURATIONS
 * These are automatically generated from the schema above
 */

// Environment variable mapping
export const ENV_VARS = Object.keys(SCHEMA).reduce((acc, collectionId) => {
  acc[`NEXT_PUBLIC_APPWRITE_COLLECTION_${collectionId.toUpperCase()}`] = collectionId;
  return acc;
}, {} as Record<string, string>);

// TypeScript type generation helper
export type SchemaCollectionNames = keyof typeof SCHEMA;

// Collection IDs array for validation
export const COLLECTION_IDS = Object.keys(SCHEMA);

// Required collections (must exist for app to function)
export const REQUIRED_COLLECTIONS: SchemaCollectionNames[] = [
  'college_players',
  'teams', 
  'games',
  'leagues',
  'rosters',
  'users'
];

// Optional collections (can be created as needed)
export const OPTIONAL_COLLECTIONS: SchemaCollectionNames[] = [
  'auctions',
  'bids', 
  'lineups',
  'player_stats',
  'rankings',
  'activity_log'
];

/**
 * Schema validation helpers
 */
export function validateSchema(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [collectionId, collection] of Object.entries(SCHEMA)) {
    // Validate collection ID matches key
    if (collection.id !== collectionId) {
      errors.push(`Collection ${collectionId}: id mismatch`);
    }
    
    // Validate required attributes
    const requiredAttrs = collection.attributes.filter(attr => attr.required);
    if (requiredAttrs.length === 0 && collectionId !== 'activity_log') {
      errors.push(`Collection ${collectionId}: no required attributes`);
    }
    
    // Validate indexes reference existing attributes
    for (const index of collection.indexes) {
      for (const attr of index.attributes) {
        if (!collection.attributes.find(a => a.key === attr)) {
          errors.push(`Collection ${collectionId}: index ${index.key} references non-existent attribute ${attr}`);
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get environment variable name for collection
 */
export function getEnvVarName(collectionId: SchemaCollectionNames): string {
  return `NEXT_PUBLIC_APPWRITE_COLLECTION_${collectionId.toUpperCase()}`;
}

/**
 * Get TypeScript interface name for collection
 */
export function getTypeName(collectionId: SchemaCollectionNames): string {
  return collectionId.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}