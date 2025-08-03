#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = 'college-football-fantasy';

async function setupLeagueCollections() {
  try {
    console.log('🏈 Setting up League Collections for College Football Fantasy...\n');

    // 1. Create leagues collection
    console.log('📋 Creating leagues collection...');
    try {
      await databases.createCollection(databaseId, 'leagues', 'Leagues');
      console.log('✅ Leagues collection created');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️  Leagues collection already exists');
      } else {
        throw error;
      }
    }

    // Add attributes to leagues collection
    const leaguesAttributes = [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'mode', type: 'string', size: 20, required: true }, // CONFERENCE or POWER4
      { key: 'conf', type: 'string', size: 50, required: false }, // Conference name (for CONFERENCE mode)
      { key: 'commissioner_id', type: 'string', size: 36, required: true },
      { key: 'lineup_profile_id', type: 'string', size: 50, required: true },
      { key: 'scoring_profile_id', type: 'string', size: 50, required: true },
      { key: 'max_teams', type: 'integer', required: true },
      { key: 'draft_date', type: 'datetime', required: false },
      { key: 'season_start_week', type: 'integer', required: true },
      { key: 'status', type: 'string', size: 20, required: true }, // DRAFTING, ACTIVE, COMPLETED
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true }
    ];

    for (const attr of leaguesAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(databaseId, 'leagues', attr.key, attr.size || 255, attr.required);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(databaseId, 'leagues', attr.key, attr.required);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(databaseId, 'leagues', attr.key, attr.required);
        }
        console.log(`  ✅ Added ${attr.key} (${attr.type})`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    // Add members array attribute separately
    try {
      await databases.createStringAttribute(databaseId, 'leagues', 'members', 36, false, undefined, true);
      console.log('  ✅ Added members (string[])');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('  ℹ️  members already exists');
      } else {
        console.log('  ❌ Error adding members:', error.message);
      }
    }

    // 2. Create lineup_profiles collection
    console.log('\n📋 Creating lineup_profiles collection...');
    try {
      await databases.createCollection(databaseId, 'lineup_profiles', 'Lineup Profiles');
      console.log('✅ Lineup profiles collection created');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️  Lineup profiles collection already exists');
      } else {
        throw error;
      }
    }

    // Add attributes to lineup_profiles collection
    const lineupProfileAttributes = [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'slots', type: 'string', size: 1000, required: true, array: false }, // JSON string of slot configuration
      { key: 'mode', type: 'string', size: 20, required: true, array: false }, // CONFERENCE or POWER4
      { key: 'created_at', type: 'datetime', required: true, array: false }
    ];

    for (const attr of lineupProfileAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(databaseId, 'lineup_profiles', attr.key, attr.size || 255, attr.required);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(databaseId, 'lineup_profiles', attr.key, attr.required);
        }
        console.log(`  ✅ Added ${attr.key} (${attr.type})`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    // 3. Create scoring_profiles collection
    console.log('\n📋 Creating scoring_profiles collection...');
    try {
      await databases.createCollection(databaseId, 'scoring_profiles', 'Scoring Profiles');
      console.log('✅ Scoring profiles collection created');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️  Scoring profiles collection already exists');
      } else {
        throw error;
      }
    }

    // Add attributes to scoring_profiles collection
    const scoringProfileAttributes = [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'offense_rules', type: 'string', size: 2000, required: true, array: false }, // JSON string of offense scoring
      { key: 'defense_rules', type: 'string', size: 2000, required: false, array: false }, // JSON string of defense scoring (Power-4 only)
      { key: 'kicker_rules', type: 'string', size: 1000, required: true, array: false }, // JSON string of kicker scoring
      { key: 'created_at', type: 'datetime', required: true, array: false }
    ];

    for (const attr of scoringProfileAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(databaseId, 'scoring_profiles', attr.key, attr.size || 255, attr.required);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(databaseId, 'scoring_profiles', attr.key, attr.required);
        }
        console.log(`  ✅ Added ${attr.key} (${attr.type})`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    // 4. Create eligibility_rules collection
    console.log('\n📋 Creating eligibility_rules collection...');
    try {
      await databases.createCollection(databaseId, 'eligibility_rules', 'Eligibility Rules');
      console.log('✅ Eligibility rules collection created');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️  Eligibility rules collection already exists');
      } else {
        throw error;
      }
    }

    // Add attributes to eligibility_rules collection
    const eligibilityRuleAttributes = [
      { key: 'mode', type: 'string', size: 20, required: true, array: false }, // CONFERENCE or POWER4
      { key: 'description', type: 'string', size: 500, required: true, array: false },
      { key: 'js_function', type: 'string', size: 2000, required: true, array: false }, // JavaScript function for eligibility check
      { key: 'created_at', type: 'datetime', required: true, array: false }
    ];

    for (const attr of eligibilityRuleAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(databaseId, 'eligibility_rules', attr.key, attr.size || 255, attr.required);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(databaseId, 'eligibility_rules', attr.key, attr.required);
        }
        console.log(`  ✅ Added ${attr.key} (${attr.type})`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    // 5. Create weekly_eligibility collection
    console.log('\n📋 Creating weekly_eligibility collection...');
    try {
      await databases.createCollection(databaseId, 'weekly_eligibility', 'Weekly Eligibility');
      console.log('✅ Weekly eligibility collection created');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️  Weekly eligibility collection already exists');
      } else {
        throw error;
      }
    }

    // Add attributes to weekly_eligibility collection
    const weeklyEligibilityAttributes = [
      { key: 'league_id', type: 'string', size: 36, required: true, array: false },
      { key: 'player_id', type: 'string', size: 36, required: true, array: false },
      { key: 'week', type: 'integer', required: true, array: false, min: 1, max: 15 },
      { key: 'eligible', type: 'boolean', required: true, array: false },
      { key: 'reason', type: 'string', size: 200, required: false, array: false }, // Why eligible/ineligible
      { key: 'game_id', type: 'string', size: 36, required: false, array: false }, // Associated game
      { key: 'created_at', type: 'datetime', required: true, array: false }
    ];

    for (const attr of weeklyEligibilityAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(databaseId, 'weekly_eligibility', attr.key, attr.size || 255, attr.required);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(databaseId, 'weekly_eligibility', attr.key, attr.required);
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(databaseId, 'weekly_eligibility', attr.key, attr.required);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(databaseId, 'weekly_eligibility', attr.key, attr.required);
        }
        console.log(`  ✅ Added ${attr.key} (${attr.type})`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${attr.key} already exists`);
        } else {
          console.log(`  ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    console.log('\n🎉 All league collections created successfully!');
    console.log('\n📊 Collections created:');
    console.log('  • leagues');
    console.log('  • lineup_profiles');
    console.log('  • scoring_profiles');
    console.log('  • eligibility_rules');
    console.log('  • weekly_eligibility');

  } catch (error) {
    console.error('❌ Error setting up league collections:', error);
  }
}

setupLeagueCollections(); 