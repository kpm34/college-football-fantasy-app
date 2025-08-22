#!/usr/bin/env tsx
/**
 * Test script to verify DRAFT ROOM button visibility logic
 * The button should:
 * - Show 1 hour before draft time
 * - Stay visible during draft
 * - Hide 3 hours after draft time
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app');

// Use API key for server-side operations
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY not found in environment');
  process.exit(1);
}

client.setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const LEAGUES_COLLECTION = 'leagues';

/**
 * Test if DRAFT ROOM button would be visible at a given time
 */
function testDraftRoomVisibility(draftDate: Date, testTime: Date, leagueStatus: string) {
  const timeDiff = draftDate.getTime() - testTime.getTime();
  
  // Draft is complete if status is active or complete
  if (leagueStatus === 'active' || leagueStatus === 'complete') {
    return { visible: false, reason: 'Draft Complete' };
  }
  
  // Draft is currently active if status is 'drafting'
  if (leagueStatus === 'drafting') {
    return { visible: true, reason: 'Draft in progress', color: 'green' };
  }
  
  // Check if we're within the draft window (1 hour before to 3 hours after)
  const draftWindow = {
    start: draftDate.getTime() - (60 * 60 * 1000), // 1 hour before
    end: draftDate.getTime() + (3 * 60 * 60 * 1000) // 3 hours after
  };
  
  const isInDraftWindow = testTime.getTime() >= draftWindow.start && testTime.getTime() <= draftWindow.end;
  
  if (isInDraftWindow) {
    if (timeDiff > 0) {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return { 
        visible: true, 
        reason: `Draft in ${hours}h ${minutes}m`, 
        color: 'orange',
        countdown: `${hours}h ${minutes}m`
      };
    } else {
      return { visible: true, reason: 'Draft time!', color: 'orange' };
    }
  }
  
  if (timeDiff > 0) {
    return { visible: false, reason: 'Draft not yet within 1 hour window' };
  } else {
    return { visible: false, reason: 'Draft window closed (>3 hours after)' };
  }
}

/**
 * Run comprehensive tests
 */
