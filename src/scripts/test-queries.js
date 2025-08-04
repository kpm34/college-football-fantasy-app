import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

async function testQueries() {
  try {
    console.log('🔍 Testing different queries...');
    
    // Test 1: Get Big Ten players
    console.log('\n1️⃣ Testing Big Ten query...');
    const bigTenQuery = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTION_ID,
      [Query.equal('conference', 'Big Ten')],
      25, 
      0
    );
    console.log(`   Big Ten - Total: ${bigTenQuery.total} | Documents: ${bigTenQuery.documents.length}`);
    if (bigTenQuery.documents.length > 0) {
      console.log(`   Sample: ${bigTenQuery.documents[0].name} (${bigTenQuery.documents[0].position}) - ${bigTenQuery.documents[0].team}`);
    }
    
    // Test 2: Get SEC players
    console.log('\n2️⃣ Testing SEC query...');
    const secQuery = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTION_ID,
      [Query.equal('conference', 'SEC')],
      25, 
      0
    );
    console.log(`   SEC - Total: ${secQuery.total} | Documents: ${secQuery.documents.length}`);
    if (secQuery.documents.length > 0) {
      console.log(`   Sample: ${secQuery.documents[0].name} (${secQuery.documents[0].position}) - ${secQuery.documents[0].team}`);
    }
    
    // Test 3: Get UCLA players specifically
    console.log('\n3️⃣ Testing UCLA query...');
    const uclaQuery = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTION_ID,
      [Query.equal('team', 'UCLA')],
      25, 
      0
    );
    console.log(`   UCLA - Total: ${uclaQuery.total} | Documents: ${uclaQuery.documents.length}`);
    if (uclaQuery.documents.length > 0) {
      console.log(`   Sample: ${uclaQuery.documents[0].name} (${uclaQuery.documents[0].position}) - ${uclaQuery.documents[0].team}`);
    }
    
    // Test 4: Get all players with no query
    console.log('\n4️⃣ Testing no query (all players)...');
    const allQuery = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTION_ID,
      [],
      25, 
      0
    );
    console.log(`   All - Total: ${allQuery.total} | Documents: ${allQuery.documents.length}`);
    if (allQuery.documents.length > 0) {
      console.log(`   Sample: ${allQuery.documents[0].name} (${allQuery.documents[0].position}) - ${allQuery.documents[0].team}`);
    }
    
    // Test 5: Try to get more than 25 with pagination
    console.log('\n5️⃣ Testing pagination...');
    const page1 = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [], 25, 0);
    const page2 = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [], 25, 25);
    console.log(`   Page 1: ${page1.documents.length} documents`);
    console.log(`   Page 2: ${page2.documents.length} documents`);
    console.log(`   Page 1 first: ${page1.documents[0]?.name}`);
    console.log(`   Page 2 first: ${page2.documents[0]?.name}`);
    
  } catch (error) {
    console.error('❌ Error testing queries:', error.message);
  }
}

testQueries(); 