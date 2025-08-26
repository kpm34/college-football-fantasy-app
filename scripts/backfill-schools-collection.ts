#!/usr/bin/env tsx
/**
 * Backfill schools collection with team colors and conference information
 */

import { Client, Databases, Query, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { TEAM_COLORS } from '../lib/team-colors';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const SCHOOLS_COLLECTION = 'schools';

// Define all Power 4 conference teams with their data
const POWER_4_TEAMS = {
  'Big Ten': [
    { name: 'Michigan', abbreviation: 'MICH', mascot: 'Wolverines' },
    { name: 'Ohio State', abbreviation: 'OSU', mascot: 'Buckeyes' },
    { name: 'Penn State', abbreviation: 'PSU', mascot: 'Nittany Lions' },
    { name: 'Michigan State', abbreviation: 'MSU', mascot: 'Spartans' },
    { name: 'Indiana', abbreviation: 'IND', mascot: 'Hoosiers' },
    { name: 'Maryland', abbreviation: 'MD', mascot: 'Terrapins' },
    { name: 'Rutgers', abbreviation: 'RUTG', mascot: 'Scarlet Knights' },
    { name: 'UCLA', abbreviation: 'UCLA', mascot: 'Bruins' },
    { name: 'USC', abbreviation: 'USC', mascot: 'Trojans' },
    { name: 'Washington', abbreviation: 'WASH', mascot: 'Huskies' },
    { name: 'Oregon', abbreviation: 'ORE', mascot: 'Ducks' },
    { name: 'Wisconsin', abbreviation: 'WIS', mascot: 'Badgers' },
    { name: 'Iowa', abbreviation: 'IOWA', mascot: 'Hawkeyes' },
    { name: 'Minnesota', abbreviation: 'MINN', mascot: 'Golden Gophers' },
    { name: 'Illinois', abbreviation: 'ILL', mascot: 'Fighting Illini' },
    { name: 'Northwestern', abbreviation: 'NW', mascot: 'Wildcats' },
    { name: 'Purdue', abbreviation: 'PUR', mascot: 'Boilermakers' },
    { name: 'Nebraska', abbreviation: 'NEB', mascot: 'Cornhuskers' }
  ],
  'SEC': [
    { name: 'Georgia', abbreviation: 'UGA', mascot: 'Bulldogs' },
    { name: 'Alabama', abbreviation: 'ALA', mascot: 'Crimson Tide' },
    { name: 'LSU', abbreviation: 'LSU', mascot: 'Tigers' },
    { name: 'Florida', abbreviation: 'UF', mascot: 'Gators' },
    { name: 'Tennessee', abbreviation: 'TENN', mascot: 'Volunteers' },
    { name: 'Kentucky', abbreviation: 'UK', mascot: 'Wildcats' },
    { name: 'South Carolina', abbreviation: 'SC', mascot: 'Gamecocks' },
    { name: 'Missouri', abbreviation: 'MIZ', mascot: 'Tigers' },
    { name: 'Ole Miss', abbreviation: 'MISS', mascot: 'Rebels' },
    { name: 'Mississippi State', abbreviation: 'MSST', mascot: 'Bulldogs' },
    { name: 'Texas', abbreviation: 'TEX', mascot: 'Longhorns' },
    { name: 'Oklahoma', abbreviation: 'OU', mascot: 'Sooners' },
    { name: 'Texas A&M', abbreviation: 'TAMU', mascot: 'Aggies' },
    { name: 'Arkansas', abbreviation: 'ARK', mascot: 'Razorbacks' },
    { name: 'Auburn', abbreviation: 'AUB', mascot: 'Tigers' },
    { name: 'Vanderbilt', abbreviation: 'VAN', mascot: 'Commodores' }
  ],
  'Big 12': [
    { name: 'Kansas', abbreviation: 'KU', mascot: 'Jayhawks' },
    { name: 'Kansas State', abbreviation: 'KSU', mascot: 'Wildcats' },
    { name: 'Oklahoma State', abbreviation: 'OKST', mascot: 'Cowboys' },
    { name: 'TCU', abbreviation: 'TCU', mascot: 'Horned Frogs' },
    { name: 'Baylor', abbreviation: 'BAYL', mascot: 'Bears' },
    { name: 'Texas Tech', abbreviation: 'TTU', mascot: 'Red Raiders' },
    { name: 'West Virginia', abbreviation: 'WVU', mascot: 'Mountaineers' },
    { name: 'Iowa State', abbreviation: 'ISU', mascot: 'Cyclones' },
    { name: 'Cincinnati', abbreviation: 'CIN', mascot: 'Bearcats' },
    { name: 'Houston', abbreviation: 'HOU', mascot: 'Cougars' },
    { name: 'UCF', abbreviation: 'UCF', mascot: 'Knights' },
    { name: 'BYU', abbreviation: 'BYU', mascot: 'Cougars' },
    { name: 'Colorado', abbreviation: 'COL', mascot: 'Buffaloes' },
    { name: 'Arizona', abbreviation: 'ARIZ', mascot: 'Wildcats' },
    { name: 'Arizona State', abbreviation: 'ASU', mascot: 'Sun Devils' },
    { name: 'Utah', abbreviation: 'UTAH', mascot: 'Utes' }
  ],
  'ACC': [
    { name: 'Clemson', abbreviation: 'CLEM', mascot: 'Tigers' },
    { name: 'Florida State', abbreviation: 'FSU', mascot: 'Seminoles' },
    { name: 'Miami', abbreviation: 'MIA', mascot: 'Hurricanes' },
    { name: 'North Carolina', abbreviation: 'UNC', mascot: 'Tar Heels' },
    { name: 'NC State', abbreviation: 'NCST', mascot: 'Wolfpack' },
    { name: 'Duke', abbreviation: 'DUKE', mascot: 'Blue Devils' },
    { name: 'Wake Forest', abbreviation: 'WAKE', mascot: 'Demon Deacons' },
    { name: 'Virginia', abbreviation: 'UVA', mascot: 'Cavaliers' },
    { name: 'Virginia Tech', abbreviation: 'VT', mascot: 'Hokies' },
    { name: 'Georgia Tech', abbreviation: 'GT', mascot: 'Yellow Jackets' },
    { name: 'Louisville', abbreviation: 'LOU', mascot: 'Cardinals' },
    { name: 'Syracuse', abbreviation: 'SYR', mascot: 'Orange' },
    { name: 'Boston College', abbreviation: 'BC', mascot: 'Eagles' },
    { name: 'Pitt', abbreviation: 'PITT', mascot: 'Panthers' },
    { name: 'California', abbreviation: 'CAL', mascot: 'Golden Bears' },
    { name: 'Stanford', abbreviation: 'STAN', mascot: 'Cardinal' },
    { name: 'SMU', abbreviation: 'SMU', mascot: 'Mustangs' }
  ]
};

// Additional team data (stadiums, locations, etc.)
const TEAM_DETAILS: Record<string, { stadium?: string; location?: string; capacity?: number }> = {
  // Big Ten
  'Michigan': { stadium: 'Michigan Stadium', location: 'Ann Arbor, MI', capacity: 107601 },
  'Ohio State': { stadium: 'Ohio Stadium', location: 'Columbus, OH', capacity: 102780 },
  'Penn State': { stadium: 'Beaver Stadium', location: 'University Park, PA', capacity: 106572 },
  'Michigan State': { stadium: 'Spartan Stadium', location: 'East Lansing, MI', capacity: 75005 },
  'Wisconsin': { stadium: 'Camp Randall Stadium', location: 'Madison, WI', capacity: 80321 },
  'Nebraska': { stadium: 'Memorial Stadium', location: 'Lincoln, NE', capacity: 85458 },
  'Iowa': { stadium: 'Kinnick Stadium', location: 'Iowa City, IA', capacity: 69250 },
  
  // SEC
  'Alabama': { stadium: 'Bryant-Denny Stadium', location: 'Tuscaloosa, AL', capacity: 101821 },
  'Georgia': { stadium: 'Sanford Stadium', location: 'Athens, GA', capacity: 93033 },
  'LSU': { stadium: 'Tiger Stadium', location: 'Baton Rouge, LA', capacity: 102321 },
  'Texas': { stadium: 'Darrell K Royal Stadium', location: 'Austin, TX', capacity: 100119 },
  'Tennessee': { stadium: 'Neyland Stadium', location: 'Knoxville, TN', capacity: 101915 },
  'Florida': { stadium: 'Ben Hill Griffin Stadium', location: 'Gainesville, FL', capacity: 88548 },
  'Auburn': { stadium: 'Jordan-Hare Stadium', location: 'Auburn, AL', capacity: 87451 },
  'Texas A&M': { stadium: 'Kyle Field', location: 'College Station, TX', capacity: 102733 },
  
  // Big 12
  'Oklahoma State': { stadium: 'Boone Pickens Stadium', location: 'Stillwater, OK', capacity: 60218 },
  'Texas Tech': { stadium: 'Jones AT&T Stadium', location: 'Lubbock, TX', capacity: 60454 },
  'BYU': { stadium: 'LaVell Edwards Stadium', location: 'Provo, UT', capacity: 63470 },
  'Colorado': { stadium: 'Folsom Field', location: 'Boulder, CO', capacity: 50183 },
  
  // ACC
  'Clemson': { stadium: 'Memorial Stadium', location: 'Clemson, SC', capacity: 81500 },
  'Florida State': { stadium: 'Doak Campbell Stadium', location: 'Tallahassee, FL', capacity: 79560 },
  'Miami': { stadium: 'Hard Rock Stadium', location: 'Miami Gardens, FL', capacity: 64767 },
  'Virginia Tech': { stadium: 'Lane Stadium', location: 'Blacksburg, VA', capacity: 65632 }
};

async function backfillSchools() {
  try {
    console.log('🏫 Starting schools collection backfill...\n');

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const [conference, teams] of Object.entries(POWER_4_TEAMS)) {
      console.log(`\n📊 Processing ${conference} Conference (${teams.length} teams)`);
      console.log('═'.repeat(50));

      for (const team of teams) {
        try {
          // Get team colors
          const colors = TEAM_COLORS[team.name] || { primary: '#666666', secondary: '#FFFFFF' };
          const details = TEAM_DETAILS[team.name] || {};

          // Check if school already exists
          let existingSchool = null;
          try {
            const existing = await databases.listDocuments(
              DATABASE_ID,
              SCHOOLS_COLLECTION,
              [
                Query.equal('name', team.name),
                Query.limit(1)
              ]
            );
            if (existing.documents.length > 0) {
              existingSchool = existing.documents[0];
            }
          } catch (e) {
            // Collection might not exist or query might fail
            console.log(`   ℹ️  Could not query for existing school: ${team.name}`);
          }

          const schoolData = {
            name: team.name,
            conference: conference,
            mascot: team.mascot,
            abbreviation: team.abbreviation,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
            logoUrl: details.logoUrl || '',
            slug: team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            ...(details.stadium && { stadium: details.stadium }),
            ...(details.location && { location: details.location }),
            ...(details.capacity && { capacity: details.capacity })
          };

          if (existingSchool) {
            // Update existing school
            await databases.updateDocument(
              DATABASE_ID,
              SCHOOLS_COLLECTION,
              existingSchool.$id,
              schoolData
            );
            console.log(`   ✅ Updated: ${team.name} (${team.abbreviation})`);
            console.log(`      Colors: ${colors.primary} / ${colors.secondary}`);
            totalUpdated++;
          } else {
            // Create new school
            await databases.createDocument(
              DATABASE_ID,
              SCHOOLS_COLLECTION,
              ID.unique(),
              schoolData
            );
            console.log(`   ✅ Created: ${team.name} (${team.abbreviation})`);
            console.log(`      Colors: ${colors.primary} / ${colors.secondary}`);
            if (details.stadium) {
              console.log(`      Stadium: ${details.stadium}`);
            }
            totalCreated++;
          }
        } catch (error: any) {
          console.error(`   ❌ Error processing ${team.name}:`, error.message);
          totalErrors++;
          
          // If the collection doesn't exist, try to create it
          if (error.code === 404 && error.type === 'collection_not_found') {
            console.log('\n🔧 Schools collection not found. Creating it...');
            try {
              // Create the collection first
              // Note: This would need to be done through Appwrite Console or a separate admin script
              console.log('   ⚠️  Please create the "schools" collection in Appwrite Console with the following attributes:');
              console.log('      - name (String, required)');
              console.log('      - conference (String, required)');
              console.log('      - mascot (String)');
              console.log('      - abbreviation (String)');
              console.log('      - primaryColor (String)');
              console.log('      - secondaryColor (String)');
              console.log('      - logoUrl (String)');
              console.log('      - slug (String)');
              console.log('      - stadium (String)');
              console.log('      - location (String)');
              console.log('      - capacity (Integer)');
              return;
            } catch (createError) {
              console.error('   ❌ Could not create collection:', createError);
              return;
            }
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✨ Schools backfill complete!');
    console.log(`   📊 Summary:`);
    console.log(`      Created: ${totalCreated} schools`);
    console.log(`      Updated: ${totalUpdated} schools`);
    console.log(`      Errors: ${totalErrors}`);
    console.log(`      Total processed: ${totalCreated + totalUpdated} schools`);

    // Verify the data
    console.log('\n🔍 Verifying data...');
    try {
      const allSchools = await databases.listDocuments(
        DATABASE_ID,
        SCHOOLS_COLLECTION,
        [Query.limit(100)]
      );
      
      console.log(`   Total schools in database: ${allSchools.total}`);
      
      // Group by conference
      const byConference: Record<string, number> = {};
      for (const school of allSchools.documents) {
        const conf = (school as any).conference || 'Unknown';
        byConference[conf] = (byConference[conf] || 0) + 1;
      }
      
      console.log('\n   Schools by conference:');
      for (const [conf, count] of Object.entries(byConference)) {
        console.log(`      ${conf}: ${count} teams`);
      }
    } catch (e) {
      console.log('   ⚠️  Could not verify data');
    }

  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
}

// Run the backfill
console.log('🚀 College Football Schools Collection Backfill');
console.log('━'.repeat(50));
backfillSchools()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
