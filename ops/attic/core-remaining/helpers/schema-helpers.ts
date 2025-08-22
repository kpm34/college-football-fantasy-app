/**
 * SCHEMA HELPER UTILITIES
 * 
 * Comprehensive helpers for permissions, indexes, functions, and storage management.
 * These utilities make it easy to work with our schema definitions programmatically.
 */

import { Permission, Role } from 'node-appwrite';
import { PERMISSIONS_SCHEMA, type CollectionPermissions, type UserRole, ROLE_HIERARCHY } from '../../schema/permissions';
import { INDEX_SCHEMA, type CompoundIndex, type IndexProfile } from '../../schema/indexes';
import { FUNCTIONS_SCHEMA, type AppwriteFunction, DEPLOYMENT_ORDER } from '../../schema/functions';
import { STORAGE_SCHEMA, type StorageBucket, BUCKET_POLICIES } from '../../schema/storage';

/**
 * PERMISSION HELPERS
 */
export class PermissionHelper {
  /**
   * Convert our permission schema to Appwrite Permission objects
   */
  static buildAppwritePermissions(collectionId: string): string[] {
    const collectionPermissions = PERMISSIONS_SCHEMA[collectionId];
    if (!collectionPermissions) {
      throw new Error(`No permissions defined for collection: ${collectionId}`);
    }

    const permissions: string[] = [];

    for (const rule of collectionPermissions.rules) {
      for (const action of rule.actions) {
        if (action === 'read') {
          if (rule.role === 'guest') {
            permissions.push(Permission.read(Role.any()));
          } else {
            permissions.push(Permission.read(Role.label(rule.role)));
          }
        } else {
          // write covers create, update, delete
          if (rule.role === 'guest') {
            permissions.push(Permission.write(Role.any()));
          } else {
            permissions.push(Permission.write(Role.label(rule.role)));
          }
        }

        // Add ownership-based permissions
        if (rule.conditions?.ownership) {
          if (action === 'read') {
            permissions.push(Permission.read(Role.user('self')));
          } else {
            permissions.push(Permission.write(Role.user('self')));
          }
        }
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Check if a user role has permission for an action on a collection
   */
  static hasPermission(
    collectionId: string,
    userRole: UserRole,
    action: 'read' | 'write' | 'create' | 'update' | 'delete',
    context?: {
      isOwner?: boolean;
      isMember?: boolean;
      resourceStatus?: string;
    }
  ): boolean {
    const collectionPermissions = PERMISSIONS_SCHEMA[collectionId];
    if (!collectionPermissions) return false;

    for (const rule of collectionPermissions.rules) {
      if (rule.role === userRole && rule.actions.includes(action)) {
        // Check conditions
        if (rule.conditions?.ownership && !context?.isOwner) {
          continue;
        }
        if (rule.conditions?.membership && !context?.isMember) {
          continue;
        }
        if (rule.conditions?.status && context?.resourceStatus) {
          if (!rule.conditions.status.includes(context.resourceStatus)) {
            continue;
          }
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Get the minimum role required for an action
   */
  static getMinimumRole(
    collectionId: string,
    action: 'read' | 'write' | 'create' | 'update' | 'delete'
  ): UserRole | null {
    const collectionPermissions = PERMISSIONS_SCHEMA[collectionId];
    if (!collectionPermissions) return null;

    let minimumRole: UserRole | null = null;
    let minimumLevel = Infinity;

    for (const rule of collectionPermissions.rules) {
      if (rule.actions.includes(action)) {
        const roleLevel = ROLE_HIERARCHY[rule.role];
        if (roleLevel < minimumLevel) {
          minimumLevel = roleLevel;
          minimumRole = rule.role;
        }
      }
    }

    return minimumRole;
  }

  /**
   * Generate role-based middleware for API routes
   */
  static generateMiddleware(
    collectionId: string,
    action: 'read' | 'write' | 'create' | 'update' | 'delete'
  ): string {
    const minRole = this.getMinimumRole(collectionId, action);
    if (!minRole) return 'throw new Error("No permissions defined");';

    return `
      // Auto-generated permission check for ${collectionId}:${action}
      const requiredRole = '${minRole}';
      const userRole = await getUserRole(userId);
      if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
        throw new Error('Insufficient permissions');
      }
    `;
  }
}

/**
 * INDEX HELPERS
 */
export class IndexHelper {
  /**
   * Get all indexes for a collection sorted by priority
   */
  static getCollectionIndexes(collectionId: string): CompoundIndex[] {
    const profile = INDEX_SCHEMA[collectionId];
    if (!profile) return [];

    const allIndexes = [...profile.compoundIndexes, ...profile.singleIndexes];
    
    // Sort by estimated usage (high first)
    return allIndexes.sort((a, b) => {
      const usageOrder = { high: 0, medium: 1, low: 2 };
      return usageOrder[a.estimatedUsage] - usageOrder[b.estimatedUsage];
    });
  }

  /**
   * Find the best index for a query pattern
   */
  static findOptimalIndex(collectionId: string, queryPattern: string): CompoundIndex | null {
    const indexes = this.getCollectionIndexes(collectionId);
    
    // Find index that matches the query pattern
    for (const index of indexes) {
      for (const pattern of index.queryPatterns) {
        if (this.queryMatchesPattern(queryPattern, pattern)) {
          return index;
        }
      }
    }

    return null;
  }

  /**
   * Generate index creation commands for a collection
   */
  static generateIndexCommands(collectionId: string): string[] {
    const indexes = this.getCollectionIndexes(collectionId);
    const commands: string[] = [];

    for (const index of indexes) {
      const ordersParam = index.orders ? `, ${JSON.stringify(index.orders)}` : '';
      
      commands.push(
        `await db.createIndex('${process.env.APPWRITE_DATABASE_ID}', '${collectionId}', '${index.key}', '${index.type}', ${JSON.stringify(index.attributes)}${ordersParam});`
      );
    }

    return commands;
  }

  /**
   * Analyze query performance and suggest optimizations
   */
  static analyzeQuery(
    collectionId: string,
    filters: Record<string, any>,
    orderBy?: string,
    limit?: number
  ): {
    hasOptimalIndex: boolean;
    suggestedIndexes: CompoundIndex[];
    estimatedPerformance: 'excellent' | 'good' | 'poor';
    recommendations: string[];
  } {
    const profile = INDEX_SCHEMA[collectionId];
    if (!profile) {
      return {
        hasOptimalIndex: false,
        suggestedIndexes: [],
        estimatedPerformance: 'poor',
        recommendations: ['Collection not found in index schema']
      };
    }

    const filterKeys = Object.keys(filters);
    const recommendations: string[] = [];
    let hasOptimalIndex = false;
    const suggestedIndexes: CompoundIndex[] = [];

    // Check for exact index matches
    for (const index of [...profile.compoundIndexes, ...profile.singleIndexes]) {
      const indexMatches = filterKeys.every(key => index.attributes.includes(key));
      if (indexMatches) {
        hasOptimalIndex = true;
        break;
      }

      // Partial matches
      if (filterKeys.some(key => index.attributes.includes(key))) {
        suggestedIndexes.push(index);
      }
    }

    // Performance estimation
    let estimatedPerformance: 'excellent' | 'good' | 'poor';
    if (hasOptimalIndex) {
      estimatedPerformance = 'excellent';
    } else if (suggestedIndexes.length > 0) {
      estimatedPerformance = 'good';
      recommendations.push('Consider adding compound index for optimal performance');
    } else {
      estimatedPerformance = 'poor';
      recommendations.push('No suitable indexes found - query will be slow');
      recommendations.push(`Consider adding index on: [${filterKeys.join(', ')}]`);
    }

    // Specific recommendations
    if (orderBy && !hasOptimalIndex) {
      recommendations.push(`Add index with ordering on '${orderBy}' field`);
    }
    if (limit && limit > 1000) {
      recommendations.push('Large limit may impact performance - consider pagination');
    }

    return {
      hasOptimalIndex,
      suggestedIndexes,
      estimatedPerformance,
      recommendations
    };
  }

  private static queryMatchesPattern(query: string, pattern: string): boolean {
    // Simple pattern matching - could be enhanced with regex
    const queryNormalized = query.toLowerCase().replace(/\s+/g, ' ').trim();
    const patternNormalized = pattern.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Check for key words in common
    const queryWords = queryNormalized.split(' ');
    const patternWords = patternNormalized.split(' ');
    
    return patternWords.some(word => queryWords.includes(word));
  }
}

/**
 * FUNCTION HELPERS
 */
export class FunctionHelper {
  /**
   * Get functions that should be deployed in order
   */
  static getDeploymentOrder(): AppwriteFunction[] {
    return DEPLOYMENT_ORDER.map(id => FUNCTIONS_SCHEMA[id]).filter(Boolean);
  }

  /**
   * Get functions by trigger type
   */
  static getFunctionsByTrigger(triggerType: 'http' | 'schedule' | 'database' | 'storage'): AppwriteFunction[] {
    return Object.values(FUNCTIONS_SCHEMA).filter(func => func.trigger.type === triggerType);
  }

  /**
   * Get critical functions that must be monitored
   */
  static getCriticalFunctions(): AppwriteFunction[] {
    return Object.values(FUNCTIONS_SCHEMA).filter(func => func.priority === 'high');
  }

  /**
   * Generate function deployment script
   */
  static generateDeploymentScript(): string[] {
    const commands: string[] = [];
    const functions = this.getDeploymentOrder();

    for (const func of functions) {
      commands.push(`
        // Deploy ${func.name}
        try {
          await functions.create(
            '${func.functionId}',
            '${func.name}',
            '${func.runtime}',
            ['${func.permissions.execute.join("', '")}'],
            ['${func.trigger.events?.join("', '") || ''}'],
            '${func.trigger.schedule || ''}',
            ${func.execution.timeout},
            ${func.enabled}
          );
          
          // Set variables
          ${func.variables.map(v => `
          await functions.createVariable('${func.functionId}', '${v.key}', '${v.value}');
          `).join('')}
          
          console.log('✅ Deployed ${func.name}');
        } catch (error) {
          console.error('❌ Failed to deploy ${func.name}:', error);
        }
      `);
    }

    return commands;
  }

  /**
   * Validate function configuration
   */
  static validateFunctionConfig(functionId: string): { valid: boolean; errors: string[] } {
    const func = FUNCTIONS_SCHEMA[functionId];
    const errors: string[] = [];

    if (!func) {
      return { valid: false, errors: ['Function not found'] };
    }

    // Check required variables
    for (const variable of func.variables) {
      if (variable.required && !variable.value) {
        errors.push(`Missing required variable: ${variable.key}`);
      }
    }

    // Check execution settings
    if (func.execution.timeout > 900) {
      errors.push('Timeout cannot exceed 15 minutes');
    }
    if (func.execution.memory > 1024) {
      errors.push('Memory cannot exceed 1GB');
    }

    // Check schedule format for scheduled functions
    if (func.trigger.type === 'schedule' && func.trigger.schedule) {
      if (!this.isValidCronExpression(func.trigger.schedule)) {
        errors.push('Invalid cron expression');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private static isValidCronExpression(expression: string): boolean {
    // Basic cron validation - 5 or 6 parts
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
  }
}

/**
 * STORAGE HELPERS
 */
export class StorageHelper {
  /**
   * Get bucket configuration
   */
  static getBucket(bucketId: string): StorageBucket | null {
    return STORAGE_SCHEMA[bucketId] || null;
  }

  /**
   * Validate file upload against bucket rules
   */
  static validateUpload(
    bucketId: string,
    fileName: string,
    fileSize: number,
    userRole: UserRole
  ): { valid: boolean; errors: string[] } {
    const bucket = this.getBucket(bucketId);
    const errors: string[] = [];

    if (!bucket) {
      return { valid: false, errors: ['Bucket not found'] };
    }

    // Check permissions
    if (!bucket.permissions.write.includes(`role:${userRole}`) && !bucket.permissions.write.includes('any')) {
      errors.push('Insufficient upload permissions');
    }

    // Check file size
    if (fileSize > bucket.settings.maximumFileSize) {
      errors.push(`File size exceeds maximum ${bucket.settings.maximumFileSize} bytes`);
    }

    // Check file extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension && !bucket.settings.allowedFileExtensions.includes(extension)) {
      errors.push(`File type .${extension} not allowed`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate bucket creation commands
   */
  static generateBucketCommands(): string[] {
    const commands: string[] = [];

    for (const bucket of Object.values(STORAGE_SCHEMA)) {
      commands.push(`
        // Create ${bucket.name}
        try {
          await storage.createBucket(
            '${bucket.bucketId}',
            '${bucket.name}',
            ['${bucket.permissions.read.join("', '")}'],
            ['${bucket.permissions.write.join("', '")}'],
            ['${bucket.permissions.delete.join("', '")}'],
            ${bucket.settings.encryption || false},
            ${bucket.settings.antivirus || false},
            ${bucket.settings.maximumFileSize},
            ['${bucket.settings.allowedFileExtensions.join("', '")}']
          );
          console.log('✅ Created bucket ${bucket.name}');
        } catch (error) {
          console.error('❌ Failed to create ${bucket.name}:', error);
        }
      `);
    }

    return commands;
  }

  /**
   * Generate file naming based on bucket conventions
   */
  static generateFileName(bucketId: string, context: Record<string, string>): string {
    const convention = BUCKET_POLICIES.naming[bucketId as keyof typeof BUCKET_POLICIES.naming];
    if (!convention) return `file-${Date.now()}`;

    let fileName = convention;
    for (const [key, value] of Object.entries(context)) {
      fileName = fileName.replace(`{${key}}`, value);
    }

    // Replace {timestamp} if not provided
    fileName = fileName.replace('{timestamp}', Date.now().toString());

    return fileName;
  }

  /**
   * Check user storage quota
   */
  static checkQuota(userRole: UserRole, currentUsage: { files: number; bytes: number }): {
    withinQuota: boolean;
    dailyLimit: number;
    totalLimit: number;
    usage: { files: number; bytes: number };
  } {
    const quota = BUCKET_POLICIES.quotas[`role:${userRole}` as keyof typeof BUCKET_POLICIES.quotas] ||
                  BUCKET_POLICIES.quotas['role:user'];

    return {
      withinQuota: currentUsage.files <= quota.daily && currentUsage.bytes <= quota.total,
      dailyLimit: quota.daily,
      totalLimit: quota.total,
      usage: currentUsage
    };
  }
}

/**
 * UNIFIED SCHEMA HELPER
 */
export class SchemaHelper {
  static permissions = PermissionHelper;
  static indexes = IndexHelper;
  static functions = FunctionHelper;
  static storage = StorageHelper;

  /**
   * Validate entire system configuration
   */
  static validateSystemConfiguration(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate permissions
    for (const [collectionId] of Object.entries(PERMISSIONS_SCHEMA)) {
      try {
        PermissionHelper.buildAppwritePermissions(collectionId);
      } catch (error: any) {
        errors.push(`Permission error in ${collectionId}: ${error.message}`);
      }
    }

    // Validate functions
    for (const [functionId] of Object.entries(FUNCTIONS_SCHEMA)) {
      const validation = FunctionHelper.validateFunctionConfig(functionId);
      if (!validation.valid) {
        errors.push(...validation.errors.map(e => `Function ${functionId}: ${e}`));
      }
    }

    // Check for missing indexes on high-usage collections
    const highUsageCollections = ['college_players', 'user_teams', 'games', 'leagues'];
    for (const collectionId of highUsageCollections) {
      const indexes = IndexHelper.getCollectionIndexes(collectionId);
      if (indexes.length === 0) {
        warnings.push(`No indexes defined for high-usage collection: ${collectionId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate complete deployment script
   */
  static generateFullDeployment(): string {
    const commands: string[] = [
      '// Auto-generated Appwrite deployment script',
      '// Run this script to deploy complete infrastructure',
      '',
      'import { Client, Databases, Functions, Storage } from "node-appwrite";',
      '',
      'const client = new Client()',
      '  .setEndpoint(process.env.APPWRITE_ENDPOINT)',
      '  .setProject(process.env.APPWRITE_PROJECT_ID)',
      '  .setKey(process.env.APPWRITE_API_KEY);',
      '',
      'const db = new Databases(client);',
      'const functions = new Functions(client);',
      'const storage = new Storage(client);',
      '',
      'async function deployInfrastructure() {',
      '  console.log("🚀 Starting infrastructure deployment...");',
      '',
      '  // Deploy storage buckets',
      ...StorageHelper.generateBucketCommands(),
      '',
      '  // Deploy functions',
      ...FunctionHelper.generateDeploymentScript(),
      '',
      '  console.log("✅ Infrastructure deployment complete!");',
      '}',
      '',
      'deployInfrastructure().catch(console.error);'
    ];

    return commands.join('\n');
  }
}

export {
  PermissionHelper,
  IndexHelper,
  FunctionHelper,
  StorageHelper,
  SchemaHelper as default
};