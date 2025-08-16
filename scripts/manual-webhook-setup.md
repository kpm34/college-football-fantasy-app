# Manual Appwrite Webhook Setup Guide

The API key doesn't have `projects.write` scope for webhook management (which is correct for security). Here's how to set up the webhook manually:

## 🔗 Step-by-Step Webhook Setup

### 1. Go to Appwrite Console
**URL**: https://cloud.appwrite.io/console/project-college-football-fantasy-app

### 2. Navigate to Webhooks
- Click on **"Settings"** in the left sidebar
- Click on **"Webhooks"** tab

### 3. Create New Webhook
Click **"Add Webhook"** and configure:

#### Basic Settings
- **Name**: `Schema Drift Detection`
- **Webhook ID**: `schema-drift-webhook` (auto-generated is fine)
- **URL**: `https://cfbfantasy.app/api/webhooks/appwrite/schema-drift`

#### Security Settings
- **Security**: ✅ **Enable**
- **HTTP Authentication**: Leave empty (we use signature verification)
- **Add Custom Header**:
  - **Key**: `X-Webhook-Secret`  
  - **Value**: `f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b`

#### Event Selection
Select these events to monitor database schema changes:

**Database Events:**
- ☑️ `databases.*.collections.*.create` - New collection created
- ☑️ `databases.*.collections.*.update` - Collection modified  
- ☑️ `databases.*.collections.*.delete` - Collection deleted

**Attribute Events:**
- ☑️ `databases.*.attributes.*.create` - New attribute added
- ☑️ `databases.*.attributes.*.update` - Attribute modified
- ☑️ `databases.*.attributes.*.delete` - Attribute deleted

**Index Events:**
- ☑️ `databases.*.indexes.*.create` - New index created
- ☑️ `databases.*.indexes.*.update` - Index modified
- ☑️ `databases.*.indexes.*.delete` - Index deleted

### 4. Save Webhook
Click **"Create"** to save the webhook.

## 🔑 Update Environment Variables

Add the webhook secret to your environment files:

### Local Environment (.env.local)
```bash
APPWRITE_WEBHOOK_SECRET=f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b
```

### GitHub Repository Secret
Go to: https://github.com/kmp34/college-football-fantasy-app/settings/secrets/actions

Add:
- **Name**: `APPWRITE_WEBHOOK_SECRET`
- **Value**: `f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b`

## 🧪 Test the Webhook

### Method 1: Console Change Test
1. Go to your database collections in Appwrite Console
2. Add a test attribute to any collection
3. Check if a GitHub issue is automatically created
4. Check webhook logs in Appwrite Console

### Method 2: Manual Test
Use our test script (after setup):
```bash
node scripts/test-webhook-endpoint.js
```

## 🔍 Webhook Verification

The webhook handler at `/api/webhooks/appwrite/schema-drift` will:

1. **Verify Signature**: Uses the webhook secret to verify authenticity
2. **Filter Events**: Only processes schema-related events
3. **Create GitHub Issue**: Automatically creates an issue for schema changes
4. **Log Activity**: Logs all webhook activity for debugging

## ✅ Success Indicators

**Webhook is working correctly when:**
- ✅ Webhook appears in Appwrite Console with "Active" status
- ✅ Making schema changes triggers the webhook
- ✅ GitHub issues are created automatically for schema changes
- ✅ No authentication errors in webhook logs

## 🚨 Troubleshooting

**Common Issues:**
- **401 Unauthorized**: Check webhook secret is set correctly
- **No GitHub Issues**: Verify GitHub token and repository settings
- **Webhook Not Triggered**: Check event selection includes schema events
- **SSL/TLS Errors**: Verify webhook URL is accessible from internet

**Debug Steps:**
1. Check Appwrite Console webhook logs
2. Check Vercel function logs for the webhook endpoint
3. Verify all environment variables are set
4. Test webhook endpoint manually with curl

## 🔄 Complete Sync System Status

After setup, you'll have:
- ✅ Manual Schema Sync Script
- ✅ GitHub Actions Automation  
- ✅ Real-time Webhook Notifications
- ✅ Automatic Issue Creation
- ✅ Complete Schema Drift Protection

Your Appwrite sync system will be fully operational!