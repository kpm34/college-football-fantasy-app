/**
 * Conflict Resolver
 * 
 * Handles intelligent conflict resolution when multiple sources provide
 * different data for the same player/week combination. Uses source
 * priority, recency weighting, and confidence scores to determine
 * the most reliable value for each field.
 */

import { NormalizedRecord } from '../normalizer/data-normalizer';
import { DataSource, ProvenanceRecord, ManualOverride } from '../schemas/database-schema';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite-server';
import { Query } from 'node-appwrite';

export interface ConflictResolution {
  field_name: string;
  final_value: any;
  winning_source: DataSource;
  confidence: number;
  conflict_count: number;
  alternative_values: Array<{
    value: any;
    source: DataSource;
    confidence: number;
    reason_rejected: string;
  }>;
  resolution_reasoning: string;
}

export interface ResolvedRecord extends Omit<NormalizedRecord, 'normalization_warnings'> {
  resolution_log: ConflictResolution[];
  manual_overrides_applied: string[];
  final_confidence: number;
  sources_merged: DataSource[];
}

export interface ResolutionResult {
  resolved_records: ResolvedRecord[];
  conflict_stats: {
    total_conflicts: number;
    resolved_conflicts: number;
    manual_overrides_applied: number;
    avg_confidence: number;
  };
  diff_log: DiffLogEntry[];
}

export interface DiffLogEntry {
  player_id: string;
  field_name: string;
  change_type: 'created' | 'updated' | 'no_change';
  old_value?: any;
  new_value: any;
  source: DataSource;
  confidence: number;
  timestamp: string;
  reasoning: string;
}

export class ConflictResolver {
  // Source priority ordering (higher number = higher priority)
  private readonly SOURCE_PRIORITIES: Record<DataSource, number> = {
    'manual_override': 100,    // Manual overrides always win
    'team_notes': 90,          // Official team sources
    'vendor_espn': 80,         // Licensed vendor feeds
    'vendor_247': 75,
    'vendor_on3': 75,
    'cfbd_api': 70,            // API data feeds
    'stats_inference': 60,     // Statistical inference
    'unknown': 30              // Unknown/fallback sources
  };

  // Field-specific resolution strategies
  private readonly FIELD_STRATEGIES: Record<string, 'priority' | 'confidence' | 'recency' | 'manual_only'> = {
    // Depth chart fields - prefer official sources
    'depth_chart_rank': 'priority',
    'starter_prob': 'priority',
    'snap_share_proj': 'confidence',
    
    // Injury fields - prefer recent official sources
    'injury_status': 'priority',
    'injury_note': 'priority', 
    'injury_as_of': 'recency',
    
    // Usage trends - prefer statistical confidence
    'usage_1w_snap_pct': 'confidence',
    'usage_4w_snap_pct': 'confidence',
    'usage_1w_route_pct': 'confidence',
    'usage_4w_route_pct': 'confidence',
    'usage_1w_carry_share': 'confidence',
    'usage_4w_carry_share': 'confidence',
    'usage_1w_target_share': 'confidence',
    'usage_4w_target_share': 'confidence',
    
    // Prior season data - prefer comprehensive sources
    'prior_season_target_share': 'confidence',
    'prior_season_carry_share': 'confidence',
    'prior_season_yards_share': 'confidence',
    'prior_season_td_share': 'confidence'
  };

  private previousWeekData: Map<string, ResolvedRecord> = new Map();
  private manualOverrides: Map<string, ManualOverride[]> = new Map();

  /**
   * Initialize resolver with previous week data and manual overrides
   */
  async initialize(season: number, week: number): Promise<void> {
    console.log(`[ConflictResolver] Initializing for ${season}W${week}...`);
    
    // Load previous week data for diff generation
    await this.loadPreviousWeekData(season, week);
    
    // Load active manual overrides
    await this.loadManualOverrides(season, week);
    
    console.log(`[ConflictResolver] Loaded ${this.previousWeekData.size} previous records, ${this.manualOverrides.size} overrides`);
  }

