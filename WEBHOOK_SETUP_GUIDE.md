# Appwrite Webhook Setup Guide

## Issue Summary
Both API keys (`APPWRITE_API_KEY` and `cursor_key`) have "applications" role which lacks `projects.write` scope needed for webhook management.

## Manual Webhook Setup (Recommended)

### Step 1: Create Webhook in Appwrite Console
1. Go to [Appwrite Console](https://cloud.appwrite.io/console/project-college-football-fantasy-app)
2. Navigate to **Project Settings** → **Webhooks**
3. Click **"Create Webhook"**

### Step 2: Configure Webhook
Use these exact settings:

**Basic Configuration:**
- **Name:** `Schema Drift Detection`
- **URL:** `https://cfbfantasy.app/api/webhooks/appwrite/schema-drift`
- **Security:** ✅ Enable HTTPS verification

**Events to Subscribe:**
```
databases.*.collections.*.create
databases.*.collections.*.update
databases.*.collections.*.delete
databases.*.attributes.*.create
databases.*.attributes.*.update
databases.*.attributes.*.delete
databases.*.indexes.*.create
databases.*.indexes.*.update
databases.*.indexes.*.delete
```

**Headers:**
- **X-Webhook-Secret:** `f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b`

### Step 3: Add Environment Variable
Add this to your environment files:
```bash
APPWRITE_WEBHOOK_SECRET=f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b
```

## Alternative: Fix API Key Permissions

### Option A: Create New API Key with Project Scope
1. In Appwrite Console → **Project Settings** → **API Keys**
2. **Create API Key**
3. **Name:** `Webhook Management Key`
4. **Scopes:** Select **ALL** project-level scopes including:
   - `projects.read`
   - `projects.write`
   - `webhooks.read`
   - `webhooks.write`
5. Copy the key and replace `cursor_key` in scripts

### Option B: Regenerate cursor_key
1. Delete existing cursor_key in console
2. Create new key with same name
3. Ensure ALL scopes are selected
4. Wait 5-10 minutes for propagation

## Testing the Webhook

### Test 1: Schema Change Detection
1. Make a minor schema change in Appwrite Console (add a test attribute)
2. Check if GitHub issue is created automatically
3. Monitor webhook logs in Appwrite Console

### Test 2: Webhook Endpoint
```bash
curl -X POST https://cfbfantasy.app/api/webhooks/appwrite/schema-drift \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b" \
  -d '{"event": "test"}'
```

## Verification Commands

### Check Webhook Status
```bash
# Via API (if permissions fixed)
curl -H "X-Appwrite-Key: YOUR_KEY" \
     -H "X-Appwrite-Project: college-football-fantasy-app" \
     https://nyc.cloud.appwrite.io/v1/projects/college-football-fantasy-app/webhooks

# Via Console
Go to Project Settings → Webhooks → View webhook logs
```

### Debug API Permissions
```bash
node scripts/debug-api-permissions.js
```

## Files Created/Modified
- `/scripts/create-webhook-cli.js` - CLI approach (requires proper auth)
- `/scripts/debug-api-permissions.js` - Permission debugging
- `/app/api/webhooks/appwrite/schema-drift/route.ts` - Webhook handler
- `/.github/workflows/schema-sync.yml` - GitHub Actions workflow

## Expected Behavior
Once webhook is active:
1. Any database schema changes in Appwrite Console trigger webhook
2. Webhook handler verifies signature and creates GitHub issue
3. GitHub Actions workflow runs to sync schema
4. Complete audit trail of all schema changes

## Troubleshooting
- **401 Unauthorized:** API key lacks project scope
- **Webhook not triggering:** Check URL is accessible from Appwrite servers  
- **GitHub issue not created:** Check webhook secret matches
- **Schema sync failing:** Check GitHub Actions secrets are configured