# Appwrite Access & Configuration Guide

## ✅ VERIFIED WORKING CONFIGURATION

Last verified: January 2025
Status: **FULLY OPERATIONAL** - All 29 collections accessible

## 🔑 Critical Configuration

### Environment Variables (.env.local)

```bash
# Server-side (Admin Access)
APPWRITE_API_KEY="your_api_key_here"  # Has ALL scopes enabled

# Client-side
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://nyc.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="college-football-fantasy-app"
NEXT_PUBLIC_APPWRITE_DATABASE_ID="college-football-fantasy"
```

### API Key Requirements

- ✅ Must have ALL scopes enabled in Appwrite Console
- ✅ Created with full admin permissions
- ✅ No expiration date set

## 📚 SDK Configuration (CORRECT METHOD)

### 1. Client Initialization Order (CRITICAL!)

```typescript
import { Client, Databases, Query } from 'node-appwrite'

const client = new Client()

// MUST be in this exact order:
client
  .setEndpoint(APPWRITE_ENDPOINT) // 1st
  .setProject(APPWRITE_PROJECT_ID) // 2nd
  .setKey(API_KEY) // 3rd

const databases = new Databases(client)
```

### 2. Pagination (REQUIRED for Collections)

```typescript
// Appwrite returns MAX 25 items per request
const limit = 25
let allCollections = []
let lastId = undefined
let hasMore = true

while (hasMore) {
  const queries = []
  if (lastId) {
    queries.push(Query.cursorAfter(lastId))
  }
  queries.push(Query.limit(limit))

  const response = await databases.listCollections(DATABASE_ID, queries)

  allCollections = [...allCollections, ...response.collections]

  if (response.collections.length > 0) {
    lastId = response.collections[response.collections.length - 1].$id
  }

  hasMore = response.collections.length === limit
}
```

## 🛠️ Available Tools & Scripts

### Primary Schema Fetch Tool (USE THIS!)

```bash
npx tsx scripts/fetch-appwrite-schema-sdk.ts
```

- ✅ Uses SDK with proper pagination
- ✅ Fetches ALL 29 collections
- ✅ Includes attributes and indexes
- ✅ Saves to `schema/sdk-appwrite-schema.json`

### CLI Alternative (Limited)

```bash
appwrite databases list-collections --database-id college-football-fantasy --json
```

- ⚠️ May not return all collections without proper setup
- ⚠️ Requires `appwrite login` first

## 📊 Current Schema Status

### Collections Count: 29

```
✅ activity_log
✅ rankings (AP Rankings)
✅ auctions
✅ bids
✅ clients
✅ college_players
✅ migrations
✅ draft_picks          # Was missing, now found!
✅ draft_states
✅ draft_events
✅ drafts
✅ fantasy_teams
✅ games
✅ invites
✅ league_memberships
✅ leagues
✅ lineups
✅ mascot_download_tasks  # New discovery
✅ mascot_jobs           # New discovery
✅ mascot_presets        # New discovery
✅ matchups
✅ meshy_jobs
✅ model_versions
✅ model_runs
✅ player_stats
✅ projections
✅ roster_slots
✅ schools
✅ transactions
```

## 🔍 Troubleshooting

### If SDK Returns 0 Collections:

1. **Check API Key**: Ensure ALL scopes are enabled
2. **Check Pagination**: Must use Query methods properly
3. **Check Client Init**: Must follow exact order (endpoint → project → key)
4. **Check Environment**: Verify .env.local is loaded

### If Specific Collection Missing:

1. **Check Permissions**: Collection may have restrictive permissions
2. **Check Pagination**: Collection might be on page 2+
3. **Use SDK Script**: `scripts/fetch-appwrite-schema-sdk.ts`

### Common Errors & Fixes:

```typescript
// ❌ WRONG - Missing pagination
const response = await databases.listCollections(DATABASE_ID)

// ✅ CORRECT - With pagination
const response = await databases.listCollections(DATABASE_ID, [
  Query.limit(25),
  Query.cursorAfter(lastId),
])
```

## 🚀 Quick Commands

### Verify Connection

```typescript
const db = await databases.get(DATABASE_ID)
console.log('Database:', db.name) // Should show: "College Football Fantasy Database"
```

### Get Collection Details

```typescript
const attrs = await databases.listAttributes(DATABASE_ID, collectionId)
const indexes = await databases.listIndexes(DATABASE_ID, collectionId)
```

### Create/Update Collections

```typescript
// Use schema files as source of truth
import { schemas } from './schema/schemas.registry'

// Sync to Appwrite
await databases.createCollection(DATABASE_ID, collectionId, name, permissions, documentSecurity)
```

## 📝 Important Files

- **Schema Fetch Script**: `/scripts/fetch-appwrite-schema-sdk.ts`
- **Generated Schema**: `/schema/sdk-appwrite-schema.json`
- **Type Definitions**: `/lib/appwrite-generated.ts`
- **Zod Schemas**: `/schema/zod-schema.ts`
- **Environment**: `/.env.local`

## ⚠️ Critical Notes

1. **ALWAYS use SDK script** for fetching schema (not CLI)
2. **ALWAYS paginate** when listing collections (max 25 per page)
3. **ALWAYS initialize client** in correct order
4. **NEVER assume** all collections fit in one request
5. **VERIFY pagination** works before assuming collections missing

## 🔄 Update Process

When schema changes:

1. Run: `npx tsx scripts/fetch-appwrite-schema-sdk.ts`
2. Review changes in `schema/sdk-appwrite-schema.json`
3. Update `schema/zod-schema.ts` if needed
4. Update `lib/appwrite-generated.ts` constants
5. Run type checking: `npm run typecheck`
6. Commit all changes

## 📞 Support

If issues persist after following this guide:

1. Check Appwrite Console for collection permissions
2. Verify API key has all scopes
3. Test with new API key if needed
4. Check Appwrite service status
5. Review error codes in SDK response

---

**Last Updated**: January 2025
**Status**: All systems operational
**Collections**: 29 found and accessible
