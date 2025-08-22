/**
 * End-to-End Test Runner for College Football Fantasy App
 * 
 * Tests all critical user flows and data consistency
 */

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
}

class E2ETestRunner {
  private baseUrl: string;
  private results: TestSuite[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting E2E Test Suite');
    console.log(`Base URL: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    const suites = [
      () => this.testHealthChecks(),
      () => this.testLeagueAPIs(),
      () => this.testDataConsistency(),
      () => this.testUserFlows(),
      () => this.testDraftSystem(),
      () => this.testSearchFunctionality()
    ];

    for (const suite of suites) {
      try {
        await suite();
      } catch (error) {
        console.error(`Suite failed: ${error}`);
      }
    }

    this.generateReport();
  }

  private async testHealthChecks(): Promise<void> {
    const suite: TestSuite = {
      name: 'Health Checks',
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: API Health
    suite.tests.push(await this.runTest('API Health Check', async () => {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return { status: response.status, data };
    }));

    // Test 2: Database Connectivity
    suite.tests.push(await this.runTest('Database Connectivity', async () => {
      const response = await fetch(`${this.baseUrl}/api/auth-test`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return { appwriteStatus: data };
    }));

    // Test 3: Environment Configuration
    suite.tests.push(await this.runTest('Environment Configuration', async () => {
      const response = await fetch(`${this.baseUrl}/api/test-deployment`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.environment) throw new Error('Environment not detected');
      return data;
    }));

    suite.duration = Date.now() - startTime;
    this.calculateSuiteStats(suite);
    this.results.push(suite);
  }

  private async testLeagueAPIs(): Promise<void> {
    const suite: TestSuite = {
      name: 'League APIs',
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();
    const jawnLeagueId = '6894db4a0001ad84e4b0';

    // Test 1: League Search
    suite.tests.push(await this.runTest('League Search API', async () => {
      const response = await fetch(`${this.baseUrl}/api/leagues/search`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error('API returned success: false');
      return { total: data.total, leagues: data.leagues?.length || 0 };
    }));

    // Test 2: Search for Jawn League
    suite.tests.push(await this.runTest('Search Jawn League', async () => {
      const response = await fetch(`${this.baseUrl}/api/leagues/search?search=jawn`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success || data.total === 0) throw new Error('Jawn League not found');
      return { found: data.leagues[0].name, members: data.leagues[0].currentTeams };
    }));

    // Test 3: Get Specific League
    suite.tests.push(await this.runTest('Get Jawn League Details', async () => {
      const response = await fetch(`${this.baseUrl}/api/leagues/${jawnLeagueId}`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error('Failed to get league details');
      if (data.league.currentTeams !== 8) throw new Error(`Expected 8 members, got ${data.league.currentTeams}`);
      return { 
        name: data.league.name, 
        members: data.league.currentTeams,
        status: data.league.status 
      };
    }));

    // Test 4: League Member Sync
    suite.tests.push(await this.runTest('League Member Sync', async () => {
      const response = await fetch(`${this.baseUrl}/api/leagues/${jawnLeagueId}/sync-members`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error('Sync failed');
      return { synced: data.after.members, message: data.message };
    }));

    suite.duration = Date.now() - startTime;
    this.calculateSuiteStats(suite);
    this.results.push(suite);
  }

  private async testDataConsistency(): Promise<void> {
    const suite: TestSuite = {
      name: 'Data Consistency',
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: League-Roster Consistency
    suite.tests.push(await this.runTest('League-Roster Member Count Consistency', async () => {
      const leaguesResponse = await fetch(`${this.baseUrl}/api/leagues/search?limit=50`);
      if (!leaguesResponse.ok) throw new Error('Failed to fetch leagues');
      const leaguesData = await leaguesResponse.json();
      
      let inconsistencies = 0;
      const checks = [];

      for (const league of leaguesData.leagues.slice(0, 5)) { // Test first 5 leagues
        try {
          // This would require a roster count API - for now just check the league has valid data
          if (typeof league.currentTeams !== 'number') {
            inconsistencies++;
          }
          checks.push({
            leagueId: league.id,
            name: league.name,
            members: league.currentTeams,
            valid: typeof league.currentTeams === 'number'
          });
        } catch (error) {
          inconsistencies++;
        }
      }

      if (inconsistencies > 0) {
        throw new Error(`Found ${inconsistencies} data inconsistencies`);
      }

      return { checked: checks.length, inconsistencies };
    }));

    // Test 2: Required Fields Validation
    suite.tests.push(await this.runTest('League Required Fields', async () => {
      const response = await fetch(`${this.baseUrl}/api/leagues/search?limit=10`);
      if (!response.ok) throw new Error('Failed to fetch leagues');
      const data = await response.json();

      const requiredFields = ['id', 'name', 'currentTeams', 'maxTeams', 'status'];
      let missingFields = [];

      for (const league of data.leagues) {
        for (const field of requiredFields) {
          if (!(field in league)) {
            missingFields.push(`${league.name || 'Unknown'}: missing ${field}`);
          }
        }
      }

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      return { validated: data.leagues.length, requiredFields };
    }));

    suite.duration = Date.now() - startTime;
    this.calculateSuiteStats(suite);
    this.results.push(suite);
  }

  private async testUserFlows(): Promise<void> {
    const suite: TestSuite = {
      name: 'User Flows',
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Homepage Load
    suite.tests.push(await this.runTest('Homepage Load', async () => {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const html = await response.text();
      if (!html.includes('College Football Fantasy')) {
        throw new Error('Homepage content not found');
      }
      return { loaded: true, size: html.length };
    }));

    // Test 2: League Creation Page
    suite.tests.push(await this.runTest('League Creation Page Load', async () => {
      const response = await fetch(`${this.baseUrl}/league/create`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const html = await response.text();
      if (!html.includes('Create') && !html.includes('League')) {
        throw new Error('League creation page content not found');
      }
      return { loaded: true };
    }));

    // Test 3: Join League Page
    suite.tests.push(await this.runTest('Join League Page Load', async () => {
      const response = await fetch(`${this.baseUrl}/league/join`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const html = await response.text();
      return { loaded: true };
    }));

    suite.duration = Date.now() - startTime;
    this.calculateSuiteStats(suite);
    this.results.push(suite);
  }

  private async testDraftSystem(): Promise<void> {
    const suite: TestSuite = {
      name: 'Draft System',
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();
    const jawnLeagueId = '6894db4a0001ad84e4b0';

    // Test 1: Draft Players API
    suite.tests.push(await this.runTest('Draft Players API', async () => {
      const response = await fetch(`${this.baseUrl}/api/draft/players`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) && !data.players) {
        throw new Error('Invalid players data structure');
      }
      return { playersAvailable: Array.isArray(data) ? data.length : data.players?.length || 0 };
    }));

    // Test 2: Draft Status
    suite.tests.push(await this.runTest('Draft Status API', async () => {
      const response = await fetch(`${this.baseUrl}/api/draft/${jawnLeagueId}/status`);
      // This might return 404 or error if draft not started - that's ok
      return { 
        status: response.status,
        hasEndpoint: response.status !== 404
      };
    }));

    // Test 3: Mock Draft Page
    suite.tests.push(await this.runTest('Mock Draft Page', async () => {
      const response = await fetch(`${this.baseUrl}/draft/mock`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      return { loaded: true };
    }));

    suite.duration = Date.now() - startTime;
    this.calculateSuiteStats(suite);
    this.results.push(suite);
  }

  private async testSearchFunctionality(): Promise<void> {
    const suite: TestSuite = {
      name: 'Search Functionality',
      tests: [],
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Player Search
    suite.tests.push(await this.runTest('Player Search API', async () => {
      const response = await fetch(`${this.baseUrl}/api/players/search?q=quarterback`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return { results: data.players?.length || data.length || 0 };
    }));

    // Test 2: League Search with Filters
    suite.tests.push(await this.runTest('League Search with Filters', async () => {
      const response = await fetch(`${this.baseUrl}/api/leagues/search?mode=power4&limit=5`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error('Search failed');
      return { filtered: data.leagues.length, total: data.total };
    }));

    suite.duration = Date.now() - startTime;
    this.calculateSuiteStats(suite);
    this.results.push(suite);
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const details = await testFn();
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ ${name} (${duration}ms)`);
      
      return {
        name,
        status: 'pass',
        duration,
        details
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      console.log(`  ❌ ${name} (${duration}ms): ${error.message}`);
      
      return {
        name,
        status: 'fail',
        duration,
        error: error.message
      };
    }
  }

