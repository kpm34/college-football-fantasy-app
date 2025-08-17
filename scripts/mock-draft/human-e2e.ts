// scripts/mock-draft/human-e2e.ts
import 'cross-fetch/polyfill';

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                 process.env.BASE_URL     ?? 'http://localhost:3004';

// Configurable test parameters
const NUM_TEAMS = parseInt(process.env.NUM_TEAMS || '8');
const ROUNDS = parseInt(process.env.ROUNDS || '15');
const TIMER_SEC = parseInt(process.env.TIMER_SEC || '2');

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE_URL}${path}`, { 
    ...init, 
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) } 
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

type CreateResp = { draftId: string };
type ResultsResp = { draft: any; participants: any[]; picks: any[] };
type TurnResp = { 
  ok: boolean; 
  turn: { 
    draftId: string; 
    overall: number; 
    round: number; 
    slot: number; 
    participantId: string; 
    deadlineAt: string 
  } 
};

async function delay(ms: number) { 
  return new Promise(r => setTimeout(r, ms)); 
}

(async () => {
  const start = Date.now();
  const expectedPicks = NUM_TEAMS * ROUNDS;
  console.log(`🚀 Starting HUMAN-E2E test (${NUM_TEAMS} teams, ${ROUNDS} rounds, ${expectedPicks} total picks)...`);
  
  try {
    // 1) Create humans draft (host creates)
    console.log(`1️⃣ Creating draft with ${NUM_TEAMS} human participants...`);
    const create = await j<any>('/api/mock-draft/create', {
      method: 'POST',
      body: JSON.stringify({ 
        draftName: `HUMAN-E2E-${NUM_TEAMS}x${ROUNDS}`, 
        rounds: ROUNDS, 
        snake: true, 
        timerPerPickSec: TIMER_SEC,
        numTeams: NUM_TEAMS,
        participants: Array.from({ length: NUM_TEAMS }).map((_, i) => ({ 
          slot: i + 1, 
          userType: 'human', 
          displayName: `User ${i + 1}` 
        })),
        seed: `HUMAN-E2E-${NUM_TEAMS}x${ROUNDS}-001`
      })
    });
    
    const draftId = create.draftId || create.id || create.$id;
    console.log(`✅ Draft created: ${draftId}`);

    // 2) Join all seats
    console.log(`2️⃣ Joining all ${NUM_TEAMS} seats...`);
    for (let i = 1; i <= NUM_TEAMS; i++) {
      await j('/api/mock-draft/join', { 
        method: 'POST', 
        body: JSON.stringify({ 
          draftId, 
          userId: `user-${i}`, 
          displayName: `User ${i}` 
        }) 
      });
      console.log(`   ✅ User ${i} joined`);
    }

    // 3) Start draft (human mode)
    console.log('3️⃣ Starting draft in human mode...');
    await j(`/api/mock-draft/start`, { 
      method: 'POST', 
      body: JSON.stringify({ draftId, mode: 'human' }) 
    });
    console.log('   ✅ Draft started');

    // 4) Spin up simulated clients
    console.log(`4️⃣ Starting ${NUM_TEAMS} simulated clients...`);
    const clients = Array.from({ length: NUM_TEAMS }).map((_, i) => 
      simulateClient(draftId, `user-${i + 1}`)
    );
    
    // Watchdog to ensure progress
    const watchdog = (async () => {
      let lastOverall = 0, stalls = 0;
      while (true) {
        await delay(1000);
        try {
          const t = await j<TurnResp>(`/api/mock-draft/turn/${draftId}`);
          const overall = t.turn.overall;
          
          if (overall === lastOverall) {
            stalls++;
            if (stalls % 5 === 0) {
              console.log(`   ⏱️ Pick ${overall} taking ${stalls}s...`);
            }
          } else { 
            stalls = 0; 
            lastOverall = overall;
            if (overall % Math.max(1, Math.floor(expectedPicks / 10)) === 0 || overall === 1) {
              console.log(`   📊 Progress: ${overall}/${expectedPicks} picks made`);
            }
          }
          
          if (stalls >= 10) {
            console.error('   ❌ No progress for 10s, might be stuck');
            throw new Error('No progress for 10s');
          }
          
          const res = await j<ResultsResp>(`/api/mock-draft/results/${draftId}`);
          if (res.draft?.status === 'complete') {
            console.log('   ✅ Draft completed!');
            return;
          }
        } catch (e: any) {
          if (e.message === 'No progress for 10s') throw e;
          console.warn('   ⚠️ Watchdog error (continuing):', e.message);
        }
      }
    })();

    await Promise.race([Promise.all(clients), watchdog]);

    // 5) Verify results
    console.log('5️⃣ Verifying results...');
    const res = await j<ResultsResp>(`/api/mock-draft/results/${draftId}`);
    
    if (res.picks.length !== expectedPicks) {
      throw new Error(`Expected ${expectedPicks} picks, got ${res.picks.length}`);
    }
    
    const ids = new Set(res.picks.map(p => p.playerId));
    if (ids.size !== expectedPicks) {
      throw new Error('Duplicate players detected');
    }
    
    // Count autopicks
    const autopicks = res.picks.filter(p => p.autopick).length;
    
    console.log(`\n✅ HUMAN-E2E complete in ${((Date.now() - start) / 1000).toFixed(1)}s`);
    console.log(`   Configuration: ${NUM_TEAMS} teams × ${ROUNDS} rounds`);
    console.log(`   Total picks: ${res.picks.length}/${expectedPicks}`);
    console.log(`   Unique players: ${ids.size}`);
    console.log(`   Autopicks: ${autopicks}`);
    console.log(`   Manual picks: ${res.picks.length - autopicks}`);
    console.log(`   Draft ID: ${draftId}`);
    
  } catch (e: any) {
    console.error(`\n❌ HUMAN-E2E failed:`, e.message);
    process.exit(1);
  }
})();

async function simulateClient(draftId: string, userId: string) {
  // Figure out my participantId
  const results = await j<ResultsResp>(`/api/mock-draft/results/${draftId}`);
  const my = results.participants.find(p => p.userId === userId);
  if (!my) throw new Error(`No participant for ${userId}`);

  console.log(`   👤 Client ${userId} (Team ${my.slot}) started`);

  while (true) {
    try {
      const t = await j<TurnResp>(`/api/mock-draft/turn/${draftId}`);
      
      // Check if draft is complete
      const res = await j<ResultsResp>(`/api/mock-draft/results/${draftId}`);
      if (res.draft?.status === 'complete') {
        console.log(`   👤 Client ${userId} finished`);
        return;
      }
      
      if (t.turn.participantId !== my.$id) { 
        await delay(200 + Math.random() * 300); 
        continue; 
      }

      // 20% chance: skip to force autopick
      if (Math.random() < 0.2) { 
        console.log(`   ⏭️ User ${my.slot} intentionally skipping for autopick`);
        await delay((TIMER_SEC + 0.5) * 1000); // Wait slightly longer than timer
        continue; 
      }

      // "Choose" a player id
      const avail = await fetch(`${BASE_URL}/api/draft/players`)
        .then(r => r.json())
        .then(data => data.players || data || [])
        .catch(() => []);
      
      // Filter out already picked
      const pickedIds = new Set(res.picks.map(p => p.playerId));
      const available = avail.filter((p: any) => !pickedIds.has(p.id || p.$id));
      
      if (available.length === 0) {
        // No players loaded, use a fallback ID
        const pickId = `player-${Date.now()}-${Math.random()}`;
        try {
          await j(`/api/mock-draft/pick`, { 
            method: 'POST', 
            body: JSON.stringify({ 
              draftId, 
              participantId: my.$id, 
              playerId: pickId 
            }) 
          });
        } catch {
          // Will fail but that's expected
        }
      } else {
        // Pick a random available player
        const player = available[Math.floor(Math.random() * Math.min(10, available.length))];
        const pickId = player.id || player.$id;
        
        try {
          await j(`/api/mock-draft/pick`, { 
            method: 'POST', 
            body: JSON.stringify({ 
              draftId, 
              participantId: my.$id, 
              playerId: pickId 
            }) 
          });
        } catch (e: any) {
          // Could be out-of-turn or duplicate, that's OK
          if (!e.message.includes('Not your turn') && !e.message.includes('already drafted')) {
            console.warn(`   ⚠️ User ${my.slot} pick error:`, e.message);
          }
        }
      }
      
      // Small delay before next check
      await delay(100 + Math.random() * 200);
      
    } catch (e: any) {
      // Connection errors, etc - just retry
      await delay(500);
    }
  }
}
