#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

// Team name mappings to match database
const teamMappings: Record<string, string> = {
  // Big 12
  "Arizona": "Arizona Wildcats",
  "Arizona State": "Arizona State Sun Devils",
  "Baylor": "Baylor Bears",
  "BYU": "B Y U Cougars",
  "Cincinnati": "Cincinnati Bearcats",
  "Colorado": "Colorado Buffaloes",
  "Houston": "Houston Cougars",
  "Iowa State": "Iowa State Cyclones",
  "Kansas": "Kansas Jayhawks",
  "Kansas State": "Kansas State Wildcats",
  "Oklahoma State": "Oklahoma State Cowboys",
  "TCU": "T C U Horned Frogs",
  "Texas Tech": "Texas Tech Red Raiders",
  "UCF": "U C F Knights",
  "Utah": "Utah Utes",
  "West Virginia": "West Virginia Mountaineers",
  
  // Big Ten
  "Illinois": "Illinois Fighting Illini",
  "Indiana": "Indiana Hoosiers",
  "Iowa": "Iowa Hawkeyes",
  "Maryland": "Maryland Terrapins",
  "Michigan": "Michigan Wolverines",
  "Michigan State": "Michigan State Spartans",
  "Minnesota": "Minnesota Golden Gophers",
  "Nebraska": "Nebraska Cornhuskers",
  "Northwestern": "Northwestern Wildcats",
  "Ohio State": "Ohio State Buckeyes",
  "Penn State": "Penn State Nittany Lions",
  "Purdue": "Purdue Boilermakers",
  "Rutgers": "Rutgers Scarlet Knights",
  "Wisconsin": "Wisconsin Badgers",
  "Oregon": "Oregon Ducks",
  "Washington": "Washington Huskies",
  "USC": "U S C Trojans",
  "UCLA": "U C L A Bruins",
  
  // ACC
  "Boston College": "Boston College",
  "California": "California",
  "Clemson": "Clemson",
  "Duke": "Duke",
  "Florida State": "Florida State",
  "Georgia Tech": "Georgia Tech",
  "Louisville": "Louisville",
  "Miami (FL)": "Miami",
  "North Carolina": "North Carolina",
  "NC State": "N C State",
  "Pittsburgh": "Pittsburgh",
  "SMU": "S M U",
  "Stanford": "Stanford",
  "Syracuse": "Syracuse",
  "Virginia": "Virginia",
  "Virginia Tech": "Virginia Tech",
  "Wake Forest": "Wake Forest",
  
  // SEC
  "Alabama": "Alabama",
  "Arkansas": "Arkansas",
  "Auburn": "Auburn",
  "Florida": "Florida",
  "Georgia": "Georgia",
  "Kentucky": "Kentucky",
  "LSU": "L S U",
  "Ole Miss": "Mississippi",
  "Mississippi State": "Mississippi State",
  "Missouri": "Missouri",
  "Oklahoma": "Oklahoma",
  "South Carolina": "South Carolina",
  "Tennessee": "Tennessee",
  "Texas": "Texas",
  "Texas A&M": "Texas A& M",
  "Vanderbilt": "Vanderbilt"
};

function normalizeDepthChart(filePath: string): void {
  console.log(`\nProcessing ${path.basename(filePath)}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  let updated = 0;
  let notFound: string[] = [];
  
  const normalized = data.map((row: any) => {
    const originalTeam = row.team;
    const mappedTeam = teamMappings[originalTeam];
    
    if (mappedTeam && mappedTeam !== originalTeam) {
      updated++;
      return { ...row, team: mappedTeam };
    } else if (!mappedTeam) {
      notFound.push(originalTeam);
    }
    
    return row;
  });
  
  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2));
  
  console.log(`  Updated ${updated} team names`);
  if (notFound.length > 0) {
    console.log(`  Teams not mapped: ${notFound.join(', ')}`);
  }
}

// Process all depth chart files
const depthChartsDir = path.join(process.cwd(), 'data', 'imports', 'depth-charts-2025');
const files = [
  'sec_depth_2025.json',
  'acc_depth_2025.json',
  'big12_depth_2025.json',
  'bigten_depth_2025.json'
];

console.log('Normalizing depth chart team names to match database...');

for (const file of files) {
  const filePath = path.join(depthChartsDir, file);
  if (fs.existsSync(filePath)) {
    normalizeDepthChart(filePath);
  } else {
    console.log(`File not found: ${file}`);
  }
}

console.log('\n✅ Depth charts normalized!');
