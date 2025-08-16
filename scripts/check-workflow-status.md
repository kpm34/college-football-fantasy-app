# Check GitHub Actions Workflow Status

## 🔍 How to Check if Schema Sync Workflow is Running

### 1. Direct GitHub Link
Visit: **https://github.com/kmp34/college-football-fantasy-app/actions**

### 2. Look for the Latest Workflow Run
- Should see "test: trigger schema sync workflow" commit
- Workflow name: **"schema-sync"**
- Should have started within the last few minutes

### 3. Expected Workflow Steps

#### ✅ Check Job (runs on all commits)
1. **Setup Node** - Install Node.js 20
2. **Install PNPM** - Install package manager
3. **Install Appwrite CLI** - `npm i -g appwrite-cli`
4. **Appwrite CLI auth** - Authenticate with secrets
5. **Pull schema** - `pnpm schema:pull || npm run schema:pull`
6. **Fail on schema drift** - Check for changes
7. **Generate types** - `pnpm schema:types || npm run schema:types`
8. **Fail on stale types** - Verify types are current

#### 🚀 Deploy Job (only runs on main branch)
1. **Setup Node & PNPM**
2. **Install Appwrite CLI** 
3. **Appwrite CLI auth**
4. **Push schema + generate types** - `pnpm schema:all || npm run schema:all`
5. **Write schema digest to Edge Config** - Update Vercel Edge Config

### 4. Success Indicators
- ✅ All steps show green checkmarks
- ✅ No authentication errors
- ✅ Schema pull/push completes successfully
- ✅ Type generation works without errors

### 5. Common Issues to Watch For
- ❌ **Authentication Failed**: Check if secrets are set correctly
- ❌ **Schema Drift**: Changes were made in Appwrite Console
- ❌ **CLI Interactive Mode**: Database selection prompt (should be automated)
- ❌ **Type Generation Failed**: TypeScript compilation errors

### 6. If Workflow Fails
1. Click on the failed workflow run
2. Click on the failed job (either "check" or "deploy")
3. Expand the failed step to see error details
4. Common fixes:
   - Verify all 3 required secrets are set
   - Check secret values are correct (no extra spaces)
   - Ensure APPWRITE_API_KEY has database permissions

### 7. Manual Backup Test
If GitHub Actions fails, you can always use the manual sync:
```bash
node scripts/sync-appwrite-schema.js
```

## 🎯 What Success Looks Like
- Workflow completes without errors
- Schema is synchronized between Appwrite and GitHub
- Types are auto-generated and up to date
- Edge Config is updated with schema digest
- No manual intervention needed

## 📋 Next Steps After Success
1. Set up Appwrite webhooks to trigger on Console changes
2. Configure webhook endpoint: `https://cfbfantasy.app/api/webhooks/appwrite/schema-drift`
3. Test the complete end-to-end sync process