const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function debugLeagueMembers() {
  try {
    // Replace with your league ID
    const leagueId = process.argv[2];
    
    if (!leagueId) {
      console.error('Usage: node debug-league-members.js <leagueId>');
      process.exit(1);
    }

    console.log(`\nFetching league: ${leagueId}`);
    
    // Get league document
    const league = await databases.getDocument(
      'college-football-fantasy',
      'leagues',
      leagueId
    );
    
    console.log('\n=== League Info ===');
    console.log('Name:', league.name);
    console.log('Commissioner:', league.commissioner);
    console.log('Max Teams:', league.maxTeams);
    console.log('Status:', league.status);
    
    console.log('\n=== Members Field ===');
    console.log('members field type:', typeof league.members);
    console.log('members field value:', league.members);
    console.log('members is array?', Array.isArray(league.members));
    console.log('members length:', Array.isArray(league.members) ? league.members.length : 'N/A');
    
    // Check for alternate member fields
    console.log('\n=== Other Member Fields ===');
    console.log('member_ids:', league.member_ids);
    console.log('memberIds:', league.memberIds);
    console.log('users:', league.users);
    console.log('userIds:', league.userIds);
    console.log('participants:', league.participants);
    
    // List all fields
    console.log('\n=== All League Fields ===');
    Object.keys(league).forEach(key => {
      if (!key.startsWith('$')) {
        console.log(`${key}:`, typeof league[key], Array.isArray(league[key]) ? `[Array of ${league[key].length}]` : '');
      }
    });
    
    // Check teams collection
    console.log('\n=== Teams in League ===');
    try {
      const { Query } = require('node-appwrite');
      const teams = await databases.listDocuments(
        'college-football-fantasy',
        'teams',
        [Query.equal('leagueId', leagueId)]
      );
      console.log('Teams found:', teams.total);
      teams.documents.forEach((team, i) => {
        console.log(`Team ${i+1}:`, {
          name: team.name,
          userId: team.userId,
          owner: team.owner,
          userName: team.userName
        });
      });
    } catch (e) {
      console.log('Error fetching teams:', e.message);
    }
    
    // Check rosters collection
    console.log('\n=== Rosters in League ===');
    try {
      const { Query } = require('node-appwrite');
      const rosters = await databases.listDocuments(
        'college-football-fantasy',
        'rosters',
        [Query.equal('leagueId', leagueId)]
      );
      console.log('Rosters found:', rosters.total);
      rosters.documents.forEach((roster, i) => {
        console.log(`Roster ${i+1}:`, {
          teamName: roster.teamName,
          userId: roster.userId,
          owner: roster.owner,
          userName: roster.userName
        });
      });
    } catch (e) {
      console.log('Error fetching rosters:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugLeagueMembers();
