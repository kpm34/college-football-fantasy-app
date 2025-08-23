import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  try {
    const mockDrafts = await databases.listDocuments(dbId, 'mock_drafts', [Query.limit(5)]);
    console.log('mock_drafts count:', mockDrafts.total);
    
    if (mockDrafts.documents.length > 0) {
      console.log('\nSample mock_draft:');
      console.log(JSON.stringify(mockDrafts.documents[0], null, 2));
    }
    
    // Check drafts collection too
    const drafts = await databases.listDocuments(dbId, 'drafts', [Query.limit(5)]);
    console.log('\ndrafts count:', drafts.total);
    
    if (drafts.documents.length > 0) {
      console.log('\nSample draft:');
      console.log(JSON.stringify(drafts.documents[0], null, 2));
    }
  } catch(e: any) {
    console.error('Error:', e.message);
  }
})();
