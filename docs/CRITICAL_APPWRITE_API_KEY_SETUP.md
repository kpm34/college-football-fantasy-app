# 🚨 CRITICAL: Appwrite API Key Setup Required

**⚠️ YOUR APP WILL NOT WORK WITHOUT THIS ⚠️**

## The Problem

The `APPWRITE_API_KEY` is not set in Vercel, which means:
- ❌ Server-side database operations will fail
- ❌ Admin functions won't work
- ❌ Data sync scripts will fail
- ❌ Cron jobs can't run

## Immediate Action Required

### Step 1: Get Your Appwrite API Key

1. Log into Appwrite Console: https://cloud.appwrite.io
2. Navigate to your project: `college-football-fantasy-app`
3. Go to **Settings** → **API Keys**
4. Create a new API key with these scopes:
   - ✅ Database: Read, Write, Delete
   - ✅ Storage: Read, Write, Delete
   - ✅ Functions: Read, Execute
   - ✅ Users: Read, Write
   - ✅ Teams: Read, Write
   - ✅ Messaging: Read, Write
5. Copy the generated API key

### Step 2: Add to Vercel

Run this command and paste your API key when prompted:
```bash
vercel env add APPWRITE_API_KEY production
```

When prompted:
- Paste your API key
- Press Enter
- Confirm with 'y'

### Step 3: Add to Local Development

1. Create `.env.local` file:
```bash
cp .env.local.template .env.local
```

2. Edit `.env.local` and replace `REPLACE_ME` with your API key:
```env
APPWRITE_API_KEY=your-actual-api-key-here
```

### Step 4: Verify Setup

1. Pull latest environment variables:
```bash
vercel pull --yes
```

2. Test the connection:
```bash
npm run test:appwrite-connection
```

## Security Guidelines

### DO:
- ✅ Keep the API key in Vercel environment variables
- ✅ Use `.env.local` for local development only
- ✅ Rotate the key every 90 days
- ✅ Use different keys for dev/staging/production

### DON'T:
- ❌ Commit the API key to git
- ❌ Share the key in Slack/Discord
- ❌ Use the key in client-side code
- ❌ Log the key value

## Troubleshooting

### If you see "401 Unauthorized" errors:
1. Check if the API key is set: `vercel env ls | grep APPWRITE_API_KEY`
2. Verify the key has correct permissions in Appwrite
3. Ensure you're using the server-side client

### If local development fails:
1. Check `.env.local` exists and has the key
2. Restart your development server
3. Clear Next.js cache: `rm -rf .next`

## Next Steps After Setup

1. **Test server operations**:
```bash
curl http://localhost:3001/api/health
```

2. **Run data sync**:
```bash
npm run sync-data
```

3. **Deploy to verify production**:
```bash
vercel --prod
```

---

**🔴 STOP: Do not proceed with development until this is complete!**
