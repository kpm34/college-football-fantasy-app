import { Client, Databases, Functions, Storage, Teams, Users, Messaging, Query, ID, Permission, Role } from 'node-appwrite';
import { APPWRITE_CONFIG } from '../lib/config/appwrite.config';
import 'dotenv/config';
import { COLLECTIONS } from '../lib/appwrite';

// Initialize Appwrite Admin Client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || APPWRITE_CONFIG.endpoint)
  .setProject(process.env.APPWRITE_PROJECT_ID || APPWRITE_CONFIG.projectId)
  .setKey(process.env.APPWRITE_API_KEY || APPWRITE_CONFIG.apiKey);

const databases = new Databases(client);
const functions = new Functions(client);
const storage = new Storage(client);
const teams = new Teams(client);
const users = new Users(client);
const messaging = new Messaging(client);

const DATABASE_ID = APPWRITE_CONFIG.databaseId;

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createAppwriteFunctions() {
  log('\n🚀 Creating Appwrite Functions...', 'blue');
  
  try {
    // NOTE: Function creation and permissions vary between SDK versions; skip in script, create via Console
    log('Skipping Appwrite Functions creation (create in Console with env vars)', 'yellow');


    // See above note.

  } catch (error: any) {
    log(`❌ Error creating functions: ${error.message}`, 'red');
  }
}

async function createDatabaseIndexes() {
  log('\n🔍 Creating Database Indexes...', 'blue');
  
  const indexesToCreate = [
    // Leagues indexes
    {
      collection: COLLECTIONS.LEAGUES,
      indexes: [
        { key: 'commissioner', type: 'key', attributes: ['commissioner'] },
        { key: 'status', type: 'key', attributes: ['status'] },
        { key: 'gameMode', type: 'key', attributes: ['gameMode'] },
        { key: 'season', type: 'key', attributes: ['season'] },
        { key: 'isPublic_status', type: 'key', attributes: ['isPublic', 'status'] }
      ]
    },
    // User Teams indexes
    {
      collection: COLLECTIONS.USER_TEAMS,
      indexes: [
        { key: 'leagueId', type: 'key', attributes: ['leagueId'] },
        { key: 'userId', type: 'key', attributes: ['userId'] },
        { key: 'leagueId_userId', type: 'key', attributes: ['leagueId', 'userId'] },
        { key: 'wins', type: 'key', attributes: ['wins'] },
        { key: 'pointsFor', type: 'key', attributes: ['pointsFor'] }
      ]
    },
    // Players indexes
    {
      collection: COLLECTIONS.PLAYERS,
      indexes: [
        { key: 'team', type: 'key', attributes: ['team'] },
        { key: 'position', type: 'key', attributes: ['position'] },
        { key: 'conference', type: 'key', attributes: ['conference'] },
        { key: 'eligibility', type: 'key', attributes: ['eligibility'] },
        { key: 'name', type: 'fulltext', attributes: ['name'] },
        { key: 'team_position', type: 'key', attributes: ['team', 'position'] }
      ]
    },
    // Games indexes
    {
      collection: COLLECTIONS.GAMES,
      indexes: [
        { key: 'week', type: 'key', attributes: ['week'] },
        { key: 'season', type: 'key', attributes: ['season'] },
        { key: 'home_team', type: 'key', attributes: ['home_team'] },
        { key: 'away_team', type: 'key', attributes: ['away_team'] },
        { key: 'season_week', type: 'key', attributes: ['season', 'week'] }
      ]
    },
    // Draft picks indexes
    {
      collection: COLLECTIONS.DRAFT_PICKS,
      indexes: [
        { key: 'leagueId', type: 'key', attributes: ['leagueId'] },
        { key: 'rosterId', type: 'key', attributes: ['rosterId'] },
        { key: 'playerId', type: 'key', attributes: ['playerId'] },
        { key: 'round', type: 'key', attributes: ['round'] },
        { key: 'leagueId_round_pick', type: 'key', attributes: ['leagueId', 'round', 'pick'] }
      ]
    },
    // Projections collections
    {
      collection: COLLECTIONS.PROJECTIONS_YEARLY,
      indexes: [
        { key: 'player_season', type: 'unique', attributes: ['player_id', 'season'] },
        { key: 'season_position', type: 'key', attributes: ['season', 'position'] },
        { key: 'range_median', type: 'key', attributes: ['range_median'] },
      ]
    },
    {
      collection: COLLECTIONS.PROJECTIONS_WEEKLY,
      indexes: [
        { key: 'player_season_week', type: 'unique', attributes: ['player_id', 'season', 'week'] },
        { key: 'season_week', type: 'key', attributes: ['season', 'week'] },
        { key: 'rank_pro', type: 'key', attributes: ['rank_pro'] },
      ]
    },
    {
      collection: COLLECTIONS.MODEL_INPUTS,
      indexes: [
        { key: 'season_week', type: 'key', attributes: ['season', 'week'] }
      ]
    },
    {
      collection: COLLECTIONS.USER_CUSTOM_PROJECTIONS,
      indexes: [
        { key: 'user_player', type: 'unique', attributes: ['user_id', 'player_id'] },
        { key: 'user_player_week', type: 'key', attributes: ['user_id', 'player_id', 'week'] }
      ]
    }
  ];

  for (const { collection, indexes } of indexesToCreate) {
    log(`\nCreating indexes for ${collection}...`, 'yellow');
    
    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          collection,
          index.key,
          index.type as 'key' | 'fulltext' | 'unique',
          index.attributes,
          ['ASC'] // Default order
        );
        log(`✅ Created index: ${index.key}`, 'green');
      } catch (error: any) {
        if (error.code === 409) {
          log(`⏭️  Index ${index.key} already exists`, 'yellow');
        } else {
          log(`❌ Error creating index ${index.key}: ${error.message}`, 'red');
        }
      }
    }
  }
}

