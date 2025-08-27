# College Football Fantasy - Project Map

**Single Source of Truth**: `schema/zod-schema.ts`  
**Canonical Configs**: `lib/appwrite.ts` + `lib/appwrite-server.ts`  
**Status**: ✅ Fully Consolidated Architecture (August 2025)
**Latest**: 🔐 OAuth Authentication + 📊 Enhanced Talent Projections + 🚪 Desktop Logout

---

## 📁 Repository Structure

```mermaid
%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
graph TD
    ROOT[college-football-fantasy-app]
    
    %% Core Application
    ROOT --> APP[app/<br/>Next.js 15 App Router<br/>Pages and API Routes]
    APP --> SEG_DASH[app/(dashboard)]
    APP --> SEG_LEAGUE[app/(league)]
    APP --> DRAFT[app/draft]
    APP --> MOCKDRAFT[app/mock-draft]
    APP --> SCOREBOARD[app/scoreboard]
    APP --> STANDINGS[app/standings]
    APP --> ADMIN[app/admin]
    APP --> API_ROOT[app/api]
    API_ROOT --> API_FE[app/api/(frontend)]
    API_ROOT --> API_BE[app/api/(backend)]
    API_ROOT --> API_EXT[app/api/(external)]

    %% App Route Groups and Key Pages (groups do not affect URLs)
    SEG_DASH --> DASH_DIR[app/(dashboard)/dashboard]
    SEG_DASH --> LEAGUE_DIR[app/(dashboard)/league]
    SEG_DASH --> ACCT_DIR[app/(dashboard)/account-settings]

    LEAGUE_DIR --> L_CREATE[create]
    LEAGUE_DIR --> L_JOIN[join]
    LEAGUE_DIR --> L_ID[...[leagueId]]
    L_ID --> L_LOCKER[locker-room]
    L_ID --> L_COMM[commissioner]
    L_ID --> L_SCHED[schedule]
    L_ID --> L_SCORE[scoreboard]
    L_ID --> L_STAND[standings]

    SEG_LEAGUE --> MKT_LAUNCH[app/(league)/launch]
    SEG_LEAGUE --> MKT_LOGIN[app/(league)/login]
    SEG_LEAGUE --> MKT_INVITE[app/(league)/invite/[leagueId]]
    SEG_LEAGUE --> MKT_SHOWCASE[app/(league)/projection-showcase]
    SEG_LEAGUE --> MKT_VIDEOS[app/(league)/videos]
    SEG_LEAGUE --> MKT_SIGNUP[app/(league)/signup]
    SEG_LEAGUE --> MKT_OFFLINE[app/(league)/offline]

    DRAFT --> DRAFT_LEAGUE[...[leagueId]]
    MOCKDRAFT --> MD_ID[...[draftId]]
    MD_ID --> MD_RESULTS[results]

    %% API groups (URLs unchanged)
    API_FE --> FE_AUTH[auth/*]
    API_FE --> FE_LEAGUES[leagues/*]
    API_FE --> FE_DRAFT[draft/*]
    API_FE --> FE_DRAFTS[drafts/*]
    API_FE --> FE_PLAYERS[players/*]
    API_FE --> FE_GAMES[games/*]
    API_FE --> FE_RANKINGS[rankings/*]
    API_FE --> FE_ROSTERS[rosters]
    API_FE --> FE_SCHEDULE[schedule]
    API_FE --> FE_SEARCH[search]
    API_FE --> FE_USERS[users/*]
    API_BE --> BE_ADMIN[admin/*]
    API_BE --> BE_CRON[cron/*]
    API_BE --> BE_WEBHOOKS[webhooks/*]
    API_BE --> BE_MIGRATIONS[migrations/*]
    API_BE --> BE_MONITORING[monitoring/*]
    API_BE --> BE_SYNC[sync]
    API_EXT --> EXT_CLAUDE[claude]
    API_EXT --> EXT_MESHY[meshy/*]
    API_EXT --> EXT_RUNWAY[runway/*]
    API_EXT --> EXT_BLENDER[blender/*]
    API_EXT --> EXT_CFBD[cfbd/*]
    ROOT --> COMPONENTS[components/<br/>Reusable UI Library]
    ROOT --> SCHEMA[schema/<br/>SINGLE SOURCE OF TRUTH<br/>zod-schema.ts]
    
    %% Configuration and Services  
    ROOT --> LIB[lib/<br/>Clients, Repos, Domain, Utils]
    
    %% Data and Scripts
    ROOT --> SCRIPTS[ops/common/scripts/<br/>Prompts, Codemods<br/>Dev-time Scripts]
    ROOT --> FUNCTIONS[functions/<br/>Appwrite Functions<br/>Workers & Cron]
    FUNCTIONS --> FX_APPWRITE[functions/appwrite/*]
    FUNCTIONS --> FX_WORKERS[functions/workers/*]
    FUNCTIONS --> FX_CRON[functions/cron/*]
    ROOT --> FUTURE[future/<br/>ideas, scoring, trading,<br/>waiver, auctions]
    
    %% Documentation and Deployment
    ROOT --> DOCS[docs/<br/>Project Map + Diagrams<br/>Consolidated]
    ROOT --> DATA[data/<br/>Datasets & Processed Inputs]
    ROOT --> VENDOR[vendor/<br/>Submodules<br/>3D Assets]
    ROOT --> OPSCFG[ops/config/<br/>Configs (jest, sentry)]
    ROOT --> OPSC[ops/cursor/<br/>Dev tooling<br/>screenshots]
    
    %% Key Files Detail
    SCHEMA --> SSOT[zod-schema.ts<br/>Collections, Types<br/>Validation Rules]
    LIB --> FRONTEND[appwrite.ts<br/>Frontend Client<br/>Session Auth]
    LIB --> BACKEND[appwrite-server.ts<br/>Server Client<br/>API Key Auth]
    SCRIPTS --> GUARDS[guards/<br/>SSOT Guards (Dev-time)<br/>Schema Drift Prevention]
    
    %% Styling
    style SCHEMA fill:#fff2cc,stroke:#d6b656,stroke-width:4px,color:#000000
    style SSOT fill:#fff2cc,stroke:#d6b656,stroke-width:4px,color:#000000
    style GUARDS fill:#f8cecc,stroke:#b85450,stroke-width:3px,color:#000000
    style FRONTEND fill:#d5e8d4,stroke:#82b366,stroke-width:3px,color:#000000
    style BACKEND fill:#d5e8d4,stroke:#82b366,stroke-width:3px,color:#000000
```

