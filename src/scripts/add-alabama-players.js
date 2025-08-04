
import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

// Helper function to convert decimal rating to star rating
function convertToStarRating(decimalRating) {
  if (decimalRating >= 0.9500) return 5; // 5-star
  if (decimalRating >= 0.9000) return 4; // 4-star  
  if (decimalRating >= 0.8500) return 3; // 3-star
  return 2; // 2-star or unrated
}

// Alabama Crimson Tide 2025 Players (from SEC data)
const alabamaPlayers = [
  // Quarterbacks
  {
    name: 'Cade Carruth',
    position: 'QB',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '16',
    height: '6-1',
    weight: '215',
    year: 'SR',
    rating: 3, // 3-star (estimated since NA in data)
    projection: 1800,
    rushing_projection: 200,
    receiving_projection: 0,
    td_projection: 15,
    int_projection: 6,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 158.0
  },
  {
    name: 'John Cooper',
    position: 'QB',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '19',
    height: '6-2',
    weight: '195',
    year: 'SO',
    rating: 0.8500, // Estimated since NA in data
    projection: 1200,
    rushing_projection: 150,
    receiving_projection: 0,
    td_projection: 10,
    int_projection: 4,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 118.0
  },
  {
    name: 'John Gazzaniga',
    position: 'QB',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '13',
    height: '6-7',
    weight: '252',
    year: 'FR',
    rating: 0.8500, // Estimated since NA in data
    projection: 800,
    rushing_projection: 100,
    receiving_projection: 0,
    td_projection: 6,
    int_projection: 3,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 78.0
  },

  // Running Backs
  {
    name: 'AK Dear',
    position: 'RB',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '0',
    height: '6-1',
    weight: '212',
    year: 'FR',
    rating: 0.9729,
    projection: 800,
    rushing_projection: 800,
    receiving_projection: 150,
    td_projection: 8,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 125.0
  },
  {
    name: 'Daniel Hill',
    position: 'RB',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '4',
    height: '6-1',
    weight: '244',
    year: 'SO',
    rating: 0.9348,
    projection: 600,
    rushing_projection: 600,
    receiving_projection: 100,
    td_projection: 6,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 100.0
  },

  // Wide Receivers
  {
    name: 'Cole Adams',
    position: 'WR',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '7',
    height: '5-10',
    weight: '183',
    year: 'SO',
    rating: 0.9042,
    projection: 750,
    rushing_projection: 25,
    receiving_projection: 750,
    td_projection: 6,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 113.5
  },
  {
    name: 'Germie Bernard',
    position: 'WR',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '5',
    height: '6-1',
    weight: '204',
    year: 'SR',
    rating: 0.9125,
    projection: 850,
    rushing_projection: 30,
    receiving_projection: 850,
    td_projection: 7,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 128.0
  },
  {
    name: 'Lotzeir Brooks',
    position: 'WR',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '17',
    height: '5-9',
    weight: '191',
    year: 'FR',
    rating: 0.9276,
    projection: 650,
    rushing_projection: 20,
    receiving_projection: 650,
    td_projection: 5,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 97.0
  },
  {
    name: 'Jalen Hale',
    position: 'WR',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '8',
    height: '6-1',
    weight: '197',
    year: 'SO',
    rating: 0.9802,
    projection: 950,
    rushing_projection: 25,
    receiving_projection: 950,
    td_projection: 8,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 142.5
  },
  {
    name: 'Aeryn Hampton',
    position: 'WR',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '6',
    height: '5-10',
    weight: '195',
    year: 'FR',
    rating: 0.9169,
    projection: 550,
    rushing_projection: 15,
    receiving_projection: 550,
    td_projection: 4,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 82.5
  },
  {
    name: 'Isaiah Horton',
    position: 'WR',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '1',
    height: '6-4',
    weight: '208',
    year: 'JR',
    rating: 0.8948,
    projection: 700,
    rushing_projection: 20,
    receiving_projection: 700,
    td_projection: 6,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 106.0
  },

  // Tight Ends
  {
    name: 'Josh Cuevas',
    position: 'TE',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '80',
    height: '6-3',
    weight: '256',
    year: 'SR',
    rating: 0.8500, // Estimated since NA in data
    projection: 400,
    rushing_projection: 0,
    receiving_projection: 400,
    td_projection: 4,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 64.0
  },
  {
    name: 'Brody Dalton',
    position: 'TE',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '89',
    height: '6-5',
    weight: '251',
    year: 'SR',
    rating: 0.8083,
    projection: 300,
    rushing_projection: 0,
    receiving_projection: 300,
    td_projection: 3,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 48.0
  },
  {
    name: 'Kaleb Edwards',
    position: 'TE',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '81',
    height: '6-6',
    weight: '264',
    year: 'FR',
    rating: 0.9318,
    projection: 350,
    rushing_projection: 0,
    receiving_projection: 350,
    td_projection: 3,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 53.0
  },
  {
    name: 'Jayden Hobson',
    position: 'TE',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '48',
    height: '6-5',
    weight: '255',
    year: 'SO',
    rating: 0.8403,
    projection: 250,
    rushing_projection: 0,
    receiving_projection: 250,
    td_projection: 2,
    int_projection: 0,
    field_goals_projection: 0,
    extra_points_projection: 0,
    fantasy_points: 37.0
  },

  // Kicker
  {
    name: 'Tucker Cornelius',
    position: 'K',
    team: 'Alabama',
    team_abbreviation: 'ALA',
    school: 'Alabama',
    conference: 'SEC',
    jersey: '98',
    height: '6-3',
    weight: '195',
    year: 'SO',
    rating: 0.8500, // Estimated since NA in data
    projection: 0,
    rushing_projection: 0,
    receiving_projection: 0,
    td_projection: 0,
    int_projection: 0,
    field_goals_projection: 18,
    extra_points_projection: 42,
    fantasy_points: 96.0
  }
];

async function addAlabamaPlayers() {
  console.log('🏈 Adding Alabama Crimson Tide 2025 Players...');
  console.log('============================================================');
  console.log('📋 Based on SEC College Football data');
  console.log('');

  try {
    let addedCount = 0;
    let errorCount = 0;

    for (const player of alabamaPlayers) {
      try {
        const playerData = {
          name: player.name,
          position: player.position,
          team: player.team,
          team_abbreviation: player.team_abbreviation,
          school: player.school,
          conference: player.conference,
          jersey: player.jersey,
          height: player.height,
          weight: player.weight,
          year: player.year,
          rating: player.rating,
          projection: player.projection,
          rushing_projection: player.rushing_projection,
          receiving_projection: player.receiving_projection,
          td_projection: player.td_projection,
          int_projection: player.int_projection,
          field_goals_projection: player.field_goals_projection,
          extra_points_projection: player.extra_points_projection,
          fantasy_points: player.fantasy_points,
          draftable: true, // All players are draftable
          conference_id: 'sec', // SEC conference ID
          power_4: true, // SEC is a Power 4 conference
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', playerData);
        console.log(`  ✅ Added: ${player.name} (${player.position}) - ${player.school}`);
        addedCount++;
      } catch (error) {
        console.log(`  ❌ Error adding ${player.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  ✅ Successfully added: ${addedCount} players`);
    console.log(`  ❌ Errors: ${errorCount} players`);
    console.log(`  📋 Total processed: ${alabamaPlayers.length} players`);

    if (errorCount === 0) {
      console.log('\n🎉 All Alabama players added successfully!');
      console.log('📝 Note: These are current 2025 roster players from SEC data');
    } else {
      console.log('\n⚠️  Some players had errors. Check the logs above.');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

addAlabamaPlayers(); 