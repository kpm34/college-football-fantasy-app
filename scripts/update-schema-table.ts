#!/usr/bin/env npx tsx
/**
 * Export Appwrite schema to Schema Table.csv
 */

import { config } from 'dotenv';
import { Client, Databases } from 'node-appwrite';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function exportSchema() {
  try {
    console.log('🔍 Fetching collections from Appwrite...');
    
    // Get all collections
    const collectionsResponse = await databases.listCollections(DATABASE_ID);
    const collections = collectionsResponse.collections;
    
    console.log(`📊 Found ${collections.length} collections`);
    
    // Build CSV content
    const csvRows: string[] = ['"collection","attributes","indexes"'];
    
    for (const collection of collections) {
      console.log(`  Processing ${collection.name}...`);
      
      // Get attributes
      const attributesResponse = await databases.listAttributes(DATABASE_ID, collection.$id);
      const attributes = attributesResponse.attributes;
      
      // Get indexes
      const indexesResponse = await databases.listIndexes(DATABASE_ID, collection.$id);
      const indexes = indexesResponse.indexes;
      
      // Format attributes
      const attributeStrings = attributes.map((attr: any) => {
        let str = `${attr.key}:${attr.type}`;
        if (attr.required) str += '|required';
        else str += '|optional';
        if (attr.default !== undefined && attr.default !== null) {
          str += `|${attr.default}`;
        } else {
          str += '|';
        }
        return str;
      });
      
      // Format indexes
      const indexStrings = indexes.map((idx: any) => {
        const attrs = idx.attributes.join('|');
        const type = idx.type === 'unique' ? 'unique' : idx.type === 'fulltext' ? 'fulltext' : 'normal';
        return `${idx.key}(${idx.type}):[${attrs}] ${type}`;
      });
      
      // Add row to CSV
      const row = [
        `"${collection.$id}"`,
        `"${attributeStrings.join('; ')}"`,
        `"${indexStrings.join('; ')}"`
      ].join(',');
      
      csvRows.push(row);
    }
    
    // Write to file
    const csvContent = csvRows.join('\n');
    const outputPath = join(process.cwd(), 'schema', 'Schema Table.csv');
    writeFileSync(outputPath, csvContent, 'utf-8');
    
    console.log(`✅ Schema exported to ${outputPath}`);
    console.log(`📝 ${collections.length} collections exported`);
    
    // Also update the docs copy
    const docsPath = join(process.cwd(), 'docs', 'AppwriteSchema_8_24.csv');
    writeFileSync(docsPath, csvContent, 'utf-8');
    console.log(`📄 Also updated ${docsPath}`);
    
  } catch (error) {
    console.error('❌ Error exporting schema:', error);
    process.exit(1);
  }
}

exportSchema();

