#!/usr/bin/env node

const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

async function checkSchema() {
  try {
    // Get some sample players to see the schema
    const response = await databases.listDocuments(
      databaseId,
      'college_players',
      []
    );
    
    if (response.documents.length > 0) {
      console.log('Sample player document:');
      console.log(JSON.stringify(response.documents[0], null, 2));
    } else {
      console.log('No documents found in college_players collection');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();