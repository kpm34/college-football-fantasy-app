#!/usr/bin/env ts-node
/**
 * Setup Appwrite Database and Collections
 * Creates the college football database and necessary collections
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEW_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.NEW_APPWRITE_API_KEY || '996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3');

const databases = new Databases(client);

async function setupDatabase() {
  console.log('🏗️ Setting up Appwrite Database and Collections...');
  console.log('=' .repeat(60));

  try {
    // 1. Create the college football database
    console.log('\n1️⃣ Creating college football database...');
    let database;
    try {
      database = await databases.create(
        'college_football',
        'College Football Fantasy'
      );
      console.log('✅ Database created successfully!');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('✅ Database already exists, using existing one');
        database = await databases.get('college_football');
      } else {
        throw error;
      }
    }

    console.log(`📊 Database: ${database.name} (ID: ${database.$id})`);

    // 2. Create collections
    const collections = [
      {
        id: 'teams',
        name: 'Teams',
        permissions: ['read("any")', 'write("any")'],
        attributes: [
          { key: 'name', type: 'string', required: true, size: 100 },
          { key: 'abbreviation', type: 'string', required: true, size: 10 },
          { key: 'conference', type: 'string', required: true, size: 50 },
          { key: 'division', type: 'string', required: true, size: 20 },
          { key: 'location', type: 'string', required: true, size: 100 },
          { key: 'stadium', type: 'string', required: true, size: 100 },
          { key: 'capacity', type: 'integer', required: true },
          { key: 'colors', type: 'string[]', required: true },
          { key: 'mascot', type: 'string', required: true, size: 50 },
          { key: 'coach', type: 'string', required: true, size: 100 },
          { key: 'established', type: 'integer', required: true },
          { key: 'conference_id', type: 'string', required: true, size: 50 },
          { key: 'power_4', type: 'boolean', required: true },
          { key: 'created_at', type: 'string', required: true, size: 50 }
        ]
      },
      {
        id: 'college_players',
        name: 'College Players',
        permissions: ['read("any")', 'write("any")'],
        attributes: [
          { key: 'name', type: 'string', required: true, size: 100 },
          { key: 'position', type: 'string', required: true, size: 10 },
          { key: 'team', type: 'string', required: true, size: 100 },
          { key: 'team_abbreviation', type: 'string', required: true, size: 10 },
          { key: 'conference', type: 'string', required: true, size: 50 },
          { key: 'year', type: 'string', required: true, size: 20 },
          { key: 'rating', type: 'integer', required: true },
          { key: 'draftable', type: 'boolean', required: true },
          { key: 'conference_id', type: 'string', required: true, size: 50 },
          { key: 'power_4', type: 'boolean', required: true },
          { key: 'created_at', type: 'string', required: true, size: 50 }
        ]
      },
      {
        id: 'games',
        name: 'Games',
        permissions: ['read("any")', 'write("any")'],
        attributes: [
          { key: 'home_team', type: 'string', required: true, size: 100 },
          { key: 'away_team', type: 'string', required: true, size: 100 },
          { key: 'date', type: 'string', required: true, size: 20 },
          { key: 'time', type: 'string', required: true, size: 10 },
          { key: 'venue', type: 'string', required: true, size: 100 },
          { key: 'conference_game', type: 'boolean', required: true },
          { key: 'rivalry', type: 'boolean', required: true },
          { key: 'week', type: 'integer', required: true },
          { key: 'season', type: 'integer', required: true },
          { key: 'conference', type: 'string', required: true, size: 50 },
          { key: 'status', type: 'string', required: true, size: 20 },
          { key: 'created_at', type: 'string', required: true, size: 50 }
        ]
      },
      {
        id: 'rankings',
        name: 'AP Rankings',
        permissions: ['read("any")', 'write("any")'],
        attributes: [
          { key: 'rank', type: 'integer', required: true },
          { key: 'team', type: 'string', required: true, size: 100 },
          { key: 'conference', type: 'string', required: true, size: 50 },
          { key: 'week', type: 'integer', required: true },
          { key: 'season', type: 'integer', required: true },
          { key: 'created_at', type: 'string', required: true, size: 50 }
        ]
      }
    ];

    console.log('\n2️⃣ Creating collections...');
    
    for (const collectionConfig of collections) {
      try {
        console.log(`Creating collection: ${collectionConfig.name}...`);
        
        const collection = await databases.createCollection(
          database.$id,
          collectionConfig.id,
          collectionConfig.name,
          collectionConfig.permissions
        );

        console.log(`✅ Collection ${collectionConfig.name} created!`);

        // Add attributes
        for (const attr of collectionConfig.attributes) {
          try {
                         if (attr.type === 'string') {
               await databases.createStringAttribute(
                 database.$id,
                 collection.$id,
                 attr.key,
                 attr.size || 255,
                 attr.required
               );
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(
                database.$id,
                collection.$id,
                attr.key,
                attr.required
              );
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                database.$id,
                collection.$id,
                attr.key,
                attr.required
              );
            } else if (attr.type === 'string[]') {
              await databases.createStringAttribute(
                database.$id,
                collection.$id,
                attr.key,
                255,
                attr.required,
                undefined,
                true // array
              );
            }
          } catch (attrError: any) {
            if (attrError.code === 409) {
              console.log(`   - Attribute ${attr.key} already exists`);
            } else {
              console.error(`   - Error creating attribute ${attr.key}:`, attrError.message);
            }
          }
        }

      } catch (error: any) {
        if (error.code === 409) {
          console.log(`✅ Collection ${collectionConfig.name} already exists`);
        } else {
          console.error(`❌ Error creating collection ${collectionConfig.name}:`, error.message);
        }
      }
    }

    console.log('\n3️⃣ Verifying setup...');
    
    // List all collections
    const allCollections = await databases.listCollections(database.$id);
    console.log(`📊 Found ${allCollections.total} collections:`);
    
    allCollections.collections.forEach(collection => {
      console.log(`   - ${collection.name} (ID: ${collection.$id})`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('=' .repeat(60));
    console.log('\n📋 Next steps:');
    console.log('1. Run the Big Ten seeder: python3 src/scripts/seed_bigten_draftboard.py');
    console.log('2. Test the integration: npx ts-node src/scripts/test-bigten-setup.ts');
    console.log('3. Deploy to Vercel and test the API endpoints');

  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    
    if (error.code === 401) {
      console.error('\nAuthentication error. Please check your API key.');
    }
  }
}

// Run the setup
setupDatabase(); 