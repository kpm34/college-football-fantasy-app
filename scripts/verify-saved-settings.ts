#!/usr/bin/env tsx
/**
 * Verify the commissioner settings were saved in Appwrite
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client();

// Use environment variables or fallback to known values
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const apiKey = process.env.APPWRITE_API_KEY || 'standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891';

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

async function verifySettings() {
  console.log('🔍 Checking saved commissioner settings in Appwrite...\n');
  console.log('📡 Connection Details:');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project: ${projectId}`);
  console.log(`   Database: ${DATABASE_ID}\n`);

  try {
    // Get the test xl league
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      []
    );

    // Find test xl league
    const testXl = leagues.documents.find(l => 
      l.name.toLowerCase() === 'test xl' || 
      l.name.toLowerCase().includes('test xl')
    );

    if (!testXl) {
      console.log('❌ League "test xl" not found');
      return;
    }

    console.log('✅ Found League: test xl');
    console.log(`   ID: ${testXl.$id}`);
    console.log(`   Created: ${new Date(testXl.$createdAt).toLocaleString()}`);
    console.log(`   Updated: ${new Date(testXl.$updatedAt).toLocaleString()}\n`);

    console.log('📊 Commissioner Settings:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Basic Settings
    console.log('\n🏆 Basic Settings:');
    console.log(`   Name: ${testXl.name}`);
    console.log(`   Max Teams: ${testXl.maxTeams}`);
    console.log(`   Current Teams: ${testXl.currentTeams}`);
    console.log(`   Is Public: ${testXl.isPublic}`);
    console.log(`   Status: ${testXl.status}`);
    console.log(`   Game Mode: ${testXl.gameMode}`);
    console.log(`   Draft Type: ${testXl.draftType}`);
    
    // Draft Settings
    console.log('\n📅 Draft Settings:');
    console.log(`   Draft Date: ${testXl.draftDate || 'Not set'}`);
    if (testXl.draftDate) {
      const draftDate = new Date(testXl.draftDate);
      console.log(`   → Formatted: ${draftDate.toLocaleString()}`);
    }
    console.log(`   Pick Time (seconds): ${testXl.pickTimeSeconds}`);
    
    // Season Settings
    console.log('\n🏈 Season Settings:');
    console.log(`   Season: ${testXl.season}`);
    console.log(`   Season Start Week: ${testXl.seasonStartWeek || 'Not set'}`);
    console.log(`   Selected Conference: ${testXl.selectedConference || 'Not set'}`);
    
    // Playoff Settings
    console.log('\n🏆 Playoff Settings:');
    console.log(`   Playoff Teams: ${testXl.playoffTeams || 'Not set'}`);
    console.log(`   Playoff Start Week: ${testXl.playoffStartWeek || 'Not set'}`);
    
    // Waiver Settings
    console.log('\n💰 Waiver Settings:');
    console.log(`   Waiver Type: ${testXl.waiverType || 'Not set'}`);
    console.log(`   Waiver Budget: ${testXl.waiverBudget || 'Not set'}`);
    
    // Private League Settings
    console.log('\n🔒 Privacy Settings:');
    console.log(`   Password: ${testXl.password ? '****** (set)' : 'Not set'}`);
    
    // Scoring Rules
    console.log('\n📊 Scoring Rules:');
    if (testXl.scoringRules) {
      try {
        const rules = JSON.parse(testXl.scoringRules);
        console.log(`   → ${Object.keys(rules).length} scoring rules configured`);
      } catch {
        console.log(`   → Raw value: ${testXl.scoringRules}`);
      }
    } else {
      console.log('   → Not configured');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All settings successfully retrieved from Appwrite!');
    
    // Check which fields were recently updated
    const updatedTime = new Date(testXl.$updatedAt);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - updatedTime.getTime()) / 60000);
    
    if (minutesAgo < 5) {
      console.log(`\n🕐 League was updated ${minutesAgo} minute(s) ago - Settings are fresh!`);
    }

  } catch (error: any) {
    console.error('❌ Error fetching league settings:', error.message);
    if (error.code === 401) {
      console.error('   → Authentication issue. Check API key.');
    }
  }
}

// Note for future sessions
console.log('📝 Note: MCP Configuration Available');
console.log('   Cursor has MCP config for Appwrite in ~/.cursor/mcp.json');
console.log('   This enables direct Appwrite operations via MCP tools.\n');

verifySettings();
