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

async function updateJawnDraftTime() {
  console.log('⏰ Updating Jawn League draft time to 9:40 PM\n');
  
  try {
    // Find Jawn League
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.equal('name', 'Jawn League')]
    );
    
    if (leagues.documents.length === 0) {
      console.log('❌ Jawn League not found');
      return;
    }
    
    const league = leagues.documents[0];
    console.log('✅ Found Jawn League:', league.$id);
    
    // Set draft time to 9:40 PM today
    const now = new Date();
    const draftTime = new Date();
    draftTime.setHours(21, 40, 0, 0); // 9:40 PM
    
    // If it's already past 9:40 PM, set for tomorrow
    if (now > draftTime) {
      draftTime.setDate(draftTime.getDate() + 1);
    }
    
    console.log('📅 Setting draft time to:', draftTime.toLocaleString());
    
    // Update league draft date
    await databases.updateDocument(
      DATABASE_ID,
      'leagues',
      league.$id,
      { draftDate: draftTime.toISOString() }
    );
    console.log('✅ Updated league draft date');
    
    // Find and update associated draft document
    const drafts = await databases.listDocuments(
      DATABASE_ID,
      'drafts',
      [Query.equal('leagueId', league.$id)]
    );
    
    if (drafts.documents.length > 0) {
      const draft = drafts.documents[0];
      
      // Parse existing orderJson to preserve draft order
      let orderJson = { draftOrder: [] };
      if (draft.orderJson) {
        try {
          orderJson = JSON.parse(draft.orderJson);
        } catch (e) {
          console.log('⚠️  Could not parse existing orderJson');
        }
      }
      
      // Update draft document with new time
      await databases.updateDocument(
        DATABASE_ID,
        'drafts',
        draft.$id,
        {
          startTime: draftTime.toISOString(),
          status: 'scheduled',
          orderJson: JSON.stringify({
            ...orderJson,
            draftDate: draftTime.toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
      );
      console.log('✅ Updated draft document with new time');
      
      // Also ensure the draft is not marked as active
      if (draft.status === 'active' || draft.status === 'drafting') {
        await databases.updateDocument(
          DATABASE_ID,
          'drafts',
          draft.$id,
          { status: 'scheduled' }
        );
        console.log('✅ Reset draft status to scheduled');
      }
    } else {
      console.log('⚠️  No draft document found for Jawn League');
    }
    
    console.log('\n✨ Jawn League draft time updated successfully!');
    console.log('   Draft scheduled for:', draftTime.toLocaleString());
    console.log('   The Draft Room button will update automatically');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

updateJawnDraftTime();
