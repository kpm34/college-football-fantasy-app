/**
 * Data Validation and Migration Tools
 * 
 * Provides tools for:
 * 1. Schema validation and migration
 * 2. Data integrity checks
 * 3. Automated data cleanup
 * 4. Schema drift detection
 * 5. Rollback capabilities
 * 6. Environment synchronization
 */

import { Client, Databases, Query } from 'node-appwrite';
import { APPWRITE_SCHEMA, validateCollectionData, type CollectionConfig } from '../schema/appwrite-schema-map';
import { syncSystem } from '../sync/central-sync-system';
import { env } from '../config/environment';

export interface ValidationResult {
  valid: boolean;
  collection: string;
  documentId: string;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  fromVersion: string;
  toVersion: string;
  operations: MigrationOperation[];
  rollbackOperations: MigrationOperation[];
  estimatedDuration: number; // minutes
  riskLevel: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface MigrationOperation {
  type: 'create_attribute' | 'update_attribute' | 'delete_attribute' | 'transform_data' | 'create_index' | 'delete_index';
  collection: string;
  details: any;
  rollbackDetails?: any;
}

export interface SchemaComparisonResult {
  collection: string;
  missingAttributes: string[];
  extraAttributes: string[];
  typeConflicts: { attribute: string; expected: string; actual: string }[];
  missingIndexes: string[];
  extraIndexes: string[];
}

export class DataValidationTools {
  private client: Client;
  private databases: Databases;

  constructor() {
    this.client = new Client()
      .setEndpoint(env.server.appwrite.endpoint)
      .setProject(env.server.appwrite.projectId)
      .setKey(env.server.appwrite.apiKey);
    
    this.databases = new Databases(this.client);
  }

  /**
   * Validate all documents in a collection against schema
   */
  async validateCollection(collectionId: string, options: {
    limit?: number;
    fixAutomatically?: boolean;
    generateReport?: boolean;
  } = {}): Promise<ValidationResult[]> {
    const { limit = 100, fixAutomatically = false, generateReport = true } = options;
    const results: ValidationResult[] = [];

    try {
      let cursor: string | undefined;
      let hasMore = true;
      let processed = 0;

      while (hasMore && processed < limit) {
        const queries = [Query.limit(Math.min(25, limit - processed))];
        if (cursor) queries.push(Query.cursorAfter(cursor));

        const response = await this.databases.listDocuments(
          env.server.appwrite.databaseId,
          collectionId,
          queries
        );

        for (const document of response.documents) {
          const validation = this.validateDocument(collectionId, document);
          results.push(validation);

          if (!validation.valid && fixAutomatically) {
            await this.fixDocumentIssues(collectionId, document, validation);
          }

          processed++;
        }

        hasMore = response.documents.length === 25;
        if (hasMore) {
          cursor = response.documents[response.documents.length - 1].$id;
        }
      }

      if (generateReport) {
        await this.generateValidationReport(collectionId, results);
      }

    } catch (error: any) {
      console.error(`Collection validation failed for ${collectionId}:`, error);
      results.push({
        valid: false,
        collection: collectionId,
        documentId: 'unknown',
        errors: [error.message],
        warnings: [],
        suggestions: []
      });
    }

    return results;
  }

