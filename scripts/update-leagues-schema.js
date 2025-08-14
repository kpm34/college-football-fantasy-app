const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function updateLeaguesSchema() {
  try {
    console.log('Updating leagues collection schema...');
    
    // Check if members attribute exists
    const collection = await databases.getCollection(
      'college-football-fantasy',
      'leagues'
    );
    
    const hasMembers = collection.attributes.some(attr => attr.key === 'members');
    
    if (!hasMembers) {
      console.log('Adding members attribute...');
      await databases.createStringAttribute(
        'college-football-fantasy',
        'leagues',
        'members',
        36, // Max length for user IDs (UUIDs are 32 chars)
        false, // Not required
        null, // No default
        true // Array
      );
      console.log('✅ Members attribute added successfully');
      
      // Wait a bit for schema to propagate (Appwrite might need time)
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('Members attribute already exists');
    }
    
    // Now proceed with updating leagues
    const leagues = await databases.listDocuments(
      'college-football-fantasy',
      'leagues',
      [Query.limit(100)]
    );
    
    console.log(`Found ${leagues.total} leagues`);
    
    for (const league of leagues.documents) {
      console.log(`\nProcessing league: ${league.name} (${league.$id})`);
      
      // Get rosters
      const rosters = await databases.listDocuments(
        'college-football-fantasy',
        'rosters',
        [Query.equal('leagueId', league.$id)]
      );
      
      const memberIds = [...new Set(rosters.documents.map(r => r.userId).filter(Boolean))];
      
      console.log(`Found ${memberIds.length} members:`, memberIds);
      
      const updatedLeague = await databases.updateDocument(
        'college-football-fantasy',
        'leagues',
        league.$id,
        {
          members: memberIds
        }
      );
      
      console.log(`✅ Updated league ${league.name} with ${memberIds.length} members`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

updateLeaguesSchema();
