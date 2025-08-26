#!/usr/bin/env tsx
import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function fixFor820Deadline() {
  console.log('🚀 FIXING DRAFT FOR 8:20 PM DEADLINE\n');
  
  try {
    // Get draft document
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', []);
    const draft = drafts.documents.find((d: any) => d.leagueName === 'test xl');
    
    if (!draft) {
      console.error('❌ Draft not found!');
      return;
    }
    
    // Set 8:20 PM as start time
    const eightTwentyPM = new Date();
    eightTwentyPM.setHours(20, 20, 0, 0); // 8:20 PM today
    
    // Full draft order with you first, then bots
    const fullDraftOrder = [
      '689728660623e03830fc',  // You (Kashyap)
      'BOT-1', 'BOT-2', 'BOT-3', 'BOT-4', 'BOT-5',
      'BOT-6', 'BOT-7', 'BOT-8', 'BOT-9', 'BOT-10', 'BOT-11'
    ];
    
    // Update orderJson with full draft order
    let orderJson: any = {};
    try {
      orderJson = draft.orderJson ? JSON.parse(draft.orderJson) : {};
    } catch {}
    
    orderJson.draftOrder = fullDraftOrder;
    orderJson.totalTeams = 12;
    orderJson.leagueName = 'test xl';
    
    console.log('📝 Updating draft document...');
    await databases.updateDocument(
      DATABASE_ID,
      'drafts',
      draft.$id,
      {
        status: 'scheduled',
        startTime: eightTwentyPM.toISOString(),
        orderJson: JSON.stringify(orderJson),
        currentRound: 0,
        currentPick: 0
      }
    );
    console.log('✅ Draft document updated');
    
    // Update league too
    const leagueId = draft.leagueId || draft.league_id;
    if (leagueId) {
      console.log('\n📝 Updating league...');
      await databases.updateDocument(
        DATABASE_ID,
        'leagues',
        leagueId,
        {
          draftDate: eightTwentyPM.toISOString(),
          draftOrder: JSON.stringify(fullDraftOrder),
          status: 'full' // NOT drafting yet
        }
      );
      console.log('✅ League updated');
    }
    
    console.log('\n✨ READY FOR 8:20 PM!');
    console.log('-'.repeat(40));
    console.log('Draft time:', eightTwentyPM.toLocaleString());
    console.log('Draft order: You pick first, then 11 bots');
    console.log('Status: scheduled (will auto-start at 8:20)');
    console.log('\nThe cron job runs every minute and will start the draft');
    console.log('when it detects startTime <= current time');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixFor820Deadline();
