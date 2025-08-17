#!/usr/bin/env tsx

/**
 * Validate Current Schema
 * 
 * Instead of trying to add new attributes, this script validates that
 * the current database state matches our expectations and creates
 * a "reality schema" file that reflects what actually exists.
 */

import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';
import { writeFileSync } from 'fs';
import { join } from 'path';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "college-football-fantasy";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project)
  .setKey(apiKey);

const db = new Databases(client);

async function generateRealitySchema(): Promise<void> {
  console.log('🔍 Analyzing current database state...\n');
  
  const collections = await db.listCollections(databaseId);
  const realitySchema: any = {
    version: new Date().toISOString().split('T')[0],
    collections: {}
  };
  
  for (const collection of collections.collections) {
    const collectionData = {
      id: collection.$id,
      name: collection.name,
      documentSecurity: collection.documentSecurity,
      attributes: collection.attributes.map((attr: any) => ({
        key: attr.key,
        type: attr.type,
        size: attr.size,
        required: attr.required,
        default: attr.default,
        array: attr.array
      })),
      indexes: collection.indexes.map((idx: any) => ({
        key: idx.key,
        type: idx.type,
        attributes: idx.attributes,
        orders: idx.orders
      })),
      attributeCount: collection.attributes.length,
      status: collection.attributes.length === 0 ? 'empty' : 'active'
    };
    
    realitySchema.collections[collection.$id] = collectionData;
    
    console.log(`📦 ${collection.name} (${collection.$id})`);
    console.log(`   Attributes: ${collection.attributes.length}`);
    console.log(`   Indexes: ${collection.indexes.length}`);
    console.log(`   Security: ${collection.documentSecurity ? 'Document-level' : 'Collection-level'}`);
    
    if (collection.attributes.length === 0) {
      console.log(`   ⚠️  EMPTY COLLECTION - Consider cleanup`);
    }
    console.log('');
  }
  
  // Write reality schema to file
  const outputPath = join(process.cwd(), 'schema', 'reality-schema.json');
  writeFileSync(outputPath, JSON.stringify(realitySchema, null, 2));
  
  console.log(`💾 Reality schema saved to: ${outputPath}`);
  
  // Summary
  const activeCollections = Object.values(realitySchema.collections).filter((c: any) => c.status === 'active');
  const emptyCollections = Object.values(realitySchema.collections).filter((c: any) => c.status === 'empty');
  
  console.log('\n📊 Database Summary:');
  console.log(`   Active collections: ${activeCollections.length}`);
  console.log(`   Empty collections: ${emptyCollections.length}`);
  
  if (emptyCollections.length > 0) {
    console.log(`   Empty collections to cleanup: ${emptyCollections.map((c: any) => c.id).join(', ')}`);
  }
}

async function main(): Promise<void> {
  console.log('🎯 Database Reality Check');
  console.log('═'.repeat(50));
  
  try {
    await generateRealitySchema();
    
    console.log('\n✅ Analysis complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review reality-schema.json');
    console.log('   2. Update codebase to match reality');
    console.log('   3. Clean up empty collections');
    console.log('   4. Add new features incrementally');
    
  } catch (error: any) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}