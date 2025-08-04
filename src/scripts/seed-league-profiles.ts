#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEW_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.NEW_APPWRITE_API_KEY || '996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3');

const databases = new Databases(client);
const databaseId = 'college-football-fantasy';

async function seedLeagueProfiles() {
  try {
    console.log('🏈 Seeding League Profiles for College Football Fantasy...\n');

    // 1. Seed Lineup Profiles
    console.log('📋 Seeding lineup profiles...');
    
    const lineupProfiles = [
      {
        documentId: 'lp_conference',
        name: 'Conference Mode Lineup',
        description: 'Standard lineup for single-conference leagues',
        slots: JSON.stringify({
          QB: 1,
          RB: 1,
          WR: 2,
          TE: 1,
          K: 1
        }),
        mode: 'CONFERENCE',
        created_at: new Date().toISOString()
      },
      {
        documentId: 'lp_power4',
        name: 'Power-4 Mode Lineup',
        description: 'Enhanced lineup for Power-4 leagues with defense',
        slots: JSON.stringify({
          QB: 1,
          RB: 2,
          WR: 2,
          FLEX: 1, // RB/WR/TE
          TE: 1,
          K: 1,
          DEF: 1
        }),
        mode: 'POWER4',
        created_at: new Date().toISOString()
      }
    ];

    for (const profile of lineupProfiles) {
      try {
        await databases.createDocument(
          databaseId,
          'lineup_profiles',
          profile.documentId,
          {
            name: profile.name,
            description: profile.description,
            slots: profile.slots,
            mode: profile.mode,
            created_at: profile.created_at
          }
        );
        console.log(`  ✅ Created ${profile.name}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${profile.name} already exists`);
        } else {
          console.log(`  ❌ Error creating ${profile.name}:`, error.message);
        }
      }
    }

    // 2. Seed Scoring Profiles
    console.log('\n📋 Seeding scoring profiles...');
    
    const scoringProfiles = [
      {
        documentId: 'sp_standard',
        name: 'Standard Scoring',
        description: 'Half-PPR scoring with standard defense rules',
        offense_rules: JSON.stringify({
          passing_yards: { points: 0.04, description: '1 point per 25 yards' },
          passing_td: { points: 4, description: '4 points per passing TD' },
          interception: { points: -2, description: '-2 points per interception' },
          rushing_yards: { points: 0.1, description: '1 point per 10 yards' },
          receiving_yards: { points: 0.1, description: '1 point per 10 yards' },
          rushing_td: { points: 6, description: '6 points per rushing TD' },
          receiving_td: { points: 6, description: '6 points per receiving TD' },
          reception: { points: 0.5, description: '0.5 points per reception (half-PPR)' },
          fumble_lost: { points: -2, description: '-2 points per fumble lost' }
        }),
        defense_rules: JSON.stringify({
          sack: { points: 1, description: '1 point per sack' },
          interception: { points: 2, description: '2 points per interception' },
          fumble_recovery: { points: 2, description: '2 points per fumble recovery' },
          td: { points: 6, description: '6 points per defensive TD' },
          safety: { points: 2, description: '2 points per safety' },
          two_pt_return: { points: 2, description: '2 points per 2-point return' },
          block_kick_td: { points: 6, description: '6 points per blocked kick TD' },
          points_allowed: {
            '0': { points: 10, description: '10 points for 0 points allowed' },
            '1-6': { points: 7, description: '7 points for 1-6 points allowed' },
            '7-13': { points: 4, description: '4 points for 7-13 points allowed' },
            '14-20': { points: 1, description: '1 point for 14-20 points allowed' },
            '21-34': { points: 0, description: '0 points for 21-34 points allowed' },
            '35-45': { points: -3, description: '-3 points for 35-45 points allowed' },
            '46+': { points: -5, description: '-5 points for 46+ points allowed' }
          }
        }),
        kicker_rules: JSON.stringify({
          'fg_0_39': { points: 3, description: '3 points for FG 0-39 yards' },
          'fg_40_49': { points: 4, description: '4 points for FG 40-49 yards' },
          'fg_50_plus': { points: 5, description: '5 points for FG 50+ yards' },
          'xp': { points: 1, description: '1 point for extra point' },
          'missed_fg': { points: -1, description: '-1 point for missed FG' },
          'missed_xp': { points: -1, description: '-1 point for missed XP' }
        }),
        created_at: new Date().toISOString()
      }
    ];

    for (const profile of scoringProfiles) {
      try {
        await databases.createDocument(
          databaseId,
          'scoring_profiles',
          profile.documentId,
          {
            name: profile.name,
            description: profile.description,
            offense_rules: profile.offense_rules,
            defense_rules: profile.defense_rules,
            kicker_rules: profile.kicker_rules,
            created_at: profile.created_at
          }
        );
        console.log(`  ✅ Created ${profile.name}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${profile.name} already exists`);
        } else {
          console.log(`  ❌ Error creating ${profile.name}:`, error.message);
        }
      }
    }

    // 3. Seed Eligibility Rules
    console.log('\n📋 Seeding eligibility rules...');
    
    const eligibilityRules = [
      {
        documentId: 'er_conference',
        mode: 'CONFERENCE',
        description: 'Players eligible if they are in the selected conference',
        js_function: `
function isEligible(player, game, league) {
  // Conference mode: player must be in the selected conference
  return player.conference === league.conf;
}
        `.trim(),
        created_at: new Date().toISOString()
      },
      {
        documentId: 'er_power4',
        mode: 'POWER4',
        description: 'Players eligible only in conference games or vs AP Top-25 teams',
        js_function: `
function isEligible(player, game, league) {
  // Power-4 mode: eligible if conference game OR vs AP Top-25 team
  const isConferenceGame = game.home_conf === game.away_conf;
  const isVsRankedTeam = (game.home_rank && game.home_rank <= 25) || 
                        (game.away_rank && game.away_rank <= 25);
  
  return isConferenceGame || isVsRankedTeam;
}
        `.trim(),
        created_at: new Date().toISOString()
      }
    ];

    for (const rule of eligibilityRules) {
      try {
        await databases.createDocument(
          databaseId,
          'eligibility_rules',
          rule.documentId,
          {
            mode: rule.mode,
            description: rule.description,
            js_function: rule.js_function,
            created_at: rule.created_at
          }
        );
        console.log(`  ✅ Created ${rule.mode} eligibility rule`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ℹ️  ${rule.mode} eligibility rule already exists`);
        } else {
          console.log(`  ❌ Error creating ${rule.mode} eligibility rule:`, error.message);
        }
      }
    }

    console.log('\n🎉 All league profiles seeded successfully!');
    console.log('\n📊 Profiles created:');
    console.log('  • Conference Mode Lineup (1 QB, 1 RB, 2 WR, 1 TE, 1 K)');
    console.log('  • Power-4 Mode Lineup (1 QB, 2 RB, 2 WR, 1 FLEX, 1 TE, 1 K, 1 DEF)');
    console.log('  • Standard Scoring (Half-PPR with defense)');
    console.log('  • Conference Mode Eligibility Rule');
    console.log('  • Power-4 Mode Eligibility Rule');

  } catch (error) {
    console.error('❌ Error seeding league profiles:', error);
  }
}

seedLeagueProfiles(); 