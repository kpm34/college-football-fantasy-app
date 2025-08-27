#!/usr/bin/env tsx

/**
 * Fetch all collections, attributes, and indexes from Appwrite
 * Outputs a complete schema audit
 */

import { Client, Databases } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Appwrite client with API key for full access
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

interface CollectionSchema {
  id: string;
  name: string;
  attributes: any[];
  indexes: any[];
  documentSecurity: boolean;
  enabled: boolean;
  $createdAt: string;
  $updatedAt: string;
}

async function fetchAppwriteSchema() {
  try {
    console.log('🔍 Fetching Appwrite schema...\n');
    console.log('📍 Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('🏗️  Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('💾 Database:', DATABASE_ID);
    console.log('\n' + '='.repeat(80) + '\n');

    // Fetch all collections
    const collectionsResponse = await databases.listCollections(DATABASE_ID);
    const collections = collectionsResponse.collections;
    
    console.log(`📚 Found ${collections.length} collections\n`);

    const schemaData: any = {
      database: DATABASE_ID,
      timestamp: new Date().toISOString(),
      collections: []
    };

    // Process each collection
    for (const collection of collections) {
      console.log(`\n📦 Collection: ${collection.name} (${collection.$id})`);
      console.log('─'.repeat(60));
      
      // Fetch collection details including attributes and indexes
      const collectionDetails = await databases.getCollection(DATABASE_ID, collection.$id);
      
      const collectionSchema: any = {
        id: collection.$id,
        name: collection.name,
        enabled: collection.enabled,
        documentSecurity: collection.documentSecurity,
        createdAt: collection.$createdAt,
        updatedAt: collection.$updatedAt,
        attributes: [],
        indexes: []
      };

      // List attributes
      const attributesResponse = await databases.listAttributes(DATABASE_ID, collection.$id);
      console.log(`  📋 Attributes (${attributesResponse.attributes.length}):`);
      
      for (const attr of attributesResponse.attributes) {
        const attrInfo: any = {
          key: attr.key,
          type: attr.type,
          status: attr.status,
          error: attr.error,
          required: attr.required,
        };

        // Add type-specific properties
        if (attr.type === 'string') {
          attrInfo.size = (attr as any).size;
          attrInfo.default = (attr as any).default;
        } else if (attr.type === 'integer' || attr.type === 'double') {
          attrInfo.min = (attr as any).min;
          attrInfo.max = (attr as any).max;
          attrInfo.default = (attr as any).default;
        } else if (attr.type === 'boolean') {
          attrInfo.default = (attr as any).default;
        } else if (attr.type === 'datetime') {
          attrInfo.default = (attr as any).default;
        } else if (attr.type === 'enum') {
          attrInfo.elements = (attr as any).elements;
          attrInfo.default = (attr as any).default;
        }

        collectionSchema.attributes.push(attrInfo);
        
        const required = attr.required ? '✓ required' : '○ optional';
        const defaultVal = (attr as any).default !== undefined ? ` (default: ${(attr as any).default})` : '';
        console.log(`     - ${attr.key}: ${attr.type} [${required}]${defaultVal}`);
      }

      // List indexes
      const indexesResponse = await databases.listIndexes(DATABASE_ID, collection.$id);
      console.log(`\n  🔍 Indexes (${indexesResponse.indexes.length}):`);
      
      for (const index of indexesResponse.indexes) {
        const indexInfo = {
          key: index.key,
          type: index.type,
          status: index.status,
          error: index.error,
          attributes: index.attributes,
          orders: index.orders
        };
        collectionSchema.indexes.push(indexInfo);
        
        console.log(`     - ${index.key}: ${index.type} [${index.attributes.join(', ')}]`);
      }

      schemaData.collections.push(collectionSchema);
    }

    // Save to JSON file
    const outputPath = path.join(process.cwd(), 'schema', 'appwrite-live-schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schemaData, null, 2));
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Schema saved to: ${outputPath}`);

    // Generate summary
    console.log('\n📊 Summary:');
    console.log(`  - Total Collections: ${collections.length}`);
    console.log(`  - Total Attributes: ${schemaData.collections.reduce((sum: number, c: any) => sum + c.attributes.length, 0)}`);
    console.log(`  - Total Indexes: ${schemaData.collections.reduce((sum: number, c: any) => sum + c.indexes.length, 0)}`);
    
    // List collection names
    console.log('\n📝 Collection Names:');
    for (const col of schemaData.collections) {
      console.log(`  - ${col.id}${col.name !== col.id ? ` (${col.name})` : ''}`);
    }

    return schemaData;

  } catch (error: any) {
    console.error('\n❌ Error fetching schema:', error.message);
    if (error.code === 401) {
      console.error('\n🔐 Authentication failed. Please check your APPWRITE_API_KEY in .env.local');
    } else if (error.code === 404) {
      console.error('\n📦 Database not found. Please check DATABASE_ID:', DATABASE_ID);
    }
    process.exit(1);
  }
}

// Run the script
fetchAppwriteSchema().catch(console.error);
