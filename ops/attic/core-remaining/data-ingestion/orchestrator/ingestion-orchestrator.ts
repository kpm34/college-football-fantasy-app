/**
 * Data Ingestion Orchestrator
 * 
 * Central coordinator that runs the full 4-layer ingestion pipeline:
 * Adapters → Normalizer → Resolver → Publisher
 * 
 * Handles scheduling, monitoring, error recovery, and system health.
 */

import { TeamNotesAdapter } from '../adapters/team-notes-adapter';
import { StatsInferenceAdapter } from '../adapters/stats-inference-adapter';
import { DataNormalizer } from '../normalizer/data-normalizer';
import { ConflictResolver } from '../resolver/conflict-resolver';
import { DataPublisher } from '../publisher/data-publisher';
import { BaseAdapter } from '../adapters/base-adapter';
import { serverDatabases as databases, DATABASE_ID } from '../../../lib/appwrite-server';
import { ID, Query } from 'node-appwrite';

export interface IngestionConfig {
  season: number;
  week: number;
  adapters: string[]; // Which adapters to run
  options: {
    dry_run?: boolean;
    skip_normalization?: boolean;
    skip_resolution?: boolean;
    skip_publication?: boolean;
    create_snapshot?: boolean;
    parallel_adapters?: boolean;
    max_retries?: number;
  };
}

export interface IngestionResult {
  success: boolean;
  execution_id: string;
  season: number;
  week: number;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  stages: {
    adapters: {
      status: 'success' | 'partial' | 'failed';
      records_fetched: number;
      adapters_run: string[];
      adapters_failed: string[];
      duration_ms: number;
    };
    normalization: {
      status: 'success' | 'failed' | 'skipped';
      records_normalized: number;
      mapping_failures: number;
      duration_ms: number;
    };
    resolution: {
      status: 'success' | 'failed' | 'skipped';
      conflicts_resolved: number;
      manual_overrides_applied: number;
      duration_ms: number;
    };
    publication: {
      status: 'success' | 'failed' | 'skipped';
      records_published: number;
      snapshot_created: boolean;
      duration_ms: number;
    };
  };
  errors: IngestionError[];
  warnings: IngestionWarning[];
  performance_metrics: {
    peak_memory_mb: number;
    total_database_queries: number;
    total_network_requests: number;
  };
}

export interface IngestionError {
  stage: 'adapters' | 'normalization' | 'resolution' | 'publication';
  component: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  timestamp: string;
}

export interface IngestionWarning {
  stage: string;
  message: string;
  count?: number;
  timestamp: string;
}

export class IngestionOrchestrator {
  private adapters: Map<string, BaseAdapter> = new Map();
  private normalizer: DataNormalizer;
  private resolver: ConflictResolver;
  private publisher: DataPublisher;

  constructor() {
    // Initialize all components
    this.normalizer = new DataNormalizer();
    this.resolver = new ConflictResolver();
    this.publisher = new DataPublisher();

    // Register available adapters
    this.adapters.set('team_notes', new TeamNotesAdapter());
    this.adapters.set('stats_inference', new StatsInferenceAdapter());
  }

