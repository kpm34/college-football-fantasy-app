#!/usr/bin/env tsx
/**
 * Add leagueName attribute to league_memberships collection
 * and populate it for existing records
 */

import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const MEMBERSHIPS_COLLECTION = 'league_memberships';
const LEAGUES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues';

async function addLeagueNameAttribute() {
  try {
    console.log('🔧 Adding leagueName attribute to league_memberships collection...');
    
    // Step 1: Add the attribute to the collection
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        MEMBERSHIPS_COLLECTION,
        'leagueName',
        100,
        false, // not required
        undefined, // no default value
        false // not array
      );
      console.log('✅ Successfully added leagueName attribute');
    } catch (error: any) {
      if (error.code === 409 || error.message?.includes('already exists')) {
        console.log('ℹ️ leagueName attribute already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Wait for attribute to be ready
    console.log('⏳ Waiting for attribute to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Fetch all memberships
    console.log('📊 Fetching existing memberships...');
    let allMemberships: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        MEMBERSHIPS_COLLECTION,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allMemberships = [...allMemberships, ...response.documents];
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    console.log(`Found ${allMemberships.length} memberships to update`);

    // Step 4: Create a map of league IDs to names
    const leagueMap = new Map<string, string>();
    const uniqueLeagueIds = [...new Set(allMemberships.map(m => m.leagueId))];
    
    console.log(`📋 Fetching ${uniqueLeagueIds.length} unique leagues...`);
    
    for (const leagueId of uniqueLeagueIds) {
      try {
        const league = await databases.getDocument(
          DATABASE_ID,
          LEAGUES_COLLECTION,
          leagueId
        );
        leagueMap.set(leagueId, league.name || `League ${leagueId.slice(0, 8)}`);
        console.log(`  - ${league.name} (${leagueId})`);
      } catch (error) {
        console.warn(`  ⚠️ Could not fetch league ${leagueId}, using fallback name`);
        leagueMap.set(leagueId, `League ${leagueId.slice(0, 8)}`);
      }
    }

    // Step 5: Update each membership with the league name
    console.log('🔄 Updating memberships with league names...');
    let successCount = 0;
    let errorCount = 0;

    for (const membership of allMemberships) {
      const leagueName = leagueMap.get(membership.leagueId);
      
      if (!leagueName) {
        console.warn(`⚠️ No league name found for membership ${membership.$id}`);
        errorCount++;
        continue;
      }

      try {
        await databases.updateDocument(
          DATABASE_ID,
          MEMBERSHIPS_COLLECTION,
          membership.$id,
          {
            leagueName: leagueName
          }
        );
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  Progress: ${successCount}/${allMemberships.length} updated`);
        }
      } catch (error) {
        console.error(`❌ Failed to update membership ${membership.$id}:`, error);
        errorCount++;
      }
    }

    console.log('\n✨ Migration complete!');
    console.log(`  - Total memberships: ${allMemberships.length}`);
    console.log(`  - Successfully updated: ${successCount}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addLeagueNameAttribute()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
