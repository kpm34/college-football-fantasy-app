#!/usr/bin/env tsx
import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function checkDraftTime() {
  try {
    // Find test xl league
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.equal('name', 'test xl'), Query.limit(1)]
    );
    
    if (leagues.documents.length === 0) {
      console.error('test xl league not found!');
      return;
    }
    
    const league = leagues.documents[0];
    console.log('League: test xl');
    console.log('League ID:', league.$id);
    console.log('Draft Date in League:', league.draftDate);
    
    if (league.draftDate) {
      const draftDate = new Date(league.draftDate);
      console.log('Draft Time (Local):', draftDate.toLocaleString());
      console.log('Draft Time (ISO):', draftDate.toISOString());
      
      // Calculate time until draft
      const now = new Date();
      const timeDiff = draftDate.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeDiff / 60000);
      
      console.log('\n📅 Draft Status:');
      console.log('   Current time:', now.toLocaleString());
      console.log('   Time until draft:', minutesUntil, 'minutes');
      
      if (minutesUntil < -180) {
        console.log('   ⏰ Draft time has passed (more than 3 hours ago)');
        console.log('   ❌ DRAFT ROOM button should be HIDDEN');
      } else if (minutesUntil < 0) {
        console.log('   🎯 Draft is IN PROGRESS or recently ended');
        console.log('   ✅ DRAFT ROOM button should be VISIBLE');
      } else if (minutesUntil < 60) {
        console.log('   ✅ DRAFT ROOM button should be VISIBLE (within 1 hour)');
      } else {
        console.log('   ⏰ DRAFT ROOM button will appear in', (minutesUntil - 60), 'minutes');
      }
    } else {
      console.log('No draft date set!');
    }
    
    // Check draft documents too
    console.log('\n--- Checking Draft Documents ---');
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', [Query.limit(100)]);
    
    const leagueDrafts = drafts.documents.filter((d: any) => 
      d.league_id === league.$id || d.leagueId === league.$id
    );
    
    if (leagueDrafts.length > 0) {
      console.log(`Found ${leagueDrafts.length} draft document(s) for this league:`);
      for (const draft of leagueDrafts) {
        console.log('\nDraft ID:', draft.$id);
        console.log('Draft fields:', Object.keys(draft).filter(k => !k.startsWith('$')));
        if (draft.start_time) {
          const startTime = new Date(draft.start_time);
          console.log('Draft start_time:', startTime.toLocaleString());
        }
        if (draft.order_json) {
          try {
            const orderJson = JSON.parse(draft.order_json);
            if (orderJson.draftDate) {
              console.log('Draft date in order_json:', new Date(orderJson.draftDate).toLocaleString());
            }
          } catch {}
        }
      }
    } else {
      console.log('No draft documents found for this league');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDraftTime();
