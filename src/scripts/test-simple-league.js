import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

async function testSimpleLeague() {
  console.log('🧪 Testing Simple League Creation...');
  console.log('====================================');

  try {
    // Try to create a league with just the schedule_generated attribute
    const leagueData = {
      schedule_generated: false
    };

    console.log('Creating league with minimal data...');
    const league = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      leagueData
    );

    console.log('✅ League created successfully!');
    console.log('League ID:', league.$id);
    console.log('League data:', league);

    return league;

  } catch (error) {
    console.error('❌ Error creating league:', error.message);
    return null;
  }
}

testSimpleLeague(); 