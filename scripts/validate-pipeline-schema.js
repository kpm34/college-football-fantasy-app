#!/usr/bin/env node

/**
 * Validate Pipeline Schema Against Actual Appwrite Database
 * 
 * This script uses the Appwrite API to inspect the actual database
 * and compare it with our pipeline schema definitions.
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

// Our pipeline schema definitions (imported from the pipeline schema)
const PIPELINE_SCHEMA = {
  leagues: {
    expectedAttributes: [
      'name', 'commissioner', 'season', 'maxTeams', 'currentTeams', 
      'draftType', 'gameMode', 'status', 'isPublic', 'pickTimeSeconds', 
      'scoringRules', 'draftDate', 'draftStartedAt', 'settings'
    ],
    expectedIndexes: [
      'league_status', 'league_commissioner', 'league_public', 'league_search'
    ]
  },
  rosters: {
    expectedAttributes: [
      'leagueId', 'userId', 'teamName', 'abbreviation', 'draftPosition',
      'wins', 'losses', 'ties', 'pointsFor', 'pointsAgainst', 
      'players', 'lineup', 'bench'
    ],
    expectedIndexes: [
      'roster_league', 'roster_user', 'roster_league_user', 'roster_standings'
    ]
  },
  college_players: {
    expectedAttributes: [
      'name', 'position', 'team', 'conference', 'jerseyNumber', 
      'height', 'weight', 'year', 'eligible', 'fantasy_points',
      'season_fantasy_points', 'depth_chart_order', 'last_projection_update',
      'external_id', 'image_url', 'stats'
    ],
    expectedIndexes: [
      'player_name', 'player_team', 'player_position', 'player_conference',
      'player_eligible', 'player_projections', 'player_external'
    ]
  },
  teams: {
    expectedAttributes: [
      'name', 'abbreviation', 'conference', 'division', 'color',
      'alt_color', 'logo', 'mascot', 'venue', 'location'
    ],
    expectedIndexes: [
      'team_name', 'team_conference', 'team_abbreviation'
    ]
  },
  games: {
    expectedAttributes: [
      'week', 'season', 'season_type', 'home_team', 'away_team',
      'home_score', 'away_score', 'start_date', 'completed',
      'conference_game', 'eligible_game', 'venue', 'tv_coverage', 'external_id'
    ],
    expectedIndexes: [
      'game_week', 'game_season', 'game_teams', 'game_eligible', 
      'game_completed', 'game_date'
    ]
  },
  rankings: {
    expectedAttributes: [
      'week', 'season', 'poll_type', 'team', 'rank', 
      'points', 'first_place_votes'
    ],
    expectedIndexes: [
      'ranking_week', 'ranking_season', 'ranking_team', 
      'ranking_ap', 'ranking_order'
    ]
  },
  auctions: {
    expectedAttributes: [
      'leagueId', 'status', 'currentNomination', 'nominatingTeam',
      'currentBid', 'biddingTeam', 'auctionEndTime', 'settings'
    ],
    expectedIndexes: [
      'auction_league', 'auction_status'
    ]
  },
  bids: {
    expectedAttributes: [
      'auctionId', 'playerId', 'teamId', 'amount', 'timestamp', 'isWinning'
    ],
    expectedIndexes: [
      'bid_auction', 'bid_player', 'bid_team', 'bid_timestamp'
    ]
  },
  player_stats: {
    expectedAttributes: [
      'playerId', 'gameId', 'week', 'season', 'opponent', 
      'fantasy_points', 'stats', 'eligible'
    ],
    expectedIndexes: [
      'stats_player', 'stats_game', 'stats_week', 'stats_player_week'
    ]
  },
  lineups: {
    expectedAttributes: [
      'rosterId', 'week', 'season', 'lineup', 'bench', 'points', 'locked'
    ],
    expectedIndexes: [
      'lineup_roster', 'lineup_week', 'lineup_roster_week'
    ]
  },
  users: {
    expectedAttributes: [
      'authId', 'email', 'displayName', 'avatarUrl', 'preferences', 
      'stats', 'lastActive'
    ],
    expectedIndexes: [
      'user_auth', 'user_email', 'user_name'
    ]
  },
  activity_log: {
    expectedAttributes: [
      'userId', 'leagueId', 'action', 'details', 'timestamp',
      'ip_address', 'user_agent'
    ],
    expectedIndexes: [
      'log_user', 'log_league', 'log_action', 'log_timestamp'
    ]
  }
};

async function validatePipelineSchema() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║              Pipeline Schema Validation Tool                 ║
║         Comparing Pipeline vs Actual Database Schema         ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');
  
  // Check configuration
  if (!process.env.APPWRITE_API_KEY) {
    log('❌ APPWRITE_API_KEY not found in environment variables', 'red');
    log('   Please ensure .env.local contains your Appwrite API key', 'yellow');
    process.exit(1);
  }
  
  log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'}`, 'cyan');
  log(`🎯 Project: ${process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'}`, 'cyan');
  log(`💾 Database: ${DATABASE_ID}`, 'cyan');
  
  const results = {
    collectionsChecked: 0,
    collectionsFound: 0,
    collectionsMissing: 0,
    attributesMatching: 0,
    attributesMissing: 0,
    attributesExtra: 0,
    indexesMatching: 0,
    indexesMissing: 0,
    indexesExtra: 0,
    issues: []
  };
  
  try {
    // Get list of all collections in the database
    log(`\n🔍 Fetching database collections...`, 'cyan');
    const collectionsResponse = await databases.listCollections(DATABASE_ID);
    const actualCollections = collectionsResponse.collections;
    
    log(`   Found ${actualCollections.length} collections in database`, 'green');
    
    // Create a map of actual collections for easy lookup
    const actualCollectionsMap = {};
    actualCollections.forEach(collection => {
      actualCollectionsMap[collection.$id] = collection;
    });
    
    // Check each collection in our pipeline schema
    for (const [collectionId, expectedSchema] of Object.entries(PIPELINE_SCHEMA)) {
      results.collectionsChecked++;
      
      log(`\n📋 Analyzing collection: ${collectionId}`, 'magenta');
      
      const actualCollection = actualCollectionsMap[collectionId];
      
      if (!actualCollection) {
        results.collectionsMissing++;
        results.issues.push({
          type: 'missing_collection',
          collection: collectionId,
          severity: 'high',
          message: `Collection '${collectionId}' is defined in pipeline but missing from database`
        });
        log(`   ❌ Collection missing from database`, 'red');
        continue;
      }
      
      results.collectionsFound++;
      log(`   ✅ Collection found in database`, 'green');
      
      // Check attributes
      log(`   🔍 Checking attributes...`, 'cyan');
      const actualAttributes = actualCollection.attributes || [];
      const actualAttributeKeys = actualAttributes.map(attr => attr.key);
      const expectedAttributeKeys = expectedSchema.expectedAttributes;
      
      const missingAttributes = expectedAttributeKeys.filter(key => 
        !actualAttributeKeys.includes(key)
      );
      
      const extraAttributes = actualAttributeKeys.filter(key => 
        !expectedAttributeKeys.includes(key) && !key.startsWith('$')
      );
      
      results.attributesMatching += expectedAttributeKeys.length - missingAttributes.length;
      results.attributesMissing += missingAttributes.length;
      results.attributesExtra += extraAttributes.length;
      
      if (missingAttributes.length === 0 && extraAttributes.length === 0) {
        log(`     ✅ All attributes match (${actualAttributeKeys.length} attributes)`, 'green');
      } else {
        if (missingAttributes.length > 0) {
          log(`     ❌ Missing attributes: ${missingAttributes.join(', ')}`, 'red');
          results.issues.push({
            type: 'missing_attributes',
            collection: collectionId,
            severity: 'medium',
            attributes: missingAttributes,
            message: `${missingAttributes.length} attributes missing from database`
          });
        }
        
        if (extraAttributes.length > 0) {
          log(`     ⚠️  Extra attributes: ${extraAttributes.join(', ')}`, 'yellow');
          results.issues.push({
            type: 'extra_attributes',
            collection: collectionId,
            severity: 'low',
            attributes: extraAttributes,
            message: `${extraAttributes.length} extra attributes in database`
          });
        }
      }
      
      // Check specific attribute details
      for (const actualAttr of actualAttributes) {
        if (expectedAttributeKeys.includes(actualAttr.key)) {
          log(`     ✓ ${actualAttr.key}: ${actualAttr.type}${actualAttr.array ? '[]' : ''} ${actualAttr.required ? '(required)' : '(optional)'}`, 'cyan');
        }
      }
      
      // Check indexes
      log(`   🔍 Checking indexes...`, 'cyan');
      const actualIndexes = actualCollection.indexes || [];
      const actualIndexKeys = actualIndexes.map(index => index.key);
      const expectedIndexKeys = expectedSchema.expectedIndexes || [];
      
      const missingIndexes = expectedIndexKeys.filter(key => 
        !actualIndexKeys.includes(key)
      );
      
      const extraIndexes = actualIndexKeys.filter(key => 
        !expectedIndexKeys.includes(key)
      );
      
      results.indexesMatching += expectedIndexKeys.length - missingIndexes.length;
      results.indexesMissing += missingIndexes.length;
      results.indexesExtra += extraIndexes.length;
      
      if (missingIndexes.length === 0 && extraIndexes.length === 0) {
        log(`     ✅ All indexes match (${actualIndexKeys.length} indexes)`, 'green');
      } else {
        if (missingIndexes.length > 0) {
          log(`     ❌ Missing indexes: ${missingIndexes.join(', ')}`, 'red');
          results.issues.push({
            type: 'missing_indexes',
            collection: collectionId,
            severity: 'medium',
            indexes: missingIndexes,
            message: `${missingIndexes.length} indexes missing from database`
          });
        }
        
        if (extraIndexes.length > 0) {
          log(`     ⚠️  Extra indexes: ${extraIndexes.join(', ')}`, 'yellow');
        }
      }
      
      // Show actual indexes
      for (const actualIndex of actualIndexes) {
        const status = expectedIndexKeys.includes(actualIndex.key) ? '✓' : '?';
        log(`     ${status} ${actualIndex.key}: ${actualIndex.type} on [${actualIndex.attributes.join(', ')}]`, 'cyan');
      }
    }
    
    // Check for collections in database that aren't in pipeline
    const pipelineCollectionIds = Object.keys(PIPELINE_SCHEMA);
    const extraCollections = actualCollections.filter(collection => 
      !pipelineCollectionIds.includes(collection.$id)
    );
    
    if (extraCollections.length > 0) {
      log(`\n⚠️  Extra collections in database (not in pipeline):`, 'yellow');
      extraCollections.forEach(collection => {
        log(`   - ${collection.$id} (${collection.name})`, 'yellow');
      });
    }
    
    // Generate summary report
    log(`\n📊 VALIDATION SUMMARY`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    
    // Collections summary
    const collectionMatch = results.collectionsFound / results.collectionsChecked;
    log(`📦 Collections: ${results.collectionsFound}/${results.collectionsChecked} found (${(collectionMatch * 100).toFixed(1)}%)`, 
      collectionMatch === 1 ? 'green' : 'yellow');
    
    if (results.collectionsMissing > 0) {
      log(`   ❌ ${results.collectionsMissing} collections missing from database`, 'red');
    }
    
    // Attributes summary
    const totalExpectedAttrs = results.attributesMatching + results.attributesMissing;
    const attributeMatch = totalExpectedAttrs > 0 ? results.attributesMatching / totalExpectedAttrs : 1;
    log(`🏷️  Attributes: ${results.attributesMatching}/${totalExpectedAttrs} matching (${(attributeMatch * 100).toFixed(1)}%)`, 
      attributeMatch > 0.9 ? 'green' : attributeMatch > 0.7 ? 'yellow' : 'red');
    
    if (results.attributesMissing > 0) {
      log(`   ❌ ${results.attributesMissing} attributes missing from database`, 'red');
    }
    
    if (results.attributesExtra > 0) {
      log(`   ⚠️  ${results.attributesExtra} extra attributes in database`, 'yellow');
    }
    
    // Indexes summary
    const totalExpectedIndexes = results.indexesMatching + results.indexesMissing;
    const indexMatch = totalExpectedIndexes > 0 ? results.indexesMatching / totalExpectedIndexes : 1;
    log(`📇 Indexes: ${results.indexesMatching}/${totalExpectedIndexes} matching (${(indexMatch * 100).toFixed(1)}%)`, 
      indexMatch > 0.8 ? 'green' : indexMatch > 0.5 ? 'yellow' : 'red');
    
    if (results.indexesMissing > 0) {
      log(`   ❌ ${results.indexesMissing} indexes missing from database`, 'red');
    }
    
    // Issues summary
    if (results.issues.length === 0) {
      log(`\n🎉 PERFECT ALIGNMENT!`, 'green');
      log(`   Your pipeline schema perfectly matches the database`, 'green');
    } else {
      log(`\n🚨 ISSUES FOUND: ${results.issues.length}`, 'red');
      
      const highIssues = results.issues.filter(i => i.severity === 'high');
      const mediumIssues = results.issues.filter(i => i.severity === 'medium');
      const lowIssues = results.issues.filter(i => i.severity === 'low');
      
      if (highIssues.length > 0) {
        log(`   🔴 High Priority: ${highIssues.length} issues`, 'red');
      }
      if (mediumIssues.length > 0) {
        log(`   🟡 Medium Priority: ${mediumIssues.length} issues`, 'yellow');
      }
      if (lowIssues.length > 0) {
        log(`   🟢 Low Priority: ${lowIssues.length} issues`, 'green');
      }
    }
    
    // Recommendations
    log(`\n💡 RECOMMENDATIONS`, 'bright');
    log(`════════════════════════════════════════`, 'bright');
    
    if (results.collectionsMissing > 0) {
      log(`1. Create missing collections using schema migration tools`, 'yellow');
      log(`   Run: node scripts/sync-appwrite-schema.js`, 'cyan');
    }
    
    if (results.attributesMissing > 0) {
      log(`2. Add missing attributes to database`, 'yellow');
      log(`   Use: /api/admin/pipeline-status POST with action: "execute_migration"`, 'cyan');
    }
    
    if (results.indexesMissing > 0) {
      log(`3. Create missing indexes for better query performance`, 'yellow');
      log(`   Indexes improve query speed for frequently accessed data`, 'cyan');
    }
    
    if (results.attributesExtra > 0) {
      log(`4. Consider removing unused attributes or adding them to pipeline schema`, 'yellow');
      log(`   Extra attributes may indicate legacy data that can be cleaned up`, 'cyan');
    }
    
    if (results.issues.length === 0) {
      log(`✅ No action required - your pipeline is perfectly aligned!`, 'green');
    }
    
    // Generate migration script if needed
    if (results.issues.length > 0) {
      log(`\n🔧 NEXT STEPS`, 'bright');
      log(`════════════════════════════════════════`, 'bright');
      log(`1. Review the issues above`, 'cyan');
      log(`2. Run the schema migration tool:`, 'cyan');
      log(`   curl -X POST https://yourapp.vercel.app/api/admin/pipeline-status \\`, 'cyan');
      log(`     -H "Content-Type: application/json" \\`, 'cyan');
      log(`     -d '{"action": "generate_migration"}'`, 'cyan');
      log(`3. Test the migration in development first`, 'cyan');
      log(`4. Execute migration on production with caution`, 'cyan');
    }
    
  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    
    if (error.code === 401) {
      log(`   Check your APPWRITE_API_KEY in .env.local`, 'yellow');
    } else if (error.code === 404) {
      log(`   Database or project not found - check your configuration`, 'yellow');
    } else {
      log(`   Full error: ${JSON.stringify(error, null, 2)}`, 'red');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  validatePipelineSchema().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}