# Vercel Project Setup - IMPORTANT

## The Correct Project
- **Project Name**: `college-football-fantasy-app`
- **Production Domain**: `cfbfantasy.app`
- **Root Directory**: `frontend` (set in Vercel dashboard)

## How to Deploy Correctly

### From Root Directory
```bash
# Always link to the correct project first
vercel link --yes --project college-football-fantasy-app

# Deploy to production
vercel --prod
```

### From Frontend Directory
```bash
cd frontend
# NEVER run just 'vercel' from here - it will create a new project!
# Instead, go back to root:
cd ..
vercel --prod
```

## Common Mistakes to Avoid
1. **DON'T** run `vercel` from the `frontend` directory
2. **DON'T** accept creating a new project if prompted
3. **DON'T** use `vercel --cwd frontend` as it may create confusion

## If You Accidentally Create a Duplicate Project
```bash
# List all projects
vercel project list

# Remove the duplicate (usually named 'frontend')
vercel remove frontend --yes

# Re-link to correct project
rm -rf .vercel
vercel link --yes --project college-football-fantasy-app
```

## Vercel Dashboard Settings
1. Go to: https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings/general
2. Ensure "Root Directory" is set to: `frontend`
3. Save changes

## Environment Variables
Make sure all environment variables are set in:
https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings/environment-variables

## Check Deployment Status
```bash
# View recent deployments
vercel ls

# Open latest deployment
vercel inspect [deployment-url]
```

Remember: We only have ONE project - `college-football-fantasy-app`!
