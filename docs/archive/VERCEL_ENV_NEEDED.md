# Additional Vercel Environment Variables Needed

We've successfully added:
- ✅ ROTOWIRE_USERNAME
- ✅ ROTOWIRE_PASSWORD_ENCRYPTED
- ✅ ROTOWIRE_ENCRYPTION_KEY
- ✅ CRON_SECRET

## Still Need to Add:

### 1. CFBD_API_KEY
The College Football Data API key (server-side version)

**Value from old workflow**: `YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz`

**To add**: 
```bash
echo "YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz" | vercel env add CFBD_API_KEY production
```

### 2. APPWRITE_API_KEY
Your Appwrite server-side API key with full permissions.

**To get this**:
1. Go to your Appwrite Console
2. Navigate to Settings → API Keys
3. Create a new API key with all scopes
4. Copy the key

**To add**:
```bash
echo "YOUR_APPWRITE_API_KEY" | vercel env add APPWRITE_API_KEY production
```

### 3. Additional Appwrite Variables (if not already set)
```bash
echo "https://nyc.cloud.appwrite.io/v1" | vercel env add APPWRITE_ENDPOINT production
echo "college-football-fantasy-app" | vercel env add APPWRITE_PROJECT_ID production
echo "college-football-fantasy" | vercel env add APPWRITE_DATABASE_ID production
```
