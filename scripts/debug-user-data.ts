import { Client, Databases, Query } from 'node-appwrite';
import { APPWRITE_CONFIG } from '../lib/config/appwrite.config';
import { COLLECTIONS } from '../lib/appwrite';

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)
  .setKey(APPWRITE_CONFIG.apiKey);

const databases = new Databases(client);
const DATABASE_ID = APPWRITE_CONFIG.databaseId;

async function debugUserData() {
  const userEmail = 'kashpm2002@gmail.com';
  
  console.log('\n🔍 Debugging user data for:', userEmail);
  console.log('='.repeat(50));
  
  try {
    // 1. Check leagues where user is commissioner
    console.log('\n1. Checking leagues where user is commissioner...');
    const commissionerLeagues = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [Query.limit(100)]
    );
    
    const userCommissionerLeagues = commissionerLeagues.documents.filter((league: any) => {
      // Check both commissioner and commissionerId fields
      return league.commissioner?.includes('6730') || league.commissionerId?.includes('6730');
    });
    
    console.log(`Found ${userCommissionerLeagues.length} leagues where user is commissioner`);
    userCommissionerLeagues.forEach((league: any) => {
      console.log(`  - ${league.name} (ID: ${league.$id})`);
      console.log(`    Commissioner: ${league.commissioner}`);
      console.log(`    CommissionerId: ${league.commissionerId || 'N/A'}`);
      console.log(`    Status: ${league.status}`);
    });
    
    // 2. Check rosters
    console.log('\n2. Checking user rosters...');
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.limit(100)]
    );
    
    const userRosters = rosters.documents.filter((roster: any) => {
      return roster.userId?.includes('6730');
    });
    
    console.log(`Found ${userRosters.length} rosters for user`);
    userRosters.forEach((roster: any) => {
      console.log(`  - Team: ${roster.teamName} (ID: ${roster.$id})`);
      console.log(`    League ID: ${roster.leagueId}`);
      console.log(`    User ID: ${roster.userId}`);
      console.log(`    Record: ${roster.wins}-${roster.losses}`);
    });
    
    // 3. Check teams collection (legacy)
    console.log('\n3. Checking teams collection (legacy)...');
    try {
      const teams = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.limit(100)]
      );
      
      const userTeams = teams.documents.filter((team: any) => {
        return team.userId?.includes('6730') || team.ownerId?.includes('6730');
      });
      
      console.log(`Found ${userTeams.length} teams for user`);
      userTeams.forEach((team: any) => {
        console.log(`  - Team: ${team.name} (ID: ${team.$id})`);
        console.log(`    League ID: ${team.leagueId}`);
        console.log(`    User ID: ${team.userId || team.ownerId}`);
      });
    } catch (error) {
      console.log('Teams collection not accessible or doesn\'t exist');
    }
    
    // 4. Get the actual user ID
    console.log('\n4. Finding exact user ID...');
    const allUserIds = new Set<string>();
    
    userCommissionerLeagues.forEach((league: any) => {
      if (league.commissioner) allUserIds.add(league.commissioner);
      if (league.commissionerId) allUserIds.add(league.commissionerId);
    });
    
    userRosters.forEach((roster: any) => {
      if (roster.userId) allUserIds.add(roster.userId);
    });
    
    console.log('Unique user IDs found:');
    allUserIds.forEach(id => console.log(`  - ${id}`));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugUserData();
