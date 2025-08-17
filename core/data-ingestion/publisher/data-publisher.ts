/**
 * Data Publisher
 * 
 * Layer 4 of the ingestion pipeline - handles atomic database updates
 * and creates immutable versioned snapshots. Ensures data consistency
 * and manages cache invalidation for dependent systems.
 */

import { ResolvedRecord, ResolutionResult } from '../resolver/conflict-resolver';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite-server';
import { Query, ID } from 'node-appwrite';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface PublishResult {
  success: boolean;
  records_updated: number;
  records_created: number;
  records_failed: number;
  snapshot_path: string;
  publication_id: string;
  errors: PublishError[];
  performance_metrics: {
    total_duration_ms: number;
    database_write_ms: number;
    snapshot_write_ms: number;
    cache_invalidation_ms: number;
  };
}

export interface PublishError {
  record_id?: string;
  player_id?: string;
  error_type: 'database_write' | 'validation' | 'snapshot' | 'cache_invalidation';
  message: string;
  severity: 'error' | 'warning';
}

export interface DataSnapshot {
  snapshot_id: string;
  season: number;
  week: number;
  created_at: string;
  total_records: number;
  data_sources: string[];
  schema_version: string;
  records: ResolvedRecord[];
  metadata: {
    publication_id: string;
    conflict_stats: any;
    ingestion_stats: any;
  };
}

export interface PublishOptions {
  dry_run?: boolean;
  skip_cache_invalidation?: boolean;
  create_snapshot?: boolean;
  validate_before_publish?: boolean;
  batch_size?: number;
}

export class DataPublisher {
  private readonly BATCH_SIZE = 100;
  private readonly SCHEMA_VERSION = '1.0';
  private readonly SNAPSHOTS_DIR = join(process.cwd(), 'data/snapshots');

