# Appwrite Schema Documentation

✅ **Updated**: All collections including `draft_picks` are now properly fetched using SDK with pagination.

Generated: 2025-09-03T09:47:51.070Z
Database: college-football-fantasy
Total Collections: 25

## Collections Overview

| Collection Name     | Collection ID        | Attributes | Indexes | Doc Security |
| ------------------- | -------------------- | ---------- | ------- | ------------ |
| activity_log        | `activity_log`       | 20         | 8       | No           |
| AP Rankings         | `rankings`           | 9          | 7       | No           |
| Auctions            | `auctions`           | 6          | 3       | No           |
| Bids                | `bids`               | 11         | 3       | No           |
| clients             | `clients`            | 6          | 2       | No           |
| College Players     | `college_players`    | 16         | 7       | No           |
| Database Migrations | `migrations`         | 6          | 1       | No           |
| Draft States        | `draft_states`       | 6          | 2       | Yes          |
| draft_events        | `draft_events`       | 8          | 2       | No           |
| drafts              | `drafts`             | 22         | 2       | No           |
| fantasy_teams       | `fantasy_teams`      | 16         | 5       | No           |
| Games               | `games`              | 16         | 5       | No           |
| invites             | `invites`            | 9          | 2       | No           |
| league_memberships  | `league_memberships` | 7          | 3       | No           |
| Leagues             | `leagues`            | 22         | 3       | No           |
| Lineups             | `lineups`            | 8          | 1       | No           |
| Matchups            | `matchups`           | 10         | 1       | No           |
| meshy_jobs          | `meshy_jobs`         | 11         | 0       | No           |
| Model Versions      | `model_versions`     | 11         | 4       | No           |
| model_runs          | `model_runs`         | 13         | 1       | No           |
| Player Stats        | `player_stats`       | 9          | 5       | No           |
| projections         | `projections`        | 21         | 1       | No           |
| roster_slots        | `roster_slots`       | 5          | 2       | No           |
| schools             | `schools`            | 8          | 2       | No           |
| Transactions        | `transactions`       | 7          | 3       | No           |

## Collection Details

### activity_log (`activity_log`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `userId` | string | ❌ | max: 100 |
| `action` | string | ✅ | max: 100 |
| `details` | string | ❌ | max: 100 |
| `timestamp` | datetime | ✅ | - |
| `type` | string | ✅ | max: 50 |
| `teamId` | string | ❌ | max: 255 |
| `description` | string | ✅ | max: 1000 |
| `data` | string | ❌ | max: 5000 |
| `createdAt` | datetime | ✅ | - |
| `inviteToken` | string | ❌ | max: 255 |
| `status` | string | ❌ | max: 50, default: pending |
| `expiresAt` | datetime | ❌ | - |
| `ipAddress` | string | ❌ | max: 45 |
| `userAgent` | string | ❌ | max: 500 |
| `actorClientId` | string | ❌ | max: 64 |
| `objectType` | string | ❌ | max: 24 |
| `objectId` | string | ❌ | max: 64 |
| `leagueId` | string | ❌ | max: 64 |
| `ts` | datetime | ✅ | - |
| `payloadJson` | string | ❌ | max: 16384 |

**Indexes:**

- `idx_type` (📍 KEY): [type]
- `idx_user` (📍 KEY): [userId]
- `idx_created` (📍 KEY): [createdAt]
- `idx_invite_token` (🔑 UNIQUE): [inviteToken]
- `idx_status` (📍 KEY): [status]
- `actor_idx` (📍 KEY): [actorClientId]
- `object_idx` (📍 KEY): [objectType, objectId]
- `league_idx` (📍 KEY): [leagueId]

---

### AP Rankings (`rankings`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `week` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `season` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `pollType` | string | ✅ | max: 20 |
| `team` | string | ✅ | max: 50 |
| `rank` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `points` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `firstPlaceVotes` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `source` | string | ✅ | max: 24 |
| `schoolId` | string | ✅ | max: 64 |

**Indexes:**

- `ranking_week` (📍 KEY): [week, season]
- `ranking_season` (📍 KEY): [season]
- `ranking_team` (📍 KEY): [team]
- `ranking_ap` (📍 KEY): [pollType]
- `ranking_order` (📍 KEY): [rank]
- `by_source` (📍 KEY): [season, week, source]
- `by_school` (📍 KEY): [season, week, schoolId]

---

