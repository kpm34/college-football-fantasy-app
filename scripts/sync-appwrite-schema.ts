#!/usr/bin/env tsx

/**
 * Schema Sync Script
 * 
 * Reads our Single Source of Truth schema and ensures Appwrite collections/attributes/indexes
 * are synchronized. Idempotent - safe to run anytime in CI or locally.
 */

import 'dotenv/config';
import { Client, Databases, Permission, Role } from 'node-appwrite';
import { SCHEMA, type SchemaCollection, type SchemaAttribute } from '../schema/schema';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "college-football-fantasy";

if (!endpoint || !project || !apiKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  - APPWRITE_ENDPOINT (or NEXT_PUBLIC_APPWRITE_ENDPOINT)');
  console.error('  - APPWRITE_PROJECT_ID (or NEXT_PUBLIC_APPWRITE_PROJECT_ID)');
  console.error('  - APPWRITE_API_KEY');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(apiKey);

const db = new Databases(client);

// Helper functions for idempotent operations
async function ensureDatabase(): Promise<void> {
  try {
    await db.get(databaseId);
    console.log(`  ✅ Database '${databaseId}' exists`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`  ➕ Creating database '${databaseId}'`);
      await db.create(databaseId, 'College Football Fantasy Database');
    } else {
      throw error;
    }
  }
}

async function ensureCollection(id: string, name: string, permissions: string[]): Promise<void> {
  try {
    await db.getCollection(databaseId, id);
    console.log(`    ✅ Collection '${id}' exists`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`    ➕ Creating collection '${id}' (${name})`);
      await db.createCollection(databaseId, id, name, permissions);
    } else {
      throw error;
    }
  }
}

async function ensureStringAttribute(
  collectionId: string, 
  key: string, 
  size: number, 
  required: boolean,
  defaultValue?: string,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding string attribute '${key}' (size: ${size}, required: ${required})`);
      await db.createStringAttribute(
        databaseId, 
        collectionId, 
        key, 
        size, 
        required,
        defaultValue,
        array
      );
      // Wait for attribute to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureIntegerAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  min?: number,
  max?: number,
  defaultValue?: number,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding integer attribute '${key}' (required: ${required})`);
      await db.createIntegerAttribute(
        databaseId,
        collectionId,
        key,
        required,
        min,
        max,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureDoubleAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  min?: number,
  max?: number,
  defaultValue?: number,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding double attribute '${key}' (required: ${required})`);
      await db.createFloatAttribute(
        databaseId,
        collectionId,
        key,
        required,
        min,
        max,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureBooleanAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  defaultValue?: boolean,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding boolean attribute '${key}' (required: ${required})`);
      await db.createBooleanAttribute(
        databaseId,
        collectionId,
        key,
        required,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureDatetimeAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  defaultValue?: string,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding datetime attribute '${key}' (required: ${required})`);
      await db.createDatetimeAttribute(
        databaseId,
        collectionId,
        key,
        required,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureUrlAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  defaultValue?: string,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding URL attribute '${key}' (required: ${required})`);
      await db.createUrlAttribute(
        databaseId,
        collectionId,
        key,
        required,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureEmailAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  defaultValue?: string,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding email attribute '${key}' (required: ${required})`);
      await db.createEmailAttribute(
        databaseId,
        collectionId,
        key,
        required,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureIpAttribute(
  collectionId: string,
  key: string,
  required: boolean,
  defaultValue?: string,
  array?: boolean
): Promise<void> {
  try {
    await db.getAttribute(databaseId, collectionId, key);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Adding IP attribute '${key}' (required: ${required})`);
      await db.createIpAttribute(
        databaseId,
        collectionId,
        key,
        required,
        defaultValue,
        array
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      throw error;
    }
  }
}

