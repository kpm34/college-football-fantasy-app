# GitHub Secrets Setup Guide

## 📍 Repository Settings Location
Go to: https://github.com/kpm34/college-football-fantasy-app/settings/secrets/actions

## ✅ Required Secrets

### Core Appwrite Configuration
```bash
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=your_appwrite_api_key_here
```

### Vercel Integration (Optional but recommended)
```bash
EDGE_CONFIG_ID=your_vercel_edge_config_id
VERCEL_TEAM_ID=your_vercel_team_id  
VERCEL_API_TOKEN=your_vercel_api_token
```

### GitHub Integration (Optional - for issue creation)
```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=kmp34
GITHUB_REPO=college-football-fantasy-app
APPWRITE_WEBHOOK_SECRET=generate_random_secret_here
```

## 🔧 How to Add Secrets

1. **Navigate to Repository Settings**
   - Go to https://github.com/kmp34/college-football-fantasy-app
   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions"

2. **Add Each Secret**
   - Click "New repository secret"
   - Enter the name (e.g., `APPWRITE_ENDPOINT`)
   - Enter the value
   - Click "Add secret"
   - Repeat for all secrets

## 🚀 Test the Setup

After adding secrets, test by:
1. Making a small commit to trigger the workflow
2. Check Actions tab for workflow execution
3. Verify no authentication errors

## 🔍 Generate Missing Values

### Vercel API Token
```bash
# Get from: https://vercel.com/account/tokens
# Scope: Full Account access
```

### Vercel Team ID  
```bash
# Get from: https://vercel.com/[team]/settings/general
# Or use: npx vercel teams list
```

### GitHub Personal Access Token
```bash
# Get from: https://github.com/settings/personal-access-tokens/new
# Scopes needed: repo, issues
```

### Random Webhook Secret
```bash
# Generate with:
openssl rand -hex 32
# Or use online generator
```

## ✅ Verification

Run this command to verify secrets are working:
```bash
# This will trigger the schema-sync workflow
git commit --allow-empty -m "test: trigger schema sync workflow"
git push origin main
```

Check the Actions tab to see if the workflow runs successfully without authentication errors.