import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  const newCollections = [
    'clients', 
    'fantasy_teams', 
    'schools', 
    'draft_events', 
    'league_memberships', 
    'projections', 
    'model_runs', 
    'roster_slots'
  ];
  
  console.log('Checking for new collections:\n');
  for (const collId of newCollections) {
    try {
      const coll = await databases.getCollection(dbId, collId);
      console.log(`✅ ${collId} - exists with ${coll.attributes.length} attributes`);
    } catch (e: any) {
      console.log(`❌ ${collId} - NOT FOUND`);
    }
  }
  
  // Check old collections that should be gone
  const oldCollections = [
    'users',
    'user_teams', 
    'teams',
    'mock_drafts',
    'mock_draft_picks',
    'mock_draft_participants',
    'player_projections',
    'projection_runs'
  ];
  
  console.log('\n\nChecking old collections (should be gone):');
  for (const collId of oldCollections) {
    try {
      const coll = await databases.getCollection(dbId, collId);
      console.log(`⚠️  ${collId} - STILL EXISTS (should be dropped)`);
    } catch (e: any) {
      console.log(`✅ ${collId} - properly removed`);
    }
  }
})().catch(console.error);
