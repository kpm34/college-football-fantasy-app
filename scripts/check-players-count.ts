import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function checkPlayersCount() {
  try {
    console.log('Checking college_players collection...');
    
    // Get total count
    const totalResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
      [Query.limit(1)]
    );
    
    console.log(`Total players in database: ${totalResponse.total}`);
    
    // Check by conference
    const conferences = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
    for (const conf of conferences) {
      const confResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
        [Query.equal('conference', conf), Query.limit(1)]
      );
      console.log(`  ${conf}: ${confResponse.total} players`);
    }
    
    // Check draftable players
    const draftableResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
      [Query.equal('draftable', true), Query.limit(1)]
    );
    console.log(`\nDraftable players: ${draftableResponse.total}`);
    
    // Check by position
    const positions = ['QB', 'RB', 'WR', 'TE', 'K'];
    for (const pos of positions) {
      const posResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
        [Query.equal('position', pos), Query.limit(1)]
      );
      console.log(`  ${pos}: ${posResponse.total} players`);
    }
    
  } catch (error) {
    console.error('Error checking players:', error);
  }
}

checkPlayersCount();