### Auctions (`auctions`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ✅ | max: 50 |
| `draftId` | string | ✅ | max: 64 |
| `playerId` | string | ✅ | max: 64 |
| `status` | string | ✅ | max: 16 |
| `winnerTeamId` | string | ❌ | max: 64 |
| `winningBid` | double | ❌ | - |

**Indexes:**

- `auction_league` (📍 KEY): [leagueId]
- `draft_idx` (📍 KEY): [draftId]
- `lot_unique` (🔑 UNIQUE): [draftId, playerId]

---

### Bids (`bids`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `auctionId` | string | ✅ | max: 50 |
| `playerId` | string | ✅ | max: 50 |
| `teamId` | string | ✅ | max: 50 |
| `amount` | double | ✅ | - |
| `timestamp` | datetime | ✅ | - |
| `isWinning` | boolean | ❌ | default: false |
| `fantasyTeamId` | string | ✅ | max: 64 |
| `leagueId` | string | ✅ | max: 64 |
| `sessionId` | string | ✅ | max: 64 |
| `userId` | string | ✅ | max: 64 |
| `bidAmount` | integer | ✅ | 1 to 9223372036854775807 |

**Indexes:**

- `bid_auction` (📍 KEY): [auctionId]
- `bid_player` (📍 KEY): [playerId]
- `auction_amount` (📍 KEY): [amount]

---

### clients (`clients`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `authUserId` | string | ✅ | max: 64 |
| `displayName` | string | ❌ | max: 128 |
| `email` | string | ❌ | max: 256 |
| `avatarUrl` | string | ❌ | max: 512 |
| `createdAt` | datetime | ✅ | - |
| `lastLogin` | datetime | ❌ | - |

**Indexes:**

- `auth_user_id_unique` (🔑 UNIQUE): [authUserId]
- `email_idx` (📍 KEY): [email]

---

### College Players (`college_players`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `name` | string | ✅ | max: 100 |
| `position` | string | ✅ | max: 10 |
| `team` | string | ✅ | max: 50 |
| `conference` | string | ✅ | max: 20 |
| `year` | string | ❌ | max: 10 |
| `jerseyNumber` | integer | ❌ | \* to 99 |
| `height` | string | ❌ | max: 10 |
| `weight` | integer | ❌ | 150 to 400 |
| `eligible` | boolean | ❌ | - |
| `fantasyPoints` | double | ❌ | - |
| `seasonFantasyPoints` | double | ❌ | - |
| `depthChartOrder` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `schoolId` | string | ✅ | max: 64 |
| `classYear` | string | ❌ | max: 16 |
| `cfbdId` | string | ❌ | max: 32 |
| `espnId` | string | ❌ | max: 32 |

**Indexes:**

- `position_idx` (📍 KEY): [position]
- `team_idx` (📍 KEY): [team]
- `points_idx` (📍 KEY): [fantasyPoints]
- `name_search` (📍 KEY): [name]
- `school_idx` (📍 KEY): [schoolId]
- `cfbd_idx` (📍 KEY): [cfbdId]
- `espn_idx` (📍 KEY): [espnId]

---

### Database Migrations (`migrations`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `migrationId` | string | ✅ | max: 255 |
| `name` | string | ✅ | max: 255 |
| `appliedAt` | datetime | ✅ | - |
| `version` | string | ✅ | max: 100 |
| `applied` | datetime | ✅ | - |
| `checksum` | string | ✅ | max: 200 |

**Indexes:**

- `migration_id_unique` (🔑 UNIQUE): [migrationId]

---

### Draft States (`draft_states`)

⚠️ **Document Security**: ENABLED

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `draftId` | string | ✅ | max: 255 |
| `onClockTeamId` | string | ✅ | max: 255 |
| `deadlineAt` | datetime | ❌ | - |
| `round` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `pickIndex` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `draftStatus` | string | ❌ | default: pre-draft |

**Indexes:**

- `draft_unique_idx` (🔑 UNIQUE): [draftId]
- `deadline_scan_idx` (📍 KEY): [draftStatus, deadlineAt]

---

### draft_events (`draft_events`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `draftId` | string | ✅ | max: 64 |
| `type` | string | ✅ | max: 24 |
| `round` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `overall` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `fantasyTeamId` | string | ❌ | max: 64 |
| `playerId` | string | ❌ | max: 64 |
| `ts` | datetime | ❌ | - |
| `payloadJson` | string | ❌ | max: 8192 |

**Indexes:**

- `by_overall` (📍 KEY): [draftId, overall]
- `by_ts` (📍 KEY): [draftId, ts]

---

