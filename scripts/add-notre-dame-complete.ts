#!/usr/bin/env tsx
/**
 * Complete script to add Notre Dame roster to the college_players collection
 * Using the verified database schema
 */

import { Client, Databases, ID } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client();

const apiKey = 'standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891';

client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

// Helper function to get base fantasy projections based on position and depth
function getBaseProjection(position: string, depthOrder: number): number {
  const baseProjections: Record<string, number[]> = {
    'QB': [280, 70, 28, 14], // Starter, backup, 3rd string, etc.
    'RB': [220, 132, 88, 55, 33],
    'WR': [200, 160, 120, 70, 40],
    'TE': [160, 56, 24],
    'K': [140, 35, 14],
  };
  
  const projections = baseProjections[position] || [0];
  return projections[Math.min(depthOrder - 1, projections.length - 1)] || projections[projections.length - 1];
}

// Helper function to convert year abbreviations
function convertYear(year: string): 'FR' | 'SO' | 'JR' | 'SR' {
  switch(year.toLowerCase()) {
    case 'fr':
    case 'freshman':
      return 'FR';
    case 'soph':
    case 'sophomore':
      return 'SO';
    case 'jr':
    case 'junior':
      return 'JR';
    case 'sr':
    case 'senior':
      return 'SR';
    default:
      return 'FR';
  }
}

// Notre Dame roster data from the provided image
const notreDameRoster = [
  // Quarterbacks
  { number: 10, name: 'Tyler Buchner', position: 'QB', height: '6-1', weight: 206, year: 'Sr', hometown: 'San Diego, CA' },
  { number: 13, name: 'CJ Carr', position: 'QB', height: '6-3', weight: 210, year: 'Fr', hometown: 'Saline, MI' },
  { number: 12, name: 'Blake Hebert', position: 'QB', height: '6-3', weight: 225, year: 'Fr', hometown: 'Boxford, MA' },
  { number: 8, name: 'Kenny Minchey', position: 'QB', height: '6-2', weight: 208, year: 'Soph', hometown: 'Hendersonville, TN' },
  { number: 16, name: 'Anthony Rezac', position: 'QB', height: '6-3', weight: 201, year: 'Soph', hometown: 'Omaha, NE' },
  
  // Running Backs
  { number: 25, name: 'Dylan Devezin', position: 'RB', height: '6-2', weight: 216, year: 'Sr', hometown: 'New Orleans, LA' },
  { number: 23, name: 'Nolan James Jr.', position: 'RB', height: '5-10', weight: 215, year: 'Fr', hometown: 'Westwood, NJ' },
  { number: 4, name: 'Jeremiyah Love', position: 'RB', height: '6-0', weight: 214, year: 'Jr', hometown: 'St. Louis, MO' },
  { number: 3, name: "Gi'Bran Payne", position: 'RB', height: '5-10', weight: 205, year: 'Jr', hometown: 'Cincinnati, OH' },
  { number: 24, name: 'Jadarian Price', position: 'RB', height: '5-11', weight: 210, year: 'Jr', hometown: 'Denison, TX' },
  { number: 26, name: 'Jake Tafelski', position: 'RB', height: '6-0', weight: 206, year: 'Sr', hometown: 'Dearborn, MI' },
  { number: 22, name: 'Aneyas Williams', position: 'RB', height: '5-10', weight: 205, year: 'Soph', hometown: 'Hannibal, MO' },
  { number: 21, name: 'Kedren Young', position: 'RB', height: '5-11', weight: 240, year: 'Fr', hometown: 'Lufkin, TX' },
  
  // Wide Receivers
  { number: 15, name: 'Jerome Bettis Jr.', position: 'WR', height: '6-1', weight: 207, year: 'Fr', hometown: 'Atlanta, GA' },
  { number: 17, name: 'Elijah Burress', position: 'WR', height: '6-0', weight: 185, year: 'Fr', hometown: 'Totowa, NJ' },
  { number: 6, name: 'Jordan Faison', position: 'WR', height: '5-10', weight: 185, year: 'Jr', hometown: 'Fort Lauderdale, FL' },
  { number: 0, name: 'Malachi Fields', position: 'WR', height: '6-4', weight: 222, year: 'Sr', hometown: 'Charlottesville, VA' },
  { number: 14, name: 'Micah Gilbert', position: 'WR', height: '6-2', weight: 204, year: 'Fr', hometown: 'Charlotte, NC' },
  { number: 1, name: 'Jaden Greathouse', position: 'WR', height: '6-1', weight: 215, year: 'Jr', hometown: 'Austin, TX' },
  { number: 33, name: 'Matt Jeffery', position: 'WR', height: '5-11', weight: 195, year: 'Soph', hometown: 'Cheshire, CT' },
  { number: 2, name: 'Will Pauling', position: 'WR', height: '5-10', weight: 190, year: 'Sr', hometown: 'Chicago, IL' },
  { number: 81, name: 'Scrap Richardson', position: 'WR', height: '6-0', weight: 190, year: 'Fr', hometown: 'Greenville, GA' },
  { number: 19, name: 'Logan Saldate', position: 'WR', height: '6-0', weight: 189, year: 'Fr', hometown: 'Gilroy, CA' },
  { number: 82, name: 'Leo Scheidler', position: 'WR', height: '6-1', weight: 195, year: 'Sr', hometown: 'Lake Forest, IL' },
  { number: 11, name: 'KK Smith', position: 'WR', height: '6-0', weight: 176, year: 'Soph', hometown: 'Frisco, TX' },
  { number: 31, name: 'Xavier Southall', position: 'WR', height: '6-0', weight: 180, year: 'Soph', hometown: 'Alexandria, VA' },
  { number: 86, name: 'Alex Whitman', position: 'WR', height: '6-3', weight: 199, year: 'Jr', hometown: 'Hightstown, NJ' },
  { number: 5, name: 'Cam Williams', position: 'WR', height: '6-2', weight: 200, year: 'Fr', hometown: 'Glen Ellyn, IL' },
  
  // Tight Ends
  { number: 84, name: 'Kevin Bauman', position: 'TE', height: '6-5', weight: 250, year: 'Sr', hometown: 'Middletown, NJ' },
  { number: 32, name: 'Justin Fisher', position: 'TE', height: '6-3', weight: 233, year: 'Sr', hometown: 'Mishawaka, IN' },
  { number: 87, name: 'Cooper Flanagan', position: 'TE', height: '6-6', weight: 255, year: 'Jr', hometown: 'Pleasant Hill, CA' },
  { number: 88, name: 'James Flanigan', position: 'TE', height: '6-6', weight: 241, year: 'Fr', hometown: 'Green Bay, WI' },
  { number: 42, name: 'Henry Garrity', position: 'TE', height: '6-3', weight: 227, year: 'Jr', hometown: 'Bloomfield Hills, MI' },
  { number: 85, name: 'Jack Larsen', position: 'TE', height: '6-3', weight: 250, year: 'Fr', hometown: 'Charlotte, NC' },
  { number: 9, name: 'Eli Raridon', position: 'TE', height: '6-7', weight: 252, year: 'Sr', hometown: 'Des Moines, IA' },
  
  // Kickers
  { number: 98, name: 'Noah Burnette', position: 'K', height: '5-10', weight: 185, year: 'Sr', hometown: 'Raleigh, NC' },
  { number: 48, name: 'Marcello Diomede', position: 'K', height: '6-1', weight: 195, year: 'Jr', hometown: 'Glen Ellyn, IL' },
  { number: 18, name: 'Erik Schmidt', position: 'K', height: '6-2', weight: 210, year: 'Fr', hometown: 'Milwaukee, WI' },
];

