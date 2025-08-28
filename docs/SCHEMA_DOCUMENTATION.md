# Schema Documentation

**Generated from SSOT**: `schema/zod-schema.ts`  
**Generated at**: 2025-08-27T23:27:17.572Z  
**Collections**: 20

This documentation is automatically generated from the Single Source of Truth schema.

---

## Table of Contents

- [college_players](#collegeplayers)
- [schools](#schools)
- [games](#games)
- [rankings](#rankings)
- [leagues](#leagues)
- [fantasy_teams](#fantasyteams)
- [drafts](#drafts)
- [draft_events](#draftevents)
- [draft_states](#draftstates)
- [auctions](#auctions)
- [bids](#bids)
- [lineups](#lineups)
- [matchups](#matchups)
- [player_stats](#playerstats)
- [projections](#projections)
- [model_runs](#modelruns)
- [activity_log](#activitylog)
- [invites](#invites)
- [meshy_jobs](#meshyjobs)
- [migrations](#migrations)

---

## college_players

**Key**: `COLLEGE_PLAYERS`  
**Fields**: 16

**Purpose**: Player master dataset (name, position, team, conference, eligibility).







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | min: 2, max: 100 |
| `position` | enum: QB | RB | WR | TE | K | DEF | ✅ | - |
| `team` | string | ✅ | min: 2, max: 50 |
| `conference` | enum: SEC | ACC | Big 12 | Big Ten | ✅ | - |
| `jerseyNumber` | number | ❌ | integer, min: 0, max: 99 |
| `height` | string | ❌ | max: 10 |
| `weight` | number | ❌ | integer, min: 150, max: 400 |
| `year` | enum: FR | SO | JR | SR | ❌ | - |
| `eligible` | boolean | ✅ | default: true |
| `fantasyPoints` | number | ✅ | default: 0 |
| `seasonFantasyPoints` | number | ✅ | default: 0 |
| `depthChartOrder` | number | ❌ | integer |
| `lastProjectionUpdate` | date | ❌ | - |
| `externalId` | string | ❌ | max: 50 |
| `imageUrl` | string | ❌ | URL format |
| `stats` | string | ❌ | max: 5000 |

### Relationships

- team → teams

---

## schools

**Key**: `SCHOOLS`  
**Fields**: 10







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | min: 1, max: 100 |
| `abbreviation` | string | ✅ | min: 2, max: 10 |
| `conference` | enum: SEC | ACC | Big 12 | Big Ten | ✅ | - |
| `mascot` | string | ❌ | max: 50 |
| `logoUrl` | string | ❌ | URL format |
| `primaryColor` | string | ❌ | max: 7 |
| `secondaryColor` | string | ❌ | max: 7 |
| `venue` | string | ❌ | max: 100 |
| `founded` | number | ❌ | integer, min: 1800, max: 2100 |
| `externalId` | string | ❌ | max: 50 |

---

## games

**Key**: `GAMES`  
**Fields**: 13

**Purpose**: Schedule and results, including kickoff time and status.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `seasonType` | enum: regular | postseason | ✅ | - |
| `homeTeam` | string | ✅ | min: 2, max: 50 |
| `awayTeam` | string | ✅ | min: 2, max: 50 |
| `homeSchoolId` | string | ❌ | - |
| `awaySchoolId` | string | ❌ | - |
| `homeScore` | number | ❌ | integer, min: 0 |
| `awayScore` | number | ❌ | integer, min: 0 |
| `kickoffAt` | date | ✅ | - |
| `completed` | boolean | ✅ | default: false |
| `eligibleGame` | boolean | ❌ | - |
| `status` | string | ❌ | - |

---

## rankings

**Key**: `RANKINGS`  
**Fields**: 7

**Purpose**: Poll rankings (AP/Coaches) for eligibility and display.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `pollType` | enum: AP Top 25 | Coaches Poll | ✅ | - |
| `team` | string | ✅ | min: 2, max: 50 |
| `rank` | number | ✅ | integer, min: 1, max: 25 |
| `points` | number | ❌ | integer, min: 0 |
| `firstPlaceVotes` | number | ❌ | integer, min: 0 |

### Relationships

- team → teams

---

## leagues

**Key**: `LEAGUES`  
**Fields**: 20

**Purpose**: League configuration and metadata. Draft-specific state now lives in drafts.* collections.



**Notes**:
- Draft order in leagues is deprecated; drafts.draftOrder is the source of truth.
- selectedConference and gameMode are immutable after creation.





### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueName` | string | ✅ | min: 1, max: 100 |
| `commissionerAuthUserId` | string | ❌ | min: 1, max: 64 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `maxTeams` | number | ❌ | integer, min: 2, max: 32 |
| `currentTeams` | number | ❌ | integer, min: 0, max: 32 |
| `draftType` | enum: snake | auction | ❌ | - |
| `gameMode` | enum: power4 | sec | acc | big12 | bigten | ❌ | - |
| `selectedConference` | string | ❌ | max: 50 |
| `leagueStatus` | enum: open | closed | ❌ | - |
| `isPublic` | boolean | ❌ | - |
| `pickTimeSeconds` | number | ❌ | integer, min: 30, max: 600 |
| `scoringRules` | string | ❌ | max: 65535 |
| `draftDate` | date | ❌ | - |
| `seasonStartWeek` | number | ❌ | integer, min: 1, max: 20 |
| `playoffTeams` | number | ❌ | integer, min: 0, max: 20 |
| `playoffStartWeek` | number | ❌ | integer, min: 1, max: 20 |
| `waiverType` | string | ❌ | max: 20 |
| `waiverBudget` | number | ❌ | integer, min: 0, max: 1000 |
| `password` | string | ❌ | max: 50 |
| `draftOrder` | string | ❌ | max: 65535 |

---

## fantasy_teams

**Key**: `FANTASY_TEAMS`  
**Fields**: 16

**Purpose**: Fantasy teams per league. Created for each member; stores teamName, ownerAuthUserId, record, logo.



**Notes**:
- ownerAuthUserId links back to clients.authUserId.
- teamName is required and shown across draft UIs (recent picks/order).





### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 64 |
| `leagueName` | string | ❌ | min: 1, max: 100 |
| `ownerAuthUserId` | string | ❌ | min: 1, max: 64 |
| `teamName` | string | ✅ | min: 1, max: 128 |
| `displayName` | string | ❌ | max: 255 |
| `abbrev` | string | ❌ | max: 8 |
| `logoUrl` | string | ❌ | max: 512 |
| `wins` | number | ❌ | integer, min: 0, max: 25 |
| `losses` | number | ❌ | integer, min: 0, max: 25 |
| `ties` | number | ❌ | integer, min: 0, max: 25 |
| `pointsFor` | number | ❌ | - |
| `pointsAgainst` | number | ❌ | - |
| `draftPosition` | number | ❌ | integer, min: 1, max: 32 |
| `auctionBudgetTotal` | number | ❌ | - |
| `auctionBudgetRemaining` | number | ❌ | - |
| `players` | string | ❌ | - |

### Relationships

- leagueId → leagues

---

## drafts

**Key**: `DRAFTS`  
**Fields**: 19

**Purpose**: Authoritative draft room configuration and status (order, rounds, timers, participants).



**Notes**:
- One draft per league. Use drafts for timer, order, and status; do not rely on leagues for draft state.





### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ❌ | min: 1, max: 50 |
| `draftStatus` | enum: pre-draft | drafting | post-draft | ✅ | default: "pre-draft" |
| `currentRound` | number | ❌ | integer, min: 1 |
| `currentPick` | number | ❌ | integer, min: 1 |
| `maxRounds` | number | ❌ | integer, min: 1 |
| `draftOrder` | string | ❌ | max: 5000 |
| `startTime` | date | ❌ | - |
| `endTime` | date | ❌ | - |
| `type` | enum: snake | auction | mock | ❌ | - |
| `settings` | string | ❌ | max: 10000 |
| `participants` | string | ❌ | max: 10000 |
| `pickTimeSeconds` | number | ❌ | integer |
| `autoPickEnabled` | boolean | ❌ | - |
| `commissioner` | string | ❌ | - |
| `season` | number | ❌ | integer |
| `maxTeams` | number | ❌ | integer |
| `currentTeams` | number | ❌ | integer |
| `created` | date | ❌ | - |
| `updated` | date | ❌ | - |

### Relationships

- leagueId → leagues
- commissioner → users

---

## draft_events

**Key**: `DRAFT_EVENTS`  
**Fields**: 8

**Purpose**: Immutable event log (pick/autopick/undo/pause/resume) for audit and UI streams.



**Notes**:
- Used for real-time feeds and audit; do not mutate existing events.





### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `draftId` | string | ✅ | min: 1, max: 64 |
| `ts` | date | ✅ | - |
| `type` | enum: pick | autopick | undo | pause | resume | ✅ | - |
| `teamId` | string | ❌ | min: 1, max: 64 |
| `playerId` | string | ❌ | min: 1, max: 64 |
| `round` | number | ✅ | integer, min: 1 |
| `overall` | number | ✅ | integer, min: 1 |
| `by` | string | ❌ | min: 1, max: 50 |

### Relationships

- draftId → drafts
- playerId → college_players

---

## draft_states

**Key**: `DRAFT_STATES`  
**Fields**: 6

**Purpose**: Append-only or rolling draft state snapshots for recovery/observability (status, on-clock, deadline).



**Notes**:
- draftId corresponds to the leagueId (one draft per league).





### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `draftId` | string | ✅ | min: 1, max: 255 |
| `onClockTeamId` | string | ✅ | min: 1, max: 255 |
| `deadlineAt` | date | ❌ | - |
| `round` | number | ✅ | integer, min: 1 |
| `pickIndex` | number | ✅ | integer, min: 1 |
| `draftStatus` | enum: pre-draft | drafting | post-draft | ✅ | default: "pre-draft" |

### Relationships

- draftId → drafts

---

## auctions

**Key**: `AUCTIONS`  
**Fields**: 7

**Purpose**: Auction draft sessions and current bidding state.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `status` | string | ✅ | min: 1, max: 20 |
| `currentPlayerId` | string | ❌ | min: 1, max: 50 |
| `currentBid` | number | ❌ | min: 0 |
| `currentBidder` | string | ❌ | min: 1, max: 50 |
| `startTime` | date | ❌ | - |
| `endTime` | date | ❌ | - |

### Relationships

- leagueId → leagues

---

## bids

**Key**: `BIDS`  
**Fields**: 8

**Purpose**: Auction bid history linked to auctions.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `sessionId` | string | ✅ | min: 1, max: 50 |
| `userId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `bidAmount` | number | ✅ | min: 1 |
| `timestamp` | date | ✅ | - |
| `auctionId` | string | ❌ | min: 1, max: 50 |
| `teamId` | string | ❌ | min: 1, max: 50 |

### Relationships

- leagueId → leagues
- userId → users
- playerId → college_players
- auctionId → auctions

---

## lineups

**Key**: `LINEUPS`  
**Fields**: 7

**Purpose**: Weekly starting lineups and bench for a roster/team in a league.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `rosterId` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `lineup` | string | ❌ | max: 5000 |
| `bench` | string | ❌ | max: 5000 |
| `points` | number | ✅ | min: 0, default: 0 |
| `locked` | boolean | ✅ | default: false |

### Relationships

- rosterId → fantasy_teams

---

## matchups

**Key**: `MATCHUPS`  
**Fields**: 8

**Purpose**: Head-to-head matchups per week with scores and status.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `homeRosterId` | string | ✅ | min: 1, max: 50 |
| `awayRosterId` | string | ✅ | min: 1, max: 50 |
| `homePoints` | number | ❌ | - |
| `awayPoints` | number | ❌ | - |
| `status` | enum: scheduled | active | final | ✅ | default: "scheduled" |

### Relationships

- leagueId → leagues

---

## player_stats

**Key**: `PLAYER_STATS`  
**Fields**: 7

**Purpose**: Per-game or aggregated player statistics used for scoring and projections.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `playerId` | string | ✅ | min: 1, max: 50 |
| `gameId` | string | ✅ | min: 1, max: 50 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `stats` | string | ✅ | max: 2000 |
| `fantasyPoints` | number | ✅ | default: 0 |
| `updated` | date | ✅ | default: "2025-08-27T23:27:17.571Z" |

### Relationships

- playerId → college_players
- gameId → games

---

## projections

**Key**: `PROJECTIONS`  
**Fields**: 8

**Purpose**: Projection outputs, inputs, and computed fantasy points (weekly/yearly).







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `playerId` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `week` | number | ❌ | integer, min: 1, max: 20 |
| `version` | number | ✅ | integer, min: 1, default: 1 |
| `points` | number | ❌ | - |
| `components` | string | ❌ | max: 10000 |
| `fantasyPoints` | number | ❌ | - |
| `data` | string | ❌ | max: 10000 |

### Relationships

- playerId → college_players

---

## model_runs

**Key**: `MODEL_RUNS`  
**Fields**: 11

**Purpose**: Model run metadata for reproducibility (versions, metrics, status).







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `runId` | string | ✅ | min: 1, max: 64 |
| `version` | number | ✅ | integer, min: 1 |
| `scope` | enum: season | week | ✅ | - |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `week` | number | ❌ | integer, min: 1, max: 20 |
| `sources` | string | ❌ | max: 20000 |
| `weights` | string | ❌ | max: 10000 |
| `metrics` | string | ❌ | max: 10000 |
| `status` | enum: running | success | failed | ✅ | default: "running" |
| `startedAt` | date | ✅ | - |
| `finishedAt` | date | ❌ | - |

---

## activity_log

**Key**: `ACTIVITY_LOG`  
**Fields**: 6

**Purpose**: Operational audit trail of actions in the system.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `userId` | string | ❌ | max: 50 |
| `action` | string | ✅ | min: 1, max: 100 |
| `details` | string | ❌ | max: 1000 |
| `timestamp` | date | ✅ | default: "2025-08-27T23:27:17.572Z" |
| `ipAddress` | string | ❌ | max: 45 |
| `userAgent` | string | ❌ | max: 500 |

### Relationships

- userId → users

---

## invites

**Key**: `INVITES`  
**Fields**: 9

**Purpose**: Invite codes/tokens to join leagues with optional expiration and email.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 64 |
| `inviteCode` | string | ✅ | min: 1, max: 128 |
| `createdAt` | string | ❌ | - |
| `email` | string | ❌ | email format |
| `expiresAt` | string | ❌ | - |
| `invitedByAuthUserId` | string | ❌ | - |
| `status` | string | ❌ | - |
| `token` | string | ❌ | - |
| `acceptedAt` | string | ❌ | - |

### Relationships

- leagueId → leagues

---

## meshy_jobs

**Key**: `MESHY_JOBS`  
**Fields**: 9

**Purpose**: 3D/asset generation jobs and status tracking.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `userId` | string | ❌ | - |
| `prompt` | string | ❌ | - |
| `mode` | string | ❌ | - |
| `imageUrl` | string | ❌ | - |
| `resultUrl` | string | ❌ | - |
| `status` | string | ❌ | - |
| `createdAt` | string | ❌ | - |
| `updatedAt` | string | ❌ | - |
| `webhookSecret` | string | ❌ | - |

### Relationships

- userId → users

---

## migrations

**Key**: `MIGRATIONS`  
**Fields**: 3

**Purpose**: Applied schema/data migrations.







### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `version` | string | ✅ | min: 1, max: 100 |
| `applied` | date | ✅ | - |
| `checksum` | string | ✅ | max: 200 |

---

## Schema Statistics

- **Total Collections**: 20
- **Total Fields**: 198
- **Total Relationships**: 21
- **Required Fields**: 79
- **Optional Fields**: 119

### Field Type Distribution

- **string**: 97 fields
- **number**: 62 fields
- **date**: 17 fields
- **enum**: 16 fields
- **boolean**: 6 fields

---

## SSOT Benefits

✅ **Single Source of Truth**: All schemas defined in one place  
✅ **Type Safety**: Automatic TypeScript type generation  
✅ **Runtime Validation**: Built-in data validation functions  
✅ **Build Guards**: Automatic drift detection and validation  
✅ **Documentation**: Auto-generated documentation (this file)

---

*This documentation is automatically updated when the schema changes.*
