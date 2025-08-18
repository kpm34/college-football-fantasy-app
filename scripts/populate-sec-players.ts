#!/usr/bin/env tsx
/**
 * Populate SEC Players - Extract and Import from Markdown Files
 * 
 * This script will parse all SEC team markdown files and extract players
 * for QB, RB, WR, TE, K positions, then populate the database following
 * the SSOT schema requirements.
 */

import { Client, Databases, ID } from 'node-appwrite';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { COLLECTIONS } from '../schema/zod-schema.js';

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

// Target positions
const TARGET_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];

// SEC team name mapping
const TEAM_NAME_MAPPING: Record<string, string> = {
  'Alabama2025.md': 'Alabama',
  'Arkansas2025.md': 'Arkansas', 
  'Auburn2025.md': 'Auburn',
  'Florida2025.md': 'Florida',
  'Georgia2025 .md': 'Georgia',
  'Kentucky2025.md': 'Kentucky',
  'LSU2025.md': 'LSU',
  'Mississippi2025.md': 'Mississippi State',
  'Missouri2025.md': 'Missouri',
  'Oklahoma2025.md': 'Oklahoma',
  'OleMiss2025.md': 'Ole Miss',
  'SouthCarolinaGamecocks2025.md': 'South Carolina',
  'Tennessee2025.md': 'Tennessee',
  'Texas2025.md': 'Texas',
  'TexasA&M2025.md': 'Texas A&M',
  'Vanderbilt2025.md': 'Vanderbilt'
};

interface PlayerData {
  name: string;
  jerseyNumber?: number;
  position: string;
  height?: string;
  weight?: number;
  year?: string;
  team: string;
  conference: string;
}

function parseWeight(weightStr: string): number | undefined {
  const match = weightStr.match(/\d+/);
  if (match) {
    const weight = parseInt(match[0]);
    return weight >= 150 && weight <= 400 ? weight : undefined;
  }
  return undefined;
}

function parseYear(yearStr: string): string | undefined {
  const normalized = yearStr.toUpperCase().trim();
  if (['FR', 'SO', 'JR', 'SR'].includes(normalized)) {
    return normalized;
  }
  return undefined;
}

function generateFantasyPoints(position: string): number {
  // Default fantasy point projections based on position
  const basePoints: Record<string, number> = {
    'QB': 340,
    'RB': 280, 
    'WR': 240,
    'TE': 180,
    'K': 140
  };
  
  // Add some variance (±20%)
  const base = basePoints[position] || 200;
  const variance = Math.random() * 0.4 - 0.2; // -20% to +20%
  return Math.round(base * (1 + variance));
}

