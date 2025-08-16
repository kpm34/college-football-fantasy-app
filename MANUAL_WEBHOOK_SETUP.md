# Manual Webhook Setup - Step by Step

## ✅ Prerequisites Complete
- Webhook endpoint is working: `https://cfbfantasy.app/api/webhooks/appwrite/schema-drift`
- Webhook secret added to environment: `APPWRITE_WEBHOOK_SECRET`
- GitHub Actions workflow ready
- Schema sync scripts ready

## 🚀 Quick Manual Setup

### Step 1: Open Appwrite Console
**Click here:** [Appwrite Console - College Football Fantasy Project](https://cloud.appwrite.io/console/project-college-football-fantasy-app)

### Step 2: Navigate to Webhooks
1. In the left sidebar, click **"Project Settings"** (gear icon)
2. Click **"Webhooks"** 
3. Click **"Create Webhook"** button

### Step 3: Configure Webhook
**Copy and paste these exact values:**

**Name:** 
```
Schema Drift Detection
```

**URL:**
```
https://cfbfantasy.app/api/webhooks/appwrite/schema-drift
```

**Events** (select all of these):
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

**Security:**
- ✅ **Enable HTTPS verification** (checked)

**HTTP Headers:**
- **Key:** `X-Webhook-Secret`
- **Value:** `f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b`

### Step 4: Save Webhook
Click **"Create"** or **"Save"** button

## 🧪 Test the Webhook

### Test 1: Manual Test (Immediate)
1. In Appwrite Console, go to **Database** → **college-football-fantasy**
2. Click on any collection (e.g., "teams")
3. Click **"Settings"** → **"Attributes"**  
4. Add a test attribute:
   - **Key:** `test_field`
   - **Type:** `string`
   - **Size:** `50`
   - **Required:** `false`
5. Click **"Create"**

**Expected Result:** 
- GitHub issue should be created automatically within 30 seconds
- Check: [GitHub Issues](https://github.com/kpm34/college-football-fantasy-app/issues)

### Test 2: Command Line Test
```bash
curl -X POST https://cfbfantasy.app/api/webhooks/appwrite/schema-drift \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b" \
  -d '{
    "events": ["databases.college-football-fantasy.collections.teams.attributes.test_field.create"],
    "data": {"message": "Manual webhook test"}
  }'
```

**Expected Response:**
```json
{"success": true, "issueUrl": "https://github.com/kpm34/..."}
```

## 🔍 Verification

### Check Webhook is Active
1. In Appwrite Console → **Project Settings** → **Webhooks**
2. You should see: **"Schema Drift Detection"** with status **Active**
3. Click on it to view logs and recent deliveries

### Monitor GitHub Issues
- **URL:** https://github.com/kpm34/college-football-fantasy-app/issues
- **Look for:** Issues with title "Schema Drift Detected"
- **Auto-created by:** Appwrite webhook system

### Check GitHub Actions
- **URL:** https://github.com/kpm34/college-football-fantasy-app/actions
- **Look for:** "Schema Sync" workflow runs
- **Triggered by:** GitHub issues created by webhook

## ⚡ Complete System Flow

```
Appwrite Console Change 
    ↓
Webhook Triggers 
    ↓
Creates GitHub Issue 
    ↓
GitHub Actions Runs 
    ↓
Schema Sync Complete
```

## 🚨 Troubleshooting

### Webhook Not Triggering
- **Check:** URL is exactly `https://cfbfantasy.app/api/webhooks/appwrite/schema-drift`
- **Check:** Events are selected (especially `databases.*` events)
- **Check:** HTTPS verification is enabled

### GitHub Issue Not Created  
- **Check:** `X-Webhook-Secret` header is exactly: `f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b`
- **Check:** GitHub secrets are configured in repository settings
- **Check:** Webhook logs in Appwrite Console for error messages

### Schema Sync Not Running
- **Check:** GitHub Actions secrets: `APPWRITE_API_KEY`, `APPWRITE_PROJECT_ID`, `APPWRITE_ENDPOINT`
- **Check:** `.github/workflows/schema-sync.yml` file exists
- **Check:** Repository has Actions enabled

---

**Ready?** Click the Appwrite Console link above and follow Step 2! 🚀