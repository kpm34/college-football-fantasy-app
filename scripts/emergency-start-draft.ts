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

async function emergencyStartDraft() {
  console.log('🚨 EMERGENCY DRAFT START AT 8:26 PM\n');
  
  try {
    // Get test xl draft
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', [Query.limit(100)]);
    const testXl = drafts.documents.find((d: any) => d.leagueName === 'test xl');
    
    if (!testXl) {
      console.log('❌ Draft not found!');
      return;
    }
    
    console.log('Current draft status:', testXl.status);
    console.log('Start time was:', new Date(testXl.startTime).toLocaleString());
    
    if (testXl.status !== 'active') {
      console.log('\n🔧 Starting draft manually...');
      
      // Update draft to active
      await databases.updateDocument(
        DATABASE_ID,
        'drafts',
        testXl.$id,
        {
          status: 'active',
          currentRound: 1,
          currentPick: 1
        }
      );
      console.log('✅ Draft status set to active');
      
      // Update league status
      const leagueId = testXl.leagueId || testXl.league_id;
      if (leagueId) {
        await databases.updateDocument(
          DATABASE_ID,
          'leagues',
          leagueId,
          {
            status: 'drafting'
          }
        );
        console.log('✅ League status set to drafting');
      }
      
      console.log('\n🎯 DRAFT IS NOW ACTIVE!');
      console.log('Go to https://cfbfantasy.app/draft/' + leagueId);
      console.log('You should be on the clock for pick #1');
    } else {
      console.log('✅ Draft is already active!');
      console.log('Current pick:', testXl.currentPick);
      console.log('Current round:', testXl.currentRound);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

emergencyStartDraft();
