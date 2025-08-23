import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  try {
    const collection = await databases.getCollection(dbId, 'draft_events');
    console.log('draft_events attributes:');
    collection.attributes.forEach((attr: any) => {
      console.log('  -', attr.key, ':', attr.type, attr.required ? '(required)' : '(optional)');
    });
  } catch(e: any) {
    if (e.code === 404) {
      console.log('draft_events collection does not exist');
      console.log('Creating it now...');
      
      // Run create collections script
      const { execSync } = require('child_process');
      try {
        execSync('npm run db:create', { stdio: 'inherit' });
      } catch (createError) {
        console.error('Failed to create collections:', createError);
      }
    } else {
      console.error('Error:', e.message);
    }
  }
})();
