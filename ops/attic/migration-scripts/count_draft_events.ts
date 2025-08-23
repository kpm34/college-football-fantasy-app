import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);

(async () => {
  const res = await databases.listDocuments(
    process.env.APPWRITE_DATABASE_ID!, 
    'draft_events', 
    [Query.limit(1)]
  );
  console.log('draft_events count:', res.total);
})();
