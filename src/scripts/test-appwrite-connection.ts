import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testConnection() {
  console.log('Testing Appwrite connection...\n');
  
  console.log('Configuration:');
  console.log('Endpoint:', process.env.APPWRITE_ENDPOINT);
  console.log('Project ID:', process.env.APPWRITE_PROJECT_ID);
  console.log('API Key:', process.env.APPWRITE_API_KEY?.substring(0, 20) + '...');
  
  if (!process.env.APPWRITE_API_KEY || process.env.APPWRITE_API_KEY === 'your-api-key-here') {
    console.error('❌ API Key not configured properly');
    console.error('Please check your .env file and ensure APPWRITE_API_KEY is set correctly');
    return;
  }
  
  const client = new Client();
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
    .setKey(process.env.APPWRITE_API_KEY);

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
    } else {
      console.log('\nNo databases found. We may need to create the college football database.');
    }
    
    // Try to create the college football database if it doesn't exist
    console.log('\nChecking for college football database...');
    try {
      const collegeFootballDb = await databases.get('college_football');
      console.log('✅ College football database exists!');
      console.log(`Database: ${collegeFootballDb.name} (ID: ${collegeFootballDb.$id})`);
      
      // List collections
      console.log('\nCollections in college football database:');
      const collections = await databases.listCollections('college_football');
      console.log(`Found ${collections.total} collections`);
      
      collections.collections.forEach(collection => {
        console.log(`- ${collection.name} (ID: ${collection.$id})`);
      });
      
    } catch (dbError: any) {
      if (dbError.code === 404) {
        console.log('❌ College football database not found');
        console.log('We need to create the database and collections');
      } else {
        console.error('Error checking database:', dbError.message);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === 401) {
      console.error('\nAuthentication error. Please check:');
      console.error('1. API Key has correct permissions');
      console.error('2. API Key belongs to this project');
      console.error('3. API Key is properly formatted in .env file');
    }
  }
}

testConnection();