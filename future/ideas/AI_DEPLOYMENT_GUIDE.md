# AI Assistant Deployment Guide - College Football Fantasy App

## IMPORTANT: Read This First
This guide is written for AI assistants (like ChatGPT) to successfully deploy the College Football Fantasy App. Follow each step exactly as written. Do not skip steps or make assumptions.

## Project Structure
```
college-football-fantasy-app/
├── app/                    # Next.js 15 app directory
├── components/             # React components
├── lib/                    # Utilities and configurations
├── public/                 # Static assets
├── .env                    # Root environment variables
├── .env.local              # Local environment variables
├── package.json            # Dependencies
└── next.config.js          # Next.js configuration
```

## Pre-Deployment Checklist
- [ ] User has Vercel account
- [ ] User has Appwrite account with NYC region project
- [ ] User has GitHub repository
- [ ] User has CFBD API key

## Step 1: Environment Variables

### Required Environment Variables
Copy these EXACT variable names. The user must provide values for [brackets]:

```env
# For .env.local (root directory)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=[user-must-provide]
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=[user-must-provide]
CFBD_API_KEY=[user-must-provide]

# Collection IDs (use these exact values)
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
```

## Step 2: Install Vercel CLI

Run this command:
```bash
npm install -g vercel
```

## Step 3: Login to Vercel

Run this command and follow browser prompt:
```bash
vercel login
```

## Step 4: Deploy Command Sequence

Run these commands IN ORDER from the project root:

```bash
# 1. First, ensure you're in the project root
cd /path/to/college-football-fantasy-app

# 2. Install dependencies
npm install

# 3. Build the project locally first to catch errors
npm run build

# 4. If build succeeds, deploy to Vercel
vercel

# 5. Answer the prompts as follows:
# - Set up and deploy? Y
# - Which scope? [select user's account]
# - Link to existing project? N
# - What's your project's name? college-football-fantasy-app
# - In which directory is your code located? ./
# - Want to override settings? N
```

## Step 5: Add Environment Variables to Vercel

After initial deployment, add environment variables:

```bash
# Add each variable one by one
vercel env add NEXT_PUBLIC_APPWRITE_ENDPOINT production
# When prompted, enter: https://nyc.cloud.appwrite.io/v1

vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID production
# When prompted, user must provide their Appwrite project ID

vercel env add NEXT_PUBLIC_APPWRITE_DATABASE_ID production
# When prompted, enter: college-football-fantasy

vercel env add APPWRITE_API_KEY production
# When prompted, user must provide their Appwrite API key

vercel env add CFBD_API_KEY production
# When prompted, user must provide their CFBD API key

# Add all collection IDs (use exact values from Step 1)
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES production
# Enter: games

# Continue for all collection IDs...
```

## Step 6: Deploy to Production

```bash
# Deploy with environment variables
vercel --prod

# Note the deployment URL that's returned
```

## Step 7: Set Production Alias

```bash
# Set custom domain alias
vercel alias set [deployment-url] cfbfantasy.app
```

## Common Issues and Solutions

### Issue: "Module not found" errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Issue: "Invalid environment variables"
```bash
# Solution: Pull and verify
vercel env pull
cat .env.local
```

### Issue: "Appwrite connection failed"
- Verify NEXT_PUBLIC_APPWRITE_PROJECT_ID is correct
- Ensure Appwrite project is in NYC region
- Check that API key has proper permissions

### Issue: "Build failed on Vercel"
```bash
# Check logs
vercel logs --follow
```

## Verification Steps

1. Check deployment status:
```bash
vercel ls
```

2. Open production URL:
```bash
vercel open
```

3. Test API endpoints:
```bash
curl https://[your-deployment].vercel.app/api/games
```

## Post-Deployment Tasks

1. **Initialize Database Collections**
   - User must create collections in Appwrite with exact IDs from Step 1
   - Set permissions: Read (Any), Write (Users)

2. **Sync Initial Data**
```bash
# From project root
npm run sync-data
```

3. **Enable Auto-Deploy**
   - Connect GitHub in Vercel Dashboard
   - Main branch → Production
   - Other branches → Preview

## Critical Notes for AI Assistants

1. **DO NOT** change collection IDs - they must match exactly
2. **DO NOT** skip the local build test - it catches errors early
3. **DO NOT** use relative paths for Vercel commands
4. **ALWAYS** verify environment variables were added with `vercel env ls`
5. **ALWAYS** use `--prod` flag for production deployments
6. **REMEMBER** The project uses the root directory, not a subfolder

## Quick Redeployment

If changes are made and you need to redeploy:
```bash
# From project root
vercel --prod
```

## Memory Update Required
After successful deployment, remember to update that:
- The app is deployed to Vercel
- Production URL is set
- Auto-deploy is configured
- The user prefers using Vercel CLI

## Success Indicators
- Deployment URL returns 200 status
- Homepage loads without errors
- API routes respond with data
- No console errors in browser

---
This guide is optimized for AI comprehension. Follow steps sequentially without deviation.
