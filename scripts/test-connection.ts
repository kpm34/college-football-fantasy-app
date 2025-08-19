import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players';

async function testConnection() {
  console.log('Testing Appwrite connection...');
  console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1');
  console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');
  console.log('API Key exists:', !!process.env.APPWRITE_API_KEY);
  
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log('✅ Connection successful!');
    console.log('Current documents in collection:', result.total);
  } catch (error) {
    console.log('❌ Connection failed:', error);
  }
}

testConnection();
