# Schema Documentation

**Generated from SSOT**: `schema/zod-schema.ts`  
**Generated at**: 2025-08-19T02:41:49.243Z  
**Collections**: 32

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
- [auction_sessions](#auctionsessions)
- [bids](#bids)
- [auction_bids](#auctionbids)
- [player_stats](#playerstats)
- [users](#users)
- [activity_log](#activitylog)
- [draft_picks](#draftpicks)
- [mock_drafts](#mockdrafts)
- [mock_draft_picks](#mockdraftpicks)
- [mock_draft_participants](#mockdraftparticipants)
- [drafts](#drafts)
- [matchups](#matchups)
- [scores](#scores)
- [player_projections](#playerprojections)
- [projections_yearly](#projectionsyearly)
- [projections_weekly](#projectionsweekly)
- [model_inputs](#modelinputs)
- [user_custom_projections](#usercustomprojections)
- [draft_events](#draftevents)
- [draft_states](#draftstates)
- [league_memberships](#leaguememberships)
- [projection_runs](#projectionruns)
- [projection_run_metrics](#projectionrunmetrics)
- [team_budgets](#teambudgets)

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
**Fields**: 17

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
| `selectedConference` | string | ❌ | max: 50 |
| `status` | enum: open | full | drafting | active | complete | ✅ | default: "open" |
| `isPublic` | boolean | ✅ | default: true |
| `pickTimeSeconds` | number | ✅ | integer, min: 30, max: 600, default: 90 |
| `scoringRules` | string | ❌ | max: 2000 |
| `draftDate` | date | ❌ | - |
| `seasonStartWeek` | number | ❌ | integer, min: 1, max: 20 |
| `playoffTeams` | number | ❌ | integer, min: 0, max: 20 |
| `playoffStartWeek` | number | ❌ | integer, min: 1, max: 20 |
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
**Fields**: 7

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

## auction_sessions

**Key**: `AUCTION_SESSIONS`  
**Fields**: 7

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
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `sessionId` | string | ✅ | min: 1, max: 50 |
| `userId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `bidAmount` | number | ✅ | min: 1 |
| `timestamp` | date | ✅ | - |

### Relationships

- leagueId → leagues
- userId → users
- playerId → college_players

---

## auction_bids

**Key**: `AUCTION_BIDS`  
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `sessionId` | string | ✅ | min: 1, max: 50 |
| `userId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `bidAmount` | number | ✅ | min: 1 |
| `timestamp` | date | ✅ | - |

### Relationships

- leagueId → leagues
- userId → users
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
| `updated` | date | ✅ | default: "2025-08-19T02:41:49.241Z" |

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
| `created` | date | ✅ | default: "2025-08-19T02:41:49.243Z" |
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
| `timestamp` | date | ✅ | default: "2025-08-19T02:41:49.243Z" |
| `ip_address` | string | ❌ | max: 45 |
| `user_agent` | string | ❌ | max: 500 |

### Relationships

- userId → users

---

## draft_picks

**Key**: `DRAFT_PICKS`  
**Fields**: 10

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `teamId` | string | ✅ | min: 1, max: 50 |
| `rosterId` | string | ❌ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `playerName` | string | ✅ | min: 1, max: 120 |
| `position` | enum: QB | RB | WR | TE | K | ✅ | - |
| `round` | number | ✅ | integer, min: 1 |
| `pick` | number | ✅ | integer, min: 1 |
| `overallPick` | number | ✅ | integer, min: 1 |
| `timestamp` | string | ❌ | - |

### Relationships

- leagueId → leagues
- teamId → teams
- rosterId → user_teams
- playerId → college_players

---

## mock_drafts

**Key**: `MOCK_DRAFTS`  
**Fields**: 4

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | ❌ | min: 1, max: 100 |
| `numTeams` | number | ✅ | integer, min: 2, max: 24 |
| `status` | enum: waiting | active | complete | ✅ | default: "waiting" |
| `settings` | string | ❌ | max: 5000 |

---

## mock_draft_picks

**Key**: `MOCK_DRAFT_PICKS`  
**Fields**: 5

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `draftId` | string | ✅ | min: 1, max: 50 |
| `participantId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `round` | number | ✅ | integer, min: 1 |
| `pick` | number | ✅ | integer, min: 1 |

### Relationships

- draftId → drafts
- playerId → college_players

---

## mock_draft_participants

**Key**: `MOCK_DRAFT_PARTICIPANTS`  
**Fields**: 3

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `draftId` | string | ✅ | min: 1, max: 50 |
| `name` | string | ✅ | min: 1, max: 100 |
| `slot` | number | ✅ | integer, min: 1, max: 24 |

### Relationships

- draftId → drafts

---

## drafts

**Key**: `DRAFTS`  
**Fields**: 8

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `status` | string | ✅ | min: 1, max: 20 |
| `currentRound` | number | ❌ | integer, min: 1 |
| `currentPick` | number | ❌ | integer, min: 1 |
| `maxRounds` | number | ❌ | integer, min: 1 |
| `draftOrder` | string | ❌ | max: 1000 |
| `startTime` | date | ❌ | - |
| `endTime` | date | ❌ | - |

### Relationships

- leagueId → leagues

---

## matchups

**Key**: `MATCHUPS`  
**Fields**: 8

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

## scores

**Key**: `SCORES`  
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `rosterId` | string | ✅ | min: 1, max: 50 |
| `points` | number | ✅ | min: 0 |
| `opponentId` | string | ❌ | min: 1, max: 50 |
| `result` | string | ❌ | max: 20 |

### Relationships

- leagueId → leagues
- rosterId → user_teams

---

## player_projections

**Key**: `PLAYER_PROJECTIONS`  
**Fields**: 8

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `playerId` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `week` | number | ❌ | integer, min: 1, max: 20 |
| `version` | number | ✅ | integer, min: 1, default: 1 |
| `points` | number | ❌ | - |
| `components` | string | ❌ | max: 10000 |
| `fantasy_points` | number | ❌ | - |
| `data` | string | ❌ | max: 10000 |

### Relationships

- playerId → college_players

---

## projections_yearly

**Key**: `PROJECTIONS_YEARLY`  
**Fields**: 3

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `playerId` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `fantasy_points` | number | ❌ | - |

### Relationships

- playerId → college_players

---

## projections_weekly

**Key**: `PROJECTIONS_WEEKLY`  
**Fields**: 4

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `playerId` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `week` | number | ✅ | integer, min: 1, max: 20 |
| `fantasy_points` | number | ❌ | - |

### Relationships

- playerId → college_players

---

## model_inputs

**Key**: `MODEL_INPUTS`  
**Fields**: 8

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `depth_chart_json` | string | ❌ | - |
| `team_pace_json` | string | ❌ | - |
| `pass_rush_rates_json` | string | ❌ | - |
| `opponent_grades_by_pos_json` | string | ❌ | - |
| `injury_reports_json` | string | ❌ | - |
| `vegas_json` | string | ❌ | - |
| `manual_overrides_json` | string | ❌ | - |

---

## user_custom_projections

**Key**: `USER_CUSTOM_PROJECTIONS`  
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `userId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ✅ | min: 1, max: 50 |
| `season` | number | ✅ | integer, min: 2020, max: 2035 |
| `week` | number | ❌ | integer, min: 1, max: 20 |
| `fantasy_points` | number | ❌ | - |
| `notes` | string | ❌ | max: 2000 |

### Relationships

- userId → users
- playerId → college_players

---

## draft_events

**Key**: `DRAFT_EVENTS`  
**Fields**: 8

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `draftId` | string | ✅ | min: 1, max: 50 |
| `ts` | date | ✅ | - |
| `type` | enum: pick | autopick | undo | pause | resume | ✅ | - |
| `teamId` | string | ✅ | min: 1, max: 50 |
| `playerId` | string | ❌ | min: 1, max: 50 |
| `round` | number | ✅ | integer, min: 1 |
| `overall` | number | ✅ | integer, min: 1 |
| `by` | string | ❌ | min: 1, max: 50 |

### Relationships

- draftId → drafts
- teamId → teams
- playerId → college_players

---

## draft_states

**Key**: `DRAFT_STATES`  
**Fields**: 6

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `draftId` | string | ✅ | min: 1, max: 50 |
| `onClockTeamId` | string | ✅ | min: 1, max: 50 |
| `deadlineAt` | date | ✅ | - |
| `round` | number | ✅ | integer, min: 1 |
| `pickIndex` | number | ✅ | integer, min: 1 |
| `status` | enum: active | paused | complete | ✅ | default: "active" |

### Relationships

- draftId → drafts

---

## league_memberships

**Key**: `LEAGUE_MEMBERSHIPS`  
**Fields**: 3

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `userId` | string | ✅ | min: 1, max: 50 |
| `role` | enum: commissioner | member | viewer | ✅ | default: "member" |

### Relationships

- leagueId → leagues
- userId → users

---

## projection_runs

**Key**: `PROJECTION_RUNS`  
**Fields**: 11

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

## projection_run_metrics

**Key**: `PROJECTION_RUN_METRICS`  
**Fields**: 2

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `runId` | string | ✅ | min: 1, max: 64 |
| `metrics` | string | ✅ | max: 10000 |

---

## team_budgets

**Key**: `TEAM_BUDGETS`  
**Fields**: 5

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `leagueId` | string | ✅ | min: 1, max: 50 |
| `userId` | string | ✅ | min: 1, max: 50 |
| `budget` | number | ✅ | min: 0 |
| `spent` | number | ❌ | min: 0 |
| `remaining` | number | ❌ | min: 0 |

### Relationships

- leagueId → leagues
- userId → users

---

## Schema Statistics

- **Total Collections**: 32
- **Total Fields**: 236
- **Total Relationships**: 41
- **Required Fields**: 142
- **Optional Fields**: 94

### Field Type Distribution

- **string**: 117 fields
- **number**: 78 fields
- **date**: 19 fields
- **enum**: 17 fields
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