// Assign depth chart order based on listing order
const depthChartOrder: Record<string, number> = {};
let qbOrder = 1, rbOrder = 1, wrOrder = 1, teOrder = 1, kOrder = 1;

notreDameRoster.forEach(player => {
  const key = `${player.name}-${player.position}`;
  switch(player.position) {
    case 'QB':
      depthChartOrder[key] = qbOrder++;
      break;
    case 'RB':
      depthChartOrder[key] = rbOrder++;
      break;
    case 'WR':
      depthChartOrder[key] = wrOrder++;
      break;
    case 'TE':
      depthChartOrder[key] = teOrder++;
      break;
    case 'K':
      depthChartOrder[key] = kOrder++;
      break;
  }
});

async function addPlayersToDatabase() {
  console.log('🏈 Starting Notre Dame roster import...');
  console.log(`📍 Endpoint: https://nyc.cloud.appwrite.io/v1`);
  console.log(`📁 Project: college-football-fantasy-app`);
  console.log(`💾 Database: ${DATABASE_ID}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  // First check if Jeremiyah Love already exists
  const existingCheck = ['Jeremiyah Love'];
  
  for (const player of notreDameRoster) {
    // Skip if we already added this player (like Jeremiyah Love)
    if (existingCheck.includes(player.name)) {
      console.log(`⏭️  Skipping ${player.name} (already exists)`);
      continue;
    }
    
    try {
      const depthOrder = depthChartOrder[`${player.name}-${player.position}`] || 99;
      const projection = getBaseProjection(player.position, depthOrder);
      
      // Create player document with the verified schema
      const playerData = {
        name: player.name,
        position: player.position,
        team: 'Notre Dame',
        conference: 'Independent',
        fantasy_points: projection,
        depth_chart_order: depthOrder,
        eligible: true,
        // Optional fields
        year: convertYear(player.year),
        jerseyNumber: player.number,
        height: player.height,
        weight: player.weight,
        season_fantasy_points: projection // Set same as fantasy_points initially
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        playerData
      );
      
      console.log(`✅ Added ${player.position} ${player.name} (#${player.number}) - Depth: ${depthOrder}, Projection: ${projection}`);
      successCount++;
      
    } catch (error: any) {
      console.error(`❌ Failed to add ${player.name}: ${error.message}`);
      errors.push(`${player.name}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully added: ${successCount} players`);
  console.log(`⏭️  Skipped (already exists): 1 player`);
  console.log(`❌ Failed: ${errorCount} players`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('\n🎯 Notre Dame roster import complete!');
  console.log('🏈 Go Irish! ☘️');
}

// Run the import
addPlayersToDatabase().catch(console.error);
