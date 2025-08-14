const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || 'standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891');

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