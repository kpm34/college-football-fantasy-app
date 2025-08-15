#!/usr/bin/env tsx

/**
 * Populate projections collections with calculated data
 * Run: npx tsx scripts/populate-projections.ts
 */

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';
import { CFBProjectionsService } from '../lib/services/cfb-projections.service';
import { Query } from 'node-appwrite';

interface ProjectionData {
  player_id: string;
  season: number;
  team_id?: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  model_version: string;
  
  // Simple stats
  games_played_est?: number;
  usage_rate?: number;
  pace_adj?: number;
  fantasy_points_simple?: number;
  
  // Advanced metrics
  range_floor?: number;
  range_median?: number;
  range_ceiling?: number;
  injury_risk?: number;
  volatility_score?: number;
  replacement_value?: number;
  adp_est?: number;
  ecr_rank?: number;
}

async function populateSeasonProjections() {
  console.log('🔮 Starting season projections calculation...');
  
  try {
    // Get projections from the service
    const projections = await CFBProjectionsService.getSeasonProjections();
    console.log(`📊 Calculated ${projections.length} season projections`);
    
    if (projections.length === 0) {
      console.log('⚠️  No projections calculated - using mock data');
      return;
    }
    
    // Clear existing projections for current season
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
    
    // Transform and insert projections
    let inserted = 0;
    for (const proj of projections) {
      try {
        const projectionData: ProjectionData = {
          player_id: proj.playerId,
          season: currentSeason,
          team_id: proj.team,
          position: proj.position as 'QB' | 'RB' | 'WR' | 'TE',
          model_version: 'cfb-v1.0',
          
          // Simple stats
          games_played_est: 12, // Regular season games
          usage_rate: getUsageRate(proj.position),
          pace_adj: 1.0, // Neutral pace adjustment
          fantasy_points_simple: proj.fantasyPoints,
          
          // Advanced metrics
          range_floor: proj.fantasyPoints * 0.7, // 70% of projection as floor
          range_median: proj.fantasyPoints,
          range_ceiling: proj.fantasyPoints * 1.4, // 140% as ceiling
          injury_risk: calculateInjuryRisk(proj.position),
          volatility_score: calculateVolatility(proj),
          replacement_value: calculateReplacementValue(proj),
          adp_est: proj.adp || 100,
          ecr_rank: proj.overallRank,
        };
        
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.playerProjectionsYearly || 'projections_yearly',
          'unique()',
          projectionData
        );
        
        inserted++;
        if (inserted % 50 === 0) {
          console.log(`📈 Inserted ${inserted}/${projections.length} projections...`);
        }
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          console.error(`❌ Error inserting projection for ${proj.playerName}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${inserted} season projections`);
    
  } catch (error) {
    console.error('❌ Error populating season projections:', error);
  }
}

async function populateWeeklyProjections() {
  console.log('📅 Starting weekly projections for Week 1...');
  
  try {
    const projections = await CFBProjectionsService.getWeeklyProjections(1);
    console.log(`📊 Calculated ${projections.length} weekly projections`);
    
    if (projections.length === 0) {
      console.log('⚠️  No weekly projections calculated');
      return;
    }
    
    // Insert weekly projections
    let inserted = 0;
    for (const proj of projections) {
      try {
        const weeklyData = {
          player_id: proj.playerId,
          season: new Date().getFullYear(),
          week: 1,
          opponent_team_id: 'TBD', // TODO: Get from schedule
          home_away: 'H',
          
          fantasy_points_simple: proj.fantasyPoints,
          boom_prob: 0.2, // 20% chance of boom game
          bust_prob: 0.15, // 15% chance of bust
          
          rank_pro: proj.overallRank || 100,
          
          last_updated: new Date().toISOString()
        };
        
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.playerProjectionsWeekly || 'projections_weekly',
          'unique()',
          weeklyData
        );
        
        inserted++;
      } catch (error: any) {
        if (!error.message?.includes('already exists')) {
          console.error(`❌ Error inserting weekly projection:`, error.message);
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${inserted} weekly projections`);
    
  } catch (error) {
    console.error('❌ Error populating weekly projections:', error);
  }
}

// Helper functions
function getConferenceFromTeam(team: string): string {
  const conferences: Record<string, string[]> = {
    'SEC': ['Alabama', 'Georgia', 'LSU', 'Texas', 'Oklahoma', 'Florida', 'Tennessee', 'Kentucky', 'South Carolina', 'Missouri', 'Auburn', 'Ole Miss', 'Mississippi State', 'Arkansas', 'Vanderbilt', 'Texas A&M'],
    'Big Ten': ['Michigan', 'Ohio State', 'Penn State', 'Michigan State', 'Indiana', 'Maryland', 'Rutgers', 'UCLA', 'Washington', 'Oregon', 'USC', 'Wisconsin', 'Iowa', 'Minnesota', 'Nebraska', 'Northwestern', 'Purdue', 'Illinois'],
    'Big 12': ['Texas Tech', 'Oklahoma State', 'Baylor', 'TCU', 'Kansas', 'Kansas State', 'Iowa State', 'West Virginia', 'Cincinnati', 'Houston', 'UCF', 'BYU', 'Arizona', 'Arizona State', 'Colorado', 'Utah'],
    'ACC': ['Clemson', 'Florida State', 'Miami', 'North Carolina', 'NC State', 'Wake Forest', 'Duke', 'Virginia', 'Virginia Tech', 'Georgia Tech', 'Boston College', 'Syracuse', 'Pittsburgh', 'Louisville', 'Stanford', 'California', 'SMU']
  };
  
  for (const [conf, teams] of Object.entries(conferences)) {
    if (teams.some(t => team.toLowerCase().includes(t.toLowerCase()))) {
      return conf;
    }
  }
  
  return 'Other';
}

function getUsageRate(position: string): number {
  // Expected usage rate by position
  const usageRates: Record<string, number> = {
    'QB': 1.0,   // QBs get 100% of passing plays
    'RB': 0.4,   // Lead RBs get ~40% of touches
    'WR': 0.25,  // WR1s get ~25% of targets
    'TE': 0.15,  // TEs get ~15% of targets
  };
  
  return usageRates[position] || 0.2;
}

function calculateInjuryRisk(position: string): number {
  // Injury risk by position (0-1 scale)
  const riskRates: Record<string, number> = {
    'QB': 0.15,  // QBs have moderate injury risk
    'RB': 0.35,  // RBs have highest injury risk
    'WR': 0.20,  // WRs have moderate injury risk
    'TE': 0.25,  // TEs have higher injury risk due to blocking
  };
  
  return riskRates[position] || 0.2;
}

function calculateVolatility(proj: any): number {
  // Simple volatility calculation based on position
  const baseVolatility: Record<string, number> = {
    'QB': 0.15, // QBs are more consistent
    'RB': 0.25, // RBs have medium volatility
    'WR': 0.30, // WRs are more volatile
    'TE': 0.20, // TEs are moderately consistent
    'K': 0.35   // Kickers are very volatile
  };
  
  return baseVolatility[proj.position] || 0.25;
}

function calculateReplacementValue(proj: any): number {
  // Value over replacement player
  const replacementPoints: Record<string, number> = {
    'QB': 200, // Replacement level QB
    'RB': 150, // Replacement level RB
    'WR': 140, // Replacement level WR
    'TE': 100, // Replacement level TE
    'K': 80    // Replacement level K
  };
  
  const replacement = replacementPoints[proj.position] || 120;
  return Math.max(0, proj.fantasyPoints - replacement);
}

// Main execution
async function main() {
  console.log('🚀 Starting projections population...');
  
  try {
    await populateSeasonProjections();
    await populateWeeklyProjections();
    
    console.log('🎉 Projections population completed successfully!');
    
    // Test the populated data
    console.log('\n📊 Testing populated data...');
    const seasonTest = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.playerProjectionsYearly || 'projections_yearly',
      [Query.limit(5), Query.orderDesc('fantasy_points_simple')]
    );
    
    console.log(`✅ Season projections: ${seasonTest.total} total, top 5:`);
    seasonTest.documents.forEach((proj: any, i: number) => {
      console.log(`  ${i + 1}. ${proj.player_id} (${proj.position}) - ${proj.team_id} - ${proj.fantasy_points_simple} pts`);
    });
    
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
