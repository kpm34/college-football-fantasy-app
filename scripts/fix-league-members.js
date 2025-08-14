const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixLeagueMembers() {
  try {
    const leagueId = process.argv[2];
    
    if (!leagueId) {
      console.error('Usage: node fix-league-members.js <leagueId>');
      process.exit(1);
    }

    console.log(`\nFixing members for league: ${leagueId}`);
    
    // Get rosters to find member IDs
    const rosters = await databases.listDocuments(
      'college-football-fantasy',
      'rosters',
      [Query.equal('leagueId', leagueId)]
    );
    
    console.log(`Found ${rosters.total} rosters`);
    
    // Extract unique user IDs
    const memberIds = rosters.documents.map(roster => roster.userId).filter(Boolean);
    console.log('Member IDs:', memberIds);
    
    // Update league document with members array
    const updatedLeague = await databases.updateDocument(
      'college-football-fantasy',
      'leagues',
      leagueId,
      {
        members: memberIds,
        teams: memberIds.length // Also update teams count
      }
    );
    
    console.log('\n✅ League updated successfully!');
    console.log('Members array:', updatedLeague.members);
    console.log('Teams count:', updatedLeague.teams);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixLeagueMembers();
