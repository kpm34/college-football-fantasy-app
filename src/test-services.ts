import * as dotenv from 'dotenv';
import { FreeDataService } from './services/data-service';
import { EligibilityChecker } from './services/eligibility-checker';
import { LiveUpdatesService } from './services/live-updates';
import { RateLimiter } from './utils/rate-limiter';
import { DataCache } from './utils/cache';

dotenv.config();

async function testServices() {
  console.log('🏈 College Football Fantasy App - Service Test\n');

  // Initialize services
  const rateLimiter = new RateLimiter();
  const cache = new DataCache();
  const dataService = new FreeDataService();
  const eligibilityChecker = new EligibilityChecker();
  const liveUpdatesService = new LiveUpdatesService(dataService, rateLimiter, cache);

  try {
    // Test 1: Fetch current week games
    console.log('📅 Test 1: Fetching current week games...');
    const games = await dataService.getCurrentWeekGames();
    console.log(`✅ Found ${games.length} Power 4 games this week`);
    
    if (games.length > 0) {
      const firstGame = games[0];
      console.log(`   First game: ${firstGame.awayTeam} @ ${firstGame.homeTeam}`);
      console.log(`   Status: ${firstGame.status}`);
    }

    // Test 2: Fetch AP Rankings (now works without CFBD key!)
    console.log('\n🏆 Test 2: Fetching AP Rankings...');
    const rankings = await dataService.getAPRankings();
    if (rankings && rankings.polls.length > 0) {
      const apPoll = rankings.polls[0];
      console.log(`✅ Found ${apPoll.ranks.length} teams in AP Top 25`);
      console.log(`   Week ${rankings.week} Rankings:`);
      apPoll.ranks.slice(0, 5).forEach(team => {
        console.log(`   #${team.rank} ${team.school} (${team.conference || 'N/A'})`);
      });

      // Update eligibility checker with rankings
      eligibilityChecker.updateAPRankings(apPoll.ranks);
    } else {
      console.log('⚠️  No AP Rankings found');
    }

    // Test 3: Check game eligibility
    console.log('\n✅ Test 3: Checking game eligibility...');
    if (games.length > 0) {
      const report = eligibilityChecker.generateEligibilityReport(games);
      console.log(`📊 Eligibility Report:`);
      console.log(`   Total games: ${report.totalGames}`);
      console.log(`   Eligible games: ${report.eligibleGames}`);
      console.log(`   AP Top 25 games: ${report.apTop25Games}`);
      console.log(`   Conference games: ${report.conferenceGames}`);
      
      console.log('\n   By Conference:');
      Object.entries(report.byConference).forEach(([conf, stats]) => {
        console.log(`   ${conf}: ${stats.eligible}/${stats.total} eligible`);
      });
    }

    // Test 4: Fetch Power 4 teams
    console.log('\n🏫 Test 4: Fetching Power 4 teams...');
    const teams = await dataService.getTeams();
    console.log(`✅ Found ${teams.length} Power 4 teams`);
    
    const teamsByConference = teams.reduce((acc, team) => {
      const conf = team.conference || 'Unknown';
      acc[conf] = (acc[conf] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   Teams by conference:');
    Object.entries(teamsByConference).forEach(([conf, count]) => {
      console.log(`   ${conf}: ${count} teams`);
    });

    // Test 5: Rate limiter
    console.log('\n⏱️  Test 5: Testing rate limiter...');
    console.log(`   ESPN remaining requests: ${rateLimiter.getRemainingRequests('espn')}/60`);
    console.log(`   CFBD remaining requests: ${rateLimiter.getRemainingRequests('cfbd')}/120`);

    // Test 6: Cache
    console.log('\n💾 Test 6: Testing cache...');
    cache.cacheGames('test-games', games);
    const cachedGames = cache.getGames('test-games');
    console.log(`✅ Cache working: ${cachedGames ? 'Yes' : 'No'}`);
    
    const cacheStats = cache.getStats();
    console.log('   Cache statistics:');
    Object.entries(cacheStats).forEach(([type, stats]) => {
      console.log(`   ${type}: ${stats.size}/${stats.maxSize} entries (${stats.utilization.toFixed(1)}% utilization)`);
    });

    // Test 7: Live updates (brief test)
    console.log('\n📡 Test 7: Testing live updates service...');
    
    // Set up event listeners
    liveUpdatesService.on('polling-started', (data) => {
      console.log('   ✅ Live updates started');
    });
    
    liveUpdatesService.on('games-updated', (data) => {
      console.log(`   📊 Updated ${data.count} games`);
    });
    
    liveUpdatesService.on('score-update', (data) => {
      console.log(`   🔴 Score update: ${data.game.awayTeam} ${data.currentScore.away} - ${data.currentScore.home} ${data.game.homeTeam}`);
    });

    // Start polling for 5 seconds then stop
    await liveUpdatesService.startPolling();
    console.log('   ⏳ Running live updates for 5 seconds...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    liveUpdatesService.stopPolling();
    console.log('   ✅ Live updates stopped');

    // Cleanup
    liveUpdatesService.destroy();
    cache.destroy();

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Get a CFBD API key at https://collegefootballdata.com');
    console.log('2. Update .env file with: CFBD_API_KEY=your_actual_key');
    console.log('3. Run npm run build to compile TypeScript');
    console.log('4. Run npm start to test again with full functionality');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testServices().catch(console.error);