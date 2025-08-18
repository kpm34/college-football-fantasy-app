# Schema Documentation

**Generated from SSOT**: `schema/zod-schema.ts`  
**Generated at**: 2025-08-18T00:30:09.351Z  
**Collections**: 12

This documentation is automatically generated from the Single Source of Truth schema.

---

## Table of Contents

- [college_players](#collegeplayers)
- [teams](#teams)
- [games](#games)
- [rankings](#rankings)
- [leagues](#leagues)
- [user_teams](#userteams)
- [lineups](#lineups)
- [auctions](#auctions)
- [bids](#bids)
- [player_stats](#playerstats)
- [users](#users)
- [activity_log](#activitylog)

---

## college_players

**Key**: `COLLEGE_PLAYERS`  
**Fields**: 16

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
| `fantasy_points` | number | ✅ | default: 0 |
| `season_fantasy_points` | number | ✅ | default: 0 |
| `depth_chart_order` | number | ❌ | integer |
| `last_projection_update` | date | ❌ | - |
| `external_id` | string | ❌ | max: 50 |
| `image_url` | string | ❌ | URL format |
| `stats` | string | ❌ | max: 5000 |

### Relationships

- team → teams

---

## teams

**Key**: `TEAMS`  
**Fields**: 10

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | min: 1, max: 100 |
| `abbreviation` | string | ✅ | min: 2, max: 10 |
| `conference` | enum: SEC | ACC | Big 12 | Big Ten | ✅ | - |
| `mascot` | string | ❌ | max: 50 |
| `logo_url` | string | ❌ | URL format |
| `primary_color` | string | ❌ | max: 7 |
| `secondary_color` | string | ❌ | max: 7 |
| `venue` | string | ❌ | max: 100 |
| `founded` | number | ❌ | integer, min: 1800, max: 2100 |
| `external_id` | string | ❌ | max: 50 |

---

## games

**Key**: `GAMES`  
**Fields**: 13

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `season_type` | enum: regular | postseason | ✅ | - |
| `home_team` | string | ✅ | min: 2, max: 50 |
| `away_team` | string | ✅ | min: 2, max: 50 |
| `home_score` | number | ❌ | integer, min: 0 |
| `away_score` | number | ❌ | integer, min: 0 |
| `start_date` | date | ✅ | - |
| `completed` | boolean | ✅ | default: false |
| `venue` | string | ❌ | max: 100 |
| `tv_network` | string | ❌ | max: 20 |
| `weather` | string | ❌ | max: 200 |
| `external_id` | string | ❌ | max: 50 |

---

## rankings

**Key**: `RANKINGS`  
**Fields**: 7

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `poll_type` | enum: AP Top 25 | Coaches Poll | ✅ | - |
| `team` | string | ✅ | min: 2, max: 50 |
| `rank` | number | ✅ | integer, min: 1, max: 25 |
| `points` | number | ❌ | integer, min: 0 |
| `first_place_votes` | number | ❌ | integer, min: 0 |

### Relationships

- team → teams

---

## leagues

**Key**: `LEAGUES`  
**Fields**: 13

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | min: 1, max: 100 |
| `commissioner` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `maxTeams` | number | ✅ | integer, min: 2, max: 32 |
| `currentTeams` | number | ✅ | integer, min: 0, max: 32, default: 0 |
| `draftType` | enum: snake | auction | ✅ | - |
| `gameMode` | enum: power4 | sec | acc | big12 | bigten | ✅ | - |
| `status` | enum: open | full | drafting | active | complete | ✅ | default: "open" |
| `isPublic` | boolean | ✅ | default: true |
| `pickTimeSeconds` | number | ✅ | integer, min: 30, max: 600, default: 90 |
| `scoringRules` | string | ❌ | max: 2000 |
| `draftDate` | date | ❌ | - |
| `password` | string | ❌ | max: 50 |

### Relationships

- commissioner → users

---

## user_teams

**Key**: `USER_TEAMS`  
**Fields**: 13

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `userId` | string | ✅ | min: 1, max: 50 |
| `teamName` | string | ✅ | min: 1, max: 100 |
| `abbreviation` | string | ❌ | max: 10 |
| `draftPosition` | number | ❌ | integer, min: 1 |
| `wins` | number | ✅ | integer, min: 0, default: 0 |
| `losses` | number | ✅ | integer, min: 0, default: 0 |
| `ties` | number | ✅ | integer, min: 0, default: 0 |
| `pointsFor` | number | ✅ | min: 0, default: 0 |
| `pointsAgainst` | number | ✅ | min: 0, default: 0 |
| `players` | string | ✅ | max: 5000, default: "[]" |
| `lineup` | string | ❌ | max: 5000 |
| `bench` | string | ❌ | max: 5000 |

### Relationships

- leagueId → leagues
- userId → users

---

## lineups

**Key**: `LINEUPS`  
**Fields**: 7

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `rosterId` | string | ✅ | min: 1, max: 50 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `lineup` | string | ❌ | max: 5000 |
| `bench` | string | ❌ | max: 5000 |
| `points` | number | ✅ | min: 0, default: 0 |
| `locked` | boolean | ✅ | default: false |

### Relationships

- rosterId → user_teams

---

## auctions

**Key**: `AUCTIONS`  
**Fields**: 8

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `currentPlayer` | string | ❌ | max: 50 |
| `currentBid` | number | ✅ | min: 0, default: 0 |
| `currentBidder` | string | ❌ | max: 50 |
| `timeRemaining` | number | ✅ | integer, min: 0, default: 0 |
| `status` | enum: waiting | active | complete | ✅ | default: "waiting" |
| `completedPlayers` | string | ✅ | max: 10000, default: "[]" |
| `nominatingTeam` | string | ❌ | max: 50 |

### Relationships

- leagueId → leagues

---

## bids

**Key**: `BIDS`  
**Fields**: 5

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `auctionId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `bidderId` | string | ✅ | min: 1, max: 50 |
| `amount` | number | ✅ | min: 1, max: 1000 |
| `timestamp` | date | ✅ | default: "2025-08-18T00:30:09.350Z" |

### Relationships

- auctionId → auctions
- playerId → college_players

---

## player_stats

**Key**: `PLAYER_STATS`  
**Fields**: 7

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `playerId` | string | ✅ | min: 1, max: 50 |
| `gameId` | string | ✅ | min: 1, max: 50 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `season` | number | ✅ | integer, min: 2020, max: 2030 |
| `stats` | string | ✅ | max: 2000 |
| `fantasy_points` | number | ✅ | default: 0 |
| `updated` | date | ✅ | default: "2025-08-18T00:30:09.351Z" |

### Relationships

- playerId → college_players
- gameId → games

---

## users

**Key**: `USERS`  
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | ✅ | email format |
| `name` | string | ❌ | min: 1, max: 100 |
| `emailVerification` | boolean | ✅ | default: false |
| `preferences` | string | ❌ | max: 2000 |
| `created` | date | ✅ | default: "2025-08-18T00:30:09.351Z" |
| `lastLogin` | date | ❌ | - |

---

## activity_log

**Key**: `ACTIVITY_LOG`  
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `userId` | string | ❌ | max: 50 |
| `action` | string | ✅ | min: 1, max: 100 |
| `details` | string | ❌ | max: 1000 |
| `timestamp` | date | ✅ | default: "2025-08-18T00:30:09.351Z" |
| `ip_address` | string | ❌ | max: 45 |
| `user_agent` | string | ❌ | max: 500 |

### Relationships

- userId → users

---

## Schema Statistics

- **Total Collections**: 12
- **Total Fields**: 111
- **Total Relationships**: 12
- **Required Fields**: 68
- **Optional Fields**: 43

### Field Type Distribution

- **string**: 54 fields
- **number**: 34 fields
- **enum**: 10 fields
- **date**: 8 fields
- **boolean**: 5 fields

---

## SSOT Benefits

✅ **Single Source of Truth**: All schemas defined in one place  
✅ **Type Safety**: Automatic TypeScript type generation  
✅ **Runtime Validation**: Built-in data validation functions  
✅ **Build Guards**: Automatic drift detection and validation  
✅ **Documentation**: Auto-generated documentation (this file)

---

*This documentation is automatically updated when the schema changes.*
