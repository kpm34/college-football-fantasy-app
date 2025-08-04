import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

async function setupCollections() {
  console.log('🏗️ Setting up Appwrite Collections...');
  console.log('=====================================');

  try {
    // Check if database exists
    const dbList = await databases.list();
    const dbExists = dbList.databases.find(db => db.$id === DATABASE_ID);
    
    if (!dbExists) {
      console.log('❌ Database not found. Please create the database first.');
      return;
    }

    console.log('✅ Database found:', DATABASE_ID);

    // Define collections to create
    const collections = [
      {
        id: 'leagues',
        name: 'Leagues',
        attributes: [
          { key: 'name', type: 'string', required: true },
          { key: 'season_year', type: 'integer', required: true },
          { key: 'commissioner_user_id', type: 'string', required: true },
          { key: 'scoring_settings', type: 'string', required: false },
          { key: 'roster_settings', type: 'string', required: false },
          { key: 'draft_settings', type: 'string', required: false },
          { key: 'waiver_settings', type: 'string', required: false },
          { key: 'trade_deadline_week', type: 'integer', required: false },
          { key: 'game_mode', type: 'string', required: false },
          { key: 'selected_conference', type: 'string', required: false },
          { key: 'max_teams', type: 'integer', required: false },
          { key: 'season_start_week', type: 'integer', required: false },
          { key: 'status', type: 'string', required: false },
          { key: 'standings_cache', type: 'string', required: false },
          { key: 'schedule_generated', type: 'boolean', required: false },
          { key: 'created_at', type: 'string', required: true },
          { key: 'updated_at', type: 'string', required: true }
        ]
      },
      {
        id: 'teams',
        name: 'Teams',
        attributes: [
          { key: 'league_id', type: 'string', required: true },
          { key: 'user_id', type: 'string', required: true },
          { key: 'name', type: 'string', required: true },
          { key: 'logo_url', type: 'string', required: false },
          { key: 'record', type: 'string', required: false },
          { key: 'points_for', type: 'double', required: false },
          { key: 'points_against', type: 'double', required: false },
          { key: 'waiver_priority', type: 'integer', required: false },
          { key: 'faab_budget_remaining', type: 'double', required: false },
          { key: 'created_at', type: 'string', required: true },
          { key: 'updated_at', type: 'string', required: true }
        ]
      },
      {
        id: 'rosters',
        name: 'Rosters',
        attributes: [
          { key: 'league_id', type: 'string', required: true },
          { key: 'user_id', type: 'string', required: true },
          { key: 'team_id', type: 'string', required: true },
          { key: 'starters', type: 'string', required: false },
          { key: 'bench', type: 'string', required: false },
          { key: 'ir', type: 'string', required: false },
          { key: 'created_at', type: 'string', required: true },
          { key: 'updated_at', type: 'string', required: true }
        ]
      },
      {
        id: 'matchups',
        name: 'Matchups',
        attributes: [
          { key: 'league_id', type: 'string', required: true },
          { key: 'week', type: 'integer', required: true },
          { key: 'home_team_id', type: 'string', required: true },
          { key: 'away_team_id', type: 'string', required: true },
          { key: 'home_score', type: 'double', required: false },
          { key: 'away_score', type: 'double', required: false },
          { key: 'status', type: 'string', required: false },
          { key: 'season_year', type: 'integer', required: false },
          { key: 'created_at', type: 'string', required: true },
          { key: 'updated_at', type: 'string', required: true }
        ]
      },
      {
        id: 'player_stats',
        name: 'Player Stats',
        attributes: [
          { key: 'player_id', type: 'string', required: true },
          { key: 'week', type: 'integer', required: true },
          { key: 'season', type: 'integer', required: true },
          { key: 'passing_yards', type: 'integer', required: false },
          { key: 'passing_tds', type: 'integer', required: false },
          { key: 'interceptions', type: 'integer', required: false },
          { key: 'rushing_yards', type: 'integer', required: false },
          { key: 'rushing_tds', type: 'integer', required: false },
          { key: 'receiving_yards', type: 'integer', required: false },
          { key: 'receiving_tds', type: 'integer', required: false },
          { key: 'receptions', type: 'integer', required: false },
          { key: 'field_goals', type: 'integer', required: false },
          { key: 'extra_points', type: 'integer', required: false },
          { key: 'fantasy_points', type: 'double', required: false },
          { key: 'created_at', type: 'string', required: true },
          { key: 'updated_at', type: 'string', required: true }
        ]
      },
      {
        id: 'games',
        name: 'Games',
        attributes: [
          { key: 'home_team', type: 'string', required: true },
          { key: 'away_team', type: 'string', required: true },
          { key: 'week', type: 'integer', required: true },
          { key: 'season', type: 'integer', required: true },
          { key: 'status', type: 'string', required: false },
          { key: 'home_score', type: 'integer', required: false },
          { key: 'away_score', type: 'integer', required: false },
          { key: 'game_time', type: 'string', required: false },
          { key: 'created_at', type: 'string', required: true },
          { key: 'updated_at', type: 'string', required: true }
        ]
      }
    ];

    // Check existing collections
    const existingCollections = await databases.listCollections(DATABASE_ID);
    console.log(`📋 Found ${existingCollections.collections.length} existing collections`);

    for (const collection of collections) {
      const exists = existingCollections.collections.find(c => c.$id === collection.id);
      
      if (exists) {
        console.log(`✅ Collection ${collection.name} already exists`);
      } else {
        try {
          await databases.createCollection(DATABASE_ID, collection.id, collection.name);
          console.log(`✅ Created collection: ${collection.name}`);
          
          // Add attributes
          for (const attr of collection.attributes) {
            try {
              await databases.createStringAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required || false,
                attr.default || null,
                attr.array || false
              );
            } catch (error) {
              // Attribute might already exist
              console.log(`  ⚠️ Attribute ${attr.key} might already exist`);
            }
          }
        } catch (error) {
          console.log(`❌ Error creating collection ${collection.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Collection setup complete!');
    console.log('You can now test league creation.');

  } catch (error) {
    console.error('❌ Error setting up collections:', error.message);
  }
}

setupCollections(); 