### drafts (`drafts`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ❌ | max: 100 |
| `draftStatus` | string | ❌ | max: 100 |
| `currentRound` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `currentPick` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `maxRounds` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `draftOrder` | string | ❌ | max: 100 |
| `startTime` | datetime | ❌ | - |
| `endTime` | datetime | ❌ | - |
| `type` | string | ❌ | max: 16 |
| `clockSeconds` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `orderJson` | string | ❌ | max: 8192 |
| `isMock` | boolean | ❌ | - |
| `leagueName` | string | ❌ | max: 255 |
| `gameMode` | string | ❌ | max: 50 |
| `selectedConference` | string | ❌ | max: 50 |
| `maxTeams` | integer | ❌ | 4 to 24 |
| `scoringRules` | string | ❌ | max: 65535 |
| `stateJson` | string | ❌ | max: 1000000 |
| `eventsJson` | string | ❌ | max: 1000000 |
| `picksJson` | string | ❌ | max: 1000000 |
| `onTheClock` | string | ❌ | max: 255 |
| `lastPickTime` | datetime | ❌ | - |

**Indexes:**

- `league_idx` (📍 KEY): [leagueId]
- `status_start_idx` (📍 KEY): [draftStatus, startTime]

---

### fantasy_teams (`fantasy_teams`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ✅ | max: 64 |
| `teamName` | string | ✅ | max: 128 |
| `abbrev` | string | ❌ | max: 8 |
| `logoUrl` | string | ❌ | max: 512 |
| `wins` | integer | ❌ | _ to 25 |
| `losses` | integer | ❌ | _ to 25 |
| `ties` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `pointsFor` | double | ❌ | - |
| `pointsAgainst` | double | ❌ | - |
| `draftPosition` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `auctionBudgetTotal` | double | ❌ | - |
| `auctionBudgetRemaining` | double | ❌ | - |
| `displayName` | string | ❌ | max: 255 |
| `ownerAuthUserId` | string | ❌ | max: 64 |
| `leagueName` | string | ❌ | max: 100 |
| `players` | string | ❌ | max: 64 |

**Indexes:**

- `league_idx` (📍 KEY): [leagueId]
- `owner_idx` (📍 KEY): [ownerAuthUserId]
- `league_owner_idx` (📍 KEY): [leagueId, ownerAuthUserId]
- `owner_teams_idx` (📍 KEY): [ownerAuthUserId, leagueId]
- `league_owner_unique_idx` (🔑 UNIQUE): [leagueId, ownerAuthUserId]

---

### Games (`games`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `week` | integer | ✅ | 1 to 20 |
| `season` | integer | ✅ | 2020 to 2030 |
| `seasonType` | string | ✅ | max: 20 |
| `date` | datetime | ✅ | - |
| `homeTeam` | string | ✅ | max: 50 |
| `awayTeam` | string | ✅ | max: 50 |
| `homeScore` | integer | ❌ | _ to 200 |
| `awayScore` | integer | ❌ | _ to 200 |
| `status` | string | ❌ | max: 20 |
| `eligible` | boolean | ❌ | - |
| `startDate` | datetime | ✅ | - |
| `completed` | boolean | ✅ | - |
| `eligibleGame` | boolean | ✅ | - |
| `homeSchoolId` | string | ✅ | max: 64 |
| `awaySchoolId` | string | ✅ | max: 64 |
| `kickoffAt` | datetime | ✅ | - |

**Indexes:**

- `week_idx` (📍 KEY): [week, season]
- `eligible_idx` (📍 KEY): [eligibleGame]
- `season_week` (📍 KEY): [season, week]
- `home_idx` (📍 KEY): [homeSchoolId]
- `away_idx` (📍 KEY): [awaySchoolId]

---

### invites (`invites`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ✅ | max: 100 |
| `email` | string | ❌ | max: 100 |
| `inviteCode` | string | ✅ | max: 100 |
| `token` | string | ❌ | max: 100 |
| `status` | string | ❌ | max: 100 |
| `expiresAt` | datetime | ❌ | - |
| `createdAt` | datetime | ✅ | - |
| `acceptedAt` | datetime | ❌ | - |
| `invitedByAuthUserId` | string | ❌ | max: 255 |

**Indexes:**

- `league_email` (📍 KEY): [email]
- `token_unique` (🔑 UNIQUE): [token]

---

### league_memberships (`league_memberships`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ✅ | max: 64 |
| `authUserId` | string | ✅ | max: 64 |
| `role` | string | ✅ | max: 16 |
| `status` | string | ✅ | max: 16 |
| `joinedAt` | datetime | ❌ | - |
| `displayName` | string | ❌ | max: 255 |
| `leagueName` | string | ❌ | max: 100 |

