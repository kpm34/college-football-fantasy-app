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
    console.log('Deleting existing league_memberships collection...');
    await databases.deleteCollection(dbId, 'league_memberships');
    console.log('Deleted successfully.');
  } catch (e: any) {
    if (e.code === 404) {
      console.log('Collection does not exist, proceeding to create.');
    } else {
      console.error('Error deleting collection:', e.message);
    }
  }

  // Create the collection with correct schema
  console.log('Creating league_memberships collection with correct schema...');
  await databases.createCollection(dbId, 'league_memberships', 'league_memberships');
  
  // Add attributes with snake_case
  const attrs = [
    { name: 'league_id', type: 'string', size: 64, required: true },
    { name: 'client_id', type: 'string', size: 64, required: true },
    { name: 'role', type: 'string', size: 16, required: true },
    { name: 'status', type: 'string', size: 16, required: true },
    { name: 'joined_at', type: 'datetime', required: false }
  ];

  for (const attr of attrs) {
    console.log(`Creating attribute: ${attr.name}`);
    if (attr.type === 'string') {
      await databases.createStringAttribute(
        dbId, 
        'league_memberships', 
        attr.name, 
        attr.size!, 
        attr.required,
        undefined,
        false
      );
    } else if (attr.type === 'datetime') {
      await databases.createDatetimeAttribute(
        dbId,
        'league_memberships',
        attr.name,
        attr.required,
        undefined,
        false
      );
    }
    // Wait a bit between attributes to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('league_memberships collection created successfully with correct schema!');
}

main().catch(console.error);
