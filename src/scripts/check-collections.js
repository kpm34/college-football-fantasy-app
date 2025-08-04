import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

async function checkCollections() {
  console.log('🔍 Checking Appwrite Collections...');
  console.log('===================================');

  try {
    // List all collections
    const collections = await databases.listCollections(DATABASE_ID);
    console.log(`📋 Found ${collections.collections.length} collections:`);

    for (const collection of collections.collections) {
      console.log(`\n🏷️  Collection: ${collection.name} (ID: ${collection.$id})`);
      
      try {
        // Get collection attributes
        const attributes = await databases.listAttributes(DATABASE_ID, collection.$id);
        console.log(`  📝 Attributes (${attributes.attributes.length}):`);
        
        for (const attr of attributes.attributes) {
          console.log(`    - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ''}`);
        }
      } catch (error) {
        console.log(`  ❌ Error getting attributes: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  }
}

checkCollections(); 