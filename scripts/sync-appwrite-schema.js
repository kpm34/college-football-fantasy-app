#!/usr/bin/env node

/**
 * Appwrite Schema Sync Script
 * 
 * This script ensures all required database attributes are present in Appwrite
 * to fix the "join league" feature and prevent attribute mismatch errors.
 * 
 * Run: node scripts/sync-appwrite-schema.js
 */

const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';

// Define the complete schema for each collection
const SCHEMA = {
  leagues: {
    name: 'Leagues',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'commissioner', type: 'string', size: 255, required: true },
      { key: 'commissionerId', type: 'string', size: 255, required: true },
      { key: 'maxTeams', type: 'integer', min: 2, max: 24, required: true, default: 12 },
      { key: 'currentTeams', type: 'integer', min: 0, max: 24, required: false, default: 0 },
      { key: 'members', type: 'string', size: 5000, required: false, array: true, default: [] },
      { key: 'draftType', type: 'enum', elements: ['snake', 'auction', 'linear'], required: true, default: 'snake' },
      { key: 'entryFee', type: 'double', min: 0, max: 10000, required: false, default: 0 },
      { key: 'scoringType', type: 'enum', elements: ['standard', 'ppr', 'halfPpr', 'custom'], required: false, default: 'standard' },
      { key: 'draftDate', type: 'datetime', required: false },
      { key: 'draftTime', type: 'string', size: 10, required: false },
      { key: 'draftOrder', type: 'string', size: 5000, required: false, array: true, default: [] },
      { key: 'status', type: 'enum', elements: ['draft', 'active', 'completed', 'open', 'full'], required: false, default: 'draft' },
      { key: 'isPublic', type: 'boolean', required: false, default: true },
      { key: 'password', type: 'string', size: 255, required: false },
      { key: 'inviteCode', type: 'string', size: 50, required: false },
      { key: 'inviteToken', type: 'string', size: 255, required: false },
      { key: 'settings', type: 'string', size: 5000, required: false },
      { key: 'rosterSize', type: 'integer', min: 1, max: 50, required: false, default: 15 },
      { key: 'playoffTeams', type: 'integer', min: 0, max: 24, required: false, default: 4 },
      { key: 'playoffWeeks', type: 'string', size: 100, required: false, array: true, default: [] },
      { key: 'tradeDeadline', type: 'datetime', required: false },
      { key: 'waiverType', type: 'enum', elements: ['rolling', 'faab', 'none'], required: false, default: 'rolling' },
      { key: 'waiverBudget', type: 'integer', min: 0, max: 1000, required: false, default: 100 },
    ],
    indexes: [
      { key: 'idx_commissioner', type: 'key', attributes: ['commissionerId'] },
      { key: 'idx_status', type: 'key', attributes: ['status'] },
      { key: 'idx_public', type: 'key', attributes: ['isPublic'] },
      { key: 'idx_invite_code', type: 'unique', attributes: ['inviteCode'] },
    ]
  },
  rosters: {
    name: 'Rosters',
    attributes: [
      { key: 'teamName', type: 'string', size: 255, required: true },
      { key: 'abbreviation', type: 'string', size: 10, required: false },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'leagueId', type: 'string', size: 255, required: true },
      { key: 'wins', type: 'integer', min: 0, max: 100, required: false, default: 0 },
      { key: 'losses', type: 'integer', min: 0, max: 100, required: false, default: 0 },
      { key: 'ties', type: 'integer', min: 0, max: 100, required: false, default: 0 },
      { key: 'pointsFor', type: 'double', min: 0, max: 10000, required: false, default: 0 },
      { key: 'pointsAgainst', type: 'double', min: 0, max: 10000, required: false, default: 0 },
      { key: 'players', type: 'string', size: 10000, required: false, default: '[]' },
      { key: 'draftPosition', type: 'integer', min: 0, max: 24, required: false },
      { key: 'waiverPriority', type: 'integer', min: 0, max: 24, required: false },
      { key: 'faabBalance', type: 'integer', min: 0, max: 1000, required: false, default: 100 },
      { key: 'playoffSeed', type: 'integer', min: 0, max: 24, required: false },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'lastActive', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'idx_league_user', type: 'unique', attributes: ['leagueId', 'userId'] },
      { key: 'idx_user', type: 'key', attributes: ['userId'] },
      { key: 'idx_league', type: 'key', attributes: ['leagueId'] },
    ]
  },
  activityLog: {
    name: 'Activity Log',
    attributes: [
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'userId', type: 'string', size: 255, required: false },
      { key: 'leagueId', type: 'string', size: 255, required: false },
      { key: 'teamId', type: 'string', size: 255, required: false },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'data', type: 'string', size: 5000, required: false },
      { key: 'inviteToken', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
      { key: 'expiresAt', type: 'datetime', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'idx_type', type: 'key', attributes: ['type'] },
      { key: 'idx_user', type: 'key', attributes: ['userId'] },
      { key: 'idx_league', type: 'key', attributes: ['leagueId'] },
      { key: 'idx_created', type: 'key', attributes: ['createdAt'] },
      { key: 'idx_invite_token', type: 'unique', attributes: ['inviteToken'] },
      { key: 'idx_status', type: 'key', attributes: ['status'] },
    ]
  },
  users: {
    name: 'Users',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: false },
      { key: 'username', type: 'string', size: 100, required: false },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'bio', type: 'string', size: 1000, required: false },
      { key: 'favoriteTeam', type: 'string', size: 100, required: false },
      { key: 'favoriteConference', type: 'enum', elements: ['SEC', 'ACC', 'Big12', 'BigTen', 'Pac12'], required: false },
      { key: 'leagues', type: 'string', size: 5000, required: false, array: true, default: [] },
      { key: 'wins', type: 'integer', min: 0, max: 10000, required: false, default: 0 },
      { key: 'losses', type: 'integer', min: 0, max: 10000, required: false, default: 0 },
      { key: 'championships', type: 'integer', min: 0, max: 1000, required: false, default: 0 },
      { key: 'totalPoints', type: 'double', min: 0, max: 1000000, required: false, default: 0 },
      { key: 'preferences', type: 'string', size: 5000, required: false },
      { key: 'notificationSettings', type: 'string', size: 1000, required: false },
      { key: 'lastLogin', type: 'datetime', required: false },
      { key: 'createdAt', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'idx_user_id', type: 'unique', attributes: ['userId'] },
      { key: 'idx_email', type: 'unique', attributes: ['email'] },
      { key: 'idx_username', type: 'unique', attributes: ['username'] },
    ]
  }
};

