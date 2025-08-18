#!/usr/bin/env tsx
/**
 * Complete Database Export to JSON
 * 
 * Exports all collections from the Appwrite database to structured JSON files
 * Creates both individual collection files and a complete backup
 */

import { Client, Databases } from 'node-appwrite';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

interface CollectionExport {
  collectionId: string;
  collectionName: string;
  documentCount: number;
  documents: any[];
}

interface DatabaseExport {
  exportMetadata: {
    timestamp: string;
    database: string;
    project: string;
    totalCollections: number;
    totalDocuments: number;
    source: string;
    version: string;
  };
  collections: CollectionExport[];
}

async function exportCollection(databases: Databases, collectionId: string): Promise<CollectionExport> {
  console.log(`📊 Exporting collection: ${collectionId}`);
  
  const allDocuments: any[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [],
        limit,
        offset
      );

      allDocuments.push(...response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;

      if (response.documents.length > 0) {
        console.log(`  ✓ Batch: ${response.documents.length} documents (total: ${allDocuments.length})`);
      }
    } catch (error: any) {
      if (error.message?.includes('Collection with the requested ID could not be found')) {
        console.log(`  ⚠️ Collection not found: ${collectionId} (skipping)`);
        break;
      } else {
        console.error(`  ❌ Error fetching ${collectionId}:`, error.message);
        break;
      }
    }
  }

  return {
    collectionId,
    collectionName: collectionId,
    documentCount: allDocuments.length,
    documents: allDocuments
  };
}

async function exportCompleteDatabase(): Promise<DatabaseExport> {
  console.log('🗄️ Complete Database Export');
  console.log('===========================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const collections: CollectionExport[] = [];
    const collectionIds = Object.values(COLLECTIONS);

    console.log(`📋 Exporting ${collectionIds.length} collections from SSOT schema`);

    // Export each collection
    for (const collectionId of collectionIds) {
      const collectionData = await exportCollection(databases, collectionId);
      collections.push(collectionData);
    }

    // Calculate totals
    const totalDocuments = collections.reduce((sum, col) => sum + col.documentCount, 0);
    const activeCollections = collections.filter(col => col.documentCount > 0);

    console.log(`\n📊 Export Summary:`);
    console.log(`✅ Collections processed: ${collections.length}`);
    console.log(`📋 Collections with data: ${activeCollections.length}`);
    console.log(`📄 Total documents: ${totalDocuments}`);

    // Create complete export
    const databaseExport: DatabaseExport = {
      exportMetadata: {
        timestamp: new Date().toISOString(),
        database: DATABASE_ID,
        project: APPWRITE_PROJECT_ID,
        totalCollections: activeCollections.length,
        totalDocuments,
        source: `${APPWRITE_ENDPOINT}/${APPWRITE_PROJECT_ID}/${DATABASE_ID}`,
        version: '1.0.0-SSOT'
      },
      collections: activeCollections
    };

    return databaseExport;

  } catch (error: any) {
    console.error('❌ Database export failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const databaseExport = await exportCompleteDatabase();
    
    // Ensure exports directory exists
    const exportsDir = join(process.cwd(), 'exports');
    if (!existsSync(exportsDir)) {
      mkdirSync(exportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

    // Write complete database backup
    const completeFilename = `complete-database-${timestamp}.json`;
    const completeFilepath = join(exportsDir, completeFilename);
    writeFileSync(completeFilepath, JSON.stringify(databaseExport, null, 2), 'utf-8');

    // Write individual collection files
    const collectionDir = join(exportsDir, `collections-${timestamp}`);
    if (!existsSync(collectionDir)) {
      mkdirSync(collectionDir, { recursive: true });
    }

    for (const collection of databaseExport.collections) {
      if (collection.documentCount > 0) {
        const collectionFile = join(collectionDir, `${collection.collectionId}.json`);
        const collectionData = {
          metadata: {
            collectionId: collection.collectionId,
            documentCount: collection.documentCount,
            exportedAt: databaseExport.exportMetadata.timestamp
          },
          documents: collection.documents
        };
        writeFileSync(collectionFile, JSON.stringify(collectionData, null, 2), 'utf-8');
      }
    }

    console.log('\n📁 Export Files Created:');
    console.log('========================');
    console.log(`📦 Complete backup: ${completeFilepath}`);
    console.log(`📂 Individual collections: ${collectionDir}/`);
    console.log(`📏 Total size: ${(JSON.stringify(databaseExport).length / 1024).toFixed(2)} KB`);

    // Show collection breakdown
    console.log('\n📋 Collection Breakdown:');
    databaseExport.collections
      .filter(col => col.documentCount > 0)
      .sort((a, b) => b.documentCount - a.documentCount)
      .forEach(collection => {
        console.log(`  ${collection.collectionId}: ${collection.documentCount} documents`);
      });

    console.log('\n🎯 Complete database export successful!');
    console.log('💾 Use these files for backups, migrations, or external analysis');

  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { exportCompleteDatabase };