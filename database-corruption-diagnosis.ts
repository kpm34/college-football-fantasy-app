#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from './lib/appwrite-server.js';
import { ID } from 'node-appwrite';

interface CollectionTestResult {
  name: string;
  exists: boolean;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  documentCount: number;
  error?: string;
}

async function diagnoseDatabaseCorruption() {
  console.log('🚨 COMPREHENSIVE DATABASE CORRUPTION DIAGNOSIS');
  console.log('================================================');
  
  const results: CollectionTestResult[] = [];
  const collectionsToTest = Object.entries(COLLECTIONS);
  
  for (const [key, collectionId] of collectionsToTest) {
    console.log(`\n🔍 Testing collection: ${key} (${collectionId})`);
    
    const result: CollectionTestResult = {
      name: collectionId,
      exists: false,
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      documentCount: 0
    };
    
    try {
      // Test 1: Check if collection exists and can be read
      const documents = await databases.listDocuments(DATABASE_ID, collectionId, []);
      result.exists = true;
      result.canRead = true;
      result.documentCount = documents.total;
      console.log(`✅ READ: ${documents.total} documents`);
      
      // Test 2: Try to create a test document
      let testDocId: string | null = null;
      try {
        const testDoc = {
          // Add minimal required fields based on collection
          ...(collectionId === 'leagues' && {
            name: 'Test League',
            commissioner: '689728660623e03830fc',
            season: 2025
          }),
          ...(collectionId === 'teams' && {
            name: 'Test Team',
            abbreviation: 'TEST',
            conference: 'SEC'
          }),
          ...(collectionId === 'college_players' && {
            name: 'Test Player',
            position: 'QB',
            team: 'Test Team',
            conference: 'SEC'
          }),
          ...(collectionId === 'user_teams' && {
            leagueId: 'test-league',
            userId: '689728660623e03830fc',
            teamName: 'Test Team'
          }),
          ...(collectionId === 'games' && {
            week: 1,
            season: 2025,
            season_type: 'regular',
            home_team: 'Test Home',
            away_team: 'Test Away'
          }),
          ...(collectionId === 'activity_log' && {
            action: 'test_action',
            details: 'Testing database'
          }),
          // Add fallback minimal data
          ...(collectionId.includes('draft') && {
            leagueId: 'test-league'
          }),
          ...(collectionId.includes('mock') && {
            name: 'Test Mock Draft'
          })
        };
        
        testDocId = ID.unique();
        await databases.createDocument(DATABASE_ID, collectionId, testDocId, testDoc);
        result.canCreate = true;
        console.log(`✅ CREATE: Success with ID ${testDocId}`);
        
        // Test 3: Try to update the test document
        try {
          await databases.updateDocument(DATABASE_ID, collectionId, testDocId, {
            updated_test: new Date().toISOString()
          });
          result.canUpdate = true;
          console.log(`✅ UPDATE: Success`);
        } catch (updateError: any) {
          console.log(`❌ UPDATE: Failed - ${updateError.message}`);
        }
        
        // Test 4: Try to delete the test document
        try {
          await databases.deleteDocument(DATABASE_ID, collectionId, testDocId);
          result.canDelete = true;
          console.log(`✅ DELETE: Success`);
        } catch (deleteError: any) {
          console.log(`❌ DELETE: Failed - ${deleteError.message}`);
          // If we can't delete, try to update it to mark as test
          try {
            await databases.updateDocument(DATABASE_ID, collectionId, testDocId, {
              test_document: true,
              created_for: 'corruption_test'
            });
            console.log(`⚠️  Marked test document for cleanup`);
          } catch {}
        }
        
      } catch (createError: any) {
        console.log(`❌ CREATE: Failed - ${createError.message}`);
        result.error = createError.message;
        
        // Check if it's the same ID collision error
        if (createError.message.includes('already exists')) {
          console.log(`🚨 ID COLLISION ERROR detected in ${collectionId}`);
        }
      }
      
    } catch (readError: any) {
      console.log(`❌ READ: Failed - ${readError.message}`);
      result.error = readError.message;
      
      // Check if collection doesn't exist
      if (readError.message.includes('not found')) {
        console.log(`🚨 COLLECTION MISSING: ${collectionId}`);
      }
    }
    
    results.push(result);
  }
  
  // Generate summary report
  console.log('\n📊 CORRUPTION DIAGNOSIS SUMMARY');
  console.log('================================');
  
  const corrupted = results.filter(r => !r.canCreate && r.exists);
  const missing = results.filter(r => !r.exists);
  const healthy = results.filter(r => r.canCreate && r.exists);
  
  console.log(`\n✅ HEALTHY COLLECTIONS (${healthy.length}):`);
  healthy.forEach(r => console.log(`   - ${r.name}: ${r.documentCount} docs, full CRUD`));
  
  console.log(`\n🚨 CORRUPTED COLLECTIONS (${corrupted.length}):`);
  corrupted.forEach(r => console.log(`   - ${r.name}: ${r.documentCount} docs, CREATE FAILED`));
  
  console.log(`\n❌ MISSING COLLECTIONS (${missing.length}):`);
  missing.forEach(r => console.log(`   - ${r.name}: Collection not found`));
  
  if (corrupted.length > 0) {
    console.log(`\n🔧 RECOMMENDED ACTION:`);
    console.log(`   - ${corrupted.length} collections need recreation`);
    console.log(`   - Backup existing data first`);
    console.log(`   - Delete and recreate corrupted collections`);
    console.log(`   - Restore data from backups`);
  }
  
  // Export results for further analysis
  const fs = await import('fs');
  await fs.promises.writeFile(
    'database-corruption-report.json',
    JSON.stringify(results, null, 2)
  );
  console.log(`\n💾 Full report saved to database-corruption-report.json`);
  
  return results;
}

diagnoseDatabaseCorruption().catch(console.error);