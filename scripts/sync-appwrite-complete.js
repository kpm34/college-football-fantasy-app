const { Client, Databases, Permission, Role, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

// Define complete schema
const COLLECTIONS_SCHEMA = {
  users: {
    name: 'Users',
    attributes: [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: false },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'prefs', type: 'string', size: 5000, required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.guests()),
      Permission.update(Role.users())
    ],
    indexes: [
      { key: 'email_idx', type: 'unique', attributes: ['email'] }
    ]
  },
  
  leagues: {
    name: 'Leagues',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'commissionerId', type: 'string', size: 255, required: true },
      { key: 'season', type: 'integer', required: false, default: 2025 },
      { key: 'status', type: 'string', size: 20, required: false, default: 'draft' },
      { key: 'maxTeams', type: 'integer', required: false, default: 12, min: 4, max: 20 },
      { key: 'draftDate', type: 'datetime', required: false },
      { key: 'draftType', type: 'string', size: 20, required: false, default: 'snake' },
      { key: 'scoringType', type: 'string', size: 20, required: false, default: 'standard' },
      { key: 'inviteCode', type: 'string', size: 20, required: false },
      { key: 'isPublic', type: 'boolean', required: false, default: false },
      { key: 'gameMode', type: 'string', size: 100, required: false, default: 'power4' },
      { key: 'selectedConference', type: 'string', size: 100, required: false },
      { key: 'members', type: 'string', size: 40, required: false, array: true },
      { key: 'scoringRules', type: 'string', size: 10000, required: false },
      { key: 'pickTimeSeconds', type: 'integer', required: false, default: 90 },
      { key: 'seasonStartWeek', type: 'integer', required: false, default: 1 },
      { key: 'rosterSchema', type: 'string', size: 1000, required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    indexes: [
      { key: 'commissioner_idx', type: 'key', attributes: ['commissionerId'] },
      { key: 'invite_code_idx', type: 'unique', attributes: ['inviteCode'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] }
    ]
  },
  
  rosters: {
    name: 'Rosters',
    attributes: [
      { key: 'leagueId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'teamName', type: 'string', size: 100, required: false },
      { key: 'userName', type: 'string', size: 255, required: false },
      { key: 'email', type: 'string', size: 255, required: false },
      { key: 'wins', type: 'integer', required: false, default: 0 },
      { key: 'losses', type: 'integer', required: false, default: 0 },
      { key: 'ties', type: 'integer', required: false, default: 0 },
      { key: 'points', type: 'float', required: false, default: 0 },
      { key: 'pointsFor', type: 'float', required: false, default: 0 },
      { key: 'pointsAgainst', type: 'float', required: false, default: 0 },
      { key: 'players', type: 'string', size: 5000, required: false },
      { key: 'draftPosition', type: 'integer', required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
      { key: 'user_idx', type: 'key', attributes: ['userId'] },
      { key: 'league_user_idx', type: 'key', attributes: ['leagueId', 'userId'] }
    ]
  },
  
  players: {
    name: 'Players',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'position', type: 'string', size: 10, required: true },
      { key: 'team', type: 'string', size: 100, required: true },
      { key: 'conference', type: 'string', size: 100, required: false },
      { key: 'year', type: 'string', size: 10, required: false },
      { key: 'jersey_number', type: 'integer', required: false },
      { key: 'height', type: 'string', size: 10, required: false },
      { key: 'weight', type: 'integer', required: false },
      { key: 'hometown', type: 'string', size: 255, required: false },
      { key: 'cfbd_id', type: 'string', size: 50, required: false },
      { key: 'espn_id', type: 'string', size: 50, required: false },
      { key: 'fantasy_points', type: 'float', required: false, default: 0 },
      { key: 'projection', type: 'float', required: false, default: 0 },
      { key: 'status', type: 'string', size: 50, required: false },
      { key: 'injury_status', type: 'string', size: 50, required: false },
      { key: 'injury_details', type: 'string', size: 255, required: false },
      { key: 'injury_updated', type: 'datetime', required: false },
      { key: 'depth_chart_position', type: 'string', size: 50, required: false },
      { key: 'depth', type: 'integer', required: false, min: 1, max: 10 },
      { key: 'is_starter', type: 'boolean', required: false, default: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users())
    ],
    indexes: [
      { key: 'team_idx', type: 'key', attributes: ['team'] },
      { key: 'position_idx', type: 'key', attributes: ['position'] },
      { key: 'conference_idx', type: 'key', attributes: ['conference'] }
    ]
  },
  
  games: {
    name: 'Games',
    attributes: [
      { key: 'season', type: 'integer', required: true },
      { key: 'week', type: 'integer', required: true },
      { key: 'seasonType', type: 'string', size: 20, required: false },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'homeTeam', type: 'string', size: 100, required: true },
      { key: 'awayTeam', type: 'string', size: 100, required: true },
      { key: 'homeConference', type: 'string', size: 100, required: false },
      { key: 'awayConference', type: 'string', size: 100, required: false },
      { key: 'homePoints', type: 'integer', required: false },
      { key: 'awayPoints', type: 'integer', required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'isEligible', type: 'boolean', required: false, default: false },
      { key: 'venueId', type: 'string', size: 50, required: false },
      { key: 'cfbd_id', type: 'string', size: 50, required: false },
      { key: 'espn_id', type: 'string', size: 50, required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.any())
    ],
    indexes: [
      { key: 'week_season_idx', type: 'key', attributes: ['week', 'season'] },
      { key: 'teams_idx', type: 'key', attributes: ['homeTeam', 'awayTeam'] }
    ]
  },
  
  rankings: {
    name: 'AP Rankings',
    attributes: [
      { key: 'season', type: 'integer', required: true },
      { key: 'week', type: 'integer', required: true },
      { key: 'rank', type: 'integer', required: true },
      { key: 'school', type: 'string', size: 100, required: true },
      { key: 'conference', type: 'string', size: 100, required: false },
      { key: 'firstPlaceVotes', type: 'integer', required: false },
      { key: 'points', type: 'integer', required: false },
      { key: 'previousRank', type: 'integer', required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.any())
    ],
    indexes: [
      { key: 'week_season_idx', type: 'key', attributes: ['week', 'season'] }
    ]
  },
  
  teams: {
    name: 'Teams',
    attributes: [
      { key: 'school', type: 'string', size: 100, required: true },
      { key: 'mascot', type: 'string', size: 100, required: false },
      { key: 'abbreviation', type: 'string', size: 10, required: false },
      { key: 'conference', type: 'string', size: 100, required: false },
      { key: 'division', type: 'string', size: 50, required: false },
      { key: 'color', type: 'string', size: 10, required: false },
      { key: 'altColor', type: 'string', size: 10, required: false },
      { key: 'logo', type: 'string', size: 500, required: false },
      { key: 'cfbd_id', type: 'string', size: 50, required: false },
      { key: 'espn_id', type: 'string', size: 50, required: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.any())
    ],
    indexes: [
      { key: 'conference_idx', type: 'key', attributes: ['conference'] }
    ]
  },
  
  draft_picks: {
    name: 'Draft Picks',
    attributes: [
      { key: 'leagueId', type: 'string', size: 255, required: true },
      { key: 'round', type: 'integer', required: true },
      { key: 'pick', type: 'integer', required: true },
      { key: 'overall', type: 'integer', required: true },
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'playerId', type: 'string', size: 255, required: true },
      { key: 'timestamp', type: 'datetime', required: false },
      { key: 'pickTime', type: 'integer', required: false },
      { key: 'created_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users())
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] },
      { key: 'league_overall_idx', type: 'key', attributes: ['leagueId', 'overall'] }
    ]
  },
  
  lineups: {
    name: 'Lineups',
    attributes: [
      { key: 'rosterId', type: 'string', size: 255, required: true },
      { key: 'week', type: 'integer', required: true },
      { key: 'season', type: 'integer', required: true },
      { key: 'starters', type: 'string', size: 40, required: false, array: true },
      { key: 'bench', type: 'string', size: 40, required: false, array: true },
      { key: 'locked', type: 'boolean', required: false, default: false },
      { key: 'points', type: 'float', required: false, default: 0 },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    indexes: [
      { key: 'roster_week_idx', type: 'key', attributes: ['rosterId', 'week', 'season'] }
    ]
  },
  
  activity_log: {
    name: 'Activity Log',
    attributes: [
      { key: 'leagueId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: false },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'metadata', type: 'string', size: 5000, required: false },
      { key: 'created_at', type: 'datetime', required: false }
    ],
    permissions: [
      Permission.read(Role.users()),
      Permission.create(Role.users())
    ],
    indexes: [
      { key: 'league_idx', type: 'key', attributes: ['leagueId'] }
    ]
  }
};

// Sync function
async function syncCollection(collectionId, schema) {
  console.log(`\n📁 Syncing collection: ${schema.name} (${collectionId})`);
  
  try {
    // Check if collection exists
    let collection;
    try {
      collection = await databases.getCollection(DATABASE_ID, collectionId);
      console.log('✓ Collection exists');
    } catch (e) {
      if (e.code === 404) {
        console.log('Creating new collection...');
        collection = await databases.createCollection(
          DATABASE_ID,
          collectionId,
          schema.name,
          schema.permissions
        );
        console.log('✓ Collection created');
      } else {
        throw e;
      }
    }
    
    // Update permissions if different
    const currentPerms = JSON.stringify(collection.$permissions.sort());
    const expectedPerms = JSON.stringify(schema.permissions.sort());
    
    if (currentPerms !== expectedPerms) {
      console.log('Updating permissions...');
      await databases.updateCollection(
        DATABASE_ID,
        collectionId,
        collection.name,
        schema.permissions
      );
      console.log('✓ Permissions updated');
    }
    
    // Sync attributes
    const existingAttrs = new Map(collection.attributes.map(a => [a.key, a]));
    
    for (const attr of schema.attributes) {
      const existing = existingAttrs.get(attr.key);
      
      if (!existing) {
        console.log(`Adding attribute: ${attr.key}`);
        
        try {
          switch (attr.type) {
            case 'string':
              await databases.createStringAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.size,
                attr.required,
                attr.default || null,
                attr.array || false
              );
              break;
              
            case 'integer':
              await databases.createIntegerAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.min || null,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
              break;
              
            case 'float':
              await databases.createFloatAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.min || null,
                attr.max || null,
                attr.default || null,
                attr.array || false
              );
              break;
              
            case 'boolean':
              await databases.createBooleanAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
              break;
              
            case 'datetime':
              await databases.createDatetimeAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.required,
                attr.default || null,
                attr.array || false
              );
              break;
          }
          
          console.log(`✓ Added ${attr.key}`);
          
          // Wait for attribute to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (e) {
          console.error(`✗ Failed to add ${attr.key}: ${e.message}`);
        }
      }
    }
    
    // Create indexes
    if (schema.indexes) {
      const existingIndexes = new Set((collection.indexes || []).map(i => i.key));
      
      for (const index of schema.indexes) {
        if (!existingIndexes.has(index.key)) {
          console.log(`Creating index: ${index.key}`);
          
          try {
            await databases.createIndex(
              DATABASE_ID,
              collectionId,
              index.key,
              index.type,
              index.attributes
            );
            console.log(`✓ Created index ${index.key}`);
            
            // Wait for index to be ready
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (e) {
            console.error(`✗ Failed to create index ${index.key}: ${e.message}`);
          }
        }
      }
    }
    
    console.log(`✓ Collection ${collectionId} synced successfully`);
    
  } catch (error) {
    console.error(`✗ Error syncing ${collectionId}: ${error.message}`);
  }
}

