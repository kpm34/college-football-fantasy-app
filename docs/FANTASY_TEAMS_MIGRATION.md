# Fantasy Teams Collection Migration Summary

## Overview
Updated the Single Source of Truth (SSOT) and all related files to consistently use `fantasy_teams` as the collection name instead of the previous `user_teams` or `rosters` naming.

## Changes Made

### 1. Schema Updates (schema/zod-schema.ts)
- ✅ Renamed `Rosters` schema to `FantasyTeams`
- ✅ Updated type export from `Roster` to `FantasyTeam`
- ✅ Collection registry already uses `FANTASY_TEAMS: 'fantasy_teams'`
- ✅ Schema registry updated to map `FANTASY_TEAMS` to `FantasyTeams` schema

### 2. Library File Updates

#### lib/config/environment.ts
- ✅ Changed `userTeams` to `fantasyTeams` in collections config
- ✅ Environment variable now looks for `NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS`

#### lib/appwrite.ts
- ✅ Updated COLLECTIONS aliases:
  - `ROSTERS` → points to `fantasyTeams` (deprecated alias)
  - `USER_TEAMS` → points to `fantasyTeams` (deprecated alias)
  - `FANTASY_TEAMS` → points to `fantasyTeams` (primary)

#### lib/appwrite-generated.ts
- ✅ Changed `USER_TEAMS` to `FANTASY_TEAMS` in COLLECTIONS export
- ✅ Updated metadata from `user_teams` to `fantasy_teams`

#### lib/appwrite-server.ts
- ✅ Updated metadata from `user_teams` to `fantasy_teams`

#### lib/types/generated.ts
- ✅ Changed `USER_TEAMS` to `FANTASY_TEAMS` in COLLECTIONS export

### 3. API Routes
All API routes already using `COLLECTIONS.FANTASY_TEAMS`:
- ✅ app/api/(frontend)/drafts/[id]/data/route.ts
- ✅ app/api/(frontend)/draft/complete/route.ts
- ✅ app/api/(backend)/admin/leagues/sync-members/route.ts
- ✅ app/api/(backend)/migrations/standardize-auth-ids/route.ts

### 4. Environment Variables
Need to add to .env.local:
```env
NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS="fantasy_teams"
```

## Collection Structure
The `fantasy_teams` collection stores each user's fantasy team roster within a league:

```typescript
{
  leagueId: string,           // Reference to the league
  ownerAuthUserId: string,    // User who owns this team
  name: string,               // Team name
  players: string,            // JSON array of player IDs
  draftResults: string,       // JSON array of draft pick details
  wins: number,
  losses: number,
  // ... other team stats
}
```

## Draft Flow Integration
When a draft completes:
1. All draft picks from `draft_picks` collection are grouped by owner
2. Each owner's `fantasy_teams` document is updated with their drafted players
3. Players are stored as JSON arrays for the entire season
4. League status changes from 'drafting' to 'active'

## Backwards Compatibility
- Kept deprecated aliases (`ROSTERS`, `USER_TEAMS`) for backwards compatibility
- These aliases point to the same `fantasy_teams` collection
- New code should use `COLLECTIONS.FANTASY_TEAMS`

## Testing
Created verification script: `scripts/verify-fantasy-teams-collection.ts`

## Migration Status
✅ **COMPLETE** - All files updated to use `fantasy_teams` consistently in the SSOT.

## Next Steps
1. Run `npm run generate:all` to regenerate type definitions
2. Update .env.local with `NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS`
3. Verify Appwrite database has `fantasy_teams` collection (not `user_teams`)
4. Deploy changes to production
