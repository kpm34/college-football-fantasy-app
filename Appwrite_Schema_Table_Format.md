# College Football Fantasy App - Appwrite Schema (Table Format)

## Project Info
| Property | Value |
|----------|-------|
| Project ID | college-football-fantasy-app |
| Database ID | college-football-fantasy |
| Endpoint | https://nyc.cloud.appwrite.io/v1 |
| Total Collections | 42 |

---

## Collection: college_players

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| name | string | ✓ | 100 | - | Player's full name |
| position | string | ✓ | 10 | - | QB, RB, WR, TE, K, DEF |
| team | string | ✓ | 100 | - | Team name |
| conference | string | ✓ | 50 | - | SEC, ACC, Big 12, Big Ten |
| year | string | ✓ | 20 | - | FR, SO, JR, SR |
| draftable | boolean | ✓ | - | - | Draft eligibility |
| power_4 | boolean | ✓ | - | - | Power 4 conference member |
| created_at | string | ✓ | 50 | - | Creation timestamp |
| jersey | string | ✓ | 10 | - | Jersey number (string) |
| height | string | ✓ | 10 | - | Player height |
| weight | string | ✓ | 10 | - | Player weight |
| projection | double | ✓ | unlimited | - | Overall fantasy projection |
| rushing_projection | double | ✓ | unlimited | - | Rushing fantasy points |
| receiving_projection | double | ✓ | unlimited | - | Receiving fantasy points |
| td_projection | double | ✓ | unlimited | - | Touchdown projection |
| int_projection | double | ✓ | unlimited | - | Interception projection |
| field_goals_projection | double | ✓ | unlimited | - | Field goal projection |
| extra_points_projection | double | ✓ | unlimited | - | Extra points projection |
| fantasy_points | double | ✓ | unlimited | - | Current season fantasy points |
| updated_at | string | ✓ | 50 | - | Last updated timestamp |
| draftedBy | relationship | ✗ | - | - | Link to draft_picks |
| external_id | string | ✗ | 50 | - | External API reference |
| eligible | boolean | ✓ | - | - | Game eligibility status |
| depth_chart_order | integer | ✗ | unlimited | - | Depth chart position |
| jerseyNumber | integer | ✗ | 0-99 | - | Jersey number (integer) |

---

## Collection: teams

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| name | string | ✓ | 100 | - | Team name |
| abbreviation | string | ✓ | 10 | - | Team abbreviation |
| conference | string | ✓ | 50 | - | Conference name |
| mascot | string | ✗ | 50 | - | Team mascot |
| logo_url | string | ✗ | unlimited | - | Team logo URL |
| primary_color | string | ✗ | 7 | - | Primary color hex |
| secondary_color | string | ✗ | 7 | - | Secondary color hex |
| venue | string | ✗ | 100 | - | Home venue |
| founded | integer | ✗ | 1800-2100 | - | Year founded |
| external_id | string | ✗ | 50 | - | External API reference |

---

## Collection: games

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| week | integer | ✓ | 1-20 | - | Week number |
| season | integer | ✓ | 2020-2030 | - | Season year |
| season_type | string | ✓ | - | - | regular or postseason |
| home_team | string | ✓ | 50 | - | Home team name |
| away_team | string | ✓ | 50 | - | Away team name |
| home_score | integer | ✗ | 0+ | - | Home team score |
| away_score | integer | ✗ | 0+ | - | Away team score |
| start_date | datetime | ✓ | - | - | Game start time |
| completed | boolean | ✓ | - | false | Game completion status |
| venue | string | ✗ | 100 | - | Game venue |
| tv_network | string | ✗ | 20 | - | TV network |
| weather | string | ✗ | 200 | - | Weather conditions |
| external_id | string | ✗ | 50 | - | External API reference |

---

## Collection: rankings

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| week | integer | ✓ | 1-20 | - | Week number |
| season | integer | ✓ | 2020-2030 | - | Season year |
| poll_type | string | ✓ | - | - | AP Top 25 or Coaches Poll |
| team | string | ✓ | 50 | - | Team name |
| rank | integer | ✓ | 1-25 | - | Poll ranking |
| points | integer | ✗ | 0+ | - | Poll points |
| first_place_votes | integer | ✗ | 0+ | - | First place votes |

---