---

## 🔄 Functionality & Data Flow

```mermaid
%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
graph TB
    %% External Data Sources
    subgraph ExtAPIs[External APIs]
        CFBD[College Football<br/>Data API<br/>Players, Games, Rankings]
        ESPN[ESPN API<br/>Live Scores<br/>Game Updates]
        OAUTH[OAuth Providers<br/>Google, Apple<br/>Environment-Controlled]
        ROTOWIRE[Rotowire API<br/>Injury Reports<br/>Depth Charts]
    end
    
    %% Talent Data Sources  
    subgraph TalentIntel[Talent Intelligence]
        EA_DATA[EA Sports Ratings<br/>Overall, Speed, Acceleration<br/>data/player/ea/ratings_2025.csv]
        MOCK_DATA[Mock Draft Data<br/>NFL Draft Projections<br/>data/market/mockdraft/2025.csv]
        DEPTH_DATA[Depth Charts<br/>Position Rankings<br/>data/player/processed/depth/]
        ESPN_PLUS[ESPN+ Analysis<br/>Expert Sentiment<br/>kpm34@pitt.edu Auth]
    end
    
    %% Single Source of Truth
    subgraph SchemaSSOT[Schema SSOT]
        SSOT_SCHEMA[schema/zod-schema.ts<br/>SINGLE SOURCE OF TRUTH<br/>Collections, Types, Validation]
        COLLECTIONS[COLLECTIONS Registry<br/>user_teams, leagues<br/>college_players, games]
        TYPES[TypeScript Types<br/>Auto-generated<br/>from Zod schemas]
        VALIDATION[Validation Functions<br/>validateData function<br/>Runtime checks]
    end
    
    %% Database Layer
    subgraph AppwriteDB[Appwrite Database NYC]
        subgraph CoreColls[Core Collections]
            PLAYERS[(college_players<br/>Name, Position, Team<br/>Fantasy Points)]
            TEAMS[(teams<br/>School, Conference<br/>Colors, Logos)]
            GAMES[(games<br/>Scores, Eligibility<br/>Week, Status)]
            RANKINGS[(rankings<br/>AP Top 25<br/>Weekly)]
        end
        
        subgraph FantasyColls[Fantasy Collections]
            LEAGUES[(leagues<br/>11 required fields<br/>DRAFT ROOM trigger)]
            USER_TEAMS[(user_teams<br/>Team Management<br/>Scoring & Stats)]
            LINEUPS[(lineups<br/>Weekly Lineups<br/>Roster Sets)]
        end
        
        subgraph DraftSys[Draft System - Live Schema]
            MOCK_DRAFTS[(mock_drafts<br/>draftName, numTeams<br/>snake, status enum)]
            MOCK_PICKS[(mock_draft_picks<br/>Snake Algorithm<br/>Real-time Updates)]
            DRAFT_PICKS[(draft_picks<br/>League Drafts<br/>Timer-based)]
        end
    end
    
    %% Application Layer
    subgraph APIRoutes[Next.js API Routes]
        API_PLAYERS[Players API]
        API_LEAGUES[Leagues API]
        API_MOCK[Mock Draft API]
        API_DRAFT[Drafts API]
    end
    
    %% Frontend Layer
    subgraph FrontendPages[Frontend Pages]
        MOCK_DRAFT_UI[Mock Draft Room]
        DRAFT_UI[League Draft Room]
        LEAGUE_UI[League Management]
        RESULTS_UI[Results and Export]
    end
    
    %% Realtime System
    subgraph RealtimeUpdates[Real-time Updates]
        REALTIME[Appwrite Realtime<br/>Live Subscriptions<br/>Event Broadcasting]
        WEBSOCKETS[WebSocket Channels<br/>Draft Picks, League Updates<br/>Turn Changes]
    end
    
    %% Data Flow Connections
    
    %% External to SSOT to Database
    CFBD -->|Daily Sync| SSOT_SCHEMA
    ESPN -->|Live Updates| SSOT_SCHEMA
    SSOT_SCHEMA --> COLLECTIONS
    SSOT_SCHEMA --> TYPES
    SSOT_SCHEMA --> VALIDATION
    
    %% SSOT to Database Schema
    COLLECTIONS --> PLAYERS
    COLLECTIONS --> TEAMS
    COLLECTIONS --> GAMES
    COLLECTIONS --> LEAGUES
    COLLECTIONS --> USER_TEAMS
    COLLECTIONS --> MOCK_DRAFTS
    
    %% Database to API Routes
    PLAYERS --> API_PLAYERS
    LEAGUES --> API_LEAGUES
    MOCK_DRAFTS --> API_MOCK
    DRAFT_PICKS --> API_DRAFT
    
    %% API to Frontend
    API_PLAYERS --> DRAFT_UI
    API_LEAGUES --> LEAGUE_UI
    API_MOCK --> MOCK_DRAFT_UI
    API_DRAFT --> RESULTS_UI
    
    %% Real-time Updates
    MOCK_PICKS -.->|Live Updates| REALTIME
    DRAFT_PICKS -.->|Live Updates| REALTIME
    USER_TEAMS -.->|Live Updates| REALTIME
    REALTIME --> WEBSOCKETS
    WEBSOCKETS -.-> MOCK_DRAFT_UI
    WEBSOCKETS -.-> DRAFT_UI
    WEBSOCKETS -.-> LEAGUE_UI
    
    %% Validation Guards
    VALIDATION -.->|Runtime Checks| API_PLAYERS
    VALIDATION -.->|Runtime Checks| API_LEAGUES
    VALIDATION -.->|Runtime Checks| API_MOCK
    
    %% Styling
    style SSOT_SCHEMA fill:#fff2cc,stroke:#d6b656,stroke-width:4px,color:#000000
    style COLLECTIONS fill:#fff2cc,stroke:#d6b656,stroke-width:3px,color:#000000
    style TYPES fill:#fff2cc,stroke:#d6b656,stroke-width:3px,color:#000000
    style VALIDATION fill:#f8cecc,stroke:#b85450,stroke-width:3px,color:#000000
    style REALTIME fill:#e1d5e7,stroke:#9673a6,stroke-width:3px,color:#000000
    style WEBSOCKETS fill:#e1d5e7,stroke:#9673a6,stroke-width:3px,color:#000000
```

