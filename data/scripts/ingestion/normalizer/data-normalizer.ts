/**
 * Data Normalizer
 * 
 * Orchestrates the normalization of raw ingestion data:
 * - Player ID canonicalization via fuzzy matching
 * - Position standardization
 * - Team code mapping
 * - Data validation and cleaning
 * - Deduplication across sources
 */

import { PlayerIdMapper, PlayerMatch } from './player-id-mapper';
import { TeamNotesRecord } from '../adapters/team-notes-adapter';
import { StatsInferenceRecord } from '../adapters/stats-inference-adapter';
import { DataSource, InjuryStatus } from '../schemas/database-schema';

export interface NormalizedRecord {
  // Canonical identifiers
  player_id: string;           // Mapped college_players.$id
  team_id: string;            // Standardized team identifier
  position: string;           // Standardized position
  season: number;
  week: number;

  // Depth chart data
  depth_chart_rank: number;
  starter_prob: number;
  snap_share_proj: number;

  // Injury data
  injury_status: InjuryStatus;
  injury_note?: string;
  injury_as_of: string;
  injury_source: DataSource;

  // Usage trends
  usage_1w_snap_pct: number;
  usage_4w_snap_pct: number;
  usage_1w_route_pct: number;
  usage_4w_route_pct: number;
  usage_1w_carry_share: number;
  usage_4w_carry_share: number;
  usage_1w_target_share: number;
  usage_4w_target_share: number;

  // Prior season data
  prior_season_target_share: number;
  prior_season_carry_share: number;
  prior_season_yards_share: number;
  prior_season_td_share: number;

  // Metadata
  source: DataSource;
  confidence: number;
  as_of: string;
  normalization_warnings: string[];
  player_match_info?: PlayerMatch;
  raw_data_hash: string;      // For deduplication
}

export interface NormalizationResult {
  success: boolean;
  normalized_records: NormalizedRecord[];
  validation_errors: ValidationError[];
  mapping_stats: {
    total_records: number;
    successfully_mapped: number;
    mapping_failures: number;
    duplicate_records: number;
    avg_confidence: number;
  };
}

export interface ValidationError {
  record_index: number;
  field: string;
  error_type: 'missing_required' | 'invalid_value' | 'mapping_failed' | 'duplicate';
  message: string;
  severity: 'error' | 'warning';
}

type RawRecord = TeamNotesRecord | StatsInferenceRecord | any;

export class DataNormalizer {
  private playerIdMapper: PlayerIdMapper;
  private deduplicationCache: Map<string, NormalizedRecord> = new Map();
  
  // Team ID mappings for consistency
  private readonly TEAM_ID_MAPPINGS: Record<string, string> = {
    'alabama': 'alabama',
    'crimson tide': 'alabama',
    'georgia': 'georgia',
    'bulldogs': 'georgia',
    'lsu': 'lsu',
    'tigers': 'lsu',
    'florida': 'florida',
    'gators': 'florida',
    'miami': 'miami',
    'hurricanes': 'miami',
    'miami (fl)': 'miami',
    'clemson': 'clemson',
    'florida state': 'florida-state',
    'fsu': 'florida-state',
    'seminoles': 'florida-state',
    'north carolina': 'north-carolina',
    'unc': 'north-carolina',
    'tar heels': 'north-carolina',
    'michigan': 'michigan',
    'wolverines': 'michigan',
    'ohio state': 'ohio-state',
    'buckeyes': 'ohio-state',
    'penn state': 'penn-state',
    'nittany lions': 'penn-state',
    'wisconsin': 'wisconsin',
    'badgers': 'wisconsin',
    'texas': 'texas',
    'longhorns': 'texas',
    'oklahoma': 'oklahoma',
    'sooners': 'oklahoma',
    'baylor': 'baylor',
    'bears': 'baylor',
    'tcu': 'tcu',
    'horned frogs': 'tcu'
  };

  constructor() {
    this.playerIdMapper = new PlayerIdMapper();
  }

  /**
   * Initialize the normalizer
   */
  async initialize(): Promise<void> {
    console.log('[DataNormalizer] Initializing...');
    await this.playerIdMapper.initialize();
    console.log('[DataNormalizer] Ready for normalization');
  }