## Collection: leagues

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| name | string | ✓ | 100 | - | League name |
| commissioner | string | ✓ | 50 | - | Commissioner user ID |
| season | integer | ✓ | 2020-2030 | - | League season |
| maxTeams | integer | ✓ | 2-32 | - | Maximum teams |
| currentTeams | integer | ✓ | 0-32 | 0 | Current team count |
| draftType | string | ✓ | - | - | snake or auction |
| gameMode | string | ✓ | - | - | power4, sec, acc, big12, bigten |
| selectedConference | string | ✗ | 50 | - | Conference filter |
| status | string | ✓ | - | open | open, full, drafting, active, complete |
| isPublic | boolean | ✓ | - | true | Public visibility |
| pickTimeSeconds | integer | ✓ | 30-600 | 90 | Draft pick timer |
| scoringRules | string | ✗ | 2000 | - | JSON scoring config |
| draftDate | datetime | ✗ | - | - | Draft date |
| seasonStartWeek | integer | ✗ | 1-20 | - | Season start week |
| playoffTeams | integer | ✗ | 0-20 | - | Playoff teams |
| playoffStartWeek | integer | ✗ | 1-20 | - | Playoff start week |
| waiverType | string | ✗ | 20 | - | Waiver system |
| waiverBudget | integer | ✗ | 0-1000 | - | Waiver budget |
| password | string | ✗ | 50 | - | League password |

---

## Collection: user_teams

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| leagueId | string | ✓ | 50 | - | League reference |
| userId | string | ✓ | 50 | - | User reference |
| teamName | string | ✓ | 100 | - | Fantasy team name |
| abbreviation | string | ✗ | 10 | - | Team abbreviation |
| draftPosition | integer | ✗ | 1+ | - | Draft position |
| wins | integer | ✓ | 0+ | 0 | Season wins |
| losses | integer | ✓ | 0+ | 0 | Season losses |
| ties | integer | ✓ | 0+ | 0 | Season ties |
| pointsFor | double | ✓ | 0+ | 0 | Points scored |
| pointsAgainst | double | ✓ | 0+ | 0 | Points against |
| players | string | ✓ | 5000 | [] | JSON player array |
| lineup | string | ✗ | 5000 | - | JSON lineup |
| bench | string | ✗ | 5000 | - | JSON bench |

---

## Collection: lineups

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| rosterId | string | ✓ | 50 | - | Roster reference |
| week | integer | ✓ | 1-20 | - | Week number |
| season | integer | ✓ | 2020-2030 | - | Season year |
| lineup | string | ✗ | 5000 | - | JSON starting lineup |
| bench | string | ✗ | 5000 | - | JSON bench |
| points | double | ✓ | 0+ | 0 | Week points |
| locked | boolean | ✓ | - | false | Lineup locked |

---

## Collection: auctions

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| leagueId | string | ✓ | 50 | - | League reference |
| status | string | ✓ | 20 | - | Auction status |
| currentPlayerId | string | ✗ | 50 | - | Current player |
| currentBid | double | ✗ | 0+ | - | Current bid |
| currentBidder | string | ✗ | 50 | - | Current bidder |
| startTime | datetime | ✗ | - | - | Start time |
| endTime | datetime | ✗ | - | - | End time |

---

## Collection: bids

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| leagueId | string | ✓ | 50 | - | League reference |
| sessionId | string | ✓ | 50 | - | Session ID |
| userId | string | ✓ | 50 | - | Bidder ID |
| playerId | string | ✓ | 50 | - | Player ID |
| bidAmount | double | ✓ | 1+ | - | Bid amount |
| timestamp | datetime | ✓ | - | - | Bid time |

---

## Collection: player_stats

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| playerId | string | ✓ | 50 | - | Player reference |
| gameId | string | ✓ | 50 | - | Game reference |
| week | integer | ✓ | 1-20 | - | Week number |
| season | integer | ✓ | 2020-2030 | - | Season year |
| stats | string | ✓ | 2000 | - | JSON stats |
| fantasy_points | double | ✓ | 0+ | 0 | Fantasy points |
| updated | datetime | ✓ | - | now() | Update time |

---

## Collection: users

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| email | string | ✓ | unlimited | - | Email address |
| name | string | ✗ | 100 | - | Display name |
| emailVerification | boolean | ✓ | - | false | Email verified |
| preferences | string | ✗ | 2000 | - | JSON preferences |
| created | datetime | ✓ | - | now() | Created date |
| lastLogin | datetime | ✗ | - | - | Last login |

---

## Collection: activity_log

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| userId | string | ✗ | 50 | - | User reference |
| action | string | ✓ | 100 | - | Action type |
| details | string | ✗ | 1000 | - | Action details |
| timestamp | datetime | ✓ | - | now() | Action time |
| ip_address | string | ✗ | 45 | - | IP address |
| user_agent | string | ✗ | 500 | - | User agent |

---

## Data Types Legend

| Type | Description | Example |
|------|-------------|---------|
| string | Text field | "John Doe" |
| integer | Whole number | 42 |
| double | Decimal number | 123.45 |
| boolean | True/False | true |
| datetime | ISO timestamp | 2025-08-19T10:30:00Z |
| relationship | Link to other collection | FK reference |

## Symbols
- ✓ = Required field
- ✗ = Optional field
- unlimited = No size limit
- now() = Current timestamp default