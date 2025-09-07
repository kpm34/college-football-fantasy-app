# Frontend API Routes

## Overview
This diagram shows the client-accessible API routes for the draft system.

## Draft Player APIs

### 1. Draft Players API
- **Route**: `/api/(frontend)/draft/players`
- **Method**: GET
- **Purpose**: Fetch draftable players with filtering
- **Authentication**: Optional (for league-specific filtering)
- **Query Parameters**:
  - `position`: Filter by position (QB, RB, WR, TE, K)
  - `conference`: Filter by conference (SEC, ACC, Big 12, Big Ten)
  - `team`: Filter by specific team
  - `search`: Text search by player name
  - `top200`: Limit to top 200 players
  - `orderBy`: Sort by projection, team, name, ADP
  - `leagueId`: Enforce conference mode for league
- **Returns**: Paginated player list with projections
- **Data Sources**: college_players collection

## Projection APIs

### 2. Projection Run API
- **Route**: `/api/projections/run`
- **Method**: POST
- **Purpose**: Run projection calculations
- **Authentication**: Admin only
- **Input**: Version, scope, season, week, weights, sources
- **Updates**: projections, model_runs collections
- **Side Effects**: Updates college_players.fantasyPoints

## League APIs

### 3. League Data API
- **Route**: `/api/leagues/[leagueId]`
- **Method**: GET
- **Purpose**: Fetch league information
- **Authentication**: Optional (public vs private)
- **Returns**: League details, settings, members

### 4. League Join API
- **Route**: `/api/leagues/[leagueId]/join`
- **Method**: POST
- **Purpose**: Join a league
- **Authentication**: Required
- **Input**: Team name, password (if private)
- **Updates**: fantasy_teams, league_memberships collections

