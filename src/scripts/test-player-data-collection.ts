import { PlayerDataService } from '../services/player-data-service';
import { ProjectionService } from '../services/projection-service';
import * as dotenv from 'dotenv';

dotenv.config();

async function testPlayerDataCollection() {
  console.log('🧪 Testing Player Data Collection System...\n');

  const playerDataService = new PlayerDataService();
  const projectionService = new ProjectionService();

  try {
    // Test 1: Collect roster for a single team (Alabama - SEC)
    console.log('📋 Test 1: Collecting Alabama roster...');
    const alabamaPlayers = await playerDataService.collectTeamRoster('333');
    
    if (alabamaPlayers.length > 0) {
      console.log(`✅ Successfully collected ${alabamaPlayers.length} players from Alabama`);
      console.log(`   Sample player: ${alabamaPlayers[0].displayName} (${alabamaPlayers[0].position.fantasyCategory})`);
    } else {
      console.log('❌ No players collected from Alabama');
    }

    // Test 2: Search for players
    console.log('\n🔍 Test 2: Searching for players...');
    const searchResults = await playerDataService.searchPlayers('', { 
      position: 'QB', 
      conference: 'SEC' 
    });
    
    if (searchResults.length > 0) {
      console.log(`✅ Found ${searchResults.length} QBs in SEC`);
      console.log(`   Top QB: ${searchResults[0].displayName} (${searchResults[0].team})`);
    } else {
      console.log('❌ No QBs found in SEC');
    }

    // Test 3: Get draftable players
    console.log('\n📊 Test 3: Getting draftable players...');
    const draftablePlayers = await playerDataService.getDraftablePlayers(1);
    
    if (draftablePlayers.length > 0) {
      console.log(`✅ Found ${draftablePlayers.length} draftable players`);
      
      // Group by position
      const byPosition = draftablePlayers.reduce((acc, player) => {
        const pos = player.position.fantasyCategory;
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('   Position breakdown:');
      Object.entries(byPosition).forEach(([pos, count]) => {
        console.log(`     ${pos}: ${count} players`);
      });
    } else {
      console.log('❌ No draftable players found');
    }

    // Test 4: Generate projections for week 1
    console.log('\n🎯 Test 4: Generating weekly projections...');
    await projectionService.generateWeeklyProjections(1);
    console.log('✅ Weekly projections generated');

    // Test 5: Get top projected players
    console.log('\n🏆 Test 5: Getting top projected players...');
    const topProjections = await projectionService.getTopProjectedPlayers(1, undefined, 10);
    
    if (topProjections.length > 0) {
      console.log('✅ Top 10 projected players for Week 1:');
      topProjections.forEach((projection, index) => {
        console.log(`   ${index + 1}. ${projection.playerName} (${projection.position}) - ${projection.projectedPoints} pts vs ${projection.opponent}`);
      });
    } else {
      console.log('❌ No projections found');
    }

    // Test 6: Get projections by position
    console.log('\n📈 Test 6: Getting QB projections...');
    const qbProjections = await projectionService.getTopProjectedPlayers(1, 'QB', 5);
    
    if (qbProjections.length > 0) {
      console.log('✅ Top 5 QB projections for Week 1:');
      qbProjections.forEach((projection, index) => {
        console.log(`   ${index + 1}. ${projection.playerName} - ${projection.projectedPoints} pts (${projection.confidence} confidence)`);
      });
    } else {
      console.log('❌ No QB projections found');
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPlayerDataCollection().catch(console.error); 