async function ensureAttribute(collectionId: string, attr: SchemaAttribute): Promise<void> {
  const { key, type, size, required = false, default: defaultValue, array = false } = attr;

  switch (type) {
    case 'string':
      await ensureStringAttribute(collectionId, key, size || 255, required, defaultValue, array);
      break;
    case 'integer':
      await ensureIntegerAttribute(collectionId, key, required, undefined, undefined, defaultValue, array);
      break;
    case 'double':
      await ensureDoubleAttribute(collectionId, key, required, undefined, undefined, defaultValue, array);
      break;
    case 'boolean':
      await ensureBooleanAttribute(collectionId, key, required, defaultValue, array);
      break;
    case 'datetime':
      await ensureDatetimeAttribute(collectionId, key, required, defaultValue, array);
      break;
    case 'url':
      await ensureUrlAttribute(collectionId, key, required, defaultValue, array);
      break;
    case 'email':
      await ensureEmailAttribute(collectionId, key, required, defaultValue, array);
      break;
    case 'ip':
      await ensureIpAttribute(collectionId, key, required, defaultValue, array);
      break;
    default:
      console.warn(`      ⚠️  Unknown attribute type '${type}' for '${key}' - skipping`);
  }
}

async function ensureIndex(collectionId: string, indexKey: string, type: string, attributes: string[], orders?: string[]): Promise<void> {
  try {
    await db.getIndex(databaseId, collectionId, indexKey);
    console.log(`      ✅ Index '${indexKey}' exists`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`      ➕ Creating ${type} index '${indexKey}' on [${attributes.join(', ')}]`);
      
      try {
        if (type === 'key') {
          await db.createIndex(databaseId, collectionId, indexKey, type, attributes, orders);
        } else if (type === 'fulltext') {
          await db.createIndex(databaseId, collectionId, indexKey, type, attributes);
        } else if (type === 'unique') {
          await db.createIndex(databaseId, collectionId, indexKey, type, attributes);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (indexError: any) {
        console.warn(`      ⚠️  Failed to create index '${indexKey}': ${indexError.message}`);
      }
    } else {
      throw error;
    }
  }
}

function convertPermissions(permissions: { read: string[], write: string[], create: string[], update: string[], delete: string[] }): string[] {
  const appwritePermissions: string[] = [];
  
  // Convert read permissions
  permissions.read.forEach(perm => {
    if (perm === 'any') {
      appwritePermissions.push(Permission.read(Role.any()));
    } else if (perm.startsWith('role:')) {
      appwritePermissions.push(Permission.read(Role.label(perm.replace('role:', ''))));
    }
  });
  
  // Convert write permissions (covers create, update, delete in Appwrite)
  permissions.write.forEach(perm => {
    if (perm === 'any') {
      appwritePermissions.push(Permission.write(Role.any()));
    } else if (perm.startsWith('role:')) {
      appwritePermissions.push(Permission.write(Role.label(perm.replace('role:', ''))));
    }
  });

  return appwritePermissions;
}

async function syncCollection(collection: SchemaCollection): Promise<void> {
  console.log(`  📦 Syncing collection: ${collection.name} (${collection.id})`);
  
  // Ensure collection exists
  const permissions = convertPermissions(collection.permissions);
  await ensureCollection(collection.id, collection.name, permissions);
  
  // Ensure all attributes exist
  console.log(`    🔧 Syncing attributes...`);
  for (const attr of collection.attributes) {
    await ensureAttribute(collection.id, attr);
  }
  
  // Ensure all indexes exist
  console.log(`    📇 Syncing indexes...`);
  for (const index of collection.indexes) {
    await ensureIndex(collection.id, index.key, index.type, index.attributes, index.orders);
  }
  
  console.log(`  ✅ Collection '${collection.id}' synchronized`);
}

async function main(): Promise<void> {
  console.log('🔄 Starting Appwrite Schema Sync');
  console.log('═'.repeat(50));
  
  try {
    // Ensure database exists
    console.log('📊 Ensuring database exists...');
    await ensureDatabase();
    
    // Sync all collections from our SSOT
    console.log(`\n📦 Syncing ${Object.keys(SCHEMA).length} collections...`);
    
    for (const [collectionId, collection] of Object.entries(SCHEMA)) {
      await syncCollection(collection);
    }
    
    console.log('\n🎉 Schema sync completed successfully!');
    console.log(`✅ Database: ${databaseId}`);
    console.log(`✅ Collections: ${Object.keys(SCHEMA).length}`);
    console.log(`✅ Endpoint: ${endpoint}`);
    
  } catch (error: any) {
    console.error('\n❌ Schema sync failed:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  main();
}

export { main as syncAppwriteSchema };