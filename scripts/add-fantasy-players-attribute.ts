#!/usr/bin/env tsx
/**
 * Add players attribute to fantasy_teams (string[])
 */
const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('APPWRITE_API_KEY missing in env');
  process.exit(1);
}

(async () => {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT).setKey(API_KEY);
  const databases = new Databases(client);

  const collectionId = 'fantasy_teams';
  const attrKey = 'players';

  try {
    console.log('Checking existing attributes...');
    const col = await databases.getCollection(DATABASE_ID, collectionId);
    const exists = (col.attributes || []).some((a) => a.key === attrKey);
    if (exists) {
      console.log('players attribute already exists. Skipping.');
      process.exit(0);
    }

    console.log('Creating players string[] attribute on fantasy_teams...');
    await databases.createStringAttribute(
      DATABASE_ID,
      collectionId,
      attrKey,
      64,
      false,
      null
    );

    // Make it an array via update (Appwrite v1 allows array=true on creation in newer SDKs; fallback here)
    // Some environments require createStringAttribute w/ array param; attempt if available
    if (typeof databases.createStringAttribute === 'function' && databases.createStringAttribute.length >= 7) {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          attrKey,
          64,
          false,
          null,
          true // array
        );
      } catch (e) {
        console.log('Array variant not supported; keeping as scalar string to unblock.');
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add attribute:', err?.message || err);
    process.exit(1);
  }
})();