/**
 * Central Sync System
 * 
 * Orchestrates data synchronization between:
 * 1. External APIs (CFBD, ESPN) → Appwrite
 * 2. User actions → Appwrite → Frontend cache invalidation
 * 3. Schema changes → Appwrite → Vercel deployment
 * 4. Real-time updates → WebSocket connections
 * 
 * Features:
 * - Batch processing and rate limiting
 * - Error handling and retry logic
 * - Cache invalidation and revalidation
 * - Real-time event broadcasting
 * - Deployment coordination
 */

import { Client, Databases, Query } from 'node-appwrite';
import { validateCollectionData, getCollectionConfig, type CollectionConfig } from '../schema/appwrite-schema-map';
import { SYNC_JOBS, DATA_TRANSFORMS, type SyncJob, type DataTransform } from '../pipeline/data-flow-map';
import { env } from '../config/environment';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk_update';
  collection: string;
  data: any;
  metadata: {
    source: string;
    timestamp: string;
    userId?: string;
    batchId?: string;
  };
}

export interface SyncResult {
  success: boolean;
  operation: SyncOperation;
  result?: any;
  error?: string;
  retryCount: number;
  duration: number;
}

export interface SyncBatch {
  id: string;
  operations: SyncOperation[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: SyncResult[];
  startTime?: Date;
  endTime?: Date;
  totalDuration?: number;
}

export class CentralSyncSystem {
  private client: Client;
  private databases: Databases;
  private isServer: boolean = true;
  private syncQueue: Map<string, SyncBatch> = new Map();
  private activeJobs: Map<string, Promise<void>> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    // Initialize Appwrite server client
    this.client = new Client()
      .setEndpoint(env.server.appwrite.endpoint)
      .setProject(env.server.appwrite.projectId)
      .setKey(env.server.appwrite.apiKey);
    
    this.databases = new Databases(this.client);
  }

  /**
   * Queue a single sync operation
   */
  async queueOperation(operation: SyncOperation): Promise<string> {
    const batchId = operation.metadata.batchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let batch = this.syncQueue.get(batchId);
    if (!batch) {
      batch = {
        id: batchId,
        operations: [],
        status: 'pending',
        results: []
      };
      this.syncQueue.set(batchId, batch);
    }
    
    batch.operations.push(operation);
    
    // Auto-process single operations immediately
    if (batch.operations.length === 1) {
      this.processBatch(batchId);
    }
    
    return batchId;
  }

  /**
   * Queue multiple sync operations as a batch
   */
  async queueBatch(operations: SyncOperation[]): Promise<string> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const batch: SyncBatch = {
      id: batchId,
      operations: operations.map(op => ({
        ...op,
        metadata: { ...op.metadata, batchId }
      })),
      status: 'pending',
      results: []
    };
    
    this.syncQueue.set(batchId, batch);
    
    // Process batch
    this.processBatch(batchId);
    
