import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players';

async function clearDatabase() {
  console.log('🗑️  CLEARING PLAYER DATABASE\n');
  
  try {
    // Check current count
    const initial = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log(`📊 Current players: ${initial.total}`);
    
    if (initial.total === 0) {
      console.log('✅ Database is already empty!');
      return;
    }
    
    console.log('\n🔄 Deleting all players...');
    let deleted = 0;
    
    while (true) {
      const batch = await databases.listDocuments(
        DATABASE_ID, 
        COLLECTION_ID,
        [Query.limit(100)]
      );
      
      if (batch.documents.length === 0) break;
      
      for (const doc of batch.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        deleted++;
        if (deleted % 100 === 0) {
          process.stdout.write(`\r  Deleted: ${deleted}/${initial.total}`);
        }
      }
    }
    
    console.log(`\n✅ Deleted ${deleted} documents`);
    
    // Verify empty
    const final = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log(`\n📊 Final count: ${final.total}`);
    
    if (final.total === 0) {
      console.log('✅ DATABASE IS NOW EMPTY AND READY FOR RESTORATION');
    } else {
      console.log('⚠️  Warning: Database still has documents');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearDatabase();
