#!/usr/bin/env ts-node
import 'dotenv/config';
import { Client, Databases, Query, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K';

function cleanName(name: string): string {
  return name.replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Mock team mapping - in production this would come from data/teams_map.json
const TEAM_MAP: Record<string, string> = {
  // SEC
  'Alabama': 'ALA', 'Georgia': 'UGA', 'LSU': 'LSU', 'Florida': 'UF',
  'Tennessee': 'TENN', 'Auburn': 'AUB', 'Texas A&M': 'TAMU', 'Ole Miss': 'MISS',
  'Mississippi State': 'MSST', 'Arkansas': 'ARK', 'Kentucky': 'UK', 
  'South Carolina': 'SC', 'Missouri': 'MIZ', 'Vanderbilt': 'VAN',
  'Texas': 'TEX', 'Oklahoma': 'OU',
  
  // Big Ten
  'Ohio State': 'OSU', 'Michigan': 'MICH', 'Penn State': 'PSU', 'Michigan State': 'MSU',
  'Wisconsin': 'WIS', 'Iowa': 'IOWA', 'Minnesota': 'MINN', 'Nebraska': 'NEB',
  'Northwestern': 'NW', 'Purdue': 'PUR', 'Illinois': 'ILL', 'Indiana': 'IND',
  'Maryland': 'MD', 'Rutgers': 'RUTG', 'USC': 'USC', 'UCLA': 'UCLA',
  'Washington': 'WASH', 'Oregon': 'ORE',
  
  // ACC
  'Clemson': 'CLEM', 'Florida State': 'FSU', 'Miami': 'MIA', 'North Carolina': 'UNC',
  'NC State': 'NCST', 'Virginia Tech': 'VT', 'Virginia': 'UVA', 'Louisville': 'LOU',
  'Wake Forest': 'WAKE', 'Duke': 'DUKE', 'Syracuse': 'SYR', 'Boston College': 'BC',
  'Pittsburgh': 'PITT', 'Georgia Tech': 'GT', 'California': 'CAL', 'Stanford': 'STAN',
  'SMU': 'SMU',
  
  // Big 12
  'Texas Tech': 'TTU', 'TCU': 'TCU', 'Baylor': 'BAY', 'Iowa State': 'ISU',
  'Kansas State': 'KSU', 'Kansas': 'KU', 'Oklahoma State': 'OKST', 'West Virginia': 'WVU',
  'Cincinnati': 'CIN', 'Houston': 'HOU', 'UCF': 'UCF', 'Arizona': 'ARIZ',
  'Arizona State': 'ASU', 'Colorado': 'COLO', 'Utah': 'UTAH', 'BYU': 'BYU'
};

function buildUsagePriors(depth: Record<string, Record<string, Array<{ player_name: string; pos_rank: number }>>>): Record<string, any> {
  const priors: Record<string, any> = {};
  const normalizeToSum = (values: number[], target: number): number[] => {
    const sum = values.reduce((a, b) => a + b, 0) || 1;
    return values.map((v) => (v / sum) * target);
  };
  
  for (const [teamId, posMap] of Object.entries(depth)) {
    priors[teamId] = {};
    const byPos = posMap as Record<Position, Array<{ player_name: string; pos_rank: number }>>;

    // QB
    if (byPos.QB) {
      priors[teamId].QB = byPos.QB.map((p, idx) => ({ 
        player_name: p.player_name, 
        snap_share: idx === 0 ? 0.95 : 0.05 
      }));
    }

    // RB
    if (byPos.RB) {
      const rbWeights = byPos.RB.map((_, idx) => (idx === 0 ? 0.6 : idx === 1 ? 0.3 : 0.1));
      const snapShares = normalizeToSum(rbWeights, Math.min(0.95, rbWeights.reduce((a, b) => a + b, 0)));
      priors[teamId].RB = byPos.RB.map((p, i) => ({ 
        player_name: p.player_name, 
        snap_share: Number((snapShares[i] || 0).toFixed(2)), 
        rush_share: Number(((snapShares[i] || 0) * 0.9).toFixed(2)) 
      }));
    }

    // WR
    if (byPos.WR) {
      const weights = byPos.WR.map((_, idx) => (idx === 0 ? 0.8 : idx === 1 ? 0.7 : idx === 2 ? 0.6 : 0.2));
      const snapShares = normalizeToSum(weights.slice(0, Math.max(byPos.WR.length, 1)), 1.0);
      priors[teamId].WR = byPos.WR.map((p, i) => ({ 
        player_name: p.player_name, 
        snap_share: Number((snapShares[i] || 0).toFixed(2)), 
        target_share: Number((snapShares[i] || 0).toFixed(2)) 
      }));
    }

    // TE
    if (byPos.TE) {
      const weights = byPos.TE.map((_, idx) => (idx === 0 ? 0.7 : idx === 1 ? 0.35 : 0.15));
      const snapShares = normalizeToSum(weights, 0.85);
      priors[teamId].TE = byPos.TE.map((p, i) => ({ 
        player_name: p.player_name, 
        snap_share: Number((snapShares[i] || 0).toFixed(2)), 
        target_share: Number((snapShares[i] || 0).toFixed(2)) 
      }));
    }
  }
  return priors;
}

// Mock team efficiency data
function buildTeamEfficiency(): Record<string, any> {
  const teams = Object.values(TEAM_MAP);
  const efficiency: Record<string, any> = {};
  
  for (const teamId of teams) {
    // Generate some reasonable mock data
    const offEff = (Math.random() * 2 - 1); // -1 to 1
    const defEff = (Math.random() * 2 - 1);
    const stEff = (Math.random() * 0.5 - 0.25); // -0.25 to 0.25
    const pace = 65 + Math.random() * 15; // 65-80 plays per game
    
    efficiency[teamId] = {
      off_eff: Number(offEff.toFixed(3)),
      def_eff: Number(defEff.toFixed(3)),
      special_teams_eff: Number(stEff.toFixed(3)),
      pace_est: Number(pace.toFixed(1))
    };
  }
  
  return efficiency;
}

// Mock pace estimates
function buildPaceEstimates(teamEff: Record<string, any>): Record<string, any> {
  const pace: Record<string, any> = {};
  
  for (const [teamId, eff] of Object.entries(teamEff)) {
    pace[teamId] = {
      plays_per_game: eff.pace_est,
      sec_per_play: Number((24 - (eff.off_eff * 1.2)).toFixed(1))
    };
  }
  
  return pace;
}

async function populateModelInputs(season: number) {
  console.log(`\nPopulating model_inputs for season ${season}...`);
  
  // Build depth chart from college_players
  const positions: Position[] = ['QB', 'RB', 'WR', 'TE'];
  const depthChart: Record<string, Record<Position, Array<{ player_name: string; pos_rank: number }>>> = {};
  
  let offset = 0;
  const pageSize = 200;
  let scanned = 0;
  
  console.log('Scanning college_players to build depth chart...');
  
  while (true) {
    const page = await databases.listDocuments(
      DATABASE_ID,
      'college_players',
      [Query.limit(pageSize), Query.offset(offset)]
    );
    
    const docs: any[] = page.documents || [];
    if (docs.length === 0) break;
    scanned += docs.length;
    
    for (const doc of docs) {
      const pos = (doc.position || '').toUpperCase();
      if (!positions.includes(pos as Position)) continue;
      
      const teamName = (doc.team || doc.school || '').toString().trim();
      const teamId = TEAM_MAP[teamName];
      if (!teamId) continue;
      
      if (!depthChart[teamId]) depthChart[teamId] = {} as any;
      if (!depthChart[teamId][pos as Position]) depthChart[teamId][pos as Position] = [];
      
      depthChart[teamId][pos as Position].push({
        player_name: doc.name || `${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
        pos_rank: 999 // Will be sorted and re-ranked
      });
    }
    
    offset += docs.length;
    if (offset >= page.total) break;
  }
  
  console.log(`Scanned ${scanned} players`);
  
  // Sort and rank players within each team/position
  for (const [teamId, posMap] of Object.entries(depthChart)) {
    for (const pos of Object.keys(posMap)) {
      const list = posMap[pos as Position];
      // Sort by name for now (in production, would use projections/ratings)
      list.sort((a, b) => a.player_name.localeCompare(b.player_name));
      // Assign ranks and limit to top 5
      for (let i = 0; i < list.length; i++) {
        list[i].pos_rank = i + 1;
      }
      depthChart[teamId][pos as Position] = list.slice(0, 5);
    }
  }
  
  console.log(`Built depth chart for ${Object.keys(depthChart).length} teams`);
  
  // Generate other model inputs
  const usagePriors = buildUsagePriors(depthChart);
  const teamEfficiency = buildTeamEfficiency();
  const paceEstimates = buildPaceEstimates(teamEfficiency);
  
  // Create more compact versions for storage
  const compactDepthChart: Record<string, any> = {};
  for (const [teamId, positions] of Object.entries(depthChart)) {
    compactDepthChart[teamId] = {};
    for (const [pos, players] of Object.entries(positions)) {
      // Store only player names and ranks in compact format
      compactDepthChart[teamId][pos] = players.slice(0, 3).map(p => `${p.player_name}:${p.pos_rank}`);
    }
  }
  
  // Create compact usage priors
  const compactUsagePriors: Record<string, any> = {};
  for (const [teamId, positions] of Object.entries(usagePriors)) {
    compactUsagePriors[teamId] = {};
    for (const [pos, players] of Object.entries(positions)) {
      // Store only top 3 players with snap share
      compactUsagePriors[teamId][pos] = (players as any[]).slice(0, 3).map(p => ({
        n: p.player_name.split(' ').slice(-1)[0], // Last name only
        s: p.snap_share
      }));
    }
  }
  
  // Check if document exists
  const existing = await databases.listDocuments(
    DATABASE_ID,
    'model_inputs',
    [Query.equal('season', season), Query.limit(1)]
  );
  
  const doc = existing.documents.find((d: any) => !d.week || d.week === null);
  
  const data = {
    season,
    depth_chart_json: JSON.stringify(compactDepthChart),
    usage_priors_json: JSON.stringify(compactUsagePriors),
    team_efficiency_json: JSON.stringify(teamEfficiency),
    pace_estimates_json: JSON.stringify(paceEstimates),
    manual_overrides_json: JSON.stringify({})
  };
  
  // Check size
  const depthSize = data.depth_chart_json.length;
  const usageSize = data.usage_priors_json.length;
  console.log(`Data sizes - Depth: ${depthSize}, Usage: ${usageSize}`);
  
  if (depthSize > 16384 || usageSize > 16384) {
    console.error(`Data too large! Depth: ${depthSize}/16384, Usage: ${usageSize}/16384`);
    // Store only a subset of teams
    const topTeams = ['ALA', 'UGA', 'OSU', 'MICH', 'TEX', 'OU', 'CLEM', 'FSU'];
    const reducedDepth: Record<string, any> = {};
    const reducedUsage: Record<string, any> = {};
    
    for (const team of topTeams) {
      if (compactDepthChart[team]) reducedDepth[team] = compactDepthChart[team];
      if (compactUsagePriors[team]) reducedUsage[team] = compactUsagePriors[team];
    }
    
    data.depth_chart_json = JSON.stringify(reducedDepth);
    data.usage_priors_json = JSON.stringify(reducedUsage);
    console.log(`Reduced to top teams only`);
  }
  
  if (doc) {
    await databases.updateDocument(DATABASE_ID, 'model_inputs', doc.$id, data);
    console.log(`✅ Updated model_inputs document ${doc.$id}`);
  } else {
    const created = await databases.createDocument(
      DATABASE_ID,
      'model_inputs',
      ID.unique(),
      data
    );
    console.log(`✅ Created model_inputs document ${created.$id}`);
  }
}

async function main() {
  if (!process.env.APPWRITE_API_KEY) {
    console.error('Missing APPWRITE_API_KEY environment variable');
    process.exit(1);
  }
  
  try {
    const season = 2025;
    await populateModelInputs(season);
    console.log('\n✅ Model inputs population complete!');
  } catch (error: any) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main();
