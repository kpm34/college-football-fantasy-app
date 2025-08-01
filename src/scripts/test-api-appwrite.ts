import * as dotenv from 'dotenv';
import { AppwriteDataService } from '../services/appwrite-data-service';
import { EligibilityChecker } from '../services/eligibility-checker';

dotenv.config();

async function testAppwriteAPI() {
  console.log('🧪 Testing Express API with Appwrite Integration\n');

  const dataService = new AppwriteDataService();
  const eligibilityChecker = new EligibilityChecker();

  try {
    // Test 1: Get current games
    console.log('Test 1: Fetching current games...');
    const games = await dataService.getCurrentWeekGames();
    console.log(`✅ Found ${games.length} games`);
    if (games.length > 0) {
      console.log(`   First game: ${games[0].awayTeam} @ ${games[0].homeTeam}`);
    }

    // Test 2: Get rankings
    console.log('\nTest 2: Fetching AP rankings...');
    const rankings = await dataService.getAPRankings();
    if (rankings && rankings.polls.length > 0) {
      console.log(`✅ Found ${rankings.polls[0].ranks.length} teams in AP Top 25`);
      console.log(`   #1: ${rankings.polls[0].ranks[0].school}`);
    }

    // Test 3: Check eligibility
    console.log('\nTest 3: Testing eligibility with rankings...');
    if (rankings) {
      eligibilityChecker.updateAPRankings(rankings.polls[0].ranks);
      
      const eligibleCount = games.filter(game => 
        eligibilityChecker.isGameEligible(game, game.homeTeam) ||
        eligibilityChecker.isGameEligible(game, game.awayTeam)
      ).length;
      
      console.log(`✅ ${eligibleCount} out of ${games.length} games are eligible`);
    }

    // Test 4: Get teams
    console.log('\nTest 4: Fetching teams...');
    const teams = await dataService.getTeams();
    console.log(`✅ Found ${teams.length} teams`);

    console.log('\n🎉 All tests passed! The API is ready to use Appwrite.');
    console.log('\nStart the server with: npm run server');
    console.log('Then visit: http://localhost:3000/api/games');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAppwriteAPI();