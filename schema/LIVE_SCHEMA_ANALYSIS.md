# Live Appwrite Schema Analysis

Generated: 2025-09-03T09:35:22.636Z

## Summary

Total Collections: 25

## Collections

| Collection Name | Collection ID | Attributes | Indexes |
|-----------------|---------------|------------|---------|
| activity_log | `activity_log` | 20 | 8 |
| AP Rankings | `rankings` | 9 | 7 |
| Auctions | `auctions` | 6 | 3 |
| Bids | `bids` | 11 | 3 |
| clients | `clients` | 6 | 2 |
| College Players | `college_players` | 16 | 7 |
| Database Migrations | `migrations` | 6 | 1 |
| Draft States | `draft_states` | 6 | 2 |
| draft_events | `draft_events` | 8 | 2 |
| drafts | `drafts` | 22 | 2 |
| fantasy_teams | `fantasy_teams` | 16 | 5 |
| Games | `games` | 16 | 5 |
| invites | `invites` | 9 | 2 |
| league_memberships | `league_memberships` | 7 | 3 |
| Leagues | `leagues` | 22 | 3 |
| Lineups | `lineups` | 8 | 1 |
| Matchups | `matchups` | 10 | 1 |
| meshy_jobs | `meshy_jobs` | 11 | 0 |
| Model Versions | `model_versions` | 11 | 4 |
| model_runs | `model_runs` | 13 | 1 |
| Player Stats | `player_stats` | 9 | 5 |
| projections | `projections` | 21 | 1 |
| roster_slots | `roster_slots` | 5 | 2 |
| schools | `schools` | 8 | 2 |
| Transactions | `transactions` | 7 | 3 |

## Detailed Schemas

### activity_log (`activity_log`)

**Attributes:**

- `userId`: string (max: 100)
- `action`: string *(required)* (max: 100)
- `details`: string (max: 100)
- `timestamp`: datetime *(required)*
- `type`: string *(required)* (max: 50)
- `teamId`: string (max: 255)
- `description`: string *(required)* (max: 1000)
- `data`: string (max: 5000)
- `createdAt`: datetime *(required)*
- `inviteToken`: string (max: 255)
- `status`: string (max: 50) [default: pending]
- `expiresAt`: datetime
- `ipAddress`: string (max: 45)
- `userAgent`: string (max: 500)
- `actorClientId`: string (max: 64)
- `objectType`: string (max: 24)
- `objectId`: string (max: 64)
- `leagueId`: string (max: 64)
- `ts`: datetime *(required)*
- `payloadJson`: string (max: 16384)

**Indexes:**

- `idx_type` (key): [type]
- `idx_user` (key): [userId]
- `idx_created` (key): [createdAt]
- `idx_invite_token` (unique): [inviteToken]
- `idx_status` (key): [status]
- `actor_idx` (key): [actorClientId]
- `object_idx` (key): [objectType, objectId]
- `league_idx` (key): [leagueId]

### AP Rankings (`rankings`)

**Attributes:**

- `week`: integer *(required)*
- `season`: integer *(required)*
- `pollType`: string *(required)* (max: 20)
- `team`: string *(required)* (max: 50)
- `rank`: integer *(required)*
- `points`: integer
- `firstPlaceVotes`: integer
- `source`: string *(required)* (max: 24)
- `schoolId`: string *(required)* (max: 64)

**Indexes:**

- `ranking_week` (key): [week, season]
- `ranking_season` (key): [season]
- `ranking_team` (key): [team]
- `ranking_ap` (key): [pollType]
- `ranking_order` (key): [rank]
- `by_source` (key): [season, week, source]
- `by_school` (key): [season, week, schoolId]

### Auctions (`auctions`)

**Attributes:**

- `leagueId`: string *(required)* (max: 50)
- `draftId`: string *(required)* (max: 64)
- `playerId`: string *(required)* (max: 64)
- `status`: string *(required)* (max: 16)
- `winnerTeamId`: string (max: 64)
- `winningBid`: double

**Indexes:**

- `auction_league` (key): [leagueId]
- `draft_idx` (key): [draftId]
- `lot_unique` (unique): [draftId, playerId]

### Bids (`bids`)

**Attributes:**

- `auctionId`: string *(required)* (max: 50)
- `playerId`: string *(required)* (max: 50)
- `teamId`: string *(required)* (max: 50)
- `amount`: double *(required)*
- `timestamp`: datetime *(required)*
- `isWinning`: boolean [default: false]
- `fantasyTeamId`: string *(required)* (max: 64)
- `leagueId`: string *(required)* (max: 64)
- `sessionId`: string *(required)* (max: 64)
- `userId`: string *(required)* (max: 64)
- `bidAmount`: integer *(required)*

**Indexes:**

- `bid_auction` (key): [auctionId]
- `bid_player` (key): [playerId]
- `auction_amount` (key): [amount]

### clients (`clients`)

**Attributes:**

- `authUserId`: string *(required)* (max: 64)
- `displayName`: string (max: 128)
- `email`: string (max: 256)
- `avatarUrl`: string (max: 512)
- `createdAt`: datetime *(required)*
- `lastLogin`: datetime

**Indexes:**

- `auth_user_id_unique` (unique): [authUserId]
- `email_idx` (key): [email]

### College Players (`college_players`)

**Attributes:**

- `name`: string *(required)* (max: 100)
- `position`: string *(required)* (max: 10)
- `team`: string *(required)* (max: 50)
- `conference`: string *(required)* (max: 20)
- `year`: string (max: 10)
- `jerseyNumber`: integer
- `height`: string (max: 10)
- `weight`: integer
- `eligible`: boolean
- `fantasyPoints`: double
- `seasonFantasyPoints`: double
- `depthChartOrder`: integer
- `schoolId`: string *(required)* (max: 64)
- `classYear`: string (max: 16)
- `cfbdId`: string (max: 32)
- `espnId`: string (max: 32)

**Indexes:**

- `position_idx` (key): [position]
- `team_idx` (key): [team]
- `points_idx` (key): [fantasyPoints]
- `name_search` (fulltext): [name]
- `school_idx` (key): [schoolId]
- `cfbd_idx` (key): [cfbdId]
- `espn_idx` (key): [espnId]

### Database Migrations (`migrations`)

**Attributes:**

- `migrationId`: string *(required)* (max: 255)
- `name`: string *(required)* (max: 255)
- `appliedAt`: datetime *(required)*
- `version`: string *(required)* (max: 100)
- `applied`: datetime *(required)*
- `checksum`: string *(required)* (max: 200)

**Indexes:**

- `migration_id_unique` (unique): [migrationId]

### Draft States (`draft_states`)

**Attributes:**

- `draftId`: string *(required)* (max: 255)
- `onClockTeamId`: string *(required)* (max: 255)
- `deadlineAt`: datetime
- `round`: integer *(required)*
- `pickIndex`: integer *(required)*
- `draftStatus`: string [default: pre-draft]

**Indexes:**

- `draft_unique_idx` (unique): [draftId]
- `deadline_scan_idx` (key): [draftStatus, deadlineAt]

### draft_events (`draft_events`)

**Attributes:**

- `draftId`: string *(required)* (max: 64)
- `type`: string *(required)* (max: 24)
- `round`: integer
- `overall`: integer
- `fantasyTeamId`: string (max: 64)
- `playerId`: string (max: 64)
- `ts`: datetime
- `payloadJson`: string (max: 8192)

**Indexes:**

- `by_overall` (key): [draftId, overall]
- `by_ts` (key): [draftId, ts]

### drafts (`drafts`)

**Attributes:**

- `leagueId`: string (max: 100)
- `draftStatus`: string (max: 100)
- `currentRound`: integer
- `currentPick`: integer
- `maxRounds`: integer
- `draftOrder`: string (max: 100)
- `startTime`: datetime
- `endTime`: datetime
- `type`: string (max: 16)
- `clockSeconds`: integer
- `orderJson`: string (max: 8192)
- `isMock`: boolean
- `leagueName`: string (max: 255)
- `gameMode`: string (max: 50)
- `selectedConference`: string (max: 50)
- `maxTeams`: integer
- `scoringRules`: string (max: 65535)
- `stateJson`: string (max: 1000000)
- `eventsJson`: string (max: 1000000)
- `picksJson`: string (max: 1000000)
- `onTheClock`: string (max: 255)
- `lastPickTime`: datetime

**Indexes:**

- `league_idx` (key): [leagueId]
- `status_start_idx` (key): [draftStatus, startTime]

### fantasy_teams (`fantasy_teams`)

**Attributes:**

- `leagueId`: string *(required)* (max: 64)
- `teamName`: string *(required)* (max: 128)
- `abbrev`: string (max: 8)
- `logoUrl`: string (max: 512)
- `wins`: integer
- `losses`: integer
- `ties`: integer
- `pointsFor`: double
- `pointsAgainst`: double
- `draftPosition`: integer
- `auctionBudgetTotal`: double
- `auctionBudgetRemaining`: double
- `displayName`: string (max: 255)
- `ownerAuthUserId`: string (max: 64)
- `leagueName`: string (max: 100)
- `players`: string (max: 64)

**Indexes:**

- `league_idx` (key): [leagueId]
- `owner_idx` (key): [ownerAuthUserId]
- `league_owner_idx` (key): [leagueId, ownerAuthUserId]
- `owner_teams_idx` (key): [ownerAuthUserId, leagueId]
- `league_owner_unique_idx` (unique): [leagueId, ownerAuthUserId]

### Games (`games`)

**Attributes:**

- `week`: integer *(required)*
- `season`: integer *(required)*
- `seasonType`: string *(required)* (max: 20)
- `date`: datetime *(required)*
- `homeTeam`: string *(required)* (max: 50)
- `awayTeam`: string *(required)* (max: 50)
- `homeScore`: integer
- `awayScore`: integer
- `status`: string (max: 20)
- `eligible`: boolean
- `startDate`: datetime *(required)*
- `completed`: boolean *(required)*
- `eligibleGame`: boolean *(required)*
- `homeSchoolId`: string *(required)* (max: 64)
- `awaySchoolId`: string *(required)* (max: 64)
- `kickoffAt`: datetime *(required)*

**Indexes:**

- `week_idx` (key): [week, season]
- `eligible_idx` (key): [eligibleGame]
- `season_week` (key): [season, week]
- `home_idx` (key): [homeSchoolId]
- `away_idx` (key): [awaySchoolId]

### invites (`invites`)

**Attributes:**

- `leagueId`: string *(required)* (max: 100)
- `email`: string (max: 100)
- `inviteCode`: string *(required)* (max: 100)
- `token`: string (max: 100)
- `status`: string (max: 100)
- `expiresAt`: datetime
- `createdAt`: datetime *(required)*
- `acceptedAt`: datetime
- `invitedByAuthUserId`: string (max: 255)

**Indexes:**

- `league_email` (key): [email]
- `token_unique` (unique): [token]

### league_memberships (`league_memberships`)

**Attributes:**

- `leagueId`: string *(required)* (max: 64)
- `authUserId`: string *(required)* (max: 64)
- `role`: string *(required)* (max: 16)
- `status`: string *(required)* (max: 16)
- `joinedAt`: datetime
- `displayName`: string (max: 255)
- `leagueName`: string (max: 100)

**Indexes:**

- `league_idx` (key): [leagueId]
- `member_idx` (key): [authUserId]
- `league_member_unique` (unique): [leagueId, authUserId]

### Leagues (`leagues`)

**Attributes:**

- `leagueName`: string *(required)* (max: 100)
- `season`: integer *(required)*
- `maxTeams`: integer
- `leagueStatus`: string (max: 20)
- `gameMode`: string (max: 20)
- `draftType`: string (max: 20)
- `isPublic`: boolean
- `currentTeams`: integer
- `pickTimeSeconds`: integer
- `draftDate`: datetime
- `selectedConference`: string (max: 50)
- `seasonStartWeek`: integer
- `playoffTeams`: integer
- `playoffStartWeek`: integer
- `waiverType`: string (max: 20)
- `waiverBudget`: integer
- `password`: string (max: 50)
- `commissionerAuthUserId`: string (max: 64)
- `scoringRules`: string (max: 65535)
- `draftOrder`: string (max: 65535)
- `phase`: string (max: 16) [default: scheduled]
- `engineVersion`: string (max: 3) [default: v2]

**Indexes:**

- `status_idx` (key): [leagueStatus]
- `public_idx` (key): [isPublic]
- `season_idx` (key): [season]

### Lineups (`lineups`)

**Attributes:**

- `rosterId`: string *(required)* (max: 50)
- `week`: integer *(required)*
- `season`: integer *(required)*
- `lineup`: string (max: 5000)
- `bench`: string (max: 5000)
- `points`: double [default: 0]
- `locked`: boolean [default: false]
- `fantasyTeamId`: string *(required)* (max: 64)

**Indexes:**

- `team_season_week_unique` (unique): [fantasyTeamId, season, week]

### Matchups (`matchups`)

**Attributes:**

- `leagueId`: string *(required)* (max: 64)
- `season`: integer *(required)*
- `week`: integer *(required)*
- `homeTeamId`: string *(required)* (max: 64)
- `awayTeamId`: string *(required)* (max: 64)
- `homePoints`: double
- `awayPoints`: double
- `status`: string (max: 16)
- `homeRosterId`: string *(required)* (max: 64)
- `awayRosterId`: string *(required)* (max: 64)

**Indexes:**

- `league_season_week` (key): [leagueId, season, week]

### meshy_jobs (`meshy_jobs`)

**Attributes:**

- `resultUrl`: string (max: 1024)
- `mode`: string (max: 32)
- `prompt`: string (max: 2048)
- `userId`: string (max: 128)
- `error`: string (max: 1024)
- `webhookSecret`: string (max: 256)
- `createdAt`: datetime *(required)*
- `imageUrl`: string (max: 1024)
- `baseModelUrl`: string (max: 1024)
- `status`: string (max: 16)
- `updatedAt`: datetime

### Model Versions (`model_versions`)

**Attributes:**

- `versionId`: string *(required)* (max: 100)
- `modelPath`: string *(required)* (max: 1000)
- `version`: integer *(required)*
- `changes`: string[] (max: 65536)
- `createdAt`: datetime *(required)*
- `createdBy`: string *(required)* (max: 100)
- `description`: string *(required)* (max: 1000)
- `glbUrl`: string
- `thumbnailUrl`: string
- `bucketFileId`: string (max: 100)
- `artifactUri`: string (max: 512)

**Indexes:**

- `versionId_idx` (key): [versionId]
- `version_idx` (key): [version]
- `createdAt_idx` (key): [createdAt]
- `createdBy_idx` (key): [createdBy]

### model_runs (`model_runs`)

**Attributes:**

- `season`: integer *(required)*
- `week`: integer
- `scope`: string *(required)* (max: 32)
- `sources`: string (max: 512)
- `status`: string *(required)* (max: 16)
- `runId`: string (max: 255)
- `modelVersionId`: string (max: 255)
- `startedAt`: datetime
- `finishedAt`: datetime
- `inputsJson`: string (max: 65535)
- `metricsJson`: string (max: 65535)
- `weightsJson`: string (max: 65535)
- `version`: integer *(required)*

**Indexes:**

- `season_week` (key): [season, week]

### Player Stats (`player_stats`)

**Attributes:**

- `playerId`: string *(required)* (max: 50)
- `gameId`: string *(required)* (max: 50)
- `week`: integer *(required)*
- `season`: integer *(required)*
- `stats`: string *(required)* (max: 2000)
- `opponent`: string (max: 50)
- `eligible`: boolean [default: true]
- `fantasyPoints`: double
- `statlineJson`: string (max: 65535)

**Indexes:**

- `stats_player` (key): [playerId]
- `stats_game` (key): [gameId]
- `stats_week` (key): [week, season]
- `stats_player_week` (unique): [playerId, week, season]
- `player_season_week` (key): [season, week]

### projections (`projections`)

**Attributes:**

- `playerId`: string *(required)* (max: 64)
- `season`: integer *(required)*
- `week`: integer
- `period`: string *(required)* (max: 16)
- `version`: integer *(required)*
- `model`: string (max: 32)
- `source`: string (max: 16)
- `clientId`: string (max: 64)
- `fantasyPoints`: double
- `componentsJson`: string (max: 16384)
- `boomProb`: double
- `bustProb`: double
- `homeAway`: string (max: 8)
- `injuryStatus`: string (max: 16)
- `opponentSchoolId`: string (max: 64)
- `rankPro`: integer
- `startSit_color`: string (max: 8)
- `utilizationTrend`: string (max: 16)
- `defenseVsPosGrade`: double
- `startSitColor`: string (max: 20)
- `teamTotalEst`: double

**Indexes:**

- `season_week_version` (key): [season, week, version]

### roster_slots (`roster_slots`)

**Attributes:**

- `fantasyTeamId`: string *(required)* (max: 64)
- `playerId`: string *(required)* (max: 64)
- `position`: string *(required)* (max: 8)
- `acquiredVia`: string (max: 16)
- `acquiredAt`: datetime

**Indexes:**

- `team_idx` (key): [fantasyTeamId]
- `team_player_idx` (key): [fantasyTeamId, playerId]

### schools (`schools`)

**Attributes:**

- `name`: string *(required)* (max: 128)
- `conference`: string *(required)* (max: 16)
- `slug`: string (max: 64)
- `abbreviation`: string (max: 16)
- `logoUrl`: string (max: 512)
- `primaryColor`: string (max: 16)
- `secondaryColor`: string (max: 16)
- `mascot`: string (max: 64)

**Indexes:**

- `slug_unique` (unique): [slug]
- `conference_idx` (key): [conference]

### Transactions (`transactions`)

**Attributes:**

- `leagueId`: string *(required)* (max: 64)
- `fantasyTeamId`: string *(required)* (max: 64)
- `type`: string *(required)* (max: 24)
- `payloadJson`: string (max: 8192)
- `season`: integer
- `week`: integer
- `ts`: datetime

**Indexes:**

- `league_idx` (key): [leagueId]
- `league_season_week` (key): [leagueId, season, week]
- `team_idx` (key): [fantasyTeamId]

