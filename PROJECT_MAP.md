# College Football Fantasy - Project Map

**Single Source of Truth**: `schema/zod-schema.ts`  
**Canonical Configs**: `lib/appwrite.ts` + `lib/appwrite-server.ts`  
**Status**: ✅ Fully Consolidated Architecture (August 2025)

---

## 📁 Repository Structure

```mermaid
graph TD
    ROOT[🏠 college-football-fantasy-app]
    
    %% Core Application
    ROOT --> APP[📱 app/<br/>Next.js 15 App Router<br/>Pages & API Routes]
    ROOT --> COMPONENTS[🧩 components/<br/>React Components<br/>UI Library]
    ROOT --> SCHEMA[📋 schema/<br/>🎯 SINGLE SOURCE OF TRUTH<br/>zod-schema.ts]
    
    %% Configuration & Services  
    ROOT --> LIB[⚙️ lib/<br/>Appwrite Clients<br/>Services & Utils]
    ROOT --> CORE[🔧 core/<br/>Config, Auth<br/>Domain Logic]
    ROOT --> HOOKS[🪝 hooks/<br/>React Hooks<br/>Realtime Logic]
    ROOT --> TYPES[📝 types/<br/>TypeScript Types<br/>Shared Interfaces]
    
    %% Data & Scripts
    ROOT --> SCRIPTS[📜 scripts/<br/>Migrations, Sync<br/>Validation Guards]
    ROOT --> DATA[💾 data/<br/>Static Data<br/>CSV/JSON Sources]
    ROOT --> FUNCTIONS[⚡ functions/<br/>Appwrite Functions<br/>Serverless Code]
    
    %% Documentation & Deployment
    ROOT --> DOCS[📚 docs/<br/>Documentation<br/>Project Memory]
    ROOT --> VENDOR[📦 vendor/<br/>Submodules<br/>3D Assets]
    
    %% Key Files Detail
    SCHEMA --> SSOT[🎯 zod-schema.ts<br/>Collections, Types<br/>Validation Rules]
    LIB --> FRONTEND[🌐 appwrite.ts<br/>Frontend Client<br/>Session Auth]
    LIB --> BACKEND[🔧 appwrite-server.ts<br/>Server Client<br/>API Key Auth]
    SCRIPTS --> GUARDS[🛡️ guards/<br/>Build Validation<br/>Schema Drift Prevention]
    
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
graph TB
    %% External Data Sources
    subgraph "🌐 External APIs"
        CFBD[🏈 College Football<br/>Data API<br/>Players, Games, Rankings]
        ESPN[📺 ESPN API<br/>Live Scores<br/>Game Updates]
    end
    
    %% Single Source of Truth
    subgraph "🎯 Schema SSOT"
        SSOT_SCHEMA[📋 schema/zod-schema.ts<br/>🔥 SINGLE SOURCE OF TRUTH<br/>Collections, Types, Validation]
        COLLECTIONS[📚 COLLECTIONS Registry<br/>user_teams, leagues<br/>college_players, games]
        TYPES[🔧 TypeScript Types<br/>Auto-generated<br/>from Zod schemas]
        VALIDATION[✅ Validation Functions<br/>validateData()<br/>Runtime checks]
    end
    
    %% Database Layer
    subgraph "🗄️ Appwrite Database (NYC)"
        subgraph "Core Collections"
            PLAYERS[(👥 college_players<br/>Name, Position, Team<br/>Fantasy Points)]
            TEAMS[(🏫 teams<br/>School, Conference<br/>Colors, Logos)]
            GAMES[(🎯 games<br/>Scores, Eligibility<br/>Week, Status)]
            RANKINGS[(🏆 rankings<br/>AP Top 25<br/>Weekly)]
        end
        
        subgraph "Fantasy Collections"  
            LEAGUES[(🏟️ leagues<br/>Commissioner<br/>Settings, Status)]
            USER_TEAMS[(👥 user_teams<br/>Team Rosters<br/>Wins, Points)]
            LINEUPS[(📋 lineups<br/>Starting Players<br/>Weekly Sets)]
        end
        
        subgraph "Draft System"
            MOCK_DRAFTS[(🎯 mock_drafts<br/>Live Human Draft<br/>2-24 Teams)]
            MOCK_PICKS[(✅ mock_draft_picks<br/>Draft Selections<br/>Snake Algorithm)]
            DRAFT_PICKS[(📋 draft_picks<br/>League Drafts<br/>Real-time)]
        end
    end
    
    %% Application Layer
    subgraph "⚡ Next.js API Routes"
        API_PLAYERS[👥 /api/draft/players<br/>Cached Player Lists<br/>Fantasy Projections]
        API_LEAGUES[🏟️ /api/leagues/*<br/>Create, Join, Manage<br/>Commissioner Tools]
        API_MOCK[🎯 /api/mock-draft/*<br/>Live Human Draft<br/>Turn Management]
        API_DRAFT[📋 /api/draft/*<br/>Real Draft System<br/>Pick Management]
    end
    
    %% Frontend Layer
    subgraph "💻 Frontend Pages"
        MOCK_DRAFT_UI[🎯 /mock-draft/[id]<br/>Live Draft Room<br/>Real-time Picks]
        DRAFT_UI[📋 /draft/[leagueId]<br/>League Draft<br/>Timer & Autopick]
        LEAGUE_UI[🏟️ /league/*<br/>Management Pages<br/>Commissioner Tools]
        RESULTS_UI[📊 Results & Export<br/>JSON/CSV Download<br/>Team Summaries]
    end
    
    %% Realtime System
    subgraph "🔌 Real-time Updates"
        REALTIME[⚡ Appwrite Realtime<br/>Live Subscriptions<br/>Event Broadcasting]
        WEBSOCKETS[🔗 WebSocket Channels<br/>Draft Picks, League Updates<br/>Turn Changes]
    end
    
    %% Data Flow Connections
    
    %% External → SSOT → Database
    CFBD -->|Daily Sync| SSOT_SCHEMA
    ESPN -->|Live Updates| SSOT_SCHEMA
    SSOT_SCHEMA --> COLLECTIONS
    SSOT_SCHEMA --> TYPES
    SSOT_SCHEMA --> VALIDATION
    
    %% SSOT → Database Schema
    COLLECTIONS --> PLAYERS
    COLLECTIONS --> TEAMS
    COLLECTIONS --> GAMES
    COLLECTIONS --> LEAGUES
    COLLECTIONS --> USER_TEAMS
    COLLECTIONS --> MOCK_DRAFTS
    
    %% Database → API Routes
    PLAYERS --> API_PLAYERS
    LEAGUES --> API_LEAGUES
    MOCK_DRAFTS --> API_MOCK
    DRAFT_PICKS --> API_DRAFT
    
    %% API → Frontend
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

---

## 🔧 Commissioner Settings Schema Fix Flow

```mermaid
sequenceDiagram
    participant UI as Commissioner UI
    participant API as API Route
    participant DB as Appwrite Database
    participant SW as Service Worker
    
    Note over UI,DB: August 18, 2025 - Schema Fix Implementation
    
    UI->>API: PUT /api/leagues/[id]/commissioner
    Note over UI,API: Frontend sends camelCase:<br/>maxTeams, pickTimeSeconds
    
    API->>API: Field Mapping
    Note over API: OLD: snake_case (max_teams)<br/>NEW: camelCase (maxTeams)
    
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
    Note over API: Ensures camelCase fields<br/>in response object
    API-->>UI: ✅ Formatted league data
    
    Note over UI,DB: Result: Commissioner page loads<br/>and settings save successfully
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
- **Guards**: `scripts/guards/forbid-legacy-collections.ts`
- **Trigger**: `npm run prebuild` (automatic)
- **Purpose**: Prevent hardcoded collection names, enforce SSOT usage

