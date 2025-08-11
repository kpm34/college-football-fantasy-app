# Vercel Settings Checklist

## Dashboard Settings (https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings)

### 1. General Settings (/settings/general)
- [ ] **Root Directory**: Set to `frontend`
- [ ] **Framework Preset**: Next.js (should auto-detect)
- [ ] **Build Command**: `npm run build` (default)
- [ ] **Output Directory**: `.next` (default)
- [ ] **Install Command**: `npm install` (default)
- [ ] **Development Command**: `next` (default)
- [ ] **Node.js Version**: 20.x or 22.x

### 2. Environment Variables (/settings/environment-variables)
All these should be set for Production, Preview, and Development:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# Collection IDs
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

# API Keys (if needed)
CFBD_API_KEY=your-key-here
AI_GATEWAY_API_KEY=your-key-here
```

### 3. Domains (/settings/domains)
- [ ] `cfbfantasy.app` - Primary domain
- [ ] `collegefootballfantasy.app` - Secondary domain
- [ ] `*.cfbfantasy.app` - Subdomains (if needed)

### 4. Functions (/settings/functions)
- [ ] **Region**: US East (iad1) - closest to Appwrite NYC
- [ ] **Max Duration**: 10s (default is fine)

### 5. Git (/settings/git)
- [ ] Connected to: `kpm34/college-football-fantasy-app`
- [ ] Production Branch: `main`
- [ ] Auto-deploy: Enabled

## Local Files Configuration

### vercel.json
Keep it minimal:
```json
{
  "version": 2
}
```

### frontend/package.json
Ensure these scripts exist:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "SKIP_ENV_VALIDATION=true next build",
    "start": "next start",
    "prebuild": "node scripts/generate-icons.js"
  }
}
```

### frontend/.env.local
For local development, copy all environment variables from Vercel dashboard.

## Deployment Commands

### Always Deploy from Root Directory
```bash
# Link to project (one time)
vercel link --yes --project college-football-fantasy-app

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Check Deployment
```bash
# View recent deployments
vercel ls

# View logs if deployment fails
vercel logs [deployment-url]
```

## Common Issues & Solutions

1. **404 on API routes**: Ensure Root Directory is set to `frontend` in dashboard
2. **Build fails**: Check Node.js version and environment variables
3. **CORS errors**: Our server-side auth should prevent these
4. **Missing icons**: The prebuild script should generate them

## Important Notes

- **NEVER** run `vercel` from the `frontend` directory
- **NEVER** create a new project when prompted
- **ALWAYS** deploy from the root directory
- The `rootDirectory` setting goes in Vercel Dashboard, NOT in vercel.json
