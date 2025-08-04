import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

async function getAllPlayers() {
  const allPlayers = [];
  let offset = 0;
  const limit = 100;
  
  console.log('🔍 Fetching all players with pagination...');
  console.log(`📊 Expected total: 2,085 documents`);
  
  while (true) {
    try {
      console.log(`📄 Fetching players ${offset + 1}-${offset + limit}...`);
      
      const response = await databases.listDocuments(
        DATABASE_ID, 
        COLLECTION_ID,
        [], // queries
        limit,
        offset
      );
      
      console.log(`✅ Fetched ${response.documents.length} players (Total so far: ${allPlayers.length + response.documents.length})`);
      allPlayers.push(...response.documents);
      
      // If we got less than the limit, we've reached the end
      if (response.documents.length < limit) {
        console.log(`🏁 Reached end of data after ${allPlayers.length} total players`);
        break;
      }
      
      offset += limit;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      console.error(`❌ Error fetching players at offset ${offset}:`, error.message);
      break;
    }
  }
  
  return allPlayers;
}

async function checkDatabaseStatus() {
  try {
    console.log('🏈 College Football Fantasy Database Status Check');
    console.log('================================================');
    
    const allPlayers = await getAllPlayers();
    
    console.log(`\n📊 TOTAL PLAYERS: ${allPlayers.length}`);
    
    if (allPlayers.length === 0) {
      console.log('❌ No players found in database!');
      return;
    }
    
    // Conference breakdown
    const conferenceCounts = {};
    const teamCounts = {};
    const positionCounts = {};
    
    allPlayers.forEach(player => {
      const conf = player.conference || 'Unknown';
      const team = player.team || 'Unknown';
      const position = player.position || 'Unknown';
      
      conferenceCounts[conf] = (conferenceCounts[conf] || 0) + 1;
      teamCounts[team] = (teamCounts[team] || 0) + 1;
      positionCounts[position] = (positionCounts[position] || 0) + 1;
    });
    
    console.log('\n🏆 CONFERENCE BREAKDOWN:');
    Object.entries(conferenceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([conf, count]) => {
        console.log(`  ${conf}: ${count} players`);
      });
    
    console.log('\n🎯 POSITION BREAKDOWN:');
    Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pos, count]) => {
        console.log(`  ${pos}: ${count} players`);
      });
    
    console.log('\n🏈 TOP 15 TEAMS BY PLAYER COUNT:');
    Object.entries(teamCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .forEach(([team, count]) => {
        console.log(`  ${team}: ${count} players`);
      });
    
    // Check for Big Ten teams specifically
    const bigTenTeams = [
      'Michigan', 'Ohio State', 'Penn State', 'Michigan State', 'Indiana', 
      'Maryland', 'Rutgers', 'UCLA', 'Washington', 'Oregon', 'USC', 
      'Wisconsin', 'Iowa', 'Minnesota', 'Nebraska', 'Northwestern', 
      'Purdue', 'Illinois'
    ];
    
    console.log('\n🔍 BIG TEN TEAMS STATUS:');
    bigTenTeams.forEach(team => {
      const count = teamCounts[team] || 0;
      const status = count > 0 ? `✅ ${count} players` : '❌ No players';
      console.log(`  ${team}: ${status}`);
    });
    
    // Show some sample players from different teams
    console.log('\n👥 SAMPLE PLAYERS (first 10):');
    allPlayers.slice(0, 10).forEach(player => {
      console.log(`  ${player.name} (${player.position}) - ${player.team} - ${player.conference}`);
    });
    
    console.log('\n✅ Database status check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
  }
}

checkDatabaseStatus(); 