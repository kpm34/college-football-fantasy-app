/**
 * Database Schema Extensions for Data Ingestion System
 * 
 * Extends the existing schema in /schema/schema.ts with new collections
 * for depth charts, injury tracking, usage trends, and team context.
 */

import { SchemaCollection, SchemaAttribute, SchemaIndex } from '../../../schema/schema';

// Data source enumeration
export type DataSource = 
  | 'team_notes'          // Official team depth charts/notes
  | 'vendor_espn'         // ESPN API data
  | 'vendor_247'          // 247Sports data
  | 'vendor_on3'          // On3 data  
  | 'stats_inference'     // Inferred from player_stats
  | 'manual_override'     // Manual admin entry
  | 'cfbd_api'           // College Football Data API
  | 'unknown';

// Injury status enumeration  
export type InjuryStatus = 'OUT' | 'QUESTIONABLE' | 'ACTIVE';

// Provenance tracking interface
export interface ProvenanceRecord {
  field_name: string;
  value: any;
  source: DataSource;
  timestamp: string;
  confidence: number;        // 0.0-1.0
  replaced_value?: any;
  replacement_reason: string;
}

// Manual override interface
export interface ManualOverride {
  field_name: string;
  override_value: any;
  admin_user_id: string;
  timestamp: string;
  reason: string;
  expires_at?: string;      // Optional expiration
}

/**
 * EXTENDED SCHEMA COLLECTIONS
 */

// Player Depth Charts - Current state per player/week
export const PLAYER_DEPTH_CHARTS: SchemaCollection = {
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
};

// Team Context - Game environment and tendencies
export const TEAM_CONTEXT: SchemaCollection = {
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
};

// Ingestion Log - Track all data pipeline runs
export const INGESTION_LOG: SchemaCollection = {
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
};

// Manual Overrides - Admin intervention tracking
export const MANUAL_OVERRIDES: SchemaCollection = {
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
};

// Data Source Registry - Track external data sources
export const DATA_SOURCE_REGISTRY: SchemaCollection = {
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
};

/**
 * EXTENDED SCHEMA COLLECTION MAP
 */
export const DATA_INGESTION_SCHEMA = {
  player_depth_charts: PLAYER_DEPTH_CHARTS,
  team_context: TEAM_CONTEXT,
  ingestion_log: INGESTION_LOG,
  manual_overrides: MANUAL_OVERRIDES,
  data_source_registry: DATA_SOURCE_REGISTRY
};

// Export merged schema for use with existing collections
export const EXTENDED_SCHEMA = {
  // Include existing schema collections here if needed
  ...DATA_INGESTION_SCHEMA
};

/**
 * VALIDATION HELPERS
 */
export function validateInjuryStatus(status: string): status is InjuryStatus {
  return ['OUT', 'QUESTIONABLE', 'ACTIVE'].includes(status);
}

export function validateDataSource(source: string): source is DataSource {
  return ['team_notes', 'vendor_espn', 'vendor_247', 'vendor_on3', 'stats_inference', 'manual_override', 'cfbd_api', 'unknown'].includes(source);
}

export function validateConfidenceScore(confidence: number): boolean {
  return confidence >= 0.0 && confidence <= 1.0;
}

export function validatePercentage(value: number): boolean {
  return value >= 0.0 && value <= 1.0;
}

export function validateDepthRank(rank: number): boolean {
  return rank >= 1 && rank <= 10; // Allow up to 10 deep for special packages
}

/**
 * TYPE EXPORTS FOR FRONTEND/API USAGE
 */
export type PlayerDepthChart = {
  $id: string;
  player_id: string;
  team_id: string;
  position: string;
  season: number;
  week: number;
  depth_chart_rank: number;
  starter_prob: number;
  injury_status: InjuryStatus;
  usage_4w_snap_pct: number;
  // ... all other fields from schema
};

export type TeamContext = {
  $id: string;
  team_id: string;
  season: number;
  week: number;
  estimated_plays_per_game: number;
  run_rate: number;
  pass_rate: number;
  // ... all other fields from schema
};

export type IngestionRun = {
  $id: string;
  run_id: string;
  season: number;
  week: number;
  adapter: string;
  source: DataSource;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  // ... all other fields from schema
};