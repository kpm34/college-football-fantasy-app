import { serverDatabases as databases, DATABASE_ID } from '../lib/appwrite-server';

async function main() {
  try {
    const res = await databases.listCollections(DATABASE_ID);
    const rows = res.collections?.map((c: any) => ({ id: c.$id, name: c.name })) || res.documents?.map((c: any) => ({ id: c.$id, name: c.name })) || [];
    console.log(JSON.stringify({ databaseId: DATABASE_ID, count: rows.length, collections: rows }, null, 2));
  } catch (err: any) {
    console.error('Failed to list collections:', err?.message || err);
    process.exit(1);
  }
}

main();


