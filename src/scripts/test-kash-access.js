import { Client, Databases } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);

async function testKashAccess() {
  console.log('🧪 Testing Kash Project Access...');
  console.log('='.repeat(60));
  console.log('🔗 Endpoint: https://nyc.cloud.appwrite.io/v1');
  console.log('📊 Project ID: college-football-fantasy-app');
  console.log('🔑 API Key: standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

  try {
    console.log('\n1️⃣ Testing database list access...');
    const databaseList = await databases.list();
    console.log('✅ Database list access successful!');
    console.log(`📊 Found ${databaseList.total} databases`);
    
    if (databaseList.databases.length > 0) {
      console.log('📋 Existing databases:');
      databaseList.databases.forEach(db => {
        console.log(`  - ${db.name} (ID: ${db.$id})`);
      });
    }

    // Check if our target database exists
    const targetDb = databaseList.databases.find(db => db.$id === 'college-football-fantasy');
    if (targetDb) {
      console.log(`\n✅ Target database exists: ${targetDb.name}`);
      
      // Try to list collections
      console.log('\n2️⃣ Testing collection access...');
      const collections = await databases.listCollections(targetDb.$id);
      console.log(`✅ Collection access successful! Found ${collections.total} collections`);
      
      collections.collections.forEach(col => {
        console.log(`  - ${col.name} (ID: ${col.$id})`);
      });
    } else {
      console.log('\n❌ Target database "college-football-fantasy" not found');
      console.log('💡 You may need to create it manually in the console');
    }

  } catch (error) {
    console.error('❌ Error accessing Kash project:', error.message);
    console.error('🔧 Troubleshooting:');
    console.error('  1. Check if the project exists in the NYC region');
    console.error('  2. Verify the API key has correct permissions');
    console.error('  3. Try creating the database manually in the console');
    console.error('  4. Check if the API key is active');
    
    if (error.code === 401) {
      console.error('\n🔑 Authentication Issues:');
      console.error('  - The API key may not have the required permissions');
      console.error('  - Try creating a new API key with full database permissions');
      console.error('  - Or create the database manually in the console first');
    }
  }
}

testKashAccess(); 