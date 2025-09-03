# Current Appwrite Schema

**Database:** college-football-fantasy
**Updated:** 2025-09-03T09:05:14.158Z

## AP Rankings (rankings)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| week | integer | ✅ | `null` | - | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| pollType | string | ✅ | `null` | 20 | ✅ |
| team | string | ✅ | `null` | 50 | ✅ |
| rank | integer | ✅ | `null` | - | ✅ |
| points | integer | ❌ | `null` | - | ✅ |
| firstPlaceVotes | integer | ❌ | `null` | - | ✅ |
| source | string | ✅ | `null` | 24 | ✅ |
| schoolId | string | ✅ | `null` | 64 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| ranking_week | key | week, season | ✅ |
| ranking_season | key | season | ✅ |
| ranking_team | key | team | ✅ |
| ranking_ap | key | pollType | ✅ |
| ranking_order | key | rank | ✅ |
| by_source | key | season, week, source | ✅ |
| by_school | key | season, week, schoolId | ✅ |

---

## Matchups (matchups)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ✅ | `null` | 64 | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| week | integer | ✅ | `null` | - | ✅ |
| homeTeamId | string | ✅ | `null` | 64 | ✅ |
| awayTeamId | string | ✅ | `null` | 64 | ✅ |
| homePoints | double | ❌ | `null` | - | ✅ |
| awayPoints | double | ❌ | `null` | - | ✅ |
| status | string | ❌ | `null` | 16 | ✅ |
| homeRosterId | string | ✅ | `null` | 64 | ✅ |
| awayRosterId | string | ✅ | `null` | 64 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| league_season_week | key | leagueId, season, week | ✅ |

---

## Player Stats (player_stats)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| playerId | string | ✅ | `null` | 50 | ✅ |
| gameId | string | ✅ | `null` | 50 | ✅ |
| week | integer | ✅ | `null` | - | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| stats | string | ✅ | `null` | 2000 | ✅ |
| opponent | string | ❌ | `null` | 50 | ✅ |
| eligible | boolean | ❌ | `true` | - | ✅ |
| fantasyPoints | double | ❌ | `null` | - | ✅ |
| statlineJson | string | ❌ | `null` | 65535 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| stats_player | key | playerId | ✅ |
| stats_game | key | gameId | ✅ |
| stats_week | key | week, season | ✅ |
| stats_player_week | unique | playerId, week, season | ✅ |
| player_season_week | key | season, week | ✅ |

---

## drafts (drafts)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ❌ | `null` | 100 | ✅ |
| draftStatus | string | ❌ | `null` | 100 | ✅ |
| currentRound | integer | ❌ | `null` | - | ✅ |
| currentPick | integer | ❌ | `null` | - | ✅ |
| maxRounds | integer | ❌ | `null` | - | ✅ |
| draftOrder | string | ❌ | `null` | 100 | ✅ |
| startTime | datetime | ❌ | `null` | - | ✅ |
| endTime | datetime | ❌ | `null` | - | ✅ |
| type | string | ❌ | `null` | 16 | ✅ |
| clockSeconds | integer | ❌ | `null` | - | ✅ |
| orderJson | string | ❌ | `null` | 8192 | ✅ |
| isMock | boolean | ❌ | `null` | - | ✅ |
| leagueName | string | ❌ | `null` | 255 | ✅ |
| gameMode | string | ❌ | `null` | 50 | ✅ |
| selectedConference | string | ❌ | `null` | 50 | ✅ |
| maxTeams | integer | ❌ | `null` | - | ✅ |
| scoringRules | string | ❌ | `null` | 65535 | ✅ |
| stateJson | string | ❌ | `null` | 1000000 | ✅ |
| eventsJson | string | ❌ | `null` | 1000000 | ✅ |
| picksJson | string | ❌ | `null` | 1000000 | ✅ |
| onTheClock | string | ❌ | `null` | 255 | ✅ |
| lastPickTime | datetime | ❌ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| league_idx | key | leagueId | failed |
| status_start_idx | key | draftStatus, startTime | ✅ |

---