### App Directory (3-level tree, folders vs files)

```mermaid
flowchart TB

  %% Styles
  classDef folder fill:#2563eb,stroke:#1e40af,color:#ffffff;
  classDef file fill:#059669,stroke:#047857,color:#ffffff;

  %% Legend
  legend_folder[Folder]:::folder
  legend_file[File]:::file
  legend_folder --- legend_file

  %% Root
  app["app/"]:::folder

  %% Level 1
  app --> dash["(dashboard)/"]:::folder
  app --> leaguegrp["(league)/"]:::folder
  app --> draft["draft/"]:::folder
  app --> mock["mock-draft/"]:::folder
  app --> scoreboard["scoreboard/page.tsx"]:::file
  app --> standings["standings/page.tsx"]:::file
  app --> admin["admin/page.tsx"]:::file
  app --> api["api/"]:::folder

  %% (dashboard)
  dash --> dashDashboard["dashboard/page.tsx"]:::file
  dash --> account["account-settings/page.tsx"]:::file
  dash --> league["league/"]:::folder

  %% (dashboard)/league
  league --> lcreate["create/page.tsx"]:::file
  league --> ljoin["join/page.tsx"]:::file
  league --> lid["[leagueId]/"]:::folder

  %% (dashboard)/league/[leagueId]
  lid --> lid_page["page.tsx"]:::file
  lid --> lid_comm["commissioner/page.tsx"]:::file
  lid --> lid_locker["locker-room/page.tsx"]:::file
  lid --> lid_sched["schedule/page.tsx"]:::file
  lid --> lid_score["scoreboard/page.tsx"]:::file
  lid --> lid_stand["standings/page.tsx"]:::file

  %% (league)
  leaguegrp --> l_launch["launch/page.tsx"]:::file
  leaguegrp --> l_login["login/page.tsx"]:::file
  leaguegrp --> l_invite["invite/[leagueId] (page.tsx + layout.tsx)"]:::file
  leaguegrp --> l_showcase["projection-showcase/page.tsx"]:::file
  leaguegrp --> l_videos_page["videos/page.tsx"]:::file
  leaguegrp --> l_videos_guide["videos/guide/page.tsx"]:::file
  leaguegrp --> l_videos_program["videos/[program]/page.tsx"]:::file
  leaguegrp --> l_signup["signup/page.tsx"]:::file
  leaguegrp --> l_offline["offline/page.tsx"]:::file
  leaguegrp --> l_rootpage["page.tsx"]:::file

  %% draft & mock-draft
  draft --> dr_league["[leagueId]/page.tsx"]:::file
  mock --> md_draft["[draftId]/page.tsx"]:::file
  mock --> md_results["[draftId]/results/page.tsx"]:::file

  %% api (first level only)
  api --> api_fe["(frontend)/"]:::folder
  api --> api_be["(backend)/"]:::folder
  api --> api_ext["(external)/"]:::folder
  api --> api_lib["_lib/"]:::folder
```

