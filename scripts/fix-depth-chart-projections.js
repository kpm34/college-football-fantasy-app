#!/usr/bin/env node

const { Client, Databases, Query } = require('node-appwrite');

// Quick script to apply depth chart multipliers to existing projections
function getDepthChartMultiplier(pos, posRank) {
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
  return 1.0;
}

async function main() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  
  const databases = new Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
  
  console.log('Applying depth chart multipliers to projections...');
  
  // Get all players with projections
  let offset = 0;
  const limit = 100;
  let totalUpdated = 0;
  
  while (true) {
    const response = await databases.listDocuments(
      dbId,
      'college_players',
      [
        Query.greaterThan('fantasy_points', 0),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
    
    if (response.documents.length === 0) break;
    
    for (const player of response.documents) {
      try {
        const originalPoints = player.fantasy_points || 0;
        const position = player.position || 'RB';
        const depthRank = player.depth_rank || 1;
        
        // Apply depth chart multiplier
        const multiplier = getDepthChartMultiplier(position, depthRank);
        const adjustedPoints = Math.round(originalPoints * multiplier);
        
        // Only update if there's a significant change
        if (Math.abs(adjustedPoints - originalPoints) > 5) {
          await databases.updateDocument(
            dbId,
            'college_players',
            player.$id,
            { fantasy_points: adjustedPoints }
          );
          
          console.log(`Updated ${player.name} (${position}${depthRank}): ${originalPoints} -> ${adjustedPoints} (${multiplier}x)`);
          totalUpdated++;
        }
      } catch (error) {
        console.error(`Error updating ${player.name}:`, error);
      }
    }
    
    offset += limit;
    if (response.documents.length < limit) break;
  }
  
  console.log(`✅ Updated ${totalUpdated} players with depth chart multipliers`);
}

if (require.main === module) {
  main().catch(console.error);
}