## activity_log (activity_log)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| userId | string | ❌ | `null` | 100 | ✅ |
| action | string | ✅ | `null` | 100 | ✅ |
| details | string | ❌ | `null` | 100 | ✅ |
| timestamp | datetime | ✅ | `null` | - | ✅ |
| type | string | ✅ | `null` | 50 | ✅ |
| teamId | string | ❌ | `null` | 255 | ✅ |
| description | string | ✅ | `null` | 1000 | ✅ |
| data | string | ❌ | `null` | 5000 | ✅ |
| createdAt | datetime | ✅ | `null` | - | ✅ |
| inviteToken | string | ❌ | `null` | 255 | ✅ |
| status | string | ❌ | `pending` | 50 | ✅ |
| expiresAt | datetime | ❌ | `null` | - | ✅ |
| ipAddress | string | ❌ | `null` | 45 | ✅ |
| userAgent | string | ❌ | `null` | 500 | ✅ |
| actorClientId | string | ❌ | `null` | 64 | ✅ |
| objectType | string | ❌ | `null` | 24 | ✅ |
| objectId | string | ❌ | `null` | 64 | ✅ |
| leagueId | string | ❌ | `null` | 64 | ✅ |
| ts | datetime | ✅ | `null` | - | ✅ |
| payloadJson | string | ❌ | `null` | 16384 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| idx_type | key | type | ✅ |
| idx_user | key | userId | ✅ |
| idx_created | key | createdAt | ✅ |
| idx_invite_token | unique | inviteToken | ✅ |
| idx_status | key | status | ✅ |
| actor_idx | key | actorClientId | ✅ |
| object_idx | key | objectType, objectId | ✅ |
| league_idx | key | leagueId | ✅ |

---

## invites (invites)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ✅ | `null` | 100 | ✅ |
| email | string | ❌ | `null` | 100 | ✅ |
| inviteCode | string | ✅ | `null` | 100 | ✅ |
| token | string | ❌ | `null` | 100 | ✅ |
| status | string | ❌ | `null` | 100 | ✅ |
| expiresAt | datetime | ❌ | `null` | - | ✅ |
| createdAt | datetime | ✅ | `null` | - | ✅ |
| acceptedAt | datetime | ❌ | `null` | - | ✅ |
| invitedByAuthUserId | string | ❌ | `null` | 255 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| league_email | key | email | ✅ |
| token_unique | unique | token | ✅ |

---

## Transactions (transactions)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ✅ | `null` | 64 | ✅ |
| fantasyTeamId | string | ✅ | `null` | 64 | ✅ |
| type | string | ✅ | `null` | 24 | ✅ |
| payloadJson | string | ❌ | `null` | 8192 | ✅ |
| season | integer | ❌ | `null` | - | ✅ |
| week | integer | ❌ | `null` | - | ✅ |
| ts | datetime | ❌ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| league_idx | key | leagueId | ✅ |
| league_season_week | key | leagueId, season, week | ✅ |
| team_idx | key | fantasyTeamId | ✅ |

---

## meshy_jobs (meshy_jobs)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| resultUrl | string | ❌ | `null` | 1024 | ✅ |
| mode | string | ❌ | `null` | 32 | ✅ |
| prompt | string | ❌ | `null` | 2048 | ✅ |
| userId | string | ❌ | `null` | 128 | ✅ |
| error | string | ❌ | `null` | 1024 | ✅ |
| webhookSecret | string | ❌ | `null` | 256 | ✅ |
| createdAt | datetime | ✅ | `null` | - | ✅ |
| imageUrl | string | ❌ | `null` | 1024 | ✅ |
| baseModelUrl | string | ❌ | `null` | 1024 | ✅ |
| status | string | ❌ | `null` | 16 | ✅ |
| updatedAt | datetime | ❌ | `null` | - | ✅ |

---

## Model Versions (model_versions)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| versionId | string | ✅ | `null` | 100 | ✅ |
| modelPath | string | ✅ | `null` | 1000 | ✅ |
| version | integer | ✅ | `null` | - | ✅ |
| changes | string | ❌ | `null` | 65536 | ✅ |
| createdAt | datetime | ✅ | `null` | - | ✅ |
| createdBy | string | ✅ | `null` | 100 | ✅ |
| description | string | ✅ | `null` | 1000 | ✅ |
| glbUrl | string | ❌ | `null` | - | ✅ |
| thumbnailUrl | string | ❌ | `null` | - | ✅ |
| bucketFileId | string | ❌ | `null` | 100 | ✅ |
| artifactUri | string | ❌ | `null` | 512 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| versionId_idx | key | versionId | ✅ |
| version_idx | key | version | ✅ |
| createdAt_idx | key | createdAt | ✅ |
| createdBy_idx | key | createdBy | ✅ |

---

## Auctions (auctions)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ✅ | `null` | 50 | ✅ |
| draftId | string | ✅ | `null` | 64 | ✅ |
| playerId | string | ✅ | `null` | 64 | ✅ |
| status | string | ✅ | `null` | 16 | ✅ |
| winnerTeamId | string | ❌ | `null` | 64 | ✅ |
| winningBid | double | ❌ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| auction_league | key | leagueId | ✅ |
| draft_idx | key | draftId | ✅ |
| lot_unique | unique | draftId, playerId | ✅ |

