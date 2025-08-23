#!/usr/bin/env npx tsx

/**
 * Mock Draft Schema Bootstrap
 * Creates mock draft collections if they don't exist (idempotent)
 */

import { serverDatabases as databases, DATABASE_ID } from '../../../../lib/appwrite-server';
import { ID } from 'node-appwrite';

interface CollectionSchema {
  id: string;
  name: string;
  attributes: Array<{
    key: string;
    type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'email' | 'enum' | 'url' | 'ip' | 'json';
    size?: number;
    required: boolean;
    default?: any;
    elements?: string[];
    array?: boolean;
  }>;
  indexes: Array<{
    key: string;
    type: 'key' | 'fulltext' | 'unique';
    attributes: string[];
  }>;
}

const COLLECTIONS: CollectionSchema[] = [
  {
    id: 'mock_drafts',
    name: 'Mock Drafts',
    attributes: [
      { key: 'leagueId', type: 'string', size: 255, required: false },
      { key: 'draftName', type: 'string', size: 255, required: true },
      { key: 'numTeams', type: 'integer', required: true },
      { key: 'rounds', type: 'integer', required: true },
      { key: 'snake', type: 'boolean', required: true },
      // Align with engine.ts which uses 'waiting' initially
      { key: 'status', type: 'enum', required: true, elements: ['waiting', 'active', 'complete', 'failed'] },
      { key: 'startedAt', type: 'datetime', required: false },
      { key: 'completedAt', type: 'datetime', required: false },
      { key: 'config', type: 'json', required: false }
    ],
    indexes: [
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'startedAt_idx', type: 'key', attributes: ['startedAt'] }
    ]
  },
  {
    id: 'mock_draft_participants',
    name: 'Mock Draft Participants',
    attributes: [
      { key: 'draftId', type: 'string', size: 255, required: true },
      // Allow converting bot seats to human via join route
      { key: 'userType', type: 'enum', required: true, elements: ['bot', 'human'] },
      { key: 'displayName', type: 'string', size: 255, required: true },
      { key: 'slot', type: 'integer', required: true }
    ],
    indexes: [
      { key: 'draftId_idx', type: 'key', attributes: ['draftId'] },
      { key: 'slot_unique', type: 'unique', attributes: ['draftId', 'slot'] }
    ]
  },
  {
    id: 'mock_draft_picks',
    name: 'Mock Draft Picks',
    attributes: [
      { key: 'draftId', type: 'string', size: 255, required: true },
      { key: 'round', type: 'integer', required: true },
      { key: 'overall', type: 'integer', required: true },
      { key: 'slot', type: 'integer', required: true },
      { key: 'participantId', type: 'string', size: 255, required: true },
      { key: 'playerId', type: 'string', size: 255, required: true },
      // Optional denormalization field was removed; UI derives name client-side
      { key: 'pickedAt', type: 'datetime', required: true },
      { key: 'autopick', type: 'boolean', required: true }
    ],
    indexes: [
      { key: 'draftId_idx', type: 'key', attributes: ['draftId'] },
      { key: 'overall_unique', type: 'unique', attributes: ['draftId', 'overall'] }
    ]
  }
];

async function ensureCollection(collection: CollectionSchema): Promise<void> {
  try {
    console.log(`🔍 Checking collection: ${collection.name} (${collection.id})`);
    
    // Try to get the collection first
    try {
      await databases.getCollection(DATABASE_ID, collection.id);
      console.log(`✅ Collection ${collection.name} already exists`);
      return;
    } catch (error: any) {
      if (!error.message?.includes('not found') && error.type !== 'collection_not_found') {
        throw error;
      }
      // Collection doesn't exist, create it
    }

    console.log(`📝 Creating collection: ${collection.name}`);
    
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      collection.id,
      collection.name,
      undefined, // permissions (use default)
      false, // documentSecurity
      true // enabled
    );

    // Add attributes
    for (const attr of collection.attributes) {
      console.log(`  📋 Adding attribute: ${attr.key} (${attr.type})`);
      
      try {
        switch (attr.type) {
          case 'string':
            await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.size || 255,
              attr.required,
              attr.default,
              attr.array || false
            );
            break;
          
          case 'integer':
            await databases.createIntegerAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              undefined, // min
              undefined, // max
              attr.default,
              attr.array || false
            );
            break;
          
          case 'boolean':
            await databases.createBooleanAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.default,
              attr.array || false
            );
            break;
          
          case 'datetime':
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.default,
              attr.array || false
            );
            break;
          
          case 'enum':
            await databases.createEnumAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.elements || [],
              attr.required,
              attr.default,
              attr.array || false
            );
            break;
          
          case 'json':
            // JSON attributes don't have a direct method, using string with large size
            await databases.createStringAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              8192, // Large size for JSON
              attr.required,
              attr.default,
              attr.array || false
            );
            break;
        }
      } catch (attrError: any) {
        if (attrError.message?.includes('already exists')) {
          console.log(`    ⚠️ Attribute ${attr.key} already exists, skipping`);
        } else {
          throw attrError;
        }
      }
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Add indexes
    for (const index of collection.indexes) {
      console.log(`  📚 Adding index: ${index.key}`);
      
      try {
        await databases.createIndex(
          DATABASE_ID,
          collection.id,
          index.key,
          index.type,
          index.attributes,
          undefined // orders
        );
      } catch (indexError: any) {
        if (indexError.message?.includes('already exists')) {
          console.log(`    ⚠️ Index ${index.key} already exists, skipping`);
        } else {
          throw indexError;
        }
      }
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Collection ${collection.name} created successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to ensure collection ${collection.name}:`, error);
    throw error;
  }
}

async function ensureMockDraftSchema(): Promise<void> {
  console.log('🚀 ENSURING MOCK DRAFT SCHEMA');
  console.log('===============================\n');

  try {
    // Validate database connection
    console.log('🔗 Validating database connection...');
    await databases.get(DATABASE_ID);
    console.log('✅ Database connection valid\n');

    // Create collections
    for (const collection of COLLECTIONS) {
      await ensureCollection(collection);
      console.log(''); // Add spacing between collections
    }

    console.log('🎉 MOCK DRAFT SCHEMA READY!');
    console.log('===========================');
    console.log('✅ All collections and indexes created/verified');
    console.log('✅ Ready for mock draft operations\n');

  } catch (error) {
    console.error('❌ Schema creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  ensureMockDraftSchema().catch(console.error);
}

export { ensureMockDraftSchema };