async function ensureProjectionCollections() {
  log('\n📚 Ensuring Projections Collections exist...', 'blue');
  const projectionCollections = [
    { id: COLLECTIONS.PROJECTIONS_YEARLY, name: 'projections_yearly' },
    { id: COLLECTIONS.PROJECTIONS_WEEKLY, name: 'projections_weekly' },
    { id: COLLECTIONS.MODEL_INPUTS, name: 'model_inputs' },
    { id: COLLECTIONS.USER_CUSTOM_PROJECTIONS, name: 'user_custom_projections' },
  ];

  for (const col of projectionCollections) {
    try {
      log(`Ensuring collection ${col.name}...`, 'yellow');
      try {
        await databases.getCollection(DATABASE_ID, col.id);
        log(`⏭️  ${col.name} already exists`, 'yellow');
      } catch {
        await databases.createCollection(
          DATABASE_ID,
          col.id,
          col.name,
          [Permission.read(Role.any()), Permission.create(Role.users()), Permission.update(Role.users())],
          true
        );
        log(`✅ Created ${col.name}`, 'green');
      }

      // Add attributes per spec (simplified core set)
      switch (col.id) {
        case COLLECTIONS.PROJECTIONS_YEARLY:
          await databases.createStringAttribute(DATABASE_ID, col.id, 'player_id', 64, true);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'season', true);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'team_id', 64, false);
          await databases.createEnumAttribute(DATABASE_ID, col.id, 'position', ['QB','RB','WR','TE'], true);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'model_version', 32, true);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'games_played_est', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'usage_rate', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'pace_adj', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'fantasy_points_simple', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'range_floor', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'range_median', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'range_ceiling', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'injury_risk', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'volatility_score', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'replacement_value', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'adp_est', false);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'ecr_rank', false);
          break;
        case COLLECTIONS.PROJECTIONS_WEEKLY:
          await databases.createStringAttribute(DATABASE_ID, col.id, 'player_id', 64, true);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'season', true);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'week', true);
          await databases.createEnumAttribute(DATABASE_ID, col.id, 'position', ['QB','RB','WR','TE'], false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'opponent_team_id', 64, false);
          await databases.createEnumAttribute(DATABASE_ID, col.id, 'home_away', ['H','A','N'], false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'team_total_est', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'pace_matchup_adj', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'fantasy_points_simple', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'boom_prob', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'bust_prob', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'defense_vs_pos_grade', false);
          await databases.createEnumAttribute(DATABASE_ID, col.id, 'injury_status', ['Healthy','Questionable','Doubtful','Out'], false);
          await databases.createEnumAttribute(DATABASE_ID, col.id, 'utilization_trend', ['+','=','-'], false);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'rank_pro', false);
          await databases.createEnumAttribute(DATABASE_ID, col.id, 'start_sit_color', ['Green','Yellow','Red'], false);
          break;
        case COLLECTIONS.MODEL_INPUTS:
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'season', true);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'week', false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'ea_ratings_json', 16384, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'nfl_draft_capital_json', 8192, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'depth_chart', 16384, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'team_pace', 4096, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'pass_rate', 4096, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'rush_rate', 4096, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'opponent_grades_by_pos', 8192, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'injury_reports', 8192, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'vegas_spread', 2048, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'vegas_total', 2048, false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'manual_overrides', 8192, false);
          break;
        case COLLECTIONS.USER_CUSTOM_PROJECTIONS:
          await databases.createStringAttribute(DATABASE_ID, col.id, 'user_id', 64, true);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'player_id', 64, true);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'season', true);
          await databases.createIntegerAttribute(DATABASE_ID, col.id, 'week', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'custom_usage', false);
          await databases.createFloatAttribute(DATABASE_ID, col.id, 'custom_pace', false);
          await databases.createStringAttribute(DATABASE_ID, col.id, 'notes', 1024, false);
          await databases.createBooleanAttribute(DATABASE_ID, col.id, 'locked_rank', false);
          break;
      }

      // Allow attributes to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      log(`✅ Ensured ${col.name}`, 'green');
    } catch (error: any) {
      if (error.code !== 409) {
        log(`❌ Error ensuring ${col.name}: ${error.message}`, 'red');
      }
    }
  }
}

