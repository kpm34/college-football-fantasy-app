import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

async function fixCollections() {
  console.log('🔧 Fixing Appwrite Collections...');
  console.log('==================================');

  try {
    // Fix leagues collection
    console.log('\n🏈 Fixing Leagues collection...');
    await createLeagueAttributes();
    
    // Fix teams collection  
    console.log('\n👥 Fixing Teams collection...');
    await createTeamAttributes();
    
    // Fix rosters collection
    console.log('\n📋 Fixing Rosters collection...');
    await createRosterAttributes();
    
    // Fix matchups collection
    console.log('\n🏆 Fixing Matchups collection...');
    await createMatchupAttributes();

    console.log('\n🎉 Collection fixes complete!');

  } catch (error) {
    console.error('❌ Error fixing collections:', error.message);
  }
}

async function createLeagueAttributes() {
  const attributes = [
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
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute('college-football-fantasy', 'leagues', attr.key, attr.required, null, false);
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute('college-football-fantasy', 'leagues', attr.key, attr.required, null, false);
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute('college-football-fantasy', 'leagues', attr.key, attr.required, null, false);
      }
      console.log(`  ✅ Added ${attr.key} (${attr.type})`);
    } catch (error) {
      console.log(`  ⚠️ ${attr.key} might already exist: ${error.message}`);
    }
  }
}

async function createTeamAttributes() {
  const attributes = [
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
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute('college-football-fantasy', 'teams', attr.key, attr.required, null, false);
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute('college-football-fantasy', 'teams', attr.key, attr.required, null, false);
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute('college-football-fantasy', 'teams', attr.key, attr.required, null, false);
      }
      console.log(`  ✅ Added ${attr.key} (${attr.type})`);
    } catch (error) {
      console.log(`  ⚠️ ${attr.key} might already exist: ${error.message}`);
    }
  }
}

async function createRosterAttributes() {
  const attributes = [
    { key: 'league_id', type: 'string', required: true },
    { key: 'user_id', type: 'string', required: true },
    { key: 'team_id', type: 'string', required: true },
    { key: 'starters', type: 'string', required: false },
    { key: 'bench', type: 'string', required: false },
    { key: 'ir', type: 'string', required: false },
    { key: 'created_at', type: 'string', required: true },
    { key: 'updated_at', type: 'string', required: true }
  ];

  for (const attr of attributes) {
    try {
      await databases.createStringAttribute('college-football-fantasy', 'rosters', attr.key, attr.required, null, false);
      console.log(`  ✅ Added ${attr.key} (${attr.type})`);
    } catch (error) {
      console.log(`  ⚠️ ${attr.key} might already exist: ${error.message}`);
    }
  }
}

async function createMatchupAttributes() {
  const attributes = [
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
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute('college-football-fantasy', 'matchups', attr.key, attr.required, null, false);
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute('college-football-fantasy', 'matchups', attr.key, attr.required, null, false);
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute('college-football-fantasy', 'matchups', attr.key, attr.required, null, false);
      }
      console.log(`  ✅ Added ${attr.key} (${attr.type})`);
    } catch (error) {
      console.log(`  ⚠️ ${attr.key} might already exist: ${error.message}`);
    }
  }
}

fixCollections(); 