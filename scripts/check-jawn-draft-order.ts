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

async function checkJawnDraftOrder() {
  console.log('🔍 Checking Jawn League Draft Order\n');
  
  // Find Jawn League
  const leagues = await databases.listDocuments(
    DATABASE_ID,
    'leagues',
    [Query.equal('name', 'Jawn League'), Query.limit(1)]
  );
  
  if (leagues.documents.length === 0) {
    console.log('❌ Jawn League not found');
    return;
  }
  
  const league = leagues.documents[0];
  console.log('✅ Found Jawn League:', league.$id);
  console.log('   Draft Date:', league.draftDate);
  console.log('   Draft Order in league:', league.draftOrder);
  
  // Find draft document
  const drafts = await databases.listDocuments(
    DATABASE_ID,
    'drafts',
    [Query.limit(100)]
  );
  
  const draft = drafts.documents.find((d: any) => 
    d.leagueId === league.$id || d.league_id === league.$id
  );
  
  if (!draft) {
    console.log('\n❌ No draft document found for Jawn League');
    return;
  }
  
  console.log('\n✅ Found draft document:', draft.$id);
  console.log('   Status:', draft.status);
  console.log('   Start Time:', draft.startTime);
  console.log('   Draft Order field:', draft.draftOrder);
  
  if (draft.orderJson) {
    try {
      const orderJson = JSON.parse(draft.orderJson);
      console.log('\n📋 Order JSON Contents:');
      console.log('   Draft Order:', orderJson.draftOrder);
      console.log('   Number of teams:', orderJson.draftOrder?.length);
      
      if (orderJson.draftOrder && orderJson.draftOrder.length > 0) {
        console.log('\n👥 Draft Order Details:');
        orderJson.draftOrder.forEach((id: string, idx: number) => {
          console.log(`   ${idx + 1}. ${id}`);
        });
      }
    } catch (e) {
      console.log('   ❌ Error parsing orderJson:', e);
    }
  } else {
    console.log('   ⚠️  No orderJson field found');
  }
  
  // Check if we have the new consolidated fields
  if (draft.stateJson) {
    console.log('\n📊 Has stateJson: Yes');
  }
  if (draft.eventsJson) {
    console.log('📊 Has eventsJson: Yes');
  }
  if (draft.picksJson) {
    console.log('📊 Has picksJson: Yes');
  }
}

checkJawnDraftOrder();