  /**
   * Execute the full ingestion pipeline
   */
  async execute(config: IngestionConfig): Promise<IngestionResult> {
    const executionId = this.generateExecutionId(config.season, config.week);
    const startTime = Date.now();
    const errors: IngestionError[] = [];
    const warnings: IngestionWarning[] = [];

    console.log(`[IngestionOrchestrator] Starting execution ${executionId} for ${config.season}W${config.week}`);
    
    // Log execution start
    await this.logExecutionStart(executionId, config);

    try {
      // Initialize components
      await this.initializeComponents(config.season, config.week);

      // Stage 1: Adapters
      const adapterResults = await this.executeAdapters(config, errors, warnings);

      // Stage 2: Normalization
      const normalizationResult = await this.executeNormalization(
        adapterResults.rawRecords,
        config,
        errors,
        warnings
      );

      // Stage 3: Conflict Resolution
      const resolutionResult = await this.executeResolution(
        normalizationResult.normalizedRecords,
        config,
        errors,
        warnings
      );

      // Stage 4: Publication
      const publicationResult = await this.executePublication(
        resolutionResult.resolutionResult,
        config,
        errors,
        warnings
      );

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // Determine overall success
      const success = this.determineOverallSuccess(
        adapterResults,
        normalizationResult,
        resolutionResult,
        publicationResult,
        errors
      );

      const result: IngestionResult = {
        success,
        execution_id: executionId,
        season: config.season,
        week: config.week,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date(endTime).toISOString(),
        duration_ms: totalDuration,
        stages: {
          adapters: adapterResults.summary,
          normalization: normalizationResult.summary,
          resolution: resolutionResult.summary,
          publication: publicationResult.summary
        },
        errors,
        warnings,
        performance_metrics: await this.getPerformanceMetrics()
      };

      // Log execution completion
      await this.logExecutionCompletion(executionId, result);

      console.log(`[IngestionOrchestrator] Execution ${executionId} completed: ${success ? 'SUCCESS' : 'FAILED'} (${totalDuration}ms)`);
      
      return result;

    } catch (error) {
      const endTime = Date.now();
      console.error(`[IngestionOrchestrator] Execution ${executionId} failed:`, error);

      errors.push({
        stage: 'adapters',
        component: 'orchestrator',
        message: `Pipeline execution failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });

      const failedResult: IngestionResult = {
        success: false,
        execution_id: executionId,
        season: config.season,
        week: config.week,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date(endTime).toISOString(),
        duration_ms: endTime - startTime,
        stages: {
          adapters: { status: 'failed', records_fetched: 0, adapters_run: [], adapters_failed: [], duration_ms: 0 },
          normalization: { status: 'failed', records_normalized: 0, mapping_failures: 0, duration_ms: 0 },
          resolution: { status: 'failed', conflicts_resolved: 0, manual_overrides_applied: 0, duration_ms: 0 },
          publication: { status: 'failed', records_published: 0, snapshot_created: false, duration_ms: 0 }
        },
        errors,
        warnings,
        performance_metrics: await this.getPerformanceMetrics()
      };

      await this.logExecutionCompletion(executionId, failedResult);
      return failedResult;
    }
  }

  /**
   * Initialize all pipeline components
   */
  private async initializeComponents(season: number, week: number): Promise<void> {
    console.log('[IngestionOrchestrator] Initializing pipeline components...');
    
    await Promise.all([
      this.normalizer.initialize(),
      this.resolver.initialize(season, week)
    ]);
    
    console.log('[IngestionOrchestrator] All components initialized');
  }

  /**
   * Execute adapter layer
   */
  private async executeAdapters(
    config: IngestionConfig,
    errors: IngestionError[],
    warnings: IngestionWarning[]
  ): Promise<{
    rawRecords: any[];
    summary: IngestionResult['stages']['adapters'];
  }> {
    const startTime = Date.now();
    const adaptersToRun = config.adapters.filter(name => this.adapters.has(name));
    const rawRecords: any[] = [];
    const adaptersRun: string[] = [];
    const adaptersFailed: string[] = [];

    console.log(`[IngestionOrchestrator] Executing ${adaptersToRun.length} adapters...`);

    if (config.options.parallel_adapters) {
      // Run adapters in parallel
      const adapterPromises = adaptersToRun.map(async (adapterName) => {
        try {
          const adapter = this.adapters.get(adapterName)!;
          const result = await adapter.execute(config.season, config.week);
          
          adaptersRun.push(adapterName);
          return result.records;
        } catch (error) {
          adaptersFailed.push(adapterName);
          errors.push({
            stage: 'adapters',
            component: adapterName,
            message: `Adapter execution failed: ${error instanceof Error ? error.message : String(error)}`,
            severity: 'error',
            timestamp: new Date().toISOString()
          });
          return [];
        }
      });

      const results = await Promise.allSettled(adapterPromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          rawRecords.push(...result.value);
        }
      });

    } else {
      // Run adapters sequentially
      for (const adapterName of adaptersToRun) {
        try {
          const adapter = this.adapters.get(adapterName)!;
          const result = await adapter.execute(config.season, config.week);
          
          adaptersRun.push(adapterName);
          rawRecords.push(...result.records);
          
        } catch (error) {
          adaptersFailed.push(adapterName);
          errors.push({
            stage: 'adapters',
            component: adapterName,
            message: `Adapter execution failed: ${error instanceof Error ? error.message : String(error)}`,
            severity: 'error',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    const status = adaptersFailed.length === 0 ? 'success' : 
                   adaptersRun.length > 0 ? 'partial' : 'failed';

    return {
      rawRecords,
      summary: {
        status,
        records_fetched: rawRecords.length,
        adapters_run: adaptersRun,
        adapters_failed: adaptersFailed,
        duration_ms: duration
      }
    };
  }

  /**
   * Execute normalization layer
   */
  private async executeNormalization(
    rawRecords: any[],
    config: IngestionConfig,
    errors: IngestionError[],
    warnings: IngestionWarning[]
  ): Promise<{
    normalizedRecords: any[];
    summary: IngestionResult['stages']['normalization'];
  }> {
    const startTime = Date.now();

    if (config.options.skip_normalization || rawRecords.length === 0) {
      return {
        normalizedRecords: rawRecords,
        summary: {
          status: 'skipped',
          records_normalized: 0,
          mapping_failures: 0,
          duration_ms: 0
        }
      };
    }

    try {
      console.log(`[IngestionOrchestrator] Normalizing ${rawRecords.length} raw records...`);
      
      const result = await this.normalizer.normalize(rawRecords, config.season, config.week);
      
      // Add validation errors as warnings
      result.validation_errors.forEach(error => {
        warnings.push({
          stage: 'normalization',
          message: `${error.field}: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      });

      const duration = Date.now() - startTime;

      return {
        normalizedRecords: result.normalized_records,
        summary: {
          status: result.success ? 'success' : 'failed',
          records_normalized: result.normalized_records.length,
          mapping_failures: result.mapping_stats.mapping_failures,
          duration_ms: duration
        }
      };

    } catch (error) {
      errors.push({
        stage: 'normalization',
        component: 'data_normalizer',
        message: `Normalization failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });

      return {
        normalizedRecords: [],
        summary: {
          status: 'failed',
          records_normalized: 0,
          mapping_failures: rawRecords.length,
          duration_ms: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Execute resolution layer
   */
  private async executeResolution(
    normalizedRecords: any[],
    config: IngestionConfig,
    errors: IngestionError[],
    warnings: IngestionWarning[]
  ): Promise<{
    resolutionResult: any;
    summary: IngestionResult['stages']['resolution'];
  }> {
    const startTime = Date.now();

    if (config.options.skip_resolution || normalizedRecords.length === 0) {
      // Create a mock resolution result
      const mockResult = {
        resolved_records: normalizedRecords.map((record: any) => ({
          ...record,
          resolution_log: [],
          manual_overrides_applied: [],
          final_confidence: record.confidence || 0.5,
          sources_merged: [record.source]
        })),
        conflict_stats: {
          total_conflicts: 0,
          resolved_conflicts: 0,
          manual_overrides_applied: 0,
          avg_confidence: 0.5
        },
        diff_log: []
      };

      return {
        resolutionResult: mockResult,
        summary: {
          status: 'skipped',
          conflicts_resolved: 0,
          manual_overrides_applied: 0,
          duration_ms: 0
        }
      };
    }

    try {
      console.log(`[IngestionOrchestrator] Resolving conflicts in ${normalizedRecords.length} normalized records...`);
      
      const result = await this.resolver.resolve(normalizedRecords);
      
      const duration = Date.now() - startTime;

      return {
        resolutionResult: result,
        summary: {
          status: 'success',
          conflicts_resolved: result.conflict_stats.resolved_conflicts,
          manual_overrides_applied: result.conflict_stats.manual_overrides_applied,
          duration_ms: duration
        }
      };

    } catch (error) {
      errors.push({
        stage: 'resolution',
        component: 'conflict_resolver',
        message: `Conflict resolution failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });

      return {
        resolutionResult: null,
        summary: {
          status: 'failed',
          conflicts_resolved: 0,
          manual_overrides_applied: 0,
          duration_ms: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Execute publication layer
   */
  private async executePublication(
    resolutionResult: any,
    config: IngestionConfig,
    errors: IngestionError[],
    warnings: IngestionWarning[]
  ): Promise<{
    summary: IngestionResult['stages']['publication'];
  }> {
    const startTime = Date.now();

    if (config.options.skip_publication || !resolutionResult || resolutionResult.resolved_records.length === 0) {
      return {
        summary: {
          status: 'skipped',
          records_published: 0,
          snapshot_created: false,
          duration_ms: 0
        }
      };
    }

    try {
      console.log(`[IngestionOrchestrator] Publishing ${resolutionResult.resolved_records.length} resolved records...`);
      
      const publishOptions = {
        dry_run: config.options.dry_run,
        create_snapshot: config.options.create_snapshot,
        validate_before_publish: true
      };

      const result = await this.publisher.publish(
        resolutionResult,
        config.season,
        config.week,
        publishOptions
      );

      // Add publication errors
      result.errors.forEach(error => {
        if (error.severity === 'error') {
          errors.push({
            stage: 'publication',
            component: 'data_publisher',
            message: error.message,
            severity: 'error',
            timestamp: new Date().toISOString()
          });
        } else {
          warnings.push({
            stage: 'publication',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      const duration = Date.now() - startTime;

      return {
        summary: {
          status: result.success ? 'success' : 'failed',
          records_published: result.records_created + result.records_updated,
          snapshot_created: result.snapshot_path.length > 0,
          duration_ms: duration
        }
      };

    } catch (error) {
      errors.push({
        stage: 'publication',
        component: 'data_publisher',
        message: `Publication failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });

      return {
        summary: {
          status: 'failed',
          records_published: 0,
          snapshot_created: false,
          duration_ms: Date.now() - startTime
        }
      };
    }
  }

  private determineOverallSuccess(
    adapterResults: any,
    normalizationResult: any,
    resolutionResult: any,
    publicationResult: any,
    errors: IngestionError[]
  ): boolean {
    // Pipeline succeeds if no critical errors and at least some data was processed
    const hasCriticalErrors = errors.some(e => e.severity === 'critical');
    const hasDataFlow = (
      adapterResults.summary.records_fetched > 0 &&
      (normalizationResult.summary.status === 'success' || normalizationResult.summary.status === 'skipped') &&
      (resolutionResult.summary.status === 'success' || resolutionResult.summary.status === 'skipped') &&
      (publicationResult.summary.status === 'success' || publicationResult.summary.status === 'skipped')
    );

    return !hasCriticalErrors && hasDataFlow;
  }

  private async getPerformanceMetrics(): Promise<IngestionResult['performance_metrics']> {
    // In a real implementation, these would be tracked throughout execution
    return {
      peak_memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total_database_queries: 0, // Would be tracked
      total_network_requests: 0   // Would be tracked
    };
  }

  private generateExecutionId(season: number, week: number): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${season}W${week}_${timestamp}_${random}`;
  }

  private async logExecutionStart(executionId: string, config: IngestionConfig): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'ingestion_log',
        ID.unique(),
        {
          execution_id: executionId,
          season: config.season,
          week: config.week,
          operation: 'pipeline_execution',
          status: 'started',
          configuration: JSON.stringify(config),
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('[IngestionOrchestrator] Failed to log execution start:', error);
    }
  }

  private async logExecutionCompletion(executionId: string, result: IngestionResult): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'ingestion_log',
        ID.unique(),
        {
          execution_id: executionId,
          season: result.season,
          week: result.week,
          operation: 'pipeline_execution',
          status: result.success ? 'completed' : 'failed',
          duration_ms: result.duration_ms,
          records_processed: result.stages.publication.records_published,
          result_summary: JSON.stringify({
            stages: result.stages,
            error_count: result.errors.length,
            warning_count: result.warnings.length
          }),
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('[IngestionOrchestrator] Failed to log execution completion:', error);
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(season: number, limit: number = 20): Promise<any[]> {
    try {
      const queries = [
        Query.equal('season', season),
        Query.equal('operation', 'pipeline_execution'),
        Query.orderDesc('created_at'),
        Query.limit(limit)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        'ingestion_log',
        queries
      );

      return response.documents;

    } catch (error) {
      console.error('[IngestionOrchestrator] Failed to get execution history:', error);
      return [];
    }
  }

  /**
   * Health check for the ingestion system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, 'up' | 'down' | 'degraded'>;
    last_successful_execution?: string;
    issues: string[];
  }> {
    const issues: string[] = [];
    const components: Record<string, 'up' | 'down' | 'degraded'> = {};

    try {
      // Check database connectivity
      await databases.listDocuments(DATABASE_ID, 'ingestion_log', [Query.limit(1)]);
      components.database = 'up';
    } catch (error) {
      components.database = 'down';
      issues.push('Database connectivity failed');
    }

    // Check adapters
    for (const [name, adapter] of this.adapters.entries()) {
      try {
        // Basic adapter health check (would be implemented in BaseAdapter)
        components[`adapter_${name}`] = 'up';
      } catch (error) {
        components[`adapter_${name}`] = 'down';
        issues.push(`Adapter ${name} is not responding`);
      }
    }

    const overallStatus = issues.length === 0 ? 'healthy' : 
                         Object.values(components).some(s => s === 'up') ? 'degraded' : 'unhealthy';

    return {
      status: overallStatus,
      components,
      issues
    };
  }
}