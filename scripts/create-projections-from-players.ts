#!/usr/bin/env tsx

/**
 * Create projections from existing college_players in database
 * Run: npx tsx scripts/create-projections-from-players.ts
 */

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';
import { Query } from 'node-appwrite';

async function createProjectionsFromPlayers() {
  console.log('🏈 Creating projections from existing college players...');
  
  try {
    // Get existing players
    const playersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.players || 'college_players',
      [
        Query.equal('draftable', true),
        Query.equal('position', ['QB', 'RB', 'WR', 'TE']),
        Query.limit(500),
        Query.orderDesc('projection')
      ]
    );
    
    console.log(`📊 Found ${playersResponse.documents.length} draftable players`);
    
    if (playersResponse.documents.length === 0) {
      console.log('❌ No draftable players found');
      return;
    }
    
    // Clear existing projections
    const currentSeason = new Date().getFullYear();
    try {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.playerProjectionsYearly || 'projections_yearly',
        [Query.equal('season', currentSeason)]
      );
      
      for (const doc of existing.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.playerProjectionsYearly || 'projections_yearly',
          doc.$id
        );
      }
      console.log(`🗑️  Cleared ${existing.documents.length} existing projections`);
    } catch (error) {
      console.log('ℹ️  No existing projections to clear');
    }
    
    // Create projections for each player
    let inserted = 0;
    for (const player of playersResponse.documents) {
      try {
        const projection = player.projection || 100;
        const position = player.position;
        const fantasyPoints = Math.round(projection);
        
        const projectionData = {
          player_id: player.$id,
          season: currentSeason,
          team_id: player.team,
          position: position,
          model_version: 'cfb-v1.0',
          
          // Simple stats
          games_played_est: 12,
          usage_rate: getUsageRate(position),
          pace_adj: 1.0,
          fantasy_points_simple: fantasyPoints,
          
          // Advanced metrics
          range_floor: Math.round(fantasyPoints * 0.7),
          range_median: fantasyPoints,
          range_ceiling: Math.round(fantasyPoints * 1.4),
          injury_risk: getInjuryRisk(position),
          volatility_score: getVolatility(position),
          replacement_value: Math.max(0, fantasyPoints - getReplacementLevel(position)),
          adp_est: calculateADP(position, projection, inserted),
          ecr_rank: inserted + 1,
        };
        
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.playerProjectionsYearly || 'projections_yearly',
          'unique()',
          projectionData
        );
        
        inserted++;
        if (inserted % 50 === 0) {
          console.log(`📈 Created ${inserted}/${playersResponse.documents.length} projections...`);
        }
        
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          console.error(`❌ Error creating projection for ${player.name}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Successfully created ${inserted} projections!`);
    
    // Test the created data
    const test = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.playerProjectionsYearly || 'projections_yearly',
      [Query.limit(5), Query.orderDesc('fantasy_points_simple')]
    );
    
    console.log(`\n🎯 Top 5 projected players:`);
    test.documents.forEach((proj: any, i: number) => {
      console.log(`  ${i + 1}. ${proj.player_id} (${proj.position}) - ${proj.team_id} - ${proj.fantasy_points_simple} pts`);
    });
    
  } catch (error) {
    console.error('❌ Error creating projections:', error);
  }
}

// Helper functions
function calculateFantasyPoints(position: string, rating: number): number {
  const ratingMultiplier = Math.max(0.5, rating / 80); // Minimum 50% of base
  
  const basePoints: Record<string, number> = {
    'QB': 280,
    'RB': 220, 
    'WR': 200,
    'TE': 160,
    'K': 140
  };
  
  return Math.round((basePoints[position] || 180) * ratingMultiplier);
}

function getUsageRate(position: string): number {
  const rates: Record<string, number> = {
    'QB': 1.0,
    'RB': 0.4,
    'WR': 0.25,
    'TE': 0.15
  };
  return rates[position] || 0.2;
}

function getInjuryRisk(position: string): number {
  const risks: Record<string, number> = {
    'QB': 0.15,
    'RB': 0.35,
    'WR': 0.20,
    'TE': 0.25
  };
  return risks[position] || 0.2;
}

function getVolatility(position: string): number {
  const volatility: Record<string, number> = {
    'QB': 15,
    'RB': 25,
    'WR': 30,
    'TE': 20
  };
  return volatility[position] || 25;
}

function getReplacementLevel(position: string): number {
  const replacement: Record<string, number> = {
    'QB': 200,
    'RB': 150,
    'WR': 140,
    'TE': 100
  };
  return replacement[position] || 120;
}

function calculateADP(position: string, projection: number, index: number): number {
  const positionMultipliers: Record<string, number> = {
    'RB': 1.0,
    'WR': 1.1,
    'QB': 1.3,
    'TE': 1.5
  };
  
  const multiplier = positionMultipliers[position] || 1.5;
  const projectionFactor = Math.max(0, (300 - projection) / 50); // Higher projection = lower ADP
  
  return Math.round((index + 1) * multiplier + projectionFactor);
}

// Main execution
if (require.main === module) {
  createProjectionsFromPlayers();
}
