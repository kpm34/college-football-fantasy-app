#!/usr/bin/env tsx
import { Client, Databases, Query, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

interface DraftState {
  pickedPlayerIds: string[];
  availablePlayerIds: string[];
  onTheClock: string | null;
  lastPickTime: string | null;
  autopickEnabled: boolean;
  pausedAt?: string;
  resumedAt?: string;
}

interface DraftEvent {
  type: string;
  round: number | null;
  overall: number | null;
  teamId: string | null;
  playerId: string | null;
  timestamp: string;
  metadata?: any;
}

interface DraftPick {
  round: number;
  pick: number;
  overall: number;
  teamId: string;
  playerId: string;
  playerName?: string;
  position?: string;
  team?: string;
  timestamp: string;
}

async function consolidateDraftCollections() {
  console.log('🔄 CONSOLIDATING DRAFT COLLECTIONS\n');
  console.log('=' .repeat(60));
  
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  try {
    // Step 1: Add new attributes to drafts collection
    console.log('📝 Step 1: Adding new attributes to drafts collection...');
    
    const newAttributes = [
      { key: 'stateJson', type: 'string', size: 1000000, required: false },
      { key: 'eventsJson', type: 'string', size: 1000000, required: false },
      { key: 'picksJson', type: 'string', size: 1000000, required: false },
      { key: 'onTheClock', type: 'string', size: 255, required: false },
      { key: 'lastPickTime', type: 'datetime', required: false },
    ];
    
    if (!dryRun) {
      for (const attr of newAttributes) {
        try {
          console.log(`  Adding ${attr.key}...`);
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              DATABASE_ID,
              'drafts',
              attr.key,
              attr.size!,
              attr.required!,
              undefined,
              false
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              'drafts',
              attr.key,
              attr.required!,
              undefined,
              false
            );
          }
          console.log(`  ✅ Added ${attr.key}`);
        } catch (e: any) {
          if (e.message?.includes('already exists')) {
            console.log(`  ⏭️  ${attr.key} already exists`);
          } else {
            console.error(`  ❌ Failed to add ${attr.key}:`, e.message);
          }
        }
      }
    }
    
    // Step 2: Fetch all drafts
    console.log('\n📝 Step 2: Fetching draft documents...');
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', [Query.limit(100)]);
    console.log(`  Found ${drafts.documents.length} drafts`);
    
    // Step 3: Migrate data for each draft
    console.log('\n📝 Step 3: Migrating data...');
    
    for (const draft of drafts.documents) {
      console.log(`\n  Processing draft: ${draft.leagueName || draft.$id}`);
      
      // Fetch related draft_states
      let stateJson: DraftState = {
        pickedPlayerIds: [],
        availablePlayerIds: [],
        onTheClock: null,
        lastPickTime: null,
        autopickEnabled: true,
      };
      
      try {
        const states = await databases.listDocuments(
          DATABASE_ID,
          'draft_states',
          [Query.equal('draftId', draft.$id), Query.limit(1)]
        );
        
        if (states.documents.length > 0) {
          const state = states.documents[0];
          stateJson.onTheClock = state.onClockTeamId || null;
          stateJson.lastPickTime = state.deadlineAt || null;
          console.log('    ✓ Found draft state');
        }
      } catch (e) {
        console.log('    - No draft state found');
      }
      
      // Fetch related draft_events
      let eventsJson: DraftEvent[] = [];
      let picksJson: DraftPick[] = [];
      
      try {
        const events = await databases.listDocuments(
          DATABASE_ID,
          'draft_events',
          [Query.equal('draftId', draft.$id), Query.limit(500)]
        );
        
        if (events.documents.length > 0) {
          console.log(`    ✓ Found ${events.documents.length} events`);
          
          for (const event of events.documents) {
            const eventData: DraftEvent = {
              type: event.type,
              round: event.round || null,
              overall: event.overall || null,
              teamId: event.fantasyTeamId || null,
              playerId: event.playerId || null,
              timestamp: event.ts || event.$createdAt,
              metadata: event.payloadJson ? JSON.parse(event.payloadJson) : undefined,
            };
            eventsJson.push(eventData);
            
            // If it's a pick event, also add to picksJson
            if (event.type === 'pick' && event.playerId) {
              const pickData: DraftPick = {
                round: event.round || 0,
                pick: event.overall || 0,
                overall: event.overall || 0,
                teamId: event.fantasyTeamId || '',
                playerId: event.playerId,
                timestamp: event.ts || event.$createdAt,
              };
              
              // Extract player info from metadata if available
              if (event.payloadJson) {
                try {
                  const payload = JSON.parse(event.payloadJson);
                  pickData.playerName = payload.playerName;
                  pickData.position = payload.position;
                  pickData.team = payload.team;
                } catch {}
              }
              
              picksJson.push(pickData);
              stateJson.pickedPlayerIds.push(event.playerId);
            }
          }
        }
      } catch (e) {
        console.log('    - No events found');
      }
      
      // Update the draft document with consolidated data
      if (!dryRun) {
        try {
          const updates: any = {
            stateJson: JSON.stringify(stateJson),
            eventsJson: JSON.stringify(eventsJson),
            picksJson: JSON.stringify(picksJson),
          };
          
          if (stateJson.onTheClock) {
            updates.onTheClock = stateJson.onTheClock;
          }
          
          if (stateJson.lastPickTime) {
            updates.lastPickTime = stateJson.lastPickTime;
          }
          
          await databases.updateDocument(
            DATABASE_ID,
            'drafts',
            draft.$id,
            updates
          );
          
          console.log('    ✅ Updated draft with consolidated data');
        } catch (e: any) {
          console.error('    ❌ Failed to update draft:', e.message);
        }
      } else {
        console.log('    📊 Would update with:');
        console.log(`      - ${eventsJson.length} events`);
        console.log(`      - ${picksJson.length} picks`);
        console.log(`      - ${stateJson.pickedPlayerIds.length} picked players`);
      }
    }
    
    // Step 4: Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 CONSOLIDATION SUMMARY\n');
    
    if (dryRun) {
      console.log('DRY RUN COMPLETE - No changes were made');
      console.log('\nTo execute the migration, run without --dry-run flag:');
      console.log('  npx tsx scripts/consolidate-draft-collections.ts');
    } else {
      console.log('✅ Migration complete!');
      console.log('\nNext steps:');
      console.log('1. Update all code to use consolidated drafts collection');
      console.log('2. Test thoroughly');
      console.log('3. Delete old collections (draft_states, draft_events) when ready');
    }
    
    console.log('\n💡 Code changes needed:');
    console.log('- Update draft API routes to read/write consolidated fields');
    console.log('- Update real-time subscriptions to watch single collection');
    console.log('- Update draft room to use picksJson instead of separate queries');
    console.log('- Remove references to draft_states and draft_events collections');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run with --dry-run flag for testing
consolidateDraftCollections();
