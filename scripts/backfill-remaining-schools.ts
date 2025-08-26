#!/usr/bin/env tsx
/**
 * Backfill remaining schools that failed due to stadium attribute
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

// Schools that failed in the previous run
const REMAINING_SCHOOLS = [
  // Big Ten
  { name: 'Michigan', abbreviation: 'MICH', mascot: 'Wolverines', conference: 'Big Ten' },
  { name: 'Ohio State', abbreviation: 'OSU', mascot: 'Buckeyes', conference: 'Big Ten' },
  { name: 'Penn State', abbreviation: 'PSU', mascot: 'Nittany Lions', conference: 'Big Ten' },
  { name: 'Michigan State', abbreviation: 'MSU', mascot: 'Spartans', conference: 'Big Ten' },
  { name: 'Wisconsin', abbreviation: 'WIS', mascot: 'Badgers', conference: 'Big Ten' },
  { name: 'Iowa', abbreviation: 'IOWA', mascot: 'Hawkeyes', conference: 'Big Ten' },
  { name: 'Nebraska', abbreviation: 'NEB', mascot: 'Cornhuskers', conference: 'Big Ten' },
  
  // SEC
  { name: 'Georgia', abbreviation: 'UGA', mascot: 'Bulldogs', conference: 'SEC' },
  { name: 'Alabama', abbreviation: 'ALA', mascot: 'Crimson Tide', conference: 'SEC' },
  { name: 'LSU', abbreviation: 'LSU', mascot: 'Tigers', conference: 'SEC' },
  { name: 'Florida', abbreviation: 'UF', mascot: 'Gators', conference: 'SEC' },
  { name: 'Tennessee', abbreviation: 'TENN', mascot: 'Volunteers', conference: 'SEC' },
  { name: 'Texas', abbreviation: 'TEX', mascot: 'Longhorns', conference: 'SEC' },
  { name: 'Texas A&M', abbreviation: 'TAMU', mascot: 'Aggies', conference: 'SEC' },
  { name: 'Auburn', abbreviation: 'AUB', mascot: 'Tigers', conference: 'SEC' },
  
  // Big 12
  { name: 'Oklahoma State', abbreviation: 'OKST', mascot: 'Cowboys', conference: 'Big 12' },
  { name: 'Texas Tech', abbreviation: 'TTU', mascot: 'Red Raiders', conference: 'Big 12' },
  { name: 'BYU', abbreviation: 'BYU', mascot: 'Cougars', conference: 'Big 12' },
  { name: 'Colorado', abbreviation: 'COL', mascot: 'Buffaloes', conference: 'Big 12' },
  
  // ACC
  { name: 'Clemson', abbreviation: 'CLEM', mascot: 'Tigers', conference: 'ACC' },
  { name: 'Florida State', abbreviation: 'FSU', mascot: 'Seminoles', conference: 'ACC' },
  { name: 'Miami', abbreviation: 'MIA', mascot: 'Hurricanes', conference: 'ACC' },
  { name: 'Virginia Tech', abbreviation: 'VT', mascot: 'Hokies', conference: 'ACC' }
];

async function backfillRemainingSchools() {
  try {
    console.log('🏫 Backfilling remaining schools...\n');

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const team of REMAINING_SCHOOLS) {
      try {
        // Get team colors
        const colors = TEAM_COLORS[team.name] || { primary: '#666666', secondary: '#FFFFFF' };

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
          // School doesn't exist
        }

        const schoolData = {
          name: team.name,
          conference: team.conference,
          mascot: team.mascot,
          abbreviation: team.abbreviation,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          logoUrl: '',
          slug: team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        };

        if (existingSchool) {
          // Update existing school
          await databases.updateDocument(
            DATABASE_ID,
            SCHOOLS_COLLECTION,
            existingSchool.$id,
            schoolData
          );
          console.log(`✅ Updated: ${team.name} (${team.abbreviation}) - ${team.conference}`);
          console.log(`   Colors: ${colors.primary} / ${colors.secondary}`);
          totalUpdated++;
        } else {
          // Create new school
          await databases.createDocument(
            DATABASE_ID,
            SCHOOLS_COLLECTION,
            ID.unique(),
            schoolData
          );
          console.log(`✅ Created: ${team.name} (${team.abbreviation}) - ${team.conference}`);
          console.log(`   Colors: ${colors.primary} / ${colors.secondary}`);
          totalCreated++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing ${team.name}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✨ Remaining schools backfill complete!');
    console.log(`   📊 Summary:`);
    console.log(`      Created: ${totalCreated} schools`);
    console.log(`      Updated: ${totalUpdated} schools`);
    console.log(`      Errors: ${totalErrors}`);
    console.log(`      Total processed: ${totalCreated + totalUpdated} schools`);

    // Verify the data
    console.log('\n🔍 Verifying complete data...');
    try {
      const allSchools = await databases.listDocuments(
        DATABASE_ID,
        SCHOOLS_COLLECTION,
        [Query.limit(100)]
      );
      
      console.log(`   Total schools in database: ${allSchools.total}`);
      
      // Group by conference
      const byConference: Record<string, number> = {};
      const schoolsByConf: Record<string, string[]> = {};
      
      for (const school of allSchools.documents) {
        const conf = (school as any).conference || 'Unknown';
        byConference[conf] = (byConference[conf] || 0) + 1;
        if (!schoolsByConf[conf]) schoolsByConf[conf] = [];
        schoolsByConf[conf].push((school as any).name);
      }
      
      console.log('\n   Schools by conference:');
      for (const [conf, count] of Object.entries(byConference)) {
        console.log(`\n   ${conf}: ${count} teams`);
        console.log(`      ${schoolsByConf[conf].sort().join(', ')}`);
      }
      
      // Check for missing major schools
      const expectedSchools = [
        'Michigan', 'Ohio State', 'Penn State', 'Wisconsin', 'Iowa', 'Nebraska',
        'Alabama', 'Georgia', 'LSU', 'Florida', 'Texas', 'Tennessee',
        'Oklahoma State', 'Texas Tech', 'BYU', 'Colorado',
        'Clemson', 'Florida State', 'Miami', 'Virginia Tech'
      ];
      
      const existingNames = new Set(allSchools.documents.map((s: any) => s.name));
      const missing = expectedSchools.filter(name => !existingNames.has(name));
      
      if (missing.length > 0) {
        console.log('\n   ⚠️  Missing schools:', missing.join(', '));
      } else {
        console.log('\n   ✅ All major schools are present!');
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
console.log('🚀 Remaining Schools Backfill');
console.log('━'.repeat(50));
backfillRemainingSchools()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
