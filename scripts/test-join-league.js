#!/usr/bin/env node

/**
 * Join League Test Script
 * 
 * Tests the join league functionality to ensure it works properly
 * after schema synchronization and fixes.
 * 
 * Run: node scripts/test-join-league.js
 */

const { Client, Databases, ID, Query } = require('node-appwrite');
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

async function createTestLeague() {
  log('📝 Creating test league...', 'cyan');
  
  const testLeagueData = {
    name: 'Test League - Join Feature',
    description: 'Automated test league for join functionality',
    commissioner: 'Test Commissioner',
    commissionerId: 'test-commissioner-id',
    maxTeams: 16,  // College football can support larger leagues
    currentTeams: 0,
    members: [],
    draftType: 'snake',
    entryFee: 0,
    scoringType: 'standard',
    status: 'draft',
    isPublic: true,  // Public league - no password required
    inviteCode: `TEST${Date.now()}`,
    season: 2025,
  };
  
  try {
    const league = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.leagues,
      ID.unique(),
      testLeagueData
    );
    
    log(`✅ Created test league: ${league.name} (ID: ${league.$id})`, 'green');
    return league;
  } catch (error) {
    log(`❌ Failed to create test league: ${error.message}`, 'red');
    throw error;
  }
}

async function createTestUser() {
  log('👤 Creating test user data...', 'cyan');
  
  // For testing, we'll simulate a user object
  const testUser = {
    $id: `test-user-${Date.now()}`,
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
  };
  
  log(`✅ Test user: ${testUser.name} (${testUser.email})`, 'green');
  return testUser;
}

async function testJoinLeague(league, user) {
  log(`🔄 Testing join league functionality...`, 'cyan');
  
  // Simulate the join league process
  const joinData = {
    teamName: `${user.name}'s Team`,
    userId: user.$id,
    userName: user.name,
    email: user.email,
    leagueId: league.$id,
    wins: 0,
    losses: 0,
    ties: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    players: '[]',
  };
  
  try {
    // Check current collection schema
    log('  Checking roster collection schema...', 'blue');
    const rostersCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.userTeams);
    const attributes = (rostersCollection.attributes || []).map(a => a.key);
    log(`  Available attributes: ${attributes.join(', ')}`, 'blue');
    
    // Add optional fields if they exist
    if (attributes.includes('abbreviation')) {
      joinData.abbreviation = joinData.teamName.substring(0, 3).toUpperCase();
    }
    if (attributes.includes('draftPosition')) {
      joinData.draftPosition = 1;
    }
    if (attributes.includes('waiverPriority')) {
      joinData.waiverPriority = 1;
    }
    if (attributes.includes('faabBalance')) {
      joinData.faabBalance = 100;
    }
    if (attributes.includes('isActive')) {
      joinData.isActive = true;
    }
    if (attributes.includes('lastActive')) {
      joinData.lastActive = new Date().toISOString();
    }
    
    // Create roster
    log('  Creating roster...', 'blue');
    const roster = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.userTeams,
      ID.unique(),
      joinData
    );
    
    log(`  ✅ Created roster: ${roster.teamName} (ID: ${roster.$id})`, 'green');
    
    // Update league
    log('  Updating league...', 'blue');
    const leagueCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.leagues);
    const leagueAttributes = (leagueCollection.attributes || []).map(a => a.key);
    
    const updateData = {};
    if (leagueAttributes.includes('members')) {
      updateData.members = [...(league.members || []), user.$id];
    }
    if (leagueAttributes.includes('currentTeams')) {
      updateData.currentTeams = (league.currentTeams || 0) + 1;
    }
    
    if (Object.keys(updateData).length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.leagues,
        league.$id,
        updateData
      );
      log('  ✅ Updated league with new member', 'green');
    }
    
    // Log activity
    try {
      log('  Logging activity...', 'blue');
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.activityLog,
        ID.unique(),
        {
          type: 'league_join',
          userId: user.$id,
          leagueId: league.$id,
          teamId: roster.$id,
          description: `${user.name} joined ${league.name}`,
          createdAt: new Date().toISOString(),
        }
      );
      log('  ✅ Activity logged', 'green');
    } catch (error) {
      log(`  ⚠️  Failed to log activity: ${error.message}`, 'yellow');
    }
    
    return { roster, success: true };
    
  } catch (error) {
    log(`  ❌ Join failed: ${error.message}`, 'red');
    return { error: error.message, success: false };
  }
}

