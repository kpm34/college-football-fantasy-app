const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || 'standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);

async function checkLeagues() {
  try {
    console.log('Checking leagues in database...\n');
    
    // Get all leagues
    const leagues = await databases.listDocuments(
      'college-football-fantasy',
      'leagues',
      [
        Query.limit(100)
      ]
    );
    
    console.log(`Found ${leagues.total} leagues:\n`);
    
    leagues.documents.forEach(league => {
      console.log(`- ${league.name} (ID: ${league.$id})`);
      console.log(`  Commissioner: ${league.commissioner || league.commissionerId || 'Unknown'}`);
      console.log(`  Status: ${league.status}`);
      console.log(`  Teams: ${league.currentTeams}/${league.maxTeams}\n`);
    });
    
    // Check for "jawn league" specifically
    const jawnSearch = leagues.documents.filter(l => 
      l.name?.toLowerCase().includes('jawn')
    );
    
    if (jawnSearch.length > 0) {
      console.log('Found "jawn league":');
      console.log(JSON.stringify(jawnSearch[0], null, 2));
    } else {
      console.log('No league with "jawn" in the name found.');
    }
    
  } catch (error) {
    console.error('Error checking leagues:', error);
  }
}

checkLeagues();