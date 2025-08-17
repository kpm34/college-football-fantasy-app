import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-generated';
import { Query } from 'node-appwrite';

/**
 * End-to-End Test API Endpoint
 * 
 * Runs comprehensive tests against the application
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const suite = searchParams.get('suite') || 'all';
  
  const results = {
    timestamp: new Date().toISOString(),
    suite,
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0
    }
  };

  try {
    // Test Suite 1: Database Health
    if (suite === 'all' || suite === 'database') {
      results.tests.push(...await testDatabaseHealth());
    }

    // Test Suite 2: League APIs
    if (suite === 'all' || suite === 'leagues') {
      results.tests.push(...await testLeagueAPIs());
    }

    // Test Suite 3: Data Consistency 
    if (suite === 'all' || suite === 'consistency') {
      results.tests.push(...await testDataConsistency());
    }

    // Test Suite 4: Search Functionality
    if (suite === 'all' || suite === 'search') {
      results.tests.push(...await testSearchFunctionality());
    }

    // Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'pass').length;
    results.summary.failed = results.tests.filter(t => t.status === 'fail').length;
    results.summary.duration = Date.now() - startTime;

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('E2E Test error:', error);
    return NextResponse.json({
      error: 'Test execution failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function testDatabaseHealth(): Promise<any[]> {
  const tests = [];

  // Test 1: Collections exist
  tests.push(await runTest('Collections Exist', async () => {
    const response = await databases.listCollections(DATABASE_ID);
    const collectionIds = response.collections.map(c => c.$id);
    
    const requiredCollections = Object.values(COLLECTIONS);
    const missingCollections = requiredCollections.filter(id => !collectionIds.includes(id));
    
    if (missingCollections.length > 0) {
      throw new Error(`Missing collections: ${missingCollections.join(', ')}`);
    }
    
    return { 
      found: collectionIds.length, 
      required: requiredCollections.length,
      collections: collectionIds
    };
  }));

  // Test 2: Leagues collection has data
  tests.push(await runTest('Leagues Data Available', async () => {
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(5)]
    );
    
    if (leagues.total === 0) {
      throw new Error('No leagues found in database');
    }
    
    return { total: leagues.total, sample: leagues.documents.length };
  }));

  // Test 3: Rosters collection has data
  tests.push(await runTest('Rosters Data Available', async () => {
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.limit(5)]
    );
    
    return { total: rosters.total, sample: rosters.documents.length };
  }));

  return tests;
}

async function testLeagueAPIs(): Promise<any[]> {
  const tests = [];
  const jawnLeagueId = '6894db4a0001ad84e4b0';

  // Test 1: Get specific league
  tests.push(await runTest('Get Jawn League', async () => {
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      jawnLeagueId
    );
    
    if (!league.name || league.name !== 'Jawn League') {
      throw new Error('Jawn League not found or name mismatch');
    }
    
    return { 
      name: league.name, 
      members: league.members?.length || 0,
      currentTeams: league.currentTeams,
      status: league.status
    };
  }));

  // Test 2: League has required fields
  tests.push(await runTest('League Required Fields', async () => {
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      jawnLeagueId
    );
    
    const requiredFields = ['name', 'commissioner', 'status', 'maxTeams'];
    const missingFields = requiredFields.filter(field => !(field in league));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return { validated: requiredFields.length, fields: requiredFields };
  }));

  return tests;
}

async function testDataConsistency(): Promise<any[]> {
  const tests = [];
  const jawnLeagueId = '6894db4a0001ad84e4b0';

  // Test 1: League-Roster consistency
  tests.push(await runTest('League-Roster Member Consistency', async () => {
    // Get league
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      jawnLeagueId
    );
    
    // Get rosters for this league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', jawnLeagueId), Query.limit(100)]
    );
    
    const leagueMembers = league.members?.length || 0;
    const rosterCount = rosters.total;
    const currentTeams = league.currentTeams || 0;
    
    // Check consistency
    const inconsistencies = [];
    if (leagueMembers !== rosterCount) {
      inconsistencies.push(`League members (${leagueMembers}) != rosters (${rosterCount})`);
    }
    if (currentTeams !== rosterCount) {
      inconsistencies.push(`currentTeams (${currentTeams}) != rosters (${rosterCount})`);
    }
    
    if (inconsistencies.length > 0) {
      throw new Error(`Inconsistencies: ${inconsistencies.join(', ')}`);
    }
    
    return { 
      leagueMembers, 
      rosterCount, 
      currentTeams,
      consistent: true
    };
  }));

  // Test 2: All leagues have valid member counts
  tests.push(await runTest('All Leagues Member Count Validity', async () => {
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(20)]
    );
    
    let invalidCount = 0;
    const checks = [];
    
    for (const league of leagues.documents) {
      const currentTeams = league.currentTeams || 0;
      const membersCount = league.members?.length || 0;
      const maxTeams = league.maxTeams || 12;
      
      const valid = currentTeams <= maxTeams && currentTeams >= 0 && membersCount <= maxTeams;
      
      if (!valid) {
        invalidCount++;
      }
      
      checks.push({
        leagueId: league.$id,
        name: league.name,
        currentTeams,
        membersCount,
        maxTeams,
        valid
      });
    }
    
    if (invalidCount > 0) {
      throw new Error(`${invalidCount} leagues have invalid member counts`);
    }
    
    return { 
      checked: leagues.documents.length,
      invalid: invalidCount,
      details: checks.filter(c => !c.valid)
    };
  }));

  return tests;
}

async function testSearchFunctionality(): Promise<any[]> {
  const tests = [];

  // Test 1: League search returns results
  tests.push(await runTest('League Search Returns Results', async () => {
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(10)]
    );
    
    if (leagues.total === 0) {
      throw new Error('No leagues available for search');
    }
    
    return { total: leagues.total, returned: leagues.documents.length };
  }));

  // Test 2: Search for Jawn League by name
  tests.push(await runTest('Search Jawn League by Name', async () => {
    // Simple text search simulation - in real API this would use Query.search
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(100)]
    );
    
    const jawnLeagues = leagues.documents.filter(league => 
      league.name && league.name.toLowerCase().includes('jawn')
    );
    
    if (jawnLeagues.length === 0) {
      throw new Error('Jawn League not found in search results');
    }
    
    return { 
      found: jawnLeagues.length,
      league: jawnLeagues[0].name,
      members: jawnLeagues[0].currentTeams
    };
  }));

  return tests;
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<any> {
  const startTime = Date.now();
  
  try {
    const details = await testFn();
    const duration = Date.now() - startTime;
    
    return {
      name,
      status: 'pass',
      duration,
      details
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    return {
      name,
      status: 'fail',
      duration,
      error: error.message
    };
  }
}

export async function POST(request: NextRequest) {
  // POST can trigger specific test repairs
  try {
    const { action, leagueId } = await request.json();
    
    if (action === 'sync-members' && leagueId) {
      // Fix member count inconsistency
      const rosters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('leagueId', leagueId), Query.limit(100)]
      );
      
      const memberIds = rosters.documents.map((roster: any) => roster.userId);
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId,
        {
          members: memberIds,
          currentTeams: memberIds.length
        }
      );
      
      return NextResponse.json({
        success: true,
        action: 'sync-members',
        leagueId,
        syncedMembers: memberIds.length
      });
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Repair action failed',
      message: error.message
    }, { status: 500 });
  }
}