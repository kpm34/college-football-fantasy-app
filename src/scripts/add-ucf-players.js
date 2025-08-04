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

const ucfPlayers = [
  { name: 'KJ Jefferson', position: 'QB', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Dylan Rizk', position: 'QB', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Jacurri Brown', position: 'QB', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'EJ Colson', position: 'QB', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Riley Trujillo', position: 'QB', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Brock Hansel', position: 'QB', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'Johnny Richardson', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'R.J. Harvey', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Peny Boone', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Kam Ingram', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'JR', jersey: 'N/A', draftable: true },
  { name: 'Stacy Gage', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Myles Montgomery', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'JR', jersey: 'N/A', draftable: true },
  { name: 'Preston Foreman', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'Tyler Wrenn', position: 'RB', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'Kobe Hudson', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Chauncey Magwood', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'JR', jersey: 'N/A', draftable: true },
  { name: 'Bredell Richardson', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Ja\'Varrius Johnson', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Tyree Patterson', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Jacoby Jones', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Jarrad Baker', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Trent Whittemore', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Kason Stokes', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Jordyn Bridgewater', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Carson Hinshaw', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Dwartney Wortham', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'Caleb Rollerson', position: 'WR', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Randy Pittman', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'Kylan Fox', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'FR', jersey: 'N/A', draftable: false },
  { name: 'Evan Morris', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Reece Adkins', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Thomas Wadsworth', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false },
  { name: 'Jordan Davis', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'SR', jersey: 'N/A', draftable: true },
  { name: 'Grant Stevens', position: 'TE', team: 'UCF', team_abbreviation: 'UCF', year: 'SO', jersey: 'N/A', draftable: false }
];

async function addUCFPlayers() {
  console.log('🏈 Adding UCF Players...');
  console.log('========================');
  console.log('📋 Adding 35 UCF players (Big 12)');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const player of ucfPlayers) {
    try {
      const projections = generateProjections(player.position, player.year);

      const playerData = {
        name: player.name,
        position: player.position,
        team: player.team,
        team_abbreviation: player.team_abbreviation,
        school: player.team,
        conference: 'Big 12',
        jersey: player.jersey,
        height: '6-0', // Default height
        weight: '200', // Default weight
        year: player.year,
        ...projections,
        draftable: player.draftable,
        conference_id: 'big12',
        power_4: true, // UCF is Big 12, which is Power 4
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

  console.log('\n🎉 UCF Players Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Team: UCF (Big 12)`);
  console.log('🏈 UCF players completed!');
}

addUCFPlayers(); 