#!/usr/bin/env tsx
/**
 * Fix draftable field for all Power 4 players with fantasy positions
 * This ensures the current roster shows up in the draft UI
 */

import { Client, Databases, Query, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const PLAYERS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players';

if (!APPWRITE_API_KEY) {
  console.error('❌ APPWRITE_API_KEY is required');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

const POWER_4_CONFERENCES = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
const FANTASY_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];
const CURRENT_SEASON = new Date().getFullYear();

async function fixDraftablePlayers() {
  console.log('🔧 Fixing draftable field for Power 4 players...');
  console.log(`📅 Current season: ${CURRENT_SEASON}`);
  console.log(`🏈 Power 4 conferences: ${POWER_4_CONFERENCES.join(', ')}`);
  console.log(`📊 Fantasy positions: ${FANTASY_POSITIONS.join(', ')}`);
  console.log('');

  let totalUpdated = 0;
  let totalProcessed = 0;
  let offset = 0;
  const pageSize = 100;

  try {
    while (true) {
      // Fetch a page of players
      const response = await databases.listDocuments(
        DATABASE_ID,
        PLAYERS_COLLECTION,
        [
          Query.limit(pageSize),
          Query.offset(offset)
        ]
      );

      const players = response.documents;
      if (players.length === 0) break;

      console.log(`📄 Processing page ${Math.floor(offset / pageSize) + 1} (${players.length} players)...`);

      // Process each player
      for (const player of players) {
        totalProcessed++;
        
        // Check if player should be draftable
        const isPower4 = POWER_4_CONFERENCES.includes(player.conference);
        const isFantasyPosition = FANTASY_POSITIONS.includes(player.position);
        const shouldBeDraftable = isPower4 && isFantasyPosition;
        
        // Update if needed
        if (shouldBeDraftable && !player.draftable) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              PLAYERS_COLLECTION,
              player.$id,
              {
                draftable: true,
                power_4: true,
                season: CURRENT_SEASON
              }
            );
            totalUpdated++;
            console.log(`✅ Updated: ${player.name} (${player.position}, ${player.team}) - marked as draftable`);
          } catch (error) {
            console.error(`❌ Failed to update ${player.name}:`, error);
          }
        } else if (!shouldBeDraftable && player.draftable !== false) {
          // Mark non-Power 4 or non-fantasy position players as not draftable
          try {
            await databases.updateDocument(
              DATABASE_ID,
              PLAYERS_COLLECTION,
              player.$id,
              {
                draftable: false
              }
            );
            console.log(`⚠️  Updated: ${player.name} (${player.position}, ${player.team}) - marked as NOT draftable`);
          } catch (error) {
            console.error(`❌ Failed to update ${player.name}:`, error);
          }
        }
      }

      offset += pageSize;
      if (offset >= response.total) break;
    }

    console.log('\n✨ Fix complete!');
    console.log(`📊 Total players processed: ${totalProcessed}`);
    console.log(`✅ Total players updated: ${totalUpdated}`);
    
    // Verify the fix by counting draftable players
    const draftableCount = await databases.listDocuments(
      DATABASE_ID,
      PLAYERS_COLLECTION,
      [
        Query.equal('draftable', true),
        Query.limit(1)
      ]
    );
    
    console.log(`\n🎯 Total draftable players in database: ${draftableCount.total}`);
    
  } catch (error) {
    console.error('❌ Error fixing draftable players:', error);
    process.exit(1);
  }
}

// Run the fix
fixDraftablePlayers().catch(console.error);