---

## Bids (bids)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| auctionId | string | ✅ | `null` | 50 | ✅ |
| playerId | string | ✅ | `null` | 50 | ✅ |
| teamId | string | ✅ | `null` | 50 | ✅ |
| amount | double | ✅ | `null` | - | ✅ |
| timestamp | datetime | ✅ | `null` | - | ✅ |
| isWinning | boolean | ❌ | `false` | - | ✅ |
| fantasyTeamId | string | ✅ | `null` | 64 | ✅ |
| leagueId | string | ✅ | `null` | 64 | ✅ |
| sessionId | string | ✅ | `null` | 64 | ✅ |
| userId | string | ✅ | `null` | 64 | ✅ |
| bidAmount | integer | ✅ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| bid_auction | key | auctionId | ✅ |
| bid_player | key | playerId | ✅ |
| auction_amount | key | amount | ✅ |

---

## Lineups (lineups)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| rosterId | string | ✅ | `null` | 50 | ✅ |
| week | integer | ✅ | `null` | - | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| lineup | string | ❌ | `null` | 5000 | ✅ |
| bench | string | ❌ | `null` | 5000 | ✅ |
| points | double | ❌ | `0` | - | ✅ |
| locked | boolean | ❌ | `false` | - | ✅ |
| fantasyTeamId | string | ✅ | `null` | 64 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| team_season_week_unique | unique | fantasyTeamId, season, week | ✅ |

---

## Database Migrations (migrations)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| migrationId | string | ✅ | `null` | 255 | ✅ |
| name | string | ✅ | `null` | 255 | ✅ |
| appliedAt | datetime | ✅ | `null` | - | ✅ |
| version | string | ✅ | `null` | 100 | ✅ |
| applied | datetime | ✅ | `null` | - | ✅ |
| checksum | string | ✅ | `null` | 200 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| migration_id_unique | unique | migrationId | ✅ |

---

## Draft States (draft_states)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| draftId | string | ✅ | `null` | 255 | ✅ |
| onClockTeamId | string | ✅ | `null` | 255 | ✅ |
| deadlineAt | datetime | ❌ | `null` | - | ✅ |
| round | integer | ✅ | `null` | - | ✅ |
| pickIndex | integer | ✅ | `null` | - | ✅ |
| draftStatus | string | ❌ | `pre-draft` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| draft_unique_idx | unique | draftId | ✅ |
| deadline_scan_idx | key | draftStatus, deadlineAt | ✅ |

---

## Leagues (leagues)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueName | string | ✅ | `null` | 100 | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| maxTeams | integer | ❌ | `null` | - | ✅ |
| leagueStatus | string | ❌ | `null` | 20 | ✅ |
| gameMode | string | ❌ | `null` | 20 | ✅ |
| draftType | string | ❌ | `null` | 20 | ✅ |
| isPublic | boolean | ❌ | `null` | - | ✅ |
| currentTeams | integer | ❌ | `null` | - | ✅ |
| pickTimeSeconds | integer | ❌ | `null` | - | ✅ |
| draftDate | datetime | ❌ | `null` | - | ✅ |
| selectedConference | string | ❌ | `null` | 50 | ✅ |
| seasonStartWeek | integer | ❌ | `null` | - | ✅ |
| playoffTeams | integer | ❌ | `null` | - | ✅ |
| playoffStartWeek | integer | ❌ | `null` | - | ✅ |
| waiverType | string | ❌ | `null` | 20 | ✅ |
| waiverBudget | integer | ❌ | `null` | - | ✅ |
| password | string | ❌ | `null` | 50 | ✅ |
| commissionerAuthUserId | string | ❌ | `null` | 64 | ✅ |
| scoringRules | string | ❌ | `null` | 65535 | ✅ |
| draftOrder | string | ❌ | `null` | 65535 | ✅ |
| phase | string | ❌ | `scheduled` | 16 | ✅ |
| engineVersion | string | ❌ | `v2` | 3 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| status_idx | key | leagueStatus | ✅ |
| public_idx | key | isPublic | ✅ |
| season_idx | key | season | ✅ |

---

