## Duplicate Features Audit

Generated to summarize overlapping pages, APIs, services, and types in the repository for consolidation and maintenance.

## Table of Contents
- [Overview](#overview)
- [Pages and UI](#pages-and-ui)
  - [Conference Showcase (3 versions)](#conference-showcase-3-versions)
  - [Draft Pages (4 experiences)](#draft-pages-4-experiences)
  - [Games UI (2 approaches)](#games-ui-2-approaches)
  - [Hero Section (duplicated)](#hero-section-duplicated)
  - [League Overview vs League Portal](#league-overview-vs-league-portal)
- [API Routes](#api-routes)
  - [Draftable Players Endpoints (2)](#draftable-players-endpoints-2)
  - [Conference Endpoints (4 similar)](#conference-endpoints-4-similar)
  - [Leagues Endpoints (mixed patterns)](#leagues-endpoints-mixed-patterns)
  - [Auth Endpoints (mixed patterns)](#auth-endpoints-mixed-patterns)
  - [Projections Endpoint vs Services](#projections-endpoint-vs-services)
- [Services and Config](#services-and-config)
  - [Appwrite Client/Config Duplication](#appwrite-clientconfig-duplication)
  - [Projection Services (2)](#projection-services-2)
  - [HTTP API Clients (2)](#http-api-clients-2)
- [Types and Models](#types-and-models)
  - [Game Type Duplicated](#game-type-duplicated)
  - [Player Types Fragmented](#player-types-fragmented)
- [Scoring Logic](#scoring-logic)
- [Service Worker](#service-worker)
- [Miscellaneous](#miscellaneous)
- [Highest-Impact Hotspots](#highest-impact-hotspots)
- [Quick Map by File Path](#quick-map-by-file-path)

## Overview
- **Goal**: Identify duplicate/overlapping features for consolidation.
- **Highlights**:
  - Pages/UI: multiple versions for conferences, drafts, games, hero.
  - API routes: parallel endpoints with different response shapes.
  - Services/config: several Appwrite clients/configs and projection strategies.
  - Types: duplicated `Game`, fragmented `Player` models.
  - Scoring: logic duplicated across TS (inline and modular) and Python.
  - Service worker: duplicate registration/manager paths.

## Pages and UI

### Conference Showcase (3 versions)
- **Paths**:
  - `components/ConferenceShowcase.tsx`
  - `app/conference-showcase/page.tsx`
  - `components/layouts/ConferenceShowcase.tsx`
- **Similarities**: Power 4 presentation; calls `/api/bigten`, `/api/big12`, `/api/sec`, `/api/acc`; uses `getTeamColors`.
- **Differences**:
  - `components/ConferenceShowcase.tsx`: Fetches teams and players for all four conferences; sorts top players; static fallbacks; richer layout.
  - `app/conference-showcase/page.tsx`: Big Ten + SEC only; links to non-existent `/conference-showcase-2`; heavy visuals; many debug logs.
  - `components/layouts/ConferenceShowcase.tsx`: Minimal grid of `ConferenceCard`; no data fetching.

### Draft Pages (4 experiences)
- **Paths**:
  - `app/draft/[leagueId]/page.tsx`
  - `app/draft/[leagueId]/draft-board/page.tsx`
  - `app/draft/[leagueId]/draft-room/page.tsx`
  - `app/draft/mock/page.tsx`
- **Similarities**: Draft UI with filters, timers, pick flow; reuse of components (`DraftBoard`, `DraftOrder`, `DraftTimer`).
- **Differences**:
  - `[leagueId]/page.tsx`: Loads `/api/players/draftable` + Appwrite picks; builds Top 100; uses `types/draft.ts`.
  - `[leagueId]/draft-board/page.tsx`: Loads `/api/players/draftable` + `/api/draft/[leagueId]/status`; computes team needs via `types/player.types.ts`.
  - `[leagueId]/draft-room/page.tsx`: Uses `ProjectionsService.searchPlayers()` (Appwrite `PLAYER_PROJECTIONS`), realtime subscribe; `types/projections.ts`.
  - `mock/page.tsx`: Simulates draft using `/api/draft/players`; runs own draft state/order.

### Games UI (2 approaches)
- **Paths**:
  - Old: `components/GamesList.tsx` using `lib/api.ts`
  - New: `components/features/games/GamesGrid.tsx`, `components/features/games/GameCard.tsx`, `lib/hooks/useGames.ts`, `lib/api/games.ts`, `lib/api/client.ts`
- **Similarities**: Grid/list of games; eligibility highlighting; loading/error states.
- **Differences**:
  - Old stack: ad-hoc API wrapper `lib/api.ts` and inline types; manual date formatting.
  - New stack: typed `APIClient`, modular `gamesAPI`, shared `types/game.ts`, reusable UI components.

### Hero Section (duplicated)
- **Paths**:
  - `components/HeroSection.tsx`
  - `components/layouts/HeroSection.tsx`
- **Similarities**: Identical JSX/styling.
- **Differences**: Only the file location differs.

### League Overview vs League Portal
- **Paths**:
  - `app/league/[leagueId]/page.tsx`
  - `components/LeaguePortal.tsx`
- **Similarities**: Multi-tab dashboard; conference/players displays; quick stats/standings widgets.
- **Differences**:
  - League page fetches via Appwrite SDK (`databases.*`) with live collections.
  - LeaguePortal fetches through `/api/leagues/[leagueId]` and conference endpoints; includes mock teams and more marketing-style overview.

## API Routes

### Draftable Players Endpoint (consolidated)
- **Paths**:
  - `app/api/draft/players/route.ts` (canonical)
- **Status**: Legacy `app/api/players/draftable/route.ts` removed. All UIs should call `/api/draft/players`.

### Conference Endpoints (4 similar) ✅ Consolidated
- **Paths**:
  - `app/api/bigten/route.ts`
  - `app/api/sec/route.ts`
  - `app/api/acc/route.ts`
  - `app/api/big12/route.ts`
- **Similarities**: `GET` with `type=teams|players|games|stats|draft-board`.
- **Status**: Unified showcase uses a single page; Big 12 route updated to correct membership (Texas removed) and consistent fallbacks.

### Leagues Endpoints (mixed patterns)
- **Paths**:
  - Cookie+REST: `app/api/leagues/create/route.ts`, `app/api/leagues/my-leagues/route.ts`
  - SDK: `app/api/leagues/search/route.ts`
- **Similarities**: Create/search/list user leagues; pagination/filters.
- **Differences**:
  - Cookie+REST uses direct Appwrite REST with `fetch` and session cookie.
  - SDK route uses `node-appwrite` with `APPWRITE_CONFIG`. Response field names vary (`mode/conf` vs `gameMode/selectedConference`).

### Auth Endpoints (mixed patterns) ⏳ In progress
- **Paths**:
  - Email/password: `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/user/route.ts`, `app/api/auth/update-profile/route.ts`
  - OAuth: `app/api/auth/oauth/*`
  - Legacy browser helper: `js/appwrite-browser.js` (references `/api/auth/proxy` which is not present)
- **Similarities**: Normalize Appwrite auth behind Next routes; manage `appwrite-session` cookie.
- **Differences**:
  - Mix of direct REST calls with cookie plumbing vs SDK elsewhere; missing `/api/auth/proxy` referenced by the browser script.

### Projections (consolidated)
- **Paths**:
  - Endpoint: `app/api/projections/route.ts`
  - Service: `lib/services/projections.service.ts` (canonical)
- **Status**: `lib/services/cfb-projections.service.ts` deleted. All projection logic consolidated, with model inputs (depth, pace, pass/rush, ratings, ADP).

## Services and Config

### Appwrite Client/Config Duplication
- **Paths**:
  - Configs: `lib/appwrite-config.ts`, `lib/config/appwrite.config.ts`, `appwrite.config.json`, `scripts/sync-appwrite-config.js`
  - Clients: `lib/appwrite.ts`, `lib/appwrite-server.ts`, `lib/appwrite-client-fix.ts`, `js/appwrite-browser.js`
- **Similarities**: Initialize Appwrite clients; export databases/collections.
- **Differences**:
  - Multiple sources of truth for endpoint/project/database/collections; some hardcoded (client-fix) vs env-driven; different `COLLECTIONS` maps and `REALTIME_CHANNELS` duplicated.
  - `appwrite.config.json` is a configuration file that might conflict with TypeScript configs
  - `scripts/sync-appwrite-config.js` is another config sync utility

### Projection Services (2)
- **Paths**:
  - `lib/services/projections.service.ts` (Appwrite `PLAYER_PROJECTIONS`)
  - `lib/services/cfb-projections.service.ts` (CFBD/ESPN aggregation + mock)
- **Similarities**: Return lists, top players, and helpers.
- **Differences**: Data sources and return shapes; one is stored data, one is computed.

### HTTP API Clients (2)
- **Paths**:
  - New: `lib/api/client.ts` (+ resource modules like `lib/api/games.ts`)
  - Old: `lib/api.ts`
- **Similarities**: Wrap HTTP requests to app backend.
- **Differences**: New client has typed errors, timeouts, and modular resource APIs; old client embeds types and endpoints inline.

## Types and Models

### Game Type Duplicated
- **Paths**:
  - Shared: `types/game.ts`
  - Local duplicate: `app/league/[leagueId]/page.tsx` (redeclares the same interface)
- **Impact**: Risk of drift if fields change; prefer importing shared type.

### Player Types Fragmented
- **Paths**:
  - Fantasy player model: `types/player.types.ts`
  - Draft UI model: `types/draft.ts` (includes a different `Player` interface)
  - Projection model: `types/projections.ts`
- **Impact**: Multiple overlapping `Player` shapes (`pos` vs `position`, `team` vs `school` fields) complicate reuse across endpoints/UIs.

## Scoring Logic
- **Paths**:
  - Inline calc: `app/api/cron/weekly-scoring/route.ts` (local `calculateFantasyPoints`)
  - Modular TS: `live-scoring-mechanics/scoring-system/ppr-scoring.ts` (`ScoringCalculator` with settings/bonuses)
  - Python: `scoring.py`, `scoring_example.py`
- **Impact**: Multiple sources of scoring truth across languages; risk of inconsistency.

## Service Worker
- **Paths**:
  - Script: `public/service-worker.js`
  - Inline registration: `app/layout.tsx`
  - Manager: `lib/service-worker.js`
- **Similarities**: Register `/service-worker.js`, handle updates/offline notifications.
- **Differences**: Two separate registration paths (inline vs manager). Manager posts messages (`CACHE_ROSTER_DATA`, `CLEAR_CACHE`) that the SW script does not handle, causing contract mismatch potential.

## Miscellaneous
- **Non-existent route referenced**:
  - `/conference-showcase-2` is linked from `app/page.tsx`, `app/conference-showcase/page.tsx`, and listed in `app/api/mcp/route.ts`, but no page exists at `app/conference-showcase-2/page.tsx`.
- **Test/Debug Pages**:
  - `app/test-cors/page.tsx`: CORS testing utility page (should be removed in production)
  - `test-account-settings.js`: Test script for account settings (should be in tests folder or removed)
- **Account Settings**:
  - `app/account/settings/page.tsx`: User profile settings page with First Name, Last Name, Email fields
  - API: `app/api/auth/update-profile/route.ts` handles profile updates
- **League Components**:
  - `components/league/LeagueOverview.tsx`: League overview component (uses FiClipboard, FiTrendingUp, FiCalendar from react-icons)
  - `components/league/LeagueSettings.tsx`: League settings component
  - These components are used by `app/league/[leagueId]/page.tsx` but may overlap with `components/LeaguePortal.tsx`

## Highest-Impact Hotspots
- **Draft data and UIs**: Consolidate on one API shape and primary draft experience; deprecate others.
- **Appwrite client/config**: Reduce to one frontend client + one server client and a single `COLLECTIONS` map.
- **Projections**: Unify service usage and data shapes across UI and endpoint.
- **Games API client**: Keep `lib/api/client.ts` + resource modules; retire `lib/api.ts` usages.
- **Service worker**: Pick one registration approach and align message contract.
- **Types**: Import shared `types/game.ts` everywhere; standardize `Player` shape or add converters.
- **Conference endpoints**: Normalize responses (`{ data }` or `{ teams/players/games }`) consistently across all four.

## Additional Findings Not in Original Audit

### Missing from Original Audit
1. **Configuration Files**:
   - `appwrite.config.json` - JSON config file (potential conflict with TS configs)
   - `scripts/sync-appwrite-config.js` - Config sync utility script
   
2. **Test/Debug Pages**:
   - `app/test-cors/page.tsx` - CORS testing utility (should be removed for production)
   - `test-account-settings.js` - Account settings test script (should be in tests folder)

3. **League Components Detail**:
   - `components/league/LeagueOverview.tsx` - Uses react-icons/fi
   - `components/league/LeagueSettings.tsx` - League configuration component
   - Potential overlap with `components/LeaguePortal.tsx` functionality

4. **Account Management**:
   - `app/account/settings/page.tsx` - Full user profile management page
   - Recently updated with First Name, Last Name, Email fields

5. **Broken Links**:
   - `/conference-showcase-2` referenced in multiple places but page doesn't exist
   - Referenced in: `app/page.tsx`, `app/conference-showcase/page.tsx`, `app/api/mcp/route.ts`

## Quick Map by File Path
- Pages/UI duplicates:
  - Conferences: `components/ConferenceShowcase.tsx`, `app/conference-showcase/page.tsx`, `components/layouts/ConferenceShowcase.tsx`
  - Draft: `app/draft/[leagueId]/page.tsx`, `app/draft/[leagueId]/draft-board/page.tsx`, `app/draft/[leagueId]/draft-room/page.tsx`, `app/draft/mock/page.tsx`
  - Games: `components/GamesList.tsx` vs `components/features/games/GamesGrid.tsx`, `components/features/games/GameCard.tsx`, `lib/hooks/useGames.ts`, `lib/api/games.ts`
  - Hero: `components/HeroSection.tsx`, `components/layouts/HeroSection.tsx`
  - League: `app/league/[leagueId]/page.tsx` vs `components/LeaguePortal.tsx`
- API duplicates:
  - Draftable players: `app/api/players/draftable/route.ts`, `app/api/draft/players/route.ts`
  - Conferences: `app/api/{bigten,sec,acc,big12}/route.ts`
  - Leagues: `app/api/leagues/{create,my-leagues,search}/route.ts`
  - Auth: `app/api/auth/*` (+ `js/appwrite-browser.js` legacy proxy reference)
  - Projections: `app/api/projections/route.ts` vs services
- Services/config duplicates:
  - Appwrite: `lib/appwrite-config.ts`, `lib/config/appwrite.config.ts`, `lib/appwrite.ts`, `lib/appwrite-server.ts`, `lib/appwrite-client-fix.ts`, `js/appwrite-browser.js`
  - Projections: `lib/services/{projections.service.ts,cfb-projections.service.ts}`
  - API client: `lib/api/client.ts` (+ `lib/api/games.ts`) vs `lib/api.ts`
- Types/models duplicates:
  - Game: `types/game.ts` vs local in `app/league/[leagueId]/page.tsx`
  - Player: `types/{player.types.ts,draft.ts,projections.ts}`
- Scoring duplicates:
  - `app/api/cron/weekly-scoring/route.ts`, `live-scoring-mechanics/scoring-system/ppr-scoring.ts`, Python `scoring.py`
- Service worker duplicates:
  - `public/service-worker.js`, `app/layout.tsx`, `lib/service-worker.js`


