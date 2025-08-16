# Environment & Collections Sync Guide

This guide explains how to keep your environment variables, Vercel configuration, and Appwrite collections in sync.

## 🔄 The Problem

Our app has multiple sources of truth for collection names and environment variables:
1. **Vercel Environment Variables** - Production/Preview/Development env vars
2. **Local .env files** - .env.local, .env.production, etc.
3. **Appwrite Collections** - Actual database collection names
4. **Code Constants** - COLLECTIONS object in lib/appwrite.ts

When these get out of sync, you'll see errors like:
- "Collection not found" (404 errors)
- "Unauthorized" (401 errors when collection names mismatch)
- Features working locally but not in production

## 🛠️ Available Commands

### 1. Check Current Status
```bash
npm run sync:env
```
This will:
- Pull current Vercel environment variables
- Check what collections exist in Appwrite
- Compare against expected configuration
- Report any mismatches

### 2. Auto-Fix Issues
```bash
npm run sync:env:fix
```
This will:
- Do everything the check does
- Automatically update Vercel env vars to match expected values
- You'll need to run `vercel env pull .env.local` after to update local

### 3. Validate Before Build
```bash
npm run validate:env
```
This is a lightweight check that:
- Validates all required env vars are present
- Checks collection mappings are correct
- Runs automatically before builds
- Generates/updates .env.example

### 4. Pull Latest from Vercel
```bash
vercel env pull .env.local
```
This pulls all environment variables from Vercel to your local .env.local file.

## 📋 Expected Collection Mappings

| Code Key | Environment Variable | Appwrite Collection |
|----------|---------------------|-------------------|
| LEAGUES | NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES | leagues |
| TEAMS | NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS | teams |
| ROSTERS | NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS | rosters |
| LINEUPS | NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS | lineups |
| GAMES | NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES | games |
| PLAYERS | NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS | college_players |
| RANKINGS | NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS | rankings |
| PLAYER_STATS | NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS | player_stats |
| USERS | NEXT_PUBLIC_APPWRITE_COLLECTION_USERS | users |
| AUCTIONS | NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS | auctions |
| BIDS | NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS | bids |

## 🚨 Common Issues & Solutions

### Issue: "Collection 'players' not found"
**Cause**: Code is using old collection name  
**Fix**: The correct collection is `college_players`, not `players`

### Issue: "401 Unauthorized" on API calls
**Cause**: Direct client-side Appwrite calls without proper permissions  
**Fix**: Use server-side API routes that handle auth properly

### Issue: Environment variables not updating
**Cause**: Vercel caches environment variables  
**Fix**: 
1. Run `npm run sync:env:fix`
2. Trigger a new deployment
3. Clear browser cache

## 🔧 Development Workflow

1. **Before starting work:**
   ```bash
   vercel env pull .env.local
   npm run sync:env
   ```

2. **After changing collections:**
   ```bash
   npm run sync:env:fix
   vercel env pull .env.local
   ```

3. **Before deploying:**
   ```bash
   npm run validate:env
   npm run build
   ```

## 📝 Adding New Collections

1. Add to `EXPECTED_COLLECTIONS` in `scripts/sync-env-and-collections.ts`
2. Add to `COLLECTION_MAPPINGS` in `scripts/validate-env-sync.ts`
3. Update `lib/appwrite.ts` COLLECTIONS object
4. Run `npm run sync:env:fix` to push to Vercel
5. Create the collection in Appwrite if needed

## 🚀 CI/CD Integration

The validation runs automatically:
- Before `npm run dev` (via predev hook)
- Before `npm run build` (via prebuild hook)
- In Vercel builds (part of build process)

This ensures mismatches are caught early and don't make it to production.

## 🔍 Debugging

If you're seeing collection-related errors:

1. **Check what Vercel has:**
   ```bash
   vercel env ls
   ```

2. **Check your local env:**
   ```bash
   cat .env.local | grep COLLECTION
   ```

3. **Run full sync check:**
   ```bash
   npm run sync:env
   ```

4. **Look at the actual API error:**
   - Check browser DevTools Network tab
   - Check Vercel Function logs: `vercel logs`
   - Check Appwrite dashboard for collection names

## 📚 Related Documentation

- [Appwrite Collections Setup](./APPWRITE_SCHEMA_UPDATE.md)
- [API Routes Documentation](./API_ROUTES.md)
- [Environment Variables Guide](./VERCEL_ENV_NEEDED.md)
