# 🚨 URGENT: Security Issues to Fix Immediately

## ⚠️ CRITICAL: Exposed API Keys in GitHub

### 1. **GitHub Actions File** - HIGH PRIORITY
**File**: `.github/workflows/projection-updater.yml`

**Exposed Secrets**:
- `CFBD_API_KEY`: YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz
- `APPWRITE_API_KEY`: standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b
- `APPWRITE_ENDPOINT`: https://nyc.cloud.appwrite.io/v1
- `APPWRITE_PROJECT_ID`: college-football-fantasy-app

### 🔥 IMMEDIATE ACTIONS REQUIRED:

#### Step 1: Rotate Compromised Keys (DO THIS NOW!)
```bash
# 1. Go to Appwrite Console
# 2. Project Settings → API Keys
# 3. Delete the exposed key
# 4. Create new API key with same permissions
# 5. Update all environments with new key
```

#### Step 2: Add Secrets to GitHub (5 minutes)
```bash
# In your repository:
# 1. Go to Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Add each secret:

Name: CFBD_API_KEY
Value: [your-new-key]

Name: APPWRITE_API_KEY
Value: [your-new-appwrite-key]

Name: APPWRITE_ENDPOINT
Value: https://nyc.cloud.appwrite.io/v1

Name: APPWRITE_PROJECT_ID
Value: college-football-fantasy-app
```

#### Step 3: Update GitHub Actions File
```yaml
# .github/workflows/projection-updater.yml
name: Weekly Projection Updater

on:
  schedule:
    - cron: '0 5,17 * * *'
  workflow_dispatch:

jobs:
  update-projections:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install node-appwrite
        
    - name: Run projection updater
      env:
        CFBD_API_KEY: ${{ secrets.CFBD_API_KEY }}
        ODDS_API_KEY: ${{ secrets.ODDS_API_KEY }}
        ROTOWIRE_API_KEY: ${{ secrets.ROTOWIRE_API_KEY }}
        APPWRITE_ENDPOINT: ${{ secrets.APPWRITE_ENDPOINT }}
        APPWRITE_PROJECT_ID: ${{ secrets.APPWRITE_PROJECT_ID }}
        APPWRITE_API_KEY: ${{ secrets.APPWRITE_API_KEY }}
      run: |
        echo "🏈 Weekly Projection Update System"
        echo "📊 Running projection updates..."
        # Your update scripts here
```

#### Step 4: Commit and Push Fix
```bash
git add .github/workflows/projection-updater.yml
git commit -m "fix: remove exposed API keys from GitHub Actions"
git push origin main
```

## 🔐 Additional Security Improvements

### 1. Create Scoped API Keys
Instead of using the master API key everywhere:

```typescript
// Bad: Master key with all permissions
const MASTER_KEY = "standard_c63261941dc9..."

// Good: Scoped keys for specific tasks
const DATA_SYNC_KEY = "standard_sync_..." // Only database read/write
const AUTH_KEY = "standard_auth_..." // Only auth operations
const STORAGE_KEY = "standard_storage_..." // Only storage access
```

**How to create scoped keys**:
1. Appwrite Console → API Keys
2. Create Key → Select specific scopes needed
3. Name appropriately (e.g., "GitHub Actions Sync")

### 2. Implement API Key Rotation
```javascript
// scripts/rotate-api-keys.js
const rotateApiKeys = async () => {
  // 1. Create new API key
  const newKey = await projects.createKey(
    projectId,
    'Rotated Key ' + new Date().toISOString(),
    ['databases.read', 'databases.write'],
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  );

  // 2. Update all services with new key
  await updateVercelEnv('APPWRITE_API_KEY', newKey.secret);
  await updateGitHubSecret('APPWRITE_API_KEY', newKey.secret);

  // 3. Delete old key after confirming everything works
  await projects.deleteKey(projectId, oldKeyId);
};
```

### 3. Environment-Specific Keys
```bash
# Development (limited permissions)
APPWRITE_API_KEY_DEV=standard_dev_...

# Production (production permissions)
APPWRITE_API_KEY_PROD=standard_prod_...

# CI/CD (only what GitHub Actions needs)
APPWRITE_API_KEY_CI=standard_ci_...
```

### 4. Add Security Headers
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://nyc.cloud.appwrite.io; connect-src 'self' https://nyc.cloud.appwrite.io wss://nyc.cloud.appwrite.io"
  );
  
  return response;
}
```

### 5. Implement Rate Limiting
```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function rateLimitMiddleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    });
  }
}
```

### 6. Enable Two-Factor Authentication
```typescript
// app/api/auth/enable-2fa/route.ts
export async function POST(request: Request) {
  const account = new Account(client);
  
  // Generate authenticator
  const result = await account.createMfaAuthenticator(
    AppwriteAuthenticatorType.Totp
  );
  
  // Return QR code for user to scan
  return Response.json({
    qrCode: `otpauth://totp/CFB%20Fantasy:${user.email}?secret=${result.secret}&issuer=CFB%20Fantasy`,
    secret: result.secret
  });
}
```

## 📋 Security Checklist

### Immediate (Today):
- [ ] Rotate all exposed API keys
- [ ] Add secrets to GitHub repository settings
- [ ] Update GitHub Actions to use secrets
- [ ] Push fixed workflow file

### This Week:
- [ ] Create scoped API keys for different services
- [ ] Implement environment-specific keys
- [ ] Add security headers to middleware
- [ ] Enable rate limiting on API routes

### This Month:
- [ ] Set up API key rotation schedule
- [ ] Implement 2FA for user accounts
- [ ] Add monitoring for suspicious activity
- [ ] Security audit of all endpoints

## 🔍 Monitoring & Alerts

### Set Up Key Usage Monitoring
```javascript
// Monitor API key usage in Appwrite Console
// Project Settings → API Keys → View Usage

// Set up alerts for unusual activity
const checkKeyUsage = async () => {
  const usage = await getKeyUsage(keyId);
  
  if (usage.requests > 10000) {
    await sendAlert('High API key usage detected');
  }
  
  if (usage.errors > 100) {
    await sendAlert('High error rate on API key');
  }
};
```

## 🚀 Quick Security Wins

1. **Enable Appwrite's Built-in Security**:
   ```javascript
   // Enable brute force protection
   await projects.updateAuthDuration(projectId, 900); // 15 min sessions
   await projects.updateAuthLimit(projectId, 10); // Max 10 sessions per user
   ```

2. **Add CAPTCHA to Public Forms**:
   ```typescript
   // Use Appwrite's built-in CAPTCHA
   const response = await account.createVerification(
     'https://your-app.com/verify'
   );
   ```

3. **Implement Session Management**:
   ```typescript
   // Auto-logout after inactivity
   const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes
   
   let logoutTimer;
   const resetLogoutTimer = () => {
     clearTimeout(logoutTimer);
     logoutTimer = setTimeout(() => {
       account.deleteSession('current');
       router.push('/login');
     }, AUTO_LOGOUT_TIME);
   };
   ```

## 📞 Need Help?

If you need assistance with any of these security improvements:
1. Check [Appwrite Security Docs](https://appwrite.io/docs/advanced/security)
2. Contact Appwrite support for key rotation help
3. Use GitHub's security features for secret scanning

**Remember**: Security is not optional - it's essential for protecting your users' data! 🔒
