import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

async function getAllPlayersByConference() {
  try {
    console.log('🏈 Getting All Players by Conference');
    console.log('====================================');
    
    const conferences = [
      { name: 'Big Ten', query: 'Big Ten' },
      { name: 'SEC', query: 'SEC' },
      { name: 'Big 12', query: 'Big 12' },
      { name: 'ACC', query: 'ACC' }
    ];
    
    let totalPlayers = 0;
    const allPlayers = [];
    
    for (const conference of conferences) {
      console.log(`\n🔍 Getting ${conference.name} players...`);
      
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('conference', conference.query)],
          1000, // Try to get all at once
          0
        );
        
        console.log(`  ✅ ${conference.name}: ${response.total} total players`);
        console.log(`  📄 Retrieved: ${response.documents.length} players`);
        
        // Group by team
        const teamCounts = {};
        response.documents.forEach(player => {
          const team = player.team || 'Unknown';
          teamCounts[team] = (teamCounts[team] || 0) + 1;
        });
        
        console.log(`  🏈 Teams in ${conference.name}:`);
        Object.entries(teamCounts)
          .sort(([,a], [,b]) => b - a)
          .forEach(([team, count]) => {
            console.log(`    ${team}: ${count} players`);
          });
        
        // Show sample players
        if (response.documents.length > 0) {
          console.log(`  👥 Sample ${conference.name} players:`);
          response.documents.slice(0, 3).forEach((player, i) => {
            console.log(`    ${i + 1}. ${player.name} (${player.position}) - ${player.team}`);
          });
        }
        
        totalPlayers += response.total;
        allPlayers.push(...response.documents);
        
      } catch (error) {
        console.log(`  ❌ Error getting ${conference.name} players: ${error.message}`);
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`  Total players across all conferences: ${totalPlayers}`);
    console.log(`  Players retrieved: ${allPlayers.length}`);
    
    // Position breakdown
    const positionCounts = {};
    allPlayers.forEach(player => {
      const position = player.position || 'Unknown';
      positionCounts[position] = (positionCounts[position] || 0) + 1;
    });
    
    console.log('\n🎯 POSITION BREAKDOWN:');
    Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pos, count]) => {
        console.log(`  ${pos}: ${count} players`);
      });
    
    console.log('\n✅ All players retrieved successfully!');
    
  } catch (error) {
    console.error('❌ Error getting players by conference:', error.message);
  }
}

getAllPlayersByConference(); 