## College Players (college_players)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| name | string | ✅ | `null` | 100 | ✅ |
| position | string | ✅ | `null` | 10 | ✅ |
| team | string | ✅ | `null` | 50 | ✅ |
| conference | string | ✅ | `null` | 20 | ✅ |
| year | string | ❌ | `null` | 10 | ✅ |
| jerseyNumber | integer | ❌ | `null` | - | ✅ |
| height | string | ❌ | `null` | 10 | ✅ |
| weight | integer | ❌ | `null` | - | ✅ |
| eligible | boolean | ❌ | `null` | - | ✅ |
| fantasyPoints | double | ❌ | `null` | - | ✅ |
| seasonFantasyPoints | double | ❌ | `null` | - | ✅ |
| depthChartOrder | integer | ❌ | `null` | - | ✅ |
| schoolId | string | ✅ | `null` | 64 | ✅ |
| classYear | string | ❌ | `null` | 16 | ✅ |
| cfbdId | string | ❌ | `null` | 32 | ✅ |
| espnId | string | ❌ | `null` | 32 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| position_idx | key | position | ✅ |
| team_idx | key | team | ✅ |
| points_idx | key | fantasyPoints | ✅ |
| name_search | fulltext | name | ✅ |
| school_idx | key | schoolId | ✅ |
| cfbd_idx | key | cfbdId | ✅ |
| espn_idx | key | espnId | ✅ |

---

## Games (games)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| week | integer | ✅ | `null` | - | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| seasonType | string | ✅ | `null` | 20 | ✅ |
| date | datetime | ✅ | `null` | - | ✅ |
| homeTeam | string | ✅ | `null` | 50 | ✅ |
| awayTeam | string | ✅ | `null` | 50 | ✅ |
| homeScore | integer | ❌ | `null` | - | ✅ |
| awayScore | integer | ❌ | `null` | - | ✅ |
| status | string | ❌ | `null` | 20 | ✅ |
| eligible | boolean | ❌ | `null` | - | ✅ |
| startDate | datetime | ✅ | `null` | - | ✅ |
| completed | boolean | ✅ | `null` | - | ✅ |
| eligibleGame | boolean | ✅ | `null` | - | ✅ |
| homeSchoolId | string | ✅ | `null` | 64 | ✅ |
| awaySchoolId | string | ✅ | `null` | 64 | ✅ |
| kickoffAt | datetime | ✅ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| week_idx | key | week, season | ✅ |
| eligible_idx | key | eligibleGame | ✅ |
| season_week | key | season, week | ✅ |
| home_idx | key | homeSchoolId | ✅ |
| away_idx | key | awaySchoolId | ✅ |

---

## draft_events (draft_events)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| draftId | string | ✅ | `null` | 64 | ✅ |
| type | string | ✅ | `null` | 24 | ✅ |
| round | integer | ❌ | `null` | - | ✅ |
| overall | integer | ❌ | `null` | - | ✅ |
| fantasyTeamId | string | ❌ | `null` | 64 | ✅ |
| playerId | string | ❌ | `null` | 64 | ✅ |
| ts | datetime | ❌ | `null` | - | ✅ |
| payloadJson | string | ❌ | `null` | 8192 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| by_overall | key | draftId, overall | ✅ |
| by_ts | key | draftId, ts | ✅ |

---

## clients (clients)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| authUserId | string | ✅ | `null` | 64 | ✅ |
| displayName | string | ❌ | `null` | 128 | ✅ |
| email | string | ❌ | `null` | 256 | ✅ |
| avatarUrl | string | ❌ | `null` | 512 | ✅ |
| createdAt | datetime | ✅ | `null` | - | ✅ |
| lastLogin | datetime | ❌ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| auth_user_id_unique | unique | authUserId | ✅ |
| email_idx | key | email | ✅ |

---

## fantasy_teams (fantasy_teams)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ✅ | `null` | 64 | ✅ |
| teamName | string | ✅ | `null` | 128 | ✅ |
| abbrev | string | ❌ | `null` | 8 | ✅ |
| logoUrl | string | ❌ | `null` | 512 | ✅ |
| wins | integer | ❌ | `null` | - | ✅ |
| losses | integer | ❌ | `null` | - | ✅ |
| ties | integer | ❌ | `null` | - | ✅ |
| pointsFor | double | ❌ | `null` | - | ✅ |
| pointsAgainst | double | ❌ | `null` | - | ✅ |
| draftPosition | integer | ❌ | `null` | - | ✅ |
| auctionBudgetTotal | double | ❌ | `null` | - | ✅ |
| auctionBudgetRemaining | double | ❌ | `null` | - | ✅ |
| displayName | string | ❌ | `null` | 255 | ✅ |
| ownerAuthUserId | string | ❌ | `null` | 64 | ✅ |
| leagueName | string | ❌ | `null` | 100 | ✅ |
| players | string | ❌ | `null` | 64 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| league_idx | key | leagueId | ✅ |
| owner_idx | key | ownerAuthUserId | ✅ |
| league_owner_idx | key | leagueId, ownerAuthUserId | ✅ |
| owner_teams_idx | key | ownerAuthUserId, leagueId | ✅ |
| league_owner_unique_idx | unique | leagueId, ownerAuthUserId | ✅ |