### Real-time Architecture
- **Technology**: Appwrite Realtime + WebSockets
- **Features**: Live draft picks, turn management, league updates
- **Latency**: <100ms for draft updates

---

## 🚀 Common Operations

| Operation | Entry Point | Data Flow |
|-----------|-------------|-----------|
| **Create League** | `app/api/leagues/create` | `leagues` + `user_teams` collections |
| **Join League** | `app/api/leagues/join` | Update `leagues`, create `user_teams` |
| **Start Mock Draft** | `app/api/mock-draft/start` | Create `mock_drafts` + `mock_draft_participants` |
| **Make Draft Pick** | `app/api/mock-draft/pick` | Create `mock_draft_picks`, real-time broadcast |
| **Get Players** | `app/api/draft/players` | Query `college_players`, apply fantasy projections |
| **Validate Schema** | `scripts/validate-ssot-schema.ts` | Compare SSOT ↔ Appwrite database |

---

## 🛡️ Quality Assurance

### Schema Validation
```bash
# Validate SSOT ↔ Database alignment
npx tsx scripts/validate-ssot-schema.ts

# Sync SSOT to Appwrite  
npx tsx scripts/sync-appwrite-simple.ts
```

---

## 🔍 Feature → Routes → Collections → Required Fields

| Feature | Routes/Pages | Collections | Key Required Fields (from SSOT) |
|---|---|---|---|
| Create League | `POST /api/leagues/create`, `app/league/create` | `leagues`, `user_teams`, `users` | leagues: `name`, `commissioner`, `season`, `maxTeams`, `draftType`, `gameMode` |
| Join League | `POST /api/leagues/join`, `app/league/join` | `leagues`, `user_teams`, `users`, `activity_log` | user_teams: `leagueId`, `userId`, `teamName` |
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

## 📋 Status: ✅ Production Ready

**Architecture**: Fully consolidated, zero fragmentation  
**Schema**: Single Source of Truth established ✅ **[Updated: Aug 18, 2025]**  
**Validation**: Build guards + runtime checks active  
**Performance**: <100ms real-time updates  
**Scalability**: 2-24 team drafts supported  
**Commissioner Tools**: Schema alignment completed ✅ **[Fixed: Aug 18, 2025]**

**Ready for**: Advanced features, production deployment, team collaboration

---

## 🔧 Recent Schema Fixes (August 18, 2025)

### Commissioner Settings Schema Alignment ✅
- **Issue**: Field name mismatch between API and database (snake_case vs camelCase)
- **Solution**: Updated all commissioner endpoints to use consistent camelCase field mapping
- **Files Fixed**: `commissioner/route.ts` (GET/PUT), `join/route.ts`, `search/route.ts`, `create/page.tsx`
- **Cache Update**: Service worker version bumped to force refresh
- **Result**: Commissioner settings now save successfully in production

### Single Source of Truth Reinforcement
- **Enhanced**: `docs/DATA_FLOW_ALIGNMENT.md` with schema fix documentation
- **Memory Updated**: Knowledge graph entities tracking the schema alignment
- **Deployment**: https://college-football-fantasy-2vx7nulqz-kmp34s-projects.vercel.app ✅