  /**
   * Resolve conflicts among normalized records
   */
  async resolve(normalizedRecords: NormalizedRecord[]): Promise<ResolutionResult> {
    console.log(`[ConflictResolver] Resolving conflicts in ${normalizedRecords.length} records...`);
    
    const startTime = Date.now();
    const resolvedRecords: ResolvedRecord[] = [];
    const diffLog: DiffLogEntry[] = [];
    let totalConflicts = 0;
    let resolvedConflicts = 0;
    let manualOverridesApplied = 0;

    // Group records by player+week for conflict detection
    const playerGroups = this.groupRecordsByPlayer(normalizedRecords);

    for (const [playerKey, records] of playerGroups.entries()) {
      try {
        const resolution = await this.resolvePlayerGroup(playerKey, records);
        resolvedRecords.push(resolution.record);
        
        // Track statistics
        totalConflicts += resolution.conflicts;
        resolvedConflicts += resolution.conflicts;
        manualOverridesApplied += resolution.overrides;
        
        // Generate diff entries
        const diffs = this.generateDiffEntries(playerKey, resolution.record);
        diffLog.push(...diffs);
        
      } catch (error) {
        console.error(`[ConflictResolver] Failed to resolve ${playerKey}:`, error);
      }
    }

    const avgConfidence = resolvedRecords.length > 0 
      ? resolvedRecords.reduce((sum, r) => sum + r.final_confidence, 0) / resolvedRecords.length
      : 0;

    const duration = Date.now() - startTime;
    console.log(`[ConflictResolver] Resolved ${resolvedRecords.length} records in ${duration}ms`);

    return {
      resolved_records: resolvedRecords,
      conflict_stats: {
        total_conflicts: totalConflicts,
        resolved_conflicts: resolvedConflicts,
        manual_overrides_applied: manualOverridesApplied,
        avg_confidence: avgConfidence
      },
      diff_log: diffLog
    };
  }

