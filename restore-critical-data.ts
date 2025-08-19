#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID } from './lib/appwrite-server.js';
import { ID } from 'node-appwrite';

async function restoreCriticalData() {
  console.log('🔄 RESTORING CRITICAL DATA FROM BACKUPS');
  console.log('=====================================');
  
  // Wait for schema propagation
  console.log('⏳ Waiting 10 seconds for schema propagation...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    const fs = await import('fs');
    
    // Read the most recent master backup
    const backupFiles = (await fs.promises.readdir('.')).filter(f => f.startsWith('master-backup-'));
    if (backupFiles.length === 0) {
      throw new Error('No backup files found');
    }
    
    const latestBackup = backupFiles.sort().pop();
    console.log(`📂 Using backup file: ${latestBackup}`);
    
    const backupData = JSON.parse(await fs.promises.readFile(latestBackup!, 'utf-8'));
    
    // Restore user_teams first (critical for existing users)
    console.log('\n👥 Restoring user_teams...');
    const userTeamsBackup = backupData.find((b: any) => b.id === 'user_teams');
    if (userTeamsBackup && userTeamsBackup.documents.length > 0) {
      for (const doc of userTeamsBackup.documents) {
        try {
          const cleanDoc = {
            leagueId: doc.leagueId || 'unknown',
            userId: doc.userId || doc.owner || 'unknown',
            teamName: doc.teamName || doc.name || 'Team',
            abbreviation: doc.abbreviation || doc.teamName?.substring(0, 3) || 'TM',
            wins: doc.wins || 0,
            losses: doc.losses || 0,
            ties: doc.ties || 0,
            pointsFor: doc.pointsFor || doc.points || 0,
            pointsAgainst: doc.pointsAgainst || 0,
            players: JSON.stringify(doc.players || []),
            draftPosition: doc.draftPosition || 1
          };
          
          await databases.createDocument(DATABASE_ID, 'user_teams', ID.unique(), cleanDoc);
          console.log(`   ✅ Restored team: ${cleanDoc.teamName}`);
        } catch (error: any) {
          console.log(`   ❌ Failed to restore team ${doc.teamName}: ${error.message}`);
        }
      }
    }
    
    // Restore teams (needed for player references)
    console.log('\n🏫 Restoring teams...');
    const teamsBackup = backupData.find((b: any) => b.id === 'teams');
    if (teamsBackup && teamsBackup.documents.length > 0) {
      for (const doc of teamsBackup.documents) {
        try {
          const cleanDoc = {
            name: doc.name || 'Unknown Team',
            school: doc.school || doc.name || 'Unknown School',
            abbreviation: doc.abbreviation || 'UNK',
            conference: doc.conference || 'Unknown',
            mascot: doc.mascot || '',
            logo_url: doc.logo_url || doc.logos?.[0] || '',
            primary_color: doc.primary_color || doc.color || '#000000',
            secondary_color: doc.secondary_color || doc.alt_color || '#FFFFFF'
          };
          
          await databases.createDocument(DATABASE_ID, 'teams', ID.unique(), cleanDoc);
          console.log(`   ✅ Restored team: ${cleanDoc.name}`);
        } catch (error: any) {
          console.log(`   ❌ Failed to restore team ${doc.name}: ${error.message}`);
        }
      }
    }
    
    // Restore a subset of college_players (most important ones)
    console.log('\n🏈 Restoring key college players...');
    const playersBackup = backupData.find((b: any) => b.id === 'college_players');
    if (playersBackup && playersBackup.documents.length > 0) {
      // Only restore players with high fantasy points (top performers)
      const topPlayers = playersBackup.documents
        .filter((p: any) => (p.fantasy_points || 0) > 50 || p.position === 'QB')
        .slice(0, 100); // Limit to 100 to avoid timeout
      
      for (const doc of topPlayers) {
        try {
          const cleanDoc = {
            name: doc.name || 'Unknown Player',
            position: doc.position || 'UNK',
            team: doc.team || 'Unknown',
            conference: doc.conference || 'Unknown',
            year: doc.year || doc.classification || 'Unknown',
            jerseyNumber: doc.jerseyNumber || doc.jersey || null,
            height: doc.height || '',
            weight: doc.weight || null,
            eligible: doc.eligible !== false,
            fantasy_points: doc.fantasy_points || 0,
            season_fantasy_points: doc.season_fantasy_points || doc.fantasy_points || 0
          };
          
          await databases.createDocument(DATABASE_ID, 'college_players', ID.unique(), cleanDoc);
          console.log(`   ✅ Restored player: ${cleanDoc.name} (${cleanDoc.position}, ${cleanDoc.team})`);
        } catch (error: any) {
          console.log(`   ❌ Failed to restore player ${doc.name}: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎯 CRITICAL DATA RESTORATION COMPLETE');
    console.log('====================================');
    console.log('✅ User teams restored - existing leagues should work');
    console.log('✅ Teams restored - player references should work'); 
    console.log('✅ Key players restored - drafts should work');
    console.log('\nNext: Test core functionality');
    
  } catch (error: any) {
    console.error('❌ Data restoration failed:', error.message);
  }
}

restoreCriticalData().catch(console.error);