#!/usr/bin/env tsx
import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function createDraftPicksCollection() {
  console.log('🎯 Creating draft_picks collection (Bridge between college_players → fantasy_teams)\n');
  
  try {
    // First check if collection exists and delete if needed
    try {
      await databases.deleteCollection(DATABASE_ID, 'draft_picks');
      console.log('🗑️  Deleted existing draft_picks collection');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for deletion
    } catch (e) {
      // Collection doesn't exist, continue
    }
    
    // Create the collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      'draft_picks',
      'Draft Picks',
      [
        // Read permissions for all users
        'read("any")',
        // Write permissions for authenticated users
        'write("users")',
        // Delete permissions for authenticated users
        'delete("users")'
      ]
    );
    
    console.log('✅ Collection created:', collection.name);
    console.log('   Purpose: Links college_players → league_memberships → fantasy_teams\n');
    
    // Add attributes
    console.log('📝 Adding attributes...\n');
    
    // === CORE RELATIONSHIPS ===
    console.log('🔗 Core Relationships:');
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'leagueId', 64, true);
    console.log('  ✓ leagueId (links to leagues)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'draftId', 64, true);
    console.log('  ✓ draftId (links to drafts)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerId', 64, true);
    console.log('  ✓ playerId (links to college_players)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'authUserId', 64, true);
    console.log('  ✓ authUserId (links to league_memberships)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'fantasyTeamId', 64, false);
    console.log('  ✓ fantasyTeamId (links to fantasy_teams)\n');
    
    // === DRAFT CONTEXT ===
    console.log('📊 Draft Context:');
    await databases.createIntegerAttribute(DATABASE_ID, 'draft_picks', 'round', true);
    console.log('  ✓ round');
    
    await databases.createIntegerAttribute(DATABASE_ID, 'draft_picks', 'pick', true);
    console.log('  ✓ pick (pick within round)');
    
    await databases.createIntegerAttribute(DATABASE_ID, 'draft_picks', 'overallPick', true);
    console.log('  ✓ overallPick (overall draft position)');
    
    await databases.createDatetimeAttribute(DATABASE_ID, 'draft_picks', 'timestamp', true);
    console.log('  ✓ timestamp (when picked)\n');
    
    // === DENORMALIZED PLAYER DATA (for performance) ===
    console.log('🏈 Player Data (Denormalized):');
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerName', 100, true);
    console.log('  ✓ playerName');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerPosition', 10, true);
    console.log('  ✓ playerPosition (QB/RB/WR/TE/K)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerTeam', 50, true);
    console.log('  ✓ playerTeam (college team)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'playerConference', 50, false);
    console.log('  ✓ playerConference\n');
    
    // === DENORMALIZED TEAM DATA ===
    console.log('👥 Team Data (Denormalized):');
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'teamName', 100, true);
    console.log('  ✓ teamName (fantasy team name)');
    
    await databases.createStringAttribute(DATABASE_ID, 'draft_picks', 'ownerDisplayName', 100, false);
    console.log('  ✓ ownerDisplayName\n');
    
    // === ANALYTICS DATA ===
    console.log('📈 Analytics:');
    await databases.createFloatAttribute(DATABASE_ID, 'draft_picks', 'adp', false);
    console.log('  ✓ adp (average draft position)');
    
    await databases.createFloatAttribute(DATABASE_ID, 'draft_picks', 'projectedPoints', false);
    console.log('  ✓ projectedPoints');
    
    await databases.createFloatAttribute(DATABASE_ID, 'draft_picks', 'actualPoints', false, 0);
    console.log('  ✓ actualPoints (updated during season)\n');
    
    // === STATUS ===
    console.log('🚦 Status:');
    await databases.createBooleanAttribute(DATABASE_ID, 'draft_picks', 'isKeeper', false, false);
    console.log('  ✓ isKeeper (for future keeper leagues)');
    
    await databases.createBooleanAttribute(DATABASE_ID, 'draft_picks', 'onRoster', false, true);
    console.log('  ✓ onRoster (still on team roster)\n');
    
    // Create indexes
    console.log('🔍 Creating indexes...\n');
    
    // Wait a bit for attributes to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'draft_picks',
        'key' as any,
        'idx_leagueId',
        ['leagueId'],
        ['asc']
      );
      console.log('  ✓ Index on leagueId');
    } catch (e: any) {
      console.log('  ⚠️  Index on leagueId:', e.message);
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'draft_picks',
        'key' as any,
        'idx_draftId',
        ['draftId'],
        ['asc']
      );
      console.log('  ✓ Index on draftId');
    } catch (e: any) {
      console.log('  ⚠️  Index on draftId:', e.message);
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'draft_picks',
        'key' as any,
        'idx_authUserId',
        ['authUserId'],
        ['asc']
      );
      console.log('  ✓ Index on authUserId');
    } catch (e: any) {
      console.log('  ⚠️  Index on authUserId:', e.message);
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'draft_picks',
        'key' as any,
        'idx_fantasyTeamId',
        ['fantasyTeamId'],
        ['asc']
      );
      console.log('  ✓ Index on fantasyTeamId');
    } catch (e: any) {
      console.log('  ⚠️  Index on fantasyTeamId:', e.message);
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'draft_picks',
        'key' as any,
        'idx_overallPick',
        ['overallPick'],
        ['asc']
      );
      console.log('  ✓ Index on overallPick');
    } catch (e: any) {
      console.log('  ⚠️  Index on overallPick:', e.message);
    }
    
    console.log('\n✅ draft_picks collection created successfully!');
    console.log('\n📋 Collection Purpose:');
    console.log('   1. Records each pick during the draft');
    console.log('   2. Links college_players to league members');
    console.log('   3. Becomes the roster for fantasy_teams');
    console.log('   4. Shows in "Locker Room" for the season');
    console.log('   5. Tracks player performance throughout season\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

createDraftPicksCollection();
