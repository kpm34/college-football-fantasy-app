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
export type AttributeType = 'string' | 'integer' | 'double' | 'float' | 'boolean' | 'datetime' | 'url' | 'ip' | 'email' | 'relationship';

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
      { key: 'team', type: 'string', size: 50, required: true, description: 'Full team name (e.g., Alabama)' },
      { key: 'conference', type: 'string', size: 20, required: true, description: 'Conference (SEC, ACC, Big 12, Big Ten)' },
      { key: 'power_4', type: 'boolean', default: true, description: 'Is Power 4 conference member' },
      { key: 'jersey', type: 'string', size: 5, description: 'Jersey number as string' },
      { key: 'height', type: 'string', size: 10, description: 'Height (e.g., 6-2)' },
      { key: 'weight', type: 'string', size: 10, description: 'Weight (string format from API)' },
      { key: 'year', type: 'string', size: 10, description: 'Academic year (FR, SO, JR, SR)' },
      { key: 'draftable', type: 'boolean', default: true, description: 'Available for fantasy draft' },
      
      // Enhanced Projection Fields (Essential Only)
      { key: 'fantasy_points', type: 'double', default: 0, description: 'Enhanced fantasy points with depth chart logic' },
      { key: 'projection', type: 'double', default: 0, description: 'Legacy projection field' },
      { key: 'rushing_projection', type: 'double', default: 0, description: 'Projected rushing yards' },
      { key: 'receiving_projection', type: 'double', default: 0, description: 'Projected receiving yards' },
      { key: 'td_projection', type: 'double', default: 0, description: 'Projected total touchdowns' },
      { key: 'int_projection', type: 'double', default: 0, description: 'Projected interceptions' },
      { key: 'field_goals_projection', type: 'double', default: 0, description: 'Projected field goals' },
      { key: 'extra_points_projection', type: 'double', default: 0, description: 'Projected extra points' },
      
      // Metadata (Essential Only)
      { key: 'created_at', type: 'string', size: 50, description: 'Record creation timestamp' },
      { key: 'updated_at', type: 'string', size: 50, description: 'Last update timestamp' }
    ],
    indexes: [
      { key: 'player_name', type: 'fulltext', attributes: ['name'], description: 'Full-text search on names' },
      { key: 'player_team', type: 'key', attributes: ['team'], description: 'Team roster queries' },
      { key: 'player_position', type: 'key', attributes: ['position'], description: 'Position-based queries' },
      { key: 'player_conference', type: 'key', attributes: ['conference'], description: 'Conference filtering' },
      { key: 'player_projections', type: 'key', attributes: ['fantasy_points'], orders: ['DESC'], description: 'Projection rankings' }
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
    name: 'AP Rankings',
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

  // User Teams (Rosters) - Fantasy team rosters within leagues  
  user_teams: {
    id: 'user_teams',
    name: 'User Teams',
    description: 'Fantasy team rosters within leagues',
    attributes: [
      { key: 'leagueId', type: 'string', size: 255, required: true, description: 'League document ID' },
      { key: 'userId', type: 'string', size: 255, required: true, description: 'Team owner user ID' },
      { key: 'teamName', type: 'string', size: 128, required: true, description: 'Fantasy team name' },
      { key: 'draftPosition', type: 'integer', description: 'Draft order position' },
      { key: 'wins', type: 'integer', default: 0, description: 'Season wins' },
      { key: 'losses', type: 'integer', default: 0, description: 'Season losses' },
      { key: 'pointsFor', type: 'double', default: 0, description: 'Total points scored' },
      { key: 'pointsAgainst', type: 'double', default: 0, description: 'Total points allowed' },
      { key: 'players', type: 'string', size: 5000, required: true, description: 'Roster player IDs JSON array' }
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'], description: 'League rosters' },
      { key: 'user_idx', type: 'key', attributes: ['userId'], description: 'User teams' },
      { key: 'league_user_idx', type: 'unique', attributes: ['leagueId', 'userId'], description: 'One team per user per league' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:user'],
      delete: ['role:user']
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
      { key: 'maxTeams', type: 'integer', default: 12, description: 'Maximum teams allowed' },
      { key: 'currentTeams', type: 'integer', default: 0, description: 'Current number of teams' },
      { key: 'draftType', type: 'string', size: 20, required: true, description: 'snake, auction, keeper' },
      { key: 'gameMode', type: 'string', size: 20, required: true, description: 'standard, ppr, superflex' },
      { key: 'status', type: 'string', size: 20, default: 'recruiting', description: 'recruiting, drafting, active, completed' },
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

  matchups: {
    id: 'matchups',
    name: 'Matchups',
    description: 'Head-to-head weekly fantasy matchups',
    attributes: [
      { key: 'leagueId', type: 'string', size: 50, required: true, description: 'League document ID' },
      { key: 'week', type: 'integer', required: true, description: 'Week number' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'team1Id', type: 'string', size: 50, required: true, description: 'First team roster ID' },
      { key: 'team2Id', type: 'string', size: 50, required: true, description: 'Second team roster ID' },
      { key: 'team1Score', type: 'double', default: 0, description: 'First team total score' },
      { key: 'team2Score', type: 'double', default: 0, description: 'Second team total score' },
      { key: 'winnerId', type: 'string', size: 50, description: 'Winning team roster ID' },
      { key: 'completed', type: 'boolean', default: false, description: 'Matchup scoring completed' },
      { key: 'playoffMatchup', type: 'boolean', default: false, description: 'Is playoff/championship matchup' }
    ],
    indexes: [
      { key: 'matchup_league', type: 'key', attributes: ['leagueId'], description: 'League matchups' },
      { key: 'matchup_week', type: 'key', attributes: ['week', 'season'], description: 'Weekly matchups' },
      { key: 'matchup_teams', type: 'key', attributes: ['team1Id'], description: 'Team matchup history' },
      { key: 'matchup_completed', type: 'key', attributes: ['completed'], description: 'Completed matchups' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  drafts: {
    id: 'drafts',
    name: 'drafts',
    description: 'Snake draft sessions',
    attributes: [
      { key: 'leagueId', type: 'string', size: 100, required: true, description: 'League document ID' },
      { key: 'status', type: 'string', size: 100, required: true, description: 'Draft status (pending, active, completed)' },
      { key: 'currentRound', type: 'integer', description: 'Current draft round' },
      { key: 'currentPick', type: 'integer', description: 'Current pick number' },
      { key: 'maxRounds', type: 'integer', description: 'Maximum draft rounds' },
      { key: 'draftOrder', type: 'string', size: 100, description: 'Team draft order JSON' },
      { key: 'startTime', type: 'datetime', description: 'Draft start time' },
      { key: 'endTime', type: 'datetime', description: 'Draft end time' }
    ],
    indexes: [
      { key: 'draft_league', type: 'key', attributes: ['leagueId'], description: 'League drafts' },
      { key: 'draft_status', type: 'key', attributes: ['status'], description: 'Draft status filter' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  draft_picks: {
    id: 'draft_picks',
    name: 'draft_picks',
    description: 'Individual draft picks and selections',
    attributes: [
      { key: 'leagueId', type: 'string', size: 100, required: true, description: 'League document ID' },
      { key: 'userId', type: 'string', size: 100, required: true, description: 'Drafting user ID' },
      { key: 'playerId', type: 'string', size: 100, required: true, description: 'Selected player ID' },
      { key: 'round', type: 'integer', required: true, description: 'Draft round number' },
      { key: 'pick', type: 'integer', required: true, description: 'Pick number within round' },
      { key: 'timestamp', type: 'datetime', required: true, description: 'When pick was made' },
      { key: 'league', type: 'relationship', description: 'Relationship to leagues collection' },
      { key: 'player', type: 'relationship', description: 'Relationship to college_players collection' }
    ],
    indexes: [
      { key: 'leagueId', type: 'key', attributes: ['leagueId'], description: 'League draft picks' },
      { key: 'playerId', type: 'key', attributes: ['playerId'], description: 'Player draft history' },
      { key: 'round', type: 'key', attributes: ['round'], description: 'Round-based picks' },
      { key: 'leagueId_round_pick', type: 'key', attributes: ['leagueId', 'round', 'pick'], description: 'Unique pick identification' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:user'],
      create: ['role:user'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  // Auction Draft System
  auctions: {
    id: 'auctions',
    name: 'Auctions',
    description: 'Auction draft sessions',
    attributes: [
      { key: 'leagueId', type: 'string', size: 50, required: true, description: 'League document ID' },
      { key: 'status', type: 'string', size: 20, default: 'pending', description: 'pending, active, paused, completed' },
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

  // Enhanced Projections Support
  model_inputs: {
    id: 'model_inputs',
    name: 'model_inputs',
    description: 'Projection model inputs including depth charts and team data',
    attributes: [
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'week', type: 'integer', description: 'Week number (null for season-long data)' },
      { key: 'depth_chart', type: 'string', size: 16384, description: 'Legacy depth chart format' },
      { key: 'team_pace', type: 'string', size: 4096, description: 'Team pace data JSON' },
      { key: 'pass_rate', type: 'string', size: 4096, description: 'Team pass rate data JSON' },
      { key: 'rush_rate', type: 'string', size: 4096, description: 'Team rush rate data JSON' },
      { key: 'depth_chart_json', type: 'string', size: 16384, description: 'Enhanced depth chart data JSON' },
      { key: 'usage_priors_json', type: 'string', size: 16384, description: 'Player usage priors JSON' },
      { key: 'team_efficiency_json', type: 'string', size: 16384, description: 'Team efficiency ratings JSON' },
      { key: 'pace_estimates_json', type: 'string', size: 16384, description: 'Team pace estimates JSON' },
      { key: 'opponent_grades_by_pos_json', type: 'string', size: 16384, description: 'Opponent grades by position JSON' },
      { key: 'manual_overrides_json', type: 'string', size: 16384, description: 'Manual projection overrides JSON' },
      { key: 'ea_ratings_json', type: 'string', size: 16384, description: 'EA Sports player ratings JSON' },
      { key: 'nfl_draft_capital_json', type: 'string', size: 16384, description: 'NFL draft capital projections JSON' }
    ],
    indexes: [
      { key: 'model_season', type: 'key', attributes: ['season'], description: 'Season-based queries' },
      { key: 'model_week', type: 'key', attributes: ['week'], description: 'Weekly model inputs' },
      { key: 'model_season_week', type: 'unique', attributes: ['season', 'week'], description: 'Unique season-week combination' }
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
    name: 'activity_log', 
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
  },

  // Data Ingestion Collections (Extended Schema)
  player_depth_charts: {
    id: 'player_depth_charts',
    name: 'Player Depth Charts',
    description: 'Weekly depth chart positions and starter probabilities',
    attributes: [
      // Player Identification
      { key: 'player_id', type: 'string', size: 50, required: true, description: 'Reference to college_players.$id' },
      { key: 'team_id', type: 'string', size: 50, required: true, description: 'Team identifier' },
      { key: 'position', type: 'string', size: 10, required: true, description: 'Player position (QB, RB, WR, TE, K)' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'week', type: 'integer', required: true, description: 'Week number' },
      
      // Depth Chart Data
      { key: 'depth_chart_rank', type: 'integer', required: true, description: 'Depth position (1=starter, 2=backup, etc.)' },
      { key: 'starter_prob', type: 'double', required: true, description: 'Probability of starting (0.0-1.0)' },
      { key: 'snap_share_proj', type: 'double', default: 0, description: 'Projected snap share percentage' },
      
      // Injury Status
      { key: 'injury_status', type: 'string', size: 20, required: true, description: 'OUT, QUESTIONABLE, or ACTIVE' },
      { key: 'injury_note', type: 'string', size: 500, description: 'Injury detail note' },
      { key: 'injury_as_of', type: 'datetime', required: true, description: 'Injury status timestamp' },
      { key: 'injury_source', type: 'string', size: 30, required: true, description: 'Injury data source' },
      
      // Usage Trends (EMAs)
      { key: 'usage_1w_snap_pct', type: 'double', default: 0, description: '1-week snap percentage' },
      { key: 'usage_4w_snap_pct', type: 'double', default: 0, description: '4-week snap percentage EMA' },
      { key: 'usage_1w_route_pct', type: 'double', default: 0, description: '1-week route percentage' },
      { key: 'usage_4w_route_pct', type: 'double', default: 0, description: '4-week route percentage EMA' },
      { key: 'usage_1w_carry_share', type: 'double', default: 0, description: '1-week carry share' },
      { key: 'usage_4w_carry_share', type: 'double', default: 0, description: '4-week carry share EMA' },
      { key: 'usage_1w_target_share', type: 'double', default: 0, description: '1-week target share' },
      { key: 'usage_4w_target_share', type: 'double', default: 0, description: '4-week target share EMA' },
      
      // Returning Production (prior season)
      { key: 'prior_season_target_share', type: 'double', default: 0, description: 'Previous season target share' },
      { key: 'prior_season_carry_share', type: 'double', default: 0, description: 'Previous season carry share' },
      { key: 'prior_season_yards_share', type: 'double', default: 0, description: 'Previous season yards share' },
      { key: 'prior_season_td_share', type: 'double', default: 0, description: 'Previous season TD share' },
      
      // Metadata
      { key: 'as_of', type: 'datetime', required: true, description: 'Data freshness timestamp' },
      { key: 'source', type: 'string', size: 30, required: true, description: 'Primary data source' },
      { key: 'confidence', type: 'double', required: true, description: 'Data confidence score (0.0-1.0)' },
      { key: 'provenance_trail', type: 'string', size: 8192, description: 'JSON array of provenance records' },
      { key: 'manual_overrides', type: 'string', size: 4096, description: 'JSON array of manual overrides' },
      { key: 'created_at', type: 'datetime', required: true, description: 'Record creation timestamp' },
      { key: 'updated_at', type: 'datetime', required: true, description: 'Last update timestamp' }
    ],
    indexes: [
      { key: 'player_week', type: 'unique', attributes: ['player_id', 'season', 'week'], description: 'One record per player per week' },
      { key: 'team_position_week', type: 'key', attributes: ['team_id', 'position', 'season', 'week'], description: 'Team depth charts' },
      { key: 'depth_rank', type: 'key', attributes: ['depth_chart_rank'], orders: ['ASC'], description: 'Starters and depth ordering' },
      { key: 'injury_status', type: 'key', attributes: ['injury_status'], description: 'Injury report filtering' },
      { key: 'season_week', type: 'key', attributes: ['season', 'week'], description: 'Weekly data queries' },
      { key: 'freshness', type: 'key', attributes: ['as_of'], orders: ['DESC'], description: 'Data freshness queries' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin', 'role:data_sync'],
      create: ['role:admin', 'role:data_sync'],
      update: ['role:admin', 'role:data_sync'],
      delete: ['role:admin']
    }
  },

  team_context: {
    id: 'team_context',
    name: 'Team Context',
    description: 'Weekly team pace, play-calling, and opponent strength data',
    attributes: [
      // Team Identification
      { key: 'team_id', type: 'string', size: 50, required: true, description: 'Team identifier' },
      { key: 'opponent_team_id', type: 'string', size: 50, description: 'Opponent team identifier' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'week', type: 'integer', required: true, description: 'Week number' },
      
      // Pace & Volume Data
      { key: 'estimated_plays_per_game', type: 'double', required: true, description: 'Projected plays per game' },
      { key: 'actual_plays_per_game', type: 'double', description: 'Actual plays (post-game only)' },
      { key: 'pace_rank', type: 'integer', description: 'National pace ranking (1-130)' },
      { key: 'seconds_per_play', type: 'double', description: 'Average seconds between plays' },
      
      // Play Calling Tendencies
      { key: 'run_rate', type: 'double', required: true, description: 'Overall run rate (0.0-1.0)' },
      { key: 'pass_rate', type: 'double', required: true, description: 'Overall pass rate (0.0-1.0)' },
      { key: 'red_zone_run_rate', type: 'double', default: 0, description: 'Red zone run rate' },
      { key: 'red_zone_pass_rate', type: 'double', default: 0, description: 'Red zone pass rate' },
      { key: 'first_down_run_rate', type: 'double', default: 0, description: 'First down run rate' },
      
      // Opponent Strength (Defensive Rankings)
      { key: 'opponent_def_rank_vs_qb', type: 'integer', description: 'Opp defense rank vs QB (1-130)' },
      { key: 'opponent_def_rank_vs_rb', type: 'integer', description: 'Opp defense rank vs RB (1-130)' },
      { key: 'opponent_def_rank_vs_wr', type: 'integer', description: 'Opp defense rank vs WR (1-130)' },
      { key: 'opponent_def_rank_vs_te', type: 'integer', description: 'Opp defense rank vs TE (1-130)' },
      { key: 'opponent_total_def_rank', type: 'integer', description: 'Overall defensive ranking' },
      
      // Game Environment (Vegas/Betting Data)
      { key: 'estimated_team_total', type: 'double', description: 'Vegas implied team total' },
      { key: 'spread', type: 'double', description: 'Point spread (positive = favored)' },
      { key: 'over_under', type: 'double', description: 'Game total over/under' },
      { key: 'home_away', type: 'string', size: 10, description: 'HOME or AWAY' },
      
      // Weather (if outdoor game)
      { key: 'temperature', type: 'integer', description: 'Game temperature (Fahrenheit)' },
      { key: 'wind_mph', type: 'integer', description: 'Wind speed in MPH' },
      { key: 'precipitation', type: 'string', size: 20, description: 'Rain/Snow conditions' },
      { key: 'is_dome', type: 'boolean', default: false, description: 'Indoor/dome game' },
      
      // Metadata
      { key: 'as_of', type: 'datetime', required: true, description: 'Data freshness timestamp' },
      { key: 'source', type: 'string', size: 30, required: true, description: 'Primary data source' },
      { key: 'confidence', type: 'double', required: true, description: 'Data confidence score' },
      { key: 'created_at', type: 'datetime', required: true, description: 'Record creation timestamp' },
      { key: 'updated_at', type: 'datetime', required: true, description: 'Last update timestamp' }
    ],
    indexes: [
      { key: 'team_week', type: 'unique', attributes: ['team_id', 'season', 'week'], description: 'One record per team per week' },
      { key: 'season_week', type: 'key', attributes: ['season', 'week'], description: 'Weekly context data' },
      { key: 'opponent', type: 'key', attributes: ['opponent_team_id'], description: 'Opponent matchup queries' },
      { key: 'pace_rank', type: 'key', attributes: ['pace_rank'], orders: ['ASC'], description: 'Pace rankings' },
      { key: 'team_total', type: 'key', attributes: ['estimated_team_total'], orders: ['DESC'], description: 'Scoring environment' }
    ],
    permissions: {
      read: ['any'],
      write: ['role:admin', 'role:data_sync'],
      create: ['role:admin', 'role:data_sync'],
      update: ['role:admin', 'role:data_sync'],
      delete: ['role:admin']
    }
  },

  ingestion_log: {
    id: 'ingestion_log',
    name: 'Ingestion Log',
    description: 'Data pipeline execution and change tracking',
    attributes: [
      // Execution Metadata
      { key: 'run_id', type: 'string', size: 50, required: true, description: 'Unique run identifier' },
      { key: 'season', type: 'integer', required: true, description: 'Target season' },
      { key: 'week', type: 'integer', required: true, description: 'Target week' },
      { key: 'adapter', type: 'string', size: 30, required: true, description: 'Adapter that generated data' },
      { key: 'source', type: 'string', size: 30, required: true, description: 'Data source identifier' },
      
      // Execution Status
      { key: 'status', type: 'string', size: 20, required: true, description: 'SUCCESS, FAILED, or PARTIAL' },
      { key: 'started_at', type: 'datetime', required: true, description: 'Execution start time' },
      { key: 'completed_at', type: 'datetime', description: 'Execution completion time' },
      { key: 'duration_ms', type: 'integer', description: 'Execution duration in milliseconds' },
      
      // Processing Statistics
      { key: 'records_processed', type: 'integer', default: 0, description: 'Total records processed' },
      { key: 'records_created', type: 'integer', default: 0, description: 'New records created' },
      { key: 'records_updated', type: 'integer', default: 0, description: 'Existing records updated' },
      { key: 'records_failed', type: 'integer', default: 0, description: 'Records that failed processing' },
      { key: 'conflicts_resolved', type: 'integer', default: 0, description: 'Data conflicts resolved' },
      
      // Change Tracking
      { key: 'depth_chart_changes', type: 'integer', default: 0, description: 'Depth chart position changes' },
      { key: 'injury_status_changes', type: 'integer', default: 0, description: 'Injury status changes' },
      { key: 'starter_prob_changes', type: 'integer', default: 0, description: 'Starter probability changes' },
      
      // Error Information
      { key: 'error_message', type: 'string', size: 1000, description: 'Error details if failed' },
      { key: 'error_stack', type: 'string', size: 5000, description: 'Error stack trace' },
      { key: 'warning_count', type: 'integer', default: 0, description: 'Number of warnings generated' },
      { key: 'warnings', type: 'string', size: 5000, description: 'JSON array of warning messages' },
      
      // Output Data
      { key: 'change_summary', type: 'string', size: 10000, description: 'JSON summary of changes made' },
      { key: 'diff_log', type: 'string', size: 20000, description: 'Detailed diff log' },
      { key: 'snapshot_path', type: 'string', size: 200, description: 'Path to data snapshot' }
    ],
    indexes: [
      { key: 'run_id', type: 'unique', attributes: ['run_id'], description: 'Unique run identifier' },
      { key: 'execution_time', type: 'key', attributes: ['started_at'], orders: ['DESC'], description: 'Recent runs first' },
      { key: 'season_week', type: 'key', attributes: ['season', 'week'], description: 'Weekly execution history' },
      { key: 'adapter_source', type: 'key', attributes: ['adapter', 'source'], description: 'Adapter performance tracking' },
      { key: 'status', type: 'key', attributes: ['status'], description: 'Execution status filtering' }
    ],
    permissions: {
      read: ['role:admin', 'role:data_sync'],
      write: ['role:admin', 'role:data_sync'],
      create: ['role:admin', 'role:data_sync'],
      update: ['role:admin', 'role:data_sync'],
      delete: ['role:admin']
    }
  },

  manual_overrides: {
    id: 'manual_overrides',
    name: 'Manual Overrides',
    description: 'Admin manual overrides for data corrections',
    attributes: [
      // Override Identification
      { key: 'player_id', type: 'string', size: 50, required: true, description: 'Target player ID' },
      { key: 'season', type: 'integer', required: true, description: 'Season year' },
      { key: 'week', type: 'integer', required: true, description: 'Week number (0 = season-long)' },
      { key: 'field_name', type: 'string', size: 50, required: true, description: 'Field being overridden' },
      
      // Override Data
      { key: 'override_value', type: 'string', size: 500, required: true, description: 'JSON-encoded override value' },
      { key: 'original_value', type: 'string', size: 500, description: 'Original value before override' },
      { key: 'original_source', type: 'string', size: 30, description: 'Original data source' },
      
      // Administrative Data
      { key: 'admin_user_id', type: 'string', size: 50, required: true, description: 'Admin who made override' },
      { key: 'reason', type: 'string', size: 1000, required: true, description: 'Reason for override' },
      { key: 'priority', type: 'integer', default: 100, description: 'Override priority (higher wins)' },
      { key: 'is_active', type: 'boolean', default: true, description: 'Override is currently active' },
      
      // Temporal Data
      { key: 'effective_from', type: 'datetime', required: true, description: 'When override takes effect' },
      { key: 'expires_at', type: 'datetime', description: 'When override expires (null = permanent)' },
      { key: 'created_at', type: 'datetime', required: true, description: 'Override creation time' },
      { key: 'deactivated_at', type: 'datetime', description: 'When override was deactivated' },
      { key: 'deactivated_by', type: 'string', size: 50, description: 'Admin who deactivated override' },
      
      // Validation
      { key: 'validation_status', type: 'string', size: 20, default: 'pending', description: 'PENDING, VALIDATED, REJECTED' },
      { key: 'validated_by', type: 'string', size: 50, description: 'Admin who validated override' },
      { key: 'validation_notes', type: 'string', size: 1000, description: 'Validation notes' }
    ],
    indexes: [
      { key: 'player_field_week', type: 'key', attributes: ['player_id', 'field_name', 'season', 'week'], description: 'Override lookups' },
      { key: 'active_overrides', type: 'key', attributes: ['is_active'], description: 'Active overrides only' },
      { key: 'admin_overrides', type: 'key', attributes: ['admin_user_id'], description: 'Overrides by admin' },
      { key: 'expiration', type: 'key', attributes: ['expires_at'], orders: ['ASC'], description: 'Expiring overrides' },
      { key: 'validation_queue', type: 'key', attributes: ['validation_status'], description: 'Validation workflow' },
      { key: 'priority', type: 'key', attributes: ['priority'], orders: ['DESC'], description: 'Priority ordering' }
    ],
    permissions: {
      read: ['role:admin', 'role:data_sync'],
      write: ['role:admin'],
      create: ['role:admin'],
      update: ['role:admin'],
      delete: ['role:admin']
    }
  },

  data_source_registry: {
    id: 'data_source_registry',
    name: 'Data Source Registry',
    description: 'External data source configuration and health monitoring',
    attributes: [
      // Source Identification
      { key: 'source_id', type: 'string', size: 50, required: true, description: 'Unique source identifier' },
      { key: 'source_name', type: 'string', size: 100, required: true, description: 'Human-readable source name' },
      { key: 'source_type', type: 'string', size: 30, required: true, description: 'team_notes, vendor, stats, manual' },
      { key: 'adapter_class', type: 'string', size: 100, required: true, description: 'Adapter class name' },
      
      // Connection Configuration
      { key: 'base_url', type: 'url', description: 'Base API URL' },
      { key: 'auth_type', type: 'string', size: 20, description: 'API key, OAuth, etc.' },
      { key: 'rate_limit_per_hour', type: 'integer', default: 1000, description: 'Requests per hour limit' },
      { key: 'timeout_seconds', type: 'integer', default: 30, description: 'Request timeout' },
      { key: 'retry_attempts', type: 'integer', default: 3, description: 'Retry attempts on failure' },
      
      // Data Quality Metrics
      { key: 'reliability_score', type: 'double', default: 0.5, description: 'Reliability score (0.0-1.0)' },
      { key: 'data_freshness_hours', type: 'integer', default: 24, description: 'Expected data freshness' },
      { key: 'coverage_teams', type: 'string', size: 2000, description: 'JSON array of covered teams' },
      { key: 'coverage_positions', type: 'string', size: 100, description: 'JSON array of covered positions' },
      
      // Health Monitoring
      { key: 'is_active', type: 'boolean', default: true, description: 'Source is currently active' },
      { key: 'last_success_at', type: 'datetime', description: 'Last successful data fetch' },
      { key: 'last_failure_at', type: 'datetime', description: 'Last failure timestamp' },
      { key: 'consecutive_failures', type: 'integer', default: 0, description: 'Consecutive failure count' },
      { key: 'failure_threshold', type: 'integer', default: 5, description: 'Failures before deactivation' },
      
      // Performance Statistics
      { key: 'total_requests', type: 'integer', default: 0, description: 'Total requests made' },
      { key: 'successful_requests', type: 'integer', default: 0, description: 'Successful requests' },
      { key: 'avg_response_time_ms', type: 'double', default: 0, description: 'Average response time' },
      { key: 'last_request_duration_ms', type: 'integer', description: 'Duration of last request' },
      
      // Metadata
      { key: 'created_at', type: 'datetime', required: true, description: 'Source registration time' },
      { key: 'updated_at', type: 'datetime', required: true, description: 'Last configuration update' },
      { key: 'created_by', type: 'string', size: 50, required: true, description: 'Admin who registered source' },
      { key: 'notes', type: 'string', size: 1000, description: 'Administrative notes' }
    ],
    indexes: [
      { key: 'source_id', type: 'unique', attributes: ['source_id'], description: 'Unique source identifier' },
      { key: 'source_type', type: 'key', attributes: ['source_type'], description: 'Sources by type' },
      { key: 'active_sources', type: 'key', attributes: ['is_active'], description: 'Active sources only' },
      { key: 'reliability', type: 'key', attributes: ['reliability_score'], orders: ['DESC'], description: 'Most reliable first' },
      { key: 'health_check', type: 'key', attributes: ['last_success_at'], orders: ['DESC'], description: 'Health monitoring' }
    ],
    permissions: {
      read: ['role:admin', 'role:data_sync'],
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
  'user_teams',
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

// Data ingestion collections (for enhanced data pipeline)
export const DATA_INGESTION_COLLECTIONS: SchemaCollectionNames[] = [
  'player_depth_charts',
  'team_context',
  'ingestion_log',
  'manual_overrides',
  'data_source_registry'
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