import { Client, Databases, Functions, Storage, Teams, Users, Messaging, Query, ID, Permission, Role } from 'node-appwrite';
import { APPWRITE_CONFIG } from '../lib/config/appwrite.config';
import { COLLECTIONS } from '../lib/appwrite';

// Initialize Appwrite Admin Client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setKey(APPWRITE_CONFIG.apiKey);

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
    // 1. Weekly Scoring Function
    log('Creating weekly scoring function...', 'yellow');
    const scoringFunction = await functions.create(
      ID.unique(),
      'weekly-scoring',
      'node-18.0',
      [
        Permission.read(Role.any()),
        Permission.execute(Role.any())
      ],
      [
        { name: 'APPWRITE_FUNCTION_PROJECT_ID', value: APPWRITE_CONFIG.projectId },
        { name: 'APPWRITE_FUNCTION_ENDPOINT', value: APPWRITE_CONFIG.endpoint },
        { name: 'APPWRITE_FUNCTION_API_KEY', value: APPWRITE_CONFIG.apiKey },
        { name: 'DATABASE_ID', value: DATABASE_ID },
        { name: 'CFBD_API_KEY', value: process.env.CFBD_API_KEY || '' }
      ],
      'appwrite-functions/weekly-scoring',
      'index.js',
      60, // 60 second timeout
      '0 0 * * 1', // Every Monday at midnight
      true, // enabled
      true // logging
    );
    log(`✅ Created weekly scoring function: ${scoringFunction.$id}`, 'green');

    // 2. Draft Reminder Function
    log('Creating draft reminder function...', 'yellow');
    const draftReminderFunction = await functions.create(
      ID.unique(),
      'draft-reminder',
      'node-18.0',
      [
        Permission.read(Role.any()),
        Permission.execute(Role.any())
      ],
      [
        { name: 'APPWRITE_FUNCTION_PROJECT_ID', value: APPWRITE_CONFIG.projectId },
        { name: 'APPWRITE_FUNCTION_ENDPOINT', value: APPWRITE_CONFIG.endpoint },
        { name: 'APPWRITE_FUNCTION_API_KEY', value: APPWRITE_CONFIG.apiKey },
        { name: 'DATABASE_ID', value: DATABASE_ID }
      ],
      'appwrite-functions/draft-reminder',
      'index.js',
      30,
      '', // No schedule, triggered by events
      true,
      true
    );
    log(`✅ Created draft reminder function: ${draftReminderFunction.$id}`, 'green');

    // 3. Trade Processor Function
    log('Creating trade processor function...', 'yellow');
    const tradeFunction = await functions.create(
      ID.unique(),
      'trade-processor',
      'node-18.0',
      [
        Permission.read(Role.any()),
        Permission.execute(Role.any())
      ],
      [
        { name: 'APPWRITE_FUNCTION_PROJECT_ID', value: APPWRITE_CONFIG.projectId },
        { name: 'APPWRITE_FUNCTION_ENDPOINT', value: APPWRITE_CONFIG.endpoint },
        { name: 'APPWRITE_FUNCTION_API_KEY', value: APPWRITE_CONFIG.apiKey },
        { name: 'DATABASE_ID', value: DATABASE_ID }
      ],
      'appwrite-functions/trade-processor',
      'index.js',
      30,
      '',
      true,
      true
    );
    log(`✅ Created trade processor function: ${tradeFunction.$id}`, 'green');

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
    // Rosters indexes
    {
      collection: COLLECTIONS.ROSTERS,
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
    }
  ];

  for (const { collection, indexes } of indexesToCreate) {
    log(`\nCreating indexes for ${collection}...`, 'yellow');
    
    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          collection,
          index.type as 'key' | 'fulltext' | 'unique',
          index.key,
          index.attributes,
          ['asc'] // Default order
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
    // Create Email Provider (using Appwrite's built-in SMTP)
    log('Creating email provider...', 'yellow');
    const emailProvider = await messaging.createSmtpProvider(
      ID.unique(),
      'default-smtp',
      'smtp.appwrite.io',
      587,
      'noreply@cfbfantasy.app',
      'CFB Fantasy',
      '', // No username for Appwrite SMTP
      '', // No password for Appwrite SMTP
      'tls'
    );
    log(`✅ Created email provider: ${emailProvider.$id}`, 'green');

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
        collection: COLLECTIONS.ROSTERS,
        attribute: 'league',
        relatedCollection: COLLECTIONS.LEAGUES,
        type: 'manyToOne',
        twoWay: true,
        key: 'rosters',
        onDelete: 'cascade'
      },
      {
        collection: COLLECTIONS.ROSTERS,
        attribute: 'owner',
        relatedCollection: COLLECTIONS.USERS,
        type: 'manyToOne',
        twoWay: true,
        key: 'rosters',
        onDelete: 'setNull'
      },
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
        relatedCollection: COLLECTIONS.ROSTERS,
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
      { id: COLLECTIONS.ROSTERS, name: 'Rosters' },
      { id: COLLECTIONS.LEAGUES, name: 'Leagues' },
      { id: COLLECTIONS.USERS, name: 'Users' }
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
