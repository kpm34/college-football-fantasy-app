import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  try {
    // Check draft_picks structure
    const picks = await databases.listDocuments(dbId, 'draft_picks', [Query.limit(1)]);
    console.log('draft_picks sample:');
    if (picks.documents[0]) {
      console.log(JSON.stringify(picks.documents[0], null, 2));
    } else {
      console.log('  empty collection');
    }
    
    // Check mock_draft_picks structure  
    const mockPicks = await databases.listDocuments(dbId, 'mock_draft_picks', [Query.limit(1)]);
    console.log('\nmock_draft_picks sample:');
    if (mockPicks.documents[0]) {
      console.log(JSON.stringify(mockPicks.documents[0], null, 2));
    } else {
      console.log('  empty collection');
    }

    // Check if draft_events exists and its structure
    try {
      const draftEvents = await databases.listDocuments(dbId, 'draft_events', [Query.limit(1)]);
      console.log('\ndraft_events sample:');
      if (draftEvents.documents[0]) {
        console.log(JSON.stringify(draftEvents.documents[0], null, 2));
      } else {
        console.log('  empty collection');
      }
    } catch (e: any) {
      if (e.code === 404) {
        console.log('\ndraft_events collection does not exist yet');
      } else {
        throw e;
      }
    }
  } catch(e) {
    console.error('Error:', e);
  }
})();
