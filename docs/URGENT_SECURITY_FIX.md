# 🚨 URGENT: Security Fix Required

## Critical Issue: Exposed API Keys in GitHub Workflow

### What Happened
API keys are hardcoded in `.github/workflows/projection-updater.yml`:
- **Appwrite API Key** (ending in ...3db8186b)
- **CFBD API Key** 
- **Appwrite Endpoint & Project ID**

Even though your repo is private, this is a critical security vulnerability.

## 🔥 Immediate Actions Required

### 1. Rotate the Appwrite API Key (DO THIS NOW!)

```bash
# Run the rotation script for instructions
node scripts/rotate-appwrite-key.js
```

**Manual Steps:**
1. Log into [Appwrite Console](https://cloud.appwrite.io)
2. Navigate to your project → Settings → API Keys
3. **DELETE** the exposed key
4. Create a NEW API key with same permissions
5. Update all environments with new key

### 2. Add Secrets to GitHub (with 2FA)

Since you have 2FA enabled:

1. Go to your repo settings:
   ```
   https://github.com/[YOUR_USERNAME]/college-football-fantasy-app/settings/secrets/actions
   ```

2. Authenticate with your 2FA method

3. Click "New repository secret" and add:

   | Secret Name | Secret Value |
   |------------|--------------|
   | `APPWRITE_API_KEY` | [Your NEW API key] |
   | `APPWRITE_ENDPOINT` | `https://nyc.cloud.appwrite.io/v1` |
   | `APPWRITE_PROJECT_ID` | `college-football-fantasy-app` |
   | `CFBD_API_KEY` | [Move the exposed CFBD key here] |

### 3. Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings/environment-variables)
2. Update `APPWRITE_API_KEY` with the new key
3. Redeploy to apply changes

### 4. Replace the Workflow File

```bash
# Delete the exposed workflow
rm .github/workflows/projection-updater.yml

# Use the secure version
mv .github/workflows/projection-updater-SECURE.yml .github/workflows/projection-updater.yml

# Commit the fix
git add .github/workflows/projection-updater.yml
git commit -m "fix: remove exposed API keys from workflow"
git push
```

## 🔍 Verify Security

### Check Appwrite Access Logs
1. Log into Appwrite Console
2. Go to your project → Activity
3. Look for any suspicious API usage
4. Check geographic locations of requests

### Monitor GitHub Security Tab
1. Go to repo → Security tab
2. Check for any security alerts
3. Enable Dependabot if not already

## 🛡️ Prevention Going Forward

### Never Commit Secrets
```bash
# Add to .gitignore
.env
.env.local
.env.production
*.key
*.pem
```

### Use Pre-commit Hooks
```bash
# Install detect-secrets
pip install detect-secrets

# Create baseline
detect-secrets scan > .secrets.baseline

# Add pre-commit hook
detect-secrets-hook --baseline .secrets.baseline
```

### Environment Variable Best Practices

**DO:**
```javascript
// Use environment variables
const apiKey = process.env.APPWRITE_API_KEY;
```

**DON'T:**
```javascript
// Never hardcode
const apiKey = "standard_c63261941dc9ffcd31b7...";
```

### GitHub Actions Best Practices

**DO:**
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

**DON'T:**
```yaml
env:
  API_KEY: "actual-key-value-here"
```

## 📋 Checklist

- [ ] Rotate Appwrite API key
- [ ] Add secrets to GitHub (with 2FA)
- [ ] Update Vercel env vars
- [ ] Replace workflow file
- [ ] Commit and push fixes
- [ ] Check access logs
- [ ] Set up monitoring

## 🚦 Security Status

Once all steps are complete:
- ✅ No exposed keys in code
- ✅ All secrets in GitHub Secrets
- ✅ 2FA protecting GitHub account
- ✅ Private repository
- ✅ Secure CI/CD pipeline

## 📞 If You Suspect Breach

1. **Immediately revoke all API keys**
2. **Check Appwrite audit logs**
3. **Review all recent commits**
4. **Enable additional security alerts**
5. **Consider rotating all credentials**

---

**Remember:** Even with a private repo and 2FA, exposed API keys are a critical vulnerability. Fix this immediately!
