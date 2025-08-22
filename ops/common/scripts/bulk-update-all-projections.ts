#!/usr/bin/env ts-node

/**
 * Bulk Update All Player Projections Script
 * 
 * Updates all 2k+ players in the database with the enhanced talent-based projection system.
 * This builds on the unified-talent-projections logic but processes ALL players, not just Louisville.
 * 
 * Usage: npx tsx scripts/bulk-update-all-projections.ts [--season=2025] [--limit=100] [--dry-run]
 */

import { Client, Databases, Query } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';
import csv from 'csv-parser';

type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K';

interface TalentProfile {
  ea_overall?: number;
  ea_speed?: number;
  ea_acceleration?: number;
  projected_pick?: number;
  projected_round?: number;
  draft_capital_score?: number;
  prev_fantasy_points?: number;
  prev_games_played?: number;
  prev_usage_rate?: number;
  prev_efficiency?: number;
  offensive_line_grade?: number;
  supporting_cast_rating?: number;
  team_talent_composite?: number;
  expert_sentiment?: number;
  injury_concern_level?: number;
  depth_chart_certainty?: number;
  coaching_change_impact?: number;
}

interface EnhancedPlayerContext {
  playerId: string;
  playerName: string;
  teamId: string;
  pos: Position;
  usageRate: number;
  pace: number;
  offZ: number;
  games: number;
  depthRank: number;
  talent: TalentProfile;
  talentMultiplier: number;
  currentFantasyPoints: number; // For comparison
}

function assertServerEnv(): void {
  const req = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
  const miss = req.filter((k) => !process.env[k]);
  if (miss.length) throw new Error(`Missing env: ${miss.join(', ')}`);
}

function getDatabases(): { databases: Databases; dbId: string } {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
  return { databases, dbId };
}

function clamp(min: number, max: number, v: number): number { 
  return Math.max(min, Math.min(max, v)); 
}

/**
 * Load EA Sports ratings from CSV
 */
async function loadEAData(season: number): Promise<Map<string, any>> {
  const eaMap = new Map<string, any>();
  const filePath = path.join(process.cwd(), `data/player/ea/ratings_${season}.csv`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`EA ratings file not found: ${filePath}`);
    return eaMap;
  }
  
  return new Promise((resolve) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        for (const row of results) {
          const key = `${row.player_name?.toLowerCase()}|${row.school?.toLowerCase()}`;
          eaMap.set(key, {
            overall: parseInt(row.ovr) || 0,
            speed: parseInt(row.spd) || 0,
            acceleration: parseInt(row.acc) || 0
          });
        }
        console.log(`Loaded ${eaMap.size} EA ratings for ${season}`);
        resolve(eaMap);
      });
  });
}

/**
 * Load mock draft data from CSV
 */
