/**
 * AUTO-GENERATED APPWRITE SEEDER
 * 
 * Creates all collections, attributes, and indexes from the canonical schema
 * Generated from schema/schema.ts
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';
import { SCHEMA } from '../schema';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createAttribute(collectionId: string, attr: any): Promise<void> {
  const { key, type, size, required = false, array = false } = attr;
  
  try {
    switch (type) {
      case 'string':
      case 'url':
      case 'email':
      case 'ip':
        await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          key,
          size || 255,
          required,
          attr.default,
          array
        );
        break;
      case 'integer':
        await databases.createIntegerAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          undefined, // min
          undefined, // max
          attr.default,
          array
        );
        break;
      case 'double':
        await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          undefined, // min
          undefined, // max
          attr.default,
          array
        );
        break;
      case 'boolean':
        await databases.createBooleanAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          attr.default,
          array
        );
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          collectionId,
          key,
          required,
          attr.default,
          array
        );
        break;
      default:
        throw new Error(`Unsupported attribute type: ${type}`);
    }
    
    log(`    ✅ Created attribute: ${key} (${type})`, 'green');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      log(`    ✅ Attribute already exists: ${key}`, 'yellow');
    } else {
      log(`    ❌ Failed to create ${key}: ${error.message}`, 'red');
      throw error;
    }
  }
}

async function createIndex(collectionId: string, index: any): Promise<void> {
  const { key, type, attributes, orders } = index;
  
  try {
    await databases.createIndex(
      DATABASE_ID,
      collectionId,
      key,
      type,
      attributes,
      orders
    );
    
    log(`    ✅ Created index: ${key} on [${attributes.join(', ')}]`, 'green');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      log(`    ✅ Index already exists: ${key}`, 'yellow');
    } else {
      log(`    ❌ Failed to create ${key}: ${error.message}`, 'red');
      throw error;
    }
  }
}

function convertPermissions(permissions: any): string[] {
  const perms: string[] = [];
  
  // Convert schema permissions to Appwrite Permission objects
  for (const [action, roles] of Object.entries(permissions)) {
    for (const role of roles as string[]) {
      if (role === 'any') {
        perms.push(Permission[action as keyof typeof Permission](Role.any()));
      } else if (role.startsWith('role:')) {
        const roleName = role.substring(5);
        perms.push(Permission[action as keyof typeof Permission](Role.team(roleName)));
      } else {
        perms.push(Permission[action as keyof typeof Permission](Role.user(role)));
      }
    }
  }
  
  return perms;
}

export async function seedAppwriteSchema(): Promise<void> {
  log('\n🚀 Starting Appwrite Schema Seeder', 'cyan');
  log('==================================', 'cyan');
  
  let collectionsCreated = 0;
  let attributesCreated = 0;
  let indexesCreated = 0;
  
  try {
    // Get existing collections
    const existingCollections = await databases.listCollections(DATABASE_ID);
    const existingIds = new Set(existingCollections.collections.map(c => c.$id));
    
    // Create collections in dependency order
    const collectionOrder = [
      'users', 'teams', 'college_players', 'games', 'rankings', 'player_stats',
      'leagues', 'user_teams', 'lineups', 'auctions', 'bids', 'activity_log'
    ];
    
    for (const collectionId of collectionOrder) {
      if (!SCHEMA[collectionId]) continue;
      
      const collection = SCHEMA[collectionId];
      log(`\n📋 Processing collection: ${collection.name}`, 'cyan');
      
      // Create collection if it doesn't exist
      if (!existingIds.has(collectionId)) {
        try {
          const permissions = convertPermissions(collection.permissions);
          
          await databases.createCollection(
            DATABASE_ID,
            collectionId,
            collection.name,
            permissions
          );
          
          log(`  ✅ Created collection: ${collection.name}`, 'green');
          collectionsCreated++;
        } catch (error: any) {
          log(`  ❌ Failed to create collection: ${error.message}`, 'red');
          continue;
        }
      } else {
        log(`  ✅ Collection already exists: ${collection.name}`, 'yellow');
      }
      
      // Create attributes
      log(`  📝 Creating ${collection.attributes.length} attributes...`);
      for (const attr of collection.attributes) {
        await createAttribute(collectionId, attr);
        attributesCreated++;
      }
      
      // Wait a bit for attributes to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create indexes
      log(`  📇 Creating ${collection.indexes.length} indexes...`);
      for (const index of collection.indexes) {
        await createIndex(collectionId, index);
        indexesCreated++;
      }
    }
    
    log(`\n🎉 Schema seeding completed successfully!`, 'green');
    log(`📊 Summary:`, 'cyan');
    log(`  - Collections: ${collectionsCreated} created`);
    log(`  - Attributes: ${attributesCreated} processed`);
    log(`  - Indexes: ${indexesCreated} processed`);
    
  } catch (error) {
    log(`\n❌ Schema seeding failed: ${error}`, 'red');
    throw error;
  }
}

// CLI support
if (require.main === module) {
  seedAppwriteSchema().catch(error => {
    console.error('Seeder failed:', error);
    process.exit(1);
  });
}
