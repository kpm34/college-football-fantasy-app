#!/usr/bin/env tsx
import { ProjectionsService } from '../lib/services/projections.service';
import { EnhancedProjectionsService } from '../lib/services/enhanced-projections.service';
import { PlayerProjection } from '../types/projections';

/**
 * Test script to validate Louisville projections with new depth chart weighting
 */

async function testLouisvilleProjections() {
  console.log('🏈 Testing Louisville Projections with Enhanced Depth Chart Weighting\n');
  
  try {
    // Get enhanced projections for Louisville (ACC conference)
    console.log('Fetching enhanced projections for ACC...');
    const accProjections = await ProjectionsService.getEnhancedSeasonProjections('ACC');
    
    // Filter for Louisville players
    const louisvilleProjections = accProjections.filter(p => 
      p.team === 'Louisville' || p.school === 'Louisville'
    );
    
    console.log(`Found ${louisvilleProjections.length} Louisville players\n`);
    
    // Group by position
    const positionGroups: Record<string, PlayerProjection[]> = {};
    for (const player of louisvilleProjections) {
      if (!positionGroups[player.position]) {
        positionGroups[player.position] = [];
      }
      positionGroups[player.position].push(player);
    }
    
    // Test QBs - Miller Moss should project 3,800-4,000; backups <500
    console.log('=== QUARTERBACK PROJECTIONS ===');
    const qbs = positionGroups['QB'] || [];
    qbs.sort((a, b) => (b.projections?.fantasyPoints || 0) - (a.projections?.fantasyPoints || 0));
    
    for (const qb of qbs) {
      const points = qb.projections?.fantasyPoints || 0;
      const passYds = qb.projections?.passingYards || 0;
      const passTDs = qb.projections?.passingTDs || 0;
      
      console.log(`${qb.playerName}: ${points} pts (${passYds} pass yds, ${passTDs} pass TDs)`);
      
      // Validate Miller Moss
      if (qb.playerName.includes('Miller Moss')) {
        const inRange = points >= 380 && points <= 400; // Assuming ~3,800-4,000 passing yards
        console.log(`  ✅ Miller Moss in expected range: ${inRange ? 'YES' : 'NO'}`);
      }
      
      // Validate backup QBs
      if (qb !== qbs[0] && points >= 50) { // 50+ points might be too high for backup
        console.log(`  ⚠️  Backup QB ${qb.playerName} might be too high at ${points} pts`);
      }
    }
    
    // Test WRs - Caullin Lacy and Chris Bell should be highest
    console.log('\n=== WIDE RECEIVER PROJECTIONS ===');
    const wrs = positionGroups['WR'] || [];
    wrs.sort((a, b) => (b.projections?.fantasyPoints || 0) - (a.projections?.fantasyPoints || 0));
    
    for (let i = 0; i < Math.min(6, wrs.length); i++) {
      const wr = wrs[i];
      const points = wr.projections?.fantasyPoints || 0;
      const recYds = wr.projections?.receivingYards || 0;
      const recTDs = wr.projections?.receivingTDs || 0;
      const recs = wr.projections?.receptions || 0;
      
      console.log(`WR${i + 1} ${wr.playerName}: ${points} pts (${recs} rec, ${recYds} yds, ${recTDs} TDs)`);
      
      // Check if top WRs are Caullin Lacy and Chris Bell
      const isTopTarget = wr.playerName.includes('Caullin Lacy') || wr.playerName.includes('Chris Bell');
      if (i < 2 && isTopTarget) {
        console.log(`  ✅ Top target in expected position`);
      }
    }
    
    // Test RBs - Isaac Brown should be well above backups
    console.log('\n=== RUNNING BACK PROJECTIONS ===');
    const rbs = positionGroups['RB'] || [];
    rbs.sort((a, b) => (b.projections?.fantasyPoints || 0) - (a.projections?.fantasyPoints || 0));
    
    for (let i = 0; i < Math.min(4, rbs.length); i++) {
      const rb = rbs[i];
      const points = rb.projections?.fantasyPoints || 0;
      const rushYds = rb.projections?.rushingYards || 0;
      const rushTDs = rb.projections?.rushingTDs || 0;
      const recYds = rb.projections?.receivingYards || 0;
      
      console.log(`RB${i + 1} ${rb.playerName}: ${points} pts (${rushYds} rush yds, ${recYds} rec yds, ${rushTDs} TDs)`);
      
      // Check if Isaac Brown is the clear RB1
      if (rb.playerName.includes('Isaac Brown') && i === 0) {
        console.log(`  ✅ Isaac Brown as expected RB1`);
      }
      
      // Check depth distribution - RB2 should be significantly lower
      if (i === 1 && rbs[0]) {
        const rb1Points = rbs[0].projections?.fantasyPoints || 0;
        const ratio = points / rb1Points;
        console.log(`  📊 RB2/RB1 ratio: ${(ratio * 100).toFixed(1)}% (target: ~45%)`);
      }
    }
    
    // Test TEs
    console.log('\n=== TIGHT END PROJECTIONS ===');
    const tes = positionGroups['TE'] || [];
    tes.sort((a, b) => (b.projections?.fantasyPoints || 0) - (a.projections?.fantasyPoints || 0));
    
    for (let i = 0; i < Math.min(3, tes.length); i++) {
      const te = tes[i];
      const points = te.projections?.fantasyPoints || 0;
      const recYds = te.projections?.receivingYards || 0;
      const recTDs = te.projections?.receivingTDs || 0;
      const recs = te.projections?.receptions || 0;
      
      console.log(`TE${i + 1} ${te.playerName}: ${points} pts (${recs} rec, ${recYds} yds, ${recTDs} TDs)`);
      
      // Check TE1 vs TE2 distribution (should be ~70/30 split)
      if (i === 1 && tes[0]) {
        const te1Points = tes[0].projections?.fantasyPoints || 0;
        const ratio = points / te1Points;
        console.log(`  📊 TE2/TE1 ratio: ${(ratio * 100).toFixed(1)}% (target: ~43%)`);
      }
    }
    
    // Summary validation
    console.log('\n=== VALIDATION SUMMARY ===');
    const totalProjections = louisvilleProjections.length;
    const qbCount = qbs.length;
    const rbCount = rbs.length;
    const wrCount = wrs.length;
    const teCount = tes.length;
    
    console.log(`Total Louisville projections: ${totalProjections}`);
    console.log(`Position breakdown: ${qbCount} QB, ${rbCount} RB, ${wrCount} WR, ${teCount} TE`);
    
    // Check for proper depth distribution
    let validationsPassed = 0;
    let validationsTotal = 0;
    
    // QB validation
    if (qbs.length >= 2) {
      validationsTotal++;
      const qb1Points = qbs[0].projections?.fantasyPoints || 0;
      const qb2Points = qbs[1].projections?.fantasyPoints || 0;
      const qb2Ratio = qb2Points / qb1Points;
      
      if (qb2Ratio <= 0.25) { // QB2 should be ≤25% of QB1
        validationsPassed++;
        console.log(`✅ QB depth distribution valid (QB2 is ${(qb2Ratio * 100).toFixed(1)}% of QB1)`);
      } else {
        console.log(`❌ QB depth distribution invalid (QB2 is ${(qb2Ratio * 100).toFixed(1)}% of QB1, should be ≤25%)`);
      }
    }
    
    // RB validation
    if (rbs.length >= 3) {
      validationsTotal++;
      const rb1Points = rbs[0].projections?.fantasyPoints || 0;
      const rb3Points = rbs[2].projections?.fantasyPoints || 0;
      const rb3Ratio = rb3Points / rb1Points;
      
      if (rb3Ratio >= 0.10 && rb3Ratio <= 0.30) { // RB3 should be reasonable
        validationsPassed++;
        console.log(`✅ RB depth distribution valid (RB3 is ${(rb3Ratio * 100).toFixed(1)}% of RB1)`);
      } else {
        console.log(`❌ RB depth distribution needs adjustment (RB3 is ${(rb3Ratio * 100).toFixed(1)}% of RB1)`);
      }
    }
    
    console.log(`\n📊 Validations passed: ${validationsPassed}/${validationsTotal}`);
    console.log('🏈 Test completed!\n');
    
  } catch (error) {
    console.error('❌ Error testing Louisville projections:', error);
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testLouisvilleProjections().catch(console.error);
}

export { testLouisvilleProjections };