  /**
   * Normalize a batch of raw records
   */
  async normalize(
    rawRecords: RawRecord[],
    season: number,
    week: number
  ): Promise<NormalizationResult> {
    console.log(`[DataNormalizer] Normalizing ${rawRecords.length} records for ${season}W${week}`);
    
    const startTime = Date.now();
    const normalizedRecords: NormalizedRecord[] = [];
    const validationErrors: ValidationError[] = [];
    let mappingFailures = 0;
    let duplicates = 0;

    // Clear deduplication cache for this run
    this.deduplicationCache.clear();

    for (let i = 0; i < rawRecords.length; i++) {
      try {
        const normalized = await this.normalizeRecord(rawRecords[i], season, week, i);
        
        if (normalized) {
          // Check for duplicates
          const hash = normalized.raw_data_hash;
          const existing = this.deduplicationCache.get(hash);
          
          if (existing) {
            duplicates++;
            // Merge with existing record (prefer higher confidence)
            if (normalized.confidence > existing.confidence) {
              this.deduplicationCache.set(hash, normalized);
              // Replace in results array
              const existingIndex = normalizedRecords.findIndex(r => r.raw_data_hash === hash);
              if (existingIndex >= 0) {
                normalizedRecords[existingIndex] = normalized;
              }
            }
          } else {
            this.deduplicationCache.set(hash, normalized);
            normalizedRecords.push(normalized);
          }
        } else {
          mappingFailures++;
        }
        
      } catch (error) {
        validationErrors.push({
          record_index: i,
          field: 'record',
          error_type: 'mapping_failed',
          message: `Normalization failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error'
        });
      }
    }

    const duration = Date.now() - startTime;
    const avgConfidence = normalizedRecords.length > 0 
      ? normalizedRecords.reduce((sum, r) => sum + r.confidence, 0) / normalizedRecords.length
      : 0;

    console.log(`[DataNormalizer] Completed in ${duration}ms: ${normalizedRecords.length}/${rawRecords.length} normalized`);

    return {
      success: validationErrors.filter(e => e.severity === 'error').length === 0,
      normalized_records: normalizedRecords,
      validation_errors: validationErrors,
      mapping_stats: {
        total_records: rawRecords.length,
        successfully_mapped: normalizedRecords.length,
        mapping_failures: mappingFailures,
        duplicate_records: duplicates,
        avg_confidence: avgConfidence
      }
    };
  }

  /**
   * Normalize a single record
   */
  private async normalizeRecord(
    rawRecord: RawRecord,
    season: number,
    week: number,
    index: number
  ): Promise<NormalizedRecord | null> {
    const warnings: string[] = [];
    
    try {
      // Extract player identification info
      const rawName = this.extractPlayerName(rawRecord);
      const rawTeam = this.extractTeam(rawRecord);
      const rawPosition = this.extractPosition(rawRecord);
      const rawJersey = this.extractJersey(rawRecord);

      if (!rawName || !rawTeam || !rawPosition) {
        throw new Error(`Missing required player identification: name=${rawName}, team=${rawTeam}, position=${rawPosition}`);
      }

      // Map player to canonical ID
      const playerMatch = await this.playerIdMapper.mapPlayer(rawName, rawTeam, rawPosition, rawJersey);
      
      if (!playerMatch || playerMatch.confidence < 0.5) {
        console.warn(`[DataNormalizer] Failed to map player: ${rawName} (${rawTeam}, ${rawPosition})`);
        return null;
      }

      if (playerMatch.confidence < 0.8) {
        warnings.push(`Low confidence player mapping: ${playerMatch.confidence.toFixed(2)}`);
      }

      // Normalize team ID
      const teamId = this.normalizeTeamId(rawTeam);
      
      // Extract and normalize all data fields
      const normalizedRecord: NormalizedRecord = {
        // Canonical identifiers
        player_id: playerMatch.college_player_id,
        team_id: teamId,
        position: this.normalizePosition(rawPosition),
        season,
        week,

        // Depth chart data
        depth_chart_rank: this.extractNumeric(rawRecord, 'depth_chart_rank', 'depth_rank', 1),
        starter_prob: this.extractNumeric(rawRecord, 'starter_prob', 'starter_probability', 0.5),
        snap_share_proj: this.extractNumeric(rawRecord, 'snap_share_proj', 'projected_snap_share', 0),

        // Injury data
        injury_status: this.extractInjuryStatus(rawRecord),
        injury_note: this.extractString(rawRecord, 'injury_note'),
        injury_as_of: this.extractTimestamp(rawRecord, 'injury_as_of') || new Date().toISOString(),
        injury_source: this.extractDataSource(rawRecord, 'injury_source'),

        // Usage trends
        usage_1w_snap_pct: this.extractNumeric(rawRecord, 'usage_1w_snap_pct', 0),
        usage_4w_snap_pct: this.extractNumeric(rawRecord, 'usage_4w_snap_pct', 0),
        usage_1w_route_pct: this.extractNumeric(rawRecord, 'usage_1w_route_pct', 0),
        usage_4w_route_pct: this.extractNumeric(rawRecord, 'usage_4w_route_pct', 0),
        usage_1w_carry_share: this.extractNumeric(rawRecord, 'usage_1w_carry_share', 0),
        usage_4w_carry_share: this.extractNumeric(rawRecord, 'usage_4w_carry_share', 0),
        usage_1w_target_share: this.extractNumeric(rawRecord, 'usage_1w_target_share', 0),
        usage_4w_target_share: this.extractNumeric(rawRecord, 'usage_4w_target_share', 0),

        // Prior season data
        prior_season_target_share: this.extractNumeric(rawRecord, 'prior_season_target_share', 0),
        prior_season_carry_share: this.extractNumeric(rawRecord, 'prior_season_carry_share', 0),
        prior_season_yards_share: this.extractNumeric(rawRecord, 'prior_season_yards_share', 0),
        prior_season_td_share: this.extractNumeric(rawRecord, 'prior_season_td_share', 0),

        // Metadata
        source: this.extractDataSource(rawRecord, 'source'),
        confidence: this.extractNumeric(rawRecord, 'confidence', 'parse_confidence', 'statistical_confidence', 0.5),
        as_of: this.extractTimestamp(rawRecord, 'as_of') || new Date().toISOString(),
        normalization_warnings: warnings,
        player_match_info: playerMatch,
        raw_data_hash: this.generateDataHash(rawRecord, playerMatch.college_player_id, season, week)
      };

      // Final validation
      const validationErrors = this.validateNormalizedRecord(normalizedRecord);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(e => e.message).join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      return normalizedRecord;

    } catch (error) {
      console.warn(`[DataNormalizer] Failed to normalize record ${index}:`, error);
      return null;
    }
  }

  private extractPlayerName(record: any): string {
    return this.cleanString(
      record.player_name || 
      record.playerName || 
      record.name || 
      ''
    );
  }

  private extractTeam(record: any): string {
    return this.cleanString(
      record.team_id || 
      record.team || 
      record.teamName || 
      ''
    );
  }

  private extractPosition(record: any): string {
    return this.cleanString(
      record.position || 
      record.pos || 
      ''
    );
  }

  private extractJersey(record: any): string | undefined {
    const jersey = record.jersey || record.jerseyNumber || record.number;
    return jersey ? String(jersey) : undefined;
  }

  private extractNumeric(record: any, ...fieldNames: (string | number)[]): number {
    for (const fieldName of fieldNames) {
      if (typeof fieldName === 'number') {
        return fieldName; // Default value
      }
      
      const value = record[fieldName];
      if (value != null) {
        const parsed = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
    
    return 0; // Final fallback
  }

  private extractString(record: any, ...fieldNames: string[]): string | undefined {
    for (const fieldName of fieldNames) {
      const value = record[fieldName];
      if (value != null && String(value).trim().length > 0) {
        return this.cleanString(String(value));
      }
    }
    return undefined;
  }

  private extractInjuryStatus(record: any): InjuryStatus {
    const status = record.injury_status || record.status || 'ACTIVE';
    const normalized = String(status).toUpperCase();
    
    if (['OUT', 'QUESTIONABLE', 'ACTIVE'].includes(normalized)) {
      return normalized as InjuryStatus;
    }
    
    // Map common variations
    switch (normalized) {
      case 'PROBABLE':
      case 'HEALTHY':
      case 'AVAILABLE':
        return 'ACTIVE';
      case 'DOUBTFUL':
        return 'QUESTIONABLE';
      case 'INJURED':
      case 'SIDELINED':
        return 'OUT';
      default:
        return 'ACTIVE';
    }
  }

  private extractDataSource(record: any, ...fieldNames: string[]): DataSource {
    for (const fieldName of fieldNames) {
      const value = record[fieldName];
      if (value && typeof value === 'string') {
        // Validate against known data sources
        const validSources: DataSource[] = [
          'team_notes', 'vendor_espn', 'vendor_247', 'vendor_on3',
          'stats_inference', 'manual_override', 'cfbd_api', 'unknown'
        ];
        
        if (validSources.includes(value as DataSource)) {
          return value as DataSource;
        }
      }
    }
    
    return 'unknown';
  }

  private extractTimestamp(record: any, ...fieldNames: string[]): string | null {
    for (const fieldName of fieldNames) {
      const value = record[fieldName];
      if (value) {
        try {
          return new Date(value).toISOString();
        } catch {
          // Continue to next field
        }
      }
    }
    return null;
  }

  private normalizeTeamId(rawTeam: string): string {
    const normalized = rawTeam.toLowerCase().trim();
    return this.TEAM_ID_MAPPINGS[normalized] || normalized.replace(/\s+/g, '-');
  }

  private normalizePosition(position: string): string {
    const positionMap: Record<string, string> = {
      'qb': 'QB',
      'quarterback': 'QB',
      'rb': 'RB',
      'runningback': 'RB',
      'running back': 'RB',
      'hb': 'RB',
      'halfback': 'RB',
      'wr': 'WR',
      'wide receiver': 'WR',
      'receiver': 'WR',
      'te': 'TE',
      'tight end': 'TE',
      'k': 'K',
      'kicker': 'K',
      'pk': 'K'
    };

    const normalized = position.toLowerCase().trim();
    return positionMap[normalized] || position.toUpperCase();
  }

  private cleanString(value: string): string {
    return value
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  private generateDataHash(record: any, playerId: string, season: number, week: number): string {
    // Create a hash of the core data for deduplication
    const coreData = {
      player_id: playerId,
      season,
      week,
      depth_rank: record.depth_chart_rank || record.depth_rank || 1,
      injury_status: record.injury_status || 'ACTIVE',
      source: record.source || 'unknown'
    };
    
    // Simple hash function (in production, use crypto.createHash)
    const dataString = JSON.stringify(coreData);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private validateNormalizedRecord(record: NormalizedRecord): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!record.player_id) {
      errors.push({
        record_index: -1,
        field: 'player_id',
        error_type: 'missing_required',
        message: 'Player ID is required',
        severity: 'error'
      });
    }

    if (!record.team_id) {
      errors.push({
        record_index: -1,
        field: 'team_id',
        error_type: 'missing_required',
        message: 'Team ID is required',
        severity: 'error'
      });
    }

    if (!record.position) {
      errors.push({
        record_index: -1,
        field: 'position',
        error_type: 'missing_required',
        message: 'Position is required',
        severity: 'error'
      });
    }

    // Value validations
    if (record.depth_chart_rank < 1 || record.depth_chart_rank > 10) {
      errors.push({
        record_index: -1,
        field: 'depth_chart_rank',
        error_type: 'invalid_value',
        message: `Invalid depth chart rank: ${record.depth_chart_rank}`,
        severity: 'error'
      });
    }

    if (record.starter_prob < 0 || record.starter_prob > 1) {
      errors.push({
        record_index: -1,
        field: 'starter_prob',
        error_type: 'invalid_value',
        message: `Invalid starter probability: ${record.starter_prob}`,
        severity: 'error'
      });
    }

    // Confidence threshold
    if (record.confidence < 0.3) {
      errors.push({
        record_index: -1,
        field: 'confidence',
        error_type: 'invalid_value',
        message: `Low confidence score: ${record.confidence}`,
        severity: 'warning'
      });
    }

    return errors;
  }

  /**
   * Get normalization statistics
   */
  async getStats(): Promise<any> {
    const playerMapperStats = this.playerIdMapper.getMappingStats();
    
    return {
      player_mapping: playerMapperStats,
      deduplication: {
        cache_size: this.deduplicationCache.size
      },
      team_mappings: Object.keys(this.TEAM_ID_MAPPINGS).length
    };
  }

  /**
   * Clear caches and reset
   */
  async reset(): Promise<void> {
    this.deduplicationCache.clear();
    await this.playerIdMapper.pruneCache();
    console.log('[DataNormalizer] Reset completed');
  }
}