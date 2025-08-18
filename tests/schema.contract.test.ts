/**
 * Schema Contract Tests
 * 
 * These tests verify that the actual Appwrite schema matches our Single Source of Truth.
 * They will fail if there's any drift between our schema definitions and the live database.
 */

import { Client, Databases } from 'node-appwrite';
import { SCHEMA, type SchemaCollection } from '../schema/schema';
import { COLLECTIONS, SCHEMA_REGISTRY } from '../schema/zod-schema';

describe('Schema Contract Tests', () => {
  let client: Client;
  let db: Databases;
  let databaseId: string;

  beforeAll(() => {
    // Skip tests if not configured (e.g., in CI without secrets)
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const project = process.env.APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    
    if (!endpoint || !project || !apiKey) {
      console.warn('⚠️ Skipping schema contract tests - missing Appwrite credentials');
      return;
    }

    client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(apiKey);
    
    db = new Databases(client);
    databaseId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
  });

  // Helper to check if tests should run
  const skipIfNotConfigured = () => {
    if (!db) {
      return test.skip('Schema contract tests disabled - no Appwrite config');
    }
  };

  describe('Collection Existence', () => {
    test('All SSOT collections exist in Appwrite', async () => {
      skipIfNotConfigured();
      
      for (const [collectionId, collection] of Object.entries(SCHEMA)) {
        const appwriteCollection = await db.getCollection(databaseId, collectionId);
        
        expect(appwriteCollection.name).toBe(collection.name);
        expect(appwriteCollection.$id).toBe(collectionId);
        
        console.log(`✅ ${collection.name} (${collectionId})`);
      }
    });
  });

  describe('Critical Collections', () => {
    test('Leagues collection matches SSOT', async () => {
      skipIfNotConfigured();
      
      const collection = await db.getCollection(databaseId, 'leagues');
      expect(collection.name).toBe('Leagues');
      
      // Check critical attributes exist
      const attributes = collection.attributes;
      const attrKeys = attributes.map((attr: any) => attr.key);
      
      expect(attrKeys).toContain('name');
      expect(attrKeys).toContain('commissioner');
      expect(attrKeys).toContain('season');
      expect(attrKeys).toContain('maxTeams');
      expect(attrKeys).toContain('draftType');
      expect(attrKeys).toContain('gameMode');
      expect(attrKeys).toContain('status');
      expect(attrKeys).toContain('isPublic');
      
      // Check attribute types
      const nameAttr = attributes.find((attr: any) => attr.key === 'name');
      expect(nameAttr?.type).toBe('string');
      expect(nameAttr?.required).toBe(true);
      
      const seasonAttr = attributes.find((attr: any) => attr.key === 'season');
      expect(seasonAttr?.type).toBe('integer');
      expect(seasonAttr?.required).toBe(true);
      
      const isPublicAttr = attributes.find((attr: any) => attr.key === 'isPublic');
      expect(isPublicAttr?.type).toBe('boolean');
    });

    test('College Players collection matches SSOT', async () => {
      skipIfNotConfigured();
      
      const collection = await db.getCollection(databaseId, 'college_players');
      expect(collection.name).toBe('College Players');
      
      const attributes = collection.attributes;
      const attrKeys = attributes.map((attr: any) => attr.key);
      
      // Critical player attributes
      expect(attrKeys).toContain('name');
      expect(attrKeys).toContain('position');
      expect(attrKeys).toContain('team');
      expect(attrKeys).toContain('conference');
      expect(attrKeys).toContain('eligible');
      expect(attrKeys).toContain('fantasy_points');
      
      // Check position attribute (should be enum)
      const positionAttr = attributes.find((attr: any) => attr.key === 'position');
      expect(positionAttr?.type).toBe('string'); // Enum appears as string in Appwrite
      expect(positionAttr?.required).toBe(true);
      
      // Check fantasy_points (should be double/float)
      const pointsAttr = attributes.find((attr: any) => attr.key === 'fantasy_points');
      expect(['double', 'float']).toContain(pointsAttr?.type);
    });

    test('User Teams collection matches SSOT', async () => {
      skipIfNotConfigured();
      
      const collection = await db.getCollection(databaseId, 'user_teams');
      expect(collection.name).toBe('User Teams');
      
      const attributes = collection.attributes;
      const attrKeys = attributes.map((attr: any) => attr.key);
      
      expect(attrKeys).toContain('leagueId');
      expect(attrKeys).toContain('userId');
      expect(attrKeys).toContain('teamName');
      expect(attrKeys).toContain('wins');
      expect(attrKeys).toContain('losses');
      expect(attrKeys).toContain('pointsFor');
      expect(attrKeys).toContain('players'); // This should be a string field for JSON
      
      // Check the problematic 'players' field - should be string for JSON
      const playersAttr = attributes.find((attr: any) => attr.key === 'players');
      expect(playersAttr?.type).toBe('string');
      expect(playersAttr?.size).toBeGreaterThan(1000); // Large string for JSON
    });
  });

  describe('Index Verification', () => {
    test('Critical indexes exist', async () => {
      skipIfNotConfigured();
      
      // Check leagues indexes
      const leaguesIndexes = await db.listIndexes(databaseId, 'leagues');
      const leagueIndexKeys = leaguesIndexes.indexes.map((idx: any) => idx.key);
      
      // Should have status index for filtering
      expect(leagueIndexKeys).toContain('status_idx');
      
      // Check college_players indexes  
      const playersIndexes = await db.listIndexes(databaseId, 'college_players');
      const playerIndexKeys = playersIndexes.indexes.map((idx: any) => idx.key);
      
      // Should have position and team indexes
      expect(playerIndexKeys).toContain('position_idx');
      expect(playerIndexKeys).toContain('team_idx');
      
      console.log(`✅ Found ${leagueIndexKeys.length} league indexes`);
      console.log(`✅ Found ${playerIndexKeys.length} player indexes`);
    });
  });

  describe('Attribute Type Safety', () => {
    test('No unexpected attribute types', async () => {
      skipIfNotConfigured();
      
      const validTypes = ['string', 'integer', 'double', 'float', 'boolean', 'datetime', 'url', 'email', 'ip', 'relationship'];
      
      for (const [collectionId] of Object.entries(SCHEMA)) {
        const collection = await db.getCollection(databaseId, collectionId);
        
        for (const attribute of collection.attributes) {
          expect(validTypes).toContain(attribute.type);
        }
      }
    });

    test('Required fields are properly marked', async () => {
      skipIfNotConfigured();
      
      const leagues = await db.getCollection(databaseId, 'leagues');
      const nameAttr = leagues.attributes.find((attr: any) => attr.key === 'name');
      const descAttr = leagues.attributes.find((attr: any) => attr.key === 'description');
      
      // Name should be required, description should not
      expect(nameAttr?.required).toBe(true);
      if (descAttr) {
        expect(descAttr.required).toBe(false);
      }
    });
  });

  describe('Data Consistency', () => {
    test('No orphaned collections', async () => {
      skipIfNotConfigured();
      
      const allCollections = await db.listCollections(databaseId);
      const appwriteCollectionIds = allCollections.collections
        .map((col: any) => col.$id)
        .filter((id: string) => id !== 'migrations'); // Exclude system collections
      
      const ssotCollectionIds = Object.keys(SCHEMA);
      
      // Every Appwrite collection should be in our SSOT
      for (const appwriteId of appwriteCollectionIds) {
        expect(ssotCollectionIds).toContain(appwriteId);
      }
      
      console.log(`✅ All ${appwriteCollectionIds.length} collections are defined in SSOT`);
    });

    test('Critical Zod collections have corresponding Appwrite collections', async () => {
      skipIfNotConfigured();
      
      const zodCollections = Object.values(COLLECTIONS);
      
      for (const collectionId of zodCollections) {
        const collection = await db.getCollection(databaseId, collectionId);
        expect(collection.$id).toBe(collectionId);
        
        console.log(`✅ Zod collection '${collectionId}' exists in Appwrite`);
      }
    });
  });

  describe('Performance Indexes', () => {
    test('Query performance indexes exist', async () => {
      skipIfNotConfigured();
      
      // Test that we have indexes for common query patterns
      const playersIndexes = await db.listIndexes(databaseId, 'college_players');
      const indexAttributes = playersIndexes.indexes.flatMap((idx: any) => idx.attributes);
      
      // Should be able to query efficiently by these fields
      expect(indexAttributes).toContain('position');
      expect(indexAttributes).toContain('team');
      expect(indexAttributes).toContain('conference');
      expect(indexAttributes).toContain('fantasy_points');
      
      const userTeamsIndexes = await db.listIndexes(databaseId, 'user_teams');
      const userTeamIndexAttributes = userTeamsIndexes.indexes.flatMap((idx: any) => idx.attributes);
      
      // Should be able to query user teams by league efficiently
      expect(userTeamIndexAttributes).toContain('leagueId');
    });
  });

  describe('Schema Validation Edge Cases', () => {
    test('String field sizes match SSOT constraints', async () => {
      skipIfNotConfigured();
      
      const leagues = await db.getCollection(databaseId, 'leagues');
      const nameAttr = leagues.attributes.find((attr: any) => attr.key === 'name');
      
      // Name field should have reasonable size constraint
      expect(nameAttr?.size).toBeGreaterThan(0);
      expect(nameAttr?.size).toBeLessThan(1000); // Not unlimited
      
      const userTeams = await db.getCollection(databaseId, 'user_teams');
      const playersAttr = userTeams.attributes.find((attr: any) => attr.key === 'players');
      
      // Players field should be large for JSON storage
      expect(playersAttr?.size).toBeGreaterThan(1000);
    });
  });
});

