# 🚀 Vercel Implementation Roadmap

## 🎯 Day 1: Analytics & Monitoring (30 minutes)

### Step 1: Install Dependencies
```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Step 2: Update Root Layout
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Step 3: Add Custom Event Tracking
```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';

export const analytics = {
  // Draft events
  draftPickMade: (data: {
    leagueId: string;
    round: number;
    pick: number;
    playerId: string;
    position: string;
  }) => track('draft_pick_made', data),

  // League events
  leagueCreated: (data: {
    leagueId: string;
    maxTeams: number;
    scoringType: string;
  }) => track('league_created', data),

  leagueJoined: (data: {
    leagueId: string;
    spotsRemaining: number;
  }) => track('league_joined', data),

  // Trade events
  tradeProposed: (data: {
    leagueId: string;
    playersOffered: number;
    playersRequested: number;
  }) => track('trade_proposed', data),

  tradeCompleted: (data: {
    leagueId: string;
    tradeValue: number;
  }) => track('trade_completed', data),

  // User engagement
  pageViewed: (page: string) => track('page_viewed', { page }),
  
  featureUsed: (feature: string) => track('feature_used', { feature }),
};
```

### Step 4: Implement Tracking in Components
```typescript
// app/draft/[leagueId]/draft-room/page.tsx
import { analytics } from '@/lib/analytics';

const makePick = async (playerId: string) => {
  // Make the pick
  const result = await createDraftPick(playerId);
  
  // Track the event
  analytics.draftPickMade({
    leagueId,
    round: currentRound,
    pick: currentPick,
    playerId,
    position: result.position
  });
};
```

## 📅 Day 2: Move Cron Jobs to Vercel (1 hour)

### Step 1: Create Cron Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/weekly-scoring",
      "schedule": "0 10 * * 2"
    },
    {
      "path": "/api/cron/update-rankings",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/sync-player-data",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Step 2: Secure Cron Endpoints
```typescript
// app/api/cron/weekly-scoring/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  // Verify this is a Vercel Cron job
  const authHeader = headers().get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('🏈 Starting weekly scoring calculation...');
    
    // Your scoring logic here
    const results = await calculateWeeklyScores();
    
    // Track execution
    await track('cron_job_completed', {
      job: 'weekly_scoring',
      success: true,
      processed: results.matchupsProcessed
    });
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Weekly scoring error:', error);
    
    await track('cron_job_failed', {
      job: 'weekly_scoring',
      error: error.message
    });
    
    return NextResponse.json(
      { error: 'Failed to calculate scores' },
      { status: 500 }
    );
  }
}
```

### Step 3: Add Environment Variable
```bash
# Add to Vercel dashboard
CRON_SECRET=your-secure-random-string
```

### Step 4: Remove GitHub Actions
Delete `.github/workflows/projection-updater.yml` after confirming Vercel Cron works.

## 🗄️ Day 3: Implement Vercel KV for Real-time Features (2-3 hours)

### Step 1: Create KV Database
```bash
# In Vercel Dashboard
# Storage → Create Database → KV → Create
```

### Step 2: Install KV SDK
```bash
npm install @vercel/kv
```

### Step 3: Draft State Management
```typescript
// lib/kv-draft.ts
import { kv } from '@vercel/kv';

export interface DraftState {
  currentPick: number;
  currentRound: number;
  onTheClock: string;
  timeRemaining: number;
  isPaused: boolean;
  lastPick?: {
    teamId: string;
    playerId: string;
    playerName: string;
  };
}

export const draftKV = {
  // Get current draft state
  getState: async (leagueId: string): Promise<DraftState | null> => {
    return await kv.hgetall(`draft:${leagueId}`);
  },

  // Update draft state
  updateState: async (leagueId: string, state: Partial<DraftState>) => {
    await kv.hset(`draft:${leagueId}`, state);
    await kv.expire(`draft:${leagueId}`, 86400); // 24 hour TTL
  },

  // Make a pick
  makePick: async (leagueId: string, pick: any) => {
    const multi = kv.multi();
    
    // Add to draft history
    multi.rpush(`draft:${leagueId}:picks`, JSON.stringify(pick));
    
    // Update current state
    multi.hset(`draft:${leagueId}`, {
      currentPick: pick.pickNumber + 1,
      lastPick: {
        teamId: pick.teamId,
        playerId: pick.playerId,
        playerName: pick.playerName
      }
    });
    
    await multi.exec();
  },

  // Get draft history
  getHistory: async (leagueId: string) => {
    const picks = await kv.lrange(`draft:${leagueId}:picks`, 0, -1);
    return picks.map(p => JSON.parse(p));
  },

  // Timer management
  startTimer: async (leagueId: string, seconds: number) => {
    await kv.setex(
      `draft:${leagueId}:timer`,
      seconds,
      Date.now() + (seconds * 1000)
    );
  },

  getTimeRemaining: async (leagueId: string): Promise<number> => {
    const endTime = await kv.get(`draft:${leagueId}:timer`);
    if (!endTime) return 0;
    return Math.max(0, Math.floor((Number(endTime) - Date.now()) / 1000));
  }
};
```

### Step 4: Real-time Draft Updates
```typescript
// app/draft/[leagueId]/draft-room/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { draftKV } from '@/lib/kv-draft';

