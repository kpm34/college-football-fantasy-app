import { Client, Users, Databases, Query, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const users = new Users(client);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

async function main() {
  try {
    // Get all auth users
    const authUsers = await users.list([Query.limit(100)]);
    console.log('Auth users count:', authUsers.total);
    
    // Get existing clients
    const existingClients = await databases.listDocuments(dbId, 'clients', [Query.limit(100)]);
    console.log('Existing clients count:', existingClients.total);
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const user of authUsers.users) {
      try {
        // Check if client already exists
        const existing = await databases.listDocuments(dbId, 'clients', [
          Query.equal('auth_user_id', user.$id),
          Query.limit(1)
        ]);
        
        const clientData = {
          auth_user_id: user.$id,
          display_name: user.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar_url: user.prefs?.avatar || '',
          created_at: user.registration,
          last_login: user.accessedAt || user.registration
        };
        
        if (existing.total > 0) {
          // Update existing client
          await databases.updateDocument(
            dbId,
            'clients',
            existing.documents[0].$id,
            {
              display_name: clientData.display_name,
              email: clientData.email,
              avatar_url: clientData.avatar_url,
              last_login: clientData.last_login
            }
          );
          updated++;
          console.log('Updated client for:', user.email || user.$id);
        } else {
          // Create new client record
          await databases.createDocument(
            dbId,
            'clients',
            ID.unique(),
            clientData
          );
          created++;
          console.log('Created client for:', user.email || user.$id);
        }
      } catch (e: any) {
        console.error('Error syncing user', user.email || user.$id, ':', e.message);
        skipped++;
      }
    }
    
    console.log('\nSync complete:');
    console.log('  Created:', created);
    console.log('  Updated:', updated);
    console.log('  Skipped:', skipped);
    console.log('  Total auth users:', authUsers.total);
    console.log('  Total clients now:', existingClients.total + created);
    
  } catch(e: any) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