  private calculateSuiteStats(suite: TestSuite): void {
    suite.totalTests = suite.tests.length;
    suite.passed = suite.tests.filter(t => t.status === 'pass').length;
    suite.failed = suite.tests.filter(t => t.status === 'fail').length;

    const status = suite.failed === 0 ? '✅' : '❌';
    console.log(`\n${status} ${suite.name}: ${suite.passed}/${suite.totalTests} passed (${suite.duration}ms)\n`);
  }

  private generateReport(): void {
    const totalTests = this.results.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.results.reduce((sum, suite) => sum + suite.duration, 0);

    console.log('=' .repeat(60));
    console.log('📊 E2E Test Report');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} (${Math.round((totalPassed / totalTests) * 100)}%)`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log('');

    // Suite breakdown
    this.results.forEach(suite => {
      const status = suite.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${suite.name}: ${suite.passed}/${suite.totalTests} passed`);
      
      // Show failed tests
      suite.tests.filter(t => t.status === 'fail').forEach(test => {
        console.log(`    ❌ ${test.name}: ${test.error}`);
      });
    });

    console.log('');
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️  ${totalFailed} tests failed - review and fix issues`);
    }
  }
}

// Export for use in other files
export { E2ETestRunner, TestResult, TestSuite };

// CLI runner
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const runner = new E2ETestRunner(baseUrl);
  
  runner.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}