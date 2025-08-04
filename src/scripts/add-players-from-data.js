import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

function generateProjections(position, year) {
  const baseMultiplier = year === 'FR' ? 0.6 : year === 'SO' ? 0.8 : year === 'JR' ? 1.0 : 1.2;
  
  switch (position) {
    case 'QB':
      return {
        projection: Math.round(1800 + (baseMultiplier * 400)),
        rushing_projection: Math.round(120 + (baseMultiplier * 30)),
        receiving_projection: 0,
        td_projection: Math.round(12 + (baseMultiplier * 4)),
        int_projection: Math.round(6 + (baseMultiplier * 2)),
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(160 + (baseMultiplier * 30))
      };
    case 'RB':
      return {
        projection: Math.round(600 + (baseMultiplier * 200)),
        rushing_projection: Math.round(500 + (baseMultiplier * 150)),
        receiving_projection: Math.round(80 + (baseMultiplier * 30)),
        td_projection: Math.round(4 + (baseMultiplier * 3)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(90 + (baseMultiplier * 25))
      };
    case 'WR':
      return {
        projection: Math.round(400 + (baseMultiplier * 200)),
        rushing_projection: Math.round(15 + (baseMultiplier * 5)),
        receiving_projection: Math.round(400 + (baseMultiplier * 200)),
        td_projection: Math.round(3 + (baseMultiplier * 2)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(65 + (baseMultiplier * 20))
      };
    case 'TE':
      return {
        projection: Math.round(200 + (baseMultiplier * 150)),
        rushing_projection: 0,
        receiving_projection: Math.round(200 + (baseMultiplier * 150)),
        td_projection: Math.round(2 + (baseMultiplier * 1)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(35 + (baseMultiplier * 15))
      };
    case 'K':
      return {
        projection: 0,
        rushing_projection: 0,
        receiving_projection: 0,
        td_projection: 0,
        int_projection: 0,
        field_goals_projection: Math.round(12 + (baseMultiplier * 3)),
        extra_points_projection: Math.round(25 + (baseMultiplier * 8)),
        fantasy_points: Math.round(70 + (baseMultiplier * 15))
      };
    default:
      return {
        projection: 0,
        rushing_projection: 0,
        receiving_projection: 0,
        td_projection: 0,
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: 0
      };
  }
}

async function addPlayersFromData(playersData) {
  console.log('🏈 Adding Players from Data...');
  console.log('=============================');
  console.log(`📋 Adding ${playersData.length} players`);
  console.log('');

  let addedCount = 0;
  let errorCount = 0;

  for (const playerData of playersData) {
    try {
      const projections = generateProjections(playerData.position, playerData.year);
      
      const player = {
        name: playerData.name,
        position: playerData.position,
        team: playerData.team,
        team_abbreviation: playerData.team_abbreviation,
        school: playerData.team,
        conference: playerData.conference,
        conference_id: playerData.conference_id,
        power_4: playerData.power_4,
        jersey: playerData.jersey || '',
        height: playerData.height || '6-0',
        weight: playerData.weight || '200',
        year: playerData.year || 'FR',
        draftable: playerData.draftable || false,
        ...projections,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', player);
      console.log(`  ✅ Added ${player.name} (${player.position}) - ${player.team}`);
      addedCount++;
    } catch (error) {
      console.log(`  ❌ Error adding ${playerData.name}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n🎉 Player Addition Summary:');
  console.log(`  ✅ Total players added: ${addedCount}`);
  console.log(`  ❌ Total errors: ${errorCount}`);
  console.log('🏈 Players added successfully!');
}

// Example usage - you can replace this with your actual data
const examplePlayers = [
  {
    name: "Example Player",
    position: "QB",
    team: "Example Team",
    team_abbreviation: "EXT",
    conference: "Example Conference",
    conference_id: "example",
    power_4: false,
    jersey: "1",
    height: "6-2",
    weight: "210",
    year: "JR",
    draftable: true
  }
];

// Uncomment the line below to add example players
// addPlayersFromData(examplePlayers);

console.log('📋 Ready to add players!');
console.log('To use this script:');
console.log('1. Replace examplePlayers with your actual player data');
console.log('2. Uncomment the addPlayersFromData(examplePlayers) line');
console.log('3. Run the script'); 