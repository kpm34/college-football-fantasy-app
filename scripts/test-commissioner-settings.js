#!/usr/bin/env node

const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function testCommissionerSettings() {
  console.log('🧪 Testing Commissioner Settings...\n');
  
  try {
    // Find a test league
    const leagues = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      'leagues',
      [Query.limit(1)]
    );
    
    if (leagues.documents.length === 0) {
      console.log('❌ No leagues found to test');
      return;
    }
    
    const league = leagues.documents[0];
    console.log(`📋 Testing with league: ${league.name} (${league.$id})`);
    
    // Check current settings
    console.log('\n📖 Current Settings:');
    if (league.scoringRules) {
      try {
        const settings = JSON.parse(league.scoringRules);
        console.log('✅ Settings are valid JSON');
        console.log('Structure:', Object.keys(settings));
        
        if (settings.scoringRules) {
          console.log('✅ Has scoringRules:', settings.scoringRules.length, 'rules');
        }
        if (settings.scheduleSettings) {
          console.log('✅ Has scheduleSettings:', settings.scheduleSettings);
        }
        if (settings.playoffSettings) {
          console.log('✅ Has playoffSettings:', settings.playoffSettings);
        }
        if (settings.theme) {
          console.log('✅ Has theme:', settings.theme);
        }
        if (settings.draftSettings) {
          console.log('✅ Has draftSettings:', settings.draftSettings);
        }
        if (settings.leagueSettings) {
          console.log('✅ Has leagueSettings:', settings.leagueSettings);
        }
      } catch (e) {
        console.log('❌ Settings are not valid JSON:', e.message);
      }
    } else {
      console.log('❌ No scoringRules field found');
    }
    
    // Test write
    console.log('\n🔧 Testing write operation...');
    const testSettings = {
      scoringRules: DEFAULT_SCORING_RULES,
      scheduleSettings: {
        type: 'round-robin',
        doubleHeaders: false,
        rivalryWeeks: []
      },
      playoffSettings: {
        teams: 6,
        startWeek: 14,
        reseeding: true,
        byes: 2,
        thirdPlaceGame: true
      },
      theme: {
        primaryColor: '#5E2B8A',
        secondaryColor: '#E73C7E',
        logo: '',
        trophyName: 'Championship Trophy'
      },
      draftSettings: {
        maxTeams: 12,
        pickTimeSeconds: 90,
        draftDate: null
      },
      leagueSettings: {
        name: league.name,
        isPublic: league.isPublic
      }
    };
    
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      'leagues',
      league.$id,
      { scoringRules: JSON.stringify(testSettings) }
    );
    
    console.log('✅ Write successful');
    
    // Test read back
    const updated = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      'leagues',
      league.$id
    );
    
    const readSettings = JSON.parse(updated.scoringRules);
    console.log('✅ Read back successful');
    console.log('✅ All settings preserved:', 
      readSettings.scoringRules && 
      readSettings.scheduleSettings && 
      readSettings.playoffSettings &&
      readSettings.theme &&
      readSettings.draftSettings &&
      readSettings.leagueSettings
    );
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

const DEFAULT_SCORING_RULES = [
  { category: 'Passing', name: 'Passing Yards', points: 0.04 },
  { category: 'Passing', name: 'Passing TD', points: 4 },
  { category: 'Passing', name: 'Interception', points: -2 },
  { category: 'Rushing', name: 'Rushing Yards', points: 0.1 },
  { category: 'Rushing', name: 'Rushing TD', points: 6 },
  { category: 'Rushing', name: 'Fumble', points: -2 },
  { category: 'Receiving', name: 'Reception', points: 1 },
  { category: 'Receiving', name: 'Receiving Yards', points: 0.1 },
  { category: 'Receiving', name: 'Receiving TD', points: 6 },
];

testCommissionerSettings();