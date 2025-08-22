#!/usr/bin/env ts-node

/**
 * Fetch current Appwrite database schema
 * Compare with zod-schema.ts and identify differences
 */

import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';

interface AttributeInfo {
  key: string;
  type: string;
  required: boolean;
  array: boolean;
  size?: number;
  min?: any;
  max?: any;
  elements?: string[];
  format?: string;
  default?: any;
}

interface CollectionInfo {
  $id: string;
  name: string;
  enabled: boolean;
  attributes: AttributeInfo[];
  indexes: Array<{
    key: string;
    type: string;
    status: string;
    attributes: string[];
  }>;
}

async function fetchCollectionSchema(collectionId: string): Promise<CollectionInfo | null> {
  try {
    console.log(`Fetching schema for collection: ${collectionId}`);
    const collection = await databases.getCollection(DATABASE_ID, collectionId);
    
    return {
      $id: collection.$id,
      name: collection.name,
      enabled: collection.enabled,
      attributes: collection.attributes.map(attr => ({
        key: attr.key,
        type: attr.type,
        required: attr.required,
        array: attr.array,
        size: attr.size,
        min: attr.min,
        max: attr.max,
        elements: attr.elements,
        format: attr.format,
        default: attr.default
      })),
      indexes: collection.indexes.map(index => ({
        key: index.key,
        type: index.type,
        status: index.status,
        attributes: index.attributes
      }))
    };
    
  } catch (error) {
    console.warn(`Failed to fetch ${collectionId}:`, error);
    return null;
  }
}

async function getAllCollections(): Promise<string[]> {
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    return collections.collections.map(c => c.$id);
  } catch (error) {
    console.error('Failed to list collections:', error);
    return [];
  }
}

function generateZodSchema(collection: CollectionInfo): string {
  const attributes = collection.attributes;
  let schema = `export const ${toPascalCase(collection.$id)} = z.object({\n`;
  
  attributes.forEach(attr => {
    const zodType = mapAppwriteTypeToZod(attr);
    schema += `  ${attr.key}: ${zodType},\n`;
  });
  
  schema += '});';
  return schema;
}

function toPascalCase(str: string): string {
  return str.replace(/(^|_)([a-z])/g, (match, p1, p2) => p2.toUpperCase());
}

function mapAppwriteTypeToZod(attr: AttributeInfo): string {
  let zodType = '';
  
  switch (attr.type) {
    case 'string':
      zodType = 'z.string()';
      if (attr.min) zodType += `.min(${attr.min})`;
      if (attr.max || attr.size) zodType += `.max(${attr.max || attr.size})`;
      if (attr.elements && attr.elements.length > 0) {
        const enumValues = attr.elements.map(e => `'${e}'`).join(', ');
        zodType = `z.enum([${enumValues}])`;
      }
      if (attr.format === 'email') zodType += '.email()';
      if (attr.format === 'url') zodType += '.url()';
      break;
      
    case 'integer':
      zodType = 'z.number().int()';
      if (attr.min !== undefined) zodType += `.min(${attr.min})`;
      if (attr.max !== undefined) zodType += `.max(${attr.max})`;
      break;
      
    case 'double':
      zodType = 'z.number()';
      if (attr.min !== undefined) zodType += `.min(${attr.min})`;
      if (attr.max !== undefined) zodType += `.max(${attr.max})`;
      break;
      
    case 'boolean':
      zodType = 'z.boolean()';
      break;
      
    case 'datetime':
      zodType = 'z.date()';
      break;
      
    default:
      zodType = 'z.string()'; // fallback
  }
  
  if (attr.array) {
    zodType = `z.array(${zodType})`;
  }
  
  if (!attr.required) {
    zodType += '.optional()';
  }
  
  if (attr.default !== undefined && attr.default !== null) {
    if (typeof attr.default === 'string') {
      zodType += `.default('${attr.default}')`;
    } else if (typeof attr.default === 'boolean') {
      zodType += `.default(${attr.default})`;
    } else if (typeof attr.default === 'number') {
      zodType += `.default(${attr.default})`;
    }
  }
  
  return zodType;
}

async function main() {
  console.log('🔍 Fetching current Appwrite database schema...\n');
  
  // Get all collections
  const allCollectionIds = await getAllCollections();
  console.log(`Found ${allCollectionIds.length} collections:`, allCollectionIds);
  
  // Focus on key collections that we know exist
  const keyCollections = [
    'college_players',
    'leagues', 
    'user_teams',
    'mock_drafts',
    'games',
    'rankings',
    'auctions',
    'bids',
    'player_stats',
    'lineups',
    'activity_log',
    'draft_picks',
    'model_inputs'
  ];
  
  const schemas: Record<string, CollectionInfo> = {};
  
  for (const collectionId of keyCollections) {
    if (allCollectionIds.includes(collectionId)) {
      const schema = await fetchCollectionSchema(collectionId);
      if (schema) {
        schemas[collectionId] = schema;
      }
    } else {
      console.warn(`❌ Collection ${collectionId} not found in database`);
    }
  }
  
  // Output current schema summary
  console.log('\n📋 Current Database Schema Summary:');
  console.log('=' .repeat(50));
  
  for (const [collectionId, schema] of Object.entries(schemas)) {
    console.log(`\n📂 Collection: ${collectionId}`);
    console.log(`   Name: ${schema.name}`);
    console.log(`   Enabled: ${schema.enabled}`);
    console.log(`   Attributes (${schema.attributes.length}):`);
    
    const requiredAttrs = schema.attributes.filter(a => a.required);
    const optionalAttrs = schema.attributes.filter(a => !a.required);
    
    console.log(`     Required (${requiredAttrs.length}): ${requiredAttrs.map(a => a.key).join(', ')}`);
    console.log(`     Optional (${optionalAttrs.length}): ${optionalAttrs.map(a => a.key).join(', ')}`);
    
    if (schema.indexes.length > 0) {
      console.log(`   Indexes (${schema.indexes.length}): ${schema.indexes.map(i => i.key).join(', ')}`);
    }
  }
  
  // Generate updated Zod schemas
  console.log('\n🔧 Generated Zod Schemas:');
  console.log('=' .repeat(50));
  
  for (const [collectionId, schema] of Object.entries(schemas)) {
    console.log(`\n// ${schema.name} Collection`);
    console.log(generateZodSchema(schema));
  }
  
  // Check for missing collections in our zod-schema.ts
  console.log('\n🔍 Schema Comparison:');
  console.log('=' .repeat(50));
  
  const zodCollections = [
    'college_players', 'teams', 'games', 'rankings', 'leagues', 
    'user_teams', 'lineups', 'auctions', 'bids', 'player_stats',
    'activity_log', 'draft_picks', 'mock_drafts', 'mock_draft_picks',
    'mock_draft_participants'
  ];
  
  const missingInZod = allCollectionIds.filter(id => !zodCollections.includes(id));
  const missingInDB = zodCollections.filter(id => !allCollectionIds.includes(id));
  
  if (missingInZod.length > 0) {
    console.log(`❌ Collections in DB but missing in zod-schema.ts: ${missingInZod.join(', ')}`);
  }
  
  if (missingInDB.length > 0) {
    console.log(`❌ Collections in zod-schema.ts but missing in DB: ${missingInDB.join(', ')}`);
  }
  
  if (missingInZod.length === 0 && missingInDB.length === 0) {
    console.log('✅ All collections are properly synchronized');
  }
}

if (require.main === module) {
  main().catch(console.error);
}