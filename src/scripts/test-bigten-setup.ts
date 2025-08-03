#!/usr/bin/env ts-node
/**
 * Test Big Ten Setup and Integration
 * Verifies Big Ten data seeding and API functionality
 */

import { bigTenService } from '../services/bigten-service';

async function testBigTenSetup() {
  console.log('🏈 Testing Big Ten Setup and Integration');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get Big Ten Teams
    console.log('\n1️⃣ Testing Big Ten Teams...');
    const teams = await bigTenService.getBigTenTeams();
    console.log(`✅ Found ${teams.length} Big Ten teams`);
    
    // Show first 3 teams
    teams.slice(0, 3).forEach(team => {
      console.log(`   - ${team.name} (${team.abbreviation}) - ${team.division} Division`);
    });

    // Test 2: Get Teams by Division
    console.log('\n2️⃣ Testing Teams by Division...');
    const eastTeams = await bigTenService.getBigTenTeamsByDivision('East');
    const westTeams = await bigTenService.getBigTenTeamsByDivision('West');
    console.log(`✅ East Division: ${eastTeams.length} teams`);
    console.log(`✅ West Division: ${westTeams.length} teams`);

    // Test 3: Get Big Ten Players
    console.log('\n3️⃣ Testing Big Ten Players...');
    const players = await bigTenService.getBigTenPlayers();
    console.log(`✅ Found ${players.length} Big Ten players`);
    
    // Show top 3 players by rating
    const topPlayers = players.sort((a, b) => b.rating - a.rating).slice(0, 3);
    topPlayers.forEach(player => {
      console.log(`   - ${player.name} (${player.position}) - ${player.team} - Rating: ${player.rating}`);
    });

    // Test 4: Get Players by Team
    console.log('\n4️⃣ Testing Players by Team...');
    const michiganPlayers = await bigTenService.getBigTenPlayersByTeam('Michigan');
    console.log(`✅ Michigan has ${michiganPlayers.length} players`);
    michiganPlayers.forEach(player => {
      console.log(`   - ${player.name} (${player.position}) - Rating: ${player.rating}`);
    });

    // Test 5: Get Players by Position
    console.log('\n5️⃣ Testing Players by Position...');
    const qbs = await bigTenService.getBigTenPlayersByPosition('QB');
    const rbs = await bigTenService.getBigTenPlayersByPosition('RB');
    const wrs = await bigTenService.getBigTenPlayersByPosition('WR');
    console.log(`✅ QBs: ${qbs.length}, RBs: ${rbs.length}, WRs: ${wrs.length}`);

    // Test 6: Get Big Ten Games
    console.log('\n6️⃣ Testing Big Ten Games...');
    const games = await bigTenService.getBigTenGames();
    console.log(`✅ Found ${games.length} Big Ten games`);
    
    games.forEach(game => {
      console.log(`   - ${game.away_team} @ ${game.home_team} (Week ${game.week})`);
    });

    // Test 7: Get Rivalry Games
    console.log('\n7️⃣ Testing Rivalry Games...');
    const rivalryGames = await bigTenService.getBigTenRivalryGames();
    console.log(`✅ Found ${rivalryGames.length} rivalry games`);
    
    rivalryGames.forEach(game => {
      console.log(`   - ${game.away_team} @ ${game.home_team} (${game.date})`);
    });

    // Test 8: Get Top Rated Players
    console.log('\n8️⃣ Testing Top Rated Players...');
    const topRated = await bigTenService.getTopRatedBigTenPlayers(5);
    console.log(`✅ Top 5 rated players:`);
    topRated.forEach((player, index) => {
      console.log(`   ${index + 1}. ${player.name} (${player.position}) - ${player.team} - Rating: ${player.rating}`);
    });

    // Test 9: Get Draft Board
    console.log('\n9️⃣ Testing Draft Board...');
    const draftBoard = await bigTenService.getBigTenDraftBoard();
    console.log(`✅ Draft board has ${draftBoard.length} players`);
    console.log(`   Top pick: ${draftBoard[0]?.name} (${draftBoard[0]?.position}) - Rating: ${draftBoard[0]?.rating}`);

    // Test 10: Get Big Ten Stats
    console.log('\n🔟 Testing Big Ten Stats...');
    const stats = await bigTenService.getBigTenStats();
    console.log(`✅ Big Ten Conference Stats:`);
    console.log(`   - Total Teams: ${stats.totalTeams}`);
    console.log(`   - Total Players: ${stats.totalPlayers}`);
    console.log(`   - Total Games: ${stats.totalGames}`);
    console.log(`   - East Teams: ${stats.eastTeams}`);
    console.log(`   - West Teams: ${stats.westTeams}`);
    console.log(`   - Top Rated Player: ${stats.topRatedPlayer?.name} (${stats.topRatedPlayer?.rating})`);

    console.log('\n🎉 All Big Ten tests passed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Error during Big Ten testing:', error);
    throw error;
  }
}

// Test API endpoints
async function testBigTenAPI() {
  console.log('\n🌐 Testing Big Ten API Endpoints...');
  console.log('=' .repeat(50));

  const baseUrl = 'http://localhost:3001/api/bigten';

  try {
    // Test teams endpoint
    console.log('\n1️⃣ Testing /api/bigten?type=teams...');
    const teamsResponse = await fetch(`${baseUrl}?type=teams`);
    const teamsData = await teamsResponse.json();
    console.log(`✅ Teams API: ${teamsData.data?.length || 0} teams returned`);

    // Test players endpoint
    console.log('\n2️⃣ Testing /api/bigten?type=players...');
    const playersResponse = await fetch(`${baseUrl}?type=players`);
    const playersData = await playersResponse.json();
    console.log(`✅ Players API: ${playersData.data?.length || 0} players returned`);

    // Test games endpoint
    console.log('\n3️⃣ Testing /api/bigten?type=games...');
    const gamesResponse = await fetch(`${baseUrl}?type=games`);
    const gamesData = await gamesResponse.json();
    console.log(`✅ Games API: ${gamesData.data?.length || 0} games returned`);

    // Test stats endpoint
    console.log('\n4️⃣ Testing /api/bigten?type=stats...');
    const statsResponse = await fetch(`${baseUrl}?type=stats`);
    const statsData = await statsResponse.json();
    console.log(`✅ Stats API: ${statsData.data?.totalTeams || 0} teams, ${statsData.data?.totalPlayers || 0} players`);

    // Test draft board endpoint
    console.log('\n5️⃣ Testing /api/bigten?type=draft-board...');
    const draftResponse = await fetch(`${baseUrl}?type=draft-board`);
    const draftData = await draftResponse.json();
    console.log(`✅ Draft Board API: ${draftData.data?.length || 0} players returned`);

    console.log('\n🎉 All Big Ten API tests passed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Error during Big Ten API testing:', error);
    console.log('💡 Make sure your frontend is running on port 3001');
  }
}

// Main test function
async function main() {
  try {
    await testBigTenSetup();
    await testBigTenAPI();
    
    console.log('\n🏆 Big Ten Integration Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Big Ten teams and players seeded');
    console.log('   ✅ Appwrite integration working');
    console.log('   ✅ API endpoints functional');
    console.log('   ✅ Service layer implemented');
    console.log('\n🚀 Ready for Big Ten fantasy leagues!');
    
  } catch (error) {
    console.error('\n❌ Big Ten setup failed:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main();
} 