async function createStorageBuckets() {
  log('\n📦 Creating Storage Buckets...', 'blue');
  
  try {
    // Team Logos Bucket
    log('Creating team logos bucket...', 'yellow');
    const teamLogosBucket = await storage.createBucket(
      ID.unique(),
      'team-logos',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      false, // No antivirus
      true, // Compression enabled
      5242880, // 5MB max file size
      ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    );
    log(`✅ Created team logos bucket: ${teamLogosBucket.$id}`, 'green');

    // User Avatars Bucket
    log('Creating user avatars bucket...', 'yellow');
    const avatarsBucket = await storage.createBucket(
      ID.unique(),
      'user-avatars',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      false,
      true,
      2097152, // 2MB max file size
      ['image/jpeg', 'image/png', 'image/webp']
    );
    log(`✅ Created user avatars bucket: ${avatarsBucket.$id}`, 'green');

    // League Assets Bucket
    log('Creating league assets bucket...', 'yellow');
    const leagueAssetsBucket = await storage.createBucket(
      ID.unique(),
      'league-assets',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ],
      false,
      true,
      10485760, // 10MB max file size
      ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    );
    log(`✅ Created league assets bucket: ${leagueAssetsBucket.$id}`, 'green');

  } catch (error: any) {
    if (error.code === 409) {
      log('⏭️  Some buckets already exist', 'yellow');
    } else {
      log(`❌ Error creating storage buckets: ${error.message}`, 'red');
    }
  }
}

async function setupMessaging() {
  log('\n📧 Setting up Messaging...', 'blue');
  
  try {
    // Skip provider creation in script to avoid encryption mismatch; configure via console
    log('Skipping email provider creation (configure via Console)', 'yellow');

    // Create message templates
    const templates = [
      {
        name: 'draft-reminder',
        subject: 'Your CFB Fantasy Draft Starts Soon!',
        content: 'Hi {{name}},\n\nYour draft for {{leagueName}} starts in {{timeUntil}}!\n\nJoin here: {{draftLink}}\n\nGood luck!\nCFB Fantasy Team'
      },
      {
        name: 'trade-offer',
        subject: 'New Trade Offer in {{leagueName}}',
        content: 'Hi {{name}},\n\nYou have a new trade offer from {{senderName}}:\n\nThey offer: {{theirPlayers}}\nFor your: {{yourPlayers}}\n\nReview it here: {{tradeLink}}\n\nCFB Fantasy Team'
      },
      {
        name: 'weekly-recap',
        subject: 'Week {{week}} Recap - {{leagueName}}',
        content: 'Hi {{name}},\n\nWeek {{week}} is complete!\n\nYour score: {{yourScore}}\nOpponent score: {{opponentScore}}\nResult: {{result}}\n\nCurrent standing: {{standing}}\n\nView full standings: {{standingsLink}}\n\nCFB Fantasy Team'
      }
    ];

    // Note: Appwrite doesn't have a direct API for message templates yet,
    // so we'll store these in a collection for now
    log('Storing message templates...', 'yellow');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'message_templates',
        'Message Templates',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      
      // Create attributes
      await databases.createStringAttribute(DATABASE_ID, 'message_templates', 'name', 50, true);
      await databases.createStringAttribute(DATABASE_ID, 'message_templates', 'subject', 200, true);
      await databases.createStringAttribute(DATABASE_ID, 'message_templates', 'content', 5000, true);
      
      // Wait for attributes to be available
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store templates
      for (const template of templates) {
        await databases.createDocument(
          DATABASE_ID,
          'message_templates',
          ID.unique(),
          template
        );
      }
      log('✅ Created message templates', 'green');
    } catch (error: any) {
      if (error.code === 409) {
        log('⏭️  Message templates collection already exists', 'yellow');
      } else {
        log(`❌ Error creating message templates: ${error.message}`, 'red');
      }
    }

  } catch (error: any) {
    log(`❌ Error setting up messaging: ${error.message}`, 'red');
  }
}

