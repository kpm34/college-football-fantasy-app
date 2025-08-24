### API Routing Map (Aug 24)

#### Leagues (Core)
- **/api/leagues/mine**
  - Methods: GET
  - Purpose: Unified source for sidebar + dashboard
  - Returns: 
    - `leagues[]`: `{ id, name, status, isCommissioner, teamName, commissioner, maxTeams, currentTeams, draftDate }`
    - `teams[]`: `{ $id, leagueId, name, wins, losses, pointsFor }`
  - Data sources:
    - `fantasy_teams` filtered by `owner_client_id = currentUser`
    - `leagues` by `$id in leagueIds`
  - Consumers:
    - Sidebar Navbar
    - Dashboard (leagues + teams)

- **/api/leagues/[leagueId]**
  - Methods: GET, PATCH (legacy team rename)
  - Purpose: League details for League Home (Overview)
  - Request headers: optional `x-user-id` for membership validation
  - Returns: `{ success, league: { id, name, mode, conf, maxTeams, currentTeams, members, status, commissioner, draftDate, ... } }`
  - Data sources: `leagues` + optional `lineup_profiles`, `scoring_profiles`
  - Consumers: League Home (header, status, draft date, quick links)

- **/api/leagues/[leagueId]/members**
  - Methods: GET
  - Purpose: League members table + standings + locker-room membership lists
  - Returns: `{ success, teams[], count, activeCount }`
    - `teams[]`: `{ $id, leagueId, userId, name, userName, wins, losses, pointsFor, pointsAgainst, status }`
  - Data sources (merge):
    - `fantasy_teams` (`league_id`, `owner_client_id`, `name`, results/stats)
    - `league_memberships` (`client_id`, `display_name`) for Manager column
    - Appwrite Users (fallback) for name/email
  - Consumers: League Home tabs (Members, Standings)

- **/api/leagues/[leagueId]/commissioner**
  - Methods: GET, PUT
  - Purpose: Commissioner settings
  - Auth: cookie session; ensures `user.$id === league.commissioner`
  - GET returns: `{ success, league, members }`
    - `league`: normalized settings (maxTeams, pickTimeSeconds, draftDate, scoringRules, etc.)
    - `members[]`: mapped from `fantasy_teams` + display names from `league_memberships`
  - PUT accepts: `{ name?, maxTeams?, pickTimeSeconds?, draftDate?, scoringRules?, ... }`
  - Consumers: `/league/[leagueId]/commissioner` page

- **/api/leagues/[leagueId]/update-settings**
  - Methods: PUT
  - Purpose: Narrow update path from League Home Settings tab
  - Accepts: scoring + draft settings subset; validates and updates `leagues`

- **/api/leagues/[leagueId]/locker-room**
  - Methods: GET
  - Purpose: Locker-room view for a roster within the league
  - Data: roster + context for the logged-in user’s fantasy team

- **/api/leagues/[leagueId]/schedule**
  - Methods: GET
  - Purpose: League schedule generation/fetch

- **/api/leagues/create**
  - Methods: POST
  - Purpose: Create league; auto-add commissioner roster + membership

- **/api/leagues/join**
  - Methods: POST
  - Purpose: Join league; creates `fantasy_teams` + `league_memberships`; updates league counts safely

- **/api/leagues/invite**
  - Methods: GET
  - Purpose: Validate invite token and/or fetch invite/league details

- **/api/leagues/search**
  - Methods: GET
  - Purpose: Public search for join flow (returns brief league cards)

- **/api/leagues/is-commissioner/[leagueId]**
  - Methods: GET
  - Purpose: Return `{ isCommissioner }` using cookie session and `leagues.commissioner`

#### Drafts
- **/api/draft/players** (GET)
  - Purpose: Draft pool + projections (Power 4; dedupe; compute projections)
  - Sources: `college_players`, `player_stats`, `games`; model logic in server
  - Consumers: Locker Room + Draft UIs

- **/api/drafts/** suite
  - `/api/drafts` (POST create/start), `/api/drafts/[id]/start|resume|pick|pause|autopick|turn|data`
  - Purpose: Real-time draft engine transport
  - Data: Draft state, picks, timers; Appwrite Realtime for UI updates

#### Auth
- **/api/auth/login** (POST)
  - Purpose: Email login via Appwrite; sets `appwrite-session` cookie
- **/api/auth/logout** (POST)
  - Purpose: Destroy session cookie (and Appwrite session)
- **/api/auth/user** (GET)
  - Purpose: Who am I (via cookie)
- **/api/auth/signup** (POST), **/api/auth/update-profile** (POST)
  - Purpose: Registration + profile updates

#### Data (cached and utility)
- **/api/games/cached**, **/api/players/cached**, **/api/rankings/cached** (GET)
  - Purpose: Return cached/batched data for UI
- **/api/schedule** (GET)
  - Purpose: Global schedule helper
- **/api/search** (GET)
  - Purpose: Cross-entity search
- **/api/health** (GET)
  - Purpose: Health check

#### Admin & Ops (selected)
- **/api/admin/players/*, /api/admin/leagues/*, /api/admin/users/*, /api/admin/***
  - Purpose: Maintenance, dedupe, backfills, sync
- **/api/migrations/*, /api/cron/*, /api/webhooks/*, /api/blender/*, /api/meshy/*, /api/runway/*, /api/rotowire/*, /api/cursor-report**
  - Purpose: System integrations, ETL, jobs

##### Notes
- Server-side Appwrite: `@/lib/appwrite-server` (Databases, Users); requires `APPWRITE_API_KEY`.
- Client Appwrite: `@/lib/appwrite` for Realtime only; no secrets.
- Core collections: `leagues`, `fantasy_teams`, `league_memberships`.
