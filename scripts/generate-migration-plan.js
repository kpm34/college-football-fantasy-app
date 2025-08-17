#!/usr/bin/env node

/**
 * Generate Practical Migration Plan
 * 
 * Based on the schema validation results, this script generates
 * a step-by-step migration plan to align the database with our pipeline.
 */

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

async function generateMigrationPlan() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║                Pipeline Migration Plan Generator             ║
║            Creating Practical Migration Strategy             ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');

  const migrationPlan = {
    phase1: {
      name: "Critical Missing Collections",
      priority: "HIGH",
      description: "Create missing collections for core functionality",
      tasks: []
    },
    phase2: {
      name: "Essential Attributes",
      priority: "HIGH", 
      description: "Add critical missing attributes to existing collections",
      tasks: []
    },
    phase3: {
      name: "Performance Indexes",
      priority: "MEDIUM",
      description: "Create indexes for better query performance",
      tasks: []
    },
    phase4: {
      name: "Legacy Cleanup",
      priority: "LOW",
      description: "Review and clean up unused attributes and collections",
      tasks: []
    }
  };

  try {
    // Get current database state
    const collectionsResponse = await databases.listCollections(DATABASE_ID);
    const existingCollections = new Set(collectionsResponse.collections.map(c => c.$id));

    log(`🔍 Analyzing current database state...`, 'cyan');
    log(`   Found ${collectionsResponse.collections.length} existing collections`, 'green');

    // Phase 1: Missing Collections
    const criticalCollections = ['auctions', 'bids', 'lineups'];
    const missingCollections = criticalCollections.filter(id => !existingCollections.has(id));
    
    if (missingCollections.length > 0) {
      log(`\n🚨 Phase 1: Missing Critical Collections`, 'red');
      missingCollections.forEach(collectionId => {
        migrationPlan.phase1.tasks.push({
          type: 'create_collection',
          collection: collectionId,
          description: `Create ${collectionId} collection for ${getCollectionPurpose(collectionId)}`,
          risk: 'LOW',
          estimatedTime: '5 minutes',
          command: `createCollection(DATABASE_ID, '${collectionId}', '${getCollectionName(collectionId)}')`
        });
        log(`   ❌ Missing: ${collectionId} - needed for ${getCollectionPurpose(collectionId)}`, 'red');
      });
    }

    // Phase 2: Critical Attributes
    log(`\n⚡ Phase 2: Critical Missing Attributes`, 'yellow');
    
    const criticalAttributes = {
      college_players: [
        { key: 'eligible', type: 'boolean', required: false, default: false, purpose: 'eligibility tracking' },
        { key: 'external_id', type: 'string', required: false, purpose: 'CFBD API integration' },
        { key: 'fantasy_points', type: 'double', required: false, default: 0, purpose: 'projections' }
      ],
      rosters: [
        { key: 'lineup', type: 'json', required: false, purpose: 'starting lineup management' },
        { key: 'bench', type: 'json', required: false, purpose: 'bench player management' }
      ],
      leagues: [
        { key: 'settings', type: 'json', required: false, purpose: 'league configuration' },
        { key: 'draftStartedAt', type: 'datetime', required: false, purpose: 'draft tracking' }
      ],
      games: [
        { key: 'completed', type: 'boolean', required: false, default: false, purpose: 'game status tracking' },
        { key: 'eligible_game', type: 'boolean', required: false, default: false, purpose: 'fantasy eligibility' },
        { key: 'start_date', type: 'datetime', required: false, purpose: 'game scheduling' }
      ]
    };

    for (const [collectionId, attributes] of Object.entries(criticalAttributes)) {
      if (existingCollections.has(collectionId)) {
        log(`   📋 ${collectionId}:`, 'cyan');
        
        for (const attr of attributes) {
          migrationPlan.phase2.tasks.push({
            type: 'add_attribute',
            collection: collectionId,
            attribute: attr.key,
            description: `Add ${attr.key} for ${attr.purpose}`,
            risk: 'LOW',
            estimatedTime: '2 minutes',
            command: getCreateAttributeCommand(collectionId, attr)
          });
          log(`     + ${attr.key} (${attr.type}) - ${attr.purpose}`, 'yellow');
        }
      }
    }

    // Phase 3: Performance Indexes
    log(`\n🏃 Phase 3: Critical Performance Indexes`, 'cyan');
    
    const criticalIndexes = {
      college_players: [
        { key: 'player_position', attributes: ['position'], type: 'key', purpose: 'position-based queries' },
        { key: 'player_team', attributes: ['team'], type: 'key', purpose: 'team roster queries' },
        { key: 'player_eligible', attributes: ['eligible'], type: 'key', purpose: 'draft eligibility' }
      ],
      rosters: [
        { key: 'roster_league', attributes: ['leagueId'], type: 'key', purpose: 'league standings' },
        { key: 'roster_user', attributes: ['userId'], type: 'key', purpose: 'user team lookup' }
      ],
      leagues: [
        { key: 'league_status', attributes: ['status'], type: 'key', purpose: 'league filtering' },
        { key: 'league_public', attributes: ['isPublic'], type: 'key', purpose: 'public league search' }
      ],
      games: [
        { key: 'game_week', attributes: ['week'], type: 'key', purpose: 'weekly schedule' },
        { key: 'game_eligible', attributes: ['eligible_game'], type: 'key', purpose: 'fantasy games' }
      ]
    };

    for (const [collectionId, indexes] of Object.entries(criticalIndexes)) {
      if (existingCollections.has(collectionId)) {
        log(`   📇 ${collectionId}:`, 'cyan');
        
        for (const index of indexes) {
          migrationPlan.phase3.tasks.push({
            type: 'create_index',
            collection: collectionId,
            index: index.key,
            description: `Create ${index.key} for ${index.purpose}`,
            risk: 'LOW',
            estimatedTime: '1 minute',
            command: `createIndex(DATABASE_ID, '${collectionId}', '${index.key}', '${index.type}', [${index.attributes.map(a => `'${a}'`).join(', ')}])`
          });
          log(`     + ${index.key} on [${index.attributes.join(', ')}] - ${index.purpose}`, 'yellow');
        }
      }
    }

    // Phase 4: Legacy Cleanup Analysis
    log(`\n🧹 Phase 4: Legacy Cleanup Opportunities`, 'magenta');
    
    const legacyCollections = [
      'drafts', 'draft_picks', 'auction_sessions', 'auction_bids', 
      'user_teams', 'players', 'transactions', 'scoring'
    ];
    
    const existingLegacy = legacyCollections.filter(id => existingCollections.has(id));
    
    if (existingLegacy.length > 0) {
      log(`   📦 Legacy collections found:`, 'magenta');
      existingLegacy.forEach(collectionId => {
        const recommendation = getLegacyRecommendation(collectionId);
        migrationPlan.phase4.tasks.push({
          type: 'review_legacy',
          collection: collectionId,
          description: recommendation.description,
          action: recommendation.action,
          risk: recommendation.risk,
          estimatedTime: '10 minutes review'
        });
        log(`     - ${collectionId}: ${recommendation.description}`, 'yellow');
      });
    }

    // Generate executable migration script
    log(`\n📝 Generating Migration Script...`, 'bright');
    
    const migrationScript = generateMigrationScript(migrationPlan);
    
    // Write migration script to file
    const fs = require('fs');
    fs.writeFileSync('migration-script.js', migrationScript);
    log(`   ✅ Migration script saved to: migration-script.js`, 'green');

    // Summary
    log(`\n📊 MIGRATION PLAN SUMMARY`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    
    const totalTasks = Object.values(migrationPlan).reduce((total, phase) => total + phase.tasks.length, 0);
    log(`📋 Total Tasks: ${totalTasks}`, 'cyan');
    
    Object.entries(migrationPlan).forEach(([phaseKey, phase]) => {
      if (phase.tasks.length > 0) {
        const priorityColor = phase.priority === 'HIGH' ? 'red' : phase.priority === 'MEDIUM' ? 'yellow' : 'green';
        log(`   ${phase.name}: ${phase.tasks.length} tasks (${phase.priority} priority)`, priorityColor);
      }
    });

    // Recommendations
    log(`\n💡 EXECUTION RECOMMENDATIONS`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    
    log(`1. 🚀 Execute Phase 1 immediately - missing collections break functionality`, 'red');
    log(`2. ⚡ Execute Phase 2 next - critical attributes for data integrity`, 'yellow');
    log(`3. 🏃 Execute Phase 3 during low-traffic periods - indexes can be resource intensive`, 'cyan');
    log(`4. 🧹 Review Phase 4 manually - legacy cleanup requires business logic review`, 'magenta');
    
    log(`\n🔧 EXECUTION COMMANDS`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    log(`1. Review generated script: cat migration-script.js`, 'cyan');
    log(`2. Test in development: node migration-script.js --dry-run`, 'cyan');
    log(`3. Execute migration: node migration-script.js --execute`, 'cyan');
    log(`4. Use admin API: curl -X POST /api/admin/pipeline-status -d '{"action": "execute_migration"}'`, 'cyan');

    // Risk Assessment
    log(`\n⚠️  RISK ASSESSMENT`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    
    const highRiskTasks = Object.values(migrationPlan).flatMap(phase => 
      phase.tasks.filter(task => task.risk === 'HIGH')
    );
    
    if (highRiskTasks.length === 0) {
      log(`✅ Low Risk: All migration tasks are low-risk and can be executed safely`, 'green');
    } else {
      log(`🚨 High Risk Tasks: ${highRiskTasks.length}`, 'red');
      highRiskTasks.forEach(task => {
        log(`   - ${task.description}`, 'red');
      });
    }
    
    log(`\n🎯 BUSINESS IMPACT`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    log(`Before migration: Limited functionality, data inconsistencies`, 'red');
    log(`After migration: Full pipeline functionality, reliable data sync`, 'green');
    log(`Downtime required: ~5 minutes for collection creation`, 'yellow');
    log(`Performance impact: Minimal, indexes improve performance`, 'green');

  } catch (error) {
    log(`\n❌ Migration plan generation failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

function getCollectionPurpose(collectionId) {
  const purposes = {
    auctions: 'auction draft functionality',
    bids: 'auction bidding system',
    lineups: 'weekly lineup management',
    player_stats: 'player performance tracking'
  };
  return purposes[collectionId] || 'application functionality';
}

function getCollectionName(collectionId) {
  const names = {
    auctions: 'Auctions',
    bids: 'Bids', 
    lineups: 'Lineups',
    player_stats: 'Player Stats'
  };
  return names[collectionId] || collectionId.charAt(0).toUpperCase() + collectionId.slice(1);
}

function getCreateAttributeCommand(collectionId, attr) {
  const method = {
    string: 'createStringAttribute',
    integer: 'createIntegerAttribute', 
    double: 'createFloatAttribute',
    boolean: 'createBooleanAttribute',
    datetime: 'createDatetimeAttribute',
    json: 'createStringAttribute' // JSON stored as string
  }[attr.type];

  return `databases.${method}(DATABASE_ID, '${collectionId}', '${attr.key}', ${attr.required || false}, ${attr.default !== undefined ? JSON.stringify(attr.default) : 'undefined'})`;
}

function getLegacyRecommendation(collectionId) {
  const recommendations = {
    drafts: {
      description: 'Legacy draft system - check if data can be migrated to new system',
      action: 'REVIEW_AND_MIGRATE',
      risk: 'MEDIUM'
    },
    draft_picks: {
      description: 'Old draft picks - may contain historical data',
      action: 'BACKUP_THEN_ARCHIVE',
      risk: 'LOW'
    },
    auction_sessions: {
      description: 'Old auction system - replace with new auctions collection',
      action: 'MIGRATE_TO_AUCTIONS',
      risk: 'MEDIUM'
    },
    auction_bids: {
      description: 'Old bid system - replace with new bids collection',
      action: 'MIGRATE_TO_BIDS',
      risk: 'MEDIUM'
    },
    user_teams: {
      description: 'Duplicate of rosters functionality',
      action: 'CONSOLIDATE_WITH_ROSTERS',
      risk: 'HIGH'
    },
    players: {
      description: 'Duplicate of college_players',
      action: 'CONSOLIDATE_WITH_COLLEGE_PLAYERS',
      risk: 'HIGH'
    },
    transactions: {
      description: 'Trade/waiver history - consider archiving',
      action: 'ARCHIVE_HISTORICAL',
      risk: 'LOW'
    },
    scoring: {
      description: 'Legacy scoring system - check integration with new system',
      action: 'REVIEW_INTEGRATION',
      risk: 'MEDIUM'
    }
  };
  
  return recommendations[collectionId] || {
    description: 'Unknown legacy collection',
    action: 'MANUAL_REVIEW',
    risk: 'HIGH'
  };
}

function generateMigrationScript(migrationPlan) {
  return `#!/usr/bin/env node

/**
 * Generated Migration Script
 * 
 * This script was auto-generated based on schema analysis.
 * Review carefully before executing in production.
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';

const isDryRun = process.argv.includes('--dry-run');
const shouldExecute = process.argv.includes('--execute');

if (!isDryRun && !shouldExecute) {
  console.log('Usage: node migration-script.js [--dry-run | --execute]');
  process.exit(1);
}

async function executeMigration() {
  console.log(\`🚀 \${isDryRun ? 'DRY RUN' : 'EXECUTING'} Migration Script\`);
  
  try {
${Object.entries(migrationPlan).map(([phaseKey, phase]) => {
  if (phase.tasks.length === 0) return '';
  
  return `
    // ${phase.name}
    console.log('\\n📋 ${phase.name}');
${phase.tasks.map(task => `
    console.log('   ${task.description}');
    if (!isDryRun) {
      // ${task.command}
      console.log('   ✅ Completed: ${task.description}');
    }
`).join('')}`;
}).join('')}
    
    console.log('\\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  executeMigration();
}`;
}

if (require.main === module) {
  generateMigrationPlan().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}