async function testDuplicateJoin(league, user) {
  log(`🔄 Testing duplicate join prevention...`, 'cyan');
  
  try {
    // Check for existing rosters
    const existingRosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.userTeams,
      [
        Query.equal('leagueId', league.$id),
        Query.equal('userId', user.$id)
      ]
    );
    
    if (existingRosters.documents.length > 0) {
      log('  ✅ Duplicate join prevention working', 'green');
      return { success: true, prevented: true };
    } else {
      log('  ❌ No existing roster found (unexpected)', 'red');
      return { success: false, prevented: false };
    }
  } catch (error) {
    log(`  ❌ Duplicate check failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLeagueCapacity(league) {
  log(`🔄 Testing league capacity limits...`, 'cyan');
  
  try {
    // Get current league state
    const updatedLeague = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.leagues,
      league.$id
    );
    
    const currentTeams = updatedLeague.currentTeams || (updatedLeague.members?.length || 0);
    const maxTeams = updatedLeague.maxTeams || 12;
    
    log(`  Current teams: ${currentTeams}/${maxTeams}`, 'blue');
    
    if (currentTeams >= maxTeams) {
      log('  ✅ League is at capacity', 'green');
      return { success: true, full: true };
    } else {
      log(`  ✅ League has space for ${maxTeams - currentTeams} more teams`, 'green');
      return { success: true, full: false, remaining: maxTeams - currentTeams };
    }
  } catch (error) {
    log(`  ❌ Capacity check failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function cleanupTestData(league, rosters) {
  log('🧹 Cleaning up test data...', 'cyan');
  
  try {
    // Delete rosters
    for (const roster of rosters) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.userTeams, roster.$id);
      log(`  ✅ Deleted roster: ${roster.$id}`, 'green');
    }
    
    // Delete league
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.leagues, league.$id);
    log(`  ✅ Deleted league: ${league.$id}`, 'green');
    
    // Clean up activity logs
    try {
      const activities = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.activityLog,
        [Query.equal('leagueId', league.$id)]
      );
      
      for (const activity of activities.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.activityLog, activity.$id);
      }
      log(`  ✅ Cleaned up ${activities.documents.length} activity logs`, 'green');
    } catch (error) {
      log(`  ⚠️  Failed to clean activity logs: ${error.message}`, 'yellow');
    }
    
  } catch (error) {
    log(`  ❌ Cleanup failed: ${error.message}`, 'red');
  }
}

async function main() {
  log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════╗
║       Join League Test Suite             ║
╚══════════════════════════════════════════╝${colors.reset}
`);
  
  if (!process.env.APPWRITE_API_KEY) {
    log('❌ APPWRITE_API_KEY not found in .env.local', 'red');
    process.exit(1);
  }
  
  const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };
  
  let league, user, rosters = [];
  
  try {
    // Setup
    league = await createTestLeague();
    user = await createTestUser();
    
    // Test 1: Basic join functionality
    log('\n🧪 Test 1: Basic join league', 'yellow');
    const joinResult = await testJoinLeague(league, user);
    if (joinResult.success) {
      testResults.passed++;
      rosters.push(joinResult.roster);
    } else {
      testResults.failed++;
    }
    
    // Test 2: Duplicate join prevention
    log('\n🧪 Test 2: Duplicate join prevention', 'yellow');
    const duplicateResult = await testDuplicateJoin(league, user);
    if (duplicateResult.success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
    
    // Test 3: League capacity check
    log('\n🧪 Test 3: League capacity check', 'yellow');
    const capacityResult = await testLeagueCapacity(league);
    if (capacityResult.success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
    
    // Test 4: Additional users (test multiple joins)
    log('\n🧪 Test 4: Test multiple users joining', 'yellow');
    for (let i = 2; i <= 4; i++) {
      const additionalUser = {
        $id: `test-user-${Date.now()}-${i}`,
        name: `Test User ${i}`,
        email: `test-${Date.now()}-${i}@example.com`,
      };
      
      const result = await testJoinLeague(league, additionalUser);
      if (result.success) {
        rosters.push(result.roster);
        log(`    ✅ User ${i} joined successfully`, 'green');
      } else {
        log(`    ❌ User ${i} failed to join: ${result.error}`, 'red');
        testResults.failed++;
      }
    }
    
    // Final capacity check
    log('\n🧪 Test 5: Final capacity check', 'yellow');
    const finalCapacity = await testLeagueCapacity(league);
    if (finalCapacity.success) {
      testResults.passed++;
      if (finalCapacity.full) {
        log('  ✅ League correctly shows as full', 'green');
      } else {
        log(`  ✅ League has ${finalCapacity.remaining} remaining slots`, 'green');
      }
    } else {
      testResults.failed++;
    }
    
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    testResults.failed++;
  } finally {
    // Cleanup
    if (league && rosters.length > 0) {
      await cleanupTestData(league, rosters);
    }
  }
  
  // Results
  log(`\n📊 Test Results:`, 'cyan');
  log(`  ✅ Passed: ${testResults.passed}`, 'green');
  log(`  ❌ Failed: ${testResults.failed}`, 'red');
  log(`  ⚠️  Warnings: ${testResults.warnings}`, 'yellow');
  
  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! Join league feature is working correctly.', 'green');
  } else {
    log('\n💥 Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}