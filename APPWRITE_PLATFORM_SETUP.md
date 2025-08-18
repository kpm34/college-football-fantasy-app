# Add cfbfantasy.app to Appwrite Platforms

## Steps to Fix "Invalid Origin" Error

1. **Go to Appwrite Console**
   - URL: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/platforms
   - Or navigate: Console → Your Project → Platforms

2. **Add Web Platform**
   - Click "Add Platform"
   - Select "Web App"
   - Enter the following hostnames (one at a time):
     - `cfbfantasy.app`
     - `*.cfbfantasy.app`
     - `collegefootballfantasy.app`
     - `*.collegefootballfantasy.app`
     - `localhost`
     - `*.vercel.app`

3. **Save Each Platform**
   - Click "Create" after entering each hostname
   - The platform should appear in the list

## Important Note
Even though we're using a proxy, Appwrite still validates the Origin header. The proxy forwards the original Origin from the browser, so we need to register all production domains.

## Verification
After adding the platforms:
1. Hard refresh the login page (Cmd+Shift+R)
2. Try logging in again
3. The "Invalid Origin" error should be resolved

## Alternative: Use Appwrite CLI
If the console is slow, you can use the CLI:
```bash
cd ~/college-football-fantasy-app
npm install -g appwrite
appwrite login
appwrite init project
appwrite platforms add --platform web --hostname cfbfantasy.app
```
