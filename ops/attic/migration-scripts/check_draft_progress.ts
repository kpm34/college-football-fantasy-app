import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID!;

(async () => {
  console.log('=== Checking Mock Draft Progress ===\n');
  
  // Check draft_events for new picks
  const draftEvents = await databases.listDocuments(dbId, 'draft_events', [
    Query.orderDesc('$createdAt'),
    Query.limit(50)
  ]);
  
  console.log('Total draft_events:', draftEvents.total);
  
  // Group by draft and show summary
  const draftGroups = new Map();
  
  draftEvents.documents.forEach(event => {
    const draftId = event.draft_id || 'no-draft-id';
    if (!draftGroups.has(draftId)) {
      draftGroups.set(draftId, []);
    }
    draftGroups.get(draftId).push(event);
  });
  
  console.log('\nDraft Events by Draft ID:');
  for (const [draftId, events] of draftGroups) {
    console.log(`\nDraft: ${draftId}`);
    console.log(`  Total picks: ${events.length}`);
    
    // Get round distribution
    const rounds = new Map();
    events.forEach(e => {
      const round = e.round || 0;
      rounds.set(round, (rounds.get(round) || 0) + 1);
    });
    
    console.log('  Rounds:', Array.from(rounds.entries()).sort((a, b) => a[0] - b[0]).map(([r, c]) => `R${r}: ${c} picks`).join(', '));
    
    // Show recent picks
    console.log('  Recent picks:');
    events.slice(0, 5).forEach(e => {
      const timestamp = new Date(e.ts || e.$createdAt).toLocaleString();
      console.log(`    - R${e.round || '?'} P${e.overall || '?'}: Player ${e.player_id || 'unknown'} to Team ${e.fantasy_team_id || 'unknown'} at ${timestamp}`);
    });
    
    if (events.length > 5) {
      console.log(`    ... and ${events.length - 5} more picks`);
    }
  }
  
  // Also check mock_draft_picks to see if they're still being created
  console.log('\n=== Legacy Collections Check ===');
  
  const mockPicks = await databases.listDocuments(dbId, 'mock_draft_picks', [
    Query.orderDesc('$createdAt'),
    Query.limit(30)
  ]);
  
  console.log(`\nmock_draft_picks: ${mockPicks.total} total`);
  if (mockPicks.documents.length > 0) {
    const latest = mockPicks.documents[0];
    const oldest = mockPicks.documents[mockPicks.documents.length - 1];
    console.log(`  Latest: ${latest.$createdAt}`);
    console.log(`  Oldest (in this batch): ${oldest.$createdAt}`);
    
    // Check if any were created in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentPicks = mockPicks.documents.filter(p => new Date(p.$createdAt) > oneHourAgo);
    if (recentPicks.length > 0) {
      console.log(`  ⚠️  ${recentPicks.length} picks created in last hour - still using old collection!`);
    } else {
      console.log('  ✅ No recent picks - old collection not being used');
    }
  }
  
  // Check mock_drafts collection
  const mockDrafts = await databases.listDocuments(dbId, 'mock_drafts', [
    Query.orderDesc('$createdAt'),
    Query.limit(5)
  ]);
  
  console.log(`\nmock_drafts: ${mockDrafts.total} total`);
  if (mockDrafts.documents.length > 0) {
    console.log('  Recent drafts:');
    mockDrafts.documents.forEach(d => {
      console.log(`    - ${d.$id}: ${d.draftName || 'Unnamed'} (${d.status}) created ${d.$createdAt}`);
    });
  }
  
  // Check new drafts collection
  const drafts = await databases.listDocuments(dbId, 'drafts', [
    Query.orderDesc('$createdAt'),
    Query.limit(5)
  ]);
  
  console.log(`\ndrafts (new collection): ${drafts.total} total`);
  if (drafts.documents.length > 0) {
    console.log('  Recent drafts:');
    drafts.documents.forEach(d => {
      console.log(`    - ${d.$id}: Status=${d.status}, Type=${d.type}, Created=${d.$createdAt}`);
    });
  } else {
    console.log('  ⚠️  No drafts in new collection - mock drafts not being migrated');
  }
})().catch(console.error);
