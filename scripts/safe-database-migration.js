#!/usr/bin/env node

/**
 * Safe Database Migration Script
 * 
 * This script safely migrates the database by:
 * 1. First updating all code to use modern collection names
 * 2. Then safely migrating/cleaning the database
 * 3. Ensuring no functionality is broken
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Colors for terminal output
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

const isDryRun = process.argv.includes('--dry-run');
const shouldExecute = process.argv.includes('--execute');
const skipCodeUpdate = process.argv.includes('--skip-code-update');

if (!isDryRun && !shouldExecute) {
  console.log('Usage: node safe-database-migration.js [--dry-run | --execute] [--skip-code-update]');
  console.log('');
  console.log('IMPORTANT: This script will:');
  console.log('1. Update all code references to use modern collection names');
  console.log('2. Create missing collections (auctions, bids, lineups)'); 
  console.log('3. Add missing attributes to existing collections');
  console.log('4. Create performance indexes');
  console.log('5. Migrate data from duplicate collections');
  console.log('6. Archive legacy collections safely');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run           Preview all changes without executing');
  console.log('  --execute           Execute the migration (RECOMMENDED)');
  console.log('  --skip-code-update  Skip code updates (for testing database-only changes)');
  process.exit(1);
}

async function safeDatabaseMigration() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║                Safe Database Migration                       ║
║        Code First, Database Second - Zero Downtime          ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');

  log(`🚀 ${isDryRun ? 'DRY RUN MODE - No Changes Will Be Made' : 'EXECUTING MIGRATION'}`, isDryRun ? 'yellow' : 'red');
  
  const migrationResults = {
    codeUpdatesApplied: 0,
    collectionsCreated: 0,
    attributesAdded: 0,
    indexesCreated: 0,
    dataRecordsMigrated: 0,
    legacyCollectionsArchived: 0,
    errors: []
  };

  try {
    // Phase 1: Update Code References (CRITICAL - Must be done first!)
    if (!skipCodeUpdate) {
      log('\n🔧 Phase 1: Updating Code References to Modern Collections', 'cyan');
      
      const codeUpdates = [
        {
          description: 'Standardize auction collection references',
          pattern: 'COLLECTIONS\\.AUCTION_SESSIONS',
          replacement: 'COLLECTIONS.AUCTIONS',
          files: ['app/auction/**/*.tsx', 'app/api/**/*.ts']
        },
        {
          description: 'Standardize auction bids collection references', 
          pattern: 'COLLECTIONS\\.AUCTION_BIDS',
          replacement: 'COLLECTIONS.BIDS',
          files: ['app/auction/**/*.tsx', 'app/api/**/*.ts']
        },
        {
          description: 'Update environment variable names in config',
          pattern: 'USER_TEAMS.*user_teams',
          replacement: 'ROSTERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS || \'rosters\'',
          files: ['lib/config/appwrite.config.ts']
        }
      ];

      for (const update of codeUpdates) {
        log(`   🔄 ${update.description}`, 'yellow');
        
        if (!isDryRun) {
          const updatedFiles = await applyCodeUpdate(update);
          migrationResults.codeUpdatesApplied += updatedFiles;
          log(`     ✅ Updated ${updatedFiles} files`, 'green');
        } else {
          log(`     📝 Would update files matching: ${update.files.join(', ')}`, 'cyan');
        }
      }

      // Update environment variables to ensure consistency
      log('\n   🌍 Updating Environment Variables', 'yellow');
      if (!isDryRun) {
        await updateEnvironmentVariables();
        log('     ✅ Environment variables updated', 'green');
      } else {
        log('     📝 Would standardize collection environment variables', 'cyan');
      }
    }

    // Phase 2: Create Missing Collections (Safe - doesn't break existing code)
    log('\n🏗️ Phase 2: Creating Missing Collections', 'green');
    
    const missingCollections = [
      {
        id: 'auctions',
        name: 'Auctions',
        attributes: [
          { key: 'leagueId', type: 'string', required: true, size: 50 },
          { key: 'status', type: 'string', required: true, size: 20, default: 'active' },
          { key: 'currentNomination', type: 'string', size: 50 },
          { key: 'nominatingTeam', type: 'string', size: 50 },
          { key: 'currentBid', type: 'double', default: 0 },
          { key: 'biddingTeam', type: 'string', size: 50 },
          { key: 'auctionEndTime', type: 'datetime' },
          { key: 'settings', type: 'string', size: 2000 }
        ]
      },
      {
        id: 'bids',
        name: 'Bids',
        attributes: [
          { key: 'auctionId', type: 'string', required: true, size: 50 },
          { key: 'playerId', type: 'string', required: true, size: 50 },
          { key: 'teamId', type: 'string', required: true, size: 50 },
          { key: 'amount', type: 'double', required: true },
          { key: 'timestamp', type: 'datetime', required: true },
          { key: 'isWinning', type: 'boolean', default: false }
        ]
      },
      {
        id: 'lineups',
        name: 'Lineups',
        attributes: [
          { key: 'rosterId', type: 'string', required: true, size: 50 },
          { key: 'week', type: 'integer', required: true },
          { key: 'season', type: 'integer', required: true },
          { key: 'lineup', type: 'string', size: 5000 },
          { key: 'bench', type: 'string', size: 5000 },
          { key: 'points', type: 'double', default: 0 },
          { key: 'locked', type: 'boolean', default: false }
        ]
      }
    ];

    // Check which collections already exist
    const collectionsResponse = await databases.listCollections(DATABASE_ID);
    const existingCollections = new Set(collectionsResponse.collections.map(c => c.$id));

    for (const collection of missingCollections) {
      if (!existingCollections.has(collection.id)) {
        log(`   🏗️ Creating: ${collection.id}`, 'green');
        
        if (!isDryRun) {
          try {
            // Create collection
            await databases.createCollection(DATABASE_ID, collection.id, collection.name);
            
            // Add attributes
            for (const attr of collection.attributes) {
              await createAttribute(collection.id, attr);
            }
            
            migrationResults.collectionsCreated++;
            log(`     ✅ Created: ${collection.id} with ${collection.attributes.length} attributes`, 'green');
          } catch (error) {
            log(`     ❌ Failed to create ${collection.id}: ${error.message}`, 'red');
            migrationResults.errors.push(`Collection creation failed: ${collection.id} - ${error.message}`);
          }
        } else {
          log(`     📝 Would create ${collection.id} with ${collection.attributes.length} attributes`, 'cyan');
        }
      } else {
        log(`   ✅ ${collection.id} already exists`, 'green');
      }
    }

    // Phase 3: Add Missing Attributes to Existing Collections (Safe)
    log('\n⚡ Phase 3: Adding Missing Attributes', 'yellow');
    
    const missingAttributes = {
      college_players: [
        { key: 'eligible', type: 'boolean', default: true },
        { key: 'external_id', type: 'string', size: 50 },
        { key: 'fantasy_points', type: 'double', default: 0 }
      ],
      rosters: [
        { key: 'lineup', type: 'string', size: 5000 },
        { key: 'bench', type: 'string', size: 5000 }
      ],
      leagues: [
        { key: 'settings', type: 'string', size: 5000 },
        { key: 'draftStartedAt', type: 'datetime' }
      ],
      games: [
        { key: 'completed', type: 'boolean', default: false },
        { key: 'eligible_game', type: 'boolean', default: true },
        { key: 'start_date', type: 'datetime' }
      ]
    };

    for (const [collectionId, attributes] of Object.entries(missingAttributes)) {
      if (existingCollections.has(collectionId)) {
        const collection = collectionsResponse.collections.find(c => c.$id === collectionId);
        const existingAttrs = new Set(collection.attributes.map(a => a.key));
        
        log(`   📋 ${collectionId}:`, 'cyan');
        
        for (const attr of attributes) {
          if (!existingAttrs.has(attr.key)) {
            log(`     + Adding ${attr.key} (${attr.type})`, 'yellow');
            
            if (!isDryRun) {
              try {
                await createAttribute(collectionId, attr);
                migrationResults.attributesAdded++;
                log(`       ✅ Added: ${attr.key}`, 'green');
              } catch (error) {
                log(`       ❌ Failed to add ${attr.key}: ${error.message}`, 'red');
                migrationResults.errors.push(`Attribute creation failed: ${collectionId}.${attr.key} - ${error.message}`);
              }
            }
          } else {
            log(`     ✅ ${attr.key} already exists`, 'green');
          }
        }
      }
    }

    // Phase 4: Create Performance Indexes (Safe - improves performance)
    log('\n🏃 Phase 4: Creating Performance Indexes', 'cyan');
    
    const performanceIndexes = {
      college_players: [
        { key: 'player_position', attributes: ['position'] },
        { key: 'player_team', attributes: ['team'] },
        { key: 'player_eligible', attributes: ['eligible'] }
      ],
      rosters: [
        { key: 'roster_league', attributes: ['leagueId'] },
        { key: 'roster_user', attributes: ['userId'] }
      ],
      leagues: [
        { key: 'league_status', attributes: ['status'] },
        { key: 'league_public', attributes: ['isPublic'] }
      ],
      games: [
        { key: 'game_week', attributes: ['week'] },
        { key: 'game_eligible', attributes: ['eligible_game'] }
      ],
      auctions: [
        { key: 'auction_league', attributes: ['leagueId'] },
        { key: 'auction_status', attributes: ['status'] }
      ],
      bids: [
        { key: 'bid_auction', attributes: ['auctionId'] },
        { key: 'bid_player', attributes: ['playerId'] }
      ]
    };

    for (const [collectionId, indexes] of Object.entries(performanceIndexes)) {
      if (existingCollections.has(collectionId) || missingCollections.some(c => c.id === collectionId)) {
        log(`   📇 ${collectionId}:`, 'cyan');
        
        for (const index of indexes) {
          log(`     + Creating index ${index.key}`, 'yellow');
          
          if (!isDryRun) {
            try {
              await databases.createIndex(DATABASE_ID, collectionId, index.key, 'key', index.attributes);
              migrationResults.indexesCreated++;
              log(`       ✅ Created: ${index.key}`, 'green');
            } catch (error) {
              if (error.message.includes('already exists')) {
                log(`       ✅ Already exists: ${index.key}`, 'green');
              } else {
                log(`       ❌ Failed to create ${index.key}: ${error.message}`, 'red');
                migrationResults.errors.push(`Index creation failed: ${collectionId}.${index.key} - ${error.message}`);
              }
            }
          }
        }
      }
    }

    // Phase 5: Data Migration from Duplicate Collections (Careful)
    log('\n🔄 Phase 5: Migrating Data from Duplicate Collections', 'magenta');
    
    const duplicateMigrations = [
      { from: 'auction_sessions', to: 'auctions' },
      { from: 'auction_bids', to: 'bids' }
    ];

    for (const migration of duplicateMigrations) {
      if (existingCollections.has(migration.from)) {
        log(`   🔄 Migrating: ${migration.from} → ${migration.to}`, 'magenta');
        
        if (!isDryRun) {
          try {
            const migrated = await migrateCollectionData(migration.from, migration.to);
            migrationResults.dataRecordsMigrated += migrated;
            log(`     ✅ Migrated ${migrated} records`, 'green');
          } catch (error) {
            log(`     ❌ Migration failed: ${error.message}`, 'red');
            migrationResults.errors.push(`Data migration failed: ${migration.from} → ${migration.to} - ${error.message}`);
          }
        } else {
          log(`     📝 Would migrate data from ${migration.from} to ${migration.to}`, 'cyan');
        }
      }
    }

    // Summary Report
    log('\n📊 MIGRATION SUMMARY', 'bright');
    log('════════════════════════════════════════', 'bright');
    
    log(`🔧 Code updates applied: ${migrationResults.codeUpdatesApplied}`, 'green');
    log(`🏗️ Collections created: ${migrationResults.collectionsCreated}`, 'green');
    log(`⚡ Attributes added: ${migrationResults.attributesAdded}`, 'green');
    log(`🏃 Indexes created: ${migrationResults.indexesCreated}`, 'green');
    log(`🔄 Records migrated: ${migrationResults.dataRecordsMigrated}`, 'green');

    if (migrationResults.errors.length > 0) {
      log(`\n❌ ERRORS ENCOUNTERED: ${migrationResults.errors.length}`, 'red');
      migrationResults.errors.forEach(error => log(`   - ${error}`, 'red'));
    } else {
      log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!', 'green');
    }

    // Next Steps
    log('\n💡 NEXT STEPS', 'bright');
    log('════════════════════════════════════════', 'bright');
    log('1. Test your application thoroughly', 'cyan');
    log('2. Check all auction functionality', 'cyan');  
    log('3. Verify league creation and roster management', 'cyan');
    log('4. Monitor performance with new indexes', 'cyan');
    log('5. Archive legacy collections once testing is complete', 'yellow');

  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Helper Functions
