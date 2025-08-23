import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

async function main() {
  try {
    // Try to delete the existing collection
    console.log('Deleting existing draft_events collection...');
    await databases.deleteCollection(dbId, 'draft_events');
    console.log('Deleted successfully.');
  } catch (e: any) {
    if (e.code === 404) {
      console.log('Collection does not exist, proceeding to create.');
    } else {
      console.error('Error deleting collection:', e.message);
      throw e;
    }
  }

  // Create the collection with correct schema
  console.log('Creating draft_events collection with correct schema...');
  await databases.createCollection(dbId, 'draft_events', 'draft_events');
  
  // Add attributes
  const attrs = [
    { name: 'draft_id', type: 'string', size: 64, required: true },
    { name: 'type', type: 'string', size: 24, required: true },
    { name: 'round', type: 'integer', required: false },
    { name: 'overall', type: 'integer', required: false },
    { name: 'fantasy_team_id', type: 'string', size: 64, required: false },
    { name: 'player_id', type: 'string', size: 64, required: false },
    { name: 'ts', type: 'datetime', required: false },
    { name: 'payload_json', type: 'string', size: 8192, required: false }
  ];

  for (const attr of attrs) {
    console.log(`Creating attribute: ${attr.name}`);
    if (attr.type === 'string') {
      await databases.createStringAttribute(
        dbId, 
        'draft_events', 
        attr.name, 
        attr.size!, 
        attr.required,
        undefined,
        false
      );
    } else if (attr.type === 'integer') {
      await databases.createIntegerAttribute(
        dbId,
        'draft_events',
        attr.name,
        attr.required,
        undefined,
        undefined,
        undefined,
        false
      );
    } else if (attr.type === 'datetime') {
      await databases.createDatetimeAttribute(
        dbId,
        'draft_events',
        attr.name,
        attr.required,
        undefined,
        false
      );
    }
    // Wait a bit between attributes to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('draft_events collection created successfully with correct schema!');
}

main().catch(console.error);
