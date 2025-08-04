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

const notreDamePlayers = [
  { name: 'Kenny Minchey', position: 'QB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '8', draftable: false },
  { name: 'CJ Carr', position: 'QB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '12', draftable: false },
  { name: 'Anthony Rezac', position: 'QB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '15', draftable: false },
  { name: 'Steve Angeli', position: 'QB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '18', draftable: false },
  { name: 'Gi\'Bran Payne', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '3', draftable: true },
  { name: 'Jeremiyah Love', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '4', draftable: false },
  { name: 'Aneyas Williams', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '20', draftable: false },
  { name: 'Kedren Young', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '21', draftable: false },
  { name: 'Devyn Ford', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '22', draftable: true },
  { name: 'Justin Fisher', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '23', draftable: true },
  { name: 'Jadarian Price', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '24', draftable: true },
  { name: 'Dylan Devezin', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '25', draftable: true },
  { name: 'Jake Tafelski', position: 'RB', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '35', draftable: true },
  { name: 'Deion Colzie', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '0', draftable: true },
  { name: 'Jaden Greathouse', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '1', draftable: false },
  { name: 'Jayden Harrison', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'GR', jersey: '2', draftable: true },
  { name: 'Beaux Collins', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '5', draftable: true },
  { name: 'Jordan Faison', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '6', draftable: false },
  { name: 'Kris Mitchell', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'GR', jersey: '10', draftable: true },
  { name: 'KK Smith', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '11', draftable: false },
  { name: 'Micah Gilbert', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '14', draftable: false },
  { name: 'Cam Williams', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '17', draftable: false },
  { name: 'Logan Saldate', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '19', draftable: false },
  { name: 'Tyler Buchner', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '26', draftable: true },
  { name: 'Matt Jeffery', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '33', draftable: false },
  { name: 'Xavier Southall', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '80', draftable: false },
  { name: 'Jack Polian', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '81', draftable: true },
  { name: 'Leo Scheidler', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '82', draftable: true },
  { name: 'Jayden Thomas', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '83', draftable: true },
  { name: 'Alex Whitman', position: 'WR', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '86', draftable: false },
  { name: 'Eli Raridon', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'JR', jersey: '9', draftable: true },
  { name: 'Davis Sherwood', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '38', draftable: true },
  { name: 'Andrew Yanoshak', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '39', draftable: true },
  { name: 'Henry Garrity', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '42', draftable: false },
  { name: 'Kevin Bauman', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'GR', jersey: '84', draftable: true },
  { name: 'Jack Larsen', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'FR', jersey: '85', draftable: false },
  { name: 'Cooper Flanagan', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SO', jersey: '87', draftable: false },
  { name: 'Mitchell Evans', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'SR', jersey: '88', draftable: true },
  { name: 'Charlie Selna', position: 'TE', team: 'Notre Dame', team_abbreviation: 'ND', year: 'GR', jersey: '89', draftable: true }
];

async function addNotreDamePlayers() {
  console.log('🏈 Adding Notre Dame Players...');
  console.log('================================');
  console.log('📋 Adding 40 Notre Dame players (Independent)');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of notreDamePlayers) {
    try {
      const projections = generateProjections(player.position, player.year);

      const playerData = {
        name: player.name,
        position: player.position,
        team: player.team,
        team_abbreviation: player.team_abbreviation,
        school: player.team,
        conference: 'Independent',
        jersey: player.jersey,
        height: '6-0', // Default height
        weight: '200', // Default weight
        year: player.year,
        ...projections,
        draftable: player.draftable,
        conference_id: 'independent',
        power_4: false, // Notre Dame is Independent, not Power 4
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

  console.log('\n🎉 Notre Dame Players Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Team: Notre Dame (Independent)`);
  console.log('🏈 Notre Dame players completed!');
}

addNotreDamePlayers(); 