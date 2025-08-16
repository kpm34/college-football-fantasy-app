# College Football Fantasy App - Database Schema Documentation

## Overview
This document provides a complete reference for all Appwrite collections, their attributes, permissions, and relationships.

## Collections

### 1. **users** 
*Stores user account information*

**Attributes:**
- `$id` (string): Unique user ID
- `email` (string, required): User email
- `name` (string): Display name
- `avatar` (string): Avatar URL
- `prefs` (object): User preferences
- `created_at` (datetime): Account creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.users()` - Authenticated users can read user profiles
- Create: `Role.guests()` - Guests can create accounts (signup)
- Update: `Role.user([USER_ID])` - Users can only update their own profile
- Delete: `Role.user([USER_ID])` - Users can only delete their own account

**Relationships:**
- One-to-Many with `leagues` (as commissioner)
- One-to-Many with `rosters` (as team owner)

---

### 2. **leagues**
*Stores fantasy league information*

**Attributes:**
- `$id` (string): Unique league ID
- `name` (string, required, max: 100): League name
- `commissionerId` (string, required): User ID of commissioner
- `season` (integer, default: 2025): Season year
- `status` (string, enum: ['draft', 'active', 'completed'], default: 'draft')
- `maxTeams` (integer, default: 12, min: 4, max: 20): Maximum teams allowed
- `draftDate` (datetime): Scheduled draft date/time
- `draftType` (string, enum: ['snake', 'auction'], default: 'snake')
- `scoringType` (string, default: 'standard'): Scoring system type
- `inviteCode` (string, max: 20): Unique invite code
- `isPublic` (boolean, default: false): Public/private league
- `gameMode` (string, enum: ['power4', 'conference'], default: 'power4')
- `selectedConference` (string): If conference mode, which conference
- `members` (string[], max: 40): Array of user IDs in league
- `scoringRules` (string, max: 10000): JSON string of all commissioner settings
- `pickTimeSeconds` (integer, default: 90): Time per draft pick
- `seasonStartWeek` (integer, default: 1): Week season starts
- `rosterSchema` (string, max: 1000): JSON roster configuration
- `created_at` (datetime): League creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.users()` - Any authenticated user can view leagues
- Create: `Role.users()` - Any authenticated user can create a league
- Update: `Role.user([COMMISSIONER_ID])` - Only commissioner can update
- Delete: `Role.user([COMMISSIONER_ID])` - Only commissioner can delete

**Relationships:**
- Many-to-One with `users` (commissioner)
- One-to-Many with `rosters`
- One-to-Many with `draft_picks`

---

### 3. **rosters**
*Stores team rosters within leagues*

**Attributes:**
- `$id` (string): Unique roster ID
- `leagueId` (string, required): Associated league ID
- `userId` (string, required): Team owner user ID
- `teamName` (string, max: 100): Custom team name
- `userName` (string): Owner display name (denormalized)
- `email` (string): Owner email (denormalized)
- `wins` (integer, default: 0): Season wins
- `losses` (integer, default: 0): Season losses
- `ties` (integer, default: 0): Season ties
- `points` (float, default: 0): Total points scored
- `pointsFor` (float, default: 0): Points scored
- `pointsAgainst` (float, default: 0): Points scored against
- `players` (string, max: 5000): JSON array of player IDs
- `draftPosition` (integer): Draft order position
- `created_at` (datetime): Roster creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.users()` - All authenticated users can view rosters
- Create: `Role.users()` - Users can create rosters when joining leagues
- Update: `Role.user([USER_ID])` - Users can only update their own roster
- Delete: `Role.user([USER_ID])` - Users can only delete their own roster

**Relationships:**
- Many-to-One with `leagues`
- Many-to-One with `users`
- Many-to-Many with `players` (via JSON array)

---

### 4. **players**
*Stores college football player data*

**Attributes:**
- `$id` (string): Unique player ID
- `name` (string, required): Player name
- `position` (string, required): Position (QB, RB, WR, TE, K, DEF)
- `team` (string, required): College team name
- `conference` (string): Conference name
- `year` (string): Class year (FR, SO, JR, SR)
- `jersey_number` (integer): Jersey number
- `height` (string): Height (e.g., "6-2")
- `weight` (integer): Weight in pounds
- `hometown` (string): Hometown
- `cfbd_id` (string): College Football Database ID
- `espn_id` (string): ESPN player ID
- `fantasy_points` (float, default: 0): Current season fantasy points
- `projection` (float, default: 0): Projected points
- `status` (string): Injury/availability status
- `created_at` (datetime): Record creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.users()` - All authenticated users can view players
- Create: Admin only (via backend scripts)
- Update: Admin only (via backend scripts)
- Delete: Admin only (via backend scripts)

---

### 5. **games**
*Stores college football game data*

