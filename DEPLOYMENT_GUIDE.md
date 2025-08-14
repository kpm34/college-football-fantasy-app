# College Football Fantasy App - Complete Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (free tier works)
- Appwrite Cloud account (or self-hosted instance)
- Git repository (GitHub/GitLab/Bitbucket)

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone [your-repo-url]
cd college-football-fantasy-app

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Appwrite Setup

### 2.1 Create Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Create new project named "college-football-fantasy-app"
3. Select NYC region for optimal performance
4. Note down your Project ID

### 2.2 Create Database

1. In Appwrite Console, go to Databases
2. Create database named "college-football-fantasy"
3. Note down the Database ID

### 2.3 Create Collections

Create the following collections with exact IDs:

| Collection Name | Collection ID | Purpose |
|-----------------|---------------|---------|
| Games | `games` | Game data and scores |
| Rankings | `rankings` | AP Top 25 weekly |
| Teams | `teams` | Power 4 teams |
| Leagues | `leagues` | User leagues |
| Rosters | `rosters` | Team rosters |
| Lineups | `lineups` | Weekly lineups |
| Users | `users` | User profiles |
| Players | `players` | Player data |
| Activity Log | `activity_log` | League activity |
| Draft Picks | `draft_picks` | Draft selections |
| Scoring Settings | `scoring_settings` | League scoring |
| Transactions | `transactions` | Add/drops/trades |
| Matchups | `matchups` | Weekly matchups |

### 2.4 Configure Collection Permissions

For each collection, set permissions:
- Read: Any
- Create: Users
- Update: Users (with document security)
- Delete: Users (with document security)

### 2.5 Generate API Key

1. Go to Settings → API Keys
2. Create new API key with all scopes
3. Save the API key securely

## Step 3: Get External API Keys

### 3.1 CollegeFootballData API

1. Go to [collegefootballdata.com](https://collegefootballdata.com)
2. Register for free account
3. Get your API key from dashboard
4. Note: Free tier has 1000 requests/hour limit

### 3.2 ESPN API (Optional)

- ESPN API is used for real-time scores
- No official API key needed (uses public endpoints)
- Rate limiting applied automatically

## Step 4: Environment Variables Setup

### 4.1 Create Environment Files

Create `.env.local` in the root directory:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=[your-project-id]
APPWRITE_API_KEY=[your-api-key]
APPWRITE_DATABASE_ID=college-football-fantasy

# External APIs
CFBD_API_KEY=[your-cfbd-api-key]
CFBD_API_KEY_BACKUP=[optional-backup-key]

# Server Configuration
PORT=3000
NODE_ENV=production
```

Create `frontend/.env.local`:

```env
# Next.js Public Variables (accessible in browser)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=[your-project-id]
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# Collection IDs
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=players
NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks
NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING_SETTINGS=scoring_settings
NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS=transactions
NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 5: Local Testing

### 5.1 Test Backend API

```bash
# Start backend server
npm run server

# In another terminal, test endpoints
curl http://localhost:3000/api/games
curl http://localhost:3000/api/rankings
curl http://localhost:3000/api/teams
```

### 5.2 Test Frontend

```bash
# Start frontend dev server
cd frontend
npm run dev

# Open http://localhost:3001
```

## Step 6: Vercel Deployment

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Login to Vercel

```bash
vercel login
```

### 6.3 Deploy Frontend

```bash
cd frontend

# First deployment
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: [select your account]
# - Link to existing project: N
# - Project name: college-football-fantasy-app
# - Directory: ./
# - Override settings: N
```

### 6.4 Configure Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `frontend/.env.local`
5. Set for: Production, Preview, Development

### 6.5 Deploy to Production

```bash
vercel --prod
```

## Step 7: Backend Deployment Options

### Option A: Vercel Serverless Functions (Recommended)

1. Move API routes to `frontend/app/api/`
2. Convert Express routes to Next.js API routes
3. Deploy with frontend

### Option B: Separate Backend (Railway/Render/Heroku)

Example for Railway:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
railway variables set APPWRITE_PROJECT_ID=[your-id]
# ... add all other variables

# Deploy
railway up
```

## Step 8: Post-Deployment Setup

### 8.1 Initialize Data

```bash
# Sync initial data from APIs
npm run sync-data

# This will populate:
# - Power 4 teams
# - Current season games
# - AP rankings
```

### 8.2 Configure Domain (Optional)

1. In Vercel Dashboard → Domains
2. Add custom domain
3. Update DNS records
4. Update `NEXT_PUBLIC_APP_URL` in environment variables

### 8.3 Setup Monitoring

1. Enable Vercel Analytics
2. Setup error tracking (Sentry recommended)
3. Configure uptime monitoring

## Step 9: Continuous Deployment

### 9.1 GitHub Integration

1. Push code to GitHub
2. In Vercel → Settings → Git
3. Connect GitHub repository
4. Enable automatic deployments

### 9.2 Branch Deployments

- `main` branch → Production
- `develop` branch → Preview
- Pull requests → Preview deployments

## Step 10: Maintenance Scripts

### Weekly Data Updates

Create GitHub Action `.github/workflows/sync-data.yml`:

```yaml
name: Sync Game Data
on:
  schedule:
    - cron: '0 10 * * 2' # Every Tuesday at 10 AM UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run sync-data
        env:
          APPWRITE_ENDPOINT: ${{ secrets.APPWRITE_ENDPOINT }}
          APPWRITE_PROJECT_ID: ${{ secrets.APPWRITE_PROJECT_ID }}
          APPWRITE_API_KEY: ${{ secrets.APPWRITE_API_KEY }}
          CFBD_API_KEY: ${{ secrets.CFBD_API_KEY }}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add your domain to Appwrite project settings
   - Ensure API routes use proper headers

2. **Authentication Issues**
   - Check Appwrite session management
   - Verify cookie settings for production

3. **Data Not Loading**
   - Check API rate limits
   - Verify environment variables
   - Check Appwrite permissions

4. **Build Failures**
   - Clear `.next` cache: `rm -rf .next`
   - Update dependencies: `npm update`
   - Check TypeScript errors: `npm run type-check`

### Debug Commands

```bash
# Check environment variables
vercel env pull

# View function logs
vercel logs

# Check build output
vercel inspect [deployment-url]
```

## Security Checklist

- [ ] All API keys in environment variables
- [ ] Appwrite permissions configured correctly
- [ ] HTTPS enabled on custom domain
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Appwrite handles this)
- [ ] XSS protection (Next.js handles this)

## Performance Optimization

1. Enable ISR (Incremental Static Regeneration) for game pages
2. Implement Redis caching for API responses
3. Use Vercel Edge Config for feature flags
4. Enable image optimization with Next.js Image
5. Implement database indexes in Appwrite

## Support Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [CollegeFootballData API Docs](https://api.collegefootballdata.com/api/docs)

## Contact

For deployment issues:
- Create issue in GitHub repository
- Check Vercel status page
- Review Appwrite system status

---

Last Updated: December 2024