#!/usr/bin/env node

const { Client, Databases } = require('appwrite');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

// Collection schemas
const collections = {
  player_projections: {
    name: 'Player Projections',
    attributes: [
      { key: 'playerId', type: 'string', size: 100, required: true },
      { key: 'playerName', type: 'string', size: 100, required: true },
      { key: 'position', type: 'string', size: 10, required: true },
      { key: 'team', type: 'string', size: 100, required: true },
      { key: 'conference', type: 'string', size: 50, required: true },
      { key: 'school', type: 'string', size: 100, required: true },
      { key: 'year', type: 'string', size: 20, required: true },
      { key: 'prevYearStats', type: 'string', size: 5000, required: false },
      { key: 'ratings', type: 'string', size: 1000, required: false },
      { key: 'projections', type: 'string', size: 5000, required: true },
      { key: 'rankings', type: 'string', size: 1000, required: true },
      { key: 'sources', type: 'string', size: 2000, required: false },
      { key: 'risk', type: 'string', size: 1000, required: false },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'position_idx', type: 'key', attributes: ['position'] },
      { key: 'conference_idx', type: 'key', attributes: ['conference'] },
      { key: 'school_idx', type: 'key', attributes: ['school'] },
      { key: 'playerId_idx', type: 'unique', attributes: ['playerId'] }
    ]
  },
  draft_picks: {
    name: 'Draft Picks',
    attributes: [
      { key: 'leagueId', type: 'string', size: 100, required: true },
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'playerId', type: 'string', size: 100, required: true },
      { key: 'playerName', type: 'string', size: 100, required: true },
      { key: 'position', type: 'string', size: 10, required: true },
      { key: 'team', type: 'string', size: 100, required: true },
      { key: 'pickNumber', type: 'integer', required: true },
      { key: 'round', type: 'integer', required: true },
      { key: 'timestamp', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
      { key: 'user_idx', type: 'key', attributes: ['userId'] },
      { key: 'pick_unique', type: 'unique', attributes: ['leagueId', 'pickNumber'] }
    ]
  }
};

async function createCollectionIfNotExists(collectionId, config) {
  try {
    // Check if collection exists
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection ${collectionId} already exists`);
  } catch (error) {
    if (error.code === 404) {
      // Create collection
      console.log(`Creating collection ${collectionId}...`);
      try {
        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          config.name,
          ['read("any")', 'create("users")', 'update("users")', 'delete("users")']
        );
        
        // Create attributes
        for (const attr of config.attributes) {
          console.log(`Creating attribute ${attr.key}...`);
          switch (attr.type) {
            case 'string':
              await databases.createStringAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.size,
                attr.required,
                attr.default
              );
              break;
            case 'integer':
              await databases.createIntegerAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.required,
                attr.min || -9223372036854775808,
                attr.max || 9223372036854775807,
                attr.default
              );
              break;
            case 'datetime':
              await databases.createDatetimeAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.required,
                attr.default
              );
              break;
          }
          // Wait a bit between attributes to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Create indexes
        for (const index of config.indexes || []) {
          console.log(`Creating index ${index.key}...`);
          await databases.createIndex(
            databaseId,
            collectionId,
            index.key,
            index.type,
            index.attributes
          );
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`Collection ${collectionId} created successfully`);
      } catch (createError) {
        console.error(`Error creating collection ${collectionId}:`, createError);
      }
    } else {
      console.error(`Error checking collection ${collectionId}:`, error);
    }
  }
}

async function main() {
  console.log('Syncing Appwrite configuration...');
  
  for (const [collectionId, config] of Object.entries(collections)) {
    await createCollectionIfNotExists(collectionId, config);
  }
  
  console.log('Configuration sync complete!');
}

main().catch(console.error);
