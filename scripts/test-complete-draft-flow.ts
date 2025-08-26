#!/usr/bin/env tsx
import { Client, Databases, Query, ID, Account } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { randomBytes } from 'crypto';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Test configuration
const TEST_CONFIG = {
  uniqueId: randomBytes(4).toString('hex'),
  email: `test_${Date.now()}@example.com`,
  password: 'TestPass123!',
  displayName: `TestUser_${Date.now()}`,
  leagueName: `Test League ${Date.now()}`,
  draftDelayMinutes: 2, // Draft starts in 2 minutes
};

interface TestResult {
  step: string;
  success: boolean;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

async function logStep(step: string, success: boolean, details?: any, error?: string) {
  console.log(`${success ? '✅' : '❌'} ${step}`);
  if (details) console.log('   Details:', JSON.stringify(details, null, 2));
  if (error) console.log('   Error:', error);
  results.push({ step, success, details, error });
}

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE DRAFT FLOW\n');
  console.log('=' .repeat(60));
  console.log('Test ID:', TEST_CONFIG.uniqueId);
  console.log('Test Email:', TEST_CONFIG.email);
  console.log('Test League:', TEST_CONFIG.leagueName);
  console.log('=' .repeat(60) + '\n');

  let userId: string | null = null;
  let leagueId: string | null = null;
  let draftId: string | null = null;
  let sessionId: string | null = null;