    return batchId;
  }

  /**
   * Process a sync batch
   */
  private async processBatch(batchId: string): Promise<void> {
    const batch = this.syncQueue.get(batchId);
    if (!batch || batch.status !== 'pending') return;
    
    // Prevent concurrent processing
    if (this.activeJobs.has(batchId)) return;
    
    batch.status = 'processing';
    batch.startTime = new Date();
    
    const jobPromise = this.executeBatch(batch);
    this.activeJobs.set(batchId, jobPromise);
    
    try {
      await jobPromise;
    } finally {
      this.activeJobs.delete(batchId);
      batch.endTime = new Date();
      batch.totalDuration = batch.endTime.getTime() - batch.startTime.getTime();
      
      // Clean up old batches
      setTimeout(() => this.syncQueue.delete(batchId), 300000); // 5 minutes
    }
  }

  /**
   * Execute batch operations
   */
  private async executeBatch(batch: SyncBatch): Promise<void> {
    const results: SyncResult[] = [];
    
    for (const operation of batch.operations) {
      const startTime = Date.now();
      let retryCount = 0;
      let result: SyncResult;
      
      // Rate limiting check
      if (await this.isRateLimited(operation.metadata.source)) {
        result = {
          success: false,
          operation,
          error: 'Rate limit exceeded',
          retryCount,
          duration: 0
        };
      } else {
        result = await this.executeOperation(operation, retryCount);
      }
      
      result.duration = Date.now() - startTime;
      results.push(result);
      
      // Handle cache invalidation on successful writes
      if (result.success && ['create', 'update', 'delete'].includes(operation.type)) {
        await this.invalidateCache(operation.collection, operation.data);
      }
      
      // Real-time broadcasting
      if (result.success) {
        await this.broadcastChange(operation, result.result);
      }
      
      // Short delay between operations to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    batch.results = results;
    batch.status = results.every(r => r.success) ? 'completed' : 'failed';
    
    // Log batch completion
    console.log(`Batch ${batch.id} completed: ${results.filter(r => r.success).length}/${results.length} successful`);
  }

  /**
   * Execute a single sync operation with retries
   */
  private async executeOperation(operation: SyncOperation, retryCount = 0): Promise<SyncResult> {
    try {
      // Validate data before operation
      const validation = validateCollectionData(operation.collection, operation.data);
      if (!validation.valid) {
        return {
          success: false,
          operation,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          retryCount,
          duration: 0
        };
      }
      
      let result: any;
      const databaseId = env.server.appwrite.databaseId;
      
      switch (operation.type) {
        case 'create':
          result = await this.databases.createDocument(
            databaseId,
            operation.collection,
            'unique()',
            operation.data
          );
          break;
          
        case 'update':
          result = await this.databases.updateDocument(
            databaseId,
            operation.collection,
            operation.data.$id,
            operation.data
          );
          break;
          
        case 'delete':
          await this.databases.deleteDocument(
            databaseId,
            operation.collection,
            operation.data.$id
          );
          result = { deleted: true, id: operation.data.$id };
          break;
          
        case 'bulk_update':
          result = await this.executeBulkUpdate(operation);
          break;
          
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }
      
      return {
        success: true,
        operation,
        result,
        retryCount,
        duration: 0
      };
      
    } catch (error: any) {
      console.error(`Sync operation failed:`, error);
      
      // Retry logic
      const maxRetries = 3;
      if (retryCount < maxRetries && this.shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)); // Exponential backoff
        return this.executeOperation(operation, retryCount + 1);
      }
      
      return {
        success: false,
        operation,
        error: error.message || 'Unknown error',
        retryCount,
        duration: 0
      };
    }
  }

  /**
   * Execute bulk update operation
   */
  private async executeBulkUpdate(operation: SyncOperation): Promise<any> {
    const { collection, data } = operation;
    const databaseId = env.server.appwrite.databaseId;
    const results = [];
    
    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (item: any) => {
          if (item.$id) {
            // Update existing
            return this.databases.updateDocument(databaseId, collection, item.$id, item);
          } else {
            // Create new
            return this.databases.createDocument(databaseId, collection, 'unique()', item);
          }
        })
      );
      
      results.push(...batchResults);
      
      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return {
      total: data.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }

  /**
   * External API sync methods
   */
  async syncFromCFBD(endpoint: string, transform: string, targetCollection: string): Promise<string> {
    try {
      const response = await fetch(`https://api.collegefootballdata.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${env.server.external.cfbdApiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`CFBD API error: ${response.status}`);
      }
      
      const data = await response.json();
      const transformConfig = DATA_TRANSFORMS[transform];
      
      if (!transformConfig) {
        throw new Error(`Transform configuration not found: ${transform}`);
      }
      
      // Transform data
      const transformedData = data.map((item: any) => this.transformData(item, transformConfig));
      
      // Create sync operations
      const operations: SyncOperation[] = transformedData.map(item => ({
        id: `cfbd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'create',
        collection: targetCollection,
        data: item,
        metadata: {
          source: 'cfbd',
          timestamp: new Date().toISOString()
        }
      }));
      
      return this.queueBatch(operations);
      
    } catch (error: any) {
      console.error('CFBD sync failed:', error);
      throw error;
    }
  }

  /**
   * User action sync methods
   */
  async syncUserAction(action: string, userId: string, data: any, affectedCollections: string[]): Promise<string[]> {
    const operations: SyncOperation[] = [];
    
    // Create sync operations based on action type
    switch (action) {
      case 'create_league':
        operations.push({
          id: `user_action_${Date.now()}`,
          type: 'create',
          collection: 'leagues',
          data: data.league,
          metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
        });
        
        if (data.roster) {
          operations.push({
            id: `user_action_${Date.now()}_roster`,
            type: 'create',
            collection: 'rosters',
            data: data.roster,
            metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
          });
        }
        break;
        
      case 'join_league':
        operations.push({
          id: `user_action_${Date.now()}`,
          type: 'create',
          collection: 'rosters',
          data: data.roster,
          metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
        });
        
        operations.push({
          id: `user_action_${Date.now()}_league_update`,
          type: 'update',
          collection: 'leagues',
          data: { $id: data.leagueId, currentTeams: data.newTeamCount },
          metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
        });
        break;
        
      case 'draft_pick':
        operations.push({
          id: `user_action_${Date.now()}`,
          type: 'update',
          collection: 'rosters',
          data: data.roster,
          metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
        });
        break;
        
      case 'auction_bid':
        operations.push({
          id: `user_action_${Date.now()}`,
          type: 'create',
          collection: 'bids',
          data: data.bid,
          metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
        });
        
        operations.push({
          id: `user_action_${Date.now()}_auction_update`,
          type: 'update',
          collection: 'auctions',
          data: data.auction,
          metadata: { source: 'user_input', timestamp: new Date().toISOString(), userId }
        });
        break;
    }
    
    if (operations.length === 0) {
      throw new Error(`Unknown user action: ${action}`);
    }
    
    const batchIds: string[] = [];
    for (const operation of operations) {
      const batchId = await this.queueOperation(operation);
      batchIds.push(batchId);
    }
    
    return batchIds;
  }

  /**
   * Schema sync methods
   */
  async syncSchema(schemaChanges: any[]): Promise<void> {
    // This would integrate with Appwrite CLI or SDK to push schema changes
    console.log('Schema sync not yet implemented - requires Appwrite CLI integration');
    
    // For now, log the changes that would be made
    schemaChanges.forEach(change => {
      console.log(`Schema change: ${change.type} on ${change.collection}`, change);
    });
  }

  /**
   * Cache invalidation
   */
  private async invalidateCache(collection: string, data: any): Promise<void> {
    try {
      // Vercel Edge Config invalidation
      if (env.features.caching) {
        const patterns = [
          `${collection}:*`,
          `${collection}:list:*`,
        ];
        
        // Add specific cache keys based on data
        if (data.$id) {
          patterns.push(`${collection}:${data.$id}`);
        }
        
        if (data.leagueId) {
          patterns.push(`${collection}:league:${data.leagueId}:*`);
        }
        
        // TODO: Implement actual cache invalidation
        console.log(`Would invalidate cache patterns:`, patterns);
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }

  /**
   * Real-time change broadcasting
   */
  private async broadcastChange(operation: SyncOperation, result: any): Promise<void> {
    try {
      // This would integrate with WebSocket or Server-Sent Events
      const event = {
        type: 'data_change',
        collection: operation.collection,
        operation: operation.type,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      // TODO: Implement actual real-time broadcasting
      console.log(`Would broadcast change:`, event);
    } catch (error) {
      console.warn('Real-time broadcasting failed:', error);
    }
  }

  /**
   * Utility methods
   */
  private transformData(sourceData: any, transform: DataTransform): any {
    const result: any = {};
    
    for (const rule of transform.transformationRules) {
      let value = sourceData[rule.sourceField];
      
      // Apply default if value is missing
      if (value === undefined || value === null) {
        if (rule.default !== undefined) {
          value = rule.default;
        } else if (rule.required) {
          throw new Error(`Required field '${rule.field}' is missing from source data`);
        } else {
          continue;
        }
      }
      
      // Apply transformation
      if (rule.transform) {
        switch (rule.transform) {
          case 'parseInt':
            value = parseInt(value, 10);
            break;
          case 'parseDateTime':
            value = new Date(value).toISOString();
            break;
          // Add more transformations as needed
        }
      }
      
      result[rule.field] = value;
    }
    
    return result;
  }

  private async isRateLimited(source: string): Promise<boolean> {
    const now = Date.now();
    const limiter = this.rateLimiters.get(source);
    
    if (!limiter || now > limiter.resetTime) {
      // Reset rate limiter
      this.rateLimiters.set(source, {
        count: 1,
        resetTime: now + (60 * 1000) // 1 minute
      });
      return false;
    }
    
    if (limiter.count >= 100) { // Max 100 operations per minute
      return true;
    }
    
    limiter.count++;
    return false;
  }

  private shouldRetry(error: any): boolean {
    // Retry on temporary failures, but not on validation errors
    const retryableCodes = [429, 500, 502, 503, 504];
    return retryableCodes.includes(error.code) || error.message.includes('timeout');
  }

  /**
   * Status and monitoring methods
   */
  getBatchStatus(batchId: string): SyncBatch | undefined {
    return this.syncQueue.get(batchId);
  }

  getActiveJobs(): string[] {
    return Array.from(this.activeJobs.keys());
  }

  getQueueStats(): { pending: number; processing: number; total: number } {
    const batches = Array.from(this.syncQueue.values());
    return {
      pending: batches.filter(b => b.status === 'pending').length,
      processing: batches.filter(b => b.status === 'processing').length,
      total: batches.length
    };
  }
}

// Export singleton instance
export const syncSystem = new CentralSyncSystem();