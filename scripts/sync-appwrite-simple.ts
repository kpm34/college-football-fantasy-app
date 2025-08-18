#!/usr/bin/env tsx

/**
 * Simple Schema Sync Script
 * Following your preferred pattern - reads Zod schemas and syncs to Appwrite
 */

import 'dotenv/config';
import { Client, Databases } from "node-appwrite";
// Import from your simplified Zod collections
import { COLLECTIONS } from "../schema/zod-schema";

const endpoint = process.env.APPWRITE_ENDPOINT!;
const project = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.APPWRITE_DATABASE_ID || "college-football-fantasy";

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);

// Helpers for idempotent operations
async function ensureCollection(id: string, name: string) {
  try { 
    await db.getCollection(databaseId, id);
    console.log(`  ✅ Collection '${id}' exists`);
  }
  catch { 
    console.log(`  ➕ Creating collection '${id}'`);
    await db.createCollection(databaseId, id, name);
  }
}

async function ensureStringAttr(collectionId: string, key: string, required: boolean, size = 255, defaultValue?: string) {
  try { 
    await db.getAttribute(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Adding string '${key}' (${size} chars, required: ${required})`);
    // Don't pass defaultValue if required is true
    if (required && defaultValue !== undefined) {
      await db.createStringAttribute(databaseId, collectionId, key, size, required);
    } else {
      await db.createStringAttribute(databaseId, collectionId, key, size, required, defaultValue);
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for attribute
  }
}

async function ensureIntegerAttr(collectionId: string, key: string, required: boolean, min?: number, max?: number, defaultValue?: number) {
  try { 
    await db.getAttribute(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Adding integer '${key}' (required: ${required})`);
    // Don't pass defaultValue if required is true
    if (required && defaultValue !== undefined) {
      await db.createIntegerAttribute(databaseId, collectionId, key, required, min, max);
    } else {
      await db.createIntegerAttribute(databaseId, collectionId, key, required, min, max, defaultValue);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function ensureDoubleAttr(collectionId: string, key: string, required: boolean, defaultValue?: number) {
  try { 
    await db.getAttribute(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Adding double '${key}' (required: ${required})`);
    // Don't pass defaultValue if required is true
    if (required && defaultValue !== undefined) {
      await db.createFloatAttribute(databaseId, collectionId, key, required);
    } else {
      await db.createFloatAttribute(databaseId, collectionId, key, required, undefined, undefined, defaultValue);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function ensureBooleanAttr(collectionId: string, key: string, required: boolean, defaultValue?: boolean) {
  try { 
    await db.getAttribute(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Adding boolean '${key}' (required: ${required})`);
    // Don't pass defaultValue if required is true
    if (required && defaultValue !== undefined) {
      await db.createBooleanAttribute(databaseId, collectionId, key, required);
    } else {
      await db.createBooleanAttribute(databaseId, collectionId, key, required, defaultValue);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function ensureDatetimeAttr(collectionId: string, key: string, required: boolean) {
  try { 
    await db.getAttribute(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Adding datetime '${key}' (required: ${required})`);
    await db.createDatetimeAttribute(databaseId, collectionId, key, required);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function ensureEnumAttr(collectionId: string, key: string, elements: string[], required: boolean, defaultValue?: string) {
  try { 
    await db.getAttribute(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Adding enum '${key}' [${elements.join(', ')}] (required: ${required})`);
    await db.createEnumAttribute(databaseId, collectionId, key, elements, required, defaultValue);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function ensureIndex(collectionId: string, key: string, type: string, attributes: string[]) {
  try { 
    await db.getIndex(databaseId, collectionId, key);
  }
  catch { 
    console.log(`    ➕ Creating ${type} index '${key}' on [${attributes.join(', ')}]`);
    await db.createIndex(databaseId, collectionId, key, type, attributes);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  console.log('🔄 Syncing Schema from Zod SSOT...');
  console.log('════════════════════════════════════');

  try {
    // Ensure database exists
    try {
      await db.get(databaseId);
    } catch {
      console.log(`➕ Creating database '${databaseId}'`);
      await db.create(databaseId, 'College Football Fantasy');
    }

    // Sync Leagues collection
    await ensureCollection("leagues", "Leagues");
    await ensureStringAttr("leagues", "name", true, 128);
    await ensureStringAttr("leagues", "commissioner", true);
    await ensureIntegerAttr("leagues", "season", true, 2024);
    await ensureIntegerAttr("leagues", "maxTeams", true, 2, 32, 12);
    await ensureEnumAttr("leagues", "draftType", ["snake", "auction"], true);
    await ensureEnumAttr("leagues", "gameMode", ["power4", "sec", "acc", "big12", "bigten"], true);
    await ensureEnumAttr("leagues", "status", ["open", "drafting", "active", "complete"], true, "open");
    await ensureBooleanAttr("leagues", "isPublic", true, true);
    
    // Useful indexes
    await ensureIndex("leagues", "status_idx", "key", ["status"]);
    await ensureIndex("leagues", "public_idx", "key", ["isPublic"]);

    // Sync Teams collection
    await ensureCollection("teams", "Teams");
    await ensureStringAttr("teams", "name", true, 128);
    await ensureStringAttr("teams", "abbreviation", true, 10);
    await ensureEnumAttr("teams", "conference", ["SEC", "ACC", "Big 12", "Big Ten"], true);
    await ensureStringAttr("teams", "color", false, 7);
    await ensureStringAttr("teams", "logo", false, 500); // URL
    
    await ensureIndex("teams", "conference_idx", "key", ["conference"]);
    await ensureIndex("teams", "name_search", "fulltext", ["name"]);

    // Sync College Players collection
    await ensureCollection("college_players", "College Players");
    await ensureStringAttr("college_players", "name", true, 128);
    await ensureEnumAttr("college_players", "position", ["QB", "RB", "WR", "TE", "K", "DEF"], true);
    await ensureStringAttr("college_players", "team", true, 50);
    await ensureEnumAttr("college_players", "conference", ["SEC", "ACC", "Big 12", "Big Ten"], true);
    await ensureBooleanAttr("college_players", "eligible", true, true);
    await ensureDoubleAttr("college_players", "fantasy_points", true, 0);
    await ensureIntegerAttr("college_players", "depth_chart_order", false);
    
    await ensureIndex("college_players", "position_idx", "key", ["position"]);
    await ensureIndex("college_players", "team_idx", "key", ["team"]);
    await ensureIndex("college_players", "points_idx", "key", ["fantasy_points"]);
    await ensureIndex("college_players", "name_search", "fulltext", ["name"]);

    // Sync User Teams collection
    await ensureCollection("user_teams", "User Teams");
    await ensureStringAttr("user_teams", "leagueId", true);
    await ensureStringAttr("user_teams", "userId", true);
    await ensureStringAttr("user_teams", "teamName", true, 128);
    await ensureIntegerAttr("user_teams", "draftPosition", false, 1);
    await ensureIntegerAttr("user_teams", "wins", true, 0, undefined, 0);
    await ensureIntegerAttr("user_teams", "losses", true, 0, undefined, 0);
    await ensureDoubleAttr("user_teams", "pointsFor", true, 0);
    await ensureDoubleAttr("user_teams", "pointsAgainst", true, 0);
    await ensureStringAttr("user_teams", "players", true, 5000, "[]"); // JSON array of player IDs
    
    await ensureIndex("user_teams", "league_idx", "key", ["leagueId"]);
    await ensureIndex("user_teams", "user_idx", "key", ["userId"]);
    await ensureIndex("user_teams", "league_user_idx", "unique", ["leagueId", "userId"]);

    // Sync Games collection  
    await ensureCollection("games", "Games");
    await ensureIntegerAttr("games", "week", true, 1, 20);
    await ensureIntegerAttr("games", "season", true, 2024);
    await ensureStringAttr("games", "home_team", true);
    await ensureStringAttr("games", "away_team", true);
    await ensureDatetimeAttr("games", "start_date", true);
    await ensureBooleanAttr("games", "completed", true, false);
    await ensureBooleanAttr("games", "eligible_game", true, false);
    
    await ensureIndex("games", "week_idx", "key", ["week", "season"]);
    await ensureIndex("games", "eligible_idx", "key", ["eligible_game"]);

    console.log('\n🎉 Schema sync complete!');
    console.log(`✅ Database: ${databaseId}`);
    console.log('✅ Collections: leagues, teams, college_players, rosters, games');

  } catch (error: any) {
    console.error('❌ Schema sync failed:', error);
    process.exit(1);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});