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

async function backfillJawnLeagueDraftOrder() {
  console.log('🏈 BACKFILLING JAWN LEAGUE DRAFT ORDER\n');
  console.log('=' .repeat(60));
  
  try {
    // Find Jawn League
    const leagues = await databases.listDocuments(DATABASE_ID, 'leagues', [
      Query.equal('name', 'Jawn League'),
      Query.limit(1)
    ]);
    
    if (leagues.documents.length === 0) {
      console.error('❌ Jawn League not found!');
      return;
    }
    
    const league = leagues.documents[0];
    console.log('✅ Found Jawn League:', league.$id);
    
    // Get all league members to map names to IDs
    const memberships = await databases.listDocuments(
      DATABASE_ID,
      'league_memberships',
      [Query.equal('leagueId', league.$id), Query.limit(100)]
    );
    
    console.log('\n📋 Current Members:');
    memberships.documents.forEach((m: any) => {
      console.log(`  - ${m.displayName} (${m.authUserId})`);
    });
    
    // Based on your screenshot, the draft order is:
    const draftOrderNames = [
      "James Barrickman's Team",
      "Jesse Louzy's Team",
      "Russell Siess's Team",
      "Jamison O's Team",
      "cwaltcrad's Team",
      "Jake Kittle's Team",
      "Jawn League Commissioner", // This is you (Kashyap)
      "Eva Braun's Team",
      "Team 2",
      "tjdanny5's Team",
      "Yash Maheshwari's Team",
      "Cameron Sarber's Team"
    ];
    
    // Map names to user IDs (we'll need to match based on display names)
    const draftOrder: string[] = [];
    
    for (const name of draftOrderNames) {
      // Try to find matching member
      const member = memberships.documents.find((m: any) => {
        const displayName = m.displayName || '';
        // Handle special cases
        if (name === "Jawn League Commissioner" && displayName.includes("Kashyap")) {
          return true;
        }
        // Check if the display name is contained in the team name
        return name.toLowerCase().includes(displayName.toLowerCase().split(' ')[0]) ||
               displayName.toLowerCase().includes(name.split("'")[0].toLowerCase());
      });
      
      if (member) {
        draftOrder.push(member.authUserId);
        console.log(`  ✓ Matched "${name}" to ${member.displayName} (${member.authUserId})`);
      } else {
        console.log(`  ⚠️  Could not match "${name}"`);
        // For unmatched, we might need to use placeholder or find by other means
      }
    }
    
    // If we don't have all 12, fill with available members
    if (draftOrder.length < 12) {
      console.log('\n⚠️  Not all teams matched. Using available members to fill...');
      memberships.documents.forEach((m: any) => {
        if (!draftOrder.includes(m.authUserId) && draftOrder.length < 12) {
          draftOrder.push(m.authUserId);
        }
      });
    }
    
    console.log('\n📝 Final Draft Order:');
    draftOrder.forEach((id, idx) => {
      const member = memberships.documents.find((m: any) => m.authUserId === id);
      console.log(`  ${idx + 1}. ${member?.displayName || id}`);
    });
    
    // Update league with draft order
    await databases.updateDocument(
      DATABASE_ID,
      'leagues',
      league.$id,
      {
        draftOrder: JSON.stringify(draftOrder),
        currentTeams: draftOrder.length,
        status: draftOrder.length >= 12 ? 'full' : 'open'
      }
    );
    console.log('\n✅ Updated league draft order');
    
    // Find and update draft document
    const drafts = await databases.listDocuments(DATABASE_ID, 'drafts', [
      Query.equal('leagueId', league.$id),
      Query.limit(1)
    ]);
    
    if (drafts.documents.length > 0) {
      const draft = drafts.documents[0];
      const orderJson = {
        draftOrder: draftOrder,
        totalTeams: draftOrder.length,
        pickTimeSeconds: league.pickTimeSeconds || 90,
        draftType: league.draftType || 'snake'
      };
      
      await databases.updateDocument(
        DATABASE_ID,
        'drafts',
        draft.$id,
        {
          orderJson: JSON.stringify(orderJson),
          maxTeams: draftOrder.length
        }
      );
      console.log('✅ Updated draft document');
    }
    
    // Set draft time to 8:40 PM tonight
    const draftTime = new Date();
    draftTime.setHours(20, 40, 0, 0); // 8:40 PM
    
    await databases.updateDocument(
      DATABASE_ID,
      'leagues',
      league.$id,
      {
        draftDate: draftTime.toISOString()
      }
    );
    
    if (drafts.documents.length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        'drafts',
        drafts.documents[0].$id,
        {
          startTime: draftTime.toISOString(),
          status: 'scheduled'
        }
      );
    }
    
    console.log(`\n⏰ Draft time set to: ${draftTime.toLocaleString()}`);
    console.log('\n🎉 JAWN LEAGUE DRAFT ORDER BACKFILLED!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

backfillJawnLeagueDraftOrder();
