# Vercel Dashboard Configuration Guide

## Critical: Set Root Directory for Frontend

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings/general
- Or navigate: Dashboard → college-football-fantasy-app → Settings → General

### 2. Configure Root Directory
Under "Build & Development Settings":
1. Find "Root Directory"
2. Click "Edit"
3. Enter: `frontend`
4. Click "Save"

### 3. Redeploy from Dashboard
After saving the root directory:
1. Go to the "Deployments" tab
2. Click the three dots (⋮) on the latest deployment
3. Select "Redeploy"
4. In the modal, click "Redeploy" to confirm

### 4. Verify Deployment
Once deployment completes:
- Check: https://cfbfantasy.app
- Test API: https://cfbfantasy.app/api/auth-test
- Login should work without CORS errors

## Why This Is Necessary
- The project structure has the Next.js app in `frontend/` subdirectory
- Vercel needs to know this to properly build and serve the application
- Without this setting, API routes won't be accessible

## Alternative: Command Line Deployment
If dashboard access is limited, use:
```bash
cd /path/to/college-football-fantasy-app
vercel --prod --cwd frontend
```

## Troubleshooting
If API routes still return 404:
1. Ensure no authentication is enabled on the project
2. Check that `vercel.json` only contains `{"version": 2}`
3. Verify the deployment shows "Next.js" as the framework

## Delete Duplicate Project
To clean up the accidental "frontend" project:
1. Go to: https://vercel.com/kpm34s-projects/frontend/settings/advanced
2. Scroll to "Delete Project"
3. Type the project name to confirm deletion