function extractPlayersFromMarkdown(filePath: string, teamName: string): PlayerData[] {
  const content = readFileSync(filePath, 'utf-8');
  const players: PlayerData[] = [];
  
  // Extract player data from non-table text sections
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Look for player roster lines in format: "Name Jersey POS Height Weight Year ..."
    // Skip table formatting and headers
    if (line.includes('|') || line.includes('---') || line.includes('NAME') || 
        line.includes('JERSEY') || line.includes('POS') || line.length < 20) {
      continue;
    }
    
    // Match pattern: Name followed by number, position, dimensions, etc.
    // Example: "Cole Adams 7 WR 5-10 183 SO Owasso     0.9042"
    const match = line.match(/^([A-Za-z\s\.\-\']+?)\s+(\d{1,2})\s+(QB|RB|WR|TE|K|P|LS|DB|DL|OL|LB)\s+([\d\-]+)\s+(\d+)\s+(FR|SO|JR|SR)/);
    
    if (match) {
      const [, name, jersey, position, height, weight, year] = match;
      
      // Only include target positions
      if (TARGET_POSITIONS.includes(position)) {
        players.push({
          name: name.trim(),
          jerseyNumber: parseInt(jersey),
          position,
          height: height.trim(),
          weight: parseWeight(weight),
          year: parseYear(year),
          team: teamName,
          conference: 'SEC'
        });
      }
    }
  }
  
  return players;
}

async function populateSECPlayers(): Promise<void> {
  console.log('🏈 SEC Player Population from Markdown Files');
  console.log('===============================================');

  if (!APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  const markdownDir = '/Users/kashyapmaheshwari/college-football-fantasy-app/confrence rosters/SEC_College_Football/markdown';
  
  try {
    const files = readdirSync(markdownDir);
    const mdFiles = files.filter(file => 
      file.endsWith('.md') && 
      file !== 'INDEX.md' && 
      TEAM_NAME_MAPPING[file]
    );

    console.log(`📂 Found ${mdFiles.length} SEC team markdown files`);

    let totalPlayers = 0;
    let successfulInserts = 0;
    let errors = 0;

    for (const file of mdFiles) {
      const teamName = TEAM_NAME_MAPPING[file];
      const filePath = join(markdownDir, file);
      
      console.log(`\n🔍 Processing ${teamName}...`);
      
      try {
        const players = extractPlayersFromMarkdown(filePath, teamName);
        console.log(`  📊 Found ${players.length} eligible players`);
        
        if (players.length > 0) {
          // Show player breakdown by position
          const positionCounts: Record<string, number> = {};
          players.forEach(p => {
            positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
          });
          
          console.log(`  📋 Positions: ${Object.entries(positionCounts)
            .map(([pos, count]) => `${pos}:${count}`)
            .join(', ')}`);
        }

        // Insert players into database
        for (const player of players) {
          try {
            const fantasyPoints = generateFantasyPoints(player.position);
            const now = new Date().toISOString();
            
            const playerDoc = {
              // Basic info
              name: player.name,
              position: player.position,
              team: player.team,
              conference: player.conference,
              year: player.year || 'FR',
              
              // Required boolean fields
              draftable: true,
              power_4: true,
              eligible: true,
              
              // Required string fields  
              jersey: player.jerseyNumber?.toString() || '0',
              height: player.height || '6-0',
              weight: player.weight?.toString() || '200',
              created_at: now,
              updated_at: now,
              
              // Required projection fields
              projection: fantasyPoints,
              rushing_projection: player.position === 'RB' ? fantasyPoints * 0.6 : 0,
              receiving_projection: ['WR', 'TE'].includes(player.position) ? fantasyPoints * 0.8 : 0,
              td_projection: Math.round(fantasyPoints / 20),
              int_projection: player.position === 'QB' ? Math.round(fantasyPoints / 50) : 0,
              field_goals_projection: player.position === 'K' ? fantasyPoints * 0.4 : 0,
              extra_points_projection: player.position === 'K' ? fantasyPoints * 0.6 : 0,
              fantasy_points: fantasyPoints,
              
              // Optional fields
              depth_chart_order: null,
              external_id: null
            };

            await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.COLLEGE_PLAYERS,
              ID.unique(),
              playerDoc
            );
            
            successfulInserts++;
            
            if (successfulInserts % 25 === 0) {
              console.log(`    ✅ Inserted ${successfulInserts} players so far...`);
            }
            
          } catch (error: any) {
            console.log(`    ❌ Failed to insert ${player.name}: ${error.message}`);
            errors++;
          }
        }
        
        totalPlayers += players.length;
        console.log(`  ✅ ${teamName} complete: ${players.length} players processed`);
        
      } catch (error: any) {
        console.log(`  ❌ Error processing ${teamName}: ${error.message}`);
        errors++;
      }
    }

    // Final summary
    console.log('\n📊 Final Results:');
    console.log('=================');
    console.log(`🎯 Total players found: ${totalPlayers}`);
    console.log(`✅ Successfully inserted: ${successfulInserts}`);
    console.log(`❌ Errors encountered: ${errors}`);
    console.log(`📈 Success rate: ${Math.round((successfulInserts / totalPlayers) * 100)}%`);

    // Verify database state
    const finalCheck = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COLLEGE_PLAYERS,
      []
    );

    const secPlayers = finalCheck.documents.filter(player => player.conference === 'SEC');
    
    console.log(`\n🔍 Database verification:`);
    console.log(`📊 Total players in database: ${finalCheck.total}`);
    console.log(`🏈 SEC players in database: ${secPlayers.length}`);

    if (secPlayers.length > 0) {
      // Show breakdown by position
      const positionBreakdown: Record<string, number> = {};
      secPlayers.forEach(player => {
        const pos = player.position as string;
        positionBreakdown[pos] = (positionBreakdown[pos] || 0) + 1;
      });
      
      console.log(`📋 SEC Position breakdown:`);
      Object.entries(positionBreakdown).forEach(([pos, count]) => {
        console.log(`  ${pos}: ${count} players`);
      });
    }

    if (successfulInserts > 0) {
      console.log('\n🎉 SUCCESS: SEC players have been successfully populated!');
    } else {
      console.log('\n⚠️ WARNING: No players were successfully inserted');
    }

  } catch (error: any) {
    console.error('❌ Population failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await populateSECPlayers();
  } catch (error: any) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { populateSECPlayers };