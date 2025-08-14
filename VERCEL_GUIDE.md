# Vercel Complete Setup & Deployment Guide

Last Updated: August 14, 2025

## 🚀 Quick Start

### Prerequisites
1. Vercel account with team: `kpm34s-projects`
2. Project linked: `college-football-fantasy-app`

### Essential Commands
```bash
# One-time setup
vercel link --yes --project college-football-fantasy-app

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Force rebuild (skip cache)
vercel --force --prod
```

## ⚙️ Critical Dashboard Settings

**URL**: https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings

### 1. General Settings (/settings/general)
- **Node.js Version**: 20.x or 22.x
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

### 2. Environment Variables (/settings/environment-variables)
Apply to: **Production, Preview, Development**

```env
# Core Appwrite Config
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=[server-side-only]

# Collections (all required)
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=players
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS=auction_bids
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS=auction_sessions
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS=player_projections
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users

# APIs (optional but recommended)
CFBD_API_KEY=[your-key]
AI_GATEWAY_API_KEY=[your-key]
CRON_SECRET=[secure-random-string]
```

### 3. Functions (/settings/functions)
- **Region**: US East (iad1) - closest to Appwrite NYC
- **Max Duration**: 10s (default)
- **Memory**: 1024 MB

### 4. Domains (/settings/domains)
- **Primary**: cfbfantasy.app
- **Secondary**: collegefootballfantasy.app
- **Redirects**: www variants → non-www

## 📁 Project Structure

```
college-football-fantasy-app/
├── vercel.json          # Keep minimal: {"version": 2}
├── package.json         # Dependencies and scripts
├── next.config.js       # Next.js configuration
├── .env.local           # Local dev environment
├── app/                 # App Router
│   └── api/             # API routes
├── components/          # React components
├── lib/                 # Utilities and configs
└── public/              # Static assets
```

## 🔧 Troubleshooting

### Problem: API Routes Return 404
**Fix**:
1. Check that route exists in `/app/api/`
2. Verify correct HTTP method (GET, POST, etc.)
3. Clear cache and redeploy: `vercel --force --prod`

### Problem: Build Fails
**Fix**:
```bash
# Clear cache and rebuild
vercel --force --prod

# Check logs
vercel logs --follow
```

### Problem: Environment Variables Not Working
**Fix**:
1. Ensure variables are set for all environments
2. Variables starting with `NEXT_PUBLIC_` are client-side
3. Redeploy after adding variables

### Problem: CORS Issues
**Fix**:
1. Clear browser cache
2. Clear service workers: DevTools → Application → Clear Storage
3. Check middleware.ts for CORS headers

## ✅ Deployment Checklist

### Before First Deploy
- [ ] All environment variables added
- [ ] Domains configured
- [ ] Region set to US East

### For Each Deploy
- [ ] Test API: `curl https://cfbfantasy.app/api/auth-test`
- [ ] Check functions logs: `vercel logs --follow`
- [ ] Verify in browser: https://cfbfantasy.app

## 🎯 Testing Deployment

```bash
# Test API endpoint
curl -s https://cfbfantasy.app/api/auth-test | jq

# Expected response
{
  "status": "OK",
  "message": "API is working",
  "timestamp": "..."
}

# Test in browser
open https://cfbfantasy.app/api/auth-test
```

## 🚨 Common Mistakes to Avoid

1. **Never deploy from frontend/ directory** - Always from root
2. **Don't modify vercel.json** - Keep it minimal: `{"version": 2}`
3. **Don't forget NEXT_PUBLIC_ prefix** for client-side vars
4. **Don't skip setting Root Directory** to `frontend`
5. **Don't use different regions** - Keep everything in US East

## 📊 Monitoring

### Vercel Dashboard Links
- [Deployments](https://vercel.com/kpm34s-projects/college-football-fantasy-app)
- [Analytics](https://vercel.com/kpm34s-projects/college-football-fantasy-app/analytics)
- [Functions](https://vercel.com/kpm34s-projects/college-football-fantasy-app/functions)
- [Logs](https://vercel.com/kpm34s-projects/college-football-fantasy-app/logs)

### CLI Monitoring
```bash
# Watch logs in real-time
vercel logs --follow

# Check recent deployments
vercel ls

# Inspect current deployment
vercel inspect [deployment-url]
```

## 🔄 Rollback Process

If deployment causes issues:
```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url]

# Or via dashboard
# Deployments → Three dots → Promote to Production
```

## 📝 Notes

- **Root Directory = frontend** is the most critical setting
- Deploy from project root, never from frontend/
- All API routes are under `/app/api/`
- Keep vercel.json minimal
- Test every deployment with curl/browser

---

**Support**: For issues, check [Vercel Status](https://www.vercel-status.com/) or contact support via dashboard.