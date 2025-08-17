#!/usr/bin/env node

/**
 * Simple E2E Test Script
 * 
 * Tests the deployed application end-to-end
 */

const https = require('https');
const http = require('http');

class SimpleE2ETester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.results = [];
  }

  async runAllTests() {
    console.log('🚀 Starting E2E Tests');
    console.log(`Base URL: ${this.baseUrl}`);
    console.log('═'.repeat(60));

    const tests = [
      () => this.testHealth(),
      () => this.testLeagueAPI(),
      () => this.testDatabaseConsistency(),
      () => this.testSearchFunctionality(),
      () => this.testPageLoads()
    ];

    for (const test of tests) {
      await test();
    }

    this.generateReport();
  }

  async testHealth() {
    console.log('\n🔍 Health Checks');
    console.log('─'.repeat(40));

    // Test API health endpoint
    const healthResult = await this.fetch('/api/test/e2e?suite=database');
    if (healthResult.summary.failed === 0) {
      console.log('  ✅ Database connectivity');
      console.log(`     Found ${healthResult.tests[0]?.details?.found || 0} collections`);
    } else {
      console.log('  ❌ Database connectivity failed');
      healthResult.tests.filter(t => t.status === 'fail').forEach(t => {
        console.log(`     Error: ${t.error}`);
      });
    }
    
    this.results.push({
      suite: 'Health',
      passed: healthResult.summary.passed,
      total: healthResult.summary.total,
      duration: healthResult.summary.duration
    });
  }

  async testLeagueAPI() {
    console.log('\n⚽ League API Tests');
    console.log('─'.repeat(40));

    // Test league search
    const searchResult = await this.fetch('/api/leagues/search');
    if (searchResult.success && searchResult.leagues) {
      console.log(`  ✅ League search (${searchResult.leagues.length} leagues found)`);
    } else {
      console.log('  ❌ League search failed');
    }

    // Test specific league
    const jawnLeagueId = '6894db4a0001ad84e4b0';
    const leagueResult = await this.fetch(`/api/leagues/${jawnLeagueId}`);
    if (leagueResult.success && leagueResult.league) {
      console.log(`  ✅ Get Jawn League (${leagueResult.league.currentTeams} members)`);
      if (leagueResult.league.currentTeams === 8) {
        console.log('     ✅ Member count correct');
      } else {
        console.log(`     ⚠️  Expected 8 members, got ${leagueResult.league.currentTeams}`);
      }
    } else {
      console.log('  ❌ Get specific league failed');
    }

    // Test database consistency via API
    const consistencyResult = await this.fetch('/api/test/e2e?suite=consistency');
    const consistencyPassed = consistencyResult.summary.failed === 0;
    console.log(`  ${consistencyPassed ? '✅' : '❌'} Data consistency checks`);
    
    this.results.push({
      suite: 'League API',
      passed: searchResult.success && leagueResult.success && consistencyPassed ? 3 : 0,
      total: 3,
      duration: 0
    });
  }

  async testDatabaseConsistency() {
    console.log('\n🗄️  Database Consistency');
    console.log('─'.repeat(40));

    const consistencyResult = await this.fetch('/api/test/e2e?suite=consistency');
    
    for (const test of consistencyResult.tests) {
      if (test.status === 'pass') {
        console.log(`  ✅ ${test.name}`);
        if (test.details) {
          Object.entries(test.details).forEach(([key, value]) => {
            if (typeof value === 'number' || typeof value === 'string') {
              console.log(`     ${key}: ${value}`);
            }
          });
        }
      } else {
        console.log(`  ❌ ${test.name}: ${test.error}`);
      }
    }

    this.results.push({
      suite: 'Consistency',
      passed: consistencyResult.summary.passed,
      total: consistencyResult.summary.total,
      duration: consistencyResult.summary.duration
    });
  }

  async testSearchFunctionality() {
    console.log('\n🔍 Search Functionality');
    console.log('─'.repeat(40));

    // Test league search with query
    const jawnSearchResult = await this.fetch('/api/leagues/search?search=jawn');
    if (jawnSearchResult.success && jawnSearchResult.leagues && jawnSearchResult.leagues.length > 0) {
      console.log(`  ✅ Search for "jawn" (${jawnSearchResult.leagues.length} results)`);
      console.log(`     Found: ${jawnSearchResult.leagues[0].name}`);
    } else {
      console.log('  ❌ Search for "jawn" failed');
    }

    // Test search with filters
    const filterSearchResult = await this.fetch('/api/leagues/search?mode=power4&limit=5');
    if (filterSearchResult.success) {
      console.log(`  ✅ Filtered search (${filterSearchResult.leagues?.length || 0} results)`);
    } else {
      console.log('  ❌ Filtered search failed');
    }

    this.results.push({
      suite: 'Search',
      passed: jawnSearchResult.success && filterSearchResult.success ? 2 : 0,
      total: 2,
      duration: 0
    });
  }

  async testPageLoads() {
    console.log('\n📄 Page Load Tests');
    console.log('─'.repeat(40));

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/league/create', name: 'Create League' },
      { path: '/league/join', name: 'Join League' },
      { path: '/dashboard', name: 'Dashboard' }
    ];

    let passed = 0;
    
    for (const page of pages) {
      try {
        const response = await this.fetchRaw(page.path);
        if (response.statusCode >= 200 && response.statusCode < 400) {
          console.log(`  ✅ ${page.name} (${response.statusCode})`);
          passed++;
        } else {
          console.log(`  ❌ ${page.name} (${response.statusCode})`);
        }
      } catch (error) {
        console.log(`  ❌ ${page.name} (Error: ${error.message})`);
      }
    }

    this.results.push({
      suite: 'Page Loads',
      passed,
      total: pages.length,
      duration: 0
    });
  }

  async fetch(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ data, statusCode: res.statusCode });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async fetchRaw(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.get(url, (res) => {
        resolve({ statusCode: res.statusCode });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  generateReport() {
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    const totalFailed = totalTests - totalPassed;

    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📊 E2E Test Report');
    console.log('═'.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} (${Math.round((totalPassed / totalTests) * 100)}%)`);
    console.log(`Failed: ${totalFailed}`);
    console.log('');

    this.results.forEach(result => {
      const status = result.passed === result.total ? '✅' : '❌';
      console.log(`${status} ${result.suite}: ${result.passed}/${result.total} passed`);
    });

    console.log('');
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${totalFailed} tests failed`);
      process.exit(1);
    }
  }
}

// CLI execution
const baseUrl = process.argv[2] || 'https://college-football-fantasy-fw5yhpj6c-kpm34s-projects.vercel.app';

console.log('College Football Fantasy App - E2E Test Suite');
console.log(`Target: ${baseUrl}`);

const tester = new SimpleE2ETester(baseUrl);
tester.runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});