---

### API Query Annotations (Players & Projections)

- GET `/api/draft/players`
  - Filters applied (primary path):
    - `Query.equal('conference', ['SEC','Big Ten','Big 12','ACC'])` when no specific conference provided
    - `Query.equal('position', ['QB','RB','WR','TE','K'])` for top200 mode, or `Query.equal('position', position)` if provided
    - `Query.search('name', search)` when provided
    - Ordering: `Query.orderDesc('fantasy_points')` by default, or `Query.orderAsc('name')` when `orderBy=name`
    - Pagination: `Query.limit(N)`, `Query.offset(0)`
  - Fallback path (reduced filters) if primary query fails due to missing indexes:
    - Always `Query.limit`, `Query.offset`
    - Add basic `Query.equal` filters present in request
    - Always `Query.orderDesc('fantasy_points')`
  - Primary source collection: `college_players` (field: `fantasy_points`)

## 🔧 DRAFT ROOM Button Time Window Flow

```mermaid
%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
sequenceDiagram
    participant UI as League Page
    participant DB as DraftButton Component
    participant Timer as Update Timer
    participant Router as Next Router
    
    Note over UI,Router: August 19, 2025 - DRAFT ROOM Implementation
    
    UI->>DB: Render DraftButton
    Note over UI,DB: Props: league, isCommissioner, isMember
    
    DB->>Timer: Start 60s interval
    Note over Timer: Updates draft status every minute
    
    Timer->>DB: Calculate time windows
    Note over Timer: 1hr before → 3hr after draft
    
    alt Draft Complete (status: active/complete)
        DB-->>UI: Gray badge "Draft Complete"
    else Draft Active (status: drafting)
        DB-->>UI: Green animated "DRAFT ROOM" button
    else Draft Window Open (within 1hr-3hr)
        DB-->>UI: Orange animated "DRAFT ROOM" button
    else Commissioner Access (any time)
        DB-->>UI: Blue "DRAFT ROOM" button
    else Countdown Mode (scheduled, not ready)
        DB-->>UI: Gray badge with countdown
    else No Draft Date
        DB-->>UI: null (button hidden)
    end
    
    UI->>Router: Click "DRAFT ROOM"
    Router-->>UI: Navigate to /draft/[leagueId]
    
    Note over UI,Router: Auto-refresh countdown display<br/>Dynamic button states
```

