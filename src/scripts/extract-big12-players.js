import { Client, Databases } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

function convertToStarRating(decimalRating) {
  if (decimalRating >= 0.9500) return 5;
  if (decimalRating >= 0.9000) return 4;
  if (decimalRating >= 0.8500) return 3;
  if (decimalRating >= 0.8000) return 2;
  return 1;
}

function generateProjections(position, rating) {
  const baseMultiplier = rating === 5 ? 1.4 : rating === 4 ? 1.2 : rating === 3 ? 1.0 : 0.8;
  
  switch (position) {
    case 'QB':
      return {
        projection: Math.round(2000 + (baseMultiplier * 500)),
        rushing_projection: Math.round(150 + (baseMultiplier * 50)),
        receiving_projection: 0,
        td_projection: Math.round(15 + (baseMultiplier * 5)),
        int_projection: Math.round(8 + (baseMultiplier * 2)),
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(180 + (baseMultiplier * 40))
      };
    case 'RB':
      return {
        projection: Math.round(700 + (baseMultiplier * 200)),
        rushing_projection: Math.round(600 + (baseMultiplier * 150)),
        receiving_projection: Math.round(100 + (baseMultiplier * 30)),
        td_projection: Math.round(5 + (baseMultiplier * 3)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(100 + (baseMultiplier * 25))
      };
    case 'WR':
      return {
        projection: Math.round(500 + (baseMultiplier * 200)),
        rushing_projection: Math.round(20 + (baseMultiplier * 5)),
        receiving_projection: Math.round(500 + (baseMultiplier * 200)),
        td_projection: Math.round(4 + (baseMultiplier * 2)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(75 + (baseMultiplier * 20))
      };
    case 'TE':
      return {
        projection: Math.round(250 + (baseMultiplier * 150)),
        rushing_projection: 0,
        receiving_projection: Math.round(250 + (baseMultiplier * 150)),
        td_projection: Math.round(3 + (baseMultiplier * 1)),
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: Math.round(40 + (baseMultiplier * 15))
      };
    case 'K':
      return {
        projection: 0,
        rushing_projection: 0,
        receiving_projection: 0,
        td_projection: 0,
        int_projection: 0,
        field_goals_projection: Math.round(15 + (baseMultiplier * 3)),
        extra_points_projection: Math.round(30 + (baseMultiplier * 8)),
        fantasy_points: Math.round(80 + (baseMultiplier * 15))
      };
    default:
      return {
        projection: 0,
        rushing_projection: 0,
        receiving_projection: 0,
        td_projection: 0,
        int_projection: 0,
        field_goals_projection: 0,
        extra_points_projection: 0,
        fantasy_points: 0
      };
  }
}

function extractPlayersFromMarkdown(filePath, teamName, teamAbbreviation) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const players = [];

    for (const line of lines) {
      if (line.includes(' QB ') || line.includes(' RB ') || line.includes(' WR ') || line.includes(' TE ') || line.includes(' K ')) {
        if (line.includes('| | |') || line.includes('NAME') || line.includes('JERSEY') || line.includes('POS')) {
          continue;
        }

        const playerMatch = line.match(/([A-Za-z\s\.]+)\s+(\d+)\s+(QB|RB|WR|TE|K)\s+(\d+-\d+)\s+(\d+)\s+(\w+)/);

        if (playerMatch) {
          const [, name, jersey, position, height, weight, year] = playerMatch;
          let rating = 3;
          const ratingMatch = line.match(/0\.\d{4}/);
          if (ratingMatch) {
            rating = convertToStarRating(parseFloat(ratingMatch[0]));
          }
          const cleanName = name.trim().replace(/\s+/g, ' ');
          if (cleanName && cleanName.length > 1) {
            const projections = generateProjections(position, rating);
            players.push({
              name: cleanName, position: position, team: teamName, team_abbreviation: teamAbbreviation,
              school: teamName, conference: 'Big 12', jersey: jersey, height: height || '6-0',
              weight: weight || '200', year: year || 'FR', ...projections,
              draftable: true, conference_id: 'big12', power_4: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      }
    }
    return players;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

const big12Teams = {
  'Iowa State': { file: 'Iowa State Cyclones 2025 Rosters.md', abbreviation: 'ISU' },
  'Houston': { file: 'Houston Cougars 2025 Rosters.md', abbreviation: 'HOU' },
  'Colorado': { file: 'Colorado Buffaloes 2025 Rosters.md', abbreviation: 'COLO' },
  'Cincinnati': { file: 'Cincinnati Bearcats 2025 Rosters.md', abbreviation: 'CIN' },
  'BYU': { file: 'BYU Cougars 2025 Rosters.md', abbreviation: 'BYU' },
  'Arizona': { file: 'Arizona Wildcats 2025 Rosters.md', abbreviation: 'ARIZ' },
  'Arizona State': { file: 'Arizona State Sun Devils 2025 Rosters.md', abbreviation: 'ASU' },
  'Baylor': { file: 'Baylor Bears 2025 Rosters.md', abbreviation: 'BAYL' }
};

async function addBig12TeamsFromPDFs() {
  console.log('🏈 Adding Big 12 Teams from PDF Data...');
  console.log('==========================================');
  console.log('📋 Adding 8 Big 12 teams with current roster data');
  console.log('');

  let totalAdded = 0;
  let totalErrors = 0;

  for (const [teamName, teamInfo] of Object.entries(big12Teams)) {
    try {
      console.log(`\n🔍 Processing ${teamName}...`);
      
      const filePath = path.join(process.cwd(), 'Big_12_2025', 'markdown', teamInfo.file);
      const players = extractPlayersFromMarkdown(filePath, teamName, teamInfo.abbreviation);
      
      console.log(`  📄 Found ${players.length} fantasy-relevant players`);
      
      let teamAdded = 0;
      let teamErrors = 0;
      
      for (const player of players) {
        try {
          await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', player);
          console.log(`    ✅ ${player.name} (${player.position}) - ${player.rating}★`);
          teamAdded++;
          totalAdded++;
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`    ⚠️  ${player.name} already exists`);
          } else {
            console.log(`    ❌ Error adding ${player.name}: ${error.message}`);
            teamErrors++;
            totalErrors++;
          }
        }
      }
      
      console.log(`  📊 ${teamName}: ${teamAdded} added, ${teamErrors} errors`);
      
    } catch (error) {
      console.log(`  ❌ Error processing ${teamName}: ${error.message}`);
      totalErrors++;
    }
  }

  console.log('\n🎉 Big 12 Teams Summary:');
  console.log(`  ✅ Total players added: ${totalAdded}`);
  console.log(`  ❌ Total errors: ${totalErrors}`);
  console.log(`  📋 Teams processed: 8 (Iowa State, Houston, Colorado, Cincinnati, BYU, Arizona, Arizona State, Baylor)`);
  console.log('🏈 Big 12 teams completed!');
}

addBig12TeamsFromPDFs(); 