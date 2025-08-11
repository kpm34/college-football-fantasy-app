# 🚨 URGENT: Fix Login CORS Issue

## Problem
Your Appwrite instance is configured to only allow requests from `https://localhost`, but your production domain is `https://cfbfantasy.app`. This is causing CORS errors and preventing login.

## Quick Fix (Manual - 2 minutes)

### Option 1: Via Appwrite Console (Recommended)

1. **Go to Appwrite Console:**
   https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app

2. **Navigate to Settings:**
   - Click on "Settings" in the left sidebar
   - Click on "Platforms" tab

3. **Add Web Platforms:**
   Click "Add Platform" → "Web App" for each of these:
   
   | Name | Hostname |
   |------|----------|
   | CFB Fantasy Main | `cfbfantasy.app` |
   | CFB Fantasy WWW | `www.cfbfantasy.app` |
   | College Football Fantasy | `collegefootballfantasy.app` |
   | College Football Fantasy WWW | `www.collegefootballfantasy.app` |
   | Vercel Preview | `*.vercel.app` |
   | Localhost | `localhost` |

4. **Save each platform** after adding it

5. **Clear browser cache** and try logging in again

### Option 2: Create New API Key (If you need programmatic access)

1. Go to: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/api

2. Create a new API key with these scopes:
   - `platforms.write`
   - `projects.read`
   - `projects.write`

3. Update the API key in your environment variables

## Alternative Quick Fix

If you can't access the Appwrite console, you can temporarily work around this by:

1. Using a proxy endpoint in your Next.js API routes
2. Setting up a middleware to handle CORS

## Why This Happened

The Appwrite project was initially configured for localhost development only. When deploying to production, the platform configurations need to be updated to include your production domains.

## Verification

After fixing, you should:
1. No longer see CORS errors in the console
2. Be able to login successfully
3. See successful API calls to `https://nyc.cloud.appwrite.io/v1/account`

## Need Help?

If you're still having issues after following these steps:
1. Check that you're using the correct Appwrite project ID
2. Ensure your environment variables are properly set in Vercel
3. Try in an incognito window to rule out cache issues