## 🔧 Commissioner Settings Schema Fix Flow

```mermaid
%%{init: {'themeVariables': {'fontSize': '22px'}}}%%
sequenceDiagram
    participant UI as Commissioner UI
    participant API as API Route
    participant DB as Appwrite Database
    participant SW as Service Worker
    
    Note over UI,DB: August 18, 2025 - Schema Fix Implementation
    
    UI->>API: PUT /api/leagues/[id]/commissioner
    Note over UI,API: Frontend sends camelCase:<br/>maxTeams, pickTimeSeconds
    
    API->>API: Field Mapping & Validation
    Note over API: ✅ Removed: primaryColor, secondaryColor, leagueTrophyName<br/>✅ Immutable: gameMode, selectedConference
    
    API->>DB: updateDocument(leagues)
    Note over DB: Database expects camelCase<br/>maxTeams: 12<br/>pickTimeSeconds: 90
    
    alt Schema Mismatch (Before Fix)
        DB-->>API: ❌ Error: Unknown attribute "max_teams"
        API-->>UI: ❌ Failed to save settings
    else Schema Aligned (After Fix)
        DB-->>API: ✅ Document updated successfully
        API-->>UI: ✅ Settings saved
    end
    
    Note over SW: Service Worker Cache v2<br/>Forces fresh API responses
    
    UI->>API: GET /api/leagues/[id]/commissioner
    API->>API: Format Response
    Note over API: Ensures camelCase fields<br/>Conference mode saves selectedConference
    API-->>UI: ✅ Formatted league data
    
    Note over UI,DB: Result: Commissioner page loads<br/>and all settings save successfully
```

---

## 🎯 Key Architecture Principles

### Single Source of Truth (SSOT)
- **Location**: `schema/zod-schema.ts`
- **Purpose**: Define ALL collections, types, validation
- **Benefits**: Zero schema drift, automatic TypeScript generation, runtime validation

### Centralized Configuration  
- **Frontend**: `lib/appwrite.ts` (session auth)
- **Backend**: `lib/appwrite-server.ts` (API key auth)
- **Result**: No configuration duplication, consistent imports

### Build-time Validation
- **Guards**: `ops/common/scripts/guards/forbid-legacy-collections.ts`
- **Trigger**: `npm run prebuild` (automatic)
- **Purpose**: Prevent hardcoded collection names, enforce SSOT usage

### Real-time Architecture
- **Technology**: Appwrite Realtime + WebSockets
- **Features**: Live draft picks, turn management, league updates
- **Latency**: <100ms for draft updates

---

## 🚀 Common Operations

| Operation | Entry Point | Data Flow | Required Fields |
|-----------|-------------|-----------|-----------------|
| **Create League** | `POST /api/leagues/create` | `leagues` + `user_teams` collections | name, commissioner, season (required); maxTeams, gameMode (immutable), selectedConference (for conference mode) optional |
| **Join League** | `POST /api/leagues/join` | Update `leagues`, create `user_teams` | leagueId, userId, teamName (required); password(if private) |
| **Commissioner Update** | `PATCH /api/leagues/[id]/update-settings` | Update `leagues` collection | draftDate (DRAFT ROOM trigger), pickTimeSeconds (30-600), various optional settings |
| **User Login** | `POST /api/auth/login` | Appwrite Auth → Session Cookie | email, password (11 active users) |
| **User Signup** | `POST /api/auth/signup` | Create user → Auto-login | email, password, name |
| **OAuth Login** | `GET /api/auth/oauth/[provider]` | OAuth flow → Session sync | Environment flags required |
| **Start Mock Draft** | `POST /api/mock-draft/start` | Create `mock_drafts` + participants | draftName, numTeams, rounds, snake, status (required) |
| **Make Draft Pick** | `POST /api/draft/[leagueId]/pick` | Create `draft_picks`, update roster | leagueId, playerId |
| **Get Players** | `GET /api/draft/players` | Query `college_players` + projections | Filters: name (fulltext), position, team, fantasy_points (all indexed) |
| **Weekly Scoring** | `POST /api/cron/weekly-scoring` | Update `player_stats` + `lineups` | Automated cron job |
| **Batch Player Sync** | `scripts/sync-players-batch.ts` | Purge + repopulate `college_players` | Batch processing with 70-player chunks |