export default function DraftRoom({ params }) {
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  
  useEffect(() => {
    // Poll for updates (replace with websockets later)
    const interval = setInterval(async () => {
      const state = await draftKV.getState(params.leagueId);
      setDraftState(state);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [params.leagueId]);
  
  const makePick = async (playerId: string) => {
    // Optimistic update
    setDraftState(prev => ({
      ...prev,
      currentPick: prev.currentPick + 1
    }));
    
    // Make the actual pick
    await fetch(`/api/draft/${params.leagueId}/pick`, {
      method: 'POST',
      body: JSON.stringify({ playerId })
    });
  };
  
  if (!draftState) return <div>Loading draft...</div>;
  
  return (
    <div>
      <h2>Pick {draftState.currentPick} - {draftState.onTheClock} is on the clock</h2>
      <div>Time remaining: {draftState.timeRemaining}s</div>
      {/* Rest of draft UI */}
    </div>
  );
}
```

## 🎛️ Day 4: Edge Config for Feature Flags (1-2 hours)

### Step 1: Create Edge Config Store
```bash
# In Vercel Dashboard
# Storage → Create Database → Edge Config → Create
```

### Step 2: Define Feature Flags
```typescript
// lib/feature-flags.ts
import { get, getAll } from '@vercel/edge-config';

export interface FeatureFlags {
  // Feature toggles
  newDraftUI: boolean;
  auctionDraftEnabled: boolean;
  tradeAnalyzer: boolean;
  aiDraftAssistant: boolean;
  
  // System flags
  maintenanceMode: boolean;
  registrationOpen: boolean;
  
  // A/B tests
  showOnboarding: boolean;
  enhancedStats: boolean;
  
  // Rate limits
  apiRateLimit: number;
  maxLeaguesPerUser: number;
}

export const flags = {
  get: async <K extends keyof FeatureFlags>(
    key: K
  ): Promise<FeatureFlags[K] | undefined> => {
    return await get(key);
  },
  
  getAll: async (): Promise<FeatureFlags> => {
    return await getAll<FeatureFlags>() ?? {} as FeatureFlags;
  },
  
  isEnabled: async (key: keyof FeatureFlags): Promise<boolean> => {
    const value = await get(key);
    return value === true;
  }
};
```

### Step 3: Use in Components
```typescript
// app/draft/[leagueId]/page.tsx
import { flags } from '@/lib/feature-flags';

export default async function DraftPage({ params }) {
  const auctionEnabled = await flags.isEnabled('auctionDraftEnabled');
  const newUI = await flags.isEnabled('newDraftUI');
  
  if (auctionEnabled) {
    return <AuctionDraft leagueId={params.leagueId} />;
  }
  
  return newUI ? (
    <NewDraftInterface leagueId={params.leagueId} />
  ) : (
    <ClassicDraftInterface leagueId={params.leagueId} />
  );
}
```

### Step 4: Middleware Integration
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { get } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  // Check maintenance mode
  const maintenanceMode = await get('maintenanceMode');
  if (maintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  
  // Check registration
  if (request.nextUrl.pathname.startsWith('/signup')) {
    const registrationOpen = await get('registrationOpen');
    if (!registrationOpen) {
      return NextResponse.redirect(new URL('/waitlist', request.url));
    }
  }
  
  return NextResponse.next();
}
```

## 📁 Day 5: Vercel Blob for File Storage (2 hours)

### Step 1: Create Blob Store
```bash
# Vercel Dashboard → Storage → Blob → Create
```

### Step 2: Team Logo Upload
```typescript
// app/api/team/upload-logo/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  
  if (!teamId) {
    return NextResponse.json(
      { error: 'Team ID required' },
      { status: 400 }
    );
  }
  
  const form = await request.formData();
  const file = form.get('logo') as File;
  
  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }
  
  // Validate file
  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type' },
      { status: 400 }
    );
  }
  
  // Upload to Blob
  const blob = await put(`team-logos/${teamId}/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  
  // Save URL to database
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.TEAMS,
    teamId,
    { logoUrl: blob.url }
  );
  
  return NextResponse.json({
    url: blob.url,
    size: blob.size,
  });
}
```

### Step 3: Logo Display Component
```typescript
// components/TeamLogo.tsx
import Image from 'next/image';

export function TeamLogo({ team }) {
  return (
    <div className="relative w-24 h-24">
      <Image
        src={team.logoUrl || '/default-team-logo.png'}
        alt={`${team.name} logo`}
        fill
        className="object-cover rounded-full"
        sizes="(max-width: 768px) 96px, 96px"
      />
    </div>
  );
}
```

## 🤖 Week 2: AI Integration & Advanced Features

### Enable AI Draft Assistant
```typescript
// app/api/ai/draft-assistant/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  const { messages, leagueId, context } = await req.json();
  
  // Get draft state from KV
  const draftState = await kv.hgetall(`draft:${leagueId}`);
  const availablePlayers = await kv.lrange(`draft:${leagueId}:available`, 0, 50);
  
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    system: `You are an expert college football fantasy draft assistant.
    
    Current draft state:
    - Round: ${draftState.currentRound}
    - Pick: ${draftState.currentPick}
    - Your next pick: ${context.nextPick}
    
    Top available players:
    ${availablePlayers.map(p => `- ${p.name} (${p.position}, ${p.team})`).join('\n')}
    
    Provide strategic draft advice considering:
    1. Positional scarcity
    2. Bye weeks
    3. Strength of schedule
    4. AP Top-25 matchups (remember: players only score against Top-25 teams or in conference games)
    `,
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

### Add Speed Insights Dashboard
```typescript
// app/performance/page.tsx
export default function PerformanceDashboard() {
  return (
    <div className="p-8">
      <h1>Performance Metrics</h1>
      <iframe
        src={`https://vercel.com/analytics/embed?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`}
        width="100%"
        height="600"
        frameBorder="0"
      />
    </div>
  );
}
```

## ✅ Success Checklist

### Week 1 Goals
- [ ] Analytics tracking live
- [ ] First custom events firing
- [ ] Cron jobs migrated
- [ ] KV draft state working
- [ ] Edge Config connected
- [ ] First feature flag tested

### Week 2 Goals
- [ ] Blob storage for logos
- [ ] AI assistant responding
- [ ] ISR on player pages
- [ ] Advanced middleware rules
- [ ] Monitoring dashboard

### Performance Targets
- [ ] Core Web Vitals all green
- [ ] Draft page loads < 1 second
- [ ] API routes using Edge Runtime
- [ ] Images optimized with next/image

## 🚀 Deploy & Monitor

### After Each Implementation:
1. Deploy to preview: `vercel`
2. Test feature flags in preview
3. Check Analytics dashboard
4. Monitor Speed Insights
5. Deploy to production: `vercel --prod`

### Set Up Alerts:
```bash
# In Vercel Dashboard
# Monitoring → Create Alert
# - Function errors > 10/hour
# - Response time > 3 seconds
# - Error rate > 5%
```

## 💡 Pro Implementation Tips

1. **Start Small**: Implement Analytics first - immediate value
2. **Test in Preview**: Use preview deployments for all changes
3. **Monitor Impact**: Check Speed Insights after each change
4. **Use TypeScript**: Type all KV and Edge Config responses
5. **Handle Failures**: Always have fallbacks for external services

## 🎯 Next Steps After Implementation

1. **Create Dashboards**:
   - User engagement metrics
   - Draft completion rates
   - Performance trends

2. **Optimize Based on Data**:
   - Identify slow pages with Speed Insights
   - Track user drop-off with Analytics
   - A/B test with Edge Config

3. **Scale with Confidence**:
   - KV handles real-time state
   - Blob manages user content
   - Edge Config enables instant updates

Remember: Each feature you implement improves user experience and gives you better insights! Start with Analytics today - it takes just 10 minutes! 🏈
