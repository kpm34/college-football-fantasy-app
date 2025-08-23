import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  const memberships = await databases.listDocuments(dbId, 'league_memberships', [Query.limit(25)]);
  console.log('league_memberships count:', memberships.total);
  
  if (memberships.documents.length > 0) {
    console.log('\nSample memberships:');
    memberships.documents.slice(0, 3).forEach(m => {
      console.log(`  League: ${m.league_id}, Client: ${m.client_id}, Role: ${m.role}`);
    });
  }
  
  // Check leagues
  const leagues = await databases.listDocuments(dbId, 'leagues', [Query.limit(10)]);
  console.log('\nLeagues count:', leagues.total);
  leagues.documents.forEach(l => {
    console.log(`  ${l.name} (${l.$id})`);
  });
})();
