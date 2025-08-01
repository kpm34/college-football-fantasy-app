import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';

dotenv.config();

async function testConnection() {
  console.log('Testing Appwrite connection...\n');
  
  console.log('Configuration:');
  console.log('Endpoint:', process.env.APPWRITE_ENDPOINT);
  console.log('Project ID:', process.env.APPWRITE_PROJECT_ID);
  console.log('API Key:', process.env.APPWRITE_API_KEY?.substring(0, 20) + '...');
  
  const client = new Client();
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);
  
  try {
    // Try to list existing databases
    console.log('\nTrying to list databases...');
    const list = await databases.list();
    console.log('✅ Connection successful!');
    console.log(`Found ${list.total} databases`);
    
    if (list.databases.length > 0) {
      console.log('\nExisting databases:');
      list.databases.forEach(db => {
        console.log(`- ${db.name} (ID: ${db.$id})`);
      });
    }
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === 401) {
      console.error('\nAuthentication error. Please check:');
      console.error('1. API Key has correct permissions');
      console.error('2. API Key belongs to this project');
    }
  }
}

testConnection();