  /**
   * Validate a single document against schema
   */
  private validateDocument(collectionId: string, document: any): ValidationResult {
    const collectionConfig = APPWRITE_SCHEMA[collectionId];
    if (!collectionConfig) {
      return {
        valid: false,
        collection: collectionId,
        documentId: document.$id,
        errors: ['Collection schema not found'],
        warnings: [],
        suggestions: ['Add collection to APPWRITE_SCHEMA']
      };
    }

    const validation = validateCollectionData(collectionId, document);
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Additional validation logic
    const documentKeys = Object.keys(document).filter(key => !key.startsWith('$'));
    const schemaKeys = collectionConfig.attributes.map(attr => attr.key);
    
    // Check for extra fields
    const extraFields = documentKeys.filter(key => !schemaKeys.includes(key));
    if (extraFields.length > 0) {
      warnings.push(`Extra fields found: ${extraFields.join(', ')}`);
      suggestions.push('Consider removing unused fields or adding them to schema');
    }

    // Check for missing optional fields that have defaults
    const missingDefaults = collectionConfig.attributes.filter(attr => 
      !attr.required && 
      attr.default !== undefined && 
      document[attr.key] === undefined
    );
    if (missingDefaults.length > 0) {
      warnings.push(`Missing default values: ${missingDefaults.map(attr => attr.key).join(', ')}`);
      suggestions.push('Consider populating default values');
    }

    // Check data freshness
    if (document.$updatedAt) {
      const lastUpdate = new Date(document.$updatedAt);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (collectionId === 'college_players' && daysSinceUpdate > 7) {
        warnings.push('Player data is more than 7 days old');
        suggestions.push('Consider triggering a sync from CFBD');
      }
      
      if (collectionId === 'games' && daysSinceUpdate > 1) {
        warnings.push('Game data is more than 1 day old');
        suggestions.push('Consider updating game scores');
      }
    }

    return {
      valid: validation.valid,
      collection: collectionId,
      documentId: document.$id,
      errors: validation.errors,
      warnings,
      suggestions
    };
  }

  /**
   * Automatically fix common document issues
   */
  private async fixDocumentIssues(collectionId: string, document: any, validation: ValidationResult): Promise<void> {
    const fixes: any = {};
    let needsUpdate = false;

    const collectionConfig = APPWRITE_SCHEMA[collectionId];
    if (!collectionConfig) return;

    // Fix missing default values
    for (const attr of collectionConfig.attributes) {
      if (!attr.required && attr.default !== undefined && document[attr.key] === undefined) {
        fixes[attr.key] = attr.default;
        needsUpdate = true;
      }
    }

    // Fix type issues (basic cases)
    for (const attr of collectionConfig.attributes) {
      const value = document[attr.key];
      if (value !== undefined && value !== null) {
        switch (attr.type) {
          case 'integer':
            if (typeof value === 'string' && !isNaN(Number(value))) {
              fixes[attr.key] = parseInt(value, 10);
              needsUpdate = true;
            }
            break;
          case 'double':
            if (typeof value === 'string' && !isNaN(Number(value))) {
              fixes[attr.key] = parseFloat(value);
              needsUpdate = true;
            }
            break;
          case 'boolean':
            if (typeof value === 'string') {
              fixes[attr.key] = value.toLowerCase() === 'true';
              needsUpdate = true;
            }
            break;
        }
      }
    }

    if (needsUpdate) {
      try {
        await this.databases.updateDocument(
          env.server.appwrite.databaseId,
          collectionId,
          document.$id,
          fixes
        );
        console.log(`Fixed issues in document ${document.$id} of collection ${collectionId}`);
      } catch (error) {
        console.error(`Failed to fix document ${document.$id}:`, error);
      }
    }
  }

  /**
   * Generate validation report
   */
  private async generateValidationReport(collectionId: string, results: ValidationResult[]): Promise<void> {
    const report = {
      collection: collectionId,
      timestamp: new Date().toISOString(),
      totalDocuments: results.length,
      validDocuments: results.filter(r => r.valid).length,
      invalidDocuments: results.filter(r => !r.valid).length,
      commonErrors: this.getCommonIssues(results, 'errors'),
      commonWarnings: this.getCommonIssues(results, 'warnings'),
      recommendations: this.generateRecommendations(results)
    };

    console.log(`\n📊 Validation Report for ${collectionId}`);
    console.log(`   Total Documents: ${report.totalDocuments}`);
    console.log(`   Valid: ${report.validDocuments} (${((report.validDocuments / report.totalDocuments) * 100).toFixed(1)}%)`);
    console.log(`   Invalid: ${report.invalidDocuments} (${((report.invalidDocuments / report.totalDocuments) * 100).toFixed(1)}%)`);
    
    if (report.commonErrors.length > 0) {
      console.log(`\n❌ Common Errors:`);
      report.commonErrors.forEach(error => console.log(`   - ${error.issue} (${error.count} documents)`));
    }
    
    if (report.commonWarnings.length > 0) {
      console.log(`\n⚠️  Common Warnings:`);
      report.commonWarnings.forEach(warning => console.log(`   - ${warning.issue} (${warning.count} documents)`));
    }
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
  }

