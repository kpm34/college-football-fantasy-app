import { Client, Databases, ID } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function syncSchema() {
  console.log('Syncing Appwrite schema...');
  
  const schemaPath = path.join(process.cwd(), 'appwrite-schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  
  for (const collection of schema.collections) {
    console.log(`Syncing collection: ${collection.name}`);
    try {
      await databases.createCollection(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        collection.$id || ID.unique(),
        collection.name
      );
      console.log(`✓ Created collection: ${collection.name}`);
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`✓ Collection already exists: ${collection.name}`);
      } else {
        console.error(`✗ Error creating collection ${collection.name}:`, error);
      }
    }
  }
  
  console.log('Schema sync complete!');
}

syncSchema().catch(console.error);
