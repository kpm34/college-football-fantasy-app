# GitHub Secrets to Add

## How to Add via GitHub Web Interface

1. Go to your repository: https://github.com/YOUR_USERNAME/college-football-fantasy-app
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

## Secrets to Add

### 1. CFBD_API_KEY
```
YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz
```

### 2. APPWRITE_ENDPOINT
```
https://nyc.cloud.appwrite.io/v1
```

### 3. APPWRITE_PROJECT_ID
```
college-football-fantasy-app
```

### 4. APPWRITE_DATABASE_ID
```
college-football-fantasy
```

### 5. APPWRITE_API_KEY
```
[YOUR APPWRITE API KEY - Add this yourself]
```

### 6. CRON_SECRET
```
38d704539a1bfe18534afbee94d847c7b086a5c9f25c78c1dad0fd5296ba7a5f
```

### 7. ROTOWIRE_USERNAME
```
kashpm2002@gmail.com
```

### 8. ROTOWIRE_PASSWORD_ENCRYPTED
```
1eae963c008bcfb06244479b10624aa6:e515a145ac1d4032159867f3653f2fb9:d08ca9ab2786a54cac
```

### 9. ROTOWIRE_ENCRYPTION_KEY
```
6504df254dada38bb3beaa7719156924d277db36a0c3ad8953f5bcf569e3f92f
```

## Quick Copy Commands

If you want to install GitHub CLI and do it from command line:

```bash
# Install GitHub CLI on macOS
brew install gh

# Login to GitHub
gh auth login

# Then run these commands:
gh secret set CFBD_API_KEY -b "YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz"
gh secret set APPWRITE_ENDPOINT -b "https://nyc.cloud.appwrite.io/v1"
gh secret set APPWRITE_PROJECT_ID -b "college-football-fantasy-app"
gh secret set APPWRITE_DATABASE_ID -b "college-football-fantasy"
gh secret set APPWRITE_API_KEY -b "YOUR_APPWRITE_API_KEY_HERE"
gh secret set CRON_SECRET -b "38d704539a1bfe18534afbee94d847c7b086a5c9f25c78c1dad0fd5296ba7a5f"
gh secret set ROTOWIRE_USERNAME -b "kashpm2002@gmail.com"
gh secret set ROTOWIRE_PASSWORD_ENCRYPTED -b "1eae963c008bcfb06244479b10624aa6:e515a145ac1d4032159867f3653f2fb9:d08ca9ab2786a54cac"
gh secret set ROTOWIRE_ENCRYPTION_KEY -b "6504df254dada38bb3beaa7719156924d277db36a0c3ad8953f5bcf569e3f92f"
```

## Verify Secrets Are Added

After adding all secrets, you should see these in your repository's secrets list:
- ✅ CFBD_API_KEY
- ✅ APPWRITE_ENDPOINT
- ✅ APPWRITE_PROJECT_ID
- ✅ APPWRITE_DATABASE_ID
- ✅ APPWRITE_API_KEY
- ✅ CRON_SECRET
- ✅ ROTOWIRE_USERNAME
- ✅ ROTOWIRE_PASSWORD_ENCRYPTED
- ✅ ROTOWIRE_ENCRYPTION_KEY
