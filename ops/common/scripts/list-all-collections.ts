#!/usr/bin/env tsx
/**
 * List All Collections - See what collections actually exist in database
 */

import { Client, Databases } from 'node-appwrite';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function listAllCollections(): Promise<void> {
  console.log('📋 Listing All Database Collections');
  console.log('===================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // List all collections in database
    const collections = await databases.listCollections(DATABASE_ID);

    console.log(`🗂️ Found ${collections.total} collections:\n`);

    collections.collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
      console.log(`   ID: ${collection.$id}`);
      console.log(`   Attributes: ${collection.attributes?.length || 0}`);
      console.log(`   Documents: ${collection.documentSecurity ? 'Document Security Enabled' : 'Collection Security'}`);
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Failed to list collections:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await listAllCollections();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { listAllCollections };