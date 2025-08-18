#!/usr/bin/env tsx
/**
 * Automated Appwrite Schema Sync from SSOT
 * 
 * Syncs the Appwrite database collections and attributes 
 * to match the Single Source of Truth schema definitions
 */

import { Client, Databases, ID } from 'node-appwrite';
import { z } from 'zod';
import { COLLECTIONS, SCHEMA_REGISTRY } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

interface AttributeDefinition {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'enum';
  required: boolean;
  size?: number;
  min?: number;
  max?: number;
  default?: any;
  elements?: string[];
}

interface CollectionSync {
  id: string;
  name: string;
  attributes: AttributeDefinition[];
  exists: boolean;
  needsUpdate: boolean;
}

function convertZodToAppwrite(schema: z.ZodObject<any>): AttributeDefinition[] {
  const attributes: AttributeDefinition[] = [];
  const shape = schema._def.shape();

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const attr = analyzeZodField(key, fieldSchema as z.ZodTypeAny);
    if (attr) {
      attributes.push(attr);
    }
  }

  return attributes;
}

function analyzeZodField(key: string, schema: z.ZodTypeAny): AttributeDefinition | null {
  let required = true;
  let type: AttributeDefinition['type'] = 'string';
  let size = 255;
  let min: number | undefined;
  let max: number | undefined;
  let defaultValue: any;
  let elements: string[] | undefined;

  // Handle optional fields
  if (schema instanceof z.ZodOptional) {
    required = false;
    schema = schema._def.innerType;
  }

  // Handle default values
  if (schema instanceof z.ZodDefault) {
    defaultValue = schema._def.defaultValue();
    schema = schema._def.innerType;
  }

  // Analyze the core schema type
  if (schema instanceof z.ZodString) {
    type = 'string';
    if (schema._def.checks) {
      schema._def.checks.forEach(check => {
        if (check.kind === 'min') min = check.value;
        if (check.kind === 'max') {
          max = check.value;
          size = check.value;
        }
      });
    }
  } else if (schema instanceof z.ZodNumber) {
    type = schema._def.checks?.some(c => c.kind === 'int') ? 'integer' : 'float';
    if (schema._def.checks) {
      schema._def.checks.forEach(check => {
        if (check.kind === 'min') min = check.value;
        if (check.kind === 'max') max = check.value;
      });
    }
  } else if (schema instanceof z.ZodBoolean) {
    type = 'boolean';
  } else if (schema instanceof z.ZodDate) {
    type = 'datetime';
  } else if (schema instanceof z.ZodEnum) {
    type = 'enum';
    elements = schema._def.values;
  } else {
    // Skip unsupported types
    console.warn(`Skipping unsupported field type for ${key}`);
    return null;
  }

  return {
    key,
    type,
    required,
    size,
    min,
    max,
    default: defaultValue,
    elements
  };
}

async function getExistingCollections(databases: Databases): Promise<Map<string, any>> {
  const existingCollections = new Map();
  
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    collections.collections.forEach(collection => {
      existingCollections.set(collection.$id, collection);
    });
  } catch (error) {
    console.warn('Could not fetch existing collections:', error);
  }

  return existingCollections;
}

async function syncCollection(
  databases: Databases, 
  sync: CollectionSync
): Promise<{ success: boolean; message: string }> {
  try {
    if (!sync.exists) {
      // Create new collection
      await databases.createCollection(
        DATABASE_ID,
        sync.id,
        sync.name
      );
      console.log(`✅ Created collection: ${sync.name}`);
    }

    // Sync attributes
    for (const attr of sync.attributes) {
      try {
        switch (attr.type) {
          case 'string':
            await databases.createStringAttribute(
              DATABASE_ID,
              sync.id,
              attr.key,
              attr.size || 255,
              attr.required,
              attr.default
            );
            break;
          case 'integer':
            await databases.createIntegerAttribute(
              DATABASE_ID,
              sync.id,
              attr.key,
              attr.required,
              attr.min,
              attr.max,
              attr.default
            );
            break;
          case 'float':
            await databases.createFloatAttribute(
              DATABASE_ID,
              sync.id,
              attr.key,
              attr.required,
              attr.min,
              attr.max,
              attr.default
            );
            break;
          case 'boolean':
            await databases.createBooleanAttribute(
              DATABASE_ID,
              sync.id,
              attr.key,
              attr.required,
              attr.default
            );
            break;
          case 'datetime':
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              sync.id,
              attr.key,
              attr.required,
              attr.default
            );
            break;
          case 'enum':
            await databases.createEnumAttribute(
              DATABASE_ID,
              sync.id,
              attr.key,
              attr.elements || [],
              attr.required,
              attr.default
            );
            break;
        }
        console.log(`  ✓ Added attribute: ${attr.key} (${attr.type})`);
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`  ~ Attribute exists: ${attr.key}`);
        } else {
          console.warn(`  ⚠️ Could not create attribute ${attr.key}:`, error.message);
        }
      }
    }

    return { success: true, message: `Synced collection: ${sync.name}` };
  } catch (error: any) {
    return { success: false, message: `Failed to sync ${sync.name}: ${error.message}` };
  }
}

async function main() {
  console.log('🔄 Appwrite Schema Sync from SSOT');
  console.log('==================================');

  if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY is required');
    process.exit(1);
  }

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Get existing collections
    const existingCollections = await getExistingCollections(databases);
    console.log(`📊 Found ${existingCollections.size} existing collections`);

    // Prepare sync operations
    const syncOperations: CollectionSync[] = [];

    for (const [collectionKey, collectionId] of Object.entries(COLLECTIONS)) {
      const schema = SCHEMA_REGISTRY[collectionId as keyof typeof SCHEMA_REGISTRY];
      
      if (schema && schema instanceof z.ZodObject) {
        const attributes = convertZodToAppwrite(schema);
        const exists = existingCollections.has(collectionId);
        
        syncOperations.push({
          id: collectionId,
          name: collectionId,
          attributes,
          exists,
          needsUpdate: !exists || attributes.length > 0
        });
      }
    }

    console.log(`🎯 Syncing ${syncOperations.length} collections from SSOT`);

    // Execute sync operations
    const results = [];
    for (const sync of syncOperations) {
      console.log(`\n🔄 Syncing: ${sync.name}`);
      const result = await syncCollection(databases, sync);
      results.push(result);
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n📊 Sync Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed operations:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.message}`);
      });
    }

    console.log('\n🎯 Schema sync completed');
    console.log(`📍 Database: ${DATABASE_ID}`);
    console.log(`🔗 Endpoint: ${APPWRITE_ENDPOINT}`);

  } catch (error: any) {
    console.error('❌ Schema sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { convertZodToAppwrite, syncCollection };