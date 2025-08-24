#!/usr/bin/env tsx

import { Client, Databases, Query, Users } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const users = new Users(client);
const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';

async function addDisplayNames() {
  console.log('🏷️ Adding display names to fantasy_teams and league_memberships...\n');
  
  try {
    // First, let's add the display_name attribute to the collections if they don't exist
    console.log('📝 Adding display_name attributes to collections...\n');
    
    // Add to fantasy_teams
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        'fantasy_teams',
        'display_name',
        255,
        false // not required
      );
      console.log('✅ Added display_name to fantasy_teams');
    } catch (e: any) {
      if (e.message?.includes('Attribute already exists')) {
        console.log('ℹ️ display_name already exists in fantasy_teams');
      } else {
        console.error('Error adding to fantasy_teams:', e.message);
      }
    }
    
    // Add to league_memberships
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        'league_memberships',
        'display_name',
        255,
        false // not required
      );
      console.log('✅ Added display_name to league_memberships');
    } catch (e: any) {
      if (e.message?.includes('Attribute already exists')) {
        console.log('ℹ️ display_name already exists in league_memberships');
      } else {
        console.error('Error adding to league_memberships:', e.message);
      }
    }
    
    // Wait for attributes to be created
    console.log('\n⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Now update existing records with display names
    console.log('\n📊 Updating existing records with display names...\n');
    
    // Get all unique owner_client_ids from fantasy_teams
    const fantasyTeams = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [Query.limit(100)]
    );
    
    const ownerIds = new Set<string>();
    for (const team of fantasyTeams.documents) {
      if (team.owner_client_id && !team.owner_client_id.startsWith('BOT-')) {
        ownerIds.add(team.owner_client_id);
      }
    }
    
    // Get display names from Auth users
    const userDisplayNames: Record<string, string> = {};
    for (const userId of ownerIds) {
      try {
        const user = await users.get(userId);
        userDisplayNames[userId] = user.name || user.email || userId;
        console.log(`Found user: ${userDisplayNames[userId]} (${userId})`);
      } catch (e) {
        console.log(`Could not find auth user for ${userId}`);
        userDisplayNames[userId] = 'Unknown User';
      }
    }
    
    // Update fantasy_teams with display names
    console.log('\n📝 Updating fantasy_teams...');
    for (const team of fantasyTeams.documents) {
      if (team.owner_client_id && !team.owner_client_id.startsWith('BOT-')) {
        const displayName = userDisplayNames[team.owner_client_id] || 'Unknown User';
        try {
          await databases.updateDocument(
            DATABASE_ID,
            'fantasy_teams',
            team.$id,
            {
              display_name: displayName
            }
          );
          console.log(`  Updated ${team.name} - Owner: ${displayName}`);
        } catch (e: any) {
          console.error(`  Error updating ${team.name}:`, e.message);
        }
      }
    }
    
    // Update league_memberships with display names
    console.log('\n📝 Updating league_memberships...');
    const memberships = await databases.listDocuments(
      DATABASE_ID,
      'league_memberships',
      [Query.limit(100)]
    );
    
    for (const membership of memberships.documents) {
      if (membership.client_id && !membership.client_id.startsWith('BOT-')) {
        try {
          const user = await users.get(membership.client_id);
          const displayName = user.name || user.email || membership.client_id;
          
          await databases.updateDocument(
            DATABASE_ID,
            'league_memberships',
            membership.$id,
            {
              display_name: displayName
            }
          );
          console.log(`  Updated membership for ${displayName} in league ${membership.league_id}`);
        } catch (e: any) {
          console.error(`  Error updating membership:`, e.message);
        }
      }
    }
    
    console.log('\n✅ Display names added successfully!');
    
  } catch (error) {
    console.error('Error adding display names:', error);
  }
}

addDisplayNames();
