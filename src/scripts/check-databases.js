import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);

async function checkDatabases() {
  try {
    console.log('🔍 Checking Appwrite Databases and Collections...');
    console.log('================================================');
    
    // List all databases
    const dbResponse = await databases.list();
    console.log(`\n📊 FOUND ${dbResponse.databases.length} DATABASES:`);
    
    for (const db of dbResponse.databases) {
      console.log(`\n🏗️  Database: ${db.name} (${db.$id})`);
      console.log(`   Created: ${db.$createdAt}`);
      
      // List collections in this database
      try {
        const collectionsResponse = await databases.listCollections(db.$id);
        console.log(`   📁 Collections (${collectionsResponse.collections.length}):`);
        
        for (const collection of collectionsResponse.collections) {
          console.log(`      - ${collection.name} (${collection.$id})`);
          
          // Try to get document count for this collection
          try {
            const docsResponse = await databases.listDocuments(db.$id, collection.$id, [], 1, 0);
            console.log(`        📄 Documents: ${docsResponse.total} total`);
          } catch (e) {
            console.log(`        ❌ Error getting document count: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`   ❌ Error listing collections: ${e.message}`);
      }
    }
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking databases:', error.message);
  }
}

checkDatabases(); 