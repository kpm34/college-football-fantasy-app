# Appwrite CORS Configuration Guide

## The Issue
Appwrite is currently configured to only allow requests from `https://localhost`, but your production domains need to be added.

## Steps to Fix

### 1. Login to Appwrite Console
Go to: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app

### 2. Navigate to Project Settings
- Click on your project "college-football-fantasy-app"
- Go to Settings → Platforms

### 3. Add Web Platforms
Add the following platforms:

#### Production Domains:
- Name: CFB Fantasy Main
  - Hostname: cfbfantasy.app
  
- Name: CFB Fantasy WWW
  - Hostname: www.cfbfantasy.app
  
- Name: College Football Fantasy Main
  - Hostname: collegefootballfantasy.app
  
- Name: College Football Fantasy WWW
  - Hostname: www.collegefootballfantasy.app

#### Development Domains:
- Name: Localhost Dev
  - Hostname: localhost
  
- Name: Vercel Preview
  - Hostname: *.vercel.app

### 4. Save Changes
Make sure to save all the platform configurations.

## Alternative: Using Appwrite CLI

If you have Appwrite CLI installed, you can run:

```bash
appwrite login
appwrite projects update \
  --project-id="college-football-fantasy-app" \
  --platform="web" \
  --hostname="cfbfantasy.app,www.cfbfantasy.app,collegefootballfantasy.app,www.collegefootballfantasy.app,*.vercel.app,localhost"
```

## Verify Configuration
After adding the platforms, test by:
1. Clearing your browser cache
2. Visiting https://cfbfantasy.app/login
3. The CORS errors should be resolved

## Note
If you're still seeing CORS errors after this, it might be because:
1. The changes haven't propagated yet (wait 1-2 minutes)
2. Browser cache needs to be cleared
3. Service worker needs to be updated (clear site data in DevTools)
