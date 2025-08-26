#!/usr/bin/env tsx
import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function addCommissionerAttribute() {
  try {
    console.log('Adding commissionerAuthUserId attribute to leagues collection...\n');
    
    // Create the attribute
    const attribute = await databases.createStringAttribute(
      DATABASE_ID,
      'leagues',
      'commissionerAuthUserId',
      64,  // size
      false, // required
      null   // default value
    );
    
    console.log('✅ Successfully created commissionerAuthUserId attribute');
    console.log('Attribute details:', attribute);
    
    // Wait a bit for the attribute to be ready
    console.log('\nWaiting for attribute to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now update the leagues to set Kashyap as commissioner
    const yourAuthUserId = '689728660623e03830fc'; // Kashyap Maheshwari
    
    const leagues = await databases.listDocuments(DATABASE_ID, 'leagues');
    
    console.log('\nUpdating leagues with commissioner...');
    for (const league of leagues.documents) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          'leagues',
          league.$id,
          {
            commissionerAuthUserId: yourAuthUserId
          }
        );
        console.log(`✅ Updated ${league.name} - set commissioner to Kashyap`);
      } catch (error: any) {
        console.error(`❌ Failed to update ${league.name}:`, error.message);
      }
    }
    
  } catch (error: any) {
    if (error.code === 409) {
      console.log('ℹ️  Attribute already exists, updating leagues only...');
      
      // Try to update leagues anyway
      const yourAuthUserId = '689728660623e03830fc';
      const leagues = await databases.listDocuments(DATABASE_ID, 'leagues');
      
      for (const league of leagues.documents) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            'leagues',
            league.$id,
            {
              commissionerAuthUserId: yourAuthUserId
            }
          );
          console.log(`✅ Updated ${league.name}`);
        } catch (updateError: any) {
          console.error(`❌ Failed to update ${league.name}:`, updateError.message);
        }
      }
    } else {
      console.error('Error:', error);
    }
  }
}

addCommissionerAttribute();
