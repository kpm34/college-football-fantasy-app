#!/usr/bin/env tsx

/**
 * Test Script for Projection Evaluation System
 * 
 * This script helps validate that the evaluation system is working correctly
 * by testing data loading and basic functionality.
 */

import 'dotenv/config';
import { ProjectionDataLoader } from '../evaluation/data-loader';
import { MetricsCalculator } from '../evaluation/metrics';
import { TierAnalyzer } from '../evaluation/tier-analysis';
import { serverDatabases, DATABASE_ID } from '../lib/appwrite-server';

async function testDataLoading(): Promise<void> {
  console.log('🔍 Testing data loading capabilities...\n');
  
  const loader = new ProjectionDataLoader(serverDatabases, DATABASE_ID);
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    const collections = await serverDatabases.listCollections(DATABASE_ID);
    console.log(`✅ Connected! Found ${collections.collections.length} collections`);
    
    // Test 2: Check for projection collections
    console.log('\n2. Checking for projection collections...');
    const collectionNames = collections.collections.map(c => c.$id);
    
    const hasWeekly = collectionNames.includes('projections_weekly');
    const hasYearly = collectionNames.includes('projections_yearly');
    console.log(`   projections_weekly: ${hasWeekly ? '✅' : '❌'}`);
    console.log(`   projections_yearly: ${hasYearly ? '✅' : '❌'}`);
    
    // Test 3: Check for scoring/stats collections  
    console.log('\n3. Checking for actual performance collections...');
    const hasScoring = collectionNames.includes('scoring');
    const hasPlayerStats = collectionNames.includes('player_stats');
    console.log(`   scoring: ${hasScoring ? '✅' : '❌'}`);
    console.log(`   player_stats: ${hasPlayerStats ? '✅' : '❌'}`);
    
    // Test 4: Sample data loading
    console.log('\n4. Testing sample data loading...');
    
    if (hasYearly) {
      try {
        const yearlyProjections = await loader.loadYearlyProjections([2024, 2025]);
        console.log(`   ✅ Loaded ${yearlyProjections.length} yearly projections`);
        
        if (yearlyProjections.length > 0) {
          const sample = yearlyProjections[0];
          console.log(`   Sample: Player ${sample.player_id}, ${sample.position}, ${sample.fantasy_points_simple} points`);
          
          // Check position distribution
          const positions = [...new Set(yearlyProjections.map(p => p.position))];
          console.log(`   Positions found: ${positions.join(', ')}`);
        }
      } catch (error) {
        console.log(`   ❌ Error loading yearly projections: ${(error as Error).message}`);
      }
    }
    
    if (hasWeekly) {
      try {
        const weeklyProjections = await loader.loadWeeklyProjections({
          startSeason: 2024,
          startWeek: 1,
          endSeason: 2024,
          endWeek: 2
        });
        console.log(`   ✅ Loaded ${weeklyProjections.length} weekly projections (2024W1-W2)`);
      } catch (error) {
        console.log(`   ❌ Error loading weekly projections: ${(error as Error).message}`);
      }
    }
    
    // Test 5: Scoring rules
    console.log('\n5. Testing scoring rules...');
    const defaultRules = await loader.loadScoringRules();
    console.log(`   ✅ Default scoring: ${defaultRules.passing_td}pt passing TD, ${defaultRules.rushing_td}pt rushing TD`);
    
  } catch (error) {
    console.error('❌ Data loading test failed:', error);
  }
}

async function testMetricsCalculation(): Promise<void> {
  console.log('\n🧮 Testing metrics calculation...\n');
  
  // Create sample data for testing
  const testData = [
    { predicted: 20.5, actual: 18.2, player_id: 'test1' },
    { predicted: 15.3, actual: 16.8, player_id: 'test2' },
    { predicted: 12.1, actual: 9.4, player_id: 'test3' },
    { predicted: 25.0, actual: 28.3, player_id: 'test4' },
    { predicted: 8.7, actual: 11.2, player_id: 'test5' }
  ];
  
  try {
    const metrics = MetricsCalculator.calculateMetrics(testData);
    
    console.log('✅ Metrics calculation successful:');
    console.log(`   MAE: ${metrics.mae.toFixed(2)}`);
    console.log(`   sMAPE: ${metrics.smape.toFixed(1)}%`);
    console.log(`   R²: ${metrics.r2.toFixed(3)}`);
    console.log(`   RMSE: ${metrics.rmse.toFixed(2)}`);
    console.log(`   Sample size: ${metrics.n_predictions}`);
    
    // Test calibration
    const calibration = MetricsCalculator.calculateCalibration(testData);
    console.log(`   Calibration slope: ${calibration.slope.toFixed(3)}`);
    console.log(`   Reliability: ${calibration.reliability.toFixed(3)}`);
    
  } catch (error) {
    console.error('❌ Metrics calculation failed:', error);
  }
}

