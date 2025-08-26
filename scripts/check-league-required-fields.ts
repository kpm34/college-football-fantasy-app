#!/usr/bin/env tsx
import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function checkRequiredFields() {
  console.log('Checking what fields are actually required for leagues...\n');
  
  // Try creating a league with minimal fields
  try {
    console.log('Test 1: Minimal fields (name and season only)');
    const test1 = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      {
        name: 'Test League Minimal',
        season: 2025
      }
    );
    console.log('✅ Success with just name and season!');
    await databases.deleteDocument(DATABASE_ID, 'leagues', test1.$id);
  } catch (e: any) {
    console.log('❌ Failed:', e.message);
  }
  
  // Try with more fields
  try {
    console.log('\nTest 2: With required fields from schema');
    const test2 = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      {
        name: 'Test League Full',
        season: 2025,
        maxTeams: 12,
        draftType: 'snake',
        gameMode: 'power4'
      }
    );
    console.log('✅ Success with schema required fields!');
    console.log('Created league has these fields:', Object.keys(test2).filter(k => !k.startsWith('$')));
    console.log('Status value:', test2.status);
    await databases.deleteDocument(DATABASE_ID, 'leagues', test2.$id);
  } catch (e: any) {
    console.log('❌ Failed:', e.message);
  }
  
  // Check existing league
  const existing = await databases.listDocuments(DATABASE_ID, 'leagues', []);
  if (existing.documents.length > 0) {
    console.log('\n📋 Existing league example:');
    const league = existing.documents[0];
    console.log('Fields:', Object.keys(league).filter(k => !k.startsWith('$')));
    console.log('Status:', league.status);
  }
}

checkRequiredFields();
