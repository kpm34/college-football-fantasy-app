/**
 * Manual Override Manager
 * 
 * Provides tools for creating, managing, and validating manual overrides
 * that take precedence over all automated data sources. Supports:
 * - Temporal validity (effective dates)
 * - Field-level granular overrides
 * - Approval workflows for sensitive changes
 * - Audit trails and rollback capabilities
 */

import { ManualOverride, DataSource, InjuryStatus } from '../schemas/database-schema';
import { serverDatabases as databases, DATABASE_ID } from '../../../lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export interface CreateOverrideRequest {
  player_id: string;
  field_name: string;
  override_value: any;
  season: number;
  week?: number; // 0 = season-wide override
  effective_from?: string; // ISO timestamp
  expires_at?: string; // ISO timestamp
  reason: string;
  created_by: string;
  approval_required?: boolean;
}

export interface OverrideBatchRequest {
  overrides: CreateOverrideRequest[];
  batch_reason: string;
  created_by: string;
}

export interface OverrideValidation {
  is_valid: boolean;
  field_type: 'string' | 'number' | 'boolean' | 'enum';
  valid_range?: [number, number];
  valid_values?: string[];
  current_value?: any;
  errors: string[];
  warnings: string[];
}

export interface OverrideSearchFilters {
  player_id?: string;
  field_name?: string;
  season?: number;
  week?: number;
  is_active?: boolean;
  created_by?: string;
  needs_approval?: boolean;
  limit?: number;
  offset?: number;
}

export interface OverrideStats {
  total_overrides: number;
  active_overrides: number;
  pending_approval: number;
  overrides_by_field: Record<string, number>;
  overrides_by_week: Record<number, number>;
  recent_activity: number; // overrides created in last 24h
}

export class ManualOverrideManager {
  private readonly SUPPORTED_FIELDS = {
    // Depth chart fields
    'depth_chart_rank': { type: 'number', range: [1, 10] },
    'starter_prob': { type: 'number', range: [0, 1] },
    'snap_share_proj': { type: 'number', range: [0, 1] },
    
    // Injury fields
    'injury_status': { type: 'enum', values: ['OUT', 'QUESTIONABLE', 'ACTIVE'] },
    'injury_note': { type: 'string' },
    
    // Usage trends
    'usage_1w_snap_pct': { type: 'number', range: [0, 1] },
    'usage_4w_snap_pct': { type: 'number', range: [0, 1] },
    'usage_1w_route_pct': { type: 'number', range: [0, 1] },
    'usage_4w_route_pct': { type: 'number', range: [0, 1] },
    'usage_1w_carry_share': { type: 'number', range: [0, 1] },
    'usage_4w_carry_share': { type: 'number', range: [0, 1] },
    'usage_1w_target_share': { type: 'number', range: [0, 1] },
    'usage_4w_target_share': { type: 'number', range: [0, 1] },
    
    // Prior season data
    'prior_season_target_share': { type: 'number', range: [0, 1] },
    'prior_season_carry_share': { type: 'number', range: [0, 1] },
    'prior_season_yards_share': { type: 'number', range: [0, 1] },
    'prior_season_td_share': { type: 'number', range: [0, 1] }
  };

  private readonly APPROVAL_REQUIRED_FIELDS = [
    'depth_chart_rank',
    'starter_prob',
    'injury_status'
  ];

