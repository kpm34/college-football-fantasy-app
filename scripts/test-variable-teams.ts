// scripts/test-variable-teams.ts
// Quick test script to verify system works with various team counts
import 'cross-fetch/polyfill';

const BASE_URL = 'http://localhost:3004';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function testTeamCount(numTeams: number) {
  console.log(`\n🧪 Testing ${numTeams} teams...`);
  
  try {
    // 1. Create draft
    const draft = await api<any>('/api/mock-draft/create', {
      method: 'POST',
      body: JSON.stringify({
        draftName: `Test ${numTeams} Teams`,
        rounds: 5,
        timerPerPickSec: 1,
        numTeams,
        participants: Array.from({ length: numTeams }, (_, i) => ({
          slot: i + 1,
          userType: 'human',
          displayName: `Team ${i + 1}`
        }))
      })
    });
    
    const draftId = draft.draftId;
    console.log(`   ✅ Created draft: ${draftId}`);
    
    // 2. Join some users
    for (let i = 1; i <= Math.min(3, numTeams); i++) {
      await api('/api/mock-draft/join', {
        method: 'POST',
        body: JSON.stringify({
          draftId,
          userId: `test-user-${i}`,
          displayName: `Test User ${i}`
        })
      });
    }
    console.log(`   ✅ Joined ${Math.min(3, numTeams)} users`);
    
    // 3. Check turn functionality
    await api('/api/mock-draft/start', {
      method: 'POST',
      body: JSON.stringify({ draftId, mode: 'human' })
    });
    
    const turn = await api<any>(`/api/mock-draft/turn/${draftId}`);
    console.log(`   ✅ Turn system working: Round ${turn.turn.round}, Pick ${turn.turn.overall}, Team ${turn.turn.slot}`);
    
    // 4. Check results
    const results = await api<any>(`/api/mock-draft/results/${draftId}`);
    console.log(`   ✅ Results: ${results.participants.length} participants, ${results.picks.length} picks`);
    console.log(`   ✅ Draft board can display ${numTeams} teams × ${results.draft.rounds} rounds = ${numTeams * results.draft.rounds} slots`);
    
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`);
  }
}

(async () => {
  console.log('🚀 Testing variable team counts...');
  
  const teamCounts = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24];
  
  for (const count of teamCounts) {
    await testTeamCount(count);
  }
  
  console.log('\n✅ Variable team testing complete!');
  console.log('\nNow you can:');
  console.log('1. Visit http://localhost:3004/mock-draft/[DRAFT_ID] to see live UI');
  console.log('2. Run full E2E tests:');
  console.log('   npm run mock:human:e2e:10  (10 teams)');
  console.log('   npm run mock:human:e2e:12  (12 teams)');
  console.log('   npm run mock:human:e2e:24  (24 teams, fast)');
})().catch(console.error);

