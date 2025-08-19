import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players';

async function verifyCurrentData() {
  console.log('=== VERIFYING CURRENT PLAYER DATA ===\n');
  
  try {
    // Get total count
    const totalResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(1)]
    );
    
    console.log(`📊 Total players in database: ${totalResponse.total}`);
    console.log('─'.repeat(50));
    
    // Check by conference
    console.log('\n📍 Players by Conference:');
    const conferences = ['SEC', 'ACC', 'Big Ten', 'Big 12', 'Big Ten Conference', 'Big 12 Conference'];
    let conferenceTotal = 0;
    
    for (const conf of conferences) {
      try {
        const confResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('conference', conf), Query.limit(1)]
        );
        if (confResponse.total > 0) {
          console.log(`  • ${conf}: ${confResponse.total} players`);
          conferenceTotal += confResponse.total;
        }
      } catch (e) {
        // Conference might not exist
      }
    }
    
    console.log(`  • Total in Power 4: ${conferenceTotal} players`);
    console.log(`  • Other/Unknown: ${totalResponse.total - conferenceTotal} players`);
    console.log('─'.repeat(50));
    
    // Check by position
    console.log('\n🏈 Players by Position:');
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'OL', 'DL', 'LB', 'DB'];
    let positionTotal = 0;
    
    for (const pos of positions) {
      try {
        const posResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('position', pos), Query.limit(1)]
        );
        if (posResponse.total > 0) {
          console.log(`  • ${pos}: ${posResponse.total} players`);
          positionTotal += posResponse.total;
        }
      } catch (e) {
        // Position might not exist
      }
    }
    console.log('─'.repeat(50));
    
    // Sample some players to check data quality
    console.log('\n📋 Sample Players (first 5):');
    const sampleResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(5)]
    );
    
    for (const player of sampleResponse.documents) {
      console.log(`  • ${player.name} - ${player.position} - ${player.team} (${player.conference})`);
    }
    console.log('─'.repeat(50));
    
    // Check for specific teams to verify Big Ten/Big 12
    console.log('\n🏫 Checking for specific Power 4 teams:');
    const testTeams = [
      { team: 'Ohio State', conference: 'Big Ten' },
      { team: 'Michigan', conference: 'Big Ten' },
      { team: 'Texas', conference: 'SEC' },
      { team: 'Oklahoma', conference: 'SEC' },
      { team: 'Kansas State', conference: 'Big 12' },
      { team: 'Iowa State', conference: 'Big 12' },
      { team: 'Clemson', conference: 'ACC' },
      { team: 'Florida State', conference: 'ACC' }
    ];
    
    for (const { team, conference } of testTeams) {
      try {
        const teamResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('team', team), Query.limit(1)]
        );
        const status = teamResponse.total > 0 ? `✅ ${teamResponse.total} players` : '❌ Not found';
        console.log(`  • ${team} (${conference}): ${status}`);
      } catch (e) {
        console.log(`  • ${team} (${conference}): ❌ Error checking`);
      }
    }
    
    console.log('\n=== END OF VERIFICATION ===\n');
    
    // Summary
    if (totalResponse.total < 2000) {
      console.log('⚠️  WARNING: Database has fewer than 2000 players (expected 2000+)');
    }
    if (conferenceTotal < totalResponse.total * 0.9) {
      console.log('⚠️  WARNING: Many players missing conference data');
    }
    
  } catch (error) {
    console.error('Error verifying data:', error);
  }
}

verifyCurrentData();
