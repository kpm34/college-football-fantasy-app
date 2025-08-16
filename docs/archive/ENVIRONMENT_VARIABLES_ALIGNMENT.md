# 🔐 Environment Variables Alignment Guide

**Created**: August 14, 2025 3:30 PM  
**Purpose**: Ensure complete alignment between Vercel, Appwrite, and local development

## 🚨 Current Issues

1. **Missing Core Variables**: Key Appwrite variables not showing in Vercel env list
2. **Inconsistent Naming**: Mix of old and new naming conventions
3. **Security Risk**: Some API keys might be exposed client-side
4. **No Single Source of Truth**: Variables scattered across files

## 📋 Required Environment Variables

### Core Appwrite Configuration
```bash
# Server-side only (NEVER expose these)
APPWRITE_API_KEY=                    # Appwrite API key with full access
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
DATABASE_ID=college-football-fantasy

# Client-side (Safe to expose)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
```

### Collection IDs (All client-side safe)
```bash
# Core Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=college_players
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings

# Draft Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions
NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids

# Stats Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats
NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups
NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS=player_projections

# User Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log
```

### External API Keys
```bash
# CFBD API (College Football Data)
CFBD_API_KEY=                        # Server-side only
NEXT_PUBLIC_CFBD_API_KEY=            # REMOVE - should be server-side only!

# Rotowire (Web Scraping)
ROTOWIRE_USERNAME=
ROTOWIRE_PASSWORD_ENCRYPTED=
ROTOWIRE_ENCRYPTION_KEY=

# AI Services (Future)
CLAUDE_API_KEY=                      # Server-side only
OPENAI_API_KEY=                      # Server-side only
```

### Security & Operations
```bash
# Cron Jobs
CRON_SECRET=                         # For scheduled tasks

# Sentry
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=

# Vercel
EDGE_CONFIG=
VERCEL_URL=                          # Auto-set by Vercel
```

## 🔄 Verification Script

```typescript
// scripts/verify-env-alignment.ts
const requiredEnvVars = {
  server: [
    'APPWRITE_API_KEY',
    'APPWRITE_ENDPOINT',
    'APPWRITE_PROJECT_ID',
    'DATABASE_ID',
    'CFBD_API_KEY',
    'CRON_SECRET',
    'ROTOWIRE_USERNAME',
    'ROTOWIRE_PASSWORD_ENCRYPTED',
    'ROTOWIRE_ENCRYPTION_KEY'
  ],
  client: [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_USERS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG'
  ]
};

export function verifyEnvironment() {
  const missing: string[] = [];
  
  // Check server vars (only in server environment)
  if (typeof window === 'undefined') {
    requiredEnvVars.server.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
  }
  
  // Check client vars (always)
  requiredEnvVars.client.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}
```

## 🛠️ Setup Instructions

### 1. Create `.env.local` for Development
```bash
# Copy this to .env.local
# Get values from Vercel or team lead

# Server-side
APPWRITE_API_KEY=your_api_key_here
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
DATABASE_ID=college-football-fantasy

# Add all other variables...
```

### 2. Update Vercel Environment Variables
```bash
# Add missing core variables
vercel env add APPWRITE_API_KEY production
vercel env add NEXT_PUBLIC_APPWRITE_ENDPOINT production
vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID production
vercel env add NEXT_PUBLIC_APPWRITE_DATABASE_ID production

# Add collection IDs
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS production
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS production
# ... etc
```

### 3. Create Environment Type Definitions
```typescript
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server-side
      APPWRITE_API_KEY: string;
      APPWRITE_ENDPOINT: string;
      APPWRITE_PROJECT_ID: string;
      DATABASE_ID: string;
      CFBD_API_KEY: string;
      CRON_SECRET: string;
      
      // Client-side
      NEXT_PUBLIC_APPWRITE_ENDPOINT: string;
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: string;
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: string;
      
      // Collections
      NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES: string;
      NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS: string;
      NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS: string;
      // ... etc
    }
  }
}

export {};
```

## 🔒 Security Rules

### NEVER Expose These Client-Side
- `APPWRITE_API_KEY` - Full database access
- `CFBD_API_KEY` - Rate limited API
- `ROTOWIRE_*` - Paid service credentials
- `CRON_SECRET` - System access
- `*_ENCRYPTION_KEY` - Security keys

### Safe for Client-Side
- `NEXT_PUBLIC_*` prefixed variables
- Collection IDs
- Public endpoints
- Feature flags

## 🚀 Migration Plan

1. **Audit Current Usage**
   ```bash
   # Find all env var usage
   grep -r "process.env" . --include="*.ts" --include="*.tsx" | grep -v node_modules
   ```

2. **Update Code References**
   - Replace hardcoded values with env vars
   - Use consistent naming
   - Add type safety

3. **Sync with Vercel**
   - Add all missing variables
   - Remove deprecated ones
   - Ensure all environments match

4. **Test Everything**
   - Local development
   - Preview deployments
   - Production

## 📊 Validation Checklist

- [ ] All server-side vars in Vercel (Production)
- [ ] All client-side vars in Vercel (All environments)
- [ ] `.env.local` template created
- [ ] Type definitions added
- [ ] No API keys exposed client-side
- [ ] Build passes without warnings
- [ ] Runtime validation implemented
- [ ] Documentation updated

## 🔄 Regular Maintenance

### Weekly
- Review new variables added
- Check for exposed secrets
- Verify Vercel sync

### Monthly
- Rotate API keys
- Audit access logs
- Update documentation

### Quarterly
- Full security audit
- Performance review
- Cost optimization

---

*Proper environment variable management is critical for security and stability.*
