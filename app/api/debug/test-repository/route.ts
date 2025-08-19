import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '@/core/repositories';
import { ID } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {
      repositoryInit: {
        status: 'pending',
        details: {} as any
      },
      findLeagues: {
        status: 'pending',
        details: {} as any
      },
      createTestLeague: {
        status: 'pending',
        details: {} as any
      },
      deleteTestLeague: {
        status: 'pending',
        details: {} as any
      }
    }
  };

  let testLeagueId: string | null = null;

  try {
    // Test 1: Repository Initialization
    console.log('🔍 Test 1: Checking repository initialization...');
    try {
      const hasLeagues = !!serverRepositories.leagues;
      const hasRosters = !!serverRepositories.rosters;
      const hasPlayers = !!serverRepositories.players;
      
      results.tests.repositoryInit.status = 'success';
      results.tests.repositoryInit.details = {
        leagues: hasLeagues,
        rosters: hasRosters,
        players: hasPlayers
      };
    } catch (error: any) {
      results.tests.repositoryInit.status = 'failed';
      results.tests.repositoryInit.details = { error: error.message };
    }

    // Test 2: Find Leagues
    console.log('🔍 Test 2: Testing find operation...');
    try {
      const leaguesResult = await serverRepositories.leagues.find({
        limit: 5
      });
      
      results.tests.findLeagues.status = 'success';
      results.tests.findLeagues.details = {
        total: leaguesResult.total,
        returned: leaguesResult.documents.length,
        firstLeague: leaguesResult.documents[0] ? {
          id: leaguesResult.documents[0].$id,
          name: leaguesResult.documents[0].name
        } : null
      };
    } catch (error: any) {
      results.tests.findLeagues.status = 'failed';
      results.tests.findLeagues.details = {
        error: error.message,
        code: error.code,
        stack: error.stack
      };
    }

    // Test 3: Create Test League
    console.log('🔍 Test 3: Testing create operation...');
    try {
      const testLeague = await serverRepositories.leagues.createLeague({
        name: `Test Debug ${Date.now()}`,
        maxTeams: 8,
        draftType: 'snake',
        gameMode: 'power4',
        isPublic: false,
        pickTimeSeconds: 90,
        commissionerId: 'debug-test-user',
        season: 2025
      });
      
      testLeagueId = testLeague.$id;
      
      results.tests.createTestLeague.status = 'success';
      results.tests.createTestLeague.details = {
        id: testLeague.$id,
        name: testLeague.name,
        created: true
      };
    } catch (error: any) {
      results.tests.createTestLeague.status = 'failed';
      results.tests.createTestLeague.details = {
        error: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack
      };
    }

    // Test 4: Delete Test League (cleanup)
    console.log('🔍 Test 4: Testing delete operation...');
    if (testLeagueId) {
      try {
        await serverRepositories.leagues.delete(testLeagueId);
        
        results.tests.deleteTestLeague.status = 'success';
        results.tests.deleteTestLeague.details = {
          id: testLeagueId,
          deleted: true
        };
      } catch (error: any) {
        results.tests.deleteTestLeague.status = 'failed';
        results.tests.deleteTestLeague.details = {
          error: error.message,
          code: error.code,
          attemptedId: testLeagueId
        };
      }
    } else {
      results.tests.deleteTestLeague.status = 'skipped';
      results.tests.deleteTestLeague.details = {
        reason: 'No test league created to delete'
      };
    }

    // Summary
    const allTests = Object.values(results.tests);
    const failedTests = allTests.filter(t => t.status === 'failed');
    const successTests = allTests.filter(t => t.status === 'success');
    
    return NextResponse.json({
      ...results,
      summary: {
        status: failedTests.length === 0 ? 'healthy' : 'degraded',
        totalTests: allTests.length,
        passed: successTests.length,
        failed: failedTests.length,
        failedTests: failedTests.length > 0 ? 
          Object.keys(results.tests).filter((k, i) => 
            Object.values(results.tests)[i].status === 'failed'
          ) : []
      }
    }, { 
      status: failedTests.length === 0 ? 200 : 500 
    });

  } catch (error: any) {
    // Cleanup if test league was created
    if (testLeagueId) {
      try {
        await serverRepositories.leagues.delete(testLeagueId);
      } catch (cleanupError) {
        console.error('Failed to cleanup test league:', cleanupError);
      }
    }

    return NextResponse.json({
      ...results,
      error: {
        message: error.message,
        stack: error.stack
      },
      summary: {
        status: 'critical',
        message: 'Repository test failed with critical error'
      }
    }, { status: 500 });
  }
}
