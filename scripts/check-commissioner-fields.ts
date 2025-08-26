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

async function checkLeagues() {
  try {
    // Get leagues
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.limit(10)]
    );
    
    console.log('Leagues found:', leagues.documents.length);
    for (const league of leagues.documents) {
      console.log('\nLeague:', league.name);
      console.log('  ID:', league.$id);
      console.log('  commissionerAuthUserId:', league.commissionerAuthUserId);
      console.log('  commissionerId:', league.commissionerId);
      console.log('  commissioner:', league.commissioner);
      console.log('  All commissioner fields:', Object.keys(league).filter(k => k.toLowerCase().includes('commission')));
    }
    
    // Get your user info from clients
    const clients = await databases.listDocuments(
      DATABASE_ID,
      'clients',
      [Query.limit(10)]
    );
    
    console.log('\n\nClients found:', clients.documents.length);
    for (const client of clients.documents) {
      console.log('\nClient:', client.displayName || client.email);
      console.log('  ID:', client.$id);
      console.log('  authUserId:', client.authUserId);
      console.log('  email:', client.email);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLeagues();
