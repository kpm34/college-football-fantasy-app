import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3');

const databases = new Databases(client);

async function setupKashDatabase() {
  console.log('🏗️ Setting up Kash Database...');
  console.log('='.repeat(60));

  try {
    // 1. Create database
    console.log('\n1️⃣ Creating database...');
    const database = await databases.create(
      'college-football-fantasy',
      'College Football Fantasy Database'
    );
    console.log(`✅ Database created: ${database.name} (ID: ${database.$id})`);

    // 2. Create collections
    console.log('\n2️⃣ Creating collections...');
    
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

    for (const collection of collections) {
      try {
        const createdCollection = await databases.createCollection(
          database.$id,
          collection.id,
          collection.name,
          collection.permissions
        );
        console.log(`✅ Collection created: ${createdCollection.name} (ID: ${createdCollection.$id})`);

        // Create attributes
        for (const attr of collection.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(
                database.$id,
                createdCollection.$id,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null
              );
            } else if (attr.type === 'integer') {
              await databases.createIntegerAttribute(
                database.$id,
                createdCollection.$id,
                attr.key,
                attr.required,
                attr.default || null
              );
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                database.$id,
                createdCollection.$id,
                attr.key,
                attr.required,
                attr.default || null
              );
            } else if (attr.type === 'string[]') {
              await databases.createStringAttribute(
                database.$id,
                createdCollection.$id,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null,
                true // array
              );
            }
            console.log(`  ✅ Attribute created: ${attr.key} (${attr.type})`);
          } catch (error) {
            console.log(`  ⚠️ Attribute ${attr.key} already exists or error: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Collection ${collection.name} already exists or error: ${error.message}`);
      }
    }

    console.log('\n🎉 Kash database setup complete!');
    console.log(`📊 Database ID: ${database.$id}`);
    console.log('📋 Collections: teams, college_players, games, rankings');

  } catch (error) {
    console.error('❌ Error setting up Kash database:', error.message);
    console.error('🔧 Please check:');
    console.error('  1. API key has correct permissions');
    console.error('  2. Project exists in NYC region');
    console.error('  3. Network connection');
  }
}

setupKashDatabase(); 