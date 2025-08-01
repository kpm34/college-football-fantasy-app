import * as dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config();

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function setupDatabase() {
  console.log('🏈 Setting up Appwrite Database for College Football Fantasy App\n');

  const DATABASE_ID = 'college-football-fantasy';

  try {
    // Create database
    console.log('Creating database...');
    await databases.create(DATABASE_ID, 'College Football Fantasy Database');
    console.log('✅ Database created\n');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('ℹ️  Database already exists\n');
    } else {
      console.error('❌ Error creating database:', error.message);
      return;
    }
  }

  // Collection configurations
  const collections = [
    {
      id: 'games',
      name: 'Games',
      permissions: ['read("any")', 'write("any")'],
      attributes: [
        { type: 'integer', key: 'season', required: true },
        { type: 'integer', key: 'week', required: true },
        { type: 'string', key: 'seasonType', size: 20, required: true },
        { type: 'datetime', key: 'startDate', required: true },
        { type: 'string', key: 'homeTeam', size: 100, required: true },
        { type: 'string', key: 'homeConference', size: 20, required: false },
        { type: 'integer', key: 'homePoints', required: false, default: 0 },
        { type: 'string', key: 'awayTeam', size: 100, required: true },
        { type: 'string', key: 'awayConference', size: 20, required: false },
        { type: 'integer', key: 'awayPoints', required: false, default: 0 },
        { type: 'string', key: 'status', size: 20, required: true },
        { type: 'integer', key: 'period', required: false, default: 0 },
        { type: 'string', key: 'clock', size: 10, required: false },
        { type: 'boolean', key: 'isConferenceGame', required: false, default: false },
        { type: 'datetime', key: 'lastUpdated', required: false }
      ]
    },
    {
      id: 'rankings',
      name: 'Rankings',
      permissions: ['read("any")', 'write("any")'],
      attributes: [
        { type: 'integer', key: 'season', required: true },
        { type: 'integer', key: 'week', required: true },
        { type: 'string', key: 'poll', size: 50, required: true },
        { type: 'string', key: 'rankings', size: 10000, required: true },
        { type: 'datetime', key: 'lastUpdated', required: false }
      ]
    },
    {
      id: 'teams',
      name: 'Teams',
      permissions: ['read("any")', 'write("any")'],
      attributes: [
        { type: 'string', key: 'school', size: 100, required: true },
        { type: 'string', key: 'mascot', size: 100, required: false },
        { type: 'string', key: 'abbreviation', size: 10, required: false },
        { type: 'string', key: 'conference', size: 20, required: true },
        { type: 'integer', key: 'conferenceId', required: false },
        { type: 'string', key: 'color', size: 10, required: false },
        { type: 'string', key: 'altColor', size: 10, required: false },
        { type: 'url', key: 'logo', required: false },
        { type: 'datetime', key: 'lastUpdated', required: false }
      ]
    }
  ];

  // Create collections
  for (const collection of collections) {
    console.log(`Creating ${collection.name} collection...`);
    
    try {
      // Create collection
      await databases.createCollection(
        DATABASE_ID,
        collection.id,
        collection.name,
        collection.permissions
      );
      console.log(`✅ ${collection.name} collection created`);

      // Add attributes
      for (const attr of collection.attributes) {
        try {
          switch (attr.type) {
            case 'string':
              await databases.createStringAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.size!,
                attr.required,
                attr.default as string | undefined
              );
              break;
            case 'integer':
              await databases.createIntegerAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                undefined,
                undefined,
                attr.default as number | undefined
              );
              break;
            case 'boolean':
              await databases.createBooleanAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default as boolean | undefined
              );
              break;
            case 'datetime':
              await databases.createDatetimeAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required
              );
              break;
            case 'url':
              await databases.createUrlAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required
              );
              break;
          }
          console.log(`  ✅ Added ${attr.key} attribute`);
        } catch (error: any) {
          console.error(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
      console.log('');
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`ℹ️  ${collection.name} collection already exists\n`);
      } else {
        console.error(`❌ Error creating ${collection.name}:`, error.message);
      }
    }
  }

  console.log('🎉 Appwrite setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run sync-data');
  console.log('2. Start the API: npm run server');
}

// Run setup
setupDatabase().catch(console.error);