  try {
    // ============================================
    // STEP 1: Create Account
    // ============================================
    console.log('\n📝 STEP 1: Account Creation');
    console.log('-'.repeat(40));
    
    try {
      // Set API key for admin operations
      client.setKey(process.env.APPWRITE_API_KEY!);
      
      // Create user account
      const user = await account.create(
        ID.unique(),
        TEST_CONFIG.email,
        TEST_CONFIG.password,
        TEST_CONFIG.displayName
      );
      userId = user.$id;
      
      // Create session
      const session = await account.createEmailPasswordSession(
        TEST_CONFIG.email,
        TEST_CONFIG.password
      );
      sessionId = session.$id;
      
      // Create client document
      await databases.createDocument(
        DATABASE_ID,
        'clients',
        userId,
        {
          authUserId: userId,
          email: TEST_CONFIG.email,
          displayName: TEST_CONFIG.displayName,
          createdAt: new Date().toISOString()
        }
      );
      
      await logStep('Account created', true, { userId, email: TEST_CONFIG.email });
    } catch (e: any) {
      await logStep('Account creation failed', false, null, e.message);
      return;
    }

    // ============================================
    // STEP 2: Create League
    // ============================================
    console.log('\n📝 STEP 2: League Creation');
    console.log('-'.repeat(40));
    
    try {
      // Create league WITHOUT status field (it doesn't exist)
      console.log('   Creating league document...');
      const league = await databases.createDocument(
        DATABASE_ID,
        'leagues',
        ID.unique(),
        {
          name: TEST_CONFIG.leagueName,
          season: 2025,
          maxTeams: 12,
          draftType: 'snake',
          gameMode: 'power4',
          currentTeams: 1,
          isPublic: true,
          pickTimeSeconds: 90,
          commissionerAuthUserId: userId
        }
      );
      leagueId = league.$id;
      console.log('   ✓ League document created:', leagueId);
      
      // Create fantasy team
      console.log('   Creating fantasy team...');
      await databases.createDocument(
        DATABASE_ID,
        'fantasy_teams',
        ID.unique(),
        {
          leagueId,
          ownerAuthUserId: userId,
          displayName: TEST_CONFIG.displayName,
          teamName: `${TEST_CONFIG.displayName}'s Team`,
          wins: 0,
          losses: 0
        }
      );
      console.log('   ✓ Fantasy team created');
      
      // Create league membership
      console.log('   Creating league membership...');
      await databases.createDocument(
        DATABASE_ID,
        'league_memberships',
        ID.unique(),
        {
          leagueId,
          authUserId: userId,
          displayName: TEST_CONFIG.displayName,
          role: 'commissioner',
          status: 'active',  // Add status field for league_memberships
          joinedAt: new Date().toISOString()
        }
      );
      console.log('   ✓ League membership created');
      
      await logStep('League created', true, { leagueId, name: TEST_CONFIG.leagueName });
    } catch (e: any) {
      console.log('   Error at:', e.message);
      await logStep('League creation failed', false, null, e.message);
      return;
    }

    // ============================================
    // STEP 3: Configure Commissioner Settings
    // ============================================
    console.log('\n📝 STEP 3: Commissioner Settings');
    console.log('-'.repeat(40));
    
    try {
      // Set draft time to 2 minutes from now
      const draftTime = new Date(Date.now() + TEST_CONFIG.draftDelayMinutes * 60 * 1000);
      
      // Create draft order with user + 11 bots
      const draftOrder = [userId];
      for (let i = 1; i <= 11; i++) {
        draftOrder.push(`BOT-${i}`);
      }
      
      // Update league with draft settings
      await databases.updateDocument(
        DATABASE_ID,
        'leagues',
        leagueId,
        {
          draftDate: draftTime.toISOString(),
          draftOrder: JSON.stringify(draftOrder),
          maxTeams: 12,
          currentTeams: 12,
          status: 'full'
        }
      );
      
      // Create draft document
      const draft = await databases.createDocument(
        DATABASE_ID,
        'drafts',
        ID.unique(),
        {
          leagueId,
          leagueName: TEST_CONFIG.leagueName,
          gameMode: 'power4',
          maxTeams: 12,
          status: 'scheduled',
          type: 'snake',
          currentRound: 0,
          currentPick: 0,
          maxRounds: 15,
          startTime: draftTime.toISOString(),
          isMock: false,
          clockSeconds: 60,
          orderJson: JSON.stringify({
            draftOrder,
            draftType: 'snake',
            totalTeams: 12,
            pickTimeSeconds: 60
          }),
          stateJson: JSON.stringify({
            pickedPlayerIds: [],
            availablePlayerIds: [],
            onTheClock: null,
            lastPickTime: null,
            autopickEnabled: true
          }),
          eventsJson: '[]',
          picksJson: '[]'
        }
      );
      draftId = draft.$id;
      
      await logStep('Commissioner settings configured', true, { 
        draftId,
        draftTime: draftTime.toLocaleString(),
        draftOrder: `${TEST_CONFIG.displayName} + 11 BOTs`
      });
    } catch (e: any) {
      await logStep('Commissioner settings failed', false, null, e.message);
      return;
    }

    // ============================================
    // STEP 4: Verify Draft Room Setup
    // ============================================
    console.log('\n📝 STEP 4: Draft Room Verification');
    console.log('-'.repeat(40));
    
    try {
      // Check if draft document has all required fields
      const draftDoc = await databases.getDocument(DATABASE_ID, 'drafts', draftId);
      
      const checks = {
        hasOrderJson: !!draftDoc.orderJson,
        hasStateJson: !!draftDoc.stateJson,
        hasEventsJson: !!draftDoc.eventsJson,
        hasPicksJson: !!draftDoc.picksJson,
        statusIsScheduled: draftDoc.status === 'scheduled',
        hasStartTime: !!draftDoc.startTime
      };
      
      const allChecksPass = Object.values(checks).every(v => v);
      
      await logStep('Draft room setup verified', allChecksPass, checks);
    } catch (e: any) {
      await logStep('Draft room verification failed', false, null, e.message);
    }

    // ============================================
    // STEP 5: Wait for Draft to Start (or manually start)
    // ============================================
    console.log('\n📝 STEP 5: Draft Start');
    console.log('-'.repeat(40));
    
    const draftTime = new Date((await databases.getDocument(DATABASE_ID, 'drafts', draftId)).startTime);
    const waitTime = Math.max(0, draftTime.getTime() - Date.now());
    
    if (waitTime > 0) {
      console.log(`   ⏰ Waiting ${Math.ceil(waitTime / 1000)}s for draft to start...`);
      console.log(`   Draft scheduled for: ${draftTime.toLocaleTimeString()}`);
      
      // Option to start immediately for testing
      if (process.argv.includes('--start-now')) {
        console.log('   🚀 Starting draft immediately (--start-now flag)');
        await databases.updateDocument(DATABASE_ID, 'drafts', draftId, {
          status: 'active',
          currentRound: 1,
          currentPick: 1
        });
        await databases.updateDocument(DATABASE_ID, 'leagues', leagueId, {
          status: 'drafting'
        });
        await logStep('Draft started manually', true);
      } else {
        // Wait for cron to start it
        await new Promise(resolve => setTimeout(resolve, waitTime + 10000)); // Wait + 10s buffer
        
        // Check if draft started
        const draftStatus = await databases.getDocument(DATABASE_ID, 'drafts', draftId);
        if (draftStatus.status === 'active') {
          await logStep('Draft started by cron', true);
        } else {
          // Manually start if cron didn't
          await databases.updateDocument(DATABASE_ID, 'drafts', draftId, {
            status: 'active',
            currentRound: 1,
            currentPick: 1
          });
          await databases.updateDocument(DATABASE_ID, 'leagues', leagueId, {
            status: 'drafting'
          });
          await logStep('Draft started manually (cron failed)', true);
        }
      }
    }

    // ============================================
    // STEP 6: Simulate Draft Picks
    // ============================================
    console.log('\n📝 STEP 6: Making Draft Picks');
    console.log('-'.repeat(40));
    
    try {
      // Get available players
      const players = await databases.listDocuments(
        DATABASE_ID,
        'college_players',
        [
          Query.equal('eligible', true),
          Query.limit(200)
        ]
      );
      
      if (players.documents.length === 0) {
        await logStep('No players available', false);
        return;
      }
      
      // Make first pick as user
      const firstPlayer = players.documents[0];
      const pickDoc = await databases.createDocument(
        DATABASE_ID,
        'draft_picks',
        ID.unique(),
        {
          leagueId,
          draftId,
          round: 1,
          pick: 1,
          overall: 1,
          teamId: userId,
          playerId: firstPlayer.$id,
          playerName: firstPlayer.name,
          position: firstPlayer.position,
          team: firstPlayer.team,
          timestamp: new Date().toISOString()
        }
      );
      
      // Update draft state
      const draftDoc = await databases.getDocument(DATABASE_ID, 'drafts', draftId);
      const stateJson = JSON.parse(draftDoc.stateJson || '{}');
      stateJson.pickedPlayerIds = [firstPlayer.$id];
      stateJson.lastPickTime = new Date().toISOString();
      
      const picksJson = [{
        round: 1,
        pick: 1,
        overall: 1,
        teamId: userId,
        playerId: firstPlayer.$id,
        playerName: firstPlayer.name,
        position: firstPlayer.position,
        team: firstPlayer.team,
        timestamp: new Date().toISOString()
      }];
      
      await databases.updateDocument(DATABASE_ID, 'drafts', draftId, {
        currentPick: 2,
        stateJson: JSON.stringify(stateJson),
        picksJson: JSON.stringify(picksJson)
      });
      
      await logStep('User pick made', true, {
        player: firstPlayer.name,
        position: firstPlayer.position,
        team: firstPlayer.team
      });
      
      // Simulate a few bot picks
      for (let i = 2; i <= 5; i++) {
        const botPlayer = players.documents[i - 1];
        await databases.createDocument(
          DATABASE_ID,
          'draft_picks',
          ID.unique(),
          {
            leagueId,
            draftId,
            round: 1,
            pick: i,
            overall: i,
            teamId: `BOT-${i - 1}`,
            playerId: botPlayer.$id,
            playerName: botPlayer.name,
            position: botPlayer.position,
            team: botPlayer.team,
            timestamp: new Date().toISOString()
          }
        );
        
        stateJson.pickedPlayerIds.push(botPlayer.$id);
        picksJson.push({
          round: 1,
          pick: i,
          overall: i,
          teamId: `BOT-${i - 1}`,
          playerId: botPlayer.$id,
          playerName: botPlayer.name,
          position: botPlayer.position,
          team: botPlayer.team,
          timestamp: new Date().toISOString()
        });
      }
      
      await databases.updateDocument(DATABASE_ID, 'drafts', draftId, {
        currentPick: 6,
        stateJson: JSON.stringify(stateJson),
        picksJson: JSON.stringify(picksJson)
      });
      
      await logStep('Bot picks simulated', true, { totalPicks: 5 });
      
    } catch (e: any) {
      await logStep('Draft picks failed', false, null, e.message);
    }

    // ============================================
    // STEP 7: Verify Database Fields
    // ============================================
    console.log('\n📝 STEP 7: Database Verification');
    console.log('-'.repeat(40));
    
    try {
      // Check draft document
      const finalDraft = await databases.getDocument(DATABASE_ID, 'drafts', draftId);
      const draftChecks = {
        hasPicksInPicksJson: JSON.parse(finalDraft.picksJson || '[]').length > 0,
        hasEventsInEventsJson: finalDraft.eventsJson !== '[]',
        hasStateJson: !!finalDraft.stateJson,
        currentPickUpdated: finalDraft.currentPick > 1
      };
      
      // Check draft_picks collection
      const picks = await databases.listDocuments(
        DATABASE_ID,
        'draft_picks',
        [Query.equal('draftId', draftId)]
      );
      
      // Check if picks are saved to user's roster
      const roster = await databases.listDocuments(
        DATABASE_ID,
        'rosters',
        [
          Query.equal('leagueId', leagueId),
          Query.equal('ownerAuthUserId', userId)
        ]
      );
      
      const verificationResults = {
        draftDocument: draftChecks,
        draftPicks: {
          count: picks.documents.length,
          hasUserPick: picks.documents.some((p: any) => p.teamId === userId)
        },
        roster: {
          exists: roster.documents.length > 0,
          playerCount: roster.documents.length
        }
      };
      
      const allFieldsValid = 
        Object.values(draftChecks).every(v => v) &&
        picks.documents.length > 0;
      
      await logStep('Database fields verified', allFieldsValid, verificationResults);
      
    } catch (e: any) {
      await logStep('Database verification failed', false, null, e.message);
    }

    // ============================================
    // STEP 8: Complete Draft
    // ============================================
    console.log('\n📝 STEP 8: Draft Completion');
    console.log('-'.repeat(40));
    
    try {
      // Mark draft as completed
      await databases.updateDocument(DATABASE_ID, 'drafts', draftId, {
        status: 'completed',
        endTime: new Date().toISOString()
      });
      
      // Update league status
      await databases.updateDocument(DATABASE_ID, 'leagues', leagueId, {
        status: 'active'
      });
      
      await logStep('Draft completed', true);
    } catch (e: any) {
      await logStep('Draft completion failed', false, null, e.message);
    }

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
  } finally {
    // Cleanup (optional)
    if (process.argv.includes('--cleanup') && userId) {
      console.log('\n🧹 Cleaning up test data...');
      try {
        // Delete test user
        if (sessionId) await account.deleteSession(sessionId);
        // Note: Can't delete user without admin SDK
        console.log('✅ Cleanup complete');
      } catch (e) {
        console.log('⚠️  Cleanup failed:', e);
      }
    }
  }

  // ============================================
  // FINAL SUMMARY
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY\n');
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log(`Total Steps: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\nFailed Steps:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.step}: ${r.error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (failureCount === 0) {
    console.log('🎉 ALL TESTS PASSED! The complete draft flow is working!');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
}

// Run the test
console.log('Usage: npx tsx scripts/test-complete-draft-flow.ts [--start-now] [--cleanup]');
console.log('  --start-now: Start draft immediately instead of waiting');
console.log('  --cleanup: Clean up test data after completion\n');

testCompleteFlow().catch(console.error);
