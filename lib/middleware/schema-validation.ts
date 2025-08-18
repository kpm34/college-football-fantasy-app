/**
 * Runtime Schema Validation Middleware
 * 
 * Provides middleware for validating API requests and responses
 * against the SSOT schema definitions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { COLLECTIONS, SCHEMA_REGISTRY, validateData } from '../../schema/zod-schema.js';

export interface ValidationConfig {
  collection?: keyof typeof COLLECTIONS;
  validateRequest?: boolean;
  validateResponse?: boolean;
  strict?: boolean; // Fail on validation errors vs warn
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Validate request/response data against SSOT schemas
 */
export function validateWithSSOT<T>(
  collectionId: keyof typeof SCHEMA_REGISTRY,
  data: unknown,
  options: { strict?: boolean } = {}
): ValidationResult {
  const result = validateData<T>(collectionId, data);
  
  if (!result.success) {
    const validationResult: ValidationResult = {
      valid: false,
      errors: result.errors
    };

    if (options.strict) {
      throw new Error(`Schema validation failed for ${collectionId}: ${result.errors?.join(', ')}`);
    }

    return validationResult;
  }

  return { valid: true };
}

/**
 * API Route wrapper with automatic schema validation
 */
export function withSchemaValidation<T = any>(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  config: ValidationConfig
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      // Validate request body if configured
      if (config.validateRequest && config.collection && req.body) {
        try {
          const body = await req.json();
          const validation = validateWithSSOT(
            COLLECTIONS[config.collection],
            body,
            { strict: config.strict }
          );

          if (!validation.valid && config.strict) {
            return NextResponse.json(
              { 
                error: 'Request validation failed',
                details: validation.errors,
                collection: config.collection
              },
              { status: 400 }
            );
          }

          if (!validation.valid) {
            console.warn(`Request validation warnings for ${config.collection}:`, validation.errors);
          }
        } catch (error) {
          if (config.strict) {
            return NextResponse.json(
              { error: 'Invalid request format' },
              { status: 400 }
            );
          }
        }
      }

      // Execute the handler
      const response = await handler(req, context);

      // Validate response data if configured
      if (config.validateResponse && config.collection && response.status === 200) {
        try {
          const responseClone = response.clone();
          const responseData = await responseClone.json();

          // Validate response data structure
          if (Array.isArray(responseData.data)) {
            // Validate array of items
            responseData.data.forEach((item: unknown, index: number) => {
              const validation = validateWithSSOT(
                COLLECTIONS[config.collection!],
                item,
                { strict: false } // Don't fail response validation
              );

              if (!validation.valid) {
                console.warn(`Response item ${index} validation warnings:`, validation.errors);
              }
            });
          } else if (responseData.data) {
            // Validate single item
            const validation = validateWithSSOT(
              COLLECTIONS[config.collection!],
              responseData.data,
              { strict: false }
            );

            if (!validation.valid) {
              console.warn(`Response validation warnings:`, validation.errors);
            }
          }
        } catch (error) {
          console.warn('Response validation error:', error);
        }
      }

      // Add validation metadata to response headers
      const validationTime = Date.now() - startTime;
      response.headers.set('X-Schema-Validation', 'enabled');
      response.headers.set('X-Schema-Collection', config.collection || 'none');
      response.headers.set('X-Schema-Validation-Time', validationTime.toString());

      return response;

    } catch (error: any) {
      console.error('Schema validation middleware error:', error);
      
      return NextResponse.json(
        { 
          error: 'Internal validation error',
          message: error.message
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Batch validation for multiple items
 */
export function validateBatch<T>(
  collectionId: keyof typeof SCHEMA_REGISTRY,
  items: unknown[],
  options: { failFast?: boolean; strict?: boolean } = {}
): { valid: boolean; results: ValidationResult[]; summary: { passed: number; failed: number } } {
  const results: ValidationResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const result = validateWithSSOT<T>(collectionId, item, options);
      results.push(result);
      
      if (result.valid) {
        passed++;
      } else {
        failed++;
        if (options.failFast) {
          break;
        }
      }
    } catch (error: any) {
      results.push({
        valid: false,
        errors: [error.message]
      });
      failed++;
      
      if (options.failFast) {
        break;
      }
    }
  }

  return {
    valid: failed === 0,
    results,
    summary: { passed, failed }
  };
}

/**
 * Schema validation helper for API routes
 */
export const SchemaValidation = {
  /**
   * Validate API request body
   */
  validateRequest: <T>(collectionId: keyof typeof SCHEMA_REGISTRY, data: unknown): T => {
    const result = validateWithSSOT<T>(collectionId, data, { strict: true });
    if (!result.valid) {
      throw new Error(`Request validation failed: ${result.errors?.join(', ')}`);
    }
    return data as T;
  },

  /**
   * Validate API response data
   */
  validateResponse: <T>(collectionId: keyof typeof SCHEMA_REGISTRY, data: unknown): ValidationResult => {
    return validateWithSSOT<T>(collectionId, data, { strict: false });
  },

  /**
   * Create validation middleware for specific collection
   */
  forCollection: (collectionId: keyof typeof COLLECTIONS, options: Omit<ValidationConfig, 'collection'> = {}) => {
    return withSchemaValidation(async (req) => {
      // This is a placeholder - actual handler should be passed
      throw new Error('Handler not implemented');
    }, {
      collection: collectionId,
      ...options
    });
  }
};

export default SchemaValidation;