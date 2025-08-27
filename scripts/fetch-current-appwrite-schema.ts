#!/usr/bin/env tsx
/**
 * Fetch current Appwrite schema and update documentation
 */

const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const { writeFileSync } = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('Error: APPWRITE_API_KEY not found in environment variables');
  process.exit(1);
}

async function fetchSchema() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT)
    .setKey(API_KEY);
  
  const databases = new Databases(client);
  
  try {
    console.log('Fetching database schema from Appwrite...\n');
    
    // Get all collections
    const collections = await databases.listCollections(DATABASE_ID);
    
    const schemaData: any = {
      database: DATABASE_ID,
      endpoint: APPWRITE_ENDPOINT,
      project: APPWRITE_PROJECT,
      timestamp: new Date().toISOString(),
      collections: {}
    };
    
    // For each collection, get detailed info
    for (const collection of collections.collections) {
      console.log(`Fetching collection: ${collection.name} (${collection.$id})`);
      
      // Get full collection details including attributes and indexes
      const fullCollection = await databases.getCollection(
        DATABASE_ID,
        collection.$id
      );
      
      schemaData.collections[collection.$id] = {
        name: collection.name,
        id: collection.$id,
        enabled: collection.enabled,
        documentSecurity: collection.documentSecurity,
        attributes: fullCollection.attributes.map((attr: any) => ({
          key: attr.key,
          type: attr.type,
          status: attr.status,
          error: attr.error,
          required: attr.required,
          array: attr.array || false,
          size: attr.size,
          default: attr.default,
          min: attr.min,
          max: attr.max,
          format: attr.format,
          elements: attr.elements,
          relatedCollection: attr.relatedCollection,
          relationType: attr.relationType,
          twoWay: attr.twoWay,
          twoWayKey: attr.twoWayKey,
          onDelete: attr.onDelete,
          side: attr.side
        })),
        indexes: fullCollection.indexes.map((index: any) => ({
          key: index.key,
          type: index.type,
          status: index.status,
          error: index.error,
          attributes: index.attributes,
          orders: index.orders
        }))
      };
    }
    
    // Save to file
    const outputPath = path.join(process.cwd(), 'schema', 'appwrite-current-schema.json');
    writeFileSync(outputPath, JSON.stringify(schemaData, null, 2));
    console.log(`\n✅ Schema saved to: ${outputPath}`);
    
    // Generate a markdown table for quick reference
    let markdown = '# Current Appwrite Schema\n\n';
    markdown += `**Database:** ${DATABASE_ID}\n`;
    markdown += `**Updated:** ${new Date().toISOString()}\n\n`;
    
    for (const [collectionId, collection] of Object.entries(schemaData.collections as any)) {
      markdown += `## ${collection.name} (${collectionId})\n\n`;
      markdown += '### Attributes\n\n';
      markdown += '| Key | Type | Required | Default | Size | Status |\n';
      markdown += '|-----|------|----------|---------|------|--------|\n';
      
      for (const attr of collection.attributes) {
        const required = attr.required ? '✅' : '❌';
        const defaultVal = attr.default !== undefined ? `\`${attr.default}\`` : '-';
        const size = attr.size || '-';
        const status = attr.status === 'available' ? '✅' : attr.status;
        markdown += `| ${attr.key} | ${attr.type} | ${required} | ${defaultVal} | ${size} | ${status} |\n`;
      }
      
      if (collection.indexes.length > 0) {
        markdown += '\n### Indexes\n\n';
        markdown += '| Key | Type | Attributes | Status |\n';
        markdown += '|-----|------|------------|--------|\n';
        
        for (const index of collection.indexes) {
          const status = index.status === 'available' ? '✅' : index.status;
          markdown += `| ${index.key} | ${index.type} | ${index.attributes.join(', ')} | ${status} |\n`;
        }
      }
      
      markdown += '\n---\n\n';
    }
    
    const mdPath = path.join(process.cwd(), 'schema', 'CURRENT_APPWRITE_SCHEMA.md');
    writeFileSync(mdPath, markdown);
    console.log(`✅ Markdown documentation saved to: ${mdPath}`);
    
    // Print summary
    console.log('\n📊 Schema Summary:');
    console.log(`   Total Collections: ${Object.keys(schemaData.collections).length}`);
    
    for (const [id, col] of Object.entries(schemaData.collections as any)) {
      console.log(`   - ${col.name}: ${col.attributes.length} attributes, ${col.indexes.length} indexes`);
    }
    
    return schemaData;
    
  } catch (error: any) {
    console.error('Error fetching schema:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Run the script
fetchSchema()
  .then(() => {
    console.log('\n✨ Schema fetch complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