  /**
   * Create a single manual override
   */
  async createOverride(request: CreateOverrideRequest): Promise<{
    success: boolean;
    override_id?: string;
    needs_approval: boolean;
    errors: string[];
  }> {
    console.log(`[ManualOverrideManager] Creating override for ${request.player_id}.${request.field_name}`);

    try {
      // Validate the override request
      const validation = await this.validateOverride(request);
      if (!validation.is_valid) {
        return {
          success: false,
          needs_approval: false,
          errors: validation.errors
        };
      }

      // Check if approval is required
      const needsApproval = request.approval_required || 
                           this.APPROVAL_REQUIRED_FIELDS.includes(request.field_name);

      // Check for existing overrides for the same field
      const existingOverride = await this.getExistingOverride(
        request.player_id,
        request.field_name,
        request.season,
        request.week || 0
      );

      if (existingOverride) {
        // Deactivate existing override
        await this.deactivateOverride(existingOverride.$id, request.created_by, 'Replaced by new override');
      }

      // Create the override record
      const overrideDoc = {
        player_id: request.player_id,
        field_name: request.field_name,
        override_value: this.serializeValue(request.override_value),
        season: request.season,
        week: request.week || 0,
        effective_from: request.effective_from || new Date().toISOString(),
        expires_at: request.expires_at || null,
        reason: request.reason,
        created_by: request.created_by,
        is_active: !needsApproval, // Pending approval if required
        needs_approval: needsApproval,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        'manual_overrides',
        ID.unique(),
        overrideDoc
      );

      // Log the override creation
      await this.logOverrideActivity(response.$id, 'created', request.created_by, request.reason);

      console.log(`[ManualOverrideManager] Override created: ${response.$id}${needsApproval ? ' (pending approval)' : ''}`);

      return {
        success: true,
        override_id: response.$id,
        needs_approval: needsApproval,
        errors: validation.warnings
      };

    } catch (error) {
      console.error('[ManualOverrideManager] Failed to create override:', error);
      return {
        success: false,
        needs_approval: false,
        errors: [`Failed to create override: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Create multiple overrides in a batch
   */
  async createOverrideBatch(request: OverrideBatchRequest): Promise<{
    success: boolean;
    created_overrides: string[];
    failed_overrides: Array<{ index: number; errors: string[] }>;
    pending_approval: string[];
  }> {
    console.log(`[ManualOverrideManager] Creating batch of ${request.overrides.length} overrides`);

    const createdOverrides: string[] = [];
    const pendingApproval: string[] = [];
    const failedOverrides: Array<{ index: number; errors: string[] }> = [];

    for (let i = 0; i < request.overrides.length; i++) {
      const overrideRequest = request.overrides[i];
      
      try {
        const result = await this.createOverride(overrideRequest);
        
        if (result.success && result.override_id) {
          createdOverrides.push(result.override_id);
          
          if (result.needs_approval) {
            pendingApproval.push(result.override_id);
          }
        } else {
          failedOverrides.push({
            index: i,
            errors: result.errors
          });
        }

      } catch (error) {
        failedOverrides.push({
          index: i,
          errors: [`Batch creation failed: ${error instanceof Error ? error.message : String(error)}`]
        });
      }
    }

    // Log batch operation
    await this.logBatchActivity(
      request.batch_reason,
      request.created_by,
      createdOverrides.length,
      failedOverrides.length
    );

    return {
      success: failedOverrides.length < request.overrides.length,
      created_overrides: createdOverrides,
      failed_overrides: failedOverrides,
      pending_approval: pendingApproval
    };
  }

  /**
   * Approve a pending override
   */
  async approveOverride(
    overrideId: string,
    approvedBy: string,
    approvalNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const override = await this.getOverrideById(overrideId);
      
      if (!override) {
        return { success: false, error: 'Override not found' };
      }

      if (!override.needs_approval) {
        return { success: false, error: 'Override does not require approval' };
      }

      if (override.approved_at) {
        return { success: false, error: 'Override already approved' };
      }

      // Update override to approved status
      await databases.updateDocument(
        DATABASE_ID,
        'manual_overrides',
        overrideId,
        {
          is_active: true,
          needs_approval: false,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      // Log approval
      await this.logOverrideActivity(overrideId, 'approved', approvedBy, approvalNotes);

      console.log(`[ManualOverrideManager] Override ${overrideId} approved by ${approvedBy}`);
      
      return { success: true };

    } catch (error) {
      console.error('[ManualOverrideManager] Failed to approve override:', error);
      return { 
        success: false, 
        error: `Approval failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Reject a pending override
   */
  async rejectOverride(
    overrideId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Deactivate the override
      await this.deactivateOverride(overrideId, rejectedBy, `Rejected: ${rejectionReason}`);
      
      return { success: true };

    } catch (error) {
      console.error('[ManualOverrideManager] Failed to reject override:', error);
      return { 
        success: false, 
        error: `Rejection failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Deactivate an override
   */
  async deactivateOverride(
    overrideId: string,
    deactivatedBy: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'manual_overrides',
        overrideId,
        {
          is_active: false,
          deactivated_by: deactivatedBy,
          deactivated_at: new Date().toISOString(),
          deactivation_reason: reason,
          updated_at: new Date().toISOString()
        }
      );

      await this.logOverrideActivity(overrideId, 'deactivated', deactivatedBy, reason);

      console.log(`[ManualOverrideManager] Override ${overrideId} deactivated`);
      
      return { success: true };

    } catch (error) {
      console.error('[ManualOverrideManager] Failed to deactivate override:', error);
      return { 
        success: false, 
        error: `Deactivation failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Search and filter overrides
   */
  async searchOverrides(filters: OverrideSearchFilters): Promise<{
    overrides: ManualOverride[];
    total_count: number;
    has_more: boolean;
  }> {
    try {
      const queries: any[] = [];
      
      if (filters.player_id) queries.push(Query.equal('player_id', filters.player_id));
      if (filters.field_name) queries.push(Query.equal('field_name', filters.field_name));
      if (filters.season !== undefined) queries.push(Query.equal('season', filters.season));
      if (filters.week !== undefined) queries.push(Query.equal('week', filters.week));
      if (filters.is_active !== undefined) queries.push(Query.equal('is_active', filters.is_active));
      if (filters.created_by) queries.push(Query.equal('created_by', filters.created_by));
      if (filters.needs_approval !== undefined) queries.push(Query.equal('needs_approval', filters.needs_approval));

      queries.push(Query.orderDesc('created_at'));
      queries.push(Query.limit(filters.limit || 50));
      
      if (filters.offset) {
        queries.push(Query.offset(filters.offset));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        'manual_overrides',
        queries
      );

      return {
        overrides: response.documents as ManualOverride[],
        total_count: response.total,
        has_more: response.documents.length === (filters.limit || 50)
      };

    } catch (error) {
      console.error('[ManualOverrideManager] Search failed:', error);
      return {
        overrides: [],
        total_count: 0,
        has_more: false
      };
    }
  }

  /**
   * Get override statistics
   */
  async getOverrideStats(season: number): Promise<OverrideStats> {
    try {
      // Get all overrides for the season
      const allOverrides = await databases.listDocuments(
        DATABASE_ID,
        'manual_overrides',
        [Query.equal('season', season), Query.limit(5000)]
      );

      const overrides = allOverrides.documents;
      
      const stats: OverrideStats = {
        total_overrides: overrides.length,
        active_overrides: overrides.filter((o: any) => o.is_active).length,
        pending_approval: overrides.filter((o: any) => o.needs_approval && !o.approved_at).length,
        overrides_by_field: {},
        overrides_by_week: {},
        recent_activity: 0
      };

      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const override of overrides) {
        const doc = override as any;
        
        // Count by field
        stats.overrides_by_field[doc.field_name] = (stats.overrides_by_field[doc.field_name] || 0) + 1;
        
        // Count by week
        stats.overrides_by_week[doc.week] = (stats.overrides_by_week[doc.week] || 0) + 1;
        
        // Count recent activity
        if (new Date(doc.created_at) > dayAgo) {
          stats.recent_activity++;
        }
      }

      return stats;

    } catch (error) {
      console.error('[ManualOverrideManager] Failed to get stats:', error);
      return {
        total_overrides: 0,
        active_overrides: 0,
        pending_approval: 0,
        overrides_by_field: {},
        overrides_by_week: {},
        recent_activity: 0
      };
    }
  }

  /**
   * Validate an override request
   */
  async validateOverride(request: CreateOverrideRequest): Promise<OverrideValidation> {
    const validation: OverrideValidation = {
      is_valid: true,
      field_type: 'string',
      errors: [],
      warnings: []
    };

    // Check if field is supported
    const fieldConfig = this.SUPPORTED_FIELDS[request.field_name as keyof typeof this.SUPPORTED_FIELDS];
    if (!fieldConfig) {
      validation.is_valid = false;
      validation.errors.push(`Unsupported field: ${request.field_name}`);
      return validation;
    }

    validation.field_type = fieldConfig.type as any;
    if (fieldConfig.range) validation.valid_range = fieldConfig.range;
    if (fieldConfig.values) validation.valid_values = fieldConfig.values;

    // Validate value type and range
    const valueValidation = this.validateFieldValue(request.override_value, fieldConfig);
    if (!valueValidation.valid) {
      validation.is_valid = false;
      validation.errors.push(valueValidation.error!);
    }

    // Check temporal validity
    if (request.effective_from && request.expires_at) {
      const effectiveDate = new Date(request.effective_from);
      const expirationDate = new Date(request.expires_at);
      
      if (expirationDate <= effectiveDate) {
        validation.is_valid = false;
        validation.errors.push('Expiration date must be after effective date');
      }
    }

    // Validate player exists
    try {
      const player = await this.validatePlayerExists(request.player_id);
      if (!player) {
        validation.is_valid = false;
        validation.errors.push(`Player not found: ${request.player_id}`);
      }
    } catch (error) {
      validation.warnings.push('Could not validate player existence');
    }

    // Check for conflicting overrides
    try {
      const conflicting = await this.getExistingOverride(
        request.player_id,
        request.field_name,
        request.season,
        request.week || 0
      );
      
      if (conflicting) {
        validation.warnings.push(`Will replace existing override: ${conflicting.$id}`);
      }
    } catch (error) {
      validation.warnings.push('Could not check for conflicting overrides');
    }

    return validation;
  }

  private validateFieldValue(value: any, fieldConfig: any): { valid: boolean; error?: string } {
    switch (fieldConfig.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { valid: false, error: 'Value must be a number' };
        }
        
        if (fieldConfig.range && (num < fieldConfig.range[0] || num > fieldConfig.range[1])) {
          return { valid: false, error: `Value must be between ${fieldConfig.range[0]} and ${fieldConfig.range[1]}` };
        }
        
        return { valid: true };
        
      case 'enum':
        if (!fieldConfig.values.includes(value)) {
          return { valid: false, error: `Value must be one of: ${fieldConfig.values.join(', ')}` };
        }
        return { valid: true };
        
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: 'Value must be true or false' };
        }
        return { valid: true };
        
      case 'string':
        if (typeof value !== 'string' || value.trim().length === 0) {
          return { valid: false, error: 'Value must be a non-empty string' };
        }
        return { valid: true };
        
      default:
        return { valid: true };
    }
  }

  private async validatePlayerExists(playerId: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'college_players',
        [Query.equal('$id', playerId), Query.limit(1)]
      );
      
      return response.documents.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async getExistingOverride(
    playerId: string,
    fieldName: string,
    season: number,
    week: number
  ): Promise<any | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'manual_overrides',
        [
          Query.equal('player_id', playerId),
          Query.equal('field_name', fieldName),
          Query.equal('season', season),
          Query.equal('week', week),
          Query.equal('is_active', true),
          Query.limit(1)
        ]
      );

      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      return null;
    }
  }

  private async getOverrideById(overrideId: string): Promise<any | null> {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        'manual_overrides',
        overrideId
      );
    } catch (error) {
      return null;
    }
  }

  private serializeValue(value: any): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private async logOverrideActivity(
    overrideId: string,
    action: string,
    userId: string,
    notes?: string
  ): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'ingestion_log',
        ID.unique(),
        {
          override_id: overrideId,
          operation: `override_${action}`,
          status: 'success',
          user_id: userId,
          notes: notes || '',
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('[ManualOverrideManager] Failed to log activity:', error);
    }
  }

  private async logBatchActivity(
    reason: string,
    userId: string,
    successCount: number,
    failCount: number
  ): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'ingestion_log',
        ID.unique(),
        {
          operation: 'override_batch',
          status: failCount === 0 ? 'success' : 'partial',
          user_id: userId,
          notes: `Batch operation: ${successCount} created, ${failCount} failed. Reason: ${reason}`,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.warn('[ManualOverrideManager] Failed to log batch activity:', error);
    }
  }
}