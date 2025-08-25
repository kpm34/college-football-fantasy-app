#!/usr/bin/env npx tsx
/**
 * Create a separate mock_drafts collection for practice drafts
 * This allows mock drafts to work independently without league requirements
 */

import { config } from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';
import { loadEnv } from '@lib/utils/env';

// Load environment variables
loadEnv();

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function createMockDraftsCollection() {
  try {
    console.log('🏗️ Creating mock_drafts collection...');
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      'mock_drafts',
      'Mock Drafts',
      [
        // Basic permissions - anyone can create/read mock drafts
        { 
          permission: 'create',
          target: 'any'
        },
        {
          permission: 'read',
          target: 'any'
        },
        {
          permission: 'update',
          target: 'any'
        },
        {
          permission: 'delete',
          target: 'any'
        }
      ]
    );
    
    console.log('✅ Collection created:', collection.$id);
    
    // Add attributes for mock drafts
    const attributes = [
      { name: 'draftName', type: 'string', size: 255, required: true, default: null },
      { name: 'numTeams', type: 'integer', required: true, default: 8, min: 2, max: 24 },
      { name: 'rounds', type: 'integer', required: true, default: 15, min: 1, max: 25 },
      { name: 'snake', type: 'boolean', required: true, default: true },
      { name: 'status', type: 'string', size: 20, required: true, default: 'waiting' },
      { name: 'startedAt', type: 'datetime', required: false, default: null },
      { name: 'completedAt', type: 'datetime', required: false, default: null },
      { name: 'config', type: 'string', size: 10000, required: false, default: null }, // JSON config
      { name: 'currentPick', type: 'integer', required: false, default: null },
      { name: 'currentRound', type: 'integer', required: false, default: null },
      { name: 'timerPerPickSec', type: 'integer', required: false, default: 0 },
      { name: 'seed', type: 'string', size: 100, required: false, default: null },
      { name: 'createdBy', type: 'string', size: 50, required: false, default: null }, // Optional user ID
      { name: 'lastActivity', type: 'datetime', required: false, default: null }
    ];
    
    for (const attr of attributes) {
      console.log(`Adding attribute: ${attr.name} (${attr.type})`);
      
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'mock_drafts',
            attr.name,
            attr.size!,
            attr.required,
            attr.default as string | undefined
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'mock_drafts',
            attr.name,
            attr.required,
            attr.min,
            attr.max,
            attr.default as number | undefined
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            'mock_drafts',
            attr.name,
            attr.required,
            attr.default as boolean | undefined
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            'mock_drafts',
            attr.name,
            attr.required,
            attr.default as string | undefined
          );
        }
        
        console.log(`✅ Added ${attr.name}`);
      } catch (error: any) {
        if (error?.message?.includes('already exists')) {
          console.log(`⚠️ ${attr.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes for efficient queries
    const indexes = [
      { key: 'status_idx', attributes: ['status'], type: 'key' },
      { key: 'created_idx', attributes: ['startedAt'], type: 'key' },
      { key: 'activity_idx', attributes: ['lastActivity'], type: 'key' }
    ];
    
    for (const index of indexes) {
      try {
        console.log(`Creating index: ${index.key}`);
        await databases.createIndex(
          DATABASE_ID,
          'mock_drafts',
          index.type as any,
          index.key,
          index.attributes
        );
        console.log(`✅ Index created: ${index.key}`);
      } catch (error: any) {
        if (error?.message?.includes('already exists')) {
          console.log(`⚠️ Index ${index.key} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to create index ${index.key}:`, error.message);
        }
      }
    }
    
    console.log('✅ Mock drafts collection setup complete!');
    
    // Create companion collections for participants and picks
    await createMockDraftParticipants();
    await createMockDraftPicks();
    
  } catch (error: any) {
    if (error?.message?.includes('already exists')) {
      console.log('⚠️ Collection already exists, updating attributes...');
      // Collection exists, just ensure attributes are there
      await updateExistingCollection();
    } else {
      console.error('❌ Error creating collection:', error);
      throw error;
    }
  }
}

async function createMockDraftParticipants() {
  try {
    console.log('🏗️ Creating mock_draft_participants collection...');
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      'mock_draft_participants',
      'Mock Draft Participants',
      [
        { permission: 'create', target: 'any' },
        { permission: 'read', target: 'any' },
        { permission: 'update', target: 'any' },
        { permission: 'delete', target: 'any' }
      ]
    );
    
    const attributes = [
      { name: 'draftId', type: 'string', size: 50, required: true },
      { name: 'slot', type: 'integer', required: true, min: 1, max: 24 },
      { name: 'displayName', type: 'string', size: 100, required: true },
      { name: 'userType', type: 'string', size: 10, required: true, default: 'bot' }, // bot or human
      { name: 'userId', type: 'string', size: 50, required: false }, // For human players
      { name: 'teamNeeds', type: 'string', size: 5000, required: false }, // JSON
      { name: 'strategy', type: 'string', size: 20, required: false, default: 'balanced' }
    ];
    
    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          'mock_draft_participants',
          attr.name,
          attr.size!,
          attr.required,
          attr.default as string | undefined
        );
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          'mock_draft_participants',
          attr.name,
          attr.required,
          attr.min,
          attr.max
        );
      }
    }
    
    // Create indexes
    await databases.createIndex(DATABASE_ID, 'mock_draft_participants', 'key', 'draft_idx', ['draftId']);
    await databases.createIndex(DATABASE_ID, 'mock_draft_participants', 'unique', 'draft_slot_unique', ['draftId', 'slot']);
    
    console.log('✅ Mock draft participants collection created');
  } catch (error: any) {
    if (error?.message?.includes('already exists')) {
      console.log('⚠️ Participants collection already exists');
    } else {
      console.error('Error:', error);
    }
  }
}

async function createMockDraftPicks() {
  try {
    console.log('🏗️ Creating mock_draft_picks collection...');
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      'mock_draft_picks',
      'Mock Draft Picks',
      [
        { permission: 'create', target: 'any' },
        { permission: 'read', target: 'any' },
        { permission: 'update', target: 'any' },
        { permission: 'delete', target: 'any' }
      ]
    );
    
    const attributes = [
      { name: 'draftId', type: 'string', size: 50, required: true },
      { name: 'participantId', type: 'string', size: 50, required: true },
      { name: 'playerId', type: 'string', size: 50, required: true },
      { name: 'playerName', type: 'string', size: 100, required: true },
      { name: 'position', type: 'string', size: 10, required: true },
      { name: 'team', type: 'string', size: 50, required: true },
      { name: 'round', type: 'integer', required: true, min: 1, max: 25 },
      { name: 'pick', type: 'integer', required: true, min: 1, max: 600 },
      { name: 'overall', type: 'integer', required: true, min: 1, max: 600 },
      { name: 'timestamp', type: 'datetime', required: true }
    ];
    
    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          'mock_draft_picks',
          attr.name,
          attr.size!,
          attr.required
        );
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          'mock_draft_picks',
          attr.name,
          attr.required,
          attr.min,
          attr.max
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          'mock_draft_picks',
          attr.name,
          attr.required
        );
      }
    }
    
    // Create indexes
    await databases.createIndex(DATABASE_ID, 'mock_draft_picks', 'key', 'draft_idx', ['draftId']);
    await databases.createIndex(DATABASE_ID, 'mock_draft_picks', 'key', 'participant_idx', ['participantId']);
    await databases.createIndex(DATABASE_ID, 'mock_draft_picks', 'unique', 'draft_overall_unique', ['draftId', 'overall']);
    
    console.log('✅ Mock draft picks collection created');
  } catch (error: any) {
    if (error?.message?.includes('already exists')) {
      console.log('⚠️ Picks collection already exists');
    } else {
      console.error('Error:', error);
    }
  }
}

async function updateExistingCollection() {
  // This function would update an existing collection with missing attributes
  console.log('Updating existing mock_drafts collection...');
  // Implementation would go here if needed
}

// Run the script
createMockDraftsCollection()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