**Indexes:**

- `league_idx` (📍 KEY): [leagueId]
- `member_idx` (📍 KEY): [authUserId]
- `league_member_unique` (🔑 UNIQUE): [leagueId, authUserId]

---

### Leagues (`leagues`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueName` | string | ✅ | max: 100 |
| `season` | integer | ✅ | 2020 to 2030 |
| `maxTeams` | integer | ❌ | 2 to 32 |
| `leagueStatus` | string | ❌ | max: 20 |
| `gameMode` | string | ❌ | max: 20 |
| `draftType` | string | ❌ | max: 20 |
| `isPublic` | boolean | ❌ | - |
| `currentTeams` | integer | ❌ | _ to 20 |
| `pickTimeSeconds` | integer | ❌ | 30 to 600 |
| `draftDate` | datetime | ❌ | - |
| `selectedConference` | string | ❌ | max: 50 |
| `seasonStartWeek` | integer | ❌ | 1 to 20 |
| `playoffTeams` | integer | ❌ | _ to 20 |
| `playoffStartWeek` | integer | ❌ | 1 to 20 |
| `waiverType` | string | ❌ | max: 20 |
| `waiverBudget` | integer | ❌ | \* to 1000 |
| `password` | string | ❌ | max: 50 |
| `commissionerAuthUserId` | string | ❌ | max: 64 |
| `scoringRules` | string | ❌ | max: 65535 |
| `draftOrder` | string | ❌ | max: 65535 |
| `phase` | string | ❌ | max: 16, default: scheduled |
| `engineVersion` | string | ❌ | max: 3, default: v2 |

**Indexes:**

- `status_idx` (📍 KEY): [leagueStatus]
- `public_idx` (📍 KEY): [isPublic]
- `season_idx` (📍 KEY): [season]

---

### Lineups (`lineups`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `rosterId` | string | ✅ | max: 50 |
| `week` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `season` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `lineup` | string | ❌ | max: 5000 |
| `bench` | string | ❌ | max: 5000 |
| `points` | double | ❌ | default: 0 |
| `locked` | boolean | ❌ | default: false |
| `fantasyTeamId` | string | ✅ | max: 64 |

**Indexes:**

- `team_season_week_unique` (🔑 UNIQUE): [fantasyTeamId, season, week]

---

### Matchups (`matchups`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ✅ | max: 64 |
| `season` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `week` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `homeTeamId` | string | ✅ | max: 64 |
| `awayTeamId` | string | ✅ | max: 64 |
| `homePoints` | double | ❌ | - |
| `awayPoints` | double | ❌ | - |
| `status` | string | ❌ | max: 16 |
| `homeRosterId` | string | ✅ | max: 64 |
| `awayRosterId` | string | ✅ | max: 64 |

**Indexes:**

- `league_season_week` (📍 KEY): [leagueId, season, week]

---

### meshy_jobs (`meshy_jobs`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `resultUrl` | string | ❌ | max: 1024 |
| `mode` | string | ❌ | max: 32 |
| `prompt` | string | ❌ | max: 2048 |
| `userId` | string | ❌ | max: 128 |
| `error` | string | ❌ | max: 1024 |
| `webhookSecret` | string | ❌ | max: 256 |
| `createdAt` | datetime | ✅ | - |
| `imageUrl` | string | ❌ | max: 1024 |
| `baseModelUrl` | string | ❌ | max: 1024 |
| `status` | string | ❌ | max: 16 |
| `updatedAt` | datetime | ❌ | - |

---

### Model Versions (`model_versions`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `versionId` | string | ✅ | max: 100 |
| `modelPath` | string | ✅ | max: 1000 |
| `version` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `changes` | string[] | ❌ | max: 65536 |
| `createdAt` | datetime | ✅ | - |
| `createdBy` | string | ✅ | max: 100 |
| `description` | string | ✅ | max: 1000 |
| `glbUrl` | string | ❌ | - |
| `thumbnailUrl` | string | ❌ | - |
| `bucketFileId` | string | ❌ | max: 100 |
| `artifactUri` | string | ❌ | max: 512 |

**Indexes:**

- `versionId_idx` (📍 KEY): [versionId]
- `version_idx` (📍 KEY): [version]
- `createdAt_idx` (📍 KEY): [createdAt]
- `createdBy_idx` (📍 KEY): [createdBy]

---