// Collection IDs mapping
const COLLECTIONS = {
  leagues: 'leagues',
  rosters: 'rosters',
  activityLog: 'activity_log',
  users: 'users',
};

async function getExistingAttributes(collectionId) {
  try {
    const collection = await databases.getCollection(DATABASE_ID, collectionId);
    return collection.attributes || [];
  } catch (error) {
    log(`Failed to get collection ${collectionId}: ${error.message}`, 'red');
    return null;
  }
}

async function createAttribute(collectionId, attribute) {
  try {
    let result;
    const baseParams = {
      databaseId: DATABASE_ID,
      collectionId: collectionId,
      key: attribute.key,
      required: attribute.required || false,
    };

    switch (attribute.type) {
      case 'string':
        result = await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          attribute.key,
          attribute.size || 255,
          attribute.required || false,
          attribute.default !== undefined ? String(attribute.default) : undefined,
          attribute.array || false
        );
        break;
      
      case 'integer':
        result = await databases.createIntegerAttribute(
          DATABASE_ID,
          collectionId,
          attribute.key,
          attribute.required || false,
          attribute.min,
          attribute.max,
          attribute.default,
          attribute.array || false
        );
        break;
      
      case 'double':
        result = await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          attribute.key,
          attribute.required || false,
          attribute.min,
          attribute.max,
          attribute.default,
          attribute.array || false
        );
        break;
      
      case 'boolean':
        result = await databases.createBooleanAttribute(
          DATABASE_ID,
          collectionId,
          attribute.key,
          attribute.required || false,
          attribute.default,
          attribute.array || false
        );
        break;
      
      case 'datetime':
        result = await databases.createDatetimeAttribute(
          DATABASE_ID,
          collectionId,
          attribute.key,
          attribute.required || false,
          attribute.default,
          attribute.array || false
        );
        break;
      
      case 'enum':
        result = await databases.createEnumAttribute(
          DATABASE_ID,
          collectionId,
          attribute.key,
          attribute.elements || [],
          attribute.required || false,
          attribute.default,
          attribute.array || false
        );
        break;
      
      default:
        throw new Error(`Unknown attribute type: ${attribute.type}`);
    }
    
    log(`  ✅ Created attribute: ${attribute.key} (${attribute.type})`, 'green');
    return result;
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      log(`  ⏭️  Attribute ${attribute.key} already exists`, 'yellow');
    } else {
      log(`  ❌ Failed to create attribute ${attribute.key}: ${error.message}`, 'red');
    }
    return null;
  }
}

