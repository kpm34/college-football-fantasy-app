# College Football Fantasy App - API Routes Documentation

## Overview
Complete documentation of all API routes, their functions, required permissions, and database operations.

## Authentication Routes

### POST `/api/auth/signup`
**Description**: Create new user account  
**Auth Required**: No  
**Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```
**Database Operations**:
- Creates document in `users` collection
- Creates Appwrite auth account
**Returns**: User object with session

---

### POST `/api/auth/login`
**Description**: Login existing user  
**Auth Required**: No  
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Database Operations**:
- Reads from `users` collection
- Creates Appwrite session
**Returns**: User object with session

---

### POST `/api/auth/logout`
**Description**: Logout current user  
**Auth Required**: Yes  
**Database Operations**:
- Deletes current Appwrite session
**Returns**: Success message

---

### GET `/api/auth/user`
**Description**: Get current authenticated user  
**Auth Required**: Yes  
**Database Operations**:
- Reads from `users` collection
**Returns**: Current user object or null

---

### PUT `/api/auth/update-profile`
**Description**: Update user profile  
**Auth Required**: Yes  
**Request Body**:
```json
{
  "name": "string",
  "avatar": "string"
}
```
**Database Operations**:
- Updates document in `users` collection
**Returns**: Updated user object

---

## League Management Routes

### POST `/api/leagues/create`
**Description**: Create new fantasy league  
**Auth Required**: Yes  
**Request Body**:
```json
{
  "name": "string",
  "maxTeams": "number",
  "draftType": "snake|auction",
  "gameMode": "power4|conference",
  "selectedConference": "string (optional)",
  "isPublic": "boolean"
}
```
**Database Operations**:
- Creates document in `leagues` collection
- Sets commissionerId to current user
- Generates unique inviteCode
**Returns**: Created league object

---

### GET `/api/leagues/[leagueId]`
**Description**: Get league details  
**Auth Required**: Yes  
**URL Params**: `leagueId`  
**Database Operations**:
- Reads from `leagues` collection
- Reads from `rosters` collection (league teams)
- Reads from `users` collection (member info)
**Returns**: League object with teams and members

---

### GET `/api/leagues/my-leagues`
**Description**: Get all leagues for current user  
**Auth Required**: Yes  
**Database Operations**:
- Reads from `leagues` collection where user is member
- Reads from `rosters` collection for user's teams
**Returns**: Array of leagues with user's team info

---

### POST `/api/leagues/invite`
**Description**: Create league invitation  
**Auth Required**: Yes (must be commissioner)  
**Request Body**:
```json
{
  "leagueId": "string",
  "email": "string"
}
```
**Database Operations**:
- Reads from `leagues` collection (verify commissioner)
- Creates invitation record
**Returns**: Invitation object with join link

---

### GET `/api/leagues/search`
**Description**: Search public leagues  
**Auth Required**: Yes  
**Query Params**: `q` (search term)  
**Database Operations**:
- Reads from `leagues` collection where isPublic=true
**Returns**: Array of matching leagues

---

### GET `/api/leagues/is-commissioner/[leagueId]`
**Description**: Check if user is league commissioner  
**Auth Required**: Yes  
**URL Params**: `leagueId`  
**Database Operations**:
- Reads from `leagues` collection
**Returns**: `{ isCommissioner: boolean }`

---

### GET `/api/leagues/[leagueId]/locker-room`
**Description**: Get comprehensive locker room data for a league  
**Auth Required**: Yes  
**URL Params**: `leagueId`  
**Database Operations**:
- Reads from `leagues` collection (league details)
- Reads from `rosters` collection (user's team)
- Reads from `players` collection (team players)
- Reads from `users` collection (user info)
**Returns**: 
```json
{
  "user": { /* user object */ },
  "league": { /* league object */ },
  "team": { /* roster object or null */ },
  "players": [ /* array of player objects */ ],
  "allRosters": [ /* all league rosters for standings */ ],
  "isCommissioner": boolean
}
```

---

## Roster Management Routes

### GET `/api/rosters/[rosterId]`
**Description**: Get roster details  
**Auth Required**: Yes  
**URL Params**: `rosterId`  
**Database Operations**:
- Reads from `rosters` collection
- Reads from `players` collection (roster players)
**Returns**: Roster object with players

---

### PUT `/api/rosters/[rosterId]/lineup`
**Description**: Update roster lineup  
**Auth Required**: Yes (must own roster)  
**Request Body**:
```json
{
  "players": ["playerId1", "playerId2", ...]
}
```
**Database Operations**:
- Updates `players` field in `rosters` collection
**Returns**: Updated roster object

---

## Player Data Routes

### GET `/api/draft/players` (canonical)
See Draft Routes below. This is the single, canonical endpoint for the player pool used by drafts and mock drafts.

### GET `/api/cfbd/players`
**Description**: Search players from CFBD API  
**Auth Required**: Yes  
**Query Params**: 
- `search` - Player name search
- `team` - Team filter
- `position` - Position filter
**External API**: College Football Data API  
**Returns**: Array of player data

---

## Draft Routes

### GET `/api/draft/[leagueId]/status`
**Description**: Get current draft status  
**Auth Required**: Yes  
**URL Params**: `leagueId`  
**Database Operations**:
- Reads from `leagues` collection
- Reads from `draft_picks` collection
- Reads from `rosters` collection
**Returns**: Draft status object with current pick

---

### POST `/api/draft/[leagueId]/pick`
**Description**: Make a draft pick  
**Auth Required**: Yes (must be on clock)  
**URL Params**: `leagueId`  
**Request Body**:
```json
{
  "playerId": "string"
}
```
**Database Operations**:
- Creates document in `draft_picks` collection
- Updates roster in `rosters` collection
- Creates activity in `activity_log`
**Real-time**: Broadcasts pick to league members  
**Returns**: Draft pick confirmation

---

### GET `/api/players/cached` (canonical)
**Description**: Get available draft players with enhanced depth chart projections  
**Auth Required**: Yes (server-side connection)
**Query Params**: 
- `position` (QB|RB|WR|TE|K|ALL)
- `conference` (SEC|Big Ten|Big 12|ACC|ALL)
- `search` (player name)
- `limit` (max 100, default 100)
- `offset` (for pagination, default 0)
**Database Operations**:
- Reads from `college_players` collection using server-side Appwrite connection
- Filters: Power 4 conferences, draftable players only
- **Orders by `fantasy_points` DESC** (enhanced projections with depth chart logic)
- **Searches by `name` field** for player lookup
**Projection Algorithm** (Aug 17, 2025 enhancement): 
- **QB depth multipliers**: QB1: 100% projection, QB2: 25%, QB3+: 5%
- **RB share distribution**: RB1: 55%, RB2: 25%, RB3: 15%
- **WR target distribution**: WR1-4: 25%, 20%, 15%, 10% respectively
- Applied via `scripts/sync-enhanced-projections.js`
**Returns**: Array of players with `fantasy_points` reflecting proper starter/backup differentiation

### GET `/api/draft/players` (legacy)
**Description**: Legacy endpoint - may use outdated projection logic  
**Status**: ⚠️ Use `/api/players/cached` instead for enhanced projections

---

## Game Data Routes

### GET `/api/games`
**Description**: Get current week games  
**Auth Required**: No  
**Database Operations**:
- Reads from `games` collection
**Returns**: Array of game objects

---

### GET `/api/games/week/[week]`
**Description**: Get games for specific week  
**Auth Required**: No  
**URL Params**: `week`  
**Database Operations**:
- Reads from `games` collection filtered by week
**Returns**: Array of game objects

---

### GET `/api/games/eligible`
**Description**: Get only fantasy-eligible games  
**Auth Required**: No  
**Database Operations**:
- Reads from `games` collection where isEligible=true
**Returns**: Array of eligible game objects

---

## Rankings Routes

### GET `/api/rankings`
**Description**: Get current AP Top 25  
**Auth Required**: No  
**Database Operations**:
- Reads from `rankings` collection
**Returns**: Array of ranking objects

---

### GET `/api/rankings/week/[week]`
**Description**: Get rankings for specific week  
**Auth Required**: No  
**URL Params**: `week`  
**Database Operations**:
- Reads from `rankings` collection filtered by week
**Returns**: Array of ranking objects

---

## Conference Data Routes

### GET `/api/sec`
**Description**: Get SEC teams and data  
**Auth Required**: No  
**Database Operations**:
- Reads from `teams` collection where conference='SEC'
**Returns**: SEC conference data

---

### GET `/api/acc`
**Description**: Get ACC teams and data  
**Auth Required**: No  
**Database Operations**:
- Reads from `teams` collection where conference='ACC'
**Returns**: ACC conference data

---

### GET `/api/big12`
**Description**: Get Big 12 teams and data  
**Auth Required**: No  
**Database Operations**:
- Reads from `teams` collection where conference='Big 12'
**Returns**: Big 12 conference data

---

### GET `/api/bigten`
**Description**: Get Big Ten teams and data  
**Auth Required**: No  
**Database Operations**:
- Reads from `teams` collection where conference='Big Ten'
**Returns**: Big Ten conference data

---

## Scoring & Stats Routes

### GET `/api/projections`
**Description**: Get player projections  
**Auth Required**: Yes  
**Query Params**: 
- `mode` - `season` | `weekly`
- `week` - Week number (required for `weekly`)
- `position` - Filter by position
- `conference` - Filter by conference
- `source` - `db` | `calc` (db reads `projections_yearly`/`projections_weekly`; calc computes live)
**Database Operations**:
- Reads from `projections_yearly` or `projections_weekly` (when `source=db`)
**Returns**: Player projection data

---

### POST `/api/cron/weekly-scoring`
**Description**: Calculate weekly scoring (cron job)  
**Auth Required**: Admin/System only  
**Database Operations**:
- Reads from `games` collection
- Reads from `player_stats` collection
- Updates `lineups` collection with points
- Updates `rosters` collection with totals
**Returns**: Scoring summary

---

## Utility Routes

### GET `/api/auth-test`
**Description**: Test authentication status  
**Auth Required**: Yes  
**Returns**: Auth test result

---

## Admin Data Maintenance Routes

### POST `/api/admin/dedupe/players`
**Description**: Detect and optionally remove duplicate player documents  
**Auth Required**: Admin only  
**Request Body**:
```json
{ "dryRun": true, "limit": 1000, "offset": 0 }
```
**Database Operations**:
- Scans `college_players` and returns duplicate candidates grouped by `name|team|position`
- If `dryRun=false`, deletes duplicates, keeping best-rated entry
**Returns**: Scan summary and deleted IDs

---

### POST `/api/admin/players/refresh`
**Description**: Sync current-season Power 4 rosters from CFBD and upsert to `college_players`  
**Auth Required**: Admin only  
**Request Body**:
```json
{ "season": 2025 }
```
**Database Operations**:
- Upserts Power 4 fantasy positions for the given season
- Marks missing/non-current players as `draftable=false`
**Returns**: Created/updated counts and summary

---

### POST `/api/admin/players/retire`
**Description**: Mark specific players as not draftable (manual cleanup)  
**Auth Required**: Admin only  
**Request Body**:
```json
{ "players": [{ "name": "Player Name", "team": "School", "position": "QB" }], "reason": "string" }
```
**Database Operations**:
- Updates matching `college_players` documents with `draftable=false` and `retired_reason`
**Returns**: Updated IDs and not-found names

---

### GET `/api/scraper`
**Description**: Trigger data scraping (admin)  
**Auth Required**: Admin only  
**External APIs**: ESPN, CFBD  
**Database Operations**:
- Updates `games`, `rankings`, `teams` collections
**Returns**: Scraping results

---

## WebSocket Events (Real-time)

### `draft:pick`
**Description**: New draft pick made  
**Payload**: Draft pick object  
**Listeners**: All league members

### `draft:timer`
**Description**: Draft timer update  
**Payload**: Timer countdown  
**Listeners**: All league members

### `league:update`
**Description**: League settings changed  
**Payload**: Updated league object  
**Listeners**: All league members

### `roster:update`
**Description**: Roster changed  
**Payload**: Updated roster object  
**Listeners**: League members

---

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Rate Limited
- `500` - Server Error

---

## Rate Limiting

- Auth endpoints: 5 requests per minute
- Data endpoints: 30 requests per minute
- Admin endpoints: 10 requests per minute

---

## Notes

1. All authenticated routes require session cookie from Appwrite
2. Commissioner routes verify `commissionerId` matches current user
3. Roster update routes verify ownership
4. Real-time updates use Appwrite Realtime subscriptions
5. External API calls are cached for performance
