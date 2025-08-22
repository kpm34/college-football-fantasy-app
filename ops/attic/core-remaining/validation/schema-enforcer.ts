/**
 * Schema Enforcement System
 * 
 * This system ensures that all database operations strictly follow the canonical schema,
 * preventing the type mismatches and data integrity issues we've experienced.
 */

import { SCHEMA, type SchemaAttribute, type SchemaCollection } from '../../schema/schema';
import { z } from 'zod';

// Runtime validation schema cache
const validationSchemaCache = new Map<string, z.ZodSchema>();

/**
 * Creates a Zod schema from our canonical schema definition
 */
function createZodSchema(collection: SchemaCollection): z.ZodSchema {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  for (const attr of collection.attributes) {
    let zodType: z.ZodTypeAny;
    
    // Map attribute types to Zod types
    switch (attr.type) {
      case 'string':
      case 'url':
      case 'email':
      case 'ip':
        zodType = z.string();
        if (attr.size) {
          zodType = zodType.max(attr.size);
        }
        break;
        
      case 'integer':
        zodType = z.number().int();
        break;
        
      case 'double':
        zodType = z.number();
        break;
        
      case 'boolean':
        zodType = z.boolean();
        break;
        
      case 'datetime':
        zodType = z.union([z.date(), z.string().datetime()]);
        break;
        
      default:
        zodType = z.any();
    }
    
    // Handle arrays
    if (attr.array) {
      zodType = z.array(zodType);
    }
    
    // Handle required/optional
    if (!attr.required) {
      zodType = zodType.optional();
    }
    
    // Add default values
    if (attr.default !== undefined) {
      zodType = zodType.default(attr.default);
    }
    
    shape[attr.key] = zodType;
  }
  
  return z.object(shape);
}

/**
 * Get validation schema for a collection
 */
export function getValidationSchema(collectionId: string): z.ZodSchema {
  if (validationSchemaCache.has(collectionId)) {
    return validationSchemaCache.get(collectionId)!;
  }
  
  const collection = SCHEMA[collectionId];
  if (!collection) {
    throw new Error(`Collection '${collectionId}' not found in schema`);
  }
  
  const schema = createZodSchema(collection);
  validationSchemaCache.set(collectionId, schema);
  return schema;
}

/**
 * Validate data against the schema before database operations
 */
export function validateDocumentData(collectionId: string, data: any): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  try {
    const schema = getValidationSchema(collectionId);
    const validatedData = schema.parse(data);
    
    return {
      success: true,
      data: validatedData
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    
    return {
      success: false,
      errors: [error.message || 'Unknown validation error']
    };
  }
}

/**
 * Schema enforcement decorator for repository methods
 */
export function enforceSchema(collectionId: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // For create/update operations, validate the data
      if (propertyKey.includes('create') || propertyKey.includes('update')) {
        const dataArg = args.find(arg => typeof arg === 'object' && arg !== null);
        if (dataArg) {
          const validation = validateDocumentData(collectionId, dataArg);
          if (!validation.success) {
            throw new Error(`Schema validation failed for ${collectionId}: ${validation.errors?.join(', ')}`);
          }
          // Replace the data with validated data
          const dataIndex = args.indexOf(dataArg);
          args[dataIndex] = validation.data;
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Type-safe data transformer that ensures JSON fields are properly handled
 */
export function transformDataForCollection(collectionId: string, data: any): any {
  const collection = SCHEMA[collectionId];
  if (!collection) {
    throw new Error(`Collection '${collectionId}' not found in schema`);
  }
  
  const transformed = { ...data };
  
  for (const attr of collection.attributes) {
    if (attr.key in transformed) {
      const value = transformed[attr.key];
      
      // Handle JSON string fields (like 'players' in rosters)
      if (attr.type === 'string' && attr.size && attr.size > 1000) {
        // Large string fields are likely JSON - ensure they're stringified
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          transformed[attr.key] = JSON.stringify(value);
        }
      }
      
      // Handle type coercion
      if (attr.type === 'integer' && typeof value === 'string') {
        transformed[attr.key] = parseInt(value, 10);
      } else if (attr.type === 'double' && typeof value === 'string') {
        transformed[attr.key] = parseFloat(value);
      } else if (attr.type === 'boolean' && typeof value === 'string') {
        transformed[attr.key] = value === 'true';
      }
    }
  }
  
  return transformed;
}

/**
 * Schema compliance checker - validates that all expected collections/endpoints exist
 */
export async function validateSystemCompliance(): Promise<{
  valid: boolean;
  issues: Array<{
    type: 'missing_collection' | 'missing_endpoint' | 'type_mismatch' | 'data_integrity';
    collection?: string;
    endpoint?: string;
    message: string;
  }>;
}> {
  const issues: Array<{
    type: 'missing_collection' | 'missing_endpoint' | 'type_mismatch' | 'data_integrity';
    collection?: string;
    endpoint?: string;
    message: string;
  }> = [];
  
  // Check that all schema collections are represented in generated types
  for (const [collectionId, collection] of Object.entries(SCHEMA)) {
    try {
      getValidationSchema(collectionId);
    } catch (error) {
      issues.push({
        type: 'missing_collection',
        collection: collectionId,
        message: `Collection ${collectionId} cannot be validated: ${error}`
      });
    }
  }
  
  // Check for expected API endpoints based on data flow
  const expectedEndpoints = [
    '/api/leagues/mine',
    '/api/leagues/my-leagues',
    '/api/leagues/search',
    '/api/leagues/create',
    '/api/lineups/set', // Not yet implemented
    '/api/players/search',
    '/api/games', // Not yet implemented
  ];
  
  for (const endpoint of expectedEndpoints) {
    // This would need to be expanded to actually check if endpoints exist
    // For now, just log what should be checked
    console.log(`Should validate endpoint exists: ${endpoint}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Export validation utilities for use in repositories
 */
export const SchemaValidator = {
  validate: validateDocumentData,
  transform: transformDataForCollection,
  getSchema: getValidationSchema,
  enforceSchema
};