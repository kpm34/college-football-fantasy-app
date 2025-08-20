# System Map (Features, Routes, Collections)

```mermaid
%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
erDiagram
  APPWRITE_USERS ||--o{ LEAGUES : "commissioner"
  APPWRITE_USERS ||--o{ USER_TEAMS : "userId"
  LEAGUES ||--o{ USER_TEAMS : "leagueId"
  USER_TEAMS }o--o{ COLLEGE_PLAYERS : "players JSON"
  LEAGUES ||--o{ MOCK_DRAFTS : "leagueId"
  MOCK_DRAFTS ||--o{ MOCK_DRAFT_PICKS : "draftId"
  MOCK_DRAFTS ||--o{ MOCK_DRAFT_PARTICIPANTS : "draftId"
  LEAGUES ||--o{ AUCTIONS : "leagueId"
  AUCTIONS ||--o{ BIDS : "auctionId"
  GAMES ||--o{ PLAYER_STATS : "gameId"
  USER_TEAMS ||--o{ LINEUPS : "rosterId"
  LEAGUES ||--o{ ACTIVITY_LOG : "leagueId"
  
  %% Current Live Schema (August 20, 2025)
  LEAGUES {
    string name "required"
    string commissioner "required, FK to Appwrite Users"
    int season "required, 2020-2030"
    int maxTeams "optional, 4-20, default varies"
    string status "optional, draft states"
    string gameMode "optional, immutable after creation"
    string draftType "optional"
    bool isPublic "optional"
    int currentTeams "optional, 0-20"
    int pickTimeSeconds "optional, 30-600"
    string scoringRules "optional, JSON, 5000 chars"
    datetime draftDate "optional, DRAFT ROOM trigger"
    string selectedConference "optional, immutable, conference mode"
    int seasonStartWeek "optional, 1-20"
    int playoffTeams "optional, 0-20"
    int playoffStartWeek "optional, 1-20"
    string waiverType "optional"
    int waiverBudget "optional, 0-1000"
    string password "optional, private leagues"
  }
  
  USER_TEAMS {
    string leagueId "required, FK"
    string userId "required, FK to Appwrite Users"
    string teamName "required, max 100 chars"
    string abbreviation "optional, max 10 chars"
    int wins "optional, 0-20"
    int losses "optional, 0-20"
    int ties "optional, 0-20"
    int pointsFor "optional, 0-max"
    int pointsAgainst "optional, 0-max"
    string players "optional, JSON string, 5000 chars"
    int draftPosition "optional, 1-20"
  }
  
  COLLEGE_PLAYERS {
    string name "required, max 100 chars, fulltext indexed"
    string position "required, max 10 chars, indexed"
    string team "required, max 50 chars, indexed"
    string conference "required, max 20 chars, Power 4"
    string year "optional, max 10 chars"
    int jerseyNumber "optional, 0-99"
    string height "optional, max 10 chars"
    int weight "optional, 150-400"
    bool eligible "optional, default varies"
    double fantasy_points "optional, indexed for sorting"
    double season_fantasy_points "optional"
    int depth_chart_order "optional, QB depth multipliers"
  }
  
  MOCK_DRAFTS {
    string draftName "required, max 255 chars"
    int numTeams "required"
    int rounds "required"
    bool snake "required, draft algorithm"
    string status "required, enum: waiting|active|complete|failed"
    string leagueId "optional, FK when league draft"
    datetime startedAt "optional"
    datetime completedAt "optional"
    string config "optional, JSON, 8192 chars"
  }
  
  ACTIVITY_LOG {
    string action "activity type"
    string leagueId "optional, FK"
    string userId "optional, FK"
    datetime timestamp "auto-generated"
    object data "invite tokens, join requests, metadata"
  }
```

## Collections (from Live Appwrite Database) ✅ Updated Aug 20, 2025

### Core Collections (Live Schema)
- **leagues**: required → `name`, `commissioner`, `season`
  - Optional → `maxTeams` (4-20), `status`, `gameMode`, `draftType`, `isPublic`, `currentTeams`, `pickTimeSeconds` (30-600), `scoringRules`, `draftDate` (datetime - DRAFT ROOM trigger), `selectedConference` (conference mode), `seasonStartWeek` (1-20), `playoffTeams` (0-20), `playoffStartWeek` (1-20), `waiverType`, `waiverBudget` (0-1000), `password`
- **user_teams**: required → `leagueId`, `userId`, `teamName`
  - Optional → `abbreviation`, `wins`, `losses`, `ties`, `pointsFor`, `pointsAgainst`, `players` (JSON string), `draftPosition` (1-20)
  - Indexes: league_idx, user_idx
- **college_players**: required → `name`, `position`, `team`, `conference`
  - Optional → `year`, `jerseyNumber` (0-99), `height`, `weight` (150-400), `eligible`, `fantasy_points`, `season_fantasy_points`, `depth_chart_order`
  - Indexes: position_idx, team_idx, points_idx, name_search (fulltext)
- **games**: required → `week`, `season`, `season_type`, `home_team`, `away_team`, `start_date`
- **rankings**: required → `week`, `season`, `poll_type`, `team`, `rank`
  - Optional → `points`, `first_place_votes`

### Draft System Collections (Live Schema)
- **mock_drafts**: required → `draftName`, `numTeams`, `rounds`, `snake`, `status`
  - Optional → `leagueId`, `startedAt`, `completedAt`, `config` (JSON)
  - Status enum: ["waiting", "active", "complete", "failed"]
- **mock_draft_picks**: snake draft picks with real-time updates
- **mock_draft_participants**: participant management system

### Fantasy Collections (From Database)
- **lineups**: weekly roster management
- **auctions**: auction draft sessions
- **bids**: auction bidding system
- **player_stats**: game performance data
- **activity_log**: league activity tracking with invite tokens

### Auth & Users (Appwrite Built-in)
- **Appwrite Auth Users**: 11 active users currently registered
  - OAuth integration ready (Google, Apple)
  - Session management with secure cookies
  - Email verification and MFA support available

## Feature → Routes → Collections (high-level)

- Auth: signup/login/logout/profile → `users`
- Create League → `leagues`, `user_teams`
- League Details/My Leagues → `leagues`, `user_teams`, `users`
- Locker Room → `leagues`, `user_teams`, `college_players`, `users`
- Roster Detail/Lineup → `user_teams`
- Draft Status/Pick → `leagues`, `draft_picks`, `user_teams`, `activity_log`
- Players (Enhanced) → `college_players`
- Projections → `projections_yearly`, `projections_weekly` (db), `college_players` (calc)
- Games/Rankings → `games`, `rankings`
- Conferences → `teams`
- Weekly Scoring → `games`, `player_stats`, updates `lineups` and `user_teams`
- Admin (Dedupe/Refresh/Retire) → `college_players`

## Simplification/Alignment Checklist

- Define missing collections in SSOT: `draft_picks`, `mock_*`.
- Ensure docs say `user_teams` (not `rosters`) except when referring to legacy.
- Enforce Appwrite rule: required attributes must not have defaults; if defaults needed → make optional and set in code.
- Keep route shape normalized to camelCase fields.
