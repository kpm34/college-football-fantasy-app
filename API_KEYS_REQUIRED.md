# 🔑 Required API Keys for Full Pipeline Activation

## Critical Keys (Required for Pipeline)

### 1. **APPWRITE_API_KEY** ⚠️ MOST IMPORTANT
- **Purpose**: Server-side Appwrite operations (database read/write)
- **Where to get**: Appwrite Console → Your Project → Settings → API Keys
- **How to create**:
  1. Go to https://cloud.appwrite.io
  2. Open your project (college-football-fantasy-app)
  3. Navigate to Settings → API Keys
  4. Create a new API key with these scopes:
     - `databases.read`
     - `databases.write`
     - `users.read`
- **Add to**: `.env.local` or `.env`
```bash
APPWRITE_API_KEY=your-api-key-here
```

### 2. **CFBD_API_KEY** 
- **Purpose**: College Football Data API for player stats and game data
- **Where to get**: https://collegefootballdata.com/key
- **How to create**:
  1. Go to https://collegefootballdata.com/key
  2. Register for free account
  3. Request API key (usually instant)
- **Add to**: `.env.local`
```bash
CFBD_API_KEY=your-cfbd-key-here
```

### 3. **CRON_SECRET**
- **Purpose**: Secure cron jobs and scheduled tasks
- **Where to get**: Generate your own secure random string
- **How to create**:
```bash
# Generate a secure random string
openssl rand -base64 32
```
- **Add to**: `.env.local`
```bash
CRON_SECRET=your-generated-secret-here
```

## Optional Keys (For Enhanced Features)

### 4. **ROTOWIRE_API_KEY** (Optional)
- **Purpose**: Player news and injury updates
- **Where to get**: https://www.rotowire.com (requires subscription)
- **Add to**: `.env.local`
```bash
ROTOWIRE_USERNAME=your-username
ROTOWIRE_PASSWORD_ENCRYPTED=encrypted-password
ROTOWIRE_ENCRYPTION_KEY=your-encryption-key
```

### 5. **KV_REST_API_URL** & **KV_REST_API_TOKEN** (Optional)
- **Purpose**: Vercel KV for caching and performance
- **Where to get**: Vercel Dashboard → Storage → Create KV Database
- **Add to**: `.env.local`
```bash
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

### 6. **AI_GATEWAY_API_KEY** (Optional)
- **Purpose**: AI-powered projections and insights
- **Where to get**: Your AI provider (OpenAI, Anthropic, etc.)
- **Add to**: `.env.local`
```bash
AI_GATEWAY_API_KEY=your-ai-key
```

## Quick Setup Steps

1. **Create `.env.local` file** (if it doesn't exist):
```bash
touch .env.local
```

2. **Add the minimum required keys**:
```bash
# Required for pipeline
APPWRITE_API_KEY=your-appwrite-api-key
CFBD_API_KEY=your-cfbd-api-key
CRON_SECRET=your-generated-secret

# These are already set (keep them)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
```

3. **Test the configuration**:
```bash
# Test if keys are loaded
npx tsx -e "console.log('API Key:', process.env.APPWRITE_API_KEY ? '✅ Set' : '❌ Missing')"

# Test pipeline with keys
npx tsx scripts/run-data-ingestion.ts --season 2025 --week 1 --dry-run
```

## Current Status Without Keys

### ✅ What Works Now:
- Draft UI displays projections (calculated on-demand)
- Depth chart multipliers apply correctly
- Manual depth chart data loads from local files

### ❌ What Doesn't Work:
- Cannot write to Appwrite collections
- Cannot fetch live player data from CFBD
- Cannot run automated updates
- Cannot populate projection collections

## Priority Order

1. **APPWRITE_API_KEY** - Enables database operations (MOST CRITICAL)
2. **CFBD_API_KEY** - Enables live data updates
3. **CRON_SECRET** - Enables scheduled automation
4. Others are optional enhancements

---

Once you add **APPWRITE_API_KEY**, you can immediately run:
```bash
npx tsx scripts/activate-pipeline-simple.ts
```

This will populate your projections collections and complete the pipeline activation! 🚀
