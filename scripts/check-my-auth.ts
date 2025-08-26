#!/usr/bin/env tsx

import { Client, Account } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Note: This script needs to be run with a session cookie to work
// It won't work with just an API key

async function checkAuthUser() {
  console.log('🔍 To check your Auth user, please run this command in your browser console while logged in:\n');
  console.log('fetch("/api/auth/user").then(r => r.json()).then(console.log)');
  console.log('\nOr check the network tab when loading the dashboard.');
  
  // Let's also check if there are any fantasy teams for the known owner_client_ids
  console.log('\n\n📊 Known owner_client_ids in fantasy_teams:');
  
  const Client = require('node-appwrite').Client;
  const Databases = require('node-appwrite').Databases;
  const Query = require('node-appwrite').Query;
  
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);
  const DATABASE_ID = process.env.DATABASE_ID || 'college-football-fantasy';
  
  try {
    // Get unique owner_client_ids
    const fantasyTeams = await databases.listDocuments(
      DATABASE_ID,
      'fantasy_teams',
      [Query.limit(100)]
    );
    
    const ownerIds = new Set();
    const ownerToTeams: Record<string, string[]> = {};
    
    for (const team of fantasyTeams.documents) {
      ownerIds.add(team.ownerClientId);
      if (!ownerToTeams[team.ownerClientId]) {
        ownerToTeams[team.ownerClientId] = [];
      }
      ownerToTeams[team.ownerClientId].push(team.name);
    }
    
    console.log('\nUnique owner_client_ids and their teams:');
    for (const ownerId of ownerIds) {
      console.log(`\n${ownerId}:`);
      console.log(`  Teams: ${ownerToTeams[ownerId].join(', ')}`);
    }
    
    // Check if Kashyap's ID is in there
    const kashyapId = '68aa1f09001547b92a17';
    if (ownerIds.has(kashyapId)) {
      console.log(`\n✅ Found Kashyap's teams (ID: ${kashyapId}):`);
      console.log(`  ${ownerToTeams[kashyapId].join(', ')}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAuthUser();
