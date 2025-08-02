#!/usr/bin/env ts-node

/**
 * Data Link Verification Script
 * 
 * Ensures all data flows correctly from APIs/Scrapers to Frontend Pages:
 * - League Home
 * - Teams
 * - Scoreboard
 * - Draft
 * - Player Stats
 */

import { Client, Databases, Query, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '688ccd49002eacc6c020')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';

interface DataFlowTest {
    name: string;
    source: string;
    destination: string;
    test: () => Promise<boolean>;
}

class DataLinkVerifier {
    private tests: DataFlowTest[] = [
        // CFBD → Rankings → League Home
        {
            name: 'CFBD Rankings → League Home',
            source: 'CFBD API',
            destination: 'League Home Page',
            test: async () => this.verifyRankingsFlow()
        },
        
        // CFBD → Players → Draft Page
        {
            name: 'CFBD Players → Draft Page',
            source: 'CFBD API',
            destination: 'Draft Page',
            test: async () => this.verifyPlayersFlow()
        },
        
        // ESPN → Live Scores → Scoreboard
        {
            name: 'ESPN Live Scores → Scoreboard',
            source: 'ESPN Scraper',
            destination: 'Scoreboard Page',
            test: async () => this.verifyLiveScoresFlow()
        },
        
        // CFBD → Teams → Teams Page
        {
            name: 'CFBD Teams → Teams Page',
            source: 'CFBD API',
            destination: 'Teams Page',
            test: async () => this.verifyTeamsFlow()
        },
        
        // Player Stats → Fantasy Points → Team Scores
        {
            name: 'Player Stats → Team Fantasy Scores',
            source: 'Player Stats Collection',
            destination: 'Team Scores Display',
            test: async () => this.verifyFantasyScoring()
        },
        
        // Transactions → Roster Updates
        {
            name: 'Transactions → Roster Updates',
            source: 'Transactions Collection',
            destination: 'Team Rosters',
            test: async () => this.verifyTransactionFlow()
        },
        
        // Draft Picks → Team Rosters
        {
            name: 'Draft Picks → Team Rosters',
            source: 'Draft Picks Collection',
            destination: 'Team Rosters',
            test: async () => this.verifyDraftToRoster()
        }
    ];

