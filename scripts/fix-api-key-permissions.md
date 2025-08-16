# Fix Appwrite API Key Permissions for Webhook Management

## 🔍 Current Issue
The API key has role `applications` with database scopes only:
- ✅ Has: Database read/write permissions  
- ❌ Missing: `projects.read` and `projects.write` scopes
- ❌ Cannot: Create/manage webhooks

## 🔧 Solution: Update API Key Permissions

### 1. Go to Appwrite Console API Keys
**URL**: https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/keys

### 2. Find Your Current API Key
Look for the API key starting with `standard_c63261941dc...`

### 3. Edit Key Permissions
Click **"Edit"** on your API key and ensure these scopes are enabled:

#### ✅ Required Database Scopes (already have)
- `databases.read`
- `databases.write`
- `collections.read`
- `collections.write`
- `attributes.read` 
- `attributes.write`
- `documents.read`
- `documents.write`
- `indexes.read`
- `indexes.write`

#### ✅ Required Project Scopes (need to add)
- `projects.read` - To list existing webhooks
- `projects.write` - To create/update/delete webhooks

### 4. Save Changes
Click **"Update"** to save the new permissions.

## 🧪 Test the Updated Permissions

After updating, test webhook creation:

```bash
node scripts/create-webhook-clean.js
```

**Expected Success Output:**
```
✅ Webhook created successfully!
📋 Webhook ID: schema-drift-webhook
🔗 URL: https://cfbfantasy.app/api/webhooks/appwrite/schema-drift
📡 Events: 9 configured
🔒 Security: Enabled
```

## 🔄 Alternative: Create New API Key

If you prefer to create a separate API key for webhook management:

### 1. Create New Key
- Name: `Webhook Management Key`
- Scopes: `projects.read`, `projects.write`

### 2. Update Environment
```bash
# Option A: Replace existing key
APPWRITE_API_KEY=new_webhook_management_key

# Option B: Add separate webhook key
APPWRITE_WEBHOOK_API_KEY=new_webhook_management_key
```

### 3. Update Scripts
Modify webhook scripts to use the new key if using option B.

## 🔒 Security Best Practices

**Recommended Approach:**
- Use the **same API key** with additional project scopes
- This maintains consistency across all operations
- Easier to manage single key with necessary permissions

**Why Project Scopes Are Safe:**
- Webhook management is an administrative function
- Only allows webhook CRUD operations, not data access
- Still restricted to your specific project
- Follows principle of least privilege for automation needs

## ✅ Verification Steps

After updating permissions:

1. **Test Webhook Creation**: `node scripts/create-webhook-clean.js`
2. **Verify in Console**: Check webhooks appear in Appwrite Console  
3. **Test Schema Sync**: Make a schema change and verify webhook triggers
4. **Check GitHub Issues**: Verify automatic issue creation works

Your complete sync system will then be fully operational!