async function loadMockDraftData(season: number): Promise<Map<string, any>> {
  const draftMap = new Map<string, any>();
  const filePath = path.join(process.cwd(), `data/market/mockdraft/${season}.csv`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Mock draft file not found: ${filePath}`);
    return draftMap;
  }
  
  return new Promise((resolve) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        for (const row of results) {
          const key = `${row.player_name?.toLowerCase()}|${row.school?.toLowerCase()}`;
          const pick = parseInt(row.projected_pick) || 260;
          const round = parseInt(row.projected_round) || 7;
          
          const draftCapitalScore = Math.max(0, (260 - pick) / 260);
          
          draftMap.set(key, {
            projected_pick: pick,
            projected_round: round,
            draft_capital_score: draftCapitalScore
          });
        }
        console.log(`Loaded ${draftMap.size} mock draft entries for ${season}`);
        resolve(draftMap);
      });
  });
}

/**
 * Calculate comprehensive talent multiplier
 */
function calculateTalentMultiplier(talent: TalentProfile, pos: Position): number {
  let multiplier = 1.0;
  
  // EA Sports ratings impact (15% total weight)
  if (talent.ea_overall) {
    const eaScore = (talent.ea_overall - 70) / 30;
    multiplier += Math.max(-0.15, Math.min(0.15, eaScore * 0.15));
  }
  
  // Speed/acceleration bonus for skill positions (5% additional)
  if ((pos === 'RB' || pos === 'WR') && talent.ea_speed && talent.ea_acceleration) {
    const athleticismScore = ((talent.ea_speed + talent.ea_acceleration) / 2 - 80) / 20;
    multiplier += Math.max(-0.05, Math.min(0.05, athleticismScore * 0.05));
  }
  
  // NFL Draft capital impact (20% weight)
  if (talent.draft_capital_score) {
    const draftBonus = talent.draft_capital_score * 0.20;
    multiplier += draftBonus;
  }
  
  // Previous year performance (25% weight)
  if (talent.prev_fantasy_points && talent.prev_games_played && talent.prev_games_played > 6) {
    const prevPerGame = talent.prev_fantasy_points / talent.prev_games_played;
    
    const positionBenchmarks = {
      QB: 20, RB: 15, WR: 12, TE: 10, K: 8
    };
    
    const benchmark = positionBenchmarks[pos] || 12;
    const prevPerformanceScore = (prevPerGame - benchmark) / benchmark;
    multiplier += Math.max(-0.15, Math.min(0.25, prevPerformanceScore * 0.25));
  }
  
  // Supporting cast impact (15% weight)
  if (talent.supporting_cast_rating) {
    const supportScore = (talent.supporting_cast_rating - 50) / 50;
    multiplier += Math.max(-0.10, Math.min(0.15, supportScore * 0.15));
  }
  
  // Offensive line impact for RB/QB (10% weight)
  if ((pos === 'RB' || pos === 'QB') && talent.offensive_line_grade) {
    const oline_score = (talent.offensive_line_grade - 50) / 50;
    multiplier += Math.max(-0.10, Math.min(0.10, oline_score * 0.10));
  }
  
  // Expert sentiment (10% weight)
  if (talent.expert_sentiment !== undefined) {
    multiplier += talent.expert_sentiment * 0.10;
  }
  
  // Depth chart certainty
  if (talent.depth_chart_certainty !== undefined) {
    const certaintyPenalty = (1 - talent.depth_chart_certainty) * -0.15;
    multiplier += certaintyPenalty;
  }
  
  // Injury concern penalty
  if (talent.injury_concern_level) {
    const injuryPenalty = talent.injury_concern_level * -0.20;
    multiplier += injuryPenalty;
  }
  
  // Coaching change impact
  if (talent.coaching_change_impact !== undefined) {
    multiplier += talent.coaching_change_impact;
  }
  
  return clamp(0.3, 2.0, multiplier);
}

/**
 * Estimate depth rank from fantasy points
 */
function estimateDepthRank(fantasyPoints: number, position: Position): number {
  if (position === 'QB') {
    if (fantasyPoints > 350) return 1;
    if (fantasyPoints > 200) return 2;
    return 3;
  }
  if (position === 'RB') {
    if (fantasyPoints > 250) return 1;
    if (fantasyPoints > 150) return 2;
    if (fantasyPoints > 80) return 3;
    return 4;
  }
  if (position === 'WR') {
    if (fantasyPoints > 200) return 1;
    if (fantasyPoints > 140) return 2;
    if (fantasyPoints > 100) return 3;
    if (fantasyPoints > 60) return 4;
    return 5;
  }
  if (position === 'TE') {
    if (fantasyPoints > 120) return 1;
    if (fantasyPoints > 70) return 2;
    return 3;
  }
  if (position === 'K') {
    if (fantasyPoints > 80) return 1;
    return 2;
  }
  return 1;
}

function getDepthChartMultiplier(pos: Position, posRank: number): number {
  if (pos === 'QB') {
    if (posRank === 1) return 1.0;
    if (posRank === 2) return 0.25;
    return 0.05;
  }
  if (pos === 'RB') {
    if (posRank === 1) return 1.0;
    if (posRank === 2) return 0.65;
    if (posRank === 3) return 0.35;
    return 0.15;
  }
  if (pos === 'WR') {
    if (posRank === 1) return 1.0;
    if (posRank === 2) return 0.85;
    if (posRank === 3) return 0.60;
    if (posRank === 4) return 0.35;
    return 0.15;
  }
  if (pos === 'TE') {
    if (posRank === 1) return 1.0;
    if (posRank === 2) return 0.50;
    return 0.20;
  }
  if (pos === 'K') {
    if (posRank === 1) return 1.0;
    return 0.50;
  }
  return 1.0;
}

/**
 * Enhanced statline computation with talent scaling
 */
function computeEnhancedStatline(ctx: EnhancedPlayerContext): any {
  const P = ctx.pace;
  const G = ctx.games;
  const PR = 0.52; // Pass rate
  const RR = 1 - PR; // Run rate
  const usage = ctx.usageRate * getDepthChartMultiplier(ctx.pos, ctx.depthRank);
  
  // Apply talent multiplier to base production
  const talentBoost = ctx.talentMultiplier;
  
  if (ctx.pos === 'QB') {
    const passAtt = P * PR * 1.0 * G * talentBoost;
    const passYds = passAtt * 7.5 * talentBoost;
    const passTD = passAtt * 0.05 * talentBoost;
    const ints = passAtt * 0.025; // Interceptions don't scale with talent as much
    const rushAtt = P * RR * 0.10 * G;
    const rushYds = rushAtt * 5.0 * talentBoost;
    const rushTD = rushAtt * 0.02 * talentBoost;
    
    return { 
      pass_yards: Math.round(passYds), 
      pass_tds: Math.round(passTD), 
      ints: Math.round(ints), 
      rush_yards: Math.round(rushYds), 
      rush_tds: Math.round(rushTD), 
      receptions: 0, 
      rec_yards: 0, 
      rec_tds: 0 
    };
  }
  
  if (ctx.pos === 'RB') {
    const rushAtt = P * RR * usage * G * talentBoost;
    const rushYds = rushAtt * 4.8 * talentBoost;
    const rushTD = rushAtt * 0.03 * talentBoost;
    const targets = P * PR * (usage * 0.5) * G * talentBoost;
    const rec = targets * 0.65;
    const recYds = rec * 7.5 * talentBoost;
    const recTD = targets * 0.03 * talentBoost;
    
    return { 
      pass_yards: 0, 
      pass_tds: 0, 
      ints: 0, 
      rush_yards: Math.round(rushYds), 
      rush_tds: Math.round(rushTD), 
      receptions: Math.round(rec), 
      rec_yards: Math.round(recYds), 
      rec_tds: Math.round(recTD) 
    };
  }
  
  if (ctx.pos === 'K') {
    // Simple kicker projection
    const fieldGoals = 18 * talentBoost;
    const extraPoints = 35 * talentBoost;
    
    return {
      pass_yards: 0, pass_tds: 0, ints: 0,
      rush_yards: 0, rush_tds: 0,
      receptions: 0, rec_yards: 0, rec_tds: 0,
      field_goals: Math.round(fieldGoals),
      extra_points: Math.round(extraPoints)
    };
  }
  
  // WR / TE
  const targets = P * PR * usage * G * talentBoost;
  const catchRate = ctx.pos === 'TE' ? 0.62 : 0.65;
  const ypr = (ctx.pos === 'TE' ? 10 : 12) * talentBoost;
  const tdRate = ctx.pos === 'TE' ? 0.04 : 0.05;
  const rec = targets * catchRate;
  const recYds = rec * ypr;
  const recTD = targets * tdRate * talentBoost;
  
  return { 
    pass_yards: 0, 
    pass_tds: 0, 
    ints: 0, 
    rush_yards: 0, 
    rush_tds: 0, 
    receptions: Math.round(rec), 
    rec_yards: Math.round(recYds), 
    rec_tds: Math.round(recTD) 
  };
}

function calculateFantasyPoints(stat: any): number {
  let pts = 0;
  pts += (stat.pass_yards || 0) * 0.04;
  pts += (stat.pass_tds || 0) * 4;
  pts += (stat.ints || 0) * -2;
  pts += (stat.rush_yards || 0) * 0.1;
  pts += (stat.rush_tds || 0) * 6;
  pts += (stat.rec_yards || 0) * 0.1;
  pts += (stat.rec_tds || 0) * 6;
  pts += (stat.receptions || 0) * 1;
  pts += (stat.field_goals || 0) * 3;
  pts += (stat.extra_points || 0) * 1;
  return Math.round(pts * 10) / 10;
}

/**
 * Build comprehensive player profiles for ALL players
 */
async function buildAllPlayerProfiles(
  databases: Databases,
  dbId: string,
  season: number,
  limit: number
): Promise<EnhancedPlayerContext[]> {
  
  console.log('Loading external talent data...');
  const [eaData, draftData] = await Promise.all([
    loadEAData(season),
    loadMockDraftData(season)
  ]);
  
  console.log('Loading ALL college players from database...');
  
  // Get all draftable players in fantasy positions
  const fantasyPositions = ['QB', 'RB', 'WR', 'TE', 'K'];
  const queries = [
    Query.equal('draftable', true),
    Query.equal('position', fantasyPositions),
    Query.limit(limit)
  ];
  
  const playersResponse = await databases.listDocuments(
    dbId,
    'college_players',
    queries
  );
  
  console.log(`Found ${playersResponse.documents.length} draftable players`);
  
  // Load team context data
  let teamEff: any = {};
  let pace: any = {};
  try {
    const miRes = await databases.listDocuments(dbId, 'model_inputs', [
      Query.equal('season', season), 
      Query.limit(1)
    ]);
    const model = miRes.documents.find((d: any) => d.week === undefined || d.week === null);
    if (model) {
      teamEff = typeof (model as any).team_efficiency_json === 'string' 
        ? JSON.parse((model as any).team_efficiency_json) 
        : (model as any).team_efficiency_json || {};
      pace = typeof (model as any).pace_estimates_json === 'string'
        ? JSON.parse((model as any).pace_estimates_json)
        : (model as any).pace_estimates_json || {};
    }
  } catch (error) {
    console.warn('Model inputs not found, using defaults');
  }
  
  console.log('Building enhanced player profiles...');
  const profiles: EnhancedPlayerContext[] = [];
  
  for (const player of playersResponse.documents) {
    const p = player as any;
    const playerName = p.name;
    const teamId = p.team || p.school;
    const posKey = p.position as Position;
    const playerId = p.$id;
    const currentFantasyPoints = p.fantasy_points || 0;
    
    // Skip if missing essential data
    if (!playerName || !teamId || !posKey || !playerId) continue;
    if (!fantasyPositions.includes(posKey)) continue;
    
    // Get team context
    const teamPace = pace?.[teamId]?.plays_per_game || 70;
    const offZ = teamEff?.[teamId]?.off_eff ?? 0;
    
    // Estimate usage rate from current fantasy points
    const baseUsageRate = Math.min(0.8, Math.max(0.1, currentFantasyPoints / 400));
    
    // Estimate depth rank from fantasy points
    const depthRank = p.depth_chart_order || estimateDepthRank(currentFantasyPoints, posKey);
    
    // Look up talent data
    const playerKey = `${playerName.toLowerCase()}|${teamId.toLowerCase()}`;
    const eaRating = eaData.get(playerKey) || eaData.get(playerName.toLowerCase());
    const draftData_player = draftData.get(playerKey) || draftData.get(playerName.toLowerCase());
    
    // Build comprehensive talent profile with defaults
    const talent: TalentProfile = {
      ea_overall: eaRating?.overall,
      ea_speed: eaRating?.speed,
      ea_acceleration: eaRating?.acceleration,
      projected_pick: draftData_player?.projected_pick,
      projected_round: draftData_player?.projected_round,
      draft_capital_score: draftData_player?.draft_capital_score,
      // Set reasonable defaults for missing data
      supporting_cast_rating: 75,
      offensive_line_grade: 75,
      expert_sentiment: 0,
      injury_concern_level: 0.1,
      depth_chart_certainty: 0.8,
      coaching_change_impact: 0
    };
    
    const talentMultiplier = calculateTalentMultiplier(talent, posKey);
    
    profiles.push({
      playerId,
      playerName,
      teamId,
      pos: posKey,
      usageRate: baseUsageRate,
      pace: teamPace,
      offZ,
      games: 12,
      depthRank,
      talent,
      talentMultiplier,
      currentFantasyPoints
    });
  }
  
  console.log(`Built ${profiles.length} enhanced player profiles`);
  return profiles;
}

/**
 * Update player in database with enhanced projections
 */
async function updatePlayerProjections(
  databases: Databases,
  dbId: string,
  ctx: EnhancedPlayerContext,
  dryRun: boolean = false
): Promise<{ updated: boolean; newPoints: number; oldPoints: number; change: number }> {
  
  const stat = computeEnhancedStatline(ctx);
  const newPoints = calculateFantasyPoints(stat);
  const oldPoints = ctx.currentFantasyPoints;
  const change = newPoints - oldPoints;
  
  if (dryRun) {
    console.log(`[DRY RUN] ${ctx.playerName} (${ctx.pos}, ${ctx.teamId}): ${oldPoints} → ${newPoints} pts (${change > 0 ? '+' : ''}${change.toFixed(1)}, ${ctx.talentMultiplier.toFixed(2)}x talent)`);
    return { updated: false, newPoints, oldPoints, change };
  }
  
  try {
    await databases.updateDocument(
      dbId,
      'college_players',
      ctx.playerId,
      {
        fantasy_points: newPoints,
        eligible: true,
        last_projection_update: new Date().toISOString()
      }
    );
    
    console.log(`Updated ${ctx.playerName} (${ctx.pos}, ${ctx.teamId}): ${oldPoints} → ${newPoints} pts (${change > 0 ? '+' : ''}${change.toFixed(1)}, ${ctx.talentMultiplier.toFixed(2)}x talent)`);
    return { updated: true, newPoints, oldPoints, change };
    
  } catch (error) {
    console.warn(`Error updating ${ctx.playerName}:`, error);
    return { updated: false, newPoints, oldPoints, change };
  }
}

async function main() {
  assertServerEnv();
  
  const args = process.argv.slice(2);
  const seasonArg = args.find(a => a.startsWith('--season='));
  const limitArg = args.find(a => a.startsWith('--limit='));
  const dryRun = args.includes('--dry-run');
  
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 10000; // Default to all players
  
  console.log(`🚀 Running Bulk Projection Update for ${season}`);
  console.log(`📊 Processing up to ${limit} players`);
  if (dryRun) console.log('🧪 DRY RUN MODE - No changes will be made');
  
  const { databases, dbId } = getDatabases();
  
  // Build comprehensive talent profiles for ALL players
  const profiles = await buildAllPlayerProfiles(databases, dbId, season, limit);
  
  // Update all players with enhanced projections
  let updated = 0;
  let totalChange = 0;
  const results: Array<{ updated: boolean; newPoints: number; oldPoints: number; change: number }> = [];
  
  for (const ctx of profiles) {
    const result = await updatePlayerProjections(databases, dbId, ctx, dryRun);
    results.push(result);
    
    if (result.updated) updated++;
    totalChange += result.change;
    
    if ((updated + results.length) % 100 === 0) {
      console.log(`Processed ${updated + results.length}/${profiles.length} players...`);
    }
  }
  
  console.log(`\n✅ ${dryRun ? 'Analyzed' : 'Updated'} ${updated}/${profiles.length} players`);
  console.log(`📈 Total point change: ${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}`);
  
  // Show top gainers and losers
  const sorted = results.sort((a, b) => b.change - a.change);
  const topGainers = sorted.slice(0, 10);
  const topLosers = sorted.slice(-10).reverse();
  
  console.log('\n🚀 Top 10 Point Gainers:');
  topGainers.forEach((r, i) => {
    const profile = profiles.find(p => calculateFantasyPoints(computeEnhancedStatline(p)) === r.newPoints);
    if (profile) {
      console.log(`${i + 1}. ${profile.playerName} (${profile.pos}, ${profile.teamId}): +${r.change.toFixed(1)} pts`);
    }
  });
  
  console.log('\n📉 Top 10 Point Losers:');
  topLosers.forEach((r, i) => {
    const profile = profiles.find(p => calculateFantasyPoints(computeEnhancedStatline(p)) === r.newPoints);
    if (profile) {
      console.log(`${i + 1}. ${profile.playerName} (${profile.pos}, ${profile.teamId}): ${r.change.toFixed(1)} pts`);
    }
  });
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes to database');
  }
}

if (require.main === module) {
  main().catch((e) => { 
    console.error('❌ Bulk projection update failed', e); 
    process.exit(1); 
  });
}