// Additional test suite for runtime validation
describe('Runtime Schema Validation', () => {
  test('SSOT schema definitions are internally consistent', () => {
    for (const [collectionId, collection] of Object.entries(SCHEMA)) {
      // Collection ID should match key
      expect(collection.id).toBe(collectionId);
      
      // Should have at least one required attribute (unless system collection)
      if (!['activity_log', 'migrations'].includes(collectionId)) {
        const hasRequiredAttrs = collection.attributes.some(attr => attr.required);
        expect(hasRequiredAttrs).toBe(true);
      }
      
      // All index attributes should reference existing attributes
      const attrKeys = collection.attributes.map(attr => attr.key);
      for (const index of collection.indexes) {
        for (const indexAttr of index.attributes) {
          expect(attrKeys).toContain(indexAttr);
        }
      }
    }
  });

  test('Zod schemas are valid', () => {
    // Test that Zod collections can be used for validation
    const testLeague = {
      name: 'Test League',
      commissioner: 'user123',
      season: 2025,
      maxTeams: 12,
      draftType: 'snake',
      gameMode: 'power4',
      status: 'open',
      isPublic: true
    };
    
    const leagueSchema = SCHEMA_REGISTRY[COLLECTIONS.LEAGUES];
    const result = leagueSchema.safeParse(testLeague);
    expect(result.success).toBe(true);
    
    // Test invalid data fails validation
    const invalidLeague = { ...testLeague, season: 'invalid' }; // Invalid type
    const invalidResult = leagueSchema.safeParse(invalidLeague);
    expect(invalidResult.success).toBe(false);
  });
});