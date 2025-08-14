import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { CFBDSync } from './cfbd-sync';
// Temporarily disable Rotowire sync to fix deployment
// import { RotowireSync } from './rotowire-sync';
import { ID, Query } from 'appwrite';

export interface SyncResult {
  source: string;
  success: boolean;
  created: number;
  updated: number;
  errors: number;
  duration: number;
  details?: any;
}

export interface SyncOptions {
  season?: number;
  week?: number;
  forceUpdate?: boolean;
  sources?: string[];
}

export class DataSyncManager {
  private syncers: Map<string, any> = new Map();
  
  constructor() {
    // Register all data syncers
    this.syncers.set('cfbd', new CFBDSync());
    // Temporarily disable Rotowire sync to fix deployment
    // this.syncers.set('rotowire', new RotowireSync());
  }
  
  /**
   * Sync all data sources
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const sources = options.sources || Array.from(this.syncers.keys());
    
    console.log(`🏈 Starting data sync for sources: ${sources.join(', ')}`);
    
    for (const source of sources) {
      const syncer = this.syncers.get(source);
      if (!syncer) {
        console.warn(`Unknown data source: ${source}`);
        continue;
      }
      
      const startTime = Date.now();
      try {
        const result = await syncer.sync(options);
        results.push({
          source,
          success: true,
          created: result.created || 0,
          updated: result.updated || 0,
          errors: result.errors || 0,
          duration: Date.now() - startTime,
          details: result
        });
      } catch (error: any) {
        console.error(`Error syncing ${source}:`, error);
        results.push({
          source,
          success: false,
          created: 0,
          updated: 0,
          errors: 1,
          duration: Date.now() - startTime,
          details: { error: error.message }
        });
      }
    }
    
    // Log sync results to Appwrite
    await this.logSyncResults(results);
    
    return results;
  }
  
  /**
   * Sync specific data type
   */
  async syncSource(source: string, options: SyncOptions = {}): Promise<SyncResult> {
    const syncer = this.syncers.get(source);
    if (!syncer) {
      throw new Error(`Unknown data source: ${source}`);
    }
    
    const startTime = Date.now();
    try {
      const result = await syncer.sync(options);
      const syncResult: SyncResult = {
        source,
        success: true,
        created: result.created || 0,
        updated: result.updated || 0,
        errors: result.errors || 0,
        duration: Date.now() - startTime,
        details: result
      };
      
      await this.logSyncResults([syncResult]);
      return syncResult;
      
    } catch (error: any) {
      const syncResult: SyncResult = {
        source,
        success: false,
        created: 0,
        updated: 0,
        errors: 1,
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
      
      await this.logSyncResults([syncResult]);
      throw error;
    }
  }
  
  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<any> {
    try {
      const logs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOG,
        [
          Query.equal('type', 'data_sync'),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );
      
      // Group by source
      const statusBySource: Record<string, any> = {};
      
      logs.documents.forEach(log => {
        const source = log.details?.source;
        if (!source) return;
        
        if (!statusBySource[source]) {
          statusBySource[source] = {
            lastSync: log.$createdAt,
            lastSuccess: log.details?.success ? log.$createdAt : null,
            totalSyncs: 0,
            successCount: 0,
            errorCount: 0,
            avgDuration: 0
          };
        }
        
        statusBySource[source].totalSyncs++;
        if (log.details?.success) {
          statusBySource[source].successCount++;
          if (!statusBySource[source].lastSuccess || log.$createdAt > statusBySource[source].lastSuccess) {
            statusBySource[source].lastSuccess = log.$createdAt;
          }
        } else {
          statusBySource[source].errorCount++;
        }
        
        statusBySource[source].avgDuration = 
          (statusBySource[source].avgDuration * (statusBySource[source].totalSyncs - 1) + log.details?.duration) / 
          statusBySource[source].totalSyncs;
      });
      
      return statusBySource;
      
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {};
    }
  }
  
  /**
   * Log sync results to activity log
   */
  private async logSyncResults(results: SyncResult[]): Promise<void> {
    try {
      for (const result of results) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ACTIVITY_LOG,
          ID.unique(),
          {
            type: 'data_sync',
            action: `sync_${result.source}`,
            userId: 'system',
            details: result,
            createdAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Error logging sync results:', error);
    }
  }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager();