async function testTierAnalysis(): Promise<void> {
  console.log('\n🏆 Testing tier analysis...\n');
  
  try {
    // Test tier definitions
    const tiers = TierAnalyzer.getStandardTiers();
    console.log(`✅ Loaded ${tiers.length} standard fantasy tiers`);
    
    // Group by position
    const byPosition = new Map<string, number>();
    tiers.forEach(tier => {
      byPosition.set(tier.position, (byPosition.get(tier.position) || 0) + 1);
    });
    
    console.log('   Tiers by position:');
    for (const [position, count] of byPosition.entries()) {
      console.log(`     ${position}: ${count} tiers`);
    }
    
    // Test with sample player performances
    const samplePlayers = [
      { player_id: 'qb1', position: 'QB', predicted_avg: 25.0, actual_avg: 23.5, games_played: 14, fantasy_rank: 1 },
      { player_id: 'qb2', position: 'QB', predicted_avg: 20.0, actual_avg: 22.1, games_played: 14, fantasy_rank: 5 },
      { player_id: 'rb1', position: 'RB', predicted_avg: 18.5, actual_avg: 16.2, games_played: 12, fantasy_rank: 3 },
      { player_id: 'rb2', position: 'RB', predicted_avg: 15.0, actual_avg: 18.8, games_played: 13, fantasy_rank: 8 }
    ];
    
    const tierEvals = TierAnalyzer.analyzeByTier(samplePlayers, tiers, 1);
    console.log(`✅ Analyzed ${tierEvals.length} tiers with sample data`);
    
    if (tierEvals.length > 0) {
      const sample = tierEvals[0];
      console.log(`   Sample tier: ${sample.tier.position} ${sample.tier.tier}`);
      console.log(`   Tier MAE: ${sample.metrics.mae.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Tier analysis failed:', error);
  }
}

async function generateTestReport(): Promise<void> {
  console.log('\n📄 Testing report generation...\n');
  
  try {
    const { ReportGenerator } = await import('../evaluation/report-generator');
    const { mkdirSync } = await import('fs');
    
    // Create test report directory
    mkdirSync('reports', { recursive: true });
    
    // Create sample report data
    const testReport = {
      evaluation_date: new Date().toISOString(),
      week_range: {
        startSeason: 2024,
        startWeek: 1,
        endSeason: 2024,
        endWeek: 14
      },
      model_version: 'Test',
      overall_metrics: {
        mae: 3.45,
        smape: 18.2,
        r2: 0.672,
        rmse: 4.78,
        n_predictions: 1250,
        n_players: 89
      },
      by_position: {
        QB: { mae: 4.12, smape: 16.8, r2: 0.721, rmse: 5.23, n_predictions: 180, n_players: 12 },
        RB: { mae: 3.85, smape: 22.1, r2: 0.598, rmse: 5.01, n_predictions: 420, n_players: 28 },
        WR: { mae: 3.02, smape: 19.4, r2: 0.643, rmse: 4.15, n_predictions: 650, n_players: 49 }
      },
      by_tier: [],
      by_week: undefined,
      calibration_curves: undefined
    };
    
    // Generate markdown report
    ReportGenerator.generateMarkdownReport(testReport, 'reports/test_evaluation_report.md');
    console.log('✅ Test markdown report generated: reports/test_evaluation_report.md');
    
    // Generate console summary
    ReportGenerator.generateConsoleSummary(testReport);
    
  } catch (error) {
    console.error('❌ Report generation failed:', error);
  }
}

async function main(): Promise<void> {
  console.log('🧪 Projection Evaluation System Test');
  console.log('====================================');
  
  try {
    await testDataLoading();
    await testMetricsCalculation();
    await testTierAnalysis();
    await generateTestReport();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('  1. If data loading failed, populate your projections and scoring collections');
    console.log('  2. Run a real evaluation with: npm run eval_proj -- --weeks 2024W1-2024W14 --out reports/real_eval.md');
    console.log('  3. Check the generated test report at: reports/test_evaluation_report.md');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  main();
}