---

## 🎮 Complete Admin Operations Flow

```mermaid
graph LR
    subgraph UserMgmt["User Management"]
        LOGIN[Login/Signup] --> AUTH[Auth Service]
        AUTH --> SESSION[Session Cookie]
        SESSION --> USER_PROFILE[User Profile]
    end
    
    subgraph LeagueLife["League Lifecycle"]
        CREATE[Create League] --> SETTINGS[Configure Settings]
        SETTINGS --> INVITE[Invite Players]
        INVITE --> JOIN[Players Join]
        JOIN --> DRAFT_SETUP[Setup Draft]
        DRAFT_SETUP --> DRAFT_LIVE[Live Draft]
        DRAFT_LIVE --> SEASON[Season Active]
        SEASON --> PLAYOFFS[Playoffs]
        PLAYOFFS --> COMPLETE[Season Complete]
    end
    
    subgraph CommTools["Commissioner Tools"]
        COMM_AUTH[Verify Commissioner] --> COMM_SETTINGS[Update Settings]
        COMM_AUTH --> COMM_DRAFT[Control Draft]
        COMM_AUTH --> COMM_SCORING[Adjust Scoring]
        COMM_AUTH --> COMM_TRADES[Approve Trades]
    end
    
    subgraph DataSync["Data Sync Operations"]
        SYNC_PLAYERS[Sync Players] --> DEDUPE[Remove Duplicates]
        SYNC_GAMES[Sync Games] --> RANKINGS_UPDATE[Update Rankings]
        SYNC_STATS[Sync Stats] --> PROJECTIONS[Calculate Projections]
    end
    
    subgraph WeeklyOps["Weekly Operations"]
        LINEUPS[Set Lineups] --> GAMES_PLAY[Games Played]
        GAMES_PLAY --> SCORING_CALC[Calculate Scoring]
        SCORING_CALC --> STANDINGS[Update Standings]
        STANDINGS --> WAIVERS[Process Waivers]
    end
```

---

## 🛡️ Quality Assurance

### Schema Validation
```bash
# Validate SSOT ↔ Database alignment
npx tsx ops/common/scripts/validate-ssot-schema.ts

# Sync SSOT to Appwrite  
// Removed: sync-appwrite-simple.ts (deprecated)
```

---

## 🔍 Feature → Routes → Collections → Required Fields

| Feature | Routes/Pages | Collections | Key Required Fields (from SSOT) |
|---|---|---|---|
| Create League | `POST /api/leagues/create`, `app/league/create` | `leagues`, `user_teams`, Appwrite Auth | leagues: `name`, `commissioner`, `season`, `maxTeams`, `draftType`, `gameMode` |
| Join League | `POST /api/leagues/join`, `app/league/join` | `leagues`, `user_teams`, `activity_log`, Appwrite Auth | user_teams: `leagueId`, `userId`, `teamName` |
| League Settings | `PUT /api/leagues/[id]/commissioner`, `app/league/[id]/commissioner` | `leagues` | ensure camelCase fields; no defaults on required |
| Draft – Make Pick | `POST /api/draft/[leagueId]/pick`, `app/draft/[leagueId]` | `draft_picks`, `user_teams` | draft_picks: `leagueId`, `teamId`, `playerId` |
| Draft – Status | `GET /api/draft/[leagueId]/status` | `draft_picks`, `user_teams`, `leagues` | n/a |
| Mock Draft | `/api/mock-draft/*`, `app/mock-draft/[id]` | `mock_drafts`, `mock_draft_picks`, `mock_draft_participants` | mock_draft_picks: `draftId`, `participantId`, `playerId` |
| Auctions | `/api/auction/*`, `app/auction/[leagueId]` | `auctions`, `bids` | bids: `auctionId`, `playerId`, `bidderId`, `amount` |
| Players & Projections | `/api/draft/players`, `/api/projections` | `college_players`, `projections_yearly`, `projections_weekly`, `model_inputs` | players: `name`, `position`, `team`, `conference` |
| Games & Rankings | `/api/games*`, `/api/rankings*` | `games`, `rankings` | games: `week`, `season`, `season_type`, `home_team`, `away_team`, `start_date` |
| Lineups/Scoring | jobs + `/api/cron/weekly-scoring` | `lineups`, `player_stats`, `user_teams`, `games` | lineups: `rosterId`, `week`, `season` |