---

## roster_slots (roster_slots)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| fantasyTeamId | string | ✅ | `null` | 64 | ✅ |
| playerId | string | ✅ | `null` | 64 | ✅ |
| position | string | ✅ | `null` | 8 | ✅ |
| acquiredVia | string | ❌ | `null` | 16 | ✅ |
| acquiredAt | datetime | ❌ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| team_idx | key | fantasyTeamId | ✅ |
| team_player_idx | key | fantasyTeamId, playerId | ✅ |

---

## schools (schools)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| name | string | ✅ | `null` | 128 | ✅ |
| conference | string | ✅ | `null` | 16 | ✅ |
| slug | string | ❌ | `null` | 64 | ✅ |
| abbreviation | string | ❌ | `null` | 16 | ✅ |
| logoUrl | string | ❌ | `null` | 512 | ✅ |
| primaryColor | string | ❌ | `null` | 16 | ✅ |
| secondaryColor | string | ❌ | `null` | 16 | ✅ |
| mascot | string | ❌ | `null` | 64 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| slug_unique | unique | slug | ✅ |
| conference_idx | key | conference | ✅ |

---

## projections (projections)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| playerId | string | ✅ | `null` | 64 | ✅ |
| season | integer | ✅ | `null` | - | ✅ |
| week | integer | ❌ | `null` | - | ✅ |
| period | string | ✅ | `null` | 16 | ✅ |
| version | integer | ✅ | `null` | - | ✅ |
| model | string | ❌ | `null` | 32 | ✅ |
| source | string | ❌ | `null` | 16 | ✅ |
| clientId | string | ❌ | `null` | 64 | ✅ |
| fantasyPoints | double | ❌ | `null` | - | ✅ |
| componentsJson | string | ❌ | `null` | 16384 | ✅ |
| boomProb | double | ❌ | `null` | - | ✅ |
| bustProb | double | ❌ | `null` | - | ✅ |
| homeAway | string | ❌ | `null` | 8 | ✅ |
| injuryStatus | string | ❌ | `null` | 16 | ✅ |
| opponentSchoolId | string | ❌ | `null` | 64 | ✅ |
| rankPro | integer | ❌ | `null` | - | ✅ |
| startSit_color | string | ❌ | `null` | 8 | ✅ |
| utilizationTrend | string | ❌ | `null` | 16 | ✅ |
| defenseVsPosGrade | double | ❌ | `null` | - | ✅ |
| startSitColor | string | ❌ | `null` | 20 | ✅ |
| teamTotalEst | double | ❌ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| season_week_version | key | season, week, version | ✅ |

---

## model_runs (model_runs)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| season | integer | ✅ | `null` | - | ✅ |
| week | integer | ❌ | `null` | - | ✅ |
| scope | string | ✅ | `null` | 32 | ✅ |
| sources | string | ❌ | `null` | 512 | ✅ |
| status | string | ✅ | `null` | 16 | ✅ |
| runId | string | ❌ | `null` | 255 | ✅ |
| modelVersionId | string | ❌ | `null` | 255 | ✅ |
| startedAt | datetime | ❌ | `null` | - | ✅ |
| finishedAt | datetime | ❌ | `null` | - | ✅ |
| inputsJson | string | ❌ | `null` | 65535 | ✅ |
| metricsJson | string | ❌ | `null` | 65535 | ✅ |
| weightsJson | string | ❌ | `null` | 65535 | ✅ |
| version | integer | ✅ | `null` | - | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| season_week | key | season, week | ✅ |

---

## league_memberships (league_memberships)

### Attributes

| Key | Type | Required | Default | Size | Status |
|-----|------|----------|---------|------|--------|
| leagueId | string | ✅ | `null` | 64 | ✅ |
| authUserId | string | ✅ | `null` | 64 | ✅ |
| role | string | ✅ | `null` | 16 | ✅ |
| status | string | ✅ | `null` | 16 | ✅ |
| joinedAt | datetime | ❌ | `null` | - | ✅ |
| displayName | string | ❌ | `null` | 255 | ✅ |
| leagueName | string | ❌ | `null` | 100 | ✅ |

### Indexes

| Key | Type | Attributes | Status |
|-----|------|------------|--------|
| league_idx | key | leagueId | ✅ |
| member_idx | key | authUserId | ✅ |
| league_member_unique | unique | leagueId, authUserId | ✅ |

---

