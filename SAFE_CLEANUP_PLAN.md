# Safe Database Cleanup Plan

## 🚨 Critical Finding: Active Usage Detected

Based on codebase analysis, several collections marked for cleanup are **ACTIVELY BEING USED**:

### ⚠️ HIGH RISK - Requires Code Updates First
1. **`auction_sessions`** → Should be `auctions`
   - Used in: `app/auction/[leagueId]/page.tsx` (4 references)
   - Environment: `NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions`
   - **Action**: Create `auctions` collection, migrate data, update code

2. **`auction_bids`** → Should be `bids` 
   - Used in: `app/auction/[leagueId]/page.tsx` (2 references)
   - **Action**: Create `bids` collection, migrate data, update code

3. **`user_teams`** → Should be `rosters`
   - Used in: `lib/config/appwrite.config.ts`
   - Environment: Has `USER_TEAMS` reference
   - **Action**: Update config to use `rosters` only

### ✅ SAFE TO CLEANUP (No Active Usage)
- `players` collection (code uses `college_players`)
- `drafts`, `draft_picks`, `transactions`, `scoring` (legacy collections)

## 🛡️ Safety-First Approach

### Phase 1: Code Updates (Zero Risk)
```bash
# Update all code references to use modern collection names
node scripts/safe-database-migration.js --dry-run  # Preview changes
node scripts/safe-database-migration.js --execute  # Apply safely
```

**What this does:**
1. **Updates code first** - Changes all `COLLECTIONS.AUCTION_SESSIONS` → `COLLECTIONS.AUCTIONS`
2. **Creates missing collections** - `auctions`, `bids`, `lineups` with proper schema
3. **Adds missing attributes** - Essential fields for data integrity
4. **Creates performance indexes** - Improves query speed
5. **Migrates data safely** - Copies data from old to new collections

### Phase 2: Verification (Critical)
```bash
# Test all functionality
npm run dev
# Check auction pages: /auction/[leagueId]
# Check league creation: /league/create  
# Check roster management
```

### Phase 3: Archive Legacy (After Testing)
```bash
# Only after confirming everything works
node scripts/archive-legacy-collections.js --execute
```

## 🎯 What Gets Updated Automatically

### Code Files Updated:
- `app/auction/**/*.tsx` - Auction components
- `app/api/**/*.ts` - API routes  
- `lib/config/appwrite.config.ts` - Collection configuration
- Environment variable references

### Database Changes:
- **Created**: `auctions`, `bids`, `lineups` collections
- **Enhanced**: Added missing attributes to existing collections
- **Optimized**: Performance indexes for common queries
- **Migrated**: Data from `auction_sessions` → `auctions`, `auction_bids` → `bids`

### What's NOT Changed (Safe):
- Existing `college_players`, `rosters`, `leagues`, `games` collections
- User data and league data remain untouched
- No data loss - old collections archived, not deleted

## ⚡ Zero Downtime Migration

The script ensures zero downtime by:
1. **Code first, database second** - Updates references before changing schema
2. **Additive operations** - Creates new collections without touching existing ones  
3. **Safe data migration** - Copies data without deleting originals
4. **Rollback capability** - Original collections kept until verification complete

## 🧪 Testing Checklist

After running the migration, test:

- [ ] **Auction functionality**: Create/join auctions, place bids
- [ ] **League management**: Create leagues, invite users, manage rosters  
- [ ] **Draft system**: Snake draft and auction draft
- [ ] **Player data**: Search, filter, view player details
- [ ] **Scoring**: Weekly lineup management and scoring
- [ ] **API endpoints**: All `/api/` routes respond correctly

## 🚀 Execution Command

**For immediate cleanup (recommended):**
```bash
# Safe migration - updates code and database together
node scripts/safe-database-migration.js --execute
```

**For testing only:**
```bash  
# Preview all changes without executing
node scripts/safe-database-migration.js --dry-run
```

## ✅ Benefits After Cleanup

### Immediate Benefits:
- **Consistent naming** - All collections follow modern naming conventions
- **Better performance** - New indexes speed up common queries  
- **Complete functionality** - Missing collections (auctions, bids, lineups) now available
- **Data integrity** - All collections have required attributes

### Long-term Benefits:
- **Easier maintenance** - Single source of truth for each data type
- **Faster development** - No confusion about which collection to use
- **Better scalability** - Optimized schema for growth
- **Reduced technical debt** - No duplicate or legacy functionality

---

## 🎯 Execute Now

The safe migration script addresses your exact concerns:
- ✅ **No functionality broken** - Code updated before database changes
- ✅ **No data loss** - Migration preserves all existing data  
- ✅ **Zero downtime** - Application continues working throughout
- ✅ **Complete project update** - All references updated to modern schema

**Ready to execute:**
```bash
node scripts/safe-database-migration.js --execute
```