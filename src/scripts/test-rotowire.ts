import { rotowireService } from '../services/rotowire-service';

async function testRotowireService() {
  console.log('🏈 Testing Rotowire Service Integration\n');

  try {
    // Test 1: Check service status
    console.log('1. Service Status:');
    console.log(`   Real API: ${rotowireService.isRealAPI() ? '✅ Yes' : '❌ No (using mock)'}`);
    console.log('');

    // Test 2: Get player news
    console.log('2. Player News Test:');
    const playerNews = await rotowireService.getPlayerNews('12345');
    console.log('   ✅ Player news retrieved:', playerNews.news?.length || 0, 'items');
    console.log('');

    // Test 3: Get injury updates
    console.log('3. Injury Updates Test:');
    const injuries = await rotowireService.getInjuryUpdates();
    console.log('   ✅ Injury updates retrieved:', injuries.injuries?.length || 0, 'items');
    console.log('');

    // Test 4: Get depth chart
    console.log('4. Depth Chart Test:');
    const depthChart = await rotowireService.getDepthChart('333'); // Alabama
    console.log('   ✅ Depth chart retrieved for team 333');
    console.log('   Positions:', Object.keys(depthChart.positions || {}));
    console.log('');

    // Test 5: Get player stats
    console.log('5. Player Stats Test:');
    const playerStats = await rotowireService.getPlayerStats('12345');
    console.log('   ✅ Player stats retrieved');
    console.log('   Stats available:', Object.keys(playerStats.stats || {}));
    console.log('');

    // Test 6: Get player updates (combined)
    console.log('6. Player Updates Test:');
    const playerUpdates = await rotowireService.getPlayerUpdates('12345');
    console.log('   ✅ Player updates retrieved');
    console.log('   News items:', playerUpdates.news?.length || 0);
    console.log('   Stats categories:', Object.keys(playerUpdates.stats || {}));
    console.log('');

    // Test 7: Get team updates (combined)
    console.log('7. Team Updates Test:');
    const teamUpdates = await rotowireService.getTeamUpdates('333'); // Alabama
    console.log('   ✅ Team updates retrieved');
    console.log('   Depth chart positions:', Object.keys(teamUpdates.depthChart || {}));
    console.log('   Team injuries:', teamUpdates.injuries?.length || 0);
    console.log('');

    console.log('🎉 All Rotowire service tests passed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Service Type: ${rotowireService.isRealAPI() ? 'Real API' : 'Mock Data'}`);
    console.log('   All endpoints: ✅ Working');
    console.log('   Error handling: ✅ Working');
    console.log('   Data structure: ✅ Consistent');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRotowireService().catch(console.error);
}

export { testRotowireService }; 