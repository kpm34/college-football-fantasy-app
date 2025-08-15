// Minimal Node script to list Appwrite collections using API key (no TS tooling required)
const { Client, Databases } = require('node-appwrite');

async function main() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

  if (!apiKey) {
    console.error('Missing APPWRITE_API_KEY in environment');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  try {
    const res = await databases.listCollections(databaseId);
    const rows = (res.collections || res.documents || []).map((c) => ({ id: c.$id, name: c.name }));
    console.log(JSON.stringify({ endpoint, projectId, databaseId, count: rows.length, collections: rows }, null, 2));
  } catch (err) {
    console.error('Failed to list collections:', err?.message || err);
    process.exit(1);
  }
}

main();