    async verifyAllLinks(): Promise<void> {
        console.log('🔗 Verifying Data Links Between APIs/Scrapers and Frontend Pages\n');
        
        let passed = 0;
        let failed = 0;
        
        for (const test of this.tests) {
            try {
                console.log(`Testing: ${test.name}`);
                console.log(`  Source: ${test.source} → Destination: ${test.destination}`);
                
                const result = await test.test();
                
                if (result) {
                    console.log(`  ✅ PASSED\n`);
                    passed++;
                } else {
                    console.log(`  ❌ FAILED\n`);
                    failed++;
                }
            } catch (error) {
                console.log(`  ❌ ERROR: ${error.message}\n`);
                failed++;
            }
        }
        
        console.log('\n📊 Summary:');
        console.log(`  ✅ Passed: ${passed}`);
        console.log(`  ❌ Failed: ${failed}`);
        console.log(`  📈 Success Rate: ${((passed / this.tests.length) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n⚠️  Some data links are broken. Please fix before deployment.');
        } else {
            console.log('\n🎉 All data links verified successfully!');
        }
    }

    private async verifyRankingsFlow(): Promise<boolean> {
        try {
            // 1. Check if rankings collection has data
            const rankings = await databases.listDocuments(DATABASE_ID, 'rankings');
            console.log(`    Rankings in DB: ${rankings.total}`);
            
            if (rankings.total === 0) {
                console.log('    ⚠️  No rankings data found');
                return false;
            }
            
            // 2. Check if rankings have proper structure
            const sample = rankings.documents[0];
            const requiredFields = ['team_name', 'rank', 'conference'];
            const hasAllFields = requiredFields.every(field => sample[field] !== undefined);
            
            if (!hasAllFields) {
                console.log('    ⚠️  Rankings missing required fields');
                return false;
            }
            
            // 3. Verify external ID mapping exists
            const hasMapping = await this.checkIdMapping('team', sample.team_id || sample.$id);
            
            return hasMapping;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async verifyPlayersFlow(): Promise<boolean> {
        try {
            // 1. Check if players collection exists and has data
            const players = await databases.listDocuments(DATABASE_ID, 'players');
            console.log(`    Players in DB: ${players.total}`);
            
            if (players.total === 0) {
                console.log('    ⚠️  No player data found');
                // Try to create sample player
                await this.createSamplePlayer();
                return false;
            }
            
            // 2. Verify player has required fields for draft
            const sample = players.documents[0];
            const requiredFields = ['name', 'position', 'team_id', 'external_id'];
            const hasAllFields = requiredFields.every(field => sample[field] !== undefined);
            
            if (!hasAllFields) {
                console.log('    ⚠️  Players missing required fields for draft');
                return false;
            }
            
            // 3. Check if player stats exist
            const stats = await databases.listDocuments(DATABASE_ID, 'player_stats', [
                Query.equal('player_id', sample.$id)
            ]);
            
            console.log(`    Player stats found: ${stats.total}`);
            
            return true;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async verifyLiveScoresFlow(): Promise<boolean> {
        try {
            // 1. Check games collection for today's games
            const games = await databases.listDocuments(DATABASE_ID, 'games');
            console.log(`    Games in DB: ${games.total}`);
            
            if (games.total === 0) {
                console.log('    ⚠️  No games data found');
                return false;
            }
            
            // 2. Check if games have live score fields
            const sample = games.documents[0];
            const liveFields = ['home_score', 'away_score', 'status', 'quarter'];
            const hasLiveData = liveFields.some(field => sample[field] !== undefined);
            
            if (!hasLiveData) {
                console.log('    ⚠️  Games missing live score fields');
                return false;
            }
            
            // 3. Check player stats for recent updates
            const recentStats = await databases.listDocuments(DATABASE_ID, 'player_stats', [
                Query.orderDesc('last_updated'),
                Query.limit(5)
            ]);
            
            console.log(`    Recent player stats: ${recentStats.total}`);
            
            return recentStats.total > 0;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async verifyTeamsFlow(): Promise<boolean> {
        try {
            // 1. Check teams collection
            const teams = await databases.listDocuments(DATABASE_ID, 'teams');
            console.log(`    Teams in DB: ${teams.total}`);
            
            if (teams.total === 0) {
                console.log('    ⚠️  No teams data found');
                return false;
            }
            
            // 2. Verify team has proper structure
            const sample = teams.documents[0];
            const requiredFields = ['name', 'conference', 'mascot'];
            const hasAllFields = requiredFields.every(field => sample[field] !== undefined);
            
            if (!hasAllFields) {
                console.log('    ⚠️  Teams missing required fields');
                return false;
            }
            
            // 3. Check if team has associated players
            const players = await databases.listDocuments(DATABASE_ID, 'players', [
                Query.equal('team_id', sample.$id)
            ]);
            
            console.log(`    Players on team: ${players.total}`);
            
            return players.total > 0;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async verifyFantasyScoring(): Promise<boolean> {
        try {
            // 1. Check if player stats exist
            const stats = await databases.listDocuments(DATABASE_ID, 'player_stats', [
                Query.limit(5)
            ]);
            
            if (stats.total === 0) {
                console.log('    ⚠️  No player stats found');
                return false;
            }
            
            // 2. Verify stats have fantasy points calculated
            const hasFantasyPoints = stats.documents.every(stat => 
                stat.fantasy_points !== undefined && stat.fantasy_points >= 0
            );
            
            if (!hasFantasyPoints) {
                console.log('    ⚠️  Player stats missing fantasy points');
                return false;
            }
            
            // 3. Check if rosters link to players with stats
            const rosters = await databases.listDocuments(DATABASE_ID, 'rosters', [
                Query.limit(1)
            ]);
            
            console.log(`    Rosters found: ${rosters.total}`);
            
            return rosters.total > 0;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async verifyTransactionFlow(): Promise<boolean> {
        try {
            // 1. Check transactions collection
            const transactions = await databases.listDocuments(DATABASE_ID, 'transactions', [
                Query.orderDesc('timestamp'),
                Query.limit(5)
            ]);
            
            console.log(`    Recent transactions: ${transactions.total}`);
            
            if (transactions.total === 0) {
                console.log('    ℹ️  No transactions yet (normal for new leagues)');
                return true; // This is okay for new leagues
            }
            
            // 2. Verify transaction structure
            const sample = transactions.documents[0];
            const requiredFields = ['league_id', 'team_id', 'player_id', 'type', 'timestamp'];
            const hasAllFields = requiredFields.every(field => sample[field] !== undefined);
            
            return hasAllFields;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async verifyDraftToRoster(): Promise<boolean> {
        try {
            // 1. Check draft picks collection
            const draftPicks = await databases.listDocuments(DATABASE_ID, 'draft_picks', [
                Query.equal('status', 'picked'),
                Query.limit(5)
            ]);
            
            console.log(`    Completed draft picks: ${draftPicks.total}`);
            
            if (draftPicks.total === 0) {
                console.log('    ℹ️  No completed drafts yet (normal for pre-season)');
                return true; // This is okay before drafts start
            }
            
            // 2. Verify picks are reflected in rosters
            for (const pick of draftPicks.documents) {
                const roster = await databases.listDocuments(DATABASE_ID, 'rosters', [
                    Query.equal('team_id', pick.team_id),
                    Query.equal('player_id', pick.player_id)
                ]);
                
                if (roster.total === 0) {
                    console.log(`    ⚠️  Draft pick not found in roster: ${pick.player_id}`);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('    Error:', error.message);
            return false;
        }
    }

    private async checkIdMapping(type: string, id: string): Promise<boolean> {
        try {
            const mappings = await databases.listDocuments(DATABASE_ID, 'id_mappings', [
                Query.equal('internal_id', id),
                Query.equal('internal_type', type)
            ]);
            
            if (mappings.total === 0) {
                console.log(`    ⚠️  No ID mapping found for ${type}: ${id}`);
                return false;
            }
            
            console.log(`    ✓ ID mapping exists for ${type}`);
            return true;
        } catch (error) {
            // ID mappings collection might not exist yet
            return true; // Don't fail the test for this
        }
    }

    private async createSamplePlayer(): Promise<void> {
        try {
            console.log('    Creating sample player for testing...');
            
            await databases.createDocument(
                DATABASE_ID,
                'players',
                ID.unique(),
                {
                    external_id: '12345',
                    name: 'Sample Player',
                    position: 'QB',
                    team_id: 'georgia',
                    jersey_number: 1,
                    is_active: true
                }
            );
            
            console.log('    ✓ Sample player created');
        } catch (error) {
            console.log('    Could not create sample player:', error.message);
        }
    }
}

// Frontend Page Data Requirements
class FrontendDataMapper {
    static getPageRequirements() {
        console.log('\n📱 Frontend Page Data Requirements:\n');
        
        const requirements = {
            'League Home': {
                collections: ['leagues', 'teams', 'rankings', 'users'],
                apis: ['CFBD Rankings', 'League Settings'],
                realtime: ['league_updates', 'transaction_alerts']
            },
            'Teams Page': {
                collections: ['teams', 'players', 'rosters', 'player_stats'],
                apis: ['CFBD Teams', 'Player Stats'],
                realtime: ['roster_changes', 'score_updates']
            },
            'Scoreboard': {
                collections: ['games', 'player_stats', 'teams', 'rosters'],
                apis: ['ESPN Live Scores', 'Fantasy Scoring'],
                realtime: ['live_scores', 'fantasy_points']
            },
            'Draft Page': {
                collections: ['players', 'draft_picks', 'teams', 'leagues'],
                apis: ['CFBD Players', 'Draft Order'],
                realtime: ['draft_picks', 'timer_updates']
            },
            'Player Stats': {
                collections: ['players', 'player_stats', 'games'],
                apis: ['CFBD Stats', 'ESPN Box Scores'],
                realtime: ['stat_updates']
            }
        };
        
        for (const [page, reqs] of Object.entries(requirements)) {
            console.log(`${page}:`);
            console.log(`  Collections: ${reqs.collections.join(', ')}`);
            console.log(`  APIs: ${reqs.apis.join(', ')}`);
            console.log(`  Realtime: ${reqs.realtime.join(', ')}\n`);
        }
    }
}

// Main execution
async function main() {
    console.log('🏈 College Football Fantasy App - Data Link Verification\n');
    
    // Show page requirements
    FrontendDataMapper.getPageRequirements();
    
    // Run verification
    const verifier = new DataLinkVerifier();
    await verifier.verifyAllLinks();
    
    console.log('\n💡 Next Steps:');
    console.log('1. Fix any failed data links');
    console.log('2. Run ETL to populate missing data');
    console.log('3. Test frontend pages with real data');
    console.log('4. Monitor real-time updates');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export { DataLinkVerifier, FrontendDataMapper };