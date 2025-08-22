#!/usr/bin/env tsx

/**
 * Migration Runner
 * 
 * Runs database migrations in order, tracking which have been applied.
 * Idempotent - safe to run multiple times.
 */

import 'dotenv/config';
import { Client, Databases, Query } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

const endpoint = process.env.APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || "college-football-fantasy";

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

interface Migration {
  id: string;
  name: string;
  applied_at?: string;
  run: () => Promise<void>;
}

// Ensure migrations collection exists
async function ensureMigrationsCollection(): Promise<void> {
  try {
    await db.getCollection(databaseId, 'migrations');
  } catch (error: any) {
    if (error.code === 404) {
      console.log('➕ Creating migrations collection');
      await db.createCollection(databaseId, 'migrations', 'Database Migrations');
      
      // Add attributes
      await db.createStringAttribute(databaseId, 'migrations', 'migration_id', 255, true);
      await db.createStringAttribute(databaseId, 'migrations', 'name', 255, true);
      await db.createDatetimeAttribute(databaseId, 'migrations', 'applied_at', true);
      
      // Wait for attributes to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add unique index
      await db.createIndex(databaseId, 'migrations', 'migration_id_unique', 'unique', ['migration_id']);
    }
  }
}

// Check if migration has been applied
async function isMigrationApplied(migrationId: string): Promise<boolean> {
  try {
    const result = await db.listDocuments(
      databaseId,
      'migrations',
      [Query.equal('migration_id', [migrationId])]
    );
    return result.documents.length > 0;
  } catch (error) {
    return false;
  }
}

// Mark migration as applied
async function markMigrationApplied(migration: Migration): Promise<void> {
  try {
    await db.createDocument(
      databaseId,
      'migrations',
      'unique()',
      {
        migration_id: migration.id,
        name: migration.name,
        applied_at: new Date().toISOString()
      }
    );
  } catch (error) {
    console.warn(`Failed to record migration ${migration.id}:`, error);
  }
}

// Migration definitions
const migrations: Migration[] = [
  {
    id: '2025-08-17-001-initial-indexes',
    name: 'Add initial database indexes',
    run: async () => {
      console.log('  Adding performance indexes...');
      
      try {
        // Add indexes to college_players for better query performance
        await db.createIndex(databaseId, 'college_players', 'eligible_position_idx', 'key', ['eligible', 'position']);
        await db.createIndex(databaseId, 'college_players', 'team_position_idx', 'key', ['team', 'position']);
        
        console.log('  ✅ Added player performance indexes');
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          throw error;
        }
      }
      
      try {
        // Add compound index for user_teams (rosters)
        await db.createIndex(databaseId, 'user_teams', 'league_standings_idx', 'key', ['leagueId', 'wins'], ['ASC', 'DESC']);
        
        console.log('  ✅ Added roster standings index');
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          throw error;
        }
      }
    }
  },
  
  {
    id: '2025-08-17-002-add-missing-attributes',
    name: 'Add missing attributes to existing collections',
    run: async () => {
      console.log('  Adding missing attributes...');
      
      try {
        // Add missing attributes to leagues
        await db.createStringAttribute(databaseId, 'leagues', 'description', 500, false);
        await db.createDatetimeAttribute(databaseId, 'leagues', 'created_at', false);
        
        console.log('  ✅ Added league metadata attributes');
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          console.warn('  ⚠️ Could not add league attributes:', error.message);
        }
      }
      
      try {
        // Add missing attributes to rosters
        await db.createStringAttribute(databaseId, 'rosters', 'avatar_url', 500, false);
        await db.createDatetimeAttribute(databaseId, 'rosters', 'last_lineup_change', false);
        
        console.log('  ✅ Added roster metadata attributes');
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          console.warn('  ⚠️ Could not add roster attributes:', error.message);
        }
      }
    }
  }
];

async function runMigrations(): Promise<void> {
  console.log('🚀 Running Database Migrations...');
  console.log('══════════════════════════════════');
  
  try {
    // Ensure migrations tracking collection exists
    await ensureMigrationsCollection();
    
    let appliedCount = 0;
    let skippedCount = 0;
    
    for (const migration of migrations) {
      console.log(`\n📋 Migration: ${migration.name}`);
      
      if (await isMigrationApplied(migration.id)) {
        console.log('  ⏭️  Already applied - skipping');
        skippedCount++;
        continue;
      }
      
      try {
        console.log('  🔄 Applying...');
        await migration.run();
        await markMigrationApplied(migration);
        console.log('  ✅ Applied successfully');
        appliedCount++;
      } catch (error: any) {
        console.error(`  ❌ Failed to apply migration ${migration.id}:`, error);
        throw error;
      }
    }
    
    console.log('\n🎉 Migration Summary:');
    console.log(`✅ Applied: ${appliedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📊 Total: ${migrations.length}`);
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  runMigrations();
}

export { runMigrations };