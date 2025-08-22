#!/usr/bin/env tsx

import 'dotenv/config';
import { serverDatabases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';
import { Query } from 'appwrite';

async function checkPlayerProjections() {
  try {
    // Check Sam Leavitt
    const samResults = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.players,
      [
        Query.search('name', 'Sam Leavitt'),
        Query.limit(5)
      ]
    );
    
    console.log('\nSam Leavitt results:');
    for (const player of samResults.documents) {
      console.log({
        name: player.name,
        team: player.team,
        position: player.position,
        fantasy_points: player.fantasy_points,
        depth_chart_order: player.depth_chart_order,
        eligible: player.eligible
      });
    }
    
    // Check Ryan Williams
    const ryanResults = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.players,
      [
        Query.search('name', 'Ryan Williams'),
        Query.limit(5)
      ]
    );
    
    console.log('\nRyan Williams results:');
    for (const player of ryanResults.documents) {
      console.log({
        name: player.name,
        team: player.team,
        position: player.position,
        fantasy_points: player.fantasy_points,
        depth_chart_order: player.depth_chart_order,
        eligible: player.eligible
      });
    }
    
    // Check all Arizona State players
    const azStateResults = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.players,
      [
        Query.equal('team', 'Arizona State Sun Devils'),
        Query.equal('position', ['QB', 'RB', 'WR', 'TE']),
        Query.limit(50)
      ]
    );
    
    console.log('\nArizona State players with projections:');
    const azPlayers = azStateResults.documents
      .map(p => ({
        name: p.name,
        position: p.position,
        fantasy_points: p.fantasy_points || 0
      }))
      .sort((a, b) => (b.fantasy_points || 0) - (a.fantasy_points || 0));
    
    console.table(azPlayers);
    
    // Check teams with all players at 40 points
    const allTeams = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.players,
      [
        Query.equal('fantasy_points', 40),
        Query.limit(100)
      ]
    );
    
    const teamCounts = new Map<string, number>();
    for (const player of allTeams.documents) {
      const team = player.team as string;
      teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
    }
    
    console.log('\nTeams with players at exactly 40 points:');
    const sorted = Array.from(teamCounts.entries()).sort((a, b) => b[1] - a[1]);
    for (const [team, count] of sorted) {
      if (count > 5) {
        console.log(`  ${team}: ${count} players`);
      }
    }
    
  } catch (error) {
    console.error('Error checking projections:', error);
  }
}

checkPlayerProjections();
