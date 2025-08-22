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

async function checkUserRoster() {
  console.log('\n🎯 Checking user roster');
  console.log('='.repeat(50));
  
  try {
    // Get current user
    const user = await account.get();
    console.log('Current user ID:', user.$id);
    
    const leagueId = '6894db4a0001ad84e4b0';
    
    // Check rosters in the league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', leagueId)]
    );
    
    console.log(`\nFound ${rosters.documents.length} rosters in Jawn League:`);
    rosters.documents.forEach((roster: any) => {
      console.log(`  - ${roster.teamName}`);
      console.log(`    User ID: ${roster.userId}`);
      console.log(`    Is current user: ${roster.userId === user.$id ? '✅ YES' : '❌ NO'}`);
    });
    
    // Check if any roster needs to be assigned to current user
    const commissionerRoster = rosters.documents.find((r: any) => 
      r.teamName.includes('Commissioner')
    );
    
    if (commissionerRoster && commissionerRoster.userId !== user.$id) {
      console.log('\n⚠️  Commissioner roster found but assigned to different user');
      console.log('Current assignment:', commissionerRoster.userId);
      console.log('Should be:', user.$id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserRoster();
