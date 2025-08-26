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

async function analyzeDraftCollections() {
  console.log('📊 ANALYZING DRAFT COLLECTIONS FOR CONSOLIDATION\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Analyze drafts collection
    console.log('\n📄 DRAFTS COLLECTION');
    console.log('-'.repeat(40));
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', [Query.limit(5)]);
    console.log('Document count:', drafts.total);
    if (drafts.documents.length > 0) {
      console.log('Sample fields:', Object.keys(drafts.documents[0]));
    }
    
    // 2. Analyze draft_states collection
    console.log('\n📄 DRAFT_STATES COLLECTION');
    console.log('-'.repeat(40));
    try {
      const draftStates = await databases.listDocuments(DATABASE_ID, 'draft_states', [Query.limit(5)]);
      console.log('Document count:', draftStates.total);
      if (draftStates.documents.length > 0) {
        console.log('Sample fields:', Object.keys(draftStates.documents[0]));
        console.log('Sample document:', JSON.stringify(draftStates.documents[0], null, 2));
      }
    } catch (e) {
      console.log('Collection might not exist or is empty');
    }
    
    // 3. Analyze draft_events collection
    console.log('\n📄 DRAFT_EVENTS COLLECTION');
    console.log('-'.repeat(40));
    try {
      const draftEvents = await databases.listDocuments(DATABASE_ID, 'draft_events', [Query.limit(5)]);
      console.log('Document count:', draftEvents.total);
      if (draftEvents.documents.length > 0) {
        console.log('Sample fields:', Object.keys(draftEvents.documents[0]));
        console.log('First few events:');
        draftEvents.documents.forEach((event: any, i: number) => {
          console.log(`  ${i + 1}. Type: ${event.type}, Round: ${event.round}, Overall: ${event.overall}`);
        });
      }
    } catch (e) {
      console.log('Collection might not exist or is empty');
    }
    
    // 4. Propose consolidation structure
    console.log('\n💡 PROPOSED CONSOLIDATION');
    console.log('=' .repeat(60));
    console.log(`
SINGLE "drafts" COLLECTION with enhanced structure:

Core Fields (existing):
- leagueId, leagueName, gameMode, selectedConference
- status, type, startTime, endTime
- currentRound, currentPick, maxRounds, maxTeams
- clockSeconds, orderJson, draftOrder
- isMock

Enhanced Fields (consolidating from other collections):
- stateJson: {
    pickedPlayerIds: string[],
    availablePlayerIds: string[],
    onTheClock: string,
    lastPickTime: Date,
    autopickEnabled: boolean,
    pausedAt?: Date,
    resumedAt?: Date
  }
  
- eventsJson: [
    {
      type: 'pick' | 'trade' | 'timeout' | 'pause' | 'resume',
      round: number,
      overall: number,
      teamId: string,
      playerId?: string,
      timestamp: Date,
      metadata?: any
    }
  ]
  
- picksJson: [
    {
      round: number,
      pick: number,
      overall: number,
      teamId: string,
      playerId: string,
      playerName: string,
      position: string,
      team: string,
      timestamp: Date
    }
  ]

Benefits:
1. Single source of truth for all draft data
2. Atomic updates (no sync issues)
3. Fewer API calls (one fetch gets everything)
4. Simpler real-time subscriptions
5. Better performance (no JOINs needed)
6. Easier backup/restore

Migration Strategy:
1. Add new JSON fields to drafts collection
2. Migrate existing data from draft_states and draft_events
3. Update all code to use consolidated structure
4. Delete old collections
`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeDraftCollections();
