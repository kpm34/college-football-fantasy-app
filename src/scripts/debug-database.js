import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);

async function debugDatabase() {
  try {
    console.log('🔍 Debugging Appwrite Database Structure...');
    console.log('==========================================');
    
    // List all databases
    console.log('\n📊 ALL DATABASES:');
    const dbList = await databases.list();
    dbList.databases.forEach(db => {
      console.log(`  📁 Database: ${db.name} (ID: ${db.$id})`);
    });
    
    // Check each database for collections
    for (const db of dbList.databases) {
      console.log(`\n📂 COLLECTIONS IN DATABASE "${db.name}" (${db.$id}):`);
      try {
        const collections = await databases.listCollections(db.$id);
        collections.collections.forEach(col => {
          console.log(`  📄 Collection: ${col.name} (ID: ${col.$id})`);
          
          // Try to get document count for each collection
          try {
            databases.listDocuments(db.$id, col.$id, [], 1, 0)
              .then(response => {
                console.log(`    📊 Document count: ${response.total} documents`);
              })
              .catch(err => {
                console.log(`    ❌ Error getting count: ${err.message}`);
              });
          } catch (err) {
            console.log(`    ❌ Error accessing collection: ${err.message}`);
          }
        });
      } catch (err) {
        console.log(`  ❌ Error listing collections: ${err.message}`);
      }
    }
    
    // Check specific database we're using
    console.log('\n🎯 CHECKING OUR TARGET DATABASE:');
    console.log(`Database ID: college-football-fantasy`);
    console.log(`Collection ID: college_players`);
    
    try {
      const response = await databases.listDocuments('college-football-fantasy', 'college_players', [], 1, 0);
      console.log(`✅ Found ${response.total} total documents in college_players collection`);
    } catch (err) {
      console.log(`❌ Error accessing college_players: ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging database:', error.message);
  }
}

debugDatabase(); 