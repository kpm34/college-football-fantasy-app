# College Football Fantasy App - Admin Operations Guide

## 🎯 Complete Function Mapping

### 1. User Authentication & Management

#### Login Flow
**Route**: `POST /api/auth/login`
**Collections**: `users` (indirect via Appwrite Auth)
**Process**:
1. Receive email/password from login form
2. Create Appwrite session via server-to-server call
3. Set `appwrite-session` cookie with session secret
4. Return success with user data

**Required Fields**:
- `email`: string (required)
- `password`: string (required)

#### Signup Flow
**Route**: `POST /api/auth/signup`
**Collections**: `users` (created in Appwrite Auth)
**Process**:
1. Validate email, password, name
2. Create user in Appwrite Auth
3. Auto-login after creation
4. Set session cookie

**Required Fields**:
- `email`: string (required)
- `password`: string (min 8 chars)
- `name`: string (optional but recommended)

#### OAuth Flow (Google/Apple)
**Routes**: 
- `GET /api/auth/oauth/google` - Initiate OAuth
- `GET /api/auth/oauth/success` - Handle callback
- `POST /api/auth/sync-oauth` - Sync session

**Environment Flags**:
- `NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE=true`
- `NEXT_PUBLIC_ENABLE_OAUTH_APPLE=true`

### 2. League Creation & Management

#### Create League
**Route**: `POST /api/leagues/create`
**Collections**: `leagues`, `rosters`
**Process**:
1. Authenticate user (commissioner)
2. Normalize input fields:
   - `leagueName` → `name`
   - `gameMode` + `selectedConference` → normalized mode
3. Create league document
4. Auto-join commissioner with roster
5. Return league ID and roster ID

**Required Fields**:
- `name`: string (1-100 chars)
- `maxTeams`: number (2-32)
- `gameMode`: enum ('power4', 'sec', 'acc', 'big12', 'bigten')
- `draftType`: enum ('snake', 'auction')

**Optional Fields**:
- `isPrivate`: boolean (default: false)
- `pickTimeSeconds`: number (30-600, default: 90)
- `password`: string (for private leagues)
- `scoringRules`: JSON string
- `draftDate`: ISO date string
- `season`: number (default: current year)

#### Join League
**Route**: `POST /api/leagues/join`
**Collections**: `leagues`, `rosters`
**Process**:
1. Validate league exists and not full
2. Check password for private leagues
3. Verify user not already member
4. Create roster document
5. Update league member count
6. Return roster ID

**Required Fields**:
- `leagueId`: string
- `teamName`: string (1-100 chars)

**Optional Fields**:
- `password`: string (for private leagues)
- `teamAbbreviation`: string (max 10 chars)

#### Commissioner Settings Update
**Route**: `PATCH /api/leagues/[leagueId]/update-settings`
**Collections**: `leagues`
**Process**:
1. Verify user is commissioner
2. Filter allowed attributes:
   - `name`, `maxTeams`, `draftType`, `gameMode`
   - `isPublic`, `pickTimeSeconds`, `scoringRules`
   - `draftDate`, `orderMode`
3. Update league document
4. Invalidate cache

**Validation**:
- Only commissioner can update
- Cannot change after draft starts
- Some fields locked after league fills

### 3. Draft System

#### Snake Draft
**Route**: `POST /api/draft/[leagueId]/pick`
**Collections**: `draft_picks`, `rosters`, `college_players`
**Process**:
1. Validate it's user's turn
2. Check player availability
3. Create draft_pick document
4. Add player to roster
5. Update Vercel KV state
6. Broadcast via Realtime

**Required Fields**:
- `playerId`: string
- `leagueId`: string (from URL)

**Real-time State** (Vercel KV):
- Current pick number
- Current round
- Timer countdown
- Available players

#### Draft Status
**Route**: `GET /api/draft/[leagueId]/status`
**Collections**: `draft_picks`, `rosters`
**Returns**:
- Current pick/round
- On-the-clock team
- Recent picks
- Available players

#### Mock Draft
**Routes**:
- `POST /api/mock-draft/create` - Create mock
- `POST /api/mock-draft/join` - Join as participant
- `POST /api/mock-draft/start` - Begin draft
- `POST /api/mock-draft/pick` - Make pick

**Collections**: `mock_drafts`, `mock_draft_participants`, `mock_draft_picks`

### 4. Player Data Management

#### Player Search/Filter
**Route**: `GET /api/draft/players`
**Collections**: `college_players`, `model_inputs`
**Query Parameters**:
- `position`: QB, RB, WR, TE, K
- `conference`: SEC, ACC, Big 12, Big Ten
- `team`: string
- `search`: string (name search)
- `top200`: boolean
- `limit`: number