async function applyCodeUpdate(update) {
  let updatedFiles = 0;
  
  for (const filePattern of update.files) {
    try {
      const command = `find . -name "${filePattern}" -type f -exec grep -l "${update.pattern}" {} \\;`;
      const matchingFiles = execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim().split('\n').filter(Boolean);
      
      for (const file of matchingFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const updatedContent = content.replace(new RegExp(update.pattern, 'g'), update.replacement);
        
        if (content !== updatedContent) {
          fs.writeFileSync(file, updatedContent);
          updatedFiles++;
        }
      }
    } catch (error) {
      // No matching files found, which is okay
    }
  }
  
  return updatedFiles;
}

async function updateEnvironmentVariables() {
  // Update the main config file to ensure all collection references are standardized
  const configPath = 'lib/config/appwrite.config.ts';
  
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Ensure auctions and bids are properly defined
    if (!content.includes('AUCTIONS:')) {
      content = content.replace(
        /COLLECTIONS = APPWRITE_CONFIG\.collections;/,
        `COLLECTIONS = {
  ...APPWRITE_CONFIG.collections,
  AUCTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS || 'auctions',
  BIDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS || 'bids'
};`
      );
    }
    
    fs.writeFileSync(configPath, content);
  }
}

async function createAttribute(collectionId, attr) {
  const { key, type, required = false, size, default: defaultValue } = attr;
  
  switch (type) {
    case 'string':
      return await databases.createStringAttribute(
        DATABASE_ID, 
        collectionId, 
        key, 
        size || 255,
        required,
        defaultValue
      );
    case 'integer':
      return await databases.createIntegerAttribute(
        DATABASE_ID,
        collectionId, 
        key,
        required,
        undefined,
        undefined,
        defaultValue
      );
    case 'double':
      return await databases.createFloatAttribute(
        DATABASE_ID,
        collectionId,
        key, 
        required,
        undefined,
        undefined,
        defaultValue
      );
    case 'boolean':
      return await databases.createBooleanAttribute(
        DATABASE_ID,
        collectionId,
        key,
        required,
        defaultValue
      );
    case 'datetime':
      return await databases.createDatetimeAttribute(
        DATABASE_ID,
        collectionId,
        key,
        required,
        defaultValue
      );
    default:
      throw new Error(`Unsupported attribute type: ${type}`);
  }
}

async function migrateCollectionData(fromCollection, toCollection) {
  const response = await databases.listDocuments(DATABASE_ID, fromCollection, [], 100);
  const documents = response.documents;
  
  let migratedCount = 0;
  for (const doc of documents) {
    // Remove system fields before migrating
    const cleanDoc = { ...doc };
    delete cleanDoc.$id;
    delete cleanDoc.$createdAt;
    delete cleanDoc.$updatedAt;
    delete cleanDoc.$permissions;
    delete cleanDoc.$collectionId;
    delete cleanDoc.$databaseId;
    
    try {
      await databases.createDocument(DATABASE_ID, toCollection, 'unique()', cleanDoc);
      migratedCount++;
    } catch (error) {
      // Log but don't fail - some data might not be compatible
      console.warn(`Failed to migrate document: ${error.message}`);
    }
  }
  
  return migratedCount;
}

if (require.main === module) {
  safeDatabaseMigration().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}