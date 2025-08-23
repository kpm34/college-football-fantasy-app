#!/usr/bin/env tsx
import { Client, Databases } from 'node-appwrite';
import { writeFileSync } from 'fs';
import { join } from 'path';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

async function main() {
  console.log('Exporting current Appwrite schema...\n');
  
  // Get all collections
  const collectionsResponse = await databases.listCollections(dbId);
  const collections = collectionsResponse.collections;
  
  console.log(`Found ${collections.length} collections\n`);
  
  const schema: any[] = [];
  
  for (const collection of collections) {
    console.log(`Processing: ${collection.$id}`);
    
    // Get full collection details
    const fullCollection = await databases.getCollection(dbId, collection.$id);
    
    const collectionSchema = {
      id: fullCollection.$id,
      name: fullCollection.name,
      enabled: fullCollection.enabled,
      documentSecurity: fullCollection.documentSecurity,
      attributes: fullCollection.attributes.map((attr: any) => ({
        key: attr.key,
        type: attr.type,
        status: attr.status,
        error: attr.error,
        required: attr.required,
        array: attr.array,
        size: attr.size,
        default: attr.default,
        min: attr.min,
        max: attr.max,
        elements: attr.elements,
        format: attr.format,
        relatedCollection: attr.relatedCollection,
        relationType: attr.relationType,
        twoWay: attr.twoWay,
        twoWayKey: attr.twoWayKey,
        onDelete: attr.onDelete,
        side: attr.side
      })),
      indexes: fullCollection.indexes.map((idx: any) => ({
        key: idx.key,
        type: idx.type,
        status: idx.status,
        error: idx.error,
        attributes: idx.attributes,
        orders: idx.orders
      }))
    };
    
    schema.push(collectionSchema);
  }
  
  // Sort by collection ID for consistency
  schema.sort((a, b) => a.id.localeCompare(b.id));
  
  // Write to file
  const outputPath = join(process.cwd(), 'schema', 'appwrite-current-schema.json');
  writeFileSync(outputPath, JSON.stringify(schema, null, 2));
  
  console.log(`\n✅ Schema exported to: ${outputPath}`);
  
  // Generate summary
  console.log('\n=== Collection Summary ===\n');
  for (const coll of schema) {
    console.log(`${coll.id}: ${coll.attributes.length} attributes, ${coll.indexes.length} indexes`);
  }
  
  // Check for snake_case compliance
  console.log('\n=== Snake Case Compliance ===\n');
  let nonCompliant = 0;
  
  for (const coll of schema) {
    for (const attr of coll.attributes) {
      if (attr.key !== attr.key.toLowerCase() || attr.key.includes('Id') && !attr.key.includes('_id')) {
        console.log(`⚠️  ${coll.id}.${attr.key} - not snake_case`);
        nonCompliant++;
      }
    }
  }
  
  if (nonCompliant === 0) {
    console.log('✅ All attributes use snake_case!');
  } else {
    console.log(`\n⚠️  Found ${nonCompliant} non-snake_case attributes`);
  }
}

main().catch(console.error);
