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

const utahPlayers = [
  { name: 'Drew Cowart', position: 'QB', team: 'Utah', team_abbreviation: 'UTAH', year: 'FR', jersey: '16', height: '6\'2"', weight: '195 lb', draftable: false },
  { name: 'Devon Dampier', position: 'QB', team: 'Utah', team_abbreviation: 'UTAH', year: 'JR', jersey: '4', height: '5\'11"', weight: '204 lb', draftable: true },
  { name: 'Byrd Ficklin', position: 'QB', team: 'Utah', team_abbreviation: 'UTAH', year: 'FR', jersey: '15', height: '6\'1"', weight: '181 lb', draftable: false },
  { name: 'Isaac Wilson', position: 'QB', team: 'Utah', team_abbreviation: 'UTAH', year: 'SO', jersey: '11', height: '6\'0"', weight: '212 lb', draftable: false },
  { name: 'Brendan Zurbrugg', position: 'QB', team: 'Utah', team_abbreviation: 'UTAH', year: 'FR', jersey: '14', height: '6\'3"', weight: '197 lb', draftable: false },
  { name: 'Daniel Bray', position: 'RB', team: 'Utah', team_abbreviation: 'UTAH', year: 'FR', jersey: '13', height: '5\'10"', weight: '171 lb', draftable: false },
  { name: 'Dijon Stanley', position: 'RB', team: 'Utah', team_abbreviation: 'UTAH', year: 'SO', jersey: '23', height: '6\'0"', weight: '185 lb', draftable: false },
  { name: 'Micah Bernard', position: 'RB', team: 'Utah', team_abbreviation: 'UTAH', year: 'SR', jersey: 'N/A', height: 'N/A', weight: 'N/A', draftable: true },
  { name: 'Mike Mitchell', position: 'RB', team: 'Utah', team_abbreviation: 'UTAH', year: 'SR', jersey: 'N/A', height: 'N/A', weight: 'N/A', draftable: true },
  { name: 'Brant Kuithe', position: 'TE', team: 'Utah', team_abbreviation: 'UTAH', year: 'SR', jersey: 'N/A', height: 'N/A', weight: 'N/A', draftable: true },
  { name: 'Hunter Andrews', position: 'TE', team: 'Utah', team_abbreviation: 'UTAH', year: 'SO', jersey: 'N/A', height: 'N/A', weight: 'N/A', draftable: false },
  { name: 'Zacharyus Williams', position: 'WR', team: 'Utah', team_abbreviation: 'UTAH', year: 'SR', jersey: 'N/A', height: 'N/A', weight: 'N/A', draftable: true },
  { name: 'Money Parks', position: 'WR', team: 'Utah', team_abbreviation: 'UTAH', year: 'SR', jersey: 'N/A', height: 'N/A', weight: 'N/A', draftable: true }
];

async function addUtahPlayers() {
  console.log('🏈 Adding Utah Players...');
  console.log('==========================');
  console.log('📋 Adding 13 Utah players (Pac-12)');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of utahPlayers) {
    try {
      const projections = generateProjections(player.position, player.year);

      const playerData = {
        name: player.name,
        position: player.position,
        team: player.team,
        team_abbreviation: player.team_abbreviation,
        school: player.team,
        conference: 'Pac-12',
        jersey: player.jersey === 'N/A' ? '0' : player.jersey,
        height: player.height === 'N/A' ? '6-0' : player.height,
        weight: player.weight === 'N/A' ? '200' : player.weight,
        year: player.year,
        ...projections,
        draftable: player.draftable,
        conference_id: 'pac-12',
        power_4: true, // Pac-12 is Power 4
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', playerData);
      console.log(`  ✅ ${player.name} (${player.position}) - ${player.team} - ${player.year} - Draftable: ${player.draftable}`);
      totalAdded++;
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠️  ${player.name} already exists`);
      } else {
        console.log(`  ❌ Error adding ${player.name}: ${error.message}`);
        totalErrors++;
      }
    }
  }

  console.log('\n🎉 Utah Players Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Team: Utah (Pac-12)`);
  console.log('🏈 Utah players completed!');
}

addUtahPlayers(); 