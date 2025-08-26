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

async function checkOrderFields() {
  try {
    // Check test xl league
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.equal('name', 'test xl'), Query.limit(1)]
    );
    
    if (leagues.documents.length === 0) {
      console.log('test xl league not found');
      return;
    }
    
    const league = leagues.documents[0];
    console.log('=== LEAGUE - test xl ===');
    console.log('  draftOrder field:', league.draftOrder);
    console.log('  Type:', typeof league.draftOrder);
    if (league.draftOrder) {
      try {
        const parsed = JSON.parse(league.draftOrder);
        console.log('  Parsed value:', parsed);
      } catch {
        console.log('  Raw value:', league.draftOrder);
      }
    }
    
    // Check draft document
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', [Query.limit(100)]);
    const leagueDrafts = drafts.documents.filter((d: any) => 
      d.leagueId === league.$id || d.league_id === league.$id
    );
    
    console.log('\n=== DRAFT Documents ===');
    if (leagueDrafts.length > 0) {
      for (const draft of leagueDrafts) {
        console.log('\nDraft ID:', draft.$id);
        console.log('  draftOrder field:', draft.draftOrder);
        console.log('  Type:', typeof draft.draftOrder);
        
        console.log('\n  orderJson field:');
        if (draft.orderJson) {
          try {
            const orderJson = JSON.parse(draft.orderJson);
            console.log('    Full content:', JSON.stringify(orderJson, null, 2));
            if (orderJson.draftOrder) {
              console.log('    Has draftOrder inside orderJson:', orderJson.draftOrder);
            }
          } catch (e) {
            console.log('    Failed to parse orderJson:', e);
          }
        } else {
          console.log('    orderJson is null/undefined');
        }
      }
    } else {
      console.log('No draft documents found for test xl');
    }
    
    console.log('\n=== ANALYSIS ===');
    console.log('1. leagues.draftOrder - stores the draft order at league level');
    console.log('2. drafts.draftOrder - native field in draft document (currently null)');
    console.log('3. drafts.orderJson - JSON string that contains various order-related data including draftOrder');
    console.log('\nRECOMMENDATION: We should consolidate to use drafts.draftOrder as a proper JSON field');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrderFields();
