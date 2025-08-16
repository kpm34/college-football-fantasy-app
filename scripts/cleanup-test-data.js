#!/usr/bin/env node

/**
 * Cleanup Test Data Script
 * 
 * Removes test users, leagues, and rosters from the database
 * Run: node scripts/cleanup-test-data.js
 */

const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
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

const COLLECTIONS = {
  leagues: 'leagues',
  rosters: 'rosters',
  activityLog: 'activity_log',
  users: 'users',
};

async function findTestData() {
  log('🔍 Searching for test data...', 'cyan');
  
  const testData = {
    leagues: [],
    rosters: [],
    users: [],
    activities: []
  };
  
  try {
    // Find test leagues (get all and filter)
    log('  Searching for test leagues...', 'blue');
    const allLeagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.leagues,
      [Query.limit(100)]
    );
    testData.leagues = allLeagues.documents.filter(league => 
      league.name && league.name.includes('Test League')
    );
    log(`  Found ${testData.leagues.length} test leagues`, 'yellow');
    
    // Find rosters with test users (get all and filter)
    log('  Searching for test rosters...', 'blue');
    const allRosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.rosters,
      [Query.limit(200)]
    );
    testData.rosters = allRosters.documents.filter(roster => 
      (roster.userName && roster.userName.includes('Test User')) ||
      (roster.email && roster.email.includes('test-'))
    );
    log(`  Found ${testData.rosters.length} test rosters`, 'yellow');
    
    // Find test users (if users collection exists)
    try {
      log('  Searching for test users...', 'blue');
      const allUsers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.users,
        [Query.limit(100)]
      );
      testData.users = allUsers.documents.filter(user => 
        user.email && user.email.includes('test-')
      );
      log(`  Found ${testData.users.length} test users`, 'yellow');
    } catch (error) {
      log(`  Warning: Could not search users collection: ${error.message}`, 'yellow');
    }
    
    // Find test activities
    try {
      log('  Searching for test activities...', 'blue');
      const allActivities = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.activityLog,
        [Query.limit(200)]
      );
      testData.activities = allActivities.documents.filter(activity => 
        activity.description && activity.description.includes('Test User')
      );
      log(`  Found ${testData.activities.length} test activities`, 'yellow');
    } catch (error) {
      log(`  Warning: Could not search activity log: ${error.message}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error searching for test data: ${error.message}`, 'red');
    throw error;
  }
  
  return testData;
}

async function removeTestData(testData, dryRun = false) {
  log(`${dryRun ? '🔍 DRY RUN - Would delete:' : '🗑️  Deleting test data:'}`, 'cyan');
  
  let totalDeleted = 0;
  
  // Delete rosters first (they reference leagues)
  if (testData.rosters.length > 0) {
    log(`  ${dryRun ? 'Would delete' : 'Deleting'} ${testData.rosters.length} test rosters...`, 'blue');
    for (const roster of testData.rosters) {
      try {
        if (!dryRun) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.rosters, roster.$id);
        }
        log(`    ${dryRun ? 'Would delete' : '✅ Deleted'} roster: ${roster.teamName} (${roster.$id})`, 'green');
        totalDeleted++;
      } catch (error) {
        log(`    ❌ Failed to delete roster ${roster.$id}: ${error.message}`, 'red');
      }
    }
  }
  
  // Delete leagues
  if (testData.leagues.length > 0) {
    log(`  ${dryRun ? 'Would delete' : 'Deleting'} ${testData.leagues.length} test leagues...`, 'blue');
    for (const league of testData.leagues) {
      try {
        if (!dryRun) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.leagues, league.$id);
        }
        log(`    ${dryRun ? 'Would delete' : '✅ Deleted'} league: ${league.name} (${league.$id})`, 'green');
        totalDeleted++;
      } catch (error) {
        log(`    ❌ Failed to delete league ${league.$id}: ${error.message}`, 'red');
      }
    }
  }
  
  // Delete users
  if (testData.users.length > 0) {
    log(`  ${dryRun ? 'Would delete' : 'Deleting'} ${testData.users.length} test users...`, 'blue');
    for (const user of testData.users) {
      try {
        if (!dryRun) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.users, user.$id);
        }
        log(`    ${dryRun ? 'Would delete' : '✅ Deleted'} user: ${user.email} (${user.$id})`, 'green');
        totalDeleted++;
      } catch (error) {
        log(`    ❌ Failed to delete user ${user.$id}: ${error.message}`, 'red');
      }
    }
  }
  
  // Delete activities
  if (testData.activities.length > 0) {
    log(`  ${dryRun ? 'Would delete' : 'Deleting'} ${testData.activities.length} test activities...`, 'blue');
    for (const activity of testData.activities) {
      try {
        if (!dryRun) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.activityLog, activity.$id);
        }
        log(`    ${dryRun ? 'Would delete' : '✅ Deleted'} activity: ${activity.description} (${activity.$id})`, 'green');
        totalDeleted++;
      } catch (error) {
        log(`    ❌ Failed to delete activity ${activity.$id}: ${error.message}`, 'red');
      }
    }
  }
  
  return totalDeleted;
}

async function main() {
  log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════╗
║         Test Data Cleanup Tool           ║
╚══════════════════════════════════════════╝${colors.reset}
`);
  
  if (!process.env.APPWRITE_API_KEY) {
    log('❌ APPWRITE_API_KEY not found in .env.local', 'red');
    process.exit(1);
  }
  
  const isDryRun = process.argv.includes('--dry-run');
  const isForce = process.argv.includes('--force');
  
  try {
    // Find test data
    const testData = await findTestData();
    
    const totalItems = testData.leagues.length + testData.rosters.length + 
                      testData.users.length + testData.activities.length;
    
    if (totalItems === 0) {
      log('✨ No test data found! Database is clean.', 'green');
      return;
    }
    
    log(`\n📊 Test Data Summary:`, 'cyan');
    log(`  🏈 Leagues: ${testData.leagues.length}`, 'yellow');
    log(`  👥 Rosters: ${testData.rosters.length}`, 'yellow');
    log(`  🔑 Users: ${testData.users.length}`, 'yellow');
    log(`  📝 Activities: ${testData.activities.length}`, 'yellow');
    log(`  📦 Total: ${totalItems} items`, 'bright');
    
    if (isDryRun) {
      log('\n🔍 Running in DRY RUN mode - nothing will be deleted', 'yellow');
      await removeTestData(testData, true);
      log('\n💡 To actually delete, run: node scripts/cleanup-test-data.js --force', 'cyan');
      return;
    }
    
    if (!isForce) {
      log('\n⚠️  This will permanently delete all test data!', 'red');
      log('💡 To preview what would be deleted, run: node scripts/cleanup-test-data.js --dry-run', 'cyan');
      log('💡 To confirm deletion, run: node scripts/cleanup-test-data.js --force', 'cyan');
      return;
    }
    
    // Proceed with deletion
    const deletedCount = await removeTestData(testData, false);
    
    log(`\n✨ Cleanup complete!`, 'green');
    log(`📊 Deleted ${deletedCount} items`, 'green');
    
  } catch (error) {
    log(`\n❌ Cleanup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}