### model_runs (`model_runs`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `season` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `week` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `scope` | string | ✅ | max: 32 |
| `sources` | string | ❌ | max: 512 |
| `status` | string | ✅ | max: 16 |
| `runId` | string | ❌ | max: 255 |
| `modelVersionId` | string | ❌ | max: 255 |
| `startedAt` | datetime | ❌ | - |
| `finishedAt` | datetime | ❌ | - |
| `inputsJson` | string | ❌ | max: 65535 |
| `metricsJson` | string | ❌ | max: 65535 |
| `weightsJson` | string | ❌ | max: 65535 |
| `version` | integer | ✅ | 1 to 9223372036854775807 |

**Indexes:**

- `season_week` (📍 KEY): [season, week]

---

### Player Stats (`player_stats`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `playerId` | string | ✅ | max: 50 |
| `gameId` | string | ✅ | max: 50 |
| `week` | integer | ✅ | 1 to 20 |
| `season` | integer | ✅ | 2020 to 2030 |
| `stats` | string | ✅ | max: 2000 |
| `opponent` | string | ❌ | max: 50 |
| `eligible` | boolean | ❌ | default: true |
| `fantasyPoints` | double | ❌ | - |
| `statlineJson` | string | ❌ | max: 65535 |

**Indexes:**

- `stats_player` (📍 KEY): [playerId]
- `stats_game` (📍 KEY): [gameId]
- `stats_week` (📍 KEY): [week, season]
- `stats_player_week` (🔑 UNIQUE): [playerId, week, season]
- `player_season_week` (📍 KEY): [season, week]

---

### projections (`projections`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `playerId` | string | ✅ | max: 64 |
| `season` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `week` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `period` | string | ✅ | max: 16 |
| `version` | integer | ✅ | -9223372036854775808 to 9223372036854775807 |
| `model` | string | ❌ | max: 32 |
| `source` | string | ❌ | max: 16 |
| `clientId` | string | ❌ | max: 64 |
| `fantasyPoints` | double | ❌ | - |
| `componentsJson` | string | ❌ | max: 16384 |
| `boomProb` | double | ❌ | - |
| `bustProb` | double | ❌ | - |
| `homeAway` | string | ❌ | max: 8 |
| `injuryStatus` | string | ❌ | max: 16 |
| `opponentSchoolId` | string | ❌ | max: 64 |
| `rankPro` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `startSit_color` | string | ❌ | max: 8 |
| `utilizationTrend` | string | ❌ | max: 16 |
| `defenseVsPosGrade` | double | ❌ | - |
| `startSitColor` | string | ❌ | max: 20 |
| `teamTotalEst` | double | ❌ | - |

**Indexes:**

- `season_week_version` (📍 KEY): [season, week, version]

---

### roster_slots (`roster_slots`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `fantasyTeamId` | string | ✅ | max: 64 |
| `playerId` | string | ✅ | max: 64 |
| `position` | string | ✅ | max: 8 |
| `acquiredVia` | string | ❌ | max: 16 |
| `acquiredAt` | datetime | ❌ | - |

**Indexes:**

- `team_idx` (📍 KEY): [fantasyTeamId]
- `team_player_idx` (📍 KEY): [fantasyTeamId, playerId]

---

### schools (`schools`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `name` | string | ✅ | max: 128 |
| `conference` | string | ✅ | max: 16 |
| `slug` | string | ❌ | max: 64 |
| `abbreviation` | string | ❌ | max: 16 |
| `logoUrl` | string | ❌ | max: 512 |
| `primaryColor` | string | ❌ | max: 16 |
| `secondaryColor` | string | ❌ | max: 16 |
| `mascot` | string | ❌ | max: 64 |

**Indexes:**

- `slug_unique` (🔑 UNIQUE): [slug]
- `conference_idx` (📍 KEY): [conference]

---

### Transactions (`transactions`)

**Attributes:**

| Field | Type | Required | Details |
|-------|------|----------|---------||
| `leagueId` | string | ✅ | max: 64 |
| `fantasyTeamId` | string | ✅ | max: 64 |
| `type` | string | ✅ | max: 24 |
| `payloadJson` | string | ❌ | max: 8192 |
| `season` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `week` | integer | ❌ | -9223372036854775808 to 9223372036854775807 |
| `ts` | datetime | ❌ | - |

**Indexes:**

- `league_idx` (📍 KEY): [leagueId]
- `league_season_week` (📍 KEY): [leagueId, season, week]
- `team_idx` (📍 KEY): [fantasyTeamId]

---
