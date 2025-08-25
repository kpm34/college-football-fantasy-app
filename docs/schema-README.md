# College Football Fantasy App - Database Schema

## Overview
The application uses Appwrite as the backend database with 24 collections organized into logical groups. Field naming is standardizing on camelCase. During the transition, some legacy snake_case attributes may still exist in the live schema for backward compatibility. Code should always prefer camelCase attributes, and migrations will remove snake_case variants over time.

## Collections

### Core Entities

#### `schools` (formerly teams)
Represents college football teams/schools.
- **Fields**: name, conference, slug, abbreviation, logo_url, primary_color, secondary_color, mascot
- **Indexes**: 
  - `slug_unique` (unique): slug
  - `conference_idx`: conference

#### `college_players`
All college football players across Power 4 conferences.
- **Fields**: school_id (FK), name, position, jersey_number, eligible, height, weight, class_year, cfbd_id, espn_id, depth_chart_order, fantasy_points
- **Indexes**:
  - `school_idx`: school_id
  - `position_idx`: position
  - `cfbd_idx`: cfbd_id
  - `espn_idx`: espn_id

#### `games`
College football game schedule and results.
- **Fields**: season, week, home_school_id (FK), away_school_id (FK), kickoff_at, status, completed, eligible, home_score, away_score
- **Indexes**:
  - `season_week`: season, week
  - `home_idx`: home_school_id
  - `away_idx`: away_school_id

#### `rankings`
AP Top 25 and other rankings.
- **Fields**: season, week, source, school_id (FK), rank, points, first_place_votes
- **Indexes**:
  - `by_source`: season, week, source
  - `by_school`: season, week, school_id

### User & League Management

#### `clients` (formerly users)
Represents authenticated users (mirrors Appwrite Auth).
- **Fields**: auth_user_id (unique), display_name, email, avatar_url, created_at, last_login
- **Indexes**:
  - `auth_user_id_unique` (unique): auth_user_id
  - `email_idx`: email

#### `leagues`
Fantasy football leagues.
- **Fields**: name, commissioner_auth_user_id (FK), season, draftType, isPublic, status, draftDate, pickTimeSeconds, playoffStartWeek, playoffTeams, maxTeams, selectedConference, scoringRules, waiverBudget, waiverType, currentTeams
- **Indexes**:
  - `commissioner_idx`: commissioner_auth_user_id
  - `season_idx`: season
  - `status_idx`: status

#### `league_memberships`
Tracks which users belong to which leagues.
- **Fields**: league_id (FK), auth_user_id (FK), role, status, joined_at
- **Indexes**:
  - `league_member_unique` (unique): league_id, auth_user_id
  - `member_idx`: auth_user_id

#### `fantasy_teams` (formerly user_teams)
User teams within leagues.
- **Fields**: league_id (FK), owner_auth_user_id (FK), name, abbrev, display_name, logo_url, wins, losses, ties, points_for, points_against, draft_position, auction_budget_total, auction_budget_remaining
- **Indexes**:
  - `league_idx`: league_id
  - `owner_idx`: owner_auth_user_id

#### `roster_slots`
Players on fantasy teams.
- **Fields**: fantasy_team_id (FK), player_id (FK), position, acquired_via, acquired_at
- **Indexes**:
  - `team_idx`: fantasy_team_id
  - `team_player_idx`: fantasy_team_id, player_id

### Draft & Auction

#### `drafts`
All draft types (snake, auction, mock).
- **Fields**: league_id (FK), type, status, start_time, end_time, clock_seconds, order_json, max_rounds, current_pick, current_round, is_mock
- **Indexes**:
  - `league_idx`: league_id

#### `draft_states`
Current state of active drafts.
- **Fields**: draft_id (FK), on_clock_team_id (FK), pick_index, round, deadline_at, status
- **Indexes**:
  - `draft_unique` (unique): draft_id

#### `draft_events`
All draft picks and events.
- **Fields**: draft_id (FK), type, round, overall, fantasy_team_id (FK), player_id (FK), ts, payload_json
- **Indexes**:
  - `by_overall`: draft_id, overall
  - `by_ts`: draft_id, ts

#### `auctions`
Auction lots for players.
- **Fields**: draft_id (FK), player_id (FK), status, winner_team_id (FK), winning_bid
- **Indexes**:
  - `draft_idx`: draft_id
  - `lot_unique` (unique): draft_id, player_id

#### `bids`
Auction bid history.
- **Fields**: auction_id (FK), fantasy_team_id (FK), amount, timestamp
- **Indexes**:
  - `auction_idx`: auction_id
  - `auction_amount`: auction_id, amount

