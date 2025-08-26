#!/usr/bin/env tsx
import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function checkAttributes() {
  try {
    const attrs = await databases.listAttributes(DATABASE_ID, 'leagues');
    console.log('League collection attributes:');
    console.log('Total attributes:', attrs.total);
    console.log('\nAttributes list:');
    for (const attr of attrs.attributes) {
      console.log(`  - ${attr.key} (${attr.type})`);
      if (attr.key.toLowerCase().includes('commission')) {
        console.log('    ^ COMMISSIONER FIELD FOUND');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAttributes();
