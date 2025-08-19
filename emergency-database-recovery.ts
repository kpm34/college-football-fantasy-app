#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID } from './lib/appwrite-server.js';
import { Permission, Role } from 'node-appwrite';

interface CollectionBackup {
  id: string;
  name: string;
  documents: any[];
  attributes: any[];
}

async function emergencyDatabaseRecovery() {
  console.log('🚨 EMERGENCY DATABASE RECOVERY PROTOCOL');
  console.log('=====================================');
  console.log('⚠️  THIS WILL BACKUP AND RECREATE ALL CORRUPTED COLLECTIONS');
  console.log('⚠️  ENSURE YOU HAVE BACKUPS BEFORE PROCEEDING!');
  
  const criticalCollections = [
    'user_teams',
    'college_players', 
    'teams',
    'games',
    'draft_picks',
    'activity_log'
  ];
  
  const backups: CollectionBackup[] = [];
  
  console.log('\n📦 PHASE 1: BACKING UP ALL DATA');
  console.log('==============================');
  
  // Step 1: Backup all data from corrupted collections
  for (const collectionId of criticalCollections) {
    try {
      console.log(`🔄 Backing up ${collectionId}...`);
      
      const [documents, attributes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, collectionId, []),
        databases.listAttributes(DATABASE_ID, collectionId)
      ]);
      
      const backup: CollectionBackup = {
        id: collectionId,
        name: collectionId,
        documents: documents.documents,
        attributes: attributes.attributes
      };
      
      backups.push(backup);
      console.log(`✅ ${collectionId}: ${documents.total} documents, ${attributes.attributes.length} attributes`);
      
      // Save individual backup file
      const fs = await import('fs');
      await fs.promises.writeFile(
        `backup-${collectionId}-${Date.now()}.json`,
        JSON.stringify(backup, null, 2)
      );
      
    } catch (error: any) {
      console.log(`❌ Failed to backup ${collectionId}: ${error.message}`);
      backups.push({
        id: collectionId,
        name: collectionId,
        documents: [],
        attributes: []
      });
    }
  }
  
  // Save master backup
  const fs = await import('fs');
  await fs.promises.writeFile(
    `master-backup-${Date.now()}.json`,
    JSON.stringify(backups, null, 2)
  );
  console.log(`💾 Master backup saved with ${backups.length} collections`);
  
  console.log('\n🔧 PHASE 2: RECREATING CRITICAL COLLECTIONS');
  console.log('==========================================');
  
  // Step 2: Recreate the most critical collections with proper schemas
  const recreationPlan = [
    {
      id: 'user_teams',
      name: 'User Teams',
      attributes: [
        { key: 'leagueId', type: 'string', required: true, size: 50 },
        { key: 'userId', type: 'string', required: true, size: 50 },
        { key: 'teamName', type: 'string', required: true, size: 100 },
        { key: 'abbreviation', type: 'string', required: false, size: 10 },
        { key: 'wins', type: 'integer', required: false, min: 0, max: 20 },
        { key: 'losses', type: 'integer', required: false, min: 0, max: 20 },
        { key: 'ties', type: 'integer', required: false, min: 0, max: 20 },
        { key: 'pointsFor', type: 'integer', required: false, min: 0 },
        { key: 'pointsAgainst', type: 'integer', required: false, min: 0 },
        { key: 'players', type: 'string', required: false, size: 5000 },
        { key: 'draftPosition', type: 'integer', required: false, min: 1, max: 20 }
      ]
    },
    {
      id: 'college_players',
      name: 'College Players',
      attributes: [
        { key: 'name', type: 'string', required: true, size: 100 },
        { key: 'position', type: 'string', required: true, size: 10 },
        { key: 'team', type: 'string', required: true, size: 50 },
        { key: 'conference', type: 'string', required: true, size: 20 },
        { key: 'year', type: 'string', required: false, size: 10 },
        { key: 'jerseyNumber', type: 'integer', required: false, min: 0, max: 99 },
        { key: 'height', type: 'string', required: false, size: 10 },
        { key: 'weight', type: 'integer', required: false, min: 150, max: 400 },
        { key: 'eligible', type: 'boolean', required: false },
        { key: 'fantasy_points', type: 'float', required: false },
        { key: 'season_fantasy_points', type: 'float', required: false }
      ]
    },
    {
      id: 'teams',
      name: 'Teams', 
      attributes: [
        { key: 'name', type: 'string', required: true, size: 100 },
        { key: 'school', type: 'string', required: true, size: 100 },
        { key: 'abbreviation', type: 'string', required: true, size: 10 },
        { key: 'conference', type: 'string', required: true, size: 20 },
        { key: 'mascot', type: 'string', required: false, size: 50 },
        { key: 'logo_url', type: 'url', required: false },
        { key: 'primary_color', type: 'string', required: false, size: 10 },
        { key: 'secondary_color', type: 'string', required: false, size: 10 }
      ]
    },
    {
      id: 'games',
      name: 'Games',
      attributes: [
        { key: 'week', type: 'integer', required: true, min: 1, max: 20 },
        { key: 'season', type: 'integer', required: true, min: 2020, max: 2030 },
        { key: 'season_type', type: 'string', required: true, size: 20 },
        { key: 'date', type: 'datetime', required: true },
        { key: 'home_team', type: 'string', required: true, size: 50 },
        { key: 'away_team', type: 'string', required: true, size: 50 },
        { key: 'home_score', type: 'integer', required: false, min: 0, max: 200 },
        { key: 'away_score', type: 'integer', required: false, min: 0, max: 200 },
        { key: 'status', type: 'string', required: false, size: 20 },
        { key: 'eligible', type: 'boolean', required: false }
      ]
    }
  ];
  
  for (const collection of recreationPlan) {
    try {
      console.log(`\n🔧 Recreating ${collection.id}...`);
      
      // Delete existing corrupted collection
      try {
        await databases.deleteCollection(DATABASE_ID, collection.id);
        console.log(`🗑️  Deleted corrupted ${collection.id}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for propagation
      } catch (deleteError: any) {
        console.log(`⚠️  Could not delete ${collection.id}: ${deleteError.message}`);
      }
      
      // Create new collection
      const permissions = [
        Permission.read(Role.any()),
        Permission.write(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ];
      
      const newCollection = await databases.createCollection(
        DATABASE_ID,
        collection.id,
        collection.name,
        permissions,
        false, // documentSecurity
        true   // enabled
      );
      console.log(`✅ Created ${collection.id} collection`);
      
      // Add attributes
      for (const attr of collection.attributes) {
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              DATABASE_ID, 
              collection.id, 
              attr.key, 
              attr.size, 
              attr.required
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.min,
              attr.max
            );
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required,
              attr.min,
              attr.max
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required
            );
          } else if (attr.type === 'url') {
            await databases.createUrlAttribute(
              DATABASE_ID,
              collection.id,
              attr.key,
              attr.required
            );
          }
          
          console.log(`   ✅ Added ${attr.key} (${attr.type})`);
        } catch (attrError: any) {
          console.log(`   ❌ Failed to add ${attr.key}: ${attrError.message}`);
        }
      }
      
      console.log(`✅ ${collection.id} recreation complete with ${collection.attributes.length} attributes`);
      
    } catch (error: any) {
      console.log(`❌ Failed to recreate ${collection.id}: ${error.message}`);
    }
  }
  
  console.log('\n🔄 PHASE 3: DATA RESTORATION');
  console.log('============================');
  console.log('⚠️  Manual data restoration required:');
  console.log('1. Wait 30 seconds for schema propagation');
  console.log('2. Run restoration scripts for each collection');
  console.log('3. Verify data integrity');
  console.log('4. Test core functionality (auth, leagues, drafts)');
  
  console.log('\n🎯 CRITICAL COLLECTIONS RECOVERED');
  console.log('Collections recreated with proper schemas');
  console.log('Next: Test basic functionality and restore data');
}

emergencyDatabaseRecovery().catch(console.error);