### Gameplay

#### `matchups`
Weekly head-to-head matchups.
- **Fields**: league_id (FK), season, week, home_team_id (FK), away_team_id (FK), home_points, away_points, status
- **Indexes**:
  - `league_season_week`: league_id, season, week

#### `lineups`
Weekly lineup submissions.
- **Fields**: fantasy_team_id (FK), season, week, slots_json, points, locked
- **Indexes**:
  - `team_season_week_unique` (unique): fantasy_team_id, season, week

#### `transactions`
Waiver wire and trade transactions.
- **Fields**: league_id (FK), fantasy_team_id (FK), type, payload_json, season, week, ts
- **Indexes**:
  - `league_idx`: league_id
  - `league_season_week`: league_id, season, week
  - `team_idx`: fantasy_team_id

### Stats & Projections

#### `player_stats`
Weekly player performance stats.
- **Fields**: player_id (FK), game_id (FK), season, week, statline_json, fantasy_points, eligible
- **Indexes**:
  - `player_season_week`: player_id, season, week
  - `game_idx`: game_id

#### `projections`
All player projections (consolidated).
- **Fields**: player_id (FK), season, week, period, version, model, source, client_id (FK), fantasy_points, components_json, boom_prob, bust_prob, defense_vs_pos_grade, home_away, injury_status, opponent_school_id (FK), rank_pro, start_sit_color, team_total_est, utilization_trend
- **Indexes**:
  - `player_season_week_version`: player_id, season, week, version
  - `season_week_version`: season, week, version

#### `model_runs`
Projection model execution history.
- **Fields**: run_id (unique), model_version_id (FK), season, week, scope, sources, started_at, finished_at, status, inputs_json, metrics_json, weights_json
- **Indexes**:
  - `run_unique` (unique): run_id
  - `season_week`: season, week
  - `model_version_idx`: model_version_id

#### `model_versions`
ML model version tracking.
- **Fields**: version, version_id, created_at, created_by, description, artifact_uri, thumbnail_url
- **Indexes**:
  - `version_idx`: version
  - `version_id_idx`: version_id
  - `created_at_idx`: created_at

### System

#### `invites`
League invitation tracking.
- **Fields**: league_id (FK), email, token (unique), status, created_at, accepted_at, expires_at, invited_by
- **Indexes**:
  - `league_email`: league_id, email
  - `token_unique` (unique): token

#### `activity_log`
User activity and audit trail.
- **Fields**: actor_client_id (FK), action, object_type, object_id, league_id (FK), status, ts, ip_address, user_agent, payload_json
- **Indexes**:
  - `actor_idx`: actor_client_id
  - `object_idx`: object_type, object_id
  - `league_idx`: league_id

#### `meshy_jobs`
3D model generation jobs.
- **Fields**: user_id, prompt, mode, image_url, result_url, status, created_at, updated_at, error, webhook_secret
- **Indexes**:
  - `user_idx`: user_id
  - `created_at_idx`: created_at

## Migration Notes

### Renamed Collections
- `teams` → `schools`
- `users` → `clients`
- `user_teams` → `fantasy_teams`
- `projection_runs` → `model_runs`

### Consolidated Collections
- `draft_picks` + `mock_draft_picks` → `draft_events`
- `auction_bids` → `bids`
- `auction_sessions` + `mock_drafts` → `drafts`
- `scores` → `matchups`
- `player_projections` + `projections_weekly` + `projections_yearly` + `user_custom_projections` → `projections`
- `team_budgets` → merged into `fantasy_teams`

### Dropped Collections
- `editor_sessions`
- `file_changes`
- `message_templates`
- `migrations`
- `scoring`
- `sync_status`
- `mock_draft_participants` (merged into draft_events)
- `projection_run_metrics` (merged into model_runs)

## Field Naming Conventions
CamelCase is canonical for new and refactored attributes. Legacy snake_case attributes may still be present during migration windows but should not be introduced in new code. Examples:
- `owner_client_id` → `owner_auth_user_id`
- `commissioner` → `commissioner_auth_user_id`
- `selected_conference` → `selectedConference`
- `is_public` → `isPublic`
- `draft_date` → `draftDate`
- `pick_time_seconds` → `pickTimeSeconds`
- `playoff_start_week` → `playoffStartWeek`

When referencing identifiers in code and queries, always prefer the camelCase versions listed above. Queries can temporarily include legacy names with OR conditions where necessary, but those will be removed as backfills complete.

## Environment Variables
All collection names are prefixed with `NEXT_PUBLIC_APPWRITE_COLLECTION_`:
```env
NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS=clients
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS=fantasy_teams
# ... etc
```