**Attributes:**
- `$id` (string): Unique game ID
- `season` (integer): Season year
- `week` (integer): Week number
- `seasonType` (string): Regular/postseason
- `startDate` (datetime): Game start time
- `homeTeam` (string): Home team name
- `awayTeam` (string): Away team name
- `homeConference` (string): Home team conference
- `awayConference` (string): Away team conference
- `homePoints` (integer): Home team score
- `awayPoints` (integer): Away team score
- `status` (string): Game status
- `isEligible` (boolean): Eligible for fantasy scoring
- `venueId` (string): Stadium ID
- `cfbd_id` (string): CFBD game ID
- `espn_id` (string): ESPN game ID
- `created_at` (datetime): Record creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.any()` - Public data
- Create: Admin only (via sync scripts)
- Update: Admin only (via sync scripts)
- Delete: Admin only (via sync scripts)

---

### 6. **rankings**
*Stores AP Top 25 rankings*

**Attributes:**
- `$id` (string): Unique ranking ID
- `season` (integer): Season year
- `week` (integer): Week number
- `rank` (integer): AP ranking (1-25)
- `school` (string): School name
- `conference` (string): Conference
- `firstPlaceVotes` (integer): First place votes
- `points` (integer): Total points
- `previousRank` (integer): Previous week rank
- `created_at` (datetime): Record creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.any()` - Public data
- Create: Admin only (via sync scripts)
- Update: Admin only (via sync scripts)
- Delete: Admin only (via sync scripts)

---

### 7. **teams**
*Stores college team information*

**Attributes:**
- `$id` (string): Unique team ID
- `school` (string, required): School name
- `mascot` (string): Team mascot
- `abbreviation` (string): Team abbreviation
- `conference` (string): Conference name
- `division` (string): Division
- `color` (string): Primary color hex
- `altColor` (string): Secondary color hex
- `logo` (string): Logo URL
- `cfbd_id` (string): CFBD team ID
- `espn_id` (string): ESPN team ID
- `created_at` (datetime): Record creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.any()` - Public data
- Create: Admin only
- Update: Admin only
- Delete: Admin only

---

### 8. **draft_picks**
*Stores draft pick history*

**Attributes:**
- `$id` (string): Unique pick ID
- `leagueId` (string, required): League ID
- `round` (integer, required): Round number
- `pick` (integer, required): Pick number
- `overall` (integer, required): Overall pick number
- `teamId` (string, required): Roster ID that made pick
- `playerId` (string, required): Player ID selected
- `timestamp` (datetime): When pick was made
- `pickTime` (integer): Seconds taken to pick
- `created_at` (datetime): Record creation date

**Permissions:**
- Read: `Role.users()` - Authenticated users can view draft history
- Create: `Role.users()` - System creates during draft
- Update: None - Draft picks are immutable
- Delete: None - Draft picks are immutable

---

### 9. **lineups**
*Stores weekly lineup decisions*

**Attributes:**
- `$id` (string): Unique lineup ID
- `rosterId` (string, required): Roster ID
- `week` (integer, required): Week number
- `season` (integer, required): Season year
- `starters` (string[]): Array of starting player IDs
- `bench` (string[]): Array of benched player IDs
- `locked` (boolean, default: false): Lineup locked for week
- `points` (float, default: 0): Total points scored
- `created_at` (datetime): Record creation date
- `updated_at` (datetime): Last update

**Permissions:**
- Read: `Role.users()` - Users can view lineups
- Create: `Role.users()` - Users can create lineups
- Update: `Role.user([ROSTER_OWNER_ID])` - Only owner can update
- Delete: `Role.user([ROSTER_OWNER_ID])` - Only owner can delete

---

### 10. **activity_log**
*Stores league activity feed*

**Attributes:**
- `$id` (string): Unique activity ID
- `leagueId` (string, required): League ID
- `userId` (string): User who performed action
- `type` (string): Activity type (trade, waiver, etc.)
- `description` (string): Human-readable description
- `metadata` (object): Additional activity data
- `created_at` (datetime): When activity occurred

**Permissions:**
- Read: `Role.users()` - League members can view activity
- Create: `Role.users()` - System creates activities
- Update: None - Activity log is immutable
- Delete: None - Activity log is immutable

---

## Indexes

### Recommended Indexes for Performance:

1. **leagues**
   - `commissionerId` (for finding user's leagues)
   - `inviteCode` (for join by code)
   - `status` (for filtering active leagues)

2. **rosters**
   - `leagueId` (for league rosters)
   - `userId` (for user's teams)
   - `leagueId, userId` (composite for uniqueness)

3. **players**
   - `team` (for team rosters)
   - `position` (for position filtering)
   - `conference` (for conference filtering)

4. **games**
   - `week, season` (for weekly games)
   - `homeTeam, awayTeam` (for team schedules)

5. **draft_picks**
   - `leagueId` (for league draft history)
   - `leagueId, overall` (for draft order)

---

## Notes

1. **JSON Fields**: Several fields store JSON strings due to Appwrite attribute limits:
   - `leagues.scoringRules` - All commissioner settings
   - `rosters.players` - Player ID arrays
   - `leagues.rosterSchema` - Roster configuration

2. **Document-Level Security**: While collection permissions are broad, implement document-level security in API routes for:
   - Users can only update their own documents
   - Commissioners have special privileges in their leagues
   - League members can only access their league's data

3. **Data Synchronization**: External data (games, rankings, teams) is synced via cron jobs and should not be user-editable.
