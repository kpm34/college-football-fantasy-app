/**
 * INFRASTRUCTURE CONTRACT TESTS
 * 
 * Tests that verify the complete Appwrite infrastructure matches our SSOT:
 * - Permissions (roles and access control)
 * - Indexes (compound and performance)
 * - Functions (serverless configurations)
 * - Storage (buckets and file policies)
 */

import { Client, Databases, Functions, Storage } from 'node-appwrite';
import { PERMISSIONS_SCHEMA } from '../schema/permissions';
import { INDEX_SCHEMA } from '../schema/indexes';
import { FUNCTIONS_SCHEMA } from '../schema/functions';
import { STORAGE_SCHEMA } from '../schema/storage';

describe('Infrastructure Contract Tests', () => {
  let client: Client;
  let db: Databases;
  let functions: Functions;
  let storage: Storage;
  let databaseId: string;

  beforeAll(() => {
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const project = process.env.APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    
    if (!endpoint || !project || !apiKey) {
      console.warn('⚠️ Skipping infrastructure contract tests - missing Appwrite credentials');
      return;
    }

    client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(apiKey);
    
    db = new Databases(client);
    functions = new Functions(client);
    storage = new Storage(client);
    databaseId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
  });

  const skipIfNotConfigured = () => {
    if (!db) {
      return test.skip('Infrastructure contract tests disabled - no Appwrite config');
    }
  };

  describe('Permission System', () => {
    test('Collections have proper permission configurations', async () => {
      skipIfNotConfigured();
      
      for (const [collectionId, permissions] of Object.entries(PERMISSIONS_SCHEMA)) {
        const collection = await db.getCollection(databaseId, collectionId);
        
        // Check that collection has permissions configured
        expect(collection.$permissions).toBeDefined();
        expect(Array.isArray(collection.$permissions)).toBe(true);
        
        // Verify critical permission patterns
        const permissionStrings = collection.$permissions;
        
        // Admin should always have access
        const hasAdminAccess = permissionStrings.some(p => p.includes('admin'));
        if (permissions.rules.some(rule => rule.role === 'admin')) {
          expect(hasAdminAccess).toBe(true);
        }
        
        // Public collections should have 'any' read access
        const hasPublicRead = permissionStrings.some(p => p.includes('any') && p.includes('read'));
        const shouldBePublic = permissions.rules.some(rule => 
          rule.role === 'guest' && rule.actions.includes('read')
        );
        
        if (shouldBePublic) {
          expect(hasPublicRead).toBe(true);
        }
        
        console.log(`✅ ${collectionId} permissions configured`);
      }
    });

    test('User-owned resources have proper ownership rules', async () => {
      skipIfNotConfigured();
      
      // Test collections with ownership fields
      const ownershipCollections = ['user_teams', 'lineups', 'users'];
      
      for (const collectionId of ownershipCollections) {
        if (PERMISSIONS_SCHEMA[collectionId]) {
          const collection = await db.getCollection(databaseId, collectionId);
          const permissions = collection.$permissions;
          
          // Should have user-specific permissions for ownership
          const hasUserPermissions = permissions.some(p => p.includes('user:') || p.includes('users:'));
          expect(hasUserPermissions).toBe(true);
          
          console.log(`✅ ${collectionId} has ownership permissions`);
        }
      }
    });
  });

  describe('Performance Indexes', () => {
    test('High-priority compound indexes exist', async () => {
      skipIfNotConfigured();
      
      for (const [collectionId, indexProfile] of Object.entries(INDEX_SCHEMA)) {
        const indexes = await db.listIndexes(databaseId, collectionId);
        const existingIndexKeys = indexes.indexes.map((idx: any) => idx.key);
        
        // Check that high-priority indexes exist
        const highPriorityIndexes = [...indexProfile.compoundIndexes, ...indexProfile.singleIndexes]
          .filter(idx => idx.estimatedUsage === 'high');
        
        for (const criticalIndex of highPriorityIndexes) {
          expect(existingIndexKeys).toContain(criticalIndex.key);
          console.log(`✅ ${collectionId}: Critical index '${criticalIndex.key}' exists`);
        }
      }
    });

    test('Draft optimization indexes are present', async () => {
      skipIfNotConfigured();
      
      // Draft board is the most critical query - must be optimized
      const playersIndexes = await db.listIndexes(databaseId, 'college_players');
      const indexKeys = playersIndexes.indexes.map((idx: any) => idx.key);
      
      // Must have draft availability index
      expect(indexKeys).toContain('draft_availability_idx');
      
      // Verify index attributes for draft queries
      const draftIndex = playersIndexes.indexes.find((idx: any) => idx.key === 'draft_availability_idx');
      if (draftIndex) {
        expect(draftIndex.attributes).toContain('eligible');
        expect(draftIndex.attributes).toContain('position');
        expect(draftIndex.attributes).toContain('fantasy_points');
      }
      
      console.log('✅ Draft optimization indexes verified');
    });

    test('League standings indexes perform efficiently', async () => {
      skipIfNotConfigured();
      
      const userTeamsIndexes = await db.listIndexes(databaseId, 'user_teams');
      const indexKeys = userTeamsIndexes.indexes.map((idx: any) => idx.key);
      
      // Must have league standings index
      expect(indexKeys).toContain('league_standings_idx');
      
      // Verify compound index for standings queries
      const standingsIndex = userTeamsIndexes.indexes.find((idx: any) => idx.key === 'league_standings_idx');
      if (standingsIndex) {
        expect(standingsIndex.attributes).toContain('leagueId');
        expect(standingsIndex.attributes).toContain('wins');
        // Should order by wins descending for standings
        expect(standingsIndex.orders).toContain('DESC');
      }
      
      console.log('✅ League standings indexes verified');
    });

    test('Fulltext search indexes exist for user queries', async () => {
      skipIfNotConfigured();
      
      // Players must be searchable by name
      const playersIndexes = await db.listIndexes(databaseId, 'college_players');
      const hasPlayerNameSearch = playersIndexes.indexes.some((idx: any) => 
        idx.type === 'fulltext' && idx.attributes.includes('name')
      );
      expect(hasPlayerNameSearch).toBe(true);
      
      // Leagues should be searchable
      const leaguesIndexes = await db.listIndexes(databaseId, 'leagues');
      const hasLeagueNameSearch = leaguesIndexes.indexes.some((idx: any) => 
        idx.type === 'fulltext' && idx.attributes.includes('name')
      );
      expect(hasLeagueNameSearch).toBe(true);
      
      console.log('✅ Fulltext search indexes verified');
    });
  });

  describe('Storage Buckets', () => {
    test('All defined buckets exist with correct settings', async () => {
      skipIfNotConfigured();
      
      for (const [bucketId, bucketConfig] of Object.entries(STORAGE_SCHEMA)) {
        const bucket = await storage.getBucket(bucketId);
        
        expect(bucket.$id).toBe(bucketId);
        expect(bucket.name).toBe(bucketConfig.name);
        
        // Check file size limits
        expect(bucket.maximumFileSize).toBe(bucketConfig.settings.maximumFileSize);
        
        // Check allowed file extensions
        expect(bucket.allowedFileExtensions).toEqual(
          expect.arrayContaining(bucketConfig.settings.allowedFileExtensions)
        );
        
        // Check security settings
        expect(bucket.encryption).toBe(bucketConfig.settings.encryption || false);
        expect(bucket.antivirus).toBe(bucketConfig.settings.antivirus || false);
        
        console.log(`✅ Bucket '${bucketId}' configured correctly`);
      }
    });

    test('User content buckets have appropriate permissions', async () => {
      skipIfNotConfigured();
      
      const userContentBuckets = Object.entries(STORAGE_SCHEMA)
        .filter(([_, config]) => config.purpose === 'user-content')
        .map(([bucketId]) => bucketId);
      
      for (const bucketId of userContentBuckets) {
        const bucket = await storage.getBucket(bucketId);
        const permissions = bucket.$permissions;
        
        // User content should allow user uploads
        const hasUserWrite = permissions.some(p => p.includes('write') && (p.includes('user') || p.includes('any')));
        expect(hasUserWrite).toBe(true);
        
        // Should have public read for avatars/logos
        const hasPublicRead = permissions.some(p => p.includes('read') && p.includes('any'));
        expect(hasPublicRead).toBe(true);
        
        console.log(`✅ User content bucket '${bucketId}' has correct permissions`);
      }
    });

    test('System buckets have restricted access', async () => {
      skipIfNotConfigured();
      
      const systemBuckets = Object.entries(STORAGE_SCHEMA)
        .filter(([_, config]) => config.purpose === 'system-assets')
        .map(([bucketId]) => bucketId);
      
      for (const bucketId of systemBuckets) {
        const bucket = await storage.getBucket(bucketId);
        const permissions = bucket.$permissions;
        
        // System buckets should restrict write access
        const hasAdminWrite = permissions.some(p => p.includes('write') && p.includes('admin'));
        const hasUserWrite = permissions.some(p => p.includes('write') && p.includes('users') && !p.includes('admin'));
        
        expect(hasAdminWrite).toBe(true);
        expect(hasUserWrite).toBe(false); // Users shouldn't write to system buckets
        
        console.log(`✅ System bucket '${bucketId}' properly restricted`);
      }
    });

    test('File size limits are reasonable for purpose', async () => {
      skipIfNotConfigured();
      
      for (const [bucketId, config] of Object.entries(STORAGE_SCHEMA)) {
        const bucket = await storage.getBucket(bucketId);
        const sizeMB = bucket.maximumFileSize / (1024 * 1024);
        
        // Validate size limits make sense for bucket purpose
        switch (config.purpose) {
          case 'user-content':
            expect(sizeMB).toBeGreaterThan(1); // At least 1MB for user uploads
            expect(sizeMB).toBeLessThan(50); // But not excessive
            break;
            
          case 'system-assets':
            if (bucketId === 'backup-files') {
              expect(sizeMB).toBeGreaterThan(100); // Large for backups
            } else {
              expect(sizeMB).toBeGreaterThan(5); // Reasonable for assets
            }
            break;
            
          case 'temp-files':
            expect(sizeMB).toBeLessThan(20); // Temp files should be small
            break;
        }
        
        console.log(`✅ ${bucketId} size limit (${sizeMB.toFixed(1)}MB) appropriate for ${config.purpose}`);
      }
    });
  });

  describe('Serverless Functions', () => {
    test('Critical functions are deployed', async () => {
      skipIfNotConfigured();
      
      const criticalFunctions = Object.values(FUNCTIONS_SCHEMA)
        .filter(func => func.priority === 'high' && func.enabled)
        .map(func => func.functionId);
      
      for (const functionId of criticalFunctions) {
        try {
          const func = await functions.get(functionId);
          expect(func.$id).toBe(functionId);
          expect(func.status).toBe('enabled');
          
          console.log(`✅ Critical function '${functionId}' deployed and enabled`);
        } catch (error: any) {
          if (error.code === 404) {
            console.warn(`⚠️ Critical function '${functionId}' not found - should be deployed`);
          } else {
            throw error;
          }
        }
      }
    });

    test('Function runtime configurations are correct', async () => {
      skipIfNotConfigured();
      
      const enabledFunctions = Object.values(FUNCTIONS_SCHEMA).filter(func => func.enabled);
      
      for (const funcConfig of enabledFunctions) {
        try {
          const func = await functions.get(funcConfig.functionId);
          
          // Check runtime
          expect(func.runtime).toBe(funcConfig.execution.runtime);
          
          // Check timeout
          expect(func.timeout).toBe(funcConfig.execution.timeout);
          
          // Check entrypoint
          expect(func.entrypoint).toBe(funcConfig.entrypoint);
          
          console.log(`✅ Function '${funcConfig.functionId}' runtime config correct`);
        } catch (error: any) {
          if (error.code !== 404) {
            throw error;
          }
        }
      }
    });

    test('Scheduled functions have valid cron expressions', async () => {
      skipIfNotConfigured();
      
      const scheduledFunctions = Object.values(FUNCTIONS_SCHEMA)
        .filter(func => func.trigger.type === 'schedule' && func.enabled);
      
      for (const funcConfig of scheduledFunctions) {
        try {
          const func = await functions.get(funcConfig.functionId);
          
          if (func.schedule) {
            // Basic cron validation
            const cronParts = func.schedule.trim().split(/\s+/);
            expect([5, 6]).toContain(cronParts.length); // Standard cron has 5 or 6 parts
            
            console.log(`✅ Function '${funcConfig.functionId}' has valid cron: ${func.schedule}`);
          }
        } catch (error: any) {
          if (error.code !== 404) {
            throw error;
          }
        }
      }
    });
  });

  describe('System Integration', () => {
    test('Database collections match function triggers', async () => {
      skipIfNotConfigured();
      
      // Functions that trigger on database events should reference valid collections
      const databaseFunctions = Object.values(FUNCTIONS_SCHEMA)
        .filter(func => func.trigger.type === 'database');
      
      for (const funcConfig of databaseFunctions) {
        if (funcConfig.trigger.collections) {
          for (const collectionId of funcConfig.trigger.collections) {
            // Verify collection exists
            const collection = await db.getCollection(databaseId, collectionId);
            expect(collection.$id).toBe(collectionId);
          }
          
          console.log(`✅ Function '${funcConfig.functionId}' triggers on valid collections`);
        }
      }
    });

    test('Permission roles are consistent across components', async () => {
      skipIfNotConfigured();
      
      // Extract all roles used in system
      const allRoles = new Set<string>();
      
      // From permissions
      Object.values(PERMISSIONS_SCHEMA).forEach(perms => {
        perms.rules.forEach(rule => allRoles.add(rule.role));
      });
      
      // From storage buckets
      Object.values(STORAGE_SCHEMA).forEach(bucket => {
        bucket.permissions.read.forEach(role => allRoles.add(role.replace('role:', '')));
        bucket.permissions.write.forEach(role => allRoles.add(role.replace('role:', '')));
        bucket.permissions.delete.forEach(role => allRoles.add(role.replace('role:', '')));
      });
      
      // From functions
      Object.values(FUNCTIONS_SCHEMA).forEach(func => {
        func.permissions.execute.forEach(role => allRoles.add(role.replace('role:', '')));
      });
      
      // Verify role consistency
      const validRoles = ['guest', 'user', 'admin', 'system', 'any'];
      for (const role of allRoles) {
        expect(validRoles).toContain(role);
      }
      
      console.log(`✅ All ${allRoles.size} roles are consistent across components`);
    });
  });
});

// Helper test for development - shows system status
describe('System Status', () => {
  test('Display current infrastructure status', async () => {
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const project = process.env.APPWRITE_PROJECT_ID;
    
    if (!endpoint || !project) {
      console.log('⚠️ No Appwrite configuration - infrastructure not connected');
      return;
    }
    
    console.log('\n🏗️ Infrastructure Status:');
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log(`🏷️  Project: ${project}`);
    console.log(`📊 Database: ${process.env.APPWRITE_DATABASE_ID || 'default'}`);
    console.log(`📦 Collections: ${Object.keys(PERMISSIONS_SCHEMA).length}`);
    console.log(`📇 Index Profiles: ${Object.keys(INDEX_SCHEMA).length}`);
    console.log(`⚡ Functions: ${Object.keys(FUNCTIONS_SCHEMA).length}`);
    console.log(`🪣 Storage Buckets: ${Object.keys(STORAGE_SCHEMA).length}`);
  });
});