import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

async function main() {
  try {
    // Get all fantasy teams
    const fantasyTeams = await databases.listDocuments(dbId, 'fantasy_teams', [Query.limit(100)]);
    console.log('Fantasy teams count:', fantasyTeams.total);
    
    // Get all clients
    const clients = await databases.listDocuments(dbId, 'clients', [Query.limit(100)]);
    console.log('Clients count:', clients.total);
    
    // Create auth_user_id to client_id mapping
    const authToClientMap = new Map();
    for (const client of clients.documents) {
      authToClientMap.set(client.auth_user_id, client.$id);
    }
    
    let updated = 0;
    let skipped = 0;
    
    for (const team of fantasyTeams.documents) {
      // The owner_client_id currently contains the auth user ID (from userId field)
      const currentOwnerId = team.owner_client_id;
      const clientId = authToClientMap.get(currentOwnerId);
      
      if (clientId && clientId !== currentOwnerId) {
        // Update to use the actual client document ID
        await databases.updateDocument(
          dbId,
          'fantasy_teams',
          team.$id,
          {
            owner_client_id: clientId
          }
        );
        updated++;
        console.log(`Updated team "${team.name}" owner from ${currentOwnerId} to ${clientId}`);
      } else if (!clientId) {
        console.warn(`No client found for auth user ${currentOwnerId} (team: ${team.name})`);
        skipped++;
      } else {
        skipped++;
      }
    }
    
    console.log('\nFantasy teams owner fix complete:');
    console.log('  Updated:', updated);
    console.log('  Skipped:', skipped);
    
  } catch(e: any) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