Notes:
- Sources of truth for required fields: `schema/zod-schema.ts`.
- For Appwrite constraints, avoid defaults on required attributes; use optional + default-in-code or always provide values.
- If any of the above changes, update this table and the SSOT in the same PR.

### Build Guards
```bash
# Automatic on build (prevents schema drift)
npm run build
```

### Type Safety
- All operations validated against SSOT schemas
- Automatic TypeScript type generation
- Runtime data validation

---

## 📋 Status: ✅ Production Ready & Live

**Architecture**: Fully consolidated, zero fragmentation  
**Schema**: Single Source of Truth established ✅ **[Updated: Aug 18, 2025]**  
**Validation**: Build guards + runtime checks active  
**Performance**: <100ms real-time updates  
**Scalability**: 2-24 team drafts supported  
**Real-time Features**: ✅ Fixed and deployed **[Updated: Aug 18, 2025]**  
**Commissioner Tools**: Schema alignment completed ✅ **[Fixed: Aug 18, 2025]**

**Ready for**: Advanced features, production deployment, team collaboration

---

## 🔧 Recent Updates (August 18, 2025)

### Real-time Features Restored ✅ 
- **Issue**: Appwrite v16+ removed `Realtime` class, breaking draft subscriptions
- **Solution**: Updated to use `client.subscribe()` method directly
- **Files Fixed**: `lib/realtime/draft.ts`, `app/mock-draft/[draftId]/results/page.tsx`
- **Result**: Live draft updates, real-time pick notifications, dynamic status changes working
- **Deployment**: https://cfbfantasy.app ✅

### Commissioner Settings Schema Alignment ✅ [Updated: Aug 19, 2025]
- **Issue**: Field name mismatch between API and database (snake_case vs camelCase)
- **Solution**: Updated all commissioner endpoints to use consistent camelCase field mapping
- **Files Fixed**: `commissioner/route.ts` (GET/PUT), `join/route.ts`, `search/route.ts`, `create/page.tsx`
- **Cache Update**: Service worker version bumped to force refresh
- **Result**: Commissioner settings now save successfully in production
- **Latest Fix**: Removed non-existent attributes (primaryColor, secondaryColor, leagueTrophyName)
- **Immutable Fields**: `gameMode` and `selectedConference` cannot be changed after league creation
- **Conference Mode**: Properly saves `selectedConference` when gameMode is 'conference'

### DRAFT ROOM Button Implementation ✅ [Added: Aug 19, 2025]
- **Component**: `components/league/DraftButton.tsx`
- **Time Window**: Shows 1 hour before draft, stays visible during draft, hides 3 hours after
- **Dynamic States**: Gray (scheduled), Blue (commissioner), Orange (window open), Green (draft active)
- **Auto-Update**: Refreshes countdown every minute
- **Navigation**: Routes to `/draft/[leagueId]` when clicked
- **Access Control**: Only shows for league members, commissioner has special privileges
- **Result**: Automated draft room access based on scheduled draft time

### Codebase Optimization ✅
- **Removed**: 39,000+ files from awwwards-rig vendor directory 
- **Cleaned**: 14+ empty directories and outdated setup files
- **Updated**: SSOT file locations documented in .cursorrules and CLAUDE.md
- **Result**: 28% reduction in total files, cleaner project structure
- **Database Verified**: user_teams collection confirmed working (12 active teams)

### Single Source of Truth Reinforcement
- **Enhanced**: `docs/DATA_FLOW_ALIGNMENT.md` with schema fix documentation
- **Memory Updated**: Knowledge graph entities tracking the schema alignment
- **Main Domain**: https://cfbfantasy.app ✅