// Main sync function
async function syncAllCollections() {
  console.log('🚀 Starting Appwrite schema synchronization...\n');
  console.log(`Database: ${DATABASE_ID}`);
  console.log(`Endpoint: ${process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'}`);
  console.log(`Project: ${process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'}`);
  
  // Check if API key is provided
  if (!process.env.APPWRITE_API_KEY) {
    console.error('\n❌ Error: APPWRITE_API_KEY environment variable is required');
    console.error('Usage: APPWRITE_API_KEY="your-api-key" node scripts/sync-appwrite-complete.js');
    process.exit(1);
  }
  
  try {
    // Ensure database exists
    try {
      await databases.get(DATABASE_ID);
      console.log(`\n✓ Database ${DATABASE_ID} exists`);
    } catch (e) {
      if (e.code === 404) {
        console.log(`\nCreating database ${DATABASE_ID}...`);
        await databases.create(DATABASE_ID, DATABASE_ID);
        console.log('✓ Database created');
      } else {
        throw e;
      }
    }
    
    // Sync each collection
    for (const [collectionId, schema] of Object.entries(COLLECTIONS_SCHEMA)) {
      await syncCollection(collectionId, schema);
    }
    
    console.log('\n✅ Schema synchronization complete!');
    
    // Generate summary report
    console.log('\n📊 Summary Report:');
    console.log('==================');
    const collections = await databases.listCollections(DATABASE_ID);
    console.log(`Total collections: ${collections.collections.length}`);
    
    for (const collection of collections.collections) {
      console.log(`\n${collection.name} (${collection.$id}):`);
      console.log(`  - Attributes: ${collection.attributes.length}`);
      console.log(`  - Indexes: ${collection.indexes?.length || 0}`);
      console.log(`  - Permissions: ${collection.$permissions.length}`);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncAllCollections().catch(console.error);
}

module.exports = { syncAllCollections, COLLECTIONS_SCHEMA };
