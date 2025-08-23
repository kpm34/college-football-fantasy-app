import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  try {
    const userTeams = await databases.listDocuments(dbId, 'user_teams', [Query.limit(5)]);
    console.log('user_teams count:', userTeams.total);
    if (userTeams.documents[0]) {
      console.log('Sample user_team:', JSON.stringify(userTeams.documents[0], null, 2));
    }
  } catch(e: any) {
    console.error('user_teams error:', e.message);
  }
  
  try {
    const fantasyTeams = await databases.listDocuments(dbId, 'fantasy_teams', [Query.limit(5)]);
    console.log('\nfantasy_teams count:', fantasyTeams.total);
    if (fantasyTeams.documents[0]) {
      console.log('Sample fantasy_team:', JSON.stringify(fantasyTeams.documents[0], null, 2));
    }
  } catch(e: any) {
    console.error('fantasy_teams error:', e.message);
  }
})();