**Projection Calculation**:
1. Base projection by position
2. Apply depth chart multiplier
3. Apply team/conference adjustments
4. Override with manual inputs

#### Player Updates (Admin)
**Routes**:
- `POST /api/admin/players/refresh` - Sync from CFBD
- `POST /api/admin/players/retire` - Mark undraftable
- `POST /api/admin/dedupe/players` - Remove duplicates
- `POST /api/admin/players/override` - Manual adjustments

### 5. Weekly Operations

#### Lineup Management
**Collections**: `lineups`, `rosters`
**Fields**:
- `rosterId`: string
- `week`: number (1-20)
- `lineup`: JSON (starting players)
- `bench`: JSON (bench players)
- `locked`: boolean

#### Scoring Updates
**Route**: `POST /api/cron/weekly-scoring`
**Collections**: `player_stats`, `lineups`, `rosters`
**Process**:
1. Fetch game results from ESPN/CFBD
2. Calculate fantasy points
3. Update player_stats
4. Sum lineup points
5. Update standings

### 6. Database Schema Simplification Opportunities

#### Current Issues:
1. **Redundant Collections**:
   - `rosters` vs `user_teams` (same purpose)
   - Multiple projection collections

2. **JSON String Fields** (should be proper objects):
   - `scoringRules` in leagues
   - `lineup` in rosters
   - `stats` in player_stats

3. **Missing Indexes**:
   - `leagues.commissioner`
   - `rosters.userId + leagueId` compound
   - `college_players.conference + position`

#### Recommended Changes:

**Consolidate Collections**:
```
MERGE: rosters + user_teams → teams
MERGE: projections_* → player_projections
REMOVE: Unused activity_log entries
```

**Standardize Naming**:
```
leagues.maxTeams → leagues.max_teams
leagues.currentTeams → leagues.current_teams
leagues.draftType → leagues.draft_type
leagues.gameMode → leagues.game_mode
```

**Add Missing Relations**:
```
teams.league_id → leagues.$id (foreign key)
teams.user_id → users.$id (foreign key)
draft_picks.team_id → teams.$id (foreign key)
```

## 🔧 Admin Tools & Scripts

### Data Sync Commands
```bash
# Sync all player data
npm run sync-players

# Update rankings
npm run sync-rankings

# Refresh projections
npm run update-projections

# Clean duplicates
npm run dedupe-players
```

### Database Operations
```bash
# Generate TypeScript types from SSOT
npm run generate-types

# Sync schema to Appwrite
npm run sync-schema

# Validate SSOT integrity
npm run validate-ssot

# Run migrations
npm run migrate
```

### Monitoring Commands
```bash
# Check system health
curl https://cfbfantasy.app/api/health

# View sync status
curl https://cfbfantasy.app/api/admin/sync-status

# Check cache status
curl https://cfbfantasy.app/api/cache/status
```

## 📊 Collection Field Requirements

### leagues
**Required**: name, commissioner, maxTeams, gameMode, draftType
**Optional**: password, scoringRules, draftDate, pickTimeSeconds
**Computed**: currentTeams, status

### rosters/teams
**Required**: leagueId, userId, teamName
**Optional**: abbreviation, draftPosition
**Computed**: wins, losses, ties, pointsFor, pointsAgainst

### college_players
**Required**: name, position, team, conference
**Optional**: jerseyNumber, height, weight, year, stats
**Computed**: fantasy_points, eligible, depth_chart_order

### draft_picks
**Required**: leagueId, rosterId, playerId, round, pick
**Optional**: timestamp
**Computed**: overallPick

## 🚨 Critical Admin Actions

1. **Before Season Start**:
   - Sync all player rosters from CFBD
   - Update depth charts
   - Set projections
   - Clear old season data

2. **Weekly During Season**:
   - Update rankings (Tuesday)
   - Sync game results (Sunday night)
   - Calculate scoring (Monday morning)
   - Process waivers (Wednesday)

3. **Emergency Procedures**:
   - Reset draft: Clear draft_picks, reset league status
   - Fix scoring: Recalculate from player_stats
   - Restore roster: Use Appwrite backups

## 📈 Performance Monitoring

### Key Metrics:
- API response time < 200ms
- Draft pick processing < 100ms
- Search queries < 150ms
- Cache hit rate > 80%

### Bottlenecks to Watch:
- Player search without indexes
- Large roster JSON parsing
- Realtime subscriptions > 100/league
- Projection calculations on-demand

---

Last Updated: December 2024