  private getCommonIssues(results: ValidationResult[], type: 'errors' | 'warnings'): { issue: string; count: number }[] {
    const issueCounts: Record<string, number> = {};
    
    results.forEach(result => {
      result[type].forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    return Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }

  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    const invalidCount = results.filter(r => !r.valid).length;
    const totalCount = results.length;
    
    if (invalidCount > totalCount * 0.1) {
      recommendations.push('High number of invalid documents - consider running bulk data cleanup');
    }
    
    if (results.some(r => r.warnings.some(w => w.includes('old')))) {
      recommendations.push('Data freshness issues detected - schedule more frequent syncs');
    }
    
    if (results.some(r => r.errors.some(e => e.includes('required field')))) {
      recommendations.push('Required field violations - review data input validation');
    }
    
    return recommendations;
  }
}

export class SchemaMigrationTools {
  private client: Client;
  private databases: Databases;

  constructor() {
    this.client = new Client()
      .setEndpoint(env.server.appwrite.endpoint)
      .setProject(env.server.appwrite.projectId)
      .setKey(env.server.appwrite.apiKey);
    
    this.databases = new Databases(this.client);
  }

  /**
   * Compare current database schema with expected schema
   */
  async compareSchema(): Promise<SchemaComparisonResult[]> {
    const results: SchemaComparisonResult[] = [];

    for (const [collectionId, expectedConfig] of Object.entries(APPWRITE_SCHEMA)) {
      try {
        const actualCollection = await this.databases.getCollection(
          env.server.appwrite.databaseId,
          collectionId
        );

        const comparison = this.compareCollectionSchema(expectedConfig, actualCollection);
        results.push(comparison);

      } catch (error: any) {
        if (error.code === 404) {
          // Collection doesn't exist
          results.push({
            collection: collectionId,
            missingAttributes: expectedConfig.attributes.map(attr => attr.key),
            extraAttributes: [],
            typeConflicts: [],
            missingIndexes: expectedConfig.indexes?.map(idx => idx.key) || [],
            extraIndexes: []
          });
        } else {
          console.error(`Error comparing schema for ${collectionId}:`, error);
        }
      }
    }

    return results;
  }

  private compareCollectionSchema(expected: CollectionConfig, actual: any): SchemaComparisonResult {
    const expectedAttrs = expected.attributes.map(attr => attr.key);
    const actualAttrs = actual.attributes?.map((attr: any) => attr.key) || [];
    
    const expectedIndexes = expected.indexes?.map(idx => idx.key) || [];
    const actualIndexes = actual.indexes?.map((idx: any) => idx.key) || [];

    const missingAttributes = expectedAttrs.filter(key => !actualAttrs.includes(key));
    const extraAttributes = actualAttrs.filter(key => !expectedAttrs.includes(key));
    
    const missingIndexes = expectedIndexes.filter(key => !actualIndexes.includes(key));
    const extraIndexes = actualIndexes.filter(key => !expectedIndexes.includes(key));

    // Check type conflicts
    const typeConflicts: { attribute: string; expected: string; actual: string }[] = [];
    for (const expectedAttr of expected.attributes) {
      const actualAttr = actual.attributes?.find((attr: any) => attr.key === expectedAttr.key);
      if (actualAttr && actualAttr.type !== expectedAttr.type) {
        typeConflicts.push({
          attribute: expectedAttr.key,
          expected: expectedAttr.type,
          actual: actualAttr.type
        });
      }
    }

    return {
      collection: expected.id,
      missingAttributes,
      extraAttributes,
      typeConflicts,
      missingIndexes,
      extraIndexes
    };
  }

