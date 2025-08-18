#!/usr/bin/env tsx
/**
 * Export College Players Database to JSON
 * 
 * Exports all college players from the Appwrite database to a JSON file
 * with proper formatting and validation
 */

import { Client, Databases } from 'node-appwrite';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

interface PlayerExport {
  exportMetadata: {
    timestamp: string;
    totalPlayers: number;
    collections: string[];
    source: string;
    version: string;
  };
  players: any[];
}

async function exportCollegePlayers(): Promise<PlayerExport> {
  console.log('🏈 Exporting College Players Database');
  console.log('====================================');

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
    console.log(`📊 Fetching players from: ${COLLECTIONS.COLLEGE_PLAYERS}`);
    
    // Fetch all players with pagination
    const allPlayers: any[] = [];
    let offset = 0;
    const limit = 100; // Appwrite's max limit per request
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Fetching batch ${Math.floor(offset / limit) + 1} (offset: ${offset})`);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COLLEGE_PLAYERS,
        [],  // queries array
        limit,  // limit parameter
        offset  // offset parameter
      );

      allPlayers.push(...response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;

      console.log(`  ✓ Fetched ${response.documents.length} players (total: ${allPlayers.length})`);
    }

    console.log(`✅ Successfully fetched ${allPlayers.length} total players`);

    // Create export object
    const exportData: PlayerExport = {
      exportMetadata: {
        timestamp: new Date().toISOString(),
        totalPlayers: allPlayers.length,
        collections: [COLLECTIONS.COLLEGE_PLAYERS],
        source: `${APPWRITE_ENDPOINT}/${APPWRITE_PROJECT_ID}/${DATABASE_ID}`,
        version: '1.0.0-SSOT'
      },
      players: allPlayers.map(player => ({
        // Core player info
        $id: player.$id,
        $createdAt: player.$createdAt,
        $updatedAt: player.$updatedAt,
        
        // Player attributes from SSOT schema
        name: player.name,
        position: player.position,
        team: player.team,
        conference: player.conference,
        jerseyNumber: player.jerseyNumber,
        height: player.height,
        weight: player.weight,
        year: player.year,
        eligible: player.eligible,
        fantasy_points: player.fantasy_points,
        season_fantasy_points: player.season_fantasy_points,
        depth_chart_order: player.depth_chart_order,
        last_projection_update: player.last_projection_update,
        external_id: player.external_id,
        image_url: player.image_url,
        stats: player.stats
      }))
    };

    return exportData;

  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const exportData = await exportCollegePlayers();
    
    // Ensure exports directory exists
    const exportsDir = join(process.cwd(), 'exports');
    if (!existsSync(exportsDir)) {
      mkdirSync(exportsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `college-players-${timestamp}.json`;
    const filepath = join(exportsDir, filename);

    // Write JSON file
    writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf-8');
    
    console.log('\n📊 Export Summary:');
    console.log('==================');
    console.log(`✅ Players exported: ${exportData.exportMetadata.totalPlayers}`);
    console.log(`📁 File location: ${filepath}`);
    console.log(`📏 File size: ${(JSON.stringify(exportData).length / 1024).toFixed(2)} KB`);
    
    // Distribution by conference
    const conferenceStats = exportData.players.reduce((acc, player) => {
      const conf = player.conference || 'Unknown';
      acc[conf] = (acc[conf] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n🏛️ Conference Distribution:');
    Object.entries(conferenceStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([conf, count]) => {
        console.log(`  ${conf}: ${count} players`);
      });

    // Distribution by position
    const positionStats = exportData.players.reduce((acc, player) => {
      const pos = player.position || 'Unknown';
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n🏈 Position Distribution:');
    Object.entries(positionStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pos, count]) => {
        console.log(`  ${pos}: ${count} players`);
      });

    // Top fantasy point scorers
    const topScorers = exportData.players
      .filter(p => p.fantasy_points > 0)
      .sort((a, b) => (b.fantasy_points || 0) - (a.fantasy_points || 0))
      .slice(0, 5);

    if (topScorers.length > 0) {
      console.log('\n🏆 Top 5 Fantasy Point Scorers:');
      topScorers.forEach((player, i) => {
        console.log(`  ${i + 1}. ${player.name} (${player.team} ${player.position}): ${player.fantasy_points} pts`);
      });
    }

    console.log('\n🎯 Export completed successfully!');
    console.log(`📄 Use this file for data analysis, backups, or external integrations`);

  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { exportCollegePlayers };