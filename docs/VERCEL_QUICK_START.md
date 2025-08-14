# ⚡ Vercel Quick Start Guide

## 🎯 10-Minute Wins

### 1. Enable Analytics (5 minutes)

```bash
# Install
npm install @vercel/analytics @vercel/speed-insights

# Deploy
vercel --prod
```

**Add to `app/layout.tsx`:**
```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Add before closing </body>
<Analytics />
<SpeedInsights />
```

**That's it!** You now have:
- Real User Monitoring
- Core Web Vitals tracking
- Performance insights
- User behavior analytics

### 2. Move Your First Cron Job (10 minutes)

**Create `app/api/cron/test/route.ts`:**
```typescript
export async function GET() {
  console.log('Cron job executed at:', new Date().toISOString());
  return Response.json({ success: true });
}
```

**Update `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/cron/test",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
```

**Deploy and watch logs:**
```bash
vercel --prod
vercel logs --follow
```

### 3. Your First Feature Flag (10 minutes)

1. **Create Edge Config** in Vercel Dashboard
2. **Add your first flag:**
   ```json
   {
     "showNewFeature": true
   }
   ```

3. **Use in your app:**
   ```typescript
   import { get } from '@vercel/edge-config';
   
   const showFeature = await get('showNewFeature');
   ```

## 📊 Tracking Your First Events

### Draft Events
```typescript
// When user makes a pick
import { track } from '@vercel/analytics';

track('draft_pick', {
  round: 1,
  pick: 5,
  position: 'QB'
});
```

### Page Views
```typescript
// In any page component
useEffect(() => {
  track('page_view', { page: 'draft_room' });
}, []);
```

## 🚀 30-Minute Power Features

### Enable KV for Draft State

1. **Create KV Database** in Vercel Dashboard

2. **Store draft state:**
```typescript
import { kv } from '@vercel/kv';

// Set current pick
await kv.set('draft:current', { round: 1, pick: 5 });

// Get current pick
const current = await kv.get('draft:current');
```

3. **Real-time timer:**
```typescript
// Set 90-second timer
await kv.setex('draft:timer', 90, Date.now() + 90000);

// Check time remaining
const endTime = await kv.get('draft:timer');
const remaining = Math.max(0, endTime - Date.now());
```

### Upload Team Logos with Blob

1. **Create Blob Store** in Vercel Dashboard

2. **Simple upload endpoint:**
```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const blob = await put('team-logo.png', request.body, {
    access: 'public',
  });
  
  return Response.json(blob);
}
```

## 🎨 Enhanced Middleware (15 minutes)

**Upgrade your `middleware.ts`:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Track page views
  if (request.nextUrl.pathname.startsWith('/league')) {
    response.headers.set('X-Track-Page', 'league');
  }
  
  return response;
}
```

## 📈 Quick Monitoring Setup

### 1. Enable All Monitoring (2 minutes)
- Go to Vercel Dashboard → Your Project
- Settings → Monitoring
- Enable everything!

### 2. Create Your First Alert (3 minutes)
- Monitoring → Alerts → Create
- Alert when: "Function Duration > 3 seconds"
- Notify via: Email

### 3. View Real-time Logs (1 minute)
```bash
vercel logs --follow --prod
```

## 🔥 Instant Performance Wins

### 1. Optimize Images
```typescript
// Before
<img src="/hero.png" />

// After (automatic optimization!)
import Image from 'next/image';
<Image src="/hero.png" width={1200} height={600} priority />
```

### 2. Use Edge Runtime
```typescript
// Add to any API route for 10x faster cold starts
export const runtime = 'edge';
```

### 3. Enable ISR
```typescript
// Add to any page for automatic updates
export const revalidate = 3600; // Revalidate every hour
```

## 🎯 What to Do Next

### Today (30 minutes total):
1. ✅ Add Analytics (5 min)
2. ✅ Deploy with cron job (10 min)
3. ✅ Create Edge Config (5 min)
4. ✅ Track first event (5 min)
5. ✅ Check Analytics Dashboard (5 min)

### Tomorrow:
1. 🔄 Set up KV for draft state
2. 📊 Add more custom events
3. 🎛️ Create feature flags

### This Week:
1. 📁 Migrate images to Blob
2. ⚡ Convert APIs to Edge Runtime
3. 🤖 Try AI SDK for draft tips

## 💡 Common Issues & Fixes

### Analytics Not Showing?
- Wait 5-10 minutes after deployment
- Check if you're blocking analytics (ad blockers)
- Ensure you're on production (`vercel --prod`)

### Edge Config Not Working?
```bash
# Pull latest environment variables
vercel env pull
```

### KV Connection Issues?
```typescript
// Always check if KV is available
try {
  await kv.get('test');
} catch (error) {
  console.log('KV not configured');
}
```

## 🚨 Don't Forget!

1. **Remove API keys from GitHub Actions** (security risk!)
2. **Set CRON_SECRET** for cron endpoints
3. **Enable Vercel Authentication** for preview deployments
4. **Check Speed Insights** after each deployment

## 📚 Essential Links

- [Analytics Dashboard](https://vercel.com/dashboard/analytics)
- [Speed Insights](https://vercel.com/dashboard/speed-insights)
- [Edge Config](https://vercel.com/dashboard/stores/edge-config)
- [KV Dashboard](https://vercel.com/dashboard/stores/kv)
- [Monitoring](https://vercel.com/dashboard/monitoring)

---

**Remember**: Start with Analytics - it's just 5 minutes and gives immediate value! Every feature you add makes your app better. You've got this! 🏈✨
