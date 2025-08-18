#!/usr/bin/env node

const { Client, Databases, Query } = require('node-appwrite');

// Quick fix for projection rankings based on known starters vs backups
const KNOWN_STARTERS = {
  // Key starters who should have high projections
  'arch manning': { team: 'Texas', multiplier: 1.2 }, // Should be top Texas QB
  'miller moss': { team: 'USC', multiplier: 1.1 },
  'carson beck': { team: 'Miami', multiplier: 1.1 },
  'cam ward': { team: 'Miami', multiplier: 1.15 },
  'quinn ewers': { team: 'Texas', multiplier: 1.1 },
  'jalen milroe': { team: 'Alabama', multiplier: 1.1 },
  'drew allar': { team: 'Penn State', multiplier: 1.1 },
  'dillon gabriel': { team: 'Oregon', multiplier: 1.1 },
  'will rogers': { team: 'Washington', multiplier: 1.0 },
  'kurtis rourke': { team: 'Indiana', multiplier: 1.0 },
  'trevor etienne': { team: 'Florida', multiplier: 1.1 },
  'ollie gordon': { team: 'Oklahoma State', multiplier: 1.1 },
  'ashton jeanty': { team: 'Boise State', multiplier: 1.2 },
  'travis hunter': { team: 'Colorado', multiplier: 1.3 }, // Heisman candidate
  'tetairoa mcmillan': { team: 'Arizona', multiplier: 1.1 },
  'rome odunze': { team: 'Washington', multiplier: 1.0 },
  'marvin harrison': { team: 'Philadelphia Eagles', multiplier: 0.0 }, // NFL now
};

// Players who should be demoted (backups, etc.)
const BACKUP_PLAYERS = [
  'trey owens', 'matthew caldwell', 'cade carruth', 'maealiuaki smith',
  'beau pribula', 'deuce knight', 'cutter boley', 'hezekiah millender',
  'joe tatum', 'luke dunham'
];

async function main() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  
  const databases = new Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
  
  console.log('Fixing projection rankings...');
  
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
        const playerNameLower = (player.name || '').toLowerCase();
        let newPoints = originalPoints;
        let reason = '';
        
        // Check if this is a known starter who should be boosted
        const starterInfo = KNOWN_STARTERS[playerNameLower];
        if (starterInfo) {
          newPoints = Math.round(originalPoints * starterInfo.multiplier);
          reason = `starter boost (${starterInfo.multiplier}x)`;
        }
        // Check if this is a known backup who should be demoted
        else if (BACKUP_PLAYERS.includes(playerNameLower)) {
          newPoints = Math.round(originalPoints * 0.3); // Reduce to 30%
          reason = 'backup reduction (0.3x)';
        }
        // Special logic: if fantasy_points > 380 and not a known starter, likely a backup
        else if (originalPoints > 380 && player.position === 'QB' && !starterInfo) {
          newPoints = Math.round(originalPoints * 0.4); // Reduce inflated backups
          reason = 'probable backup reduction (0.4x)';
        }
        
        // Update if there's a significant change
        if (Math.abs(newPoints - originalPoints) > 10) {
          await databases.updateDocument(
            dbId,
            'college_players',
            player.$id,
            { fantasy_points: newPoints }
          );
          
          console.log(`Updated ${player.name} (${player.team}): ${originalPoints} -> ${newPoints} (${reason})`);
          totalUpdated++;
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error(`Error updating ${player.name}:`, error);
      }
    }
    
    offset += limit;
    if (response.documents.length < limit) break;
  }
  
  console.log(`✅ Updated ${totalUpdated} players with corrected rankings`);
}

if (require.main === module) {
  main().catch(console.error);
}