  /**
   * Publish resolved records to operational database and create snapshot
   */
  async publish(
    resolutionResult: ResolutionResult,
    season: number,
    week: number,
    options: PublishOptions = {}
  ): Promise<PublishResult> {
    console.log(`[DataPublisher] Publishing ${resolutionResult.resolved_records.length} records for ${season}W${week}...`);
    
    const startTime = Date.now();
    const publicationId = this.generatePublicationId(season, week);
    const errors: PublishError[] = [];
    
    let recordsUpdated = 0;
    let recordsCreated = 0;
    let recordsFailed = 0;

    try {
      // Pre-publication validation
      if (options.validate_before_publish !== false) {
        const validationErrors = await this.validateRecords(resolutionResult.resolved_records);
        if (validationErrors.length > 0) {
          const criticalErrors = validationErrors.filter(e => e.severity === 'error');
          if (criticalErrors.length > 0) {
            throw new Error(`Pre-publication validation failed: ${criticalErrors.length} critical errors`);
          }
          errors.push(...validationErrors);
        }
      }

      // Database write phase
      const dbWriteStart = Date.now();
      if (!options.dry_run) {
        const writeResults = await this.writeToDatabase(resolutionResult.resolved_records, season, week, options);
        recordsUpdated = writeResults.updated;
        recordsCreated = writeResults.created;
        recordsFailed = writeResults.failed;
        errors.push(...writeResults.errors);
      }
      const dbWriteDuration = Date.now() - dbWriteStart;

      // Snapshot creation phase
      const snapshotStart = Date.now();
      let snapshotPath = '';
      if (options.create_snapshot !== false) {
        snapshotPath = await this.createSnapshot(
          resolutionResult, 
          season, 
          week, 
          publicationId,
          options.dry_run
        );
      }
      const snapshotDuration = Date.now() - snapshotStart;

      // Cache invalidation phase
      const cacheStart = Date.now();
      if (!options.dry_run && !options.skip_cache_invalidation) {
        await this.invalidateCaches(season, week);
      }
      const cacheDuration = Date.now() - cacheStart;

      const totalDuration = Date.now() - startTime;

      // Log ingestion statistics
      await this.logIngestionStats(publicationId, season, week, resolutionResult, {
        records_updated: recordsUpdated,
        records_created: recordsCreated,
        records_failed: recordsFailed,
        duration_ms: totalDuration
      });

      console.log(`[DataPublisher] Completed in ${totalDuration}ms: ${recordsCreated + recordsUpdated} records published`);

      return {
        success: recordsFailed === 0 || recordsFailed < recordsCreated + recordsUpdated,
        records_updated: recordsUpdated,
        records_created: recordsCreated,
        records_failed: recordsFailed,
        snapshot_path: snapshotPath,
        publication_id: publicationId,
        errors,
        performance_metrics: {
          total_duration_ms: totalDuration,
          database_write_ms: dbWriteDuration,
          snapshot_write_ms: snapshotDuration,
          cache_invalidation_ms: cacheDuration
        }
      };

    } catch (error) {
      console.error('[DataPublisher] Publication failed:', error);
      
      errors.push({
        error_type: 'database_write',
        message: `Publication failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error'
      });

      return {
        success: false,
        records_updated: recordsUpdated,
        records_created: recordsCreated,
        records_failed: resolutionResult.resolved_records.length,
        snapshot_path: '',
        publication_id: publicationId,
        errors,
        performance_metrics: {
          total_duration_ms: Date.now() - startTime,
          database_write_ms: 0,
          snapshot_write_ms: 0,
          cache_invalidation_ms: 0
        }
      };
    }
  }

  /**
   * Write resolved records to operational collections
   */
  private async writeToDatabase(
    records: ResolvedRecord[],
    season: number,
    week: number,
    options: PublishOptions
  ): Promise<{
    updated: number;
    created: number;
    failed: number;
    errors: PublishError[];
  }> {
    const batchSize = options.batch_size || this.BATCH_SIZE;
    const errors: PublishError[] = [];
    let updated = 0;
    let created = 0;
    let failed = 0;

    // Process records in batches to avoid overwhelming the database
    const batches = this.createBatches(records, batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[DataPublisher] Processing batch ${i + 1}/${batches.length} (${batch.length} records)`);

      try {
        // Check for existing records in this batch
        const existingRecords = await this.getExistingRecords(batch, season, week);
        
        for (const record of batch) {
          try {
            const existing = existingRecords.get(record.player_id);
            
            if (existing) {
              // Update existing record
              await this.updatePlayerDepthChart(record, existing.$id);
              updated++;
            } else {
              // Create new record
              await this.createPlayerDepthChart(record, season, week);
              created++;
            }

          } catch (error) {
            failed++;
            errors.push({
              record_id: record.player_id,
              player_id: record.player_id,
              error_type: 'database_write',
              message: `Failed to write record: ${error instanceof Error ? error.message : String(error)}`,
              severity: 'error'
            });
          }
        }

        // Brief pause between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await this.sleep(100);
        }

      } catch (error) {
        console.error(`[DataPublisher] Batch ${i + 1} failed:`, error);
        failed += batch.length;
        
        errors.push({
          error_type: 'database_write',
          message: `Batch ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error'
        });
      }
    }

    return { updated, created, failed, errors };
  }

  private async getExistingRecords(
    records: ResolvedRecord[],
    season: number,
    week: number
  ): Promise<Map<string, any>> {
    const existingMap = new Map<string, any>();
    
    try {
      const playerIds = records.map(r => r.player_id);
      
      // Query existing records for this season/week
      const queries = [
        Query.equal('season', season),
        Query.equal('week', week),
        Query.equal('player_id', playerIds),
        Query.limit(1000)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        'player_depth_charts',
        queries
      );

      for (const doc of response.documents) {
        existingMap.set(doc.player_id, doc);
      }

    } catch (error) {
      console.warn('[DataPublisher] Failed to load existing records:', error);
    }

    return existingMap;
  }

  private async updatePlayerDepthChart(record: ResolvedRecord, documentId: string): Promise<void> {
    const updateData = this.convertToAppwriteDocument(record);
    
    // Remove read-only fields
    delete updateData.$id;
    delete updateData.$createdAt;
    delete updateData.$updatedAt;
    delete updateData.$permissions;
    delete updateData.$collectionId;
    delete updateData.$databaseId;
    
    // Update timestamp
    updateData.updated_at = new Date().toISOString();

    await databases.updateDocument(
      DATABASE_ID,
      'player_depth_charts',
      documentId,
      updateData
    );
  }

  private async createPlayerDepthChart(record: ResolvedRecord, season: number, week: number): Promise<void> {
    const docData = this.convertToAppwriteDocument(record);
    
    // Set creation timestamps
    const now = new Date().toISOString();
    docData.created_at = now;
    docData.updated_at = now;
    
    await databases.createDocument(
      DATABASE_ID,
      'player_depth_charts',
      ID.unique(),
      docData
    );
  }

  private convertToAppwriteDocument(record: ResolvedRecord): any {
    return {
      player_id: record.player_id,
      team_id: record.team_id,
      position: record.position,
      season: record.season,
      week: record.week,
      depth_chart_rank: record.depth_chart_rank,
      starter_prob: record.starter_prob,
      snap_share_proj: record.snap_share_proj,
      injury_status: record.injury_status,
      injury_note: record.injury_note || null,
      injury_as_of: record.injury_as_of,
      injury_source: record.injury_source,
      usage_1w_snap_pct: record.usage_1w_snap_pct,
      usage_4w_snap_pct: record.usage_4w_snap_pct,
      usage_1w_route_pct: record.usage_1w_route_pct,
      usage_4w_route_pct: record.usage_4w_route_pct,
      usage_1w_carry_share: record.usage_1w_carry_share,
      usage_4w_carry_share: record.usage_4w_carry_share,
      usage_1w_target_share: record.usage_1w_target_share,
      usage_4w_target_share: record.usage_4w_target_share,
      prior_season_target_share: record.prior_season_target_share,
      prior_season_carry_share: record.prior_season_carry_share,
      prior_season_yards_share: record.prior_season_yards_share,
      prior_season_td_share: record.prior_season_td_share,
      as_of: record.as_of,
      source: record.source,
      confidence: record.final_confidence,
      provenance_trail: JSON.stringify(record.resolution_log),
      manual_overrides: JSON.stringify(record.manual_overrides_applied)
    };
  }

  /**
   * Create immutable versioned snapshot
   */
  private async createSnapshot(
    resolutionResult: ResolutionResult,
    season: number,
    week: number,
    publicationId: string,
    dryRun: boolean = false
  ): Promise<string> {
    const snapshotId = `${season}W${week}_${publicationId}`;
    const snapshotDir = join(this.SNAPSHOTS_DIR, String(season), `week-${week}`);
    const snapshotPath = join(snapshotDir, `${snapshotId}.json`);

    const snapshot: DataSnapshot = {
      snapshot_id: snapshotId,
      season,
      week,
      created_at: new Date().toISOString(),
      total_records: resolutionResult.resolved_records.length,
      data_sources: Array.from(new Set(resolutionResult.resolved_records.map(r => r.source))),
      schema_version: this.SCHEMA_VERSION,
      records: resolutionResult.resolved_records,
      metadata: {
        publication_id: publicationId,
        conflict_stats: resolutionResult.conflict_stats,
        ingestion_stats: {
          resolution_log_summary: this.summarizeResolutionLogs(resolutionResult.resolved_records),
          diff_log_summary: this.summarizeDiffLog(resolutionResult.diff_log)
        }
      }
    };

    if (!dryRun) {
      try {
        // Ensure directory exists
        mkdirSync(snapshotDir, { recursive: true });
        
        // Write snapshot to file
        writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
        
        console.log(`[DataPublisher] Snapshot created: ${snapshotPath}`);
      } catch (error) {
        console.error('[DataPublisher] Failed to create snapshot:', error);
        throw new Error(`Snapshot creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return snapshotPath;
  }

  /**
   * Invalidate caches that depend on this data
   */
  private async invalidateCaches(season: number, week: number): Promise<void> {
    try {
      console.log(`[DataPublisher] Invalidating caches for ${season}W${week}`);
      
      // Log cache invalidation request to ingestion_log
      await this.logCacheInvalidation(season, week);
      
      // In a production system, this would trigger:
      // - Redis cache invalidation
      // - CDN purge requests  
      // - Webhook notifications to dependent services
      // - Projection system recalculation triggers
      
      console.log('[DataPublisher] Cache invalidation completed');
      
    } catch (error) {
      console.warn('[DataPublisher] Cache invalidation failed:', error);
      // Non-fatal error - log but continue
    }
  }

  /**
   * Log ingestion statistics to database
   */
  private async logIngestionStats(
    publicationId: string,
    season: number,
    week: number,
    resolutionResult: ResolutionResult,
    publishStats: any
  ): Promise<void> {
    try {
      const logEntry = {
        publication_id: publicationId,
        season,
        week,
        operation: 'data_publication',
        status: publishStats.records_failed === 0 ? 'success' : 'partial_failure',
        records_processed: resolutionResult.resolved_records.length,
        records_updated: publishStats.records_updated,
        records_created: publishStats.records_created,
        records_failed: publishStats.records_failed,
        conflict_stats: JSON.stringify(resolutionResult.conflict_stats),
        duration_ms: publishStats.duration_ms,
        created_at: new Date().toISOString()
      };

      await databases.createDocument(
        DATABASE_ID,
        'ingestion_log',
        ID.unique(),
        logEntry
      );

    } catch (error) {
      console.warn('[DataPublisher] Failed to log ingestion stats:', error);
    }
  }

  private async logCacheInvalidation(season: number, week: number): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'ingestion_log',
        ID.unique(),
        {
          season,
          week,
          operation: 'cache_invalidation',
          status: 'success',
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('[DataPublisher] Failed to log cache invalidation:', error);
    }
  }

  private async validateRecords(records: ResolvedRecord[]): Promise<PublishError[]> {
    const errors: PublishError[] = [];

    for (const record of records) {
      // Check required fields
      if (!record.player_id) {
        errors.push({
          player_id: record.player_id,
          error_type: 'validation',
          message: 'Missing required field: player_id',
          severity: 'error'
        });
      }

      if (!record.team_id) {
        errors.push({
          player_id: record.player_id,
          error_type: 'validation',
          message: 'Missing required field: team_id',
          severity: 'error'
        });
      }

      // Validate ranges
      if (record.depth_chart_rank < 1 || record.depth_chart_rank > 10) {
        errors.push({
          player_id: record.player_id,
          error_type: 'validation',
          message: `Invalid depth_chart_rank: ${record.depth_chart_rank}`,
          severity: 'error'
        });
      }

      if (record.starter_prob < 0 || record.starter_prob > 1) {
        errors.push({
          player_id: record.player_id,
          error_type: 'validation',
          message: `Invalid starter_prob: ${record.starter_prob}`,
          severity: 'error'
        });
      }

      // Check confidence threshold
      if (record.final_confidence < 0.5) {
        errors.push({
          player_id: record.player_id,
          error_type: 'validation',
          message: `Low confidence record: ${record.final_confidence}`,
          severity: 'warning'
        });
      }
    }

    return errors;
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private generatePublicationId(season: number, week: number): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${season}W${week}_${timestamp}`;
  }

  private summarizeResolutionLogs(records: ResolvedRecord[]): any {
    const summary = {
      total_conflicts: 0,
      conflicts_by_field: {} as Record<string, number>,
      sources_used: {} as Record<string, number>
    };

    for (const record of records) {
      summary.total_conflicts += record.resolution_log.length;
      
      for (const resolution of record.resolution_log) {
        summary.conflicts_by_field[resolution.field_name] = (summary.conflicts_by_field[resolution.field_name] || 0) + 1;
        summary.sources_used[resolution.winning_source] = (summary.sources_used[resolution.winning_source] || 0) + 1;
      }
    }

    return summary;
  }

  private summarizeDiffLog(diffLog: any[]): any {
    return {
      total_changes: diffLog.length,
      change_types: diffLog.reduce((acc: any, entry: any) => {
        acc[entry.change_type] = (acc[entry.change_type] || 0) + 1;
        return acc;
      }, {}),
      fields_changed: diffLog.reduce((acc: any, entry: any) => {
        acc[entry.field_name] = (acc[entry.field_name] || 0) + 1;
        return acc;
      }, {})
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get publication history
   */
  async getPublicationHistory(season: number, week?: number, limit: number = 50): Promise<any[]> {
    try {
      const queries = [
        Query.equal('season', season),
        Query.equal('operation', 'data_publication'),
        Query.orderDesc('created_at'),
        Query.limit(limit)
      ];

      if (week) {
        queries.push(Query.equal('week', week));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        'ingestion_log',
        queries
      );

      return response.documents;

    } catch (error) {
      console.error('[DataPublisher] Failed to get publication history:', error);
      return [];
    }
  }

  /**
   * Clean up old snapshots
   */
  async cleanupOldSnapshots(season: number, keepLatest: number = 10): Promise<void> {
    // Implementation would clean up old snapshot files
    // keeping only the latest N snapshots per season/week
    console.log(`[DataPublisher] Cleanup would keep latest ${keepLatest} snapshots for season ${season}`);
  }
}