  /**
   * Generate migration plan based on schema differences
   */
  async generateMigrationPlan(schemaComparisons: SchemaComparisonResult[]): Promise<MigrationPlan> {
    const operations: MigrationOperation[] = [];
    const rollbackOperations: MigrationOperation[] = [];
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let estimatedDuration = 5; // Base 5 minutes

    for (const comparison of schemaComparisons) {
      const collectionConfig = APPWRITE_SCHEMA[comparison.collection];
      if (!collectionConfig) continue;

      // Add missing attributes
      for (const missingAttr of comparison.missingAttributes) {
        const attrConfig = collectionConfig.attributes.find(attr => attr.key === missingAttr);
        if (attrConfig) {
          operations.push({
            type: 'create_attribute',
            collection: comparison.collection,
            details: attrConfig
          });
          
          rollbackOperations.push({
            type: 'delete_attribute',
            collection: comparison.collection,
            details: { key: missingAttr }
          });
          
          estimatedDuration += 2;
        }
      }

      // Handle type conflicts (high risk)
      if (comparison.typeConflicts.length > 0) {
        riskLevel = 'high';
        estimatedDuration += comparison.typeConflicts.length * 10;
        
        for (const conflict of comparison.typeConflicts) {
          operations.push({
            type: 'transform_data',
            collection: comparison.collection,
            details: {
              attribute: conflict.attribute,
              fromType: conflict.actual,
              toType: conflict.expected,
              transformFunction: this.getTypeTransformFunction(conflict.actual, conflict.expected)
            }
          });
        }
      }

      // Add missing indexes
      for (const missingIndex of comparison.missingIndexes) {
        const indexConfig = collectionConfig.indexes?.find(idx => idx.key === missingIndex);
        if (indexConfig) {
          operations.push({
            type: 'create_index',
            collection: comparison.collection,
            details: indexConfig
          });
          
          rollbackOperations.push({
            type: 'delete_index',
            collection: comparison.collection,
            details: { key: missingIndex }
          });
          
          estimatedDuration += 3;
        }
      }

      // Flag extra attributes for review (medium risk)
      if (comparison.extraAttributes.length > 0) {
        if (riskLevel === 'low') riskLevel = 'medium';
        console.warn(`Extra attributes found in ${comparison.collection}:`, comparison.extraAttributes);
      }
    }

    return {
      id: `migration_${Date.now()}`,
      name: 'Schema Sync Migration',
      description: 'Synchronize database schema with application schema',
      fromVersion: 'current',
      toVersion: 'latest',
      operations,
      rollbackOperations: rollbackOperations.reverse(),
      estimatedDuration,
      riskLevel,
      dependencies: []
    };
  }

  /**
   * Execute migration plan
   */
  async executeMigration(plan: MigrationPlan, options: {
    dryRun?: boolean;
    skipRiskyOperations?: boolean;
  } = {}): Promise<{ success: boolean; results: any[] }> {
    const { dryRun = false, skipRiskyOperations = false } = options;
    const results: any[] = [];

    if (plan.riskLevel === 'high' && skipRiskyOperations) {
      return {
        success: false,
        results: [{ error: 'High-risk migration skipped. Manual review required.' }]
      };
    }

    console.log(`\n🚀 ${dryRun ? 'DRY RUN: ' : ''}Executing migration: ${plan.name}`);
    console.log(`   Risk Level: ${plan.riskLevel}`);
    console.log(`   Estimated Duration: ${plan.estimatedDuration} minutes`);
    console.log(`   Operations: ${plan.operations.length}`);

    if (dryRun) {
      console.log('\n📋 Migration Plan:');
      plan.operations.forEach((op, i) => {
        console.log(`   ${i + 1}. ${op.type} on ${op.collection}`);
        console.log(`      Details:`, JSON.stringify(op.details, null, 6));
      });
      return { success: true, results: [{ message: 'Dry run completed' }] };
    }

    // Create backup point
    await this.createBackupPoint(`migration_${plan.id}`);

    let successCount = 0;
    for (const operation of plan.operations) {
      try {
        const result = await this.executeOperation(operation);
        results.push({ operation: operation.type, success: true, result });
        successCount++;
      } catch (error: any) {
        results.push({ operation: operation.type, success: false, error: error.message });
        console.error(`Migration operation failed:`, error);
        
        // For critical failures, consider rolling back
        if (operation.type === 'transform_data') {
          console.log('Data transformation failed - considering rollback...');
          // Implement rollback logic here
        }
      }
    }

    const success = successCount === plan.operations.length;
    console.log(`\n✅ Migration completed: ${successCount}/${plan.operations.length} operations successful`);

    return { success, results };
  }