async function createIndex(collectionId, index) {
  try {
    const result = await databases.createIndex(
      DATABASE_ID,
      collectionId,
      index.key,
      index.type,
      index.attributes,
      index.orders
    );
    log(`  ✅ Created index: ${index.key}`, 'green');
    return result;
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      log(`  ⏭️  Index ${index.key} already exists`, 'yellow');
    } else {
      log(`  ❌ Failed to create index ${index.key}: ${error.message}`, 'red');
    }
    return null;
  }
}

async function ensureCollection(collectionKey) {
  const collectionId = COLLECTIONS[collectionKey];
  const schema = SCHEMA[collectionKey];
  
  log(`\n📦 Processing collection: ${schema.name} (${collectionId})`, 'cyan');
  
  // Check if collection exists
  let collection;
  try {
    collection = await databases.getCollection(DATABASE_ID, collectionId);
    log(`  Collection exists with ${collection.attributes?.length || 0} attributes`, 'green');
  } catch (error) {
    if (error.code === 404) {
      // Create collection
      log(`  Creating collection...`, 'yellow');
      try {
        collection = await databases.createCollection(
          DATABASE_ID,
          collectionId,
          schema.name,
          []
        );
        log(`  ✅ Collection created`, 'green');
      } catch (createError) {
        log(`  ❌ Failed to create collection: ${createError.message}`, 'red');
        return;
      }
    } else {
      log(`  ❌ Error checking collection: ${error.message}`, 'red');
      return;
    }
  }
  
  // Get existing attributes
  const existingAttributes = collection.attributes || [];
  const existingKeys = existingAttributes.map(attr => attr.key);
  
  // Add missing attributes
  log(`  Checking attributes...`, 'cyan');
  for (const attribute of schema.attributes) {
    if (!existingKeys.includes(attribute.key)) {
      await createAttribute(collectionId, attribute);
      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      log(`  ✓ Attribute ${attribute.key} exists`, 'cyan');
    }
  }
  
  // Add indexes
  if (schema.indexes && schema.indexes.length > 0) {
    log(`  Checking indexes...`, 'cyan');
    const existingIndexes = collection.indexes || [];
    const existingIndexKeys = existingIndexes.map(idx => idx.key);
    
    for (const index of schema.indexes) {
      if (!existingIndexKeys.includes(index.key)) {
        await createIndex(collectionId, index);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        log(`  ✓ Index ${index.key} exists`, 'cyan');
      }
    }
  }
}

async function main() {
  log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════╗
║     Appwrite Schema Sync Tool            ║
╚══════════════════════════════════════════╝${colors.reset}
`);
  
  // Check configuration
  if (!process.env.APPWRITE_API_KEY) {
    log('❌ APPWRITE_API_KEY not found in .env.local', 'red');
    process.exit(1);
  }
  
  log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'}`, 'cyan');
  log(`📍 Project: ${process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'}`, 'cyan');
  log(`📍 Database: ${DATABASE_ID}`, 'cyan');
  
  try {
    // Process each collection
    for (const collectionKey of Object.keys(SCHEMA)) {
      await ensureCollection(collectionKey);
    }
    
    log(`\n✨ Schema sync complete!`, 'green');
    log(`\n📝 Next steps:`, 'yellow');
    log(`  1. Test the join league feature`, 'yellow');
    log(`  2. Check for any remaining errors`, 'yellow');
    log(`  3. Monitor the activity log for issues`, 'yellow');
    
  } catch (error) {
    log(`\n❌ Schema sync failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}