#!/usr/bin/env tsx
/**
 * Compress College Players Data for ChatGPT Prompt
 * 
 * Creates a minimal, Base64-compressed version of player data
 * optimized for ChatGPT prompt usage
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

interface MinimalPlayer {
  id: string;
  name: string;
  pos: string;  // position shortened
  team: string;
  conf: string; // conference shortened
  pts: number;  // fantasy_points shortened
  ht?: string;  // height optional
  wt?: number;  // weight optional
  yr?: string;  // year optional
}

function compressPlayersForPrompt() {
  console.log('🗜️ Compressing College Players for ChatGPT Prompt');
  console.log('=================================================');

  const inputFile = join(process.cwd(), 'exports/college-players-2025-08-18.json');
  
  if (!existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`);
  }

  // Read original data
  const originalData = JSON.parse(readFileSync(inputFile, 'utf-8'));
  console.log(`📊 Original data: ${originalData.players.length} players`);

  // Create minimal structure
  const minimalData = {
    meta: {
      ts: new Date().toISOString().split('T')[0], // date only
      cnt: originalData.players.length,
      src: "CFB_Fantasy_DB"
    },
    players: originalData.players.map((player: any): MinimalPlayer => ({
      id: player.$id.slice(-8), // last 8 chars of ID
      name: player.name,
      pos: player.position,
      team: player.team,
      conf: player.conference,
      pts: player.fantasy_points || 0,
      ...(player.height && { ht: player.height }),
      ...(player.weight && { wt: parseInt(player.weight) }),
      ...(player.year && { yr: player.year })
    }))
  };

  // Convert to JSON
  const minimalJson = JSON.stringify(minimalData);
  console.log(`📏 Minimal JSON size: ${(minimalJson.length / 1024).toFixed(2)} KB`);

  // Compress with gzip
  const compressed = gzipSync(minimalJson);
  console.log(`🗜️ Compressed size: ${(compressed.length / 1024).toFixed(2)} KB`);

  // Convert to Base64
  const base64 = compressed.toString('base64');
  console.log(`📦 Base64 size: ${(base64.length / 1024).toFixed(2)} KB`);

  // Create prompt-ready format
  const promptData = {
    format: "gzip+base64",
    data: base64,
    instructions: "Decode with: JSON.parse(require('zlib').gunzipSync(Buffer.from(data, 'base64')).toString())",
    schema: {
      meta: { ts: "date", cnt: "count", src: "source" },
      players: [{
        id: "short_id", name: "player_name", pos: "position", 
        team: "team_name", conf: "conference", pts: "fantasy_points",
        ht: "height?", wt: "weight?", yr: "year?"
      }]
    }
  };

  // Write compressed file
  const outputFile = join(process.cwd(), 'exports/players-compressed-prompt.json');
  writeFileSync(outputFile, JSON.stringify(promptData, null, 2), 'utf-8');

  // Create a direct prompt file
  const promptText = `College Football Fantasy Players Database (Compressed):

Format: gzip+base64 compressed JSON
Decode with: JSON.parse(require('zlib').gunzipSync(Buffer.from(data, 'base64')).toString())

Data: ${base64}

Schema:
- meta: {ts: date, cnt: count, src: source}  
- players: [{id, name, pos, team, conf, pts, ht?, wt?, yr?}]

This contains ${minimalData.meta.cnt} college football players with fantasy points, positions, teams, and conferences.`;

  const promptFile = join(process.cwd(), 'exports/chatgpt-prompt-ready.txt');
  writeFileSync(promptFile, promptText, 'utf-8');

  console.log('\n📁 Files Created:');
  console.log(`📦 Structured: ${outputFile}`);
  console.log(`💬 Prompt Ready: ${promptFile}`);
  
  console.log('\n📊 Compression Results:');
  console.log(`Original: ${(originalData.players.length * 200).toFixed(0)} bytes (est)`);
  console.log(`Minimal: ${minimalJson.length} bytes`);
  console.log(`Compressed: ${compressed.length} bytes`);
  console.log(`Base64: ${base64.length} bytes`);
  console.log(`Compression ratio: ${(compressed.length / minimalJson.length * 100).toFixed(1)}%`);

  // Check if it's small enough for ChatGPT (typical limit ~32K tokens ≈ 128KB)
  const isSmallEnough = base64.length < 100000; // 100KB safety margin
  console.log(`\n${isSmallEnough ? '✅' : '❌'} ChatGPT compatible: ${base64.length < 100000 ? 'Yes' : 'No'} (${(base64.length / 1024).toFixed(1)}KB)`);

  if (!isSmallEnough) {
    console.log('⚠️  Consider further reduction for ChatGPT usage');
  }

  return {
    originalSize: minimalJson.length,
    compressedSize: compressed.length,
    base64Size: base64.length,
    base64Data: base64,
    promptFile: promptFile
  };
}

async function main() {
  try {
    const result = compressPlayersForPrompt();
    console.log('\n🎯 Compression completed successfully!');
    console.log('💬 Files are ready for ChatGPT prompt usage');
  } catch (error: any) {
    console.error('❌ Compression failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { compressPlayersForPrompt };