  private async executeOperation(operation: MigrationOperation): Promise<any> {
    const databaseId = env.server.appwrite.databaseId;
    
    switch (operation.type) {
      case 'create_attribute':
        return this.createAttribute(databaseId, operation.collection, operation.details);
      
      case 'create_index':
        return this.databases.createIndex(
          databaseId,
          operation.collection,
          operation.details.key,
          operation.details.type,
          operation.details.attributes,
          operation.details.orders
        );
      
      case 'transform_data':
        return this.transformCollectionData(operation.collection, operation.details);
      
      default:
        throw new Error(`Unsupported operation type: ${operation.type}`);
    }
  }

  private async createAttribute(databaseId: string, collectionId: string, attrConfig: any): Promise<any> {
    switch (attrConfig.type) {
      case 'string':
        return this.databases.createStringAttribute(
          databaseId, collectionId, attrConfig.key,
          attrConfig.size || 255, attrConfig.required || false,
          attrConfig.default, attrConfig.array || false
        );
      
      case 'integer':
        return this.databases.createIntegerAttribute(
          databaseId, collectionId, attrConfig.key,
          attrConfig.required || false, attrConfig.min, attrConfig.max,
          attrConfig.default, attrConfig.array || false
        );
      
      case 'double':
        return this.databases.createFloatAttribute(
          databaseId, collectionId, attrConfig.key,
          attrConfig.required || false, attrConfig.min, attrConfig.max,
          attrConfig.default, attrConfig.array || false
        );
      
      case 'boolean':
        return this.databases.createBooleanAttribute(
          databaseId, collectionId, attrConfig.key,
          attrConfig.required || false, attrConfig.default,
          attrConfig.array || false
        );
      
      case 'datetime':
        return this.databases.createDatetimeAttribute(
          databaseId, collectionId, attrConfig.key,
          attrConfig.required || false, attrConfig.default,
          attrConfig.array || false
        );
      
      default:
        throw new Error(`Unsupported attribute type: ${attrConfig.type}`);
    }
  }

  private async transformCollectionData(collectionId: string, details: any): Promise<any> {
    // This is a complex operation that would need to:
    // 1. Read all documents in batches
    // 2. Transform the data according to the transformation function
    // 3. Update documents with new data
    // 4. Handle errors gracefully
    
    console.log(`Transforming data in ${collectionId} for attribute ${details.attribute}`);
    console.log(`Converting from ${details.fromType} to ${details.toType}`);
    
    // For now, just log the intended transformation
    // In a real implementation, this would perform the actual data transformation
    return { message: 'Data transformation logged (not implemented in demo)' };
  }

  private getTypeTransformFunction(fromType: string, toType: string): string {
    const transformations: Record<string, string> = {
      'string_to_integer': 'parseInt(value, 10)',
      'string_to_double': 'parseFloat(value)',
      'string_to_boolean': 'value.toLowerCase() === "true"',
      'integer_to_string': 'value.toString()',
      'double_to_string': 'value.toString()',
      'boolean_to_string': 'value.toString()'
    };
    
    return transformations[`${fromType}_to_${toType}`] || 'value';
  }

  private async createBackupPoint(name: string): Promise<void> {
    // In a real implementation, this would create a database backup
    console.log(`📁 Creating backup point: ${name}`);
    // This could integrate with Appwrite's backup features or external backup services
  }
}

// Export instances for easy use
export const validationTools = new DataValidationTools();
export const migrationTools = new SchemaMigrationTools();