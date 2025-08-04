import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

async function testCFBDIntegration() {
  console.log('🔍 Testing CFBD API Integration...');
  console.log('====================================');

  try {
    // Test CFBD API endpoint
    console.log('\n1️⃣ Testing CFBD API endpoint...');
    const cfbdResponse = await fetch('http://localhost:3001/api/cfbd/players?season=2025&conference=SEC');
    
    if (cfbdResponse.ok) {
      const cfbdResult = await cfbdResponse.json();
      console.log('✅ CFBD API Response:', cfbdResult.summary);
    } else {
      console.log('❌ CFBD API failed:', cfbdResponse.status, cfbdResponse.statusText);
    }

    // Check current player count
    console.log('\n2️⃣ Checking current player count...');
    const playersResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [], 1, 0);
    console.log(`📊 Total players in database: ${playersResponse.total}`);

    // Check players by conference
    console.log('\n3️⃣ Checking players by conference...');
    const conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    
    for (const conference of conferences) {
      try {
        const confResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [{ field: 'conference', operator: 'equal', value: conference }],
          1,
          0
        );
        console.log(`  ${conference}: ${confResponse.total} players`);
      } catch (error) {
        console.log(`  ${conference}: Error - ${error.message}`);
      }
    }

    // Test schedule generation
    console.log('\n4️⃣ Testing schedule generation...');
    const scheduleResponse = await fetch('http://localhost:3001/api/leagues/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leagueId: 'test-league-id',
        seasonYear: 2025,
        startWeek: 1,
        endWeek: 12
      })
    });

    if (scheduleResponse.ok) {
      const scheduleResult = await scheduleResponse.json();
      console.log('✅ Schedule generation test:', scheduleResult.message);
    } else {
      console.log('❌ Schedule generation failed:', scheduleResponse.status);
    }

    console.log('\n🎉 CFBD Integration Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCFBDIntegration(); 