import { Client, Databases, Query, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

async function main() {
  // Get fantasy teams
  const teams = await databases.listDocuments(dbId, 'fantasy_teams', [Query.limit(100)]);
  console.log('Fantasy teams:', teams.total);
  
  const seen = new Set<string>();
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const team of teams.documents) {
    const league_id = team.league_id;
    const client_id = team.owner_client_id;
    
    console.log(`\nTeam: ${team.name}`);
    console.log(`  league_id: ${league_id}`);
    console.log(`  owner_client_id: ${client_id}`);
    
    if (!league_id || !client_id) {
      console.log('  -> Skipped: missing league_id or client_id');
      skipped++;
      continue;
    }
    
    // Skip bot teams
    if (client_id.startsWith('BOT-')) {
      console.log('  -> Skipped: bot team');
      skipped++;
      continue;
    }
    
    const key = `${league_id}::${client_id}`;
    if (seen.has(key)) {
      console.log('  -> Skipped: duplicate');
      skipped++;
      continue;
    }
    seen.add(key);
    
    try {
      // Check if membership already exists
      const existing = await databases.listDocuments(dbId, 'league_memberships', [
        Query.equal('league_id', league_id),
        Query.equal('client_id', client_id),
        Query.limit(1)
      ]);
      
      if (existing.total > 0) {
        console.log('  -> Skipped: membership already exists');
        skipped++;
        continue;
      }
      
      // Create membership
      const membership = await databases.createDocument(
        dbId,
        'league_memberships',
        ID.unique(),
        {
          league_id,
          client_id,
          role: 'member',
          status: 'active',
          joined_at: team.$createdAt || new Date().toISOString()
        }
      );
      console.log('  -> Created membership:', membership.$id);
      created++;
    } catch (e: any) {
      console.log('  -> Error:', e.message);
      errors++;
    }
  }
  
  console.log('\nSummary:');
  console.log('  Created:', created);
  console.log('  Skipped:', skipped);
  console.log('  Errors:', errors);
}

main().catch(console.error);