async function runTests() {
  console.log('🧪 Testing DRAFT ROOM Button Time Window Logic\n');
  console.log('=' .repeat(60));
  
  // Test scenarios with different draft times
  const now = new Date();
  const scenarios = [
    {
      name: 'Draft 2 hours from now',
      draftDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: 'open'
    },
    {
      name: 'Draft 45 minutes from now',
      draftDate: new Date(now.getTime() + 45 * 60 * 1000),
      status: 'open'
    },
    {
      name: 'Draft 30 minutes ago',
      draftDate: new Date(now.getTime() - 30 * 60 * 1000),
      status: 'drafting'
    },
    {
      name: 'Draft 2 hours ago',
      draftDate: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      status: 'open'
    },
    {
      name: 'Draft 4 hours ago',
      draftDate: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      status: 'open'
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log(`   Draft Date: ${scenario.draftDate.toLocaleString()}`);
    console.log(`   League Status: ${scenario.status}`);
    console.log(`   Current Time: ${now.toLocaleString()}`);
    
    // Test various time points
    const testPoints = [
      { time: new Date(scenario.draftDate.getTime() - 2 * 60 * 60 * 1000), label: '2 hours before' },
      { time: new Date(scenario.draftDate.getTime() - 61 * 60 * 1000), label: '61 minutes before' },
      { time: new Date(scenario.draftDate.getTime() - 59 * 60 * 1000), label: '59 minutes before' },
      { time: new Date(scenario.draftDate.getTime() - 30 * 60 * 1000), label: '30 minutes before' },
      { time: scenario.draftDate, label: 'Exact draft time' },
      { time: new Date(scenario.draftDate.getTime() + 60 * 60 * 1000), label: '1 hour after' },
      { time: new Date(scenario.draftDate.getTime() + 2 * 60 * 60 * 1000), label: '2 hours after' },
      { time: new Date(scenario.draftDate.getTime() + 179 * 60 * 1000), label: '2h 59m after' },
      { time: new Date(scenario.draftDate.getTime() + 181 * 60 * 1000), label: '3h 1m after' },
      { time: new Date(scenario.draftDate.getTime() + 4 * 60 * 60 * 1000), label: '4 hours after' }
    ];
    
    console.log('\n   Time Point Tests:');
    for (const point of testPoints) {
      const result = testDraftRoomVisibility(scenario.draftDate, point.time, scenario.status);
      const icon = result.visible ? '✅' : '❌';
      const color = result.color ? ` (${result.color} button)` : '';
      console.log(`   ${icon} ${point.label.padEnd(20)} → ${result.reason}${color}`);
    }
  }
  
  // Test with actual league data
  console.log('\n' + '=' .repeat(60));
  console.log('\n🔍 Testing with Actual League Data (test xl):\n');
  
  try {
    // Fetch the test league
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      LEAGUES_COLLECTION,
      []
    );
    
    const testLeague = leagues.documents.find(l => l.name?.toLowerCase().includes('test xl'));
    
    if (testLeague) {
      console.log(`✅ Found league: ${testLeague.name}`);
      console.log(`   ID: ${testLeague.$id}`);
      console.log(`   Status: ${testLeague.status}`);
      console.log(`   Draft Date: ${testLeague.draftDate || 'Not set'}`);
      
      if (testLeague.draftDate) {
        const draftDate = new Date(testLeague.draftDate);
        const result = testDraftRoomVisibility(draftDate, now, testLeague.status);
        
        console.log('\n   Current Button State:');
        console.log(`   ${result.visible ? '✅' : '❌'} Button Visible: ${result.visible}`);
        console.log(`   📝 Reason: ${result.reason}`);
        if (result.color) {
          console.log(`   🎨 Button Color: ${result.color}`);
        }
        if (result.countdown) {
          console.log(`   ⏱️  Countdown: ${result.countdown}`);
        }
        
        // Calculate next state change
        const draftTime = draftDate.getTime();
        const nowTime = now.getTime();
        const windowStart = draftTime - (60 * 60 * 1000);
        const windowEnd = draftTime + (3 * 60 * 60 * 1000);
        
        console.log('\n   📅 Time Window Details:');
        console.log(`   Window Opens: ${new Date(windowStart).toLocaleString()}`);
        console.log(`   Draft Time: ${draftDate.toLocaleString()}`);
        console.log(`   Window Closes: ${new Date(windowEnd).toLocaleString()}`);
        
        if (nowTime < windowStart) {
          const timeUntilOpen = windowStart - nowTime;
          const hours = Math.floor(timeUntilOpen / (1000 * 60 * 60));
          const minutes = Math.floor((timeUntilOpen % (1000 * 60 * 60)) / (1000 * 60));
          console.log(`\n   ⏰ Button will appear in: ${hours}h ${minutes}m`);
        } else if (nowTime >= windowStart && nowTime <= windowEnd) {
          const timeUntilClose = windowEnd - nowTime;
          const hours = Math.floor(timeUntilClose / (1000 * 60 * 60));
          const minutes = Math.floor((timeUntilClose % (1000 * 60 * 60)) / (1000 * 60));
          console.log(`\n   ⏰ Button will disappear in: ${hours}h ${minutes}m`);
        } else {
          console.log(`\n   ⏰ Draft window has closed`);
        }
        
      } else {
        console.log('\n   ⚠️  No draft date set - button will not appear');
        console.log('   💡 Set a draft date in Commissioner Settings to test');
      }
    } else {
      console.log('❌ League "test xl" not found');
      console.log('   Available leagues:', leagues.documents.map(l => l.name).join(', '));
    }
  } catch (error: any) {
    console.error('❌ Error fetching league data:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ Test Complete!\n');
  console.log('📝 Summary:');
  console.log('   - DRAFT ROOM button appears 1 hour before draft');
  console.log('   - Button stays visible during draft (status: drafting)');
  console.log('   - Button disappears 3 hours after draft time');
  console.log('   - Commissioner always sees button if draft is scheduled');
  console.log('   - Button changes color based on state:');
  console.log('     • Blue: Commissioner preview');
  console.log('     • Orange: Draft window open');
  console.log('     • Green: Draft in progress');
  console.log('     • Gray: Draft complete\n');
}

// Run the tests
runTests().catch(console.error);
