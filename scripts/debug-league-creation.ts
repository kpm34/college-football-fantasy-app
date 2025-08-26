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

async function debugLeagueCreation() {
  console.log('🔍 DEBUGGING LEAGUE CREATION\n');
  
  // Test 1: Absolute minimum
  try {
    console.log('Test 1: Only name and season');
    const test1 = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      {
        name: 'Test Minimal',
        season: 2025
      }
    );
    console.log('✅ SUCCESS!');
    console.log('Created fields:', Object.keys(test1).filter(k => !k.startsWith('$')));
    console.log('Status value:', test1.status);
    await databases.deleteDocument(DATABASE_ID, 'leagues', test1.$id);
  } catch (e: any) {
    console.log('❌ FAILED:', e.message);
  }
  
  // Test 2: With status
  try {
    console.log('\nTest 2: With status = "open"');
    const test2 = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      {
        name: 'Test With Status',
        season: 2025,
        status: 'open'
      }
    );
    console.log('✅ SUCCESS!');
    console.log('Status value:', test2.status);
    await databases.deleteDocument(DATABASE_ID, 'leagues', test2.$id);
  } catch (e: any) {
    console.log('❌ FAILED:', e.message);
  }
  
  // Test 3: Full fields like in our test
  try {
    console.log('\nTest 3: Full fields from test script');
    const test3 = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      {
        name: 'Test Full Fields',
        season: 2025,
        maxTeams: 12,
        draftType: 'snake',
        gameMode: 'power4',
        currentTeams: 1,
        isPublic: true,
        pickTimeSeconds: 90,
        commissionerAuthUserId: '123test'
      }
    );
    console.log('✅ SUCCESS!');
    console.log('Created successfully with all fields');
    await databases.deleteDocument(DATABASE_ID, 'leagues', test3.$id);
  } catch (e: any) {
    console.log('❌ FAILED:', e.message);
  }
  
  // Test 4: With status included
  try {
    console.log('\nTest 4: Full fields WITH status');
    const test4 = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      ID.unique(),
      {
        name: 'Test Full With Status',
        season: 2025,
        maxTeams: 12,
        draftType: 'snake',
        gameMode: 'power4',
        status: 'open',
        currentTeams: 1,
        isPublic: true,
        pickTimeSeconds: 90,
        commissionerAuthUserId: '123test'
      }
    );
    console.log('✅ SUCCESS!');
    console.log('Created successfully with status included');
    await databases.deleteDocument(DATABASE_ID, 'leagues', test4.$id);
  } catch (e: any) {
    console.log('❌ FAILED:', e.message);
  }
}

debugLeagueCreation();
