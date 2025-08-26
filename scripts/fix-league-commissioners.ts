#!/usr/bin/env tsx
import { Client, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function fixCommissioners() {
  try {
    // Your authUserId from the clients collection
    const yourAuthUserId = '689728660623e03830fc'; // Kashyap Maheshwari
    
    // Get leagues that need fixing
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.limit(10)]
    );
    
    console.log('Found', leagues.documents.length, 'leagues to check\n');
    
    for (const league of leagues.documents) {
      console.log('League:', league.name);
      console.log('  Current commissionerAuthUserId:', league.commissionerAuthUserId);
      
      // Check if this league has no commissioner set
      if (!league.commissionerAuthUserId && !league.commissioner) {
        console.log('  ⚠️  No commissioner set, fixing...');
        
        try {
          // Update the league to set you as commissioner
          await databases.updateDocument(
            DATABASE_ID,
            'leagues',
            league.$id,
            {
              commissionerAuthUserId: yourAuthUserId
            }
          );
          console.log('  ✅ Set commissioner to Kashyap Maheshwari');
        } catch (error: any) {
          console.error('  ❌ Error updating league:', error.message);
        }
      } else {
        console.log('  ✓ Commissioner already set');
      }
      console.log();
    }
    
    // Verify the changes
    console.log('\n=== Verification ===\n');
    const updatedLeagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.limit(10)]
    );
    
    for (const league of updatedLeagues.documents) {
      console.log('League:', league.name);
      console.log('  commissionerAuthUserId:', league.commissionerAuthUserId);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCommissioners();
