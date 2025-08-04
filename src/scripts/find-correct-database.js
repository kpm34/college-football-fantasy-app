import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);

async function findCorrectDatabase() {
  try {
    console.log('🔍 Searching for databases...');
    
    // List all databases
    const dbList = await databases.list();
    console.log(`\n📊 Found ${dbList.databases.length} databases:`);
    
    for (const db of dbList.databases) {
      console.log(`\n🏗️  Database: ${db.name} (ID: ${db.$id})`);
      
      try {
        // List collections in this database
        const collections = await databases.listCollections(db.$id);
        console.log(`  📁 Collections (${collections.collections.length}):`);
        
        for (const collection of collections.collections) {
          console.log(`    - ${collection.name} (ID: ${collection.$id})`);
          
          // If this is a college_players collection, check the document count
          if (collection.name.toLowerCase().includes('college') && collection.name.toLowerCase().includes('player')) {
            try {
              const documents = await databases.listDocuments(db.$id, collection.$id, [], 1, 0);
              console.log(`      📄 Document count: ${documents.total} documents`);
              
              // Show a sample document if available
              if (documents.documents.length > 0) {
                const sample = documents.documents[0];
                console.log(`      👤 Sample player: ${sample.name || 'No name'} (${sample.position || 'No position'}) - ${sample.team || 'No team'}`);
              }
            } catch (error) {
              console.log(`      ❌ Error checking documents: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`  ❌ Error listing collections: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error finding databases:', error.message);
  }
}

findCorrectDatabase(); 