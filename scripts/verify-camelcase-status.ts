#!/usr/bin/env tsx
/**
 * Script to verify which attributes in Appwrite are still snake_case
 * and need to be updated to camelCase
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

interface AttributeStatus {
  collection: string;
  collectionId: string;
  attribute: string;
  type: string;
  isSnakeCase: boolean;
  suggestedCamelCase?: string;
}

interface IndexStatus {
  collection: string;
  collectionId: string;
  indexKey: string;
  attributes: string[];
  snakeCaseFields: string[];
  suggestedCamelCase: Record<string, string>;
}

function isSnakeCase(str: string): boolean {
  // Check if string contains underscore and is lowercase
  return str.includes('_') && str === str.toLowerCase();
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

async function checkAttributes(): Promise<AttributeStatus[]> {
  const results: AttributeStatus[] = [];
  
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    
    for (const collection of collections.collections) {
      console.log(`\nChecking collection: ${collection.name} (${collection.$id})`);
      
      // Get attributes for this collection
      const attributes = await databases.listAttributes(DATABASE_ID, collection.$id);
      
      for (const attr of attributes.attributes) {
        const status: AttributeStatus = {
          collection: collection.name,
          collectionId: collection.$id,
          attribute: attr.key,
          type: attr.type,
          isSnakeCase: isSnakeCase(attr.key)
        };
        
        if (status.isSnakeCase) {
          status.suggestedCamelCase = toCamelCase(attr.key);
          console.log(`  ⚠️  Snake case: ${attr.key} → ${status.suggestedCamelCase}`);
        }
        
        results.push(status);
      }
    }
  } catch (error) {
    console.error('Error fetching attributes:', error);
  }
  
  return results;
}

async function checkIndexes(): Promise<IndexStatus[]> {
  const results: IndexStatus[] = [];
  
  try {
    const collections = await databases.listCollections(DATABASE_ID);
    
    for (const collection of collections.collections) {
      // Get indexes for this collection
      const indexes = await databases.listIndexes(DATABASE_ID, collection.$id);
      
      for (const index of indexes.indexes) {
        const snakeCaseFields: string[] = [];
        const suggestedCamelCase: Record<string, string> = {};
        
        for (const attr of index.attributes) {
          if (isSnakeCase(attr)) {
            snakeCaseFields.push(attr);
            suggestedCamelCase[attr] = toCamelCase(attr);
          }
        }
        
        if (snakeCaseFields.length > 0) {
          results.push({
            collection: collection.name,
            collectionId: collection.$id,
            indexKey: index.key,
            attributes: index.attributes,
            snakeCaseFields,
            suggestedCamelCase
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching indexes:', error);
  }
  
  return results;
}

async function main() {
  console.log('🔍 Verifying CamelCase Status in Appwrite Database\n');
  console.log('Database:', DATABASE_ID);
  console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  console.log('=' .repeat(60));
  
  // Check attributes
  console.log('\n📋 CHECKING ATTRIBUTES');
  console.log('=' .repeat(60));
  const attributeResults = await checkAttributes();
  
  // Summary of attributes
  const snakeCaseAttributes = attributeResults.filter(a => a.isSnakeCase);
  const groupedByCollection: Record<string, AttributeStatus[]> = {};
  
  for (const attr of snakeCaseAttributes) {
    if (!groupedByCollection[attr.collection]) {
      groupedByCollection[attr.collection] = [];
    }
    groupedByCollection[attr.collection].push(attr);
  }
  
  console.log('\n\n📊 ATTRIBUTE SUMMARY');
  console.log('=' .repeat(60));
  
  if (snakeCaseAttributes.length === 0) {
    console.log('✅ All attributes are already in camelCase!');
  } else {
    console.log(`Found ${snakeCaseAttributes.length} snake_case attributes across ${Object.keys(groupedByCollection).length} collections:\n`);
    
    for (const [collection, attrs] of Object.entries(groupedByCollection)) {
      console.log(`\n${collection}:`);
      console.log('-'.repeat(40));
      for (const attr of attrs) {
        console.log(`  ${attr.attribute} → ${attr.suggestedCamelCase} (${attr.type})`);
      }
    }
  }
  
  // Check indexes
  console.log('\n\n📋 CHECKING INDEXES');
  console.log('=' .repeat(60));
  const indexResults = await checkIndexes();
  
  console.log('\n📊 INDEX SUMMARY');
  console.log('=' .repeat(60));
  
  if (indexResults.length === 0) {
    console.log('✅ All indexes are using camelCase fields!');
  } else {
    console.log(`Found ${indexResults.length} indexes with snake_case fields:\n`);
    
    for (const index of indexResults) {
      console.log(`\n${index.collection} - Index: ${index.indexKey}`);
      console.log('-'.repeat(40));
      console.log(`  Fields: ${index.attributes.join(', ')}`);
      console.log(`  Snake case fields to fix:`);
      for (const [snake, camel] of Object.entries(index.suggestedCamelCase)) {
        console.log(`    ${snake} → ${camel}`);
      }
    }
  }
  
  // Create update script
  if (snakeCaseAttributes.length > 0) {
    console.log('\n\n📝 MIGRATION SCRIPT');
    console.log('=' .repeat(60));
    console.log('To update these attributes, you would need to:');
    console.log('1. Create new camelCase attributes');
    console.log('2. Copy data from snake_case to camelCase');
    console.log('3. Update all code references');
    console.log('4. Delete old snake_case attributes');
    console.log('\nHere are the attributes that need updating:\n');
    
    // Group by collection for easier migration
    for (const [collection, attrs] of Object.entries(groupedByCollection)) {
      console.log(`\n// Collection: ${collection}`);
      console.log(`const ${collection.replace(/\s+/g, '_').toLowerCase()}_updates = [`);
      for (const attr of attrs) {
        console.log(`  { old: '${attr.attribute}', new: '${attr.suggestedCamelCase}', type: '${attr.type}' },`);
      }
      console.log(`];`);
    }
  }
  
  console.log('\n\n✅ Verification complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
