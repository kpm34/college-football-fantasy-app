# Vercel Configuration Fix

## Problem
API routes are returning 404 because Vercel is not configured to use the `frontend` directory as the root.

## Solution

### Option 1: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Click on your `college-football-fantasy-app` project
3. Go to **Settings** → **General**
4. Find **Root Directory** setting
5. Change it to: `frontend`
6. Click **Save**
7. Go to **Deployments** tab and click **Redeploy**

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project and set root directory
vercel link
vercel --prod --build-env ROOT_DIR=frontend
```

### Option 3: Create vercel.json in root
Create a new `vercel.json` in the project root with:
```json
{
  "version": 2,
  "rootDirectory": "frontend"
}
```

## After Configuration
Once deployed with the correct root directory:
- API routes should work: https://cfbfantasy.app/api/auth-test
- Login proxy will work: https://cfbfantasy.app/api/auth/proxy

## Test Commands
```bash
# Test API endpoint
curl -s https://cfbfantasy.app/api/auth-test

# Test login
curl -X POST https://cfbfantasy.app/api/auth/proxy?path=/account/sessions/email \
  -H "Content-Type: application/json" \
  -d '{"email":"kashpm2002@gmail.com","password":"#Kash2002"}'
```
