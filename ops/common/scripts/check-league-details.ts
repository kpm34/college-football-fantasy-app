import { Client, Databases, Query, Account } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/config/appwrite.config';
import { COLLECTIONS } from '../lib/appwrite';

const sessionCookie = process.env.SESSION_COOKIE;
if (!sessionCookie) {
  console.error('Please provide SESSION_COOKIE environment variable');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setSession(sessionCookie);

const databases = new Databases(client);
const account = new Account(client);
const DATABASE_ID = APPWRITE_CONFIG.databaseId;

async function checkLeagueDetails() {
  console.log('\n🎯 Checking league details');
  console.log('='.repeat(50));
  
  try {
    // Get current user
    const user = await account.get();
    console.log('\nCurrent user ID:', user.$id);
    
    // Get all leagues
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(100)]
    );
    
    console.log(`\nFound ${leagues.documents.length} leagues:`);
    
    for (const league of leagues.documents) {
      console.log(`\n🏈 League: ${league.name}`);
      console.log(`  ID: ${league.$id}`);
      console.log(`  Commissioner: ${league.commissioner}`);
      console.log(`  CommissionerId (legacy): ${league.commissionerId || 'N/A'}`);
      console.log(`  Status: ${league.status}`);
      console.log(`  Teams: ${league.currentTeams}/${league.maxTeams}`);
      
      // Check if user is commissioner
      if (league.commissioner === user.$id) {
        console.log('  ✅ USER IS COMMISSIONER!');
      }
      
      // Get all rosters in this league
      console.log('\n  Rosters in this league:');
      const rosters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('leagueId', league.$id)]
      );
      
      if (rosters.documents.length === 0) {
        console.log('    No rosters found');
      } else {
        rosters.documents.forEach((roster: any) => {
          console.log(`    - ${roster.teamName} (User: ${roster.userId})`);
          if (roster.userId === user.$id) {
            console.log('      ✅ THIS IS USER\'S TEAM!');
          }
        });
      }
      
      // Also check teams collection
      try {
        const teams = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TEAMS,
          [Query.equal('leagueId', league.$id)]
        );
        
        if (teams.documents.length > 0) {
          console.log('\n  Teams (legacy collection):');
          teams.documents.forEach((team: any) => {
            console.log(`    - ${team.name} (User: ${team.userId || team.ownerId || 'N/A'})`);
          });
        }
      } catch (e) {
        // Ignore teams collection errors
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLeagueDetails();