async function setupDatabaseRelationships() {
  log('\n🔗 Setting up Database Relationships...', 'blue');
  
  try {
    // Create relationships between collections
    const relationships = [
      {
        collection: COLLECTIONS.USER_TEAMS,
        attribute: 'league',
        relatedCollection: COLLECTIONS.LEAGUES,
        type: 'manyToOne',
        twoWay: true,
        key: 'user_teams',
        onDelete: 'cascade'
      },
      // User Teams -> Users relationship removed (using Appwrite Auth Users instead)
      {
        collection: COLLECTIONS.DRAFT_PICKS,
        attribute: 'league',
        relatedCollection: COLLECTIONS.LEAGUES,
        type: 'manyToOne',
        twoWay: true,
        key: 'draftPicks',
        onDelete: 'cascade'
      },
      {
        collection: COLLECTIONS.DRAFT_PICKS,
        attribute: 'roster',
        relatedCollection: COLLECTIONS.USER_TEAMS,
        type: 'manyToOne',
        twoWay: true,
        key: 'draftPicks',
        onDelete: 'cascade'
      },
      {
        collection: COLLECTIONS.DRAFT_PICKS,
        attribute: 'player',
        relatedCollection: COLLECTIONS.PLAYERS,
        type: 'manyToOne',
        twoWay: true,
        key: 'draftedBy',
        onDelete: 'restrict'
      }
    ];

    for (const rel of relationships) {
      try {
        log(`Creating relationship: ${rel.collection}.${rel.attribute} -> ${rel.relatedCollection}`, 'yellow');
        await databases.createRelationshipAttribute(
          DATABASE_ID,
          rel.collection,
          rel.relatedCollection,
          rel.type as 'oneToOne' | 'manyToOne' | 'manyToMany' | 'oneToMany',
          rel.twoWay,
          rel.attribute,
          rel.key,
          rel.onDelete as 'restrict' | 'cascade' | 'setNull'
        );
        log(`✅ Created relationship: ${rel.attribute}`, 'green');
      } catch (error: any) {
        if (error.code === 409) {
          log(`⏭️  Relationship ${rel.attribute} already exists`, 'yellow');
        } else {
          log(`❌ Error creating relationship ${rel.attribute}: ${error.message}`, 'red');
        }
      }
    }

  } catch (error: any) {
    log(`❌ Error setting up relationships: ${error.message}`, 'red');
  }
}

async function optimizeCollections() {
  log('\n⚡ Optimizing Collections...', 'blue');
  
  try {
    // Enable document security for sensitive collections
    const collectionsToSecure = [
      { id: COLLECTIONS.USER_TEAMS, name: 'User Teams' },
      { id: COLLECTIONS.LEAGUES, name: 'Leagues' },
      // { id: COLLECTIONS.USERS, name: 'Users' } // Deprecated - using Appwrite Auth Users
    ];

    for (const collection of collectionsToSecure) {
      try {
        log(`Enabling document security for ${collection.name}...`, 'yellow');
        await databases.updateCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
          ],
          true // Enable document security
        );
        log(`✅ Enabled document security for ${collection.name}`, 'green');
      } catch (error: any) {
        log(`❌ Error updating ${collection.name}: ${error.message}`, 'red');
      }
    }

    // Add search attribute to players collection
    try {
      log('Adding search attribute to players...', 'yellow');
      await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        'searchText',
        500,
        false,
        undefined,
        false
      );
      log('✅ Added search attribute', 'green');
    } catch (error: any) {
      if (error.code === 409) {
        log('⏭️  Search attribute already exists', 'yellow');
      } else {
        log(`❌ Error adding search attribute: ${error.message}`, 'red');
      }
    }

  } catch (error: any) {
    log(`❌ Error optimizing collections: ${error.message}`, 'red');
  }
}

// Main execution
async function main() {
  log('\n🎯 Starting Appwrite Platform Enhancement...\n', 'blue');
  
  try {
    // Run all enhancements
    await ensureProjectionCollections();
    await createDatabaseIndexes();
    await createStorageBuckets();
    await setupMessaging();
    await setupDatabaseRelationships();
    await optimizeCollections();
    await createAppwriteFunctions();
    
    log('\n✅ Appwrite platform enhancements complete!', 'green');
    log('\n📋 Next Steps:', 'blue');
    log('1. Deploy function code to appwrite-functions/ directories', 'yellow');
    log('2. Update environment variables in Vercel for new bucket IDs', 'yellow');
    log('3. Test messaging integration with sample notifications', 'yellow');
    log('4. Monitor function executions in Appwrite console', 'yellow');
    
  } catch (error: any) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { 
  createAppwriteFunctions,
  createDatabaseIndexes,
  createStorageBuckets,
  setupMessaging,
  setupDatabaseRelationships,
  optimizeCollections
};
