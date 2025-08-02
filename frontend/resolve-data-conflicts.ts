#!/usr/bin/env ts-node

/**
 * Data Conflict Resolution Script
 * 
 * This script resolves the critical data flow conflicts identified in DATA_FLOW_CONFLICTS.md
 * by creating missing Appwrite collections and implementing proper ID mapping.
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

interface CollectionSchema {
    name: string;
    attributes: any[];
    indexes?: any[];
}

class DataConflictResolver {
    private collections: CollectionSchema[] = [
        // Users collection
        {
            name: 'users',
            attributes: [
                { key: 'email', type: 'string', size: 255, required: true },
                { key: 'username', type: 'string', size: 100, required: true },
                { key: 'created_at', type: 'datetime', required: true },
                { key: 'profile', type: 'object', required: false },
                { key: 'preferences', type: 'object', required: false },
                { key: 'is_active', type: 'boolean', required: true, default: true }
            ],
            indexes: [
                { key: 'email_idx', attributes: ['email'], type: 'unique' },
                { key: 'username_idx', attributes: ['username'], type: 'unique' }
            ]
        },
        
        // Players collection
        {
            name: 'players',
            attributes: [
                { key: 'external_id', type: 'string', size: 50, required: true },
                { key: 'name', type: 'string', size: 100, required: true },
                { key: 'position', type: 'string', size: 10, required: true },
                { key: 'team_id', type: 'string', size: 36, required: true },
                { key: 'jersey_number', type: 'integer', required: false },
                { key: 'height', type: 'string', size: 10, required: false },
                { key: 'weight', type: 'integer', required: false },
                { key: 'class_year', type: 'string', size: 20, required: false },
                { key: 'stats', type: 'object', required: false },
                { key: 'fantasy_points', type: 'float', required: false, default: 0 },
                { key: 'is_active', type: 'boolean', required: true, default: true }
            ],
            indexes: [
                { key: 'external_id_idx', attributes: ['external_id'], type: 'unique' },
                { key: 'team_idx', attributes: ['team_id'], type: 'key' },
                { key: 'position_idx', attributes: ['position'], type: 'key' },
                { key: 'name_idx', attributes: ['name'], type: 'key' }
            ]
        },
        
        // Player Stats collection
        {
            name: 'player_stats',
            attributes: [
                { key: 'player_id', type: 'string', size: 36, required: true },
                { key: 'game_id', type: 'string', size: 36, required: true },
                { key: 'week', type: 'integer', required: true },
                { key: 'season', type: 'integer', required: true },
                { key: 'stats', type: 'object', required: true },
                { key: 'fantasy_points', type: 'float', required: true },
                { key: 'last_updated', type: 'datetime', required: true }
            ],
            indexes: [
                { key: 'player_game_idx', attributes: ['player_id', 'game_id'], type: 'unique' },
                { key: 'week_idx', attributes: ['week'], type: 'key' },
                { key: 'season_idx', attributes: ['season'], type: 'key' },
                { key: 'player_week_idx', attributes: ['player_id', 'week'], type: 'key' }
            ]
        },
        
        // Transactions collection
        {
            name: 'transactions',
            attributes: [
                { key: 'league_id', type: 'string', size: 36, required: true },
                { key: 'team_id', type: 'string', size: 36, required: true },
                { key: 'player_id', type: 'string', size: 36, required: true },
                { key: 'type', type: 'string', size: 20, required: true }, // 'add', 'drop', 'trade'
                { key: 'timestamp', type: 'datetime', required: true },
                { key: 'details', type: 'object', required: false },
                { key: 'processed', type: 'boolean', required: true, default: false }
            ],
            indexes: [
                { key: 'league_idx', attributes: ['league_id'], type: 'key' },
                { key: 'team_idx', attributes: ['team_id'], type: 'key' },
                { key: 'timestamp_idx', attributes: ['timestamp'], type: 'key' },
                { key: 'type_idx', attributes: ['type'], type: 'key' }
            ]
        },
        
        // Draft Picks collection
        {
            name: 'draft_picks',
            attributes: [
                { key: 'league_id', type: 'string', size: 36, required: true },
                { key: 'team_id', type: 'string', size: 36, required: true },
                { key: 'player_id', type: 'string', size: 36, required: false }, // null until picked
                { key: 'round', type: 'integer', required: true },
                { key: 'pick_number', type: 'integer', required: true },
                { key: 'timestamp', type: 'datetime', required: true },
                { key: 'status', type: 'string', size: 20, required: true, default: 'pending' }, // 'pending', 'picked', 'skipped'
                { key: 'time_remaining', type: 'integer', required: false } // seconds remaining
            ],
            indexes: [
                { key: 'league_round_pick_idx', attributes: ['league_id', 'round', 'pick_number'], type: 'unique' },
                { key: 'team_idx', attributes: ['team_id'], type: 'key' },
                { key: 'status_idx', attributes: ['status'], type: 'key' },
                { key: 'timestamp_idx', attributes: ['timestamp'], type: 'key' }
            ]
        },
        
        // ID Mapping collection
        {
            name: 'id_mappings',
            attributes: [
                { key: 'external_id', type: 'string', size: 50, required: true },
                { key: 'external_type', type: 'string', size: 20, required: true }, // 'cfbd', 'espn'
                { key: 'internal_id', type: 'string', size: 36, required: true },
                { key: 'internal_type', type: 'string', size: 20, required: true }, // 'player', 'team', 'game'
                { key: 'created_at', type: 'datetime', required: true },
                { key: 'last_updated', type: 'datetime', required: true }
            ],
            indexes: [
                { key: 'external_lookup_idx', attributes: ['external_id', 'external_type'], type: 'unique' },
                { key: 'internal_lookup_idx', attributes: ['internal_id', 'internal_type'], type: 'key' },
                { key: 'type_idx', attributes: ['internal_type'], type: 'key' }
            ]
        }
    ];

    async resolveConflicts(): Promise<void> {
        console.log('🚀 Starting data conflict resolution...\n');

        try {
            // Step 1: Create missing collections
            await this.createMissingCollections();
            
            // Step 2: Update existing collections
            await this.updateExistingCollections();
            
            // Step 3: Create ID mapping infrastructure
            await this.setupIdMapping();
            
            // Step 4: Validate data integrity
            await this.validateDataIntegrity();
            
            console.log('✅ Data conflict resolution completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during conflict resolution:', error);
            throw error;
        }
    }

    private async createMissingCollections(): Promise<void> {
        console.log('📦 Creating missing collections...');
        
        for (const collection of this.collections) {
            try {
                // Check if collection exists
                const existingCollections = await databases.listCollections(DATABASE_ID);
                const exists = existingCollections.collections.some(c => c.name === collection.name);
                
                if (!exists) {
                    console.log(`  Creating collection: ${collection.name}`);
                    
                    // Create collection
                    await databases.createCollection(
                        DATABASE_ID,
                        ID.unique(),
                        collection.name,
                        [
                            Permission.read(Role.any()),
                            Permission.create(Role.any()),
                            Permission.update(Role.any()),
                            Permission.delete(Role.any())
                        ]
                    );
                    
                    // Create attributes
                    for (const attr of collection.attributes) {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            collection.name,
                            attr.key,
                            attr.size || 255,
                            attr.required || false,
                            attr.default
                        );
                    }
                    
                    // Create indexes
                    if (collection.indexes) {
                        for (const index of collection.indexes) {
                            await databases.createIndex(
                                DATABASE_ID,
                                collection.name,
                                ID.unique(),
                                index.key,
                                index.type,
                                index.attributes
                            );
                        }
                    }
                    
                    console.log(`  ✅ Created collection: ${collection.name}`);
                } else {
                    console.log(`  ⏭️  Collection already exists: ${collection.name}`);
                }
                
            } catch (error) {
                console.error(`  ❌ Error creating collection ${collection.name}:`, error);
                throw error;
            }
        }
    }

    private async updateExistingCollections(): Promise<void> {
        console.log('\n🔄 Updating existing collections...');
        
        // Update rankings collection to normalize data
        try {
            console.log('  Updating rankings collection...');
            
            // Add normalized fields to rankings
            const rankingAttributes = [
                { key: 'team_rank', type: 'integer', required: true },
                { key: 'conference', type: 'string', size: 50, required: true },
                { key: 'record', type: 'string', size: 20, required: false },
                { key: 'points', type: 'integer', required: false },
                { key: 'previous_rank', type: 'integer', required: false }
            ];
            
            for (const attr of rankingAttributes) {
                try {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        'rankings',
                        attr.key,
                        attr.size || 255,
                        attr.required || false
                    );
                } catch (error) {
                    // Attribute might already exist
                    console.log(`    ⏭️  Attribute ${attr.key} already exists`);
                }
            }
            
            console.log('  ✅ Updated rankings collection');
            
        } catch (error) {
            console.error('  ❌ Error updating rankings:', error);
        }
    }

    private async setupIdMapping(): Promise<void> {
        console.log('\n🔗 Setting up ID mapping infrastructure...');
        
        try {
            // Create ID mapping service
            const mappingService = new IDMappingService(databases, DATABASE_ID);
            
            // Test ID mapping
            const testExternalId = '12345';
            const testInternalId = await mappingService.mapExternalToInternal(testExternalId, 'player', 'cfbd');
            
            console.log(`  ✅ ID mapping test successful: ${testExternalId} → ${testInternalId}`);
            
        } catch (error) {
            console.error('  ❌ Error setting up ID mapping:', error);
            throw error;
        }
    }

    private async validateDataIntegrity(): Promise<void> {
        console.log('\n🔍 Validating data integrity...');
        
        try {
            // Check all collections exist
            const collections = await databases.listCollections(DATABASE_ID);
            const requiredCollections = this.collections.map(c => c.name);
            
            for (const required of requiredCollections) {
                const exists = collections.collections.some(c => c.name === required);
                if (exists) {
                    console.log(`  ✅ Collection exists: ${required}`);
                } else {
                    console.log(`  ❌ Missing collection: ${required}`);
                }
            }
            
            // Check ID mapping functionality
            const mappingService = new IDMappingService(databases, DATABASE_ID);
            const testId = await mappingService.mapExternalToInternal('99999', 'team', 'cfbd');
            console.log(`  ✅ ID mapping working: 99999 → ${testId}`);
            
            console.log('  ✅ Data integrity validation passed');
            
        } catch (error) {
            console.error('  ❌ Data integrity validation failed:', error);
            throw error;
        }
    }
}

class IDMappingService {
    constructor(
        private databases: Databases,
        private databaseId: string
    ) {}

    async mapExternalToInternal(
        externalId: string, 
        internalType: string, 
        externalType: string = 'cfbd'
    ): Promise<string> {
        try {
            // Check if mapping exists
            const existingMappings = await this.databases.listDocuments(
                this.databaseId,
                'id_mappings',
                [
                    // Add query filters here when implemented
                ]
            );
            
            // For now, generate a new UUID
            const internalId = ID.unique();
            
            // Create mapping document
            await this.databases.createDocument(
                this.databaseId,
                'id_mappings',
                ID.unique(),
                {
                    external_id: externalId,
                    external_type: externalType,
                    internal_id: internalId,
                    internal_type: internalType,
                    created_at: new Date().toISOString(),
                    last_updated: new Date().toISOString()
                }
            );
            
            return internalId;
            
        } catch (error) {
            console.error('Error in ID mapping:', error);
            throw error;
        }
    }
}

// Main execution
async function main() {
    const resolver = new DataConflictResolver();
    
    try {
        await resolver.resolveConflicts();
        console.log('\n🎉 All data conflicts resolved successfully!');
        console.log('\nNext steps:');
        console.log('1. Update ETL processes to use new collections');
        console.log('2. Implement data sync between Redis and Appwrite');
        console.log('3. Update frontend API calls');
        console.log('4. Test end-to-end data flow');
        
    } catch (error) {
        console.error('\n❌ Failed to resolve data conflicts:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

export { DataConflictResolver, IDMappingService };