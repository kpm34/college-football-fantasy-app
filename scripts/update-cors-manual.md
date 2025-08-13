# Quick CORS Fix for Appwrite

Since the API key permissions might be limited, here's the quickest way to fix the CORS issue:

## Option 1: Manual Console Update (Fastest)

1. **Open Appwrite Console**
   - Go to: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app

2. **Navigate to Platforms**
   - Click on **Settings** in the left sidebar
   - Click on **Platforms**

3. **Add Web Platforms**
   Click "Add Platform" and select "Web App" for each of these:

   | Name | Hostname |
   |------|----------|
   | CFB Fantasy Main | cfbfantasy.app |
   | CFB Fantasy WWW | www.cfbfantasy.app |
   | College Football Fantasy | collegefootballfantasy.app |
   | College Football Fantasy WWW | www.collegefootballfantasy.app |
   | Vercel Preview | *.vercel.app |
   | Localhost | localhost |
   | Localhost 3000 | localhost:3000 |
   | Localhost 3001 | localhost:3001 |

4. **Save Each Platform**
   - Click "Create" after entering each hostname

## Option 2: Using Appwrite CLI

If you prefer command line:

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Select your project
appwrite init project

# Add platforms
appwrite projects createWebPlatform \
  --projectId="college-football-fantasy-app" \
  --name="CFB Fantasy" \
  --hostname="cfbfantasy.app"

# Repeat for other domains...
```

## After Adding Platforms

1. **Clear Browser Cache**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear storage"
   - Check all boxes and click "Clear site data"

2. **Hard Refresh**
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

3. **Test**
   - Visit https://cfbfantasy.app/login
   - The CORS errors should be gone!

## Verification

You can verify the platforms are added by checking:
https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/platforms

All your production domains should be listed there.
