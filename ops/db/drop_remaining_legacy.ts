import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

const toDrop = [
  'user_teams', 
  'teams', 
  'mock_drafts', 
  'mock_draft_picks', 
  'mock_draft_participants', 
  'player_projections', 
  'projection_runs', 
  'projection_run_metrics'
];

(async () => {
  console.log('Dropping remaining legacy collections...\n');
  
  for (const collId of toDrop) {
    try {
      await databases.deleteCollection(dbId, collId);
      console.log(`✅ Dropped: ${collId}`);
    } catch (e: any) {
      if (e.code === 404) {
        console.log(`⚠️  Already gone: ${collId}`);
      } else {
        console.log(`❌ Error dropping ${collId}: ${e.message}`);
      }
    }
  }
  
  console.log('\nDone!');
})().catch(console.error);