  private groupRecordsByPlayer(records: NormalizedRecord[]): Map<string, NormalizedRecord[]> {
    const groups = new Map<string, NormalizedRecord[]>();

    for (const record of records) {
      const key = `${record.player_id}_${record.season}_${record.week}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key)!.push(record);
    }

    return groups;
  }

  private async resolvePlayerGroup(
    playerKey: string,
    records: NormalizedRecord[]
  ): Promise<{
    record: ResolvedRecord;
    conflicts: number;
    overrides: number;
  }> {
    if (records.length === 1) {
      // No conflicts - single source
      const singleRecord = records[0];
      const overrides = await this.applyManualOverrides(singleRecord);
      
      return {
        record: {
          ...singleRecord,
          resolution_log: [],
          manual_overrides_applied: overrides.map(o => o.field_name),
          final_confidence: singleRecord.confidence,
          sources_merged: [singleRecord.source]
        },
        conflicts: 0,
        overrides: overrides.length
      };
    }

    // Multiple sources - resolve conflicts
    console.log(`[ConflictResolver] Resolving ${records.length} sources for ${playerKey}`);
    
    const resolutions: ConflictResolution[] = [];
    const sourcesUsed = new Set<DataSource>();
    let totalConflicts = 0;

    // Get the template record (highest priority source)
    const primaryRecord = this.selectPrimaryRecord(records);
    sourcesUsed.add(primaryRecord.source);

    // Resolve each field individually
    const resolvableFields = this.getResolvableFields(records[0]);
    
    for (const fieldName of resolvableFields) {
      const fieldValues = this.extractFieldValues(records, fieldName);
      
      if (fieldValues.length > 1) {
        const resolution = this.resolveFieldConflict(fieldName, fieldValues);
        resolutions.push(resolution);
        totalConflicts++;
        
        // Update the record with resolved value
        this.setFieldValue(primaryRecord, fieldName, resolution.final_value);
        sourcesUsed.add(resolution.winning_source);
      }
    }

    // Apply manual overrides
    const overrides = await this.applyManualOverrides(primaryRecord);
    
    // Calculate final confidence
    const finalConfidence = this.calculateFinalConfidence(records, resolutions);

    const resolvedRecord: ResolvedRecord = {
      ...primaryRecord,
      resolution_log: resolutions,
      manual_overrides_applied: overrides.map(o => o.field_name),
      final_confidence: finalConfidence,
      sources_merged: Array.from(sourcesUsed)
    };

    return {
      record: resolvedRecord,
      conflicts: totalConflicts,
      overrides: overrides.length
    };
  }

  private selectPrimaryRecord(records: NormalizedRecord[]): NormalizedRecord {
    // Select record from highest priority source
    return records.reduce((best, current) => {
      const bestPriority = this.SOURCE_PRIORITIES[best.source] || 0;
      const currentPriority = this.SOURCE_PRIORITIES[current.source] || 0;
      
      if (currentPriority > bestPriority) {
        return current;
      } else if (currentPriority === bestPriority && current.confidence > best.confidence) {
        return current;
      }
      
      return best;
    });
  }

  private getResolvableFields(record: NormalizedRecord): string[] {
    return [
      'depth_chart_rank',
      'starter_prob',
      'snap_share_proj',
      'injury_status',
      'injury_note',
      'injury_as_of',
      'usage_1w_snap_pct',
      'usage_4w_snap_pct',
      'usage_1w_route_pct',
      'usage_4w_route_pct',
      'usage_1w_carry_share',
      'usage_4w_carry_share',
      'usage_1w_target_share',
      'usage_4w_target_share',
      'prior_season_target_share',
      'prior_season_carry_share',
      'prior_season_yards_share',
      'prior_season_td_share'
    ];
  }

  private extractFieldValues(
    records: NormalizedRecord[],
    fieldName: string
  ): Array<{
    value: any;
    source: DataSource;
    confidence: number;
    record: NormalizedRecord;
  }> {
    const values: Array<{
      value: any;
      source: DataSource;
      confidence: number;
      record: NormalizedRecord;
    }> = [];

    for (const record of records) {
      const value = this.getFieldValue(record, fieldName);
      
      if (value != null) {
        values.push({
          value,
          source: record.source,
          confidence: record.confidence,
          record
        });
      }
    }

    // Remove duplicates with same value
    const uniqueValues = values.filter((v, index, arr) => 
      arr.findIndex(other => this.valuesEqual(v.value, other.value)) === index
    );

    return uniqueValues;
  }

  private resolveFieldConflict(
    fieldName: string,
    fieldValues: Array<{
      value: any;
      source: DataSource;
      confidence: number;
      record: NormalizedRecord;
    }>
  ): ConflictResolution {
    const strategy = this.FIELD_STRATEGIES[fieldName] || 'priority';
    
    let winningValue = fieldValues[0];
    const alternatives: ConflictResolution['alternative_values'] = [];

    switch (strategy) {
      case 'priority':
        winningValue = this.resolveBySourcPriority(fieldValues);
        break;
      
      case 'confidence':
        winningValue = this.resolveByConfidence(fieldValues);
        break;
      
      case 'recency':
        winningValue = this.resolveByRecency(fieldValues);
        break;
      
      case 'manual_only':
        winningValue = this.resolveManualOnly(fieldValues);
        break;
    }

    // Build alternatives list
    for (const value of fieldValues) {
      if (value !== winningValue) {
        alternatives.push({
          value: value.value,
          source: value.source,
          confidence: value.confidence,
          reason_rejected: this.generateRejectionReason(strategy, value, winningValue)
        });
      }
    }

    return {
      field_name: fieldName,
      final_value: winningValue.value,
      winning_source: winningValue.source,
      confidence: winningValue.confidence,
      conflict_count: fieldValues.length,
      alternative_values: alternatives,
      resolution_reasoning: this.generateResolutionReasoning(strategy, winningValue, fieldValues)
    };
  }

  private resolveBySourcPriority(values: Array<{value: any; source: DataSource; confidence: number}>): any {
    return values.reduce((best, current) => {
      const bestPriority = this.SOURCE_PRIORITIES[best.source] || 0;
      const currentPriority = this.SOURCE_PRIORITIES[current.source] || 0;
      
      return currentPriority > bestPriority ? current : best;
    });
  }

  private resolveByConfidence(values: Array<{value: any; source: DataSource; confidence: number}>): any {
    return values.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private resolveByRecency(values: Array<{value: any; source: DataSource; confidence: number; record: NormalizedRecord}>): any {
    return values.reduce((best, current) => {
      const bestTime = new Date(best.record.as_of).getTime();
      const currentTime = new Date(current.record.as_of).getTime();
      
      return currentTime > bestTime ? current : best;
    });
  }

  private resolveManualOnly(values: Array<{value: any; source: DataSource; confidence: number}>): any {
    const manualValue = values.find(v => v.source === 'manual_override');
    return manualValue || values[0]; // Fallback to first if no manual override
  }

  private async applyManualOverrides(record: NormalizedRecord): Promise<ManualOverride[]> {
    const playerOverrides = this.manualOverrides.get(record.player_id) || [];
    const appliedOverrides: ManualOverride[] = [];

    for (const override of playerOverrides) {
      if (this.isOverrideActive(override) && 
          (override.week === 0 || override.week === record.week)) {
        
        const overrideValue = this.parseOverrideValue(override.override_value);
        this.setFieldValue(record, override.field_name, overrideValue);
        
        appliedOverrides.push(override);
        
        console.log(`[ConflictResolver] Applied override for ${record.player_id}.${override.field_name}: ${overrideValue}`);
      }
    }

    return appliedOverrides;
  }

  private calculateFinalConfidence(
    records: NormalizedRecord[],
    resolutions: ConflictResolution[]
  ): number {
    if (resolutions.length === 0) {
      // No conflicts - use original confidence
      return Math.max(...records.map(r => r.confidence));
    }

    // Average confidence of winning resolutions
    const avgResolutionConfidence = resolutions.reduce((sum, r) => sum + r.confidence, 0) / resolutions.length;
    
    // Factor in source diversity (more sources = potentially more reliable)
    const sourceCount = new Set(records.map(r => r.source)).size;
    const diversityBoost = Math.min(0.1, (sourceCount - 1) * 0.02);
    
    return Math.min(1.0, avgResolutionConfidence + diversityBoost);
  }

  private generateDiffEntries(playerKey: string, currentRecord: ResolvedRecord): DiffLogEntry[] {
    const [playerId] = playerKey.split('_');
    const previousRecord = this.previousWeekData.get(playerId);
    const diffEntries: DiffLogEntry[] = [];

    if (!previousRecord) {
      // New player record
      diffEntries.push({
        player_id: playerId,
        field_name: '_record',
        change_type: 'created',
        new_value: currentRecord.depth_chart_rank,
        source: currentRecord.source,
        confidence: currentRecord.final_confidence,
        timestamp: new Date().toISOString(),
        reasoning: 'New player record created'
      });
      return diffEntries;
    }

    // Check each field for changes
    const fieldsToCheck = this.getResolvableFields(currentRecord);
    
    for (const fieldName of fieldsToCheck) {
      const oldValue = this.getFieldValue(previousRecord, fieldName);
      const newValue = this.getFieldValue(currentRecord, fieldName);

      if (!this.valuesEqual(oldValue, newValue)) {
        diffEntries.push({
          player_id: playerId,
          field_name: fieldName,
          change_type: 'updated',
          old_value: oldValue,
          new_value: newValue,
          source: currentRecord.source,
          confidence: currentRecord.final_confidence,
          timestamp: new Date().toISOString(),
          reasoning: this.generateChangeReasoning(fieldName, oldValue, newValue)
        });
      }
    }

    return diffEntries;
  }

  private async loadPreviousWeekData(season: number, week: number): Promise<void> {
    if (week <= 1) {
      return; // No previous week for week 1
    }

    try {
      const previousWeek = week - 1;
      const queries = [
        Query.equal('season', season),
        Query.equal('week', previousWeek),
        Query.limit(5000)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        'player_depth_charts',
        queries
      );

      for (const doc of response.documents) {
        this.previousWeekData.set(doc.player_id, doc as any);
      }

    } catch (error) {
      console.warn('[ConflictResolver] Failed to load previous week data:', error);
    }
  }

  private async loadManualOverrides(season: number, week: number): Promise<void> {
    try {
      const queries = [
        Query.equal('season', season),
        Query.equal('is_active', true),
        Query.lessThanEqual('effective_from', new Date().toISOString()),
        Query.limit(1000)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        'manual_overrides',
        queries
      );

      for (const doc of response.documents) {
        const override = doc as any;
        const playerId = override.player_id;
        
        if (!this.manualOverrides.has(playerId)) {
          this.manualOverrides.set(playerId, []);
        }
        
        this.manualOverrides.get(playerId)!.push(override);
      }

    } catch (error) {
      console.warn('[ConflictResolver] Failed to load manual overrides:', error);
    }
  }

  private getFieldValue(record: any, fieldName: string): any {
    return record[fieldName];
  }

  private setFieldValue(record: any, fieldName: string, value: any): void {
    record[fieldName] = value;
  }

  private valuesEqual(value1: any, value2: any): boolean {
    if (value1 === value2) return true;
    if (value1 == null || value2 == null) return value1 === value2;
    
    // Handle numeric comparisons with small tolerance
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return Math.abs(value1 - value2) < 0.001;
    }
    
    return String(value1) === String(value2);
  }

  private isOverrideActive(override: ManualOverride): boolean {
    const now = new Date();
    const effectiveFrom = new Date(override.effective_from);
    const expiresAt = override.expires_at ? new Date(override.expires_at) : null;
    
    return now >= effectiveFrom && (!expiresAt || now <= expiresAt);
  }

  private parseOverrideValue(valueString: string): any {
    try {
      return JSON.parse(valueString);
    } catch {
      return valueString; // Return as string if not JSON
    }
  }

  private generateRejectionReason(strategy: string, rejected: any, winner: any): string {
    switch (strategy) {
      case 'priority':
        return `Lower source priority (${rejected.source} < ${winner.source})`;
      case 'confidence':
        return `Lower confidence (${rejected.confidence} < ${winner.confidence})`;
      case 'recency':
        return `Older data`;
      case 'manual_only':
        return `Not a manual override`;
      default:
        return `Did not win ${strategy} resolution`;
    }
  }

  private generateResolutionReasoning(strategy: string, winner: any, allValues: any[]): string {
    switch (strategy) {
      case 'priority':
        return `Won by source priority: ${winner.source}`;
      case 'confidence':
        return `Won by confidence: ${winner.confidence.toFixed(2)}`;
      case 'recency':
        return `Won by recency`;
      case 'manual_only':
        return `Manual override applied`;
      default:
        return `Resolved by ${strategy}`;
    }
  }

  private generateChangeReasoning(fieldName: string, oldValue: any, newValue: any): string {
    if (fieldName.includes('injury')) {
      return `Injury status changed from ${oldValue} to ${newValue}`;
    } else if (fieldName.includes('depth_chart_rank')) {
      return `Depth chart position changed from ${oldValue} to ${newValue}`;
    } else if (fieldName.includes('usage')) {
      return `Usage trend updated`;
    }
    
    return `${fieldName} changed from ${oldValue} to ${newValue}`;
  }
}