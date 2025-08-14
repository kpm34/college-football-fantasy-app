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

async function debugUserData() {
  console.log('\n🔍 Debugging user data with session');
  console.log('='.repeat(50));
  
  try {
    // Get current user
    const user = await account.get();
    console.log('\nCurrent user:');
    console.log(`  ID: ${user.$id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    
    // 1. Check leagues where user is commissioner
    console.log('\n1. Checking leagues where user is commissioner...');
    const commissionerLeagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.equal('commissioner', user.$id)]
    );
    
    console.log(`Found ${commissionerLeagues.documents.length} leagues where user is commissioner`);
    commissionerLeagues.documents.forEach((league: any) => {
      console.log(`  - ${league.name} (ID: ${league.$id})`);
      console.log(`    Status: ${league.status}`);
      console.log(`    Teams: ${league.currentTeams}/${league.maxTeams}`);
    });
    
    // 2. Check rosters
    console.log('\n2. Checking user rosters...');
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('userId', user.$id)]
    );
    
    console.log(`Found ${rosters.documents.length} rosters for user`);
    rosters.documents.forEach((roster: any) => {
      console.log(`  - Team: ${roster.teamName} (ID: ${roster.$id})`);
      console.log(`    League ID: ${roster.leagueId}`);
      console.log(`    Record: ${roster.wins}-${roster.losses}`);
    });
    
    // 3. Check teams collection (legacy)
    console.log('\n3. Checking teams collection (legacy)...');
    try {
      const teams = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('userId', user.$id)]
      );
      
      console.log(`Found ${teams.documents.length} teams for user`);
      teams.documents.forEach((team: any) => {
        console.log(`  - Team: ${team.name} (ID: ${team.$id})`);
        console.log(`    League ID: ${team.leagueId}`);
      });
    } catch (error: any) {
      console.log('Teams collection error:', error.message);
    }
    
    // 4. Check all leagues to find where user might be
    console.log('\n4. Checking all leagues for user presence...');
    const allLeagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(25)]
    );
    
    console.log(`Total leagues in system: ${allLeagues.total}`);
    for (const league of allLeagues.documents) {
      // Check if user has a roster in this league
      const leagueRosters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [
          Query.equal('leagueId', league.$id),
          Query.equal('userId', user.$id)
        ]
      );
      
      if (leagueRosters.documents.length > 0) {
        console.log(`  ✅ User has roster in: